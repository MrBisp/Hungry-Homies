import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Verify the post belongs to the user
        const { data: post } = await supabase
            .from('feed_posts')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!post || post.user_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the post
        const { error } = await supabase
            .from('feed_posts')
            .delete()
            .eq('id', id)
            .eq('user_id', parseInt(session.user.id));

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: error.message || "Failed to delete post" },
            { status: 500 }
        );
    }
} 