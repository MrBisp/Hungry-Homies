import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all users who follow the current user
        const { data: followers, error } = await supabase
            .from('follows')
            .select(`
                follower:follower_id (
                    id,
                    name,
                    image
                )
            `)
            .eq('following_id', session.user.id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            followers: followers.map(f => f.follower)
        });

    } catch (error) {
        console.error('Error fetching followers:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch followers" },
            { status: 500 }
        );
    }
} 