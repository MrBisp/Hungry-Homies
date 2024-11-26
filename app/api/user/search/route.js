export const dynamic = 'force-dynamic'

import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchQuery = request.nextUrl.searchParams.get('q');
        
        if (!searchQuery) {
            return NextResponse.json({ users: [] });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, image')
            .ilike('name', `%${searchQuery}%`)
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ users });

    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json(
            { error: error.message || "Failed to search users" },
            { status: 500 }
        );
    }
} 