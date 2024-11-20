'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import config from "@/config";

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [step, setStep] = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Redirect to dashboard if user has already completed onboarding
    useEffect(() => {
        if (session?.user?.hasCompletedOnboarding) {
            router.push('/');
        }
    }, [session, router]);

    // Fetch suggestions when component mounts
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await fetch('/api/follow/suggestions');
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleComplete = async () => {
        try {
            // Simply mark onboarding as complete without sending any data
            const response = await fetch('/api/user/complete-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: true }),
            });

            if (response.ok) {
                router.push('/');
            }
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    const handleFollow = async (userId) => {
        try {
            const response = await fetch('/api/follow/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipientId: userId }),
            });

            if (response.ok) {
                // Update the suggestions list to show pending state
                setSuggestions(suggestions.map(user => {
                    if (user.id === userId) {
                        return { ...user, hasPendingRequest: true };
                    }
                    return user;
                }));
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-100">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <div className="max-w-2xl mx-auto px-4 py-16">
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold">Welcome to {config.appName}! 👋</h1>
                            <p className="mt-2 text-gray-600">Let us show you around</p>
                        </div>

                        <div className="space-y-4 text-center">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h2 className="text-xl font-semibold">Discover Personal Recommendations</h2>
                            <p className="text-gray-600 mb-8">
                                Find restaurants, cafes, and bars recommended by your friends - because you trust their taste, not strangers&apos;
                            </p>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💫</div>
                            <h2 className="text-xl font-semibold">Share Your Favorites</h2>
                            <p className="mt-2 text-gray-600">
                                Mark and share the places you love with your friends. Help them discover your hidden gems!
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="text-6xl mb-4">👥</div>
                            <h2 className="text-xl font-semibold">Better with Friends</h2>
                            <p className="mt-2 text-gray-600">
                                Connect with friends to build your trusted network of recommendations
                            </p>
                        </div>

                        {/* Friend suggestions - moved from step 1 to here */}
                        {!isLoading && suggestions.length > 0 && (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-500 text-center">People you might know:</p>
                                <div className="space-y-4">
                                    {suggestions.slice(0, 3).map((user) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt=""
                                                        width={48}
                                                        height={48}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <span className="text-xl text-gray-600">
                                                            {user.name?.[0]}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleFollow(user.id)}
                                                disabled={user.hasPendingRequest}
                                                className={`px-4 py-2 rounded-lg text-sm ${user.hasPendingRequest
                                                    ? 'bg-gray-100 text-gray-500'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {user.hasPendingRequest ? 'Request Sent' : 'Follow'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}