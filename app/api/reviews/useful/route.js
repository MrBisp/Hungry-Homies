import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reviewId } = await req.json();

        // Get review details first
        const { data: review } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', reviewId)
            .single();

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Don't allow marking own reviews as useful
        if (review.user_id === session.user.id) {
            return NextResponse.json({ error: 'Cannot mark own review as useful' }, { status: 400 });
        }

        // Insert useful mark
        const { error: markError } = await supabase
            .from('review_useful_marks')
            .insert({
                review_id: reviewId,
                user_id: session.user.id
            });

        if (markError?.code === '23505') { // Unique violation
            // Remove the mark if it already exists
            const { error: deleteError } = await supabase
                .from('review_useful_marks')
                .delete()
                .eq('review_id', reviewId)
                .eq('user_id', session.user.id);

            if (deleteError) throw deleteError;
            return NextResponse.json({ marked: false });
        }

        if (markError) throw markError;

        // Create notification
        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                recipient_id: review.user_id,
                sender_id: session.user.id,
                type: 'REVIEW_USEFUL',
                content: 'Found your review useful',
                link: `/dashboard/profile/reviews/${reviewId}`,
            });

        if (notifError) throw notifError;

        return NextResponse.json({ marked: true });

    } catch (error) {
        console.error('Error marking review as useful:', error);
        return NextResponse.json(
            { error: error.message || "Failed to mark review as useful" },
            { status: 500 }
        );
    }
} 