import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/libs/notifications";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recipientId } = await req.json();

        // First check if there's an active follow relationship
        const { data: followExists } = await supabase
            .from('follows')
            .select()
            .eq('follower_id', session.user.id)
            .eq('following_id', recipientId)
            .single();

        if (followExists) {
            return NextResponse.json(
                { error: 'Already following this user' },
                { status: 400 }
            );
        }

        // Check for any existing request
        const { data: existingRequest } = await supabase
            .from('follow_requests')
            .select()
            .eq('requester_id', session.user.id)
            .eq('recipient_id', recipientId)
            .single();

        if (existingRequest) {
            // If request exists but isn't pending, update it
            if (existingRequest.status !== 'pending') {
                const { error: updateError } = await supabase
                    .from('follow_requests')
                    .update({
                        status: 'pending',
                        updated_at: new Date().toISOString()
                    })
                    .eq('requester_id', session.user.id)
                    .eq('recipient_id', recipientId);

                if (updateError) throw updateError;

                // Create notification for updated request
                await createNotification({
                    recipientId,
                    senderId: session.user.id,
                    type: 'FOLLOW_REQUEST',
                    content: `${session.user.name} wants to follow you`,
                    link: '/dashboard/profile/friends'
                });

                return NextResponse.json({ success: true });
            }

            return NextResponse.json(
                { error: 'Request already pending' },
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

        // Create notification for new request
        await createNotification({
            recipientId,
            senderId: session.user.id,
            type: 'FOLLOW_REQUEST',
            content: `${session.user.name} wants to follow you`,
            link: '/dashboard/profile/friends'
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error creating follow request:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create follow request" },
            { status: 500 }
        );
    }
}