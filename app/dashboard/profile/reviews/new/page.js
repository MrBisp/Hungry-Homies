"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import PreferencesSelect from '@/components/PreferencesSelect';

const locationTypes = ['restaurant', 'bar', 'cafe', 'bakery'];
const emojis = ['😋', '🤤', '😍', '🤩', '😊', '👍', '👎', '❤️', '🔥', '⭐', '💯', '💸'];

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

const MapInput = dynamic(() => import('@/components/MapInput'), {
    ssr: false,
    loading: () => <div>Loading map...</div>
});

export const dynamicConfig = 'force-dynamic';

export default function NewReviewPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        locationName: '',
        locationType: '',
        coordinates: null,
        primaryEmoji: emojis[0],
        reviewText: '',
        images: [],
        preferences: []
    });

    const [message, setMessage] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const isMounted = useRef(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const reviewData = {
                location_name: formData.locationName,
                location_type: formData.locationType,
                coordinates: formData.coordinates,
                primary_emoji: formData.primaryEmoji,
                review_text: formData.reviewText,
                images: formData.images,
                preferences: formData.preferences
            };

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) throw new Error('Failed to create review');

            setShowConfetti(true);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Hide confetti after 5 seconds

            setMessage('Review created successfully');
            router.push('/dashboard/profile/reviews');
            router.refresh();
        } catch (error) {
            console.error('Error creating review:', error);
            setMessage('Error creating review');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationSelect = useCallback((coords, placeName = '') => {
        setFormData(prev => ({
            ...prev,
            locationName: placeName || prev.locationName,
            coordinates: {
                lat: coords.lat,
                lng: coords.lng
            }
        }));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-16 relative">
            {showConfetti && (
                <ReactConfetti
                    width="100vw"
                    height="100vh"
                    recycle={false}
                    numberOfPieces={200}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 100
                    }}
                />
            )}
            <div className="bg-white rounded-lg shadow px-6 py-8">
                <h2 className="text-2xl font-semibold mb-6">Add New Review</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Location Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location Name
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.locationName}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                locationName: e.target.value
                            }))}
                        />
                    </div>

                    {/* Location Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {locationTypes.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize
                                        ${formData.locationType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        locationType: type
                                    }))}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Map Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <MapInput
                            onLocationSelect={handleLocationSelect}
                            userImage={session?.user?.image || '/default-avatar.png'}
                            emoji={formData.primaryEmoji || emojis[0]}
                        />
                    </div>

                    {/* Emoji Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            How would you rate it?
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`w-12 h-12 text-2xl rounded-full flex items-center justify-center
                                        ${formData.primaryEmoji === emoji
                                            ? 'bg-blue-100 border-2 border-blue-600'
                                            : 'bg-gray-100 hover:bg-gray-200'}`}
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        primaryEmoji: emoji
                                    }))}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Review
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.reviewText}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                reviewText: e.target.value
                            }))}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Images
                        </label>
                        <ImageUpload
                            images={formData.images}
                            onImagesChange={(newImages) =>
                                setFormData(prev => ({
                                    ...prev,
                                    images: newImages
                                }))
                            }
                        />
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dietary & Special Preferences
                        </label>
                        <PreferencesSelect
                            value={formData.preferences || []}
                            onChange={(newPreferences) => setFormData(prev => ({
                                ...prev,
                                preferences: newPreferences
                            }))}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Review'}
                        </button>
                    </div>
                    {message && <div className="text-sm text-gray-500 mt-2">{message}</div>}
                </form>
            </div>
        </div>
    );
}