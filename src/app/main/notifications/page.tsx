"use client";
import React, { useState } from 'react';
import { FiBell, FiCheck, FiTrash2, FiUser, FiMail, FiAlertCircle, FiHeart } from 'react-icons/fi';
import { Button } from '@/components';
import { cn } from '@/lib/styles';

interface Notification {
    id: string;
    type: 'profile' | 'username' | 'email' | 'activity' | 'reminder';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    icon?: React.ReactNode;
    actionText?: string;
    actionUrl?: string;
}

// Dummy notification data
const DUMMY_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'profile',
        title: 'Complete Your Profile',
        message: 'Your profile is 40% complete. Add a bio and birthday to help others know you better.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isRead: false,
        icon: <FiUser className="w-5 h-5" />,
        actionText: 'Complete Profile',
        actionUrl: '/main/profile/edit',
    },
    {
        id: '2',
        type: 'username',
        title: 'Update Your Username',
        message: 'Consider using a memorable username to make it easier for others to find you.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        isRead: false,
        icon: <FiAlertCircle className="w-5 h-5" />,
        actionText: 'Change Username',
        actionUrl: '/main/profile/edit',
    },
    {
        id: '3',
        type: 'email',
        title: 'Verify Your Email Address',
        message: 'Please verify your email address to secure your account and enable all features.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isRead: false,
        icon: <FiMail className="w-5 h-5" />,
        actionText: 'Verify Email',
    },
    {
        id: '4',
        type: 'activity',
        title: 'Someone Liked Your Report',
        message: 'Sarah liked your report about the potholes on Main Street.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        icon: <FiHeart className="w-5 h-5 text-red-500" />,
    },
    {
        id: '5',
        type: 'reminder',
        title: 'Add Profile Picture',
        message: 'Your profile doesn\'t have a picture yet. Upload one to make your profile stand out.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        icon: <FiUser className="w-5 h-5" />,
        actionText: 'Upload Picture',
        actionUrl: '/main/profile/edit',
    },
    {
        id: '6',
        type: 'activity',
        title: 'Your Report Was Marked as Resolved',
        message: 'The broken streetlight you reported at Oak Park has been marked as resolved.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true,
        icon: <FiCheck className="w-5 h-5 text-green-500" />,
    },
];

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const iconClasses = 'w-5 h-5';
    switch (type) {
        case 'profile':
        case 'reminder':
            return <FiUser className={cn(iconClasses, 'text-sky-600')} />;
        case 'username':
            return <FiAlertCircle className={cn(iconClasses, 'text-amber-600')} />;
        case 'email':
            return <FiMail className={cn(iconClasses, 'text-sky-600')} />;
        case 'activity':
            return <FiBell className={cn(iconClasses, 'text-blue-600')} />;
        default:
            return <FiBell className={cn(iconClasses, 'text-gray-600')} />;
    }
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const NotificationCard: React.FC<{
    notification: Notification;
    onDelete: (id: string) => void;
    onMarkAsRead: (id: string) => void;
}> = ({ notification, onDelete, onMarkAsRead }) => {
    return (
        <div
            className={cn(
                'p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
                notification.isRead
                    ? 'border-gray-200 bg-white'
                    : 'border-sky-200 bg-sky-50/50'
            )}
        >
            <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                    <div className={cn(
                        'p-2 rounded-lg',
                        notification.isRead ? 'bg-gray-100' : 'bg-sky-100'
                    )}>
                        <NotificationIcon type={notification.type} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h3 className={cn(
                                'text-sm font-semibold',
                                notification.isRead ? 'text-gray-900' : 'text-gray-900'
                            )}>
                                {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-xs text-gray-500">
                                    {formatTimeAgo(notification.timestamp)}
                                </span>
                                {notification.actionText && (
                                    <a
                                        href={notification.actionUrl || '#'}
                                        className="text-xs font-medium text-sky-600 hover:text-sky-700 underline"
                                    >
                                        {notification.actionText}
                                    </a>
                                )}
                            </div>
                        </div>

                        {!notification.isRead && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-sky-500 mt-1" />
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                    {!notification.isRead && (
                        <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mark as read"
                        >
                            <FiCheck className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(notification.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete notification"
                    >
                        <FiTrash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const handleDeleteAll = () => {
        if (window.confirm('Are you sure you want to delete all notifications?')) {
            setNotifications([]);
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FiBell className="w-8 h-8 text-sky-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Notifications
                    </h1>
                </div>
                <p className="text-gray-600">
                    Stay updated with reminders and activity notifications
                </p>
            </div>

            {/* Filter and Actions */}
            {notifications.length > 0 && (
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                                filter === 'all'
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                'px-4 py-2 rounded-lg font-medium text-sm transition-colors relative',
                                filter === 'unread'
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-red-500 text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-sky-600 hover:text-sky-700"
                        >
                            Mark all as read
                        </Button>
                    )}

                    <button
                        onClick={handleDeleteAll}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                        Delete all
                    </button>
                </div>
            )}

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                    {filteredNotifications.map(notification => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onDelete={handleDelete}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiBell className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                    </h3>
                    <p className="text-gray-600">
                        {filter === 'unread'
                            ? 'You\'re all caught up! Check back later for updates.'
                            : 'You\'re all set. New notifications will appear here.'}
                    </p>
                </div>
            )}

            {/* Empty state tips */}
            {notifications.length === 0 && (
                <div className="mt-12 max-w-md mx-auto">
                    <div className="bg-sky-50 border border-sky-100 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Tips:</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>• Complete your profile to unlock more features</li>
                            <li>• Verify your email to secure your account</li>
                            <li>• Enable notifications to stay updated</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
