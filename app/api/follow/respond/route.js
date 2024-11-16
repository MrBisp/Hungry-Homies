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

        const { requestId, accept } = await req.json();

        // Start a transaction
        const { data: request, error: fetchError } = await supabase
            .from('follow_requests')
            .select()
            .eq('id', requestId)
            .eq('recipient_id', session.user.id)
            .single();

        if (fetchError || !request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (accept) {
            // Create follow relationship
            const { error: followError } = await supabase
                .from('follows')
                .insert({
                    follower_id: request.requester_id,
                    following_id: request.recipient_id,
                });

            if (followError) throw followError;
        }

        // Update request status
        const { error: updateError } = await supabase
            .from('follow_requests')
            .update({
                status: accept ? 'accepted' : 'rejected',
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error responding to follow request:', error);
        return NextResponse.json(
            { error: error.message || "Failed to respond to follow request" },
            { status: 500 }
        );
    }
} 