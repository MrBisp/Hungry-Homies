import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: follow, error } = await supabase
            .from('follows')
            .select()
            .eq('follower_id', session.user.id)
            .eq('following_id', params.id)
            .single();

        return NextResponse.json({
            success: true,
            isFollowing: !!follow
        });

    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json(
            { error: error.message || "Failed to check follow status" },
            { status: 500 }
        );
    }
} 