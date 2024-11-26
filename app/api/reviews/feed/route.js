import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get list of users the current user follows
        const { data: following } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', session.user.id);

        // Get array of followed user IDs plus the current user's ID
        const allowedUserIds = [
            session.user.id,
            ...(following?.map(f => f.following_id) || [])
        ];

        // Get reviews only from followed users and self
        const { data: reviews, error: reviewError } = await supabase
            .from('reviews')
            .select(`
                *,
                users:user_id (
                    id,
                    name,
                    image
                ),
                review_preferences (
                    preference_id,
                    is_available,
                    preferences (
                        name,
                        description,
                        icon
                    )
                )
            `)
            .in('user_id', allowedUserIds)
            .order('created_at', { ascending: false });

        if (reviewError) throw reviewError;

        const formattedReviews = reviews.map(review => ({
            ...review,
            user: review.users,
            preferences: review.review_preferences
                ?.filter(rp => rp.is_available)
                .map(rp => ({
                    preference_id: rp.preference_id,
                    name: rp.preferences.name,
                    description: rp.preferences.description,
                    icon: rp.preferences.icon
                })) || []
        }));

        return NextResponse.json(formattedReviews);

    } catch (error) {
        console.error('Error in reviews/feed:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch reviews" },
            { status: 500 }
        );
    }
} 