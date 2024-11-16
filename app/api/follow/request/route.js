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

        const { recipientId } = await req.json();

        // Check if any request exists (regardless of status)
        const { data: existingRequest } = await supabase
            .from('follow_requests')
            .select()
            .eq('requester_id', session.user.id)
            .eq('recipient_id', recipientId)
            .single();

        if (existingRequest) {
            // If request exists but was rejected, update it to pending
            if (existingRequest.status === 'rejected') {
                const { error: updateError } = await supabase
                    .from('follow_requests')
                    .update({
                        status: 'pending',
                        updated_at: new Date().toISOString()
                    })
                    .eq('requester_id', session.user.id)
                    .eq('recipient_id', recipientId);

                if (updateError) throw updateError;
                return NextResponse.json({ success: true });
            }

            // If request is pending or accepted, return appropriate message
            return NextResponse.json(
                { error: `Request already ${existingRequest.status}` },
                { status: 400 }
            );
        }

        // Create new follow request if none exists
        const { error: createError } = await supabase
            .from('follow_requests')
            .insert({
                requester_id: session.user.id,
                recipient_id: recipientId,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (createError) throw createError;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error creating follow request:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create follow request" },
            { status: 500 }
        );
    }
}