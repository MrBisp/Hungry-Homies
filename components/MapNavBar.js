"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import ProfileImage from '@/components/ProfileImage';
import { useState, useEffect } from 'react';

const MapNavBar = () => {
    const { data: session, status } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                const data = await response.json();

                if (data.success) {
                    setUnreadCount(data.notifications.filter(n => !n.is_read).length);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (session?.user) {
            fetchNotifications();
            // Poll for new notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [session]);

    if (status !== "authenticated") {
        return null;
    }

    return (
        <div id="bottom-navbar" className="fixed bottom-0 left-0 right-0 bg-base-100 shadow-lg">
            <div className="flex justify-around items-center p-4">
                <Link href="/" className="flex flex-col items-center" prefetch={true}>
                    🗺️
                    <span className="text-xs mt-1">Explore</span>
                </Link>

                <Link href="/dashboard/profile/friends" prefetch={true} className="flex flex-col items-center">
                    👥
                    <span className="text-xs mt-1">Friends</span>
                </Link>

                <Link href="/dashboard/profile/reviews/new" prefetch={true} className="flex flex-col items-center">
                    📝
                    <span className="text-xs mt-1">Add</span>
                </Link>

                <Link
                    href="/notifications"
                    prefetch={true}
                    className="flex flex-col items-center relative"
                >
                    🔔
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                    <span className="text-xs mt-1">Notifications</span>
                </Link>

                <Link href="/dashboard/profile" prefetch={true} className="flex flex-col items-center">
                    <ProfileImage
                        user={session.user}
                        size="sm"
                        key={session.user.image}
                    />
                    <span className="text-xs mt-1">Me</span>
                </Link>
            </div>
        </div>
    );
};

export default MapNavBar;