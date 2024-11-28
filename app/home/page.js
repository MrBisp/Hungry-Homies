'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileListItem from '@/components/ProfileListItem';
import FeedSection from '@/components/FeedSection';

export default function HomePage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState({
        reviews: { current: 0, target: 3, hasFirst: false, hasThree: false },
        following: { current: 0, target: 5, hasFive: false },
        useful: { current: 0, target: 3, hasThree: false },
        comments: { current: 0, target: 3, hasThree: false },
        resistance: null,
        leaderboard: []
    });
    const [activeTab, setActiveTab] = useState('tasks');

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/progress');
                const data = await response.json();
                if (data.success) {
                    setProgress({
                        ...progress,
                        ...data.progress,
                        resistance: data.resistance,
                        leaderboard: data.leaderboard
                    });
                }
            } catch (error) {
                console.error('Error fetching progress:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchProgress();
        }
    }, [session]);

    const tasks = [
        {
            id: 'firstReview',
            title: 'Create your first review',
            description: 'Share your first place recommendation',
            completed: progress.reviews.hasFirst,
            action: '/dashboard/profile/reviews/new',
            actionText: 'Add Review'
        },
        {
            id: 'threeReviews',
            title: 'Create 3 reviews',
            description: 'Share more of your favorite places',
            completed: progress.reviews.hasThree,
            progress: `${progress.reviews.current || 0}/3`,
            action: '/dashboard/profile/reviews/new',
            actionText: 'Add Review'
        },
        {
            id: 'fiveFriends',
            title: 'Follow 5 friends',
            description: 'Connect with people whose taste you trust',
            completed: progress.following.hasFive,
            progress: `${progress.following.current || 0}/5`,
            action: '/dashboard/profile/friends',
            actionText: 'Find Friends'
        },
        {
            id: 'threeUseful',
            title: 'Mark 3 reviews as useful',
            description: 'Help others by marking helpful reviews',
            completed: progress.useful.hasThree,
            progress: `${progress.useful.current || 0}/3`,
            action: '/',
            actionText: 'Browse Reviews'
        },
        {
            id: 'threeComments',
            title: 'Leave 3 comments',
            description: 'Engage with the community',
            completed: progress.comments.hasThree,
            progress: `${progress.comments.current || 0}/3`,
            action: '/',
            actionText: 'Browse Reviews'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'tasks':
                return (
                    <div className="space-y-6">
                        {isLoading ? (
                            // Skeleton loading UI
                            [...Array(5)].map((_, index) => (
                                <div 
                                    key={index}
                                    className="p-4 rounded-lg border-2 border-gray-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-full">
                                            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                                            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            tasks.map((task) => (
                                <div 
                                    key={task.id}
                                    className={`p-4 rounded-lg border-2 ${
                                        task.completed 
                                            ? 'border-green-200 bg-green-50' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                {task.title}
                                                {task.completed ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : task.progress && (
                                                    <span className="text-sm font-normal text-gray-500">
                                                        ({task.progress})
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {task.description}
                                            </p>
                                        </div>
                                        {!task.completed && (
                                            <Link
                                                href={task.action}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                {task.actionText}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {!isLoading && progress.resistance && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                                <h2 className="text-xl font-bold mb-2">Resistance Power ⚡️</h2>
                                <div className="mb-4">
                                    <div className="text-3xl font-bold text-purple-700">
                                        {progress.resistance.totalPower}
                                    </div>
                                    <div className="text-sm text-purple-600">
                                        Combined review power of you and your friends
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="font-medium">
                                        Current Level: {progress.resistance.currentLevel.name} {progress.resistance.currentLevel.reward}
                                    </div>
                                    {progress.resistance.nextLevel && (
                                        <div className="text-sm text-purple-600">
                                            {progress.resistance.powerNeededForNext} more reviews needed for {progress.resistance.nextLevel.name}
                                        </div>
                                    )}
                                </div>

                                <div className="w-full bg-purple-200 rounded-full h-2">
                                    <div 
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${(progress.resistance.totalPower / (progress.resistance.nextLevel?.power || progress.resistance.totalPower)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-4">Getting Started</h2>
                            {tasks.map((task) => (
                                <div 
                                    key={task.id}
                                    className={`p-4 rounded-lg border-2 ${
                                        task.completed 
                                            ? 'border-green-200 bg-green-50' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                {task.title}
                                                {task.completed ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : task.progress && (
                                                    <span className="text-sm font-normal text-gray-500">
                                                        ({task.progress})
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {task.description}
                                            </p>
                                        </div>
                                        {!task.completed && (
                                            <Link
                                                href={task.action}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                {task.actionText}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'feed':
                return <FeedSection />;
            default:
                return null;
        }
    };

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="px-4 py-6">
                <h1 className="text-2xl font-bold mb-2">
                    {isLoading ? (
                        <span className="h-8 w-64 bg-gray-200 rounded animate-pulse block" />
                    ) : (
                        `Welcome back, ${session?.user?.name}! 👋`
                    )}
                </h1>
                {isLoading ? (
                    <div className="text-gray-600 mb-8">
                        <span className="h-5 w-48 bg-gray-200 rounded animate-pulse block" />
                    </div>
                ) : (
                    <p className="text-gray-600 mb-8">
                        Let&apos;s help you get started
                    </p>
                )}

                <div className="border-b mb-6">
                    <div className="flex space-x-8">
                        {['tasks', 'feed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-1 ${
                                    activeTab === tab
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-500'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {renderTabContent()}

                {!isLoading && progress.leaderboard && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 mt-8">Leaderboard</h2>
                        <div className="space-y-2">
                            {progress.leaderboard.map((friend, index) => (
                                <div 
                                    key={friend.id}
                                    className={`flex items-center p-2 rounded-lg ${
                                        friend.id === session.user.id 
                                            ? 'bg-blue-50 border border-blue-100' 
                                            : ''
                                    }`}
                                >
                                    <div className="w-8 text-lg font-medium text-gray-500">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <ProfileListItem 
                                            user={{
                                                ...friend,
                                            }}
                                            extraInfo={`${friend.reviewCount} reviews`}
                                        />
                                    </div>
                                    {friend.id === session.user.id && (
                                        <div className="text-sm text-blue-600 font-medium px-2">
                                            You
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 