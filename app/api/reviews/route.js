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

        console.log('Session user ID:', session.user.id);

        const body = await req.json();
        const {
            location_name,
            location_type,
            coordinates,
            primary_emoji,
            review_text,
            images
        } = body;

        const { data: review, error } = await supabase
            .from('reviews')
            .insert([{
                user_id: session.user.id,
                location_name,
                location_type,
                coordinates: `(${coordinates.lng},${coordinates.lat})`,
                primary_emoji,
                review_text,
                images: images || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create review" },
            { status: 500 }
        );
    }
}