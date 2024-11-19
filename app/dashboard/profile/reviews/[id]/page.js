'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ImageGrid from '@/components/ImageGrid'

export default function ReviewPage({ params }) {
    const { data: session } = useSession();
    const [review, setReview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await fetch(`/api/reviews/${params.id}`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                // Parse coordinates
                let coordinates;
                if (typeof data.review.coordinates === 'string') {
                    const coordsStr = data.review.coordinates.replace('(', '').replace(')', '');
                    const [lng, lat] = coordsStr.split(',');
                    coordinates = {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    };
                } else {
                    coordinates = data.review.coordinates;
                }

                setReview({
                    ...data.review,
                    coordinates
                });
            } catch (error) {
                console.error('Error fetching review:', error);
                setError('Error loading review');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReview();
    }, [params.id]);

    const isOwnReview = session?.user?.id && review?.user_id === parseInt(session.user.id);

    if (isLoading) return (
        <div className="min-h-screen bg-white p-4">
            <div className="max-w-2xl mx-auto">
                Loading...
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-white p-4">
            <div className="max-w-2xl mx-auto">
                {error}
            </div>
        </div>
    );

    if (!review) return null;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </button>
                        {isOwnReview && (
                            <Link
                                href={`/dashboard/profile/reviews/${params.id}/edit`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Edit Review
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Location Name */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {review.location_name}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {review.location_type}
                        </p>
                    </div>

                    {/* Emoji Rating */}
                    <div className="text-4xl">
                        {review.primary_emoji}
                    </div>

                    {/* Review Text */}
                    {review.review_text && (
                        <div className="prose max-w-none">
                            <p className="text-gray-700">
                                {review.review_text}
                            </p>
                        </div>
                    )}

                    {/* Images */}
                    {review.images && <ImageGrid images={review.images} />}

                    {/* Date */}
                    <div className="text-sm text-gray-500">
                        <p>Created: {new Date(review.created_at).toLocaleDateString()}</p>
                        <p>Last updated: {new Date(review.updated_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
