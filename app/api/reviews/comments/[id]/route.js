import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get comment and review details
        const { data: comment } = await supabase
            .from('review_comments')
            .select('*, reviews!inner(user_id)')
            .eq('id', params.id)
            .single();

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Check if user is authorized to delete (comment owner or review owner)
        if (comment.user_id !== session.user.id && comment.reviews.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('review_comments')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: error.message || "Failed to delete comment" },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();

        // Get comment details
        const { data: comment } = await supabase
            .from('review_comments')
            .select()
            .eq('id', params.id)
            .single();

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Only comment owner can edit
        if (comment.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('review_comments')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json(
            { error: error.message || "Failed to update comment" },
            { status: 500 }
        );
    }
}