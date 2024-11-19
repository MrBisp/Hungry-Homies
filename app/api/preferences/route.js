import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { data: preferences, error } = await supabase
            .from('preferences')
            .select('*')
            .order('name');

        if (error) throw error;

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        );
    }
}