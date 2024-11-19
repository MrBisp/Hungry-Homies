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

        const { data: mark } = await supabase
            .from('review_useful_marks')
            .select()
            .eq('review_id', params.id)
            .eq('user_id', session.user.id)
            .single();

        return NextResponse.json({
            success: true,
            isMarked: !!mark
        });

    } catch (error) {
        console.error('Error checking useful status:', error);
        return NextResponse.json(
            { error: error.message || "Failed to check useful status" },
            { status: 500 }
        );
    }
} 