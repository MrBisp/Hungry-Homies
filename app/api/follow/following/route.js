export const dynamic = 'force-dynamic';

import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all users that the current user follows
        const { data: following, error } = await supabase
            .from('follows')
            .select(`
                following:following_id (
                    id,
                    name,
                    image
                )
            `)
            .eq('follower_id', session.user.id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            following: following.map(f => f.following)
        });

    } catch (error) {
        console.error('Error fetching following:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch following" },
            { status: 500 }
        );
    }
} 