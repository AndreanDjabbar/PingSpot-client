/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useMemo, useState } from 'react';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiUser, FiMail, FiAlertCircle, FiHeart } from 'react-icons/fi';
import { Button, EmptyState, ErrorSection, HeaderSection } from '@/components';
import { cn } from '@/lib/styles';
import { usePathname, useRouter } from 'next/navigation';
import { useConfirmationModalStore } from '@/stores';
import { useDeleteAllNotifications, useDeleteNotification, useErrorToast, useGetNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '@/hooks';
import { getErrorResponseMessage, isInternalServerError } from '@/utils';

export interface INotification {
    id: number;
    userID: number;
    type: 'INFO' | 'WARNING' | 'ERROR';
    category: 'GENERAL' | 'REPORT' | 'USER';
    entityType: 'POST' | 'COMMENT' | 'USER' | 'REPORT' | 'COMMUNITY';
    title: string;
    description: string;
    isRead: boolean;
    readAt?: number;
    createdAt: number;
    entityID?: number;
}

const ENTITY_ICON: Record<INotification['entityType'], React.ReactNode> = {
    POST: <FiBell className="w-[18px] h-[18px]" />,
    COMMENT: <FiMail className="w-[18px] h-[18px]" />,
    USER: <FiUser className="w-[18px] h-[18px]" />,
    REPORT: <FiAlertCircle className="w-[18px] h-[18px]" />,
    COMMUNITY: <FiHeart className="w-[18px] h-[18px]" />,
};

const SEVERITY_STYLE: Record<INotification['type'], { bg: string; ring: string }> = {
    INFO: { bg: 'bg-primary/10 text-primary', ring: 'ring-primary/15' },
    WARNING: { bg: 'bg-amber-500/10 text-amber-600', ring: 'ring-amber-500/15' },
    ERROR: { bg: 'bg-rose-500/10 text-rose-500', ring: 'ring-rose-500/15' },
};

const toDate = (ts: number): Date => (ts < 1e12 ? new Date(ts * 1000) : new Date(ts));

const getActionUrl = (entityType: INotification['entityType'], entityID?: number): string | undefined => {
    if (entityID === undefined) return undefined;
    switch (entityType) {
        case 'POST': return `/main/posts/${entityID}`;
        case 'COMMENT': return `/main/posts/${entityID}#comments`;
        case 'USER': return `/main/profile/${entityID}`;
        case 'REPORT': return `/main/reports/${entityID}`;
        case 'COMMUNITY': return `/main/community/${entityID}`;
        default: return undefined;
    }
};

const getActionText = (entityType: INotification['entityType']): string => {
    switch (entityType) {
        case 'POST': return 'Lihat Postingan';
        case 'COMMENT': return 'Lihat Komentar';
        case 'USER': return 'Lihat Profil';
        case 'REPORT': return 'Lihat Laporan';
        case 'COMMUNITY': return 'Lihat Komunitas';
        default: return 'Lihat Detail';
    }
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
    notification: INotification;
    onDelete: (id: number) => void;
    onMarkAsRead: (id: number) => void;
    isMarkingAsRead?: boolean;
    isDeletingNotification?: boolean;
}> = ({ 
    notification, 
    onDelete, 
    onMarkAsRead, 
    isMarkingAsRead,
    isDeletingNotification
}) => {
    const style = SEVERITY_STYLE[notification.type];
    const icon = ENTITY_ICON[notification.entityType];
    const actionUrl = getActionUrl(notification.entityType, notification.entityID);
    const actionText = actionUrl ? getActionText(notification.entityType) : undefined;

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
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-surface leading-snug">
                            {notification.title}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notification.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-xs text-gray-500">
                            {formatTimeAgo(toDate(notification.createdAt))}
                        </span>
                        {actionText && (
                            <>
                                <span className="text-gray-500">•</span>
                                <a
                                    href={actionUrl}
                                    className="text-xs font-medium text-primary hover:text-primary-hover hover:underline underline-offset-2"
                                >
                                    {actionText}
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ">
                {!notification.isRead && (
                    <button
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={isMarkingAsRead}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Tandai sudah dibaca"
                        aria-label="Tandai sudah dibaca"
                    >
                        <FiCheck className="w-4 h-4 text-primary" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                    disabled={isDeletingNotification}
                    title="Hapus notifikasi"
                    aria-label="Hapus notifikasi"
                >
                    <FiTrash2 className="w-4 h-4 text-danger" />
                </button>
            </div>
        </div>
    );
};

const NotificationCardSkeleton: React.FC = () => (
    <div className="flex gap-3.5 rounded-xl border border-muted bg-white p-4">
        <div className="flex items-center gap-5 w-full">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3.5 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse mt-2.5" />
            </div>
        </div>
    </div>
);

const Skeleton: React.FC = () => (
    <div className="w-full">
        <div className="mb-8 space-y-2">
            <div className="h-6 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full max-w-lg rounded bg-muted animate-pulse" />
        </div>

        <div className="mb-6 flex items-center justify-between gap-10">
            <div className="h-9 w-48 rounded-xl bg-muted animate-pulse" />
            <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
        </div>

        <div className="space-y-6">
            {[0, 1].map((group) => (
                <div key={group}>
                    <div className="h-3 w-20 rounded bg-muted animate-pulse mb-2.5" />
                    <div className="space-y-2.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <NotificationCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const NotificationsPage: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const currentPath = usePathname();
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const router = useRouter();

    const {
        isPending: isFetchingNotifications,
        isError: isErrorFetchingNotifications,
        error: errorFetchingNotifications,
        refetch: refetchNotifications,
        data: notificationsDataResponse
    } = useGetNotifications();

    const {
        isPending: isMarkingAsRead,
        isError: isErrorMarkingAsRead,
        error: errorMarkingAsRead,
        mutate: markAsReadMutation,
        variables: markAsReadVariables,
    } = useMarkNotificationAsRead();

    const {
        isPending: isMarkingAllAsRead,
        isError: isErrorMarkingAllAsRead,
        error: errorMarkingAllAsRead,
        mutate: markAllAsReadMutation,
    } = useMarkAllNotificationsAsRead();

    const {
        isPending: isDeletingNotification,
        isError: isErrorDeletingNotification,
        error: errorDeletingNotification,
        mutate: deleteNotificationMutation,
    } = useDeleteNotification();

    const {
        isPending: isDeletingAllNotifications,
        isError: isErrorDeletingAllNotifications,
        error: errorDeletingAllNotifications,
        mutate: deleteAllNotificationsMutation,
    } = useDeleteAllNotifications();

    const notificationsData = notificationsDataResponse?.data?.notifications || [];
    const unreadCount = notificationsData.filter(n => !n.isRead).length || 0;
    const filteredNotifications = filter === 'unread'
        ? notificationsData.filter(n => !n.isRead)
        : notificationsData;

    const grouped = useMemo(() => {
        const groups = new Map<string, INotification[]>();
        for (const n of filteredNotifications || []) {
            const label = getGroupLabel(toDate(n.createdAt));
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

    const handleDeleteConfirmation = (id: number) => {
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

    const handleDelete = (id: number) => {
        deleteNotificationMutation(id);
    };

    const handleMarkAsRead = (id: number) => {
        markAsReadMutation(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation();
    };

    const handleDeleteAll = () => {
        deleteAllNotificationsMutation();
    };

    useErrorToast(isErrorFetchingNotifications, errorFetchingNotifications || "Gagal memuat data notifikasi.");
    useErrorToast(isErrorMarkingAsRead, errorMarkingAsRead || "Gagal menandai notifikasi sebagai sudah dibaca.");
    useErrorToast(isErrorMarkingAllAsRead, errorMarkingAllAsRead || "Gagal menandai semua notifikasi sebagai sudah dibaca.");
    useErrorToast(isErrorDeletingNotification, errorDeletingNotification || "Gagal menghapus notifikasi.");
    useErrorToast(isErrorDeletingAllNotifications, errorDeletingAllNotifications || "Gagal menghapus semua notifikasi.");

    if (isFetchingNotifications) {
        return <Skeleton />;
    }

    if (isErrorFetchingNotifications) {
        const isServerError = isInternalServerError(errorFetchingNotifications);

        return (
        <ErrorSection
            errors={getErrorResponseMessage(errorFetchingNotifications)}
            message={getErrorResponseMessage(errorFetchingNotifications)}
            onGoBack={() => router.back()}
            onGoHome={() => router.push("/main/home")}
            onRetry={() => refetchNotifications()}
            showRetryButton={isServerError}
        />
        );
    }
    if (isErrorMarkingAsRead) {
        const isServerError = isInternalServerError(errorMarkingAsRead);

        return (
            <ErrorSection
                errors={getErrorResponseMessage(errorMarkingAsRead)}
                message={getErrorResponseMessage(errorMarkingAsRead)}
                onGoBack={() => router.back()}
                onGoHome={() => router.push("/main/home")}
                showRetryButton={isServerError}
            />
        );
    }

    if (isErrorMarkingAllAsRead) {
        const isServerError = isInternalServerError(errorMarkingAllAsRead);

        return (
            <ErrorSection
                errors={getErrorResponseMessage(errorMarkingAllAsRead)}
                message={getErrorResponseMessage(errorMarkingAllAsRead)}
                onGoBack={() => router.back()}
                onGoHome={() => router.push("/main/home")}
                showRetryButton={isServerError}
            />
        );
    }

    if (isErrorDeletingNotification) {
        const isServerError = isInternalServerError(errorDeletingNotification);

        return (
            <ErrorSection
                errors={getErrorResponseMessage(errorDeletingNotification)}
                message={getErrorResponseMessage(errorDeletingNotification)}
                onGoBack={() => router.back()}
                onGoHome={() => router.push("/main/home")}
                showRetryButton={isServerError}
            />
        );
    }

    if (isErrorDeletingAllNotifications) {
        const isServerError = isInternalServerError(errorDeletingAllNotifications);

        return (
            <ErrorSection
                errors={getErrorResponseMessage(errorDeletingAllNotifications)}
                message={getErrorResponseMessage(errorDeletingAllNotifications)}
                onGoBack={() => router.back()}
                onGoHome={() => router.push("/main/home")}
                showRetryButton={isServerError}
            />
        );
    }

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
            {notificationsData.length > 0 && (
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
                                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold rounded-full bg-danger text-white',
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
                                disabled={isMarkingAllAsRead}
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
                            disabled={isDeletingAllNotifications}
                            size="sm"
                            icon={<FiTrash2 className="w-4 h-4" />}
                            className="text-danger transition-colors px-2 py-1.5 focus:ring-danger"
                        >
                            Hapus semua
                        </Button>
                    </div>
                </div>
            )}

            {filteredNotifications?.length > 0 ? (
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
                                        isDeletingNotification={isDeletingNotification && notification.id === markAsReadVariables}
                                        onMarkAsRead={handleMarkAsRead}
                                        isMarkingAsRead={isMarkingAsRead && markAsReadVariables === notification.id}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex justify-center mt-30 text-center">
                    <EmptyState
                        emptyTitle={filter === 'unread' ? 'Semua sudah dibaca' : 'Belum ada notifikasi'}
                        emptyMessage={filter === 'unread'
                            ? 'Anda sudah membaca semua notifikasi. Kembali lagi nanti untuk pembaruan.'
                            : 'Notifikasi baru akan muncul di sini.'}
                        emptyIcon={<FiBell />}
                        className=''
                        showCommandButton={true}
                        commandLoadingMessage='Memuat notifikasi...'
                    />
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;