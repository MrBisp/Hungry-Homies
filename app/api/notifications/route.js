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

        const { data: notifications, error } = await supabase
            .from('notifications')
            .select(`
                *,
                sender:sender_id (
                    id,
                    name,
                    image
                )
            `)
            .eq('recipient_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch notifications" },
            { status: 500 }
        );
    }
} 