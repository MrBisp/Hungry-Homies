'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ReviewsPage() {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                if (!session?.user?.id) return;
                
                const response = await fetch(`/api/reviews/user/${session.user.id}`);
                const data = await response.json();
                setReviews(data.reviews);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [session?.user?.id]);

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`/api/reviews/${reviewToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete review');
            }

            // Remove the deleted review from the UI
            setReviews(reviews.filter(review => review.id !== reviewToDelete.id));

            // Close the modal
            setShowDeleteModal(false);
            setReviewToDelete(null);

        } catch (error) {
            console.error('Error deleting review:', error);
            // Optionally show error message to user
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">My Reviews</h1>
                        <Link
                            href="/dashboard/profile/reviews/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Add New Review
                        </Link>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : !reviews ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-gray-500">Unable to load reviews. Please try again later.</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-gray-500">You haven&apos;t written any reviews yet. Share your experiences!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium">{review.location_name}</h3>
                                        <p className="text-gray-500 capitalize">{review.location_type}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/dashboard/profile/reviews/${review.id}/edit`}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(review)}
                                            className="text-sm text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-2xl">{review.primary_emoji}</span>
                                    <p className="mt-2 text-gray-700">{review.review_text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Review</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete your review for &quot;{reviewToDelete?.location_name}?&quot; This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setReviewToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
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