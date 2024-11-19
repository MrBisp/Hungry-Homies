'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ProfileImage from './ProfileImage';

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const handleNotificationClick = async (notificationId) => {
        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
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
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            const response = await fetch('/api/notifications');
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.is_read).length);
            }
        };

        if (session?.user) {
            fetchNotifications();
            // Poll for new notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const renderNotification = (notification) => {
        return (
            <Link
                href={notification.link || '#'}
                key={notification.id}
                className="block p-4 hover:bg-gray-50 border-b"
                onClick={() => handleNotificationClick(notification.id)}
            >
                <div className="flex items-center space-x-3">
                    {notification.sender?.image && (
                        <ProfileImage
                            user={notification.sender}
                            size="sm"
                        />
                    )}
                    <div>
                        <p className="text-sm text-gray-800">{notification.content}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(renderNotification)
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 