'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useReviews } from '@/hooks/useReviews';
import Link from 'next/link';
import ProfileImage from './ProfileImage';
import ReviewComments from './ReviewComments';

export default function FeedSection() {
    const { data: session } = useSession();
    const { reviews, isLoading: reviewsLoading, mutate } = useReviews();
    const [newPost, setNewPost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedPosts, setFeedPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/feed/posts');
                const data = await response.json();
                if (response.ok) {
                    setFeedPosts(data.posts || []);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        if (session?.user) {
            fetchPosts();
        }
    }, [session]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feed/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPost.trim(),
                    type: 'question'
                }),
            });

            if (response.ok) {
                const { post } = await response.json();
                const postWithUser = {
                    ...post,
                    user: {
                        id: session.user.id,
                        name: session.user.name,
                        image: session.user.image
                    }
                };
                setFeedPosts(prev => [postWithUser, ...prev]);
                setNewPost('');
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/feed/posts/${postId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setFeedPosts(prev => prev.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    // Normalize user data for both posts and reviews
    const feedItems = [...feedPosts, ...(reviews || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(item => ({
            ...item,
            user: {
                id: item.users?.id || item.user?.id,
                name: item.users?.name || item.user?.name,
                image: item.users?.image || item.user?.image
            }
        }));

    const isLoading = isLoadingPosts || reviewsLoading;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* New Post Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Ask for recommendations or share your thoughts..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                />
                <div className="mt-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !newPost.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>

            {/* Feed Content */}
            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="space-y-6">
                    {feedItems.map((item) => (
                        <div key={`${item.type || 'review'}-${item.id}`} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-3">
                                    <Link href={`/dashboard/profile/${item.user.id}`}>
                                        <ProfileImage user={item.user} size="md" />
                                    </Link>
                                    <div>
                                        <Link href={`/dashboard/profile/${item.user.id}`}>
                                            <span className="font-medium">{item.user.name}</span>
                                        </Link>
                                        <p className="text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Debug the condition */}
                                {console.log('Menu condition:', {
                                    type: item.type,
                                    itemUserId: item.user.id,
                                    sessionUserId: session?.user?.id,
                                    shouldShow: item.type === 'question' && item.user.id === session?.user?.id
                                })}

                                {/* Three dots menu for own posts */}
                                {String(item.user.id) === String(session?.user?.id) && (
                                    <div className="relative">
                                        <button 
                                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                            className="text-gray-500 hover:text-gray-700 p-2 -m-2"
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === item.id && (
                                            <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {item.type === 'question' ? (
                                <p className="text-gray-700">{item.content}</p>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium">{item.location_name}</h3>
                                            <span className="text-2xl">{item.primary_emoji}</span>
                                        </div>
                                        <p className="text-gray-700">{item.review_text}</p>
                                    </div>
                                    <ReviewComments 
                                        reviewId={item.id} 
                                        isOwnReview={item.user?.id === session?.user?.id} 
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 