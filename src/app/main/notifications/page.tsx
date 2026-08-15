"use client";
import React, { useMemo, useState } from 'react';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiUser, FiMail, FiAlertCircle, FiHeart, FiX } from 'react-icons/fi';
import { Button, HeaderSection } from '@/components';
import { cn } from '@/lib/styles';
import { usePathname } from 'next/navigation';
import { useConfirmationModalStore } from '@/stores';

interface Notification {
    id: string;
    type: 'profile' | 'username' | 'email' | 'activity' | 'reminder';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionText?: string;
    actionUrl?: string;
}

// Dummy notification data
const DUMMY_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'profile',
        title: 'Lengkapi Profil Anda',
        message: 'Profil Anda baru 40% lengkap. Tambahkan bio dan tanggal lahir agar orang lain lebih mengenal Anda.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isRead: false,
        actionText: 'Lengkapi Profil',
        actionUrl: '/main/profile/edit',
    },
    {
        id: '2',
        type: 'username',
        title: 'Perbarui Username Anda',
        message: 'Gunakan username yang mudah diingat agar orang lain lebih mudah menemukan Anda.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isRead: false,
        actionText: 'Ubah Username',
        actionUrl: '/main/profile/edit',
    },
    {
        id: '3',
        type: 'email',
        title: 'Verifikasi Alamat Email',
        message: 'Verifikasi email Anda untuk mengamankan akun dan mengaktifkan semua fitur.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        isRead: false,
        actionText: 'Verifikasi Email',
    },
    {
        id: '4',
        type: 'activity',
        title: 'Seseorang Menyukai Laporan Anda',
        message: 'Sarah menyukai laporan Anda tentang jalan berlubang di Main Street.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRead: true,
    },
    {
        id: '5',
        type: 'reminder',
        title: 'Tambahkan Foto Profil',
        message: 'Profil Anda belum memiliki foto. Unggah satu agar profil Anda lebih menonjol.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: true,
        actionText: 'Unggah Foto',
        actionUrl: '/main/profile/edit',
    },
    {
        id: '6',
        type: 'activity',
        title: 'Laporan Anda Ditandai Selesai',
        message: 'Lampu jalan rusak yang Anda laporkan di Oak Park telah ditandai selesai.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isRead: true,
    },
];

const TYPE_STYLES: Record<Notification['type'], { icon: React.ReactNode; bg: string; ring: string }> = {
    profile: { icon: <FiUser className="w-[18px] h-[18px]" />, bg: 'bg-primary/10 text-primary', ring: 'ring-primary/15' },
    username: { icon: <FiAlertCircle className="w-[18px] h-[18px]" />, bg: 'bg-amber-500/10 text-amber-600', ring: 'ring-amber-500/15' },
    email: { icon: <FiMail className="w-[18px] h-[18px]" />, bg: 'bg-primary/10 text-primary', ring: 'ring-primary/15' },
    activity: { icon: <FiHeart className="w-[18px] h-[18px]" />, bg: 'bg-rose-500/10 text-rose-500', ring: 'ring-rose-500/15' },
    reminder: { icon: <FiUser className="w-[18px] h-[18px]" />, bg: 'bg-blue-500/10 text-blue-600', ring: 'ring-blue-500/15' },
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const getGroupLabel = (date: Date): string => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);

    if (diffDays <= 0) return 'Hari Ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return 'Minggu Ini';
    return 'Lebih Lama';
};

