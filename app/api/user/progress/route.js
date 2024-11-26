import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get review count
        const { count: reviewCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact' })
            .eq('user_id', session.user.id);

        // Get following count
        const { count: followingCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact' })
            .eq('follower_id', session.user.id);

        // Get useful marks count - Updated to use review_useful_marks table
        const { count: usefulCount } = await supabase
            .from('review_useful_marks')  // Changed from review_reactions
            .select('*', { count: 'exact' })
            .eq('user_id', session.user.id);

        // Get comments count
        const { count: commentsCount } = await supabase
            .from('review_comments')
            .select('*', { count: 'exact' })
            .eq('user_id', session.user.id);

        // Get leaderboard of friends
        const { data: friendsLeaderboard } = await supabase
            .from('follows')
            .select(`
                following:following_id (
                    id,
                    name,
                    image
                )
            `)
            .eq('follower_id', session.user.id);

        // Get review counts for each friend
        const friendIds = friendsLeaderboard?.map(f => f.following.id) || [];
        
        let formattedLeaderboard = [];
        if (friendIds.length > 0) {
            const { data: reviewCounts } = await supabase
                .from('reviews')
                .select('user_id')
                .in('user_id', friendIds);

            // Count reviews for each user
            const reviewCountMap = {};
            reviewCounts?.forEach(review => {
                reviewCountMap[review.user_id] = (reviewCountMap[review.user_id] || 0) + 1;
            });

            // Format leaderboard with review counts
            formattedLeaderboard = friendsLeaderboard.map(f => ({
                id: f.following.id,
                name: f.following.name,
                image: f.following.image,
                reviewCount: reviewCountMap[f.following.id] || 0
            })).sort((a, b) => b.reviewCount - a.reviewCount);
        }

        // Calculate total resistance power (all reviews from user and friends)
        const friendsReviewCounts = formattedLeaderboard?.map(f => f.reviewCount) || [];
        const totalResistancePower = reviewCount + friendsReviewCounts.reduce((a, b) => a + b, 0);

        // Define resistance levels and their rewards
        const resistanceLevels = [
            { power: 10, name: "Rising Force", reward: "🌱 Seedling Badge" },
            { power: 25, name: "Growing Resistance", reward: "🌿 Sprout Badge" },
            { power: 50, name: "United Front", reward: "🌳 Tree Badge" },
            { power: 100, name: "Powerful Alliance", reward: "⭐️ Star Badge" },
            { power: 200, name: "Unstoppable Movement", reward: "🌟 Super Star Badge" }
        ];

        // Find current level
        const currentLevel = resistanceLevels.reduce((acc, level) => 
            totalResistancePower >= level.power ? level : acc
        , resistanceLevels[0]);

        // Find next level
        const nextLevelIndex = resistanceLevels.findIndex(level => level.power > totalResistancePower);
        const nextLevel = nextLevelIndex !== -1 ? resistanceLevels[nextLevelIndex] : null;

        return NextResponse.json({
            success: true,
            progress: {
                reviews: {
                    current: reviewCount,
                    target: 3,
                    hasFirst: reviewCount > 0,
                    hasThree: reviewCount >= 3
                },
                following: {
                    current: followingCount,
                    target: 5,
                    hasFive: followingCount >= 5
                },
                useful: {
                    current: usefulCount,
                    target: 3,
                    hasThree: usefulCount >= 3
                },
                comments: {
                    current: commentsCount,
                    target: 3,
                    hasThree: commentsCount >= 3
                }
            },
            resistance: {
                totalPower: totalResistancePower,
                currentLevel,
                nextLevel,
                powerNeededForNext: nextLevel ? nextLevel.power - totalResistancePower : 0
            },
            leaderboard: formattedLeaderboard
        });

    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: "Failed to fetch progress" },
            { status: 500 }
        );
    }
} 