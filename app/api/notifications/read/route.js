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

        const { notificationId } = await req.json();

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', notificationId)
            .eq('recipient_id', session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: error.message || "Failed to mark notification as read" },
            { status: 500 }
        );
    }
}