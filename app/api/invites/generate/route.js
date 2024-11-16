import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { nanoid } from 'nanoid';
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate a unique invite code
        const inviteCode = nanoid(10);

        // Create the invite record
        const { data: error } = await supabase
            .from('invites')
            .insert({
                code: inviteCode,
                inviter_id: session.user.id,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })
            .select()
            .single();

        if (error) throw error;

        // Make sure NEXT_PUBLIC_BASE_URL is set in your .env
        if (!process.env.NEXTAUTH_URL) {
            throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
        }

        // Return the complete invite URL using only the environment variable
        const inviteUrl = `${process.env.NEXTAUTH_URL}/invite?code=${inviteCode}`;

        return NextResponse.json({ inviteUrl });

    } catch (error) {
        console.error('Error generating invite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 