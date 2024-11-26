'use client';

import { useState, useEffect } from 'react';

export default function FollowButton({ userId, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [buttonState, setButtonState] = useState('loading'); // 'follow', 'following', 'pending', or 'loading'

    // Check both follow status and pending request status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Check if we're following the user
                const followResponse = await fetch(`/api/follow/status/${userId}`);
                const followData = await followResponse.json();

                // Check if we have a pending request
                const requestResponse = await fetch(`/api/follow/request/status/${userId}`);
                const requestData = await requestResponse.json();

                if (followData.isFollowing) {
                    setButtonState('following');
                } else if (requestData.hasPendingRequest) {
                    setButtonState('pending');
                } else {
                    setButtonState('follow');
                }
            } catch (error) {
                console.error('Error checking status:', error);
                setButtonState('follow'); // Default to follow on error
            }
        };

        checkStatus();
    }, [userId]);

    const handleFollow = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/follow/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipientId: userId }),
            });

            if (response.ok) {
                setButtonState('pending');
                onSuccess?.();
            }
        } catch (error) {
            console.error('Error following user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnfollow = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/follow/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setButtonState('follow');
                onSuccess?.();
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (buttonState === 'loading') {
        return (
            <button
                disabled
                className="px-5 py-2 text-sm rounded-lg bg-gray-100 text-gray-500"
            >
                <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                </span>
            </button>
        );
    }

    if (buttonState === 'pending') {
        return (
            <button
                disabled
                className="px-5 py-2 text-sm rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            >
                Request Sent
            </button>
        );
    }

    const buttonStyles = {
        follow: 'bg-black text-white hover:bg-gray-800',
        following: 'border border-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 group',
    };

    return (
        <button
            onClick={buttonState === 'follow' ? handleFollow : handleUnfollow}
            disabled={isLoading}
            className={`px-5 py-2 text-sm rounded-lg ${buttonStyles[buttonState]}`}
        >
            {isLoading ? (
                <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </span>
            ) : buttonState === 'following' ? (
                <span className="group-hover:hidden">Following</span>
            ) : buttonState === 'follow' ? (
                'Follow'
            ) : null}
            <span className="hidden group-hover:inline text-red-600">Unfollow</span>
        </button>
    );
}