'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import ProfileImage from './ProfileImage';
import Link from 'next/link';

export default function ReviewComments({ reviewId, isOwnReview }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [reviewId]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/reviews/comments?reviewId=${reviewId}`);
            const data = await response.json();
            setComments(data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId,
                    content: newComment.trim()
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setComments([...comments, data.comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const response = await fetch(`/api/reviews/comments/${commentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setComments(comments.filter(comment => comment.id !== commentId));
                setDeleteConfirmation(null);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
        setMenuOpen(null);
    };

    const handleEdit = async (commentId) => {
        try {
            const response = await fetch(`/api/reviews/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editText })
            });

            if (response.ok) {
                const updatedComments = comments.map(comment =>
                    comment.id === commentId
                        ? { ...comment, content: editText }
                        : comment
                );
                setComments(updatedComments);
                setEditingComment(null);
                setEditText('');
            }
        } catch (error) {
            console.error('Error editing comment:', error);
        }
        setMenuOpen(null);
    };

    const startEdit = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.content);
        setMenuOpen(null);
    };

    if (isLoading) {
        return <div className="animate-pulse">Loading comments...</div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Comments</h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg relative">
                        <Link href={`/dashboard/profile/${comment.users.id}`}>
                            <ProfileImage
                                user={comment.users}
                                size={'sm'}
                            />
                        </Link>

                        <div className="flex-grow">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{comment.users.name}</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {editingComment === comment.id ? (
                                <div className="mt-2">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                    />
                                    <div className="mt-2 space-x-2">
                                        <button
                                            onClick={() => handleEdit(comment.id)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingComment(null)}
                                            className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-1 text-gray-700">{comment.content}</p>
                            )}
                        </div>

                        {/* Three dots menu */}
                        {(isOwnReview || comment.users.id === session?.user?.id) && (
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)}
                                    className="p-1 hover:bg-gray-200 rounded-full"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                    </svg>
                                </button>

                                {menuOpen === comment.id && (
                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                                        {comment.users.id === session?.user?.id && (
                                            <button
                                                onClick={() => startEdit(comment)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setDeleteConfirmation(comment.id);
                                                setMenuOpen(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No comments yet</p>
                )}
            </div>

            {/* Add the confirmation dialog */}
            {deleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Comment</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmation)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}