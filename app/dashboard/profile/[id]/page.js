'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import ProfileImage from '@/components/ProfileImage';
import FollowButton from '@/components/FollowButton';

export default function UserProfilePage({ params }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [followStatus, setFollowStatus] = useState({
        isFollowing: false,
        hasPendingRequest: false
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data, reviews, and follow status
                const [userRes, reviewsRes, followStatusRes, requestStatusRes] = await Promise.all([
                    fetch(`/api/user/${params.id}`),
                    fetch(`/api/reviews/user/${params.id}`),
                    fetch(`/api/follow/status/${params.id}`),
                    fetch(`/api/follow/request/status/${params.id}`)
                ]);

                const [userData, reviewsData, followData, requestData] = await Promise.all([
                    userRes.json(),
                    reviewsRes.json(),
                    followStatusRes.json(),
                    requestStatusRes.json()
                ]);

                setUser(userData.user);
                setReviews(reviewsData.reviews || []);
                setFollowStatus({
                    isFollowing: followData.isFollowing,
                    hasPendingRequest: requestData.hasPendingRequest
                });
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchData();
        }
    }, [params.id, session?.user?.id]);

    const handleFollowAction = async () => {
        try {
            if (followStatus.isFollowing) {
                // Unfollow
                await fetch(`/api/follow/${params.id}`, {
                    method: 'DELETE'
                });
                setFollowStatus(prev => ({ ...prev, isFollowing: false }));
            } else if (!followStatus.hasPendingRequest) {
                // Send follow request
                await fetch('/api/follow/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ recipientId: params.id }),
                });
                setFollowStatus(prev => ({ ...prev, hasPendingRequest: true }));
            }
        } catch (error) {
            console.error('Error handling follow action:', error);
        }
    };

 
    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-white">
                <div className="px-4 py-4">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b">
                <div className="px-4 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="mr-4 text-gray-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold">{user.name}&apos;s Profile</h1>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <ProfileImage user={user} size="lg" />
                        <div>
                            <h2 className="text-xl font-medium">{user.name}</h2>
                        </div>
                    </div>
                    <FollowButton userId={user.id} />
                </div>
            </div>

            {/* Follow to see reviews message */}
            {!followStatus.isFollowing && session?.user?.id !== parseInt(params.id) && (
                <div className="px-4 py-6 bg-gray-50">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Follow to See Reviews</h3>
                        <p className="text-gray-600 mb-4">
                            Follow {user.name} to see their reviews and recommendations
                        </p>
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            {(followStatus.isFollowing || session?.user?.id === parseInt(params.id)) && (
                <div className="px-4 py-6">
                    <h3 className="text-lg font-medium mb-4">Reviews</h3>
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <Link href={`/dashboard/profile/reviews/${review.id}`} key={review.id}>
                                    <div className="border rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{review.location_name}</h4>
                                            <span className="text-2xl">{review.primary_emoji}</span>
                                        </div>
                                        <p className="text-gray-600">{review.review_text}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No reviews yet</p>
                    )}
                </div>
            )}
        </div>
    );
}
