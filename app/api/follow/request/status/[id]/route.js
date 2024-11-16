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

        const { data: request, error } = await supabase
            .from('follow_requests')
            .select()
            .eq('requester_id', session.user.id)
            .eq('recipient_id', params.id)
            .eq('status', 'pending')
            .single();

        return NextResponse.json({
            success: true,
            hasPendingRequest: !!request
        });

    } catch (error) {
        console.error('Error checking request status:', error);
        return NextResponse.json(
            { error: error.message || "Failed to check request status" },
            { status: 500 }
        );
    }
} 