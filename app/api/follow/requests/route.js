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

        // Get pending follow requests for the current user
        const { data: requests, error } = await supabase
            .from('follow_requests')
            .select(`
                *,
                requester:requester_id (
                    id,
                    name,
                    image
                )
            `)
            .eq('recipient_id', session.user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('Error fetching follow requests:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch follow requests" },
            { status: 500 }
        );
    }
} 