'use client';

import ReviewComments from '@/components/ReviewComments';
import ImageGrid from '@/components/ImageGrid';
import UsefulButton from '@/components/UsefulButton';

export default function ReviewDetail({ review, isOwnReview }) {
    return (
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

                {/* Emoji Rating and Useful Button */}
                <div className="flex items-center justify-between">
                    <div className="text-4xl">
                        {review.primary_emoji}
                    </div>
                    {!isOwnReview && <UsefulButton reviewId={review.id} />}
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

                {/* Preferences */}
                {review.preferences?.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Available Options</h3>
                        <div className="flex flex-wrap gap-2">
                            {review.preferences.map((pref) => (
                                <span
                                    key={pref.preference_id}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm"
                                >
                                    <span>{pref.icon}</span>
                                    {pref.description}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Date */}
                <div className="text-sm text-gray-500">
                    <p>Created: {new Date(review.created_at).toLocaleDateString()}</p>
                    <p>Last updated: {new Date(review.updated_at).toLocaleDateString()}</p>
                </div>

                {/* Comments Section */}
                <div className="mt-8 border-t pt-8">
                    <ReviewComments reviewId={review.id} isOwnReview={isOwnReview} />
                </div>
            </div>
        </div>
    );
}