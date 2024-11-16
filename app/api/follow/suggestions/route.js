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

        // Get users you're already following
        const { data: following } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', session.user.id);

        const followingIds = following?.map(f => f.following_id) || [];
        // Add your own ID to exclude from suggestions
        followingIds.push(session.user.id);

        // Get 10 random users that you're not following
        const { data: suggestions, error } = await supabase
            .from('users')
            .select('id, name, image')
            .not('id', 'in', `(${followingIds.join(',')})`)
            .limit(10);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch suggestions" },
            { status: 500 }
        );
    }
} 