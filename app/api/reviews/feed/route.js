import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
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
            .order('created_at', { ascending: false });

        if (reviewError) throw reviewError;

        // Format the reviews to ensure user data is properly structured
        const formattedReviews = reviews.map(review => ({
            ...review,
            user: review.users, // Ensure user data is at the top level
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