import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { createNotification } from "@/libs/notifications";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, type } = await req.json();

        // Create the post
        const { data: post, error } = await supabase
            .from('feed_posts')
            .insert({
                user_id: parseInt(session.user.id),
                content,
                type,
                created_at: new Date().toISOString()
            })
            .select(`
                *,
                users (
                    id,
                    name,
                    image
                )
            `)
            .single();

        if (error) throw error;

        // Get followers to notify
        const { data: followers } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', session.user.id);

        // Create notifications for followers
        if (followers) {
            await Promise.all(
                followers.map(follower =>
                    createNotification({
                        recipientId: follower.follower_id,
                        senderId: session.user.id,
                        type: 'NEW_POST',
                        content: `${session.user.name} is looking for recommendations`,
                        link: '/?tab=feed'
                    })
                )
            );
        }

        return NextResponse.json({ post });

    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create post" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get list of users the current user follows
        const { data: following } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', session.user.id);

        // Get array of followed user IDs plus the current user's ID
        const allowedUserIds = [
            session.user.id,
            ...(following?.map(f => f.following_id) || [])
        ];

        // Get posts from followed users and self
        const { data: posts, error } = await supabase
            .from('feed_posts')
            .select(`
                *,
                users (
                    id,
                    name,
                    image
                )
            `)
            .in('user_id', allowedUserIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ posts });

    } catch (error) {
        console.error('Error fetching feed posts:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch feed posts" },
            { status: 500 }
        );
    }
}