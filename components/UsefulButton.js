'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function UsefulButton({ reviewId }) {
    const { data: session } = useSession();
    const [isMarked, setIsMarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUsefulStatus = async () => {
            try {
                const response = await fetch(`/api/reviews/useful/status/${reviewId}`);
                const data = await response.json();
                setIsMarked(data.isMarked);
            } catch (error) {
                console.error('Error checking useful status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            checkUsefulStatus();
        }
    }, [reviewId, session]);

    const handleClick = async (e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        try {
            const response = await fetch('/api/reviews/useful', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId }),
            });

            const data = await response.json();
            setIsMarked(data.marked);
        } catch (error) {
            console.error('Error marking review as useful:', error);
        }
    };

    if (isLoading || !session) return null;

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${isMarked
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            <span className="text-lg">👍</span>
            <span>{isMarked ? 'Useful!' : 'Useful?'}</span>
        </button>
    );
} 