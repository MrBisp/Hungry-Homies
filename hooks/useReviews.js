import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

export function useReviews() {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/reviews/feed');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch reviews');
                }

                const data = await response.json();

                // Process coordinates
                const reviewsWithCorrectCoordinates = data.map(review => {
                    if (!review.coordinates) return review;

                    const coordStr = review.coordinates.replace('(', '').replace(')', '');
                    const [lng, lat] = coordStr.split(',').map(Number);
                    return {
                        ...review,
                        coordinates: [lat, lng]
                    };
                });

                setReviews(reviewsWithCorrectCoordinates);
                setError(null);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return { reviews, isLoading, error };
}