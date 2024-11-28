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

        const id = parseInt(params.id);
        
        // Add debug logging
        console.log('Session user ID:', session.user.id, typeof session.user.id);
        console.log('Requested ID:', id, typeof id);

        // Ensure both IDs are numbers and compare them
        const sessionUserId = Number(session.user.id);
        const requestedId = Number(id);

        // Allow users to view their own reviews without following check
        if (sessionUserId === requestedId) {
            const { data: reviews, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    users (
                        name,
                        image
                    )
                `)
                .eq('user_id', requestedId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return NextResponse.json({
                success: true,
                reviews
            });
        }

        // Check if the user is following the requested profile
        const { data: followStatus } = await supabase
            .from('follows')
            .select()
            .eq('follower_id', sessionUserId)
            .eq('following_id', requestedId)
            .single();

        // If not following and not own profile, return unauthorized
        if (!followStatus) {
            return NextResponse.json(
                { error: "You must follow this user to view their reviews" },
                { status: 403 }
            );
        }

        // Get the reviews
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                users (
                    name,
                    image
                )
            `)
            .eq('user_id', requestedId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error('Error fetching user reviews:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}