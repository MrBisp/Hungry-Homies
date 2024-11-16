'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import ProfileListItem from '@/components/ProfileListItem';

export default function FriendsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteUrl, setInviteUrl] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [buttonText, setButtonText] = useState('Copy');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [requestsRes, followersRes, followingRes, suggestionsRes] = await Promise.all([
                    fetch('/api/follow/requests'),
                    fetch('/api/follow/followers'),
                    fetch('/api/follow/following'),
                    fetch('/api/follow/suggestions')
                ]);

                const [requestsData, followersData, followingData, suggestionsData] = await Promise.all([
                    requestsRes.json(),
                    followersRes.json(),
                    followingRes.json(),
                    suggestionsRes.json()
                ]);

                setRequests(requestsData.requests || []);
                setFollowers(followersData.followers || []);
                setFollowing(followingData.following || []);
                setSuggestions(suggestionsData.suggestions || []);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchData();
        }
    }, [session?.user?.id]);

    const handleUnfollow = async (userId) => {
        try {
            const response = await fetch(`/api/follow/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setFollowing(following.filter(user => user.id !== userId));
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await fetch('/api/follow/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    accept: true
                }),
            });

            if (response.ok) {
                // Remove the request from the list after accepting
                setRequests(requests.filter(req => req.id !== requestId));
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const response = await fetch('/api/follow/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    accept: false
                }),
            });

            if (response.ok) {
                // Remove the request from the list after declining
                setRequests(requests.filter(req => req.id !== requestId));
            }
        } catch (error) {
            console.error('Error declining friend request:', error);
        }
    };

    const generateInviteLink = async () => {
        try {
            const response = await fetch('/api/invites/generate', {
                method: 'POST',
            });

            if (response.ok) {
                const { inviteUrl } = await response.json();
                setInviteUrl(inviteUrl);
                setShowInviteModal(true);
            }
        } catch (error) {
            console.error('Error generating invite link:', error);
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteUrl);
        setButtonText('Copied!');
        setTimeout(() => setButtonText('Copy'), 2000);
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
                // Remove the user from suggestions after sending request
                setSuggestions(suggestions.filter(user => user.id !== userId));
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const renderUserList = (users, showUnfollowButton = false, type = 'followers') => {
        if (users.length === 0) {
            const emptyStateMessages = {
                requests: {
                    emoji: '🤗',
                    message: "No pending friend requests - you're all caught up!"
                },
                followers: {
                    emoji: '👋',
                    message: "No friends yet - but don't worry, great connections take time!"
                },
                following: {
                    emoji: '🌟',
                    message: "You haven't followed anyone yet. Ready to discover some amazing people?"
                },
                suggestions: {
                    emoji: '✨',
                    message: "No suggestions right now - check back later!"
                }
            };

            const { emoji, message } = emptyStateMessages[type] || emptyStateMessages.followers;

            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">{emoji}</div>
                    <p className="text-gray-500">{message}</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <ProfileListItem user={user} />
                        {showUnfollowButton ? (
                            <button
                                onClick={() => handleUnfollow(user.id)}
                                className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                            >
                                Unfollow
                            </button>
                        ) : type === 'suggestions' && (
                            <button
                                onClick={() => handleFollow(user.id)}
                                className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                            >
                                Follow
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="">
                <div className="px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Friends</h1>
                    <button
                        onClick={generateInviteLink}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                    >
                        Invite Friend
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="px-4">
                    <nav className="flex space-x-6">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`py-4 text-sm font-medium relative ${activeTab === 'requests'
                                ? 'text-black'
                                : 'text-gray-500'
                                }`}
                        >
                            Follow Requests {requests.length > 0 && `(${requests.length})`}
                            {activeTab === 'requests' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('followers')}
                            className={`py-4 text-sm font-medium relative ${activeTab === 'followers'
                                ? 'text-black'
                                : 'text-gray-500'
                                }`}
                        >
                            Followers
                            {activeTab === 'followers' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`py-4 text-sm font-medium relative ${activeTab === 'following'
                                ? 'text-black'
                                : 'text-gray-500'
                                }`}
                        >
                            Following
                            {activeTab === 'following' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        {/* Friend Requests */}
                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                {requests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-4xl mb-4">🤗</div>
                                        <p className="text-gray-500">No pending friend requests - you&apos;re all caught up!</p>
                                    </div>
                                ) : (
                                    requests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between">
                                            <ProfileListItem user={request.requester} />
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                    className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineRequest(request.id)}
                                                    className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Friends Tab */}
                        {activeTab === 'followers' && (
                            <div className="space-y-4">
                                {renderUserList(followers, false, 'followers')}
                            </div>
                        )}

                        {/* Following Tab */}
                        {activeTab === 'following' && (
                            <div className="space-y-8">
                                {renderUserList(following, true, 'following')}
                                {suggestions.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Suggested Friends</h3>
                                        {renderUserList(suggestions, false, 'suggestions')}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Invite a Friend</h3>
                        <p className="text-sm text-gray-600 mb-4">Share this link with your friend to invite them:</p>
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="text"
                                value={inviteUrl}
                                readOnly
                                className="flex-1 p-2 border rounded-lg text-sm"
                            />
                            <button
                                onClick={copyInviteLink}
                                className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                            >
                                {buttonText}
                            </button>
                        </div>
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="w-full px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 