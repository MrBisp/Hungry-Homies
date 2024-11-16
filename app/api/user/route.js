import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, image } = await req.json();

        // Don't update email if user is from Google
        const updateData = {
            name,
            updated_at: new Date().toISOString(),
        };

        // Only include image if it was changed (not empty string)
        if (image) {
            updateData.image = image;
        }

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', session.user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: error.message || "Failed to update user" },
            { status: 500 }
        );
    }
}