const NotificationCard: React.FC<{
    notification: Notification;
    onDelete: (id: string) => void;
    onMarkAsRead: (id: string) => void;
}> = ({ notification, onDelete, onMarkAsRead }) => {
    const style = TYPE_STYLES[notification.type];

    const handleDelete = () => {
        onDelete(notification.id);
    };

    return (
        <div
            role="listitem"
            className={cn(
                'group relative flex gap-3.5 rounded-xl border p-4 transition-all duration-200 ease-out',
                'hover:shadow-sm',
                notification.isRead
                    ? 'border-muted bg-white'
                    : 'border-primary/15 bg-primary/5'
            )}
        >
            {!notification.isRead && (
                <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-primary" />
            )}
            <div className="flex items-center gap-5 w-full justify-center">
                <div className={cn('flex items-center justify-center w-10 h-10 rounded-full ring-1', style.bg, style.ring)}>
                    {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-surface leading-snug">
                            {notification.title}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.actionText && (
                            <>
                                <span className="text-gray-500">•</span>
                                <a
                                    href={notification.actionUrl || '#'}
                                    className="text-xs font-medium text-primary hover:text-primary-hover hover:underline underline-offset-2"
                                >
                                    {notification.actionText}
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ">
                {!notification.isRead && (
                    <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        title="Tandai sudah dibaca"
                        aria-label="Tandai sudah dibaca"
                    >
                        <FiCheck className="w-4 h-4 text-primary" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                    title="Hapus notifikasi"
                    aria-label="Hapus notifikasi"
                >
                    <FiTrash2 className="w-4 h-4 text-danger" />
                </button>
            </div>
        </div>
    );
};

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);
    const currentPath = usePathname();
     const openConfirm = useConfirmationModalStore((s) => s.openConfirm);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const grouped = useMemo(() => {
        const groups = new Map<string, Notification[]>();
        for (const n of filteredNotifications) {
            const label = getGroupLabel(n.timestamp);
            if (!groups.has(label)) groups.set(label, []);
            groups.get(label)!.push(n);
        }
        return groups;
    }, [filteredNotifications]);

    const handleDeleteAllConfirmation = () => {
        openConfirm({
            type: "danger",
            title: "Konfirmasi Penghapusan",
            subtitle: "Apakah Anda yakin ingin menghapus semua notifikasi?",
            isPending: false,
            description: "Notifikasi yang dihapus tidak dapat dikembalikan.",
            confirmTitle: "Ya, Hapus",
            onConfirm: () => {
                handleDeleteAll();
            },
        });
    }

    const handleDeleteConfirmation = (id: string) => {
        openConfirm({
            type: "danger",
            title: "Konfirmasi Penghapusan",
            subtitle: "Apakah Anda yakin ingin menghapus notifikasi ini?",
            isPending: false,
            description: "Notifikasi yang dihapus tidak dapat dikembalikan.",
            confirmTitle: "Ya, Hapus",
            onConfirm: () => {
                handleDelete(id);
            },
        });
    }

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleDeleteAll = () => {
        setNotifications([]);
        setConfirmingDeleteAll(false);
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <HeaderSection
                    isCardHeader={false}
                    currentPath={currentPath}
                    showBreadcrumb={false}
                    message="Kelola dan pantau semua notifikasi Anda, mulai dari pengingat, aktivitas terbaru, hingga informasi penting yang perlu segera ditindaklanjuti."
                />
            </div>

            {/* Filter and Actions */}
            {notifications.length > 0 && (
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
                    <div className="flex gap-2 p-1 bg-muted/60 rounded-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                'px-4 py-1.5 rounded-lg font-medium text-sm transition-colors cursor-pointer',
                                filter === 'all'
                                    ? 'bg-white text-surface shadow-sm'
                                    : 'text-gray-500 hover:text-surface'
                            )}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                'flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm transition-colors cursor-pointer',
                                filter === 'unread'
                                    ? 'bg-white text-surface shadow-sm'
                                    : 'text-gray-500 hover:text-surface'
                            )}
                        >
                            Belum Dibaca
                            {unreadCount > 0 && (
                                <span className={cn(
                                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold rounded-full',
                                    filter === 'unread' ? 'bg-primary text-white' : 'bg-danger text-white'
                                )}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 sm:self-auto">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                onClick={handleMarkAllAsRead}
                                size="sm"
                                className="text-primary hover:text-primary-hover px-2 py-1.5 "
                                icon={<FiCheckCircle className="w-4 h-4" />}
                            >
                                Tandai semua dibaca
                            </Button>
                        )}
                        <Button
                            onClick={() => handleDeleteAllConfirmation()}
                            variant="ghost"
                            size="sm"
                            icon={<FiTrash2 className="w-4 h-4" />}
                            className="text-danger transition-colors px-2 py-1.5 focus:ring-danger"
                        >
                            Hapus semua
                        </Button>
                    </div>
                </div>
            )}

            {/* Notifications List, grouped by recency */}
            {filteredNotifications.length > 0 ? (
                <div className="space-y-6">
                    {Array.from(grouped.entries()).map(([label, items]) => (
                        <div key={label}>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2.5 px-0.5">
                                {label}
                            </h4>
                            <div role="list" className="space-y-2.5">
                                {items.map(notification => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onDelete={handleDeleteConfirmation}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <FiBell className="w-7 h-7 text-gray-500" />
                        </div>
                    </div>
                    <h3 className="text-base font-semibold text-surface mb-1">
                        {filter === 'unread' ? 'Semua sudah dibaca' : 'Belum ada notifikasi'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        {filter === 'unread'
                            ? 'Anda sudah membaca semua notifikasi. Kembali lagi nanti untuk pembaruan.'
                            : 'Notifikasi baru akan muncul di sini.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;