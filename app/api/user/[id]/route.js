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

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, image')
            .eq('id', params.id)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch user" },
            { status: 500 }
        );
    }
} 