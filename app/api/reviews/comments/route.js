import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/libs/notifications";

// Get comments for a review
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const reviewId = searchParams.get('reviewId');

        const { data: comments, error } = await supabase
            .from('review_comments')
            .select(`
                *,
                users (
                    id,
                    name,
                    image
                )
            `)
            .eq('review_id', reviewId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ comments });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

// Add a new comment
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reviewId, content } = await req.json();

        // Get review details first
        const { data: review } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', reviewId)
            .single();

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Insert comment
        const { data: comment, error } = await supabase
            .from('review_comments')
            .insert({
                review_id: reviewId,
                user_id: session.user.id,
                content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select(`
                *,
                users (
                    id,
                    name,
                    image
                )
            `)
            .single();

        if (error) throw error;

        // Create notification for review owner
        if (review.user_id !== session.user.id) {
            await createNotification({
                recipientId: review.user_id,
                senderId: session.user.id,
                type: 'NEW_COMMENT',
                content: 'Commented on your review',
                link: `/dashboard/profile/reviews/${reviewId}`,
            });
        }

        return NextResponse.json({ comment });

    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { error: error.message || "Failed to add comment" },
            { status: 500 }
        );
    }
}