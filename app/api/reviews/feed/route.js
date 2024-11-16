import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { supabase } from "@/libs/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Debug log
        console.log('Feed API - Session:', {
            sessionExists: !!session,
            userId: session?.user?.id,
        });

        if (!session?.user?.id) {
            return new Response(JSON.stringify({
                error: 'Unauthorized - No valid user ID'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get user's friends
        const { data: friendships, error: friendError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', session.user.id)

        if (friendError) {
            console.error('Error fetching friendships:', friendError);
            throw friendError;
        }

        // Get friend IDs including the user's own ID
        const friendIds = [
            session.user.id,
            ...(friendships?.map(f => f.following_id) || [])
        ].filter(Boolean); // Remove any undefined/null values

        console.log('Feed API - Friend IDs:', friendIds);

        // Fetch reviews from user and their friends
        const { data: reviews, error: reviewError } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users(*)
            `)
            .in('user_id', friendIds)
            .order('created_at', { ascending: false });

        if (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            throw reviewError;
        }

        return new Response(JSON.stringify(reviews), {
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