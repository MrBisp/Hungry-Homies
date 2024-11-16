import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { supabase } from "@/libs/supabase";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Update user profile with onboarding data
        const { error } = await supabase
            .from('users')
            .update({
                interests: body.interests,
                bio: body.bio,
                notifications_enabled: body.notifications,
                has_completed_onboarding: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 