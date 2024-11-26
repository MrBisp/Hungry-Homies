'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from "next-auth/react";
import ProfileListItem from '@/components/ProfileListItem';
import FollowButton from '@/components/FollowButton';
import debounce from 'lodash/debounce';

export default function FriendsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('followers');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [requests, setRequests] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [inviteUrl, setInviteUrl] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [buttonText, setButtonText] = useState('Copy');
    const tabsRef = useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (session?.user?.id) {
            fetchData();
        }
    }, [session?.user?.id]);

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
                            <FollowButton 
                                userId={user.id}
                                initialState="unfollow"
                                onSuccess={() => setFollowing(following.filter(u => u.id !== user.id))}
                            />
                        ) : type === 'suggestions' && (
                            <FollowButton 
                                userId={user.id}
                                initialState="follow"
                                onSuccess={() => setSuggestions(suggestions.filter(u => u.id !== user.id))}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
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

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (!query.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSearchResults(data.users || []);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    // Handle search input changes
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'followers':
                return renderUserList(followers, false, 'followers');
            case 'following':
                return renderUserList(following, true, 'following');
            case 'requests':
                return renderUserList(requests, false, 'requests');
            case 'suggestions':
                return renderUserList(suggestions, false, 'suggestions');
            case 'search':
                return (
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search users..."
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-2.5">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Results */}
                        <div className="space-y-4">
                            {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <ProfileListItem user={user} />
                                    {session?.user?.id !== user.id && (
                                        <FollowButton 
                                            userId={user.id}
                                            onSuccess={() => {
                                                // Optionally refresh search results
                                                debouncedSearch(searchQuery);
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                            {searchQuery && !isSearching && searchResults.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No users found</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Check if scroll buttons should be shown
    const checkScroll = () => {
        if (tabsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1); // -1 for potential rounding
        }
    };

    // Scroll handlers
    const scroll = (direction) => {
        if (tabsRef.current) {
            const scrollAmount = 200; // Adjust this value to change scroll distance
            tabsRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Update scroll indicators when content changes
    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header with Invite Button */}
            <div className="border-b">
                <div className="px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Friends</h1>
                    <button
                        onClick={generateInviteLink}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Invite Friend
                    </button>
                </div>
            </div>

            {/* Tabs with scroll */}
            <div className="border-b relative">
                {/* Left scroll button */}
                {showLeftScroll && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-white to-transparent"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}

                {/* Right scroll button */}
                {showRightScroll && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-white to-transparent"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}

                {/* Scrollable tabs container */}
                <div 
                    ref={tabsRef}
                    className="flex overflow-x-auto scrollbar-hide"
                    onScroll={checkScroll}
                >
                    {['followers', 'following', 'requests', 'suggestions', 'search'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-none px-6 py-3 text-sm font-medium whitespace-nowrap ${
                                activeTab === tab
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {renderTabContent()}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Invite a Friend</h3>
                            <button 
                                onClick={() => setShowInviteModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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