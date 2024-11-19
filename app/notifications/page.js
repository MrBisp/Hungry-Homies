'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ProfileImage from '@/components/ProfileImage';

export default function NotificationsPage() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                const data = await response.json();

                if (data.success) {
                    setNotifications(data.notifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchNotifications();
        }
    }, [session]);

    const handleNotificationClick = async (notificationId) => {
        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            // Update local state
            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'POST',
            });

            if (response.ok) {
                // Update local state
                setNotifications(notifications.map(notification => ({
                    ...notification,
                    is_read: true
                })));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-base-100 p-4">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-base-200 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <Link
                                href={notification.link || '#'}
                                key={notification.id}
                                className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                                onClick={() => handleNotificationClick(notification.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    {notification.sender && (
                                        <ProfileImage
                                            user={notification.sender}
                                            size="md"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">{notification.content}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()} at {' '}
                                            {new Date(notification.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 