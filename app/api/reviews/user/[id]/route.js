import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { id } = params;
        const requesterId = session.user.id;

        // Allow users to view their own reviews
        if (requesterId === parseInt(id)) {
            const { data: reviews, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    users (
                        name,
                        image
                    )
                `)
                .eq('user_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return NextResponse.json({
                success: true,
                reviews
            });
        }

        // Check if the requester follows the target user
        const { data: followStatus, error: followError } = await supabase
            .from('follows')
            .select()
            .eq('follower_id', requesterId)
            .eq('following_id', id)
            .single();

        if (followError && followError.code !== 'PGRST116') { // PGRST116 is "not found" error
            throw followError;
        }

        // If not following, return unauthorized
        if (!followStatus) {
            return NextResponse.json(
                { error: "You must follow this user to view their reviews" },
                { status: 403 }
            );
        }

        // If following, return the reviews
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                users (
                    name,
                    image
                )
            `)
            .eq('user_id', id)
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