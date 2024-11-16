import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
        }

        // Get the invite and check if it's valid
        const { data: invite, error } = await supabase
            .from('invites')
            .select('*, inviter:inviter_id(*)')
            .eq('code', code)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error || !invite) {
            return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            inviter: {
                id: invite.inviter.id,
                name: invite.inviter.name,
                image: invite.inviter.image
            }
        });

    } catch (error) {
        console.error('Error validating invite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 