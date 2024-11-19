import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { supabase } from "@/libs/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Get user's friends
        const { data: friendships, error: friendError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', session.user.id)

        if (friendError) throw friendError;

        const friendIds = [
            session.user.id,
            ...(friendships?.map(f => f.following_id) || [])
        ].filter(Boolean);

        // Updated select to use is_available instead of rating
        const { data: reviews, error: reviewError } = await supabase
            .from('reviews')
            .select(`
                id,
                user_id,
                location_name,
                location_type,
                coordinates,
                primary_emoji,
                review_text,
                images,
                user:users(id, name, image),
                review_preferences (
                    preference_id,
                    is_available,
                    notes,
                    preferences (
                        name,
                        description,
                        icon
                    )
                )
            `)
            .in('user_id', friendIds)
            .order('created_at', { ascending: false })
            .limit(20);

        if (reviewError) throw reviewError;

        // Updated formatting to use is_available
        const formattedReviews = reviews.map(review => ({
            ...review,
            preferences: review.review_preferences?.filter(rp => rp.is_available).map(rp => ({
                preference_id: rp.preference_id,
                name: rp.preferences.name,
                description: rp.preferences.description,
                icon: rp.preferences.icon
            })) || []
        }));

        return new Response(JSON.stringify(formattedReviews), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in reviews/feed:', error);
        return new Response(JSON.stringify({
            error: error.message,
            details: error
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
} 