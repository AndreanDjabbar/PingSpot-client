"use client";
import React, { useMemo, useState } from 'react';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiUser, FiMail, FiAlertCircle, FiHeart } from 'react-icons/fi';
import { Button, EmptyState, ErrorSection, HeaderSection } from '@/components';
import { cn } from '@/lib/styles';
import { usePathname, useRouter } from 'next/navigation';
import { useConfirmationModalStore } from '@/stores';
import { useDeleteAllNotifications, useDeleteNotification, useErrorToast, useGetNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '@/hooks';
import { getErrorResponseMessage, isInternalServerError } from '@/utils';
import { useLocale, useTranslations } from 'next-intl';

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

const getGroupLabel = (date: Date, translate: (key: string) => string): string => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);

    if (diffDays <= 0) return translate('group_labels.today');
    if (diffDays === 1) return translate('group_labels.yesterday');
    if (diffDays < 7) return translate('group_labels.this_week');
    return translate('group_labels.older');
};

const getApiNotificationKind = (notification: INotification): 'reaction' | 'vote' | 'comment' | 'follow' | 'reply' | null => {
    if (notification.entityType === 'COMMENT') {
        return /membalas|replied|reply/i.test(`${notification.title} ${notification.description}`)
            ? 'reply'
            : 'comment';
    }
    if (notification.entityType === 'REPORT') return 'vote';
    if (notification.entityType === 'USER') {
        return notification.category === 'USER' ? 'follow' : 'reaction';
    }
    return null;
};

const getNotificationUsername = (description: string): string => {
    const match = description.match(/^(?:Pengguna|User)\s+(.+?)\s+(?:memberikan|mengomentari|membalas|mulai|reacted|commented|replied|started)/i);
    return match?.[1] || '';
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
    const t = useTranslations('notifications');
    const apiT = useTranslations('api.notification');
    const locale = useLocale();
    const [today] = useState(() => Date.now());
    const style = SEVERITY_STYLE[notification.type];
    const icon = ENTITY_ICON[notification.entityType];
    const actionUrl = getActionUrl(notification.entityType, notification.entityID);
    const actionText = actionUrl ? t(`action_text.${notification.entityType}`) : undefined;
    const notificationKind = getApiNotificationKind(notification);
    const actorName = getNotificationUsername(notification.description);
    const notificationTitle = notificationKind
        ? apiT(`${notificationKind}.title`)
        : notification.title;
    const notificationDescription = notificationKind
        ? apiT(`${notificationKind}.body`, { username: actorName })
        : notification.description;
    const date = toDate(notification.createdAt);
    const diffInSeconds = Math.floor((today - date.getTime()) / 1000);
    const timeAgo = diffInSeconds < 60
        ? t('time_ago.just_now')
        : diffInSeconds < 3600
            ? t('time_ago.minutes', { count: Math.floor(diffInSeconds / 60) })
            : diffInSeconds < 86400
                ? t('time_ago.hours', { count: Math.floor(diffInSeconds / 3600) })
                : diffInSeconds < 604800
                    ? t('time_ago.days', { count: Math.floor(diffInSeconds / 86400) })
                    : date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });

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
                            {notificationTitle}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notificationDescription}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-xs text-gray-500">
                            {timeAgo}
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
                        title={t('actions.mark_as_read')}
                        aria-label={t('actions.mark_as_read')}
                    >
                        <FiCheck className="w-4 h-4 text-primary" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                    disabled={isDeletingNotification}
                    title={t('actions.delete')}
                    aria-label={t('actions.delete')}
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
    const t = useTranslations('notifications');
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
            const label = getGroupLabel(toDate(n.createdAt), t);
            if (!groups.has(label)) groups.set(label, []);
            groups.get(label)!.push(n);
        }
        return groups;
    }, [filteredNotifications, t]);

    const handleDeleteAllConfirmation = () => {
        openConfirm({
            type: "danger",
            title: t('delete_all_modal.title'),
            subtitle: t('delete_all_modal.subtitle'),
            isPending: false,
            description: t('delete_all_modal.description'),
            confirmTitle: t('delete_all_modal.confirm'),
            onConfirm: () => {
                handleDeleteAll();
            },
        });
    }

    const handleDeleteConfirmation = (id: number) => {
        openConfirm({
            type: "danger",
            title: t('delete_one_modal.title'),
            subtitle: t('delete_one_modal.subtitle'),
            isPending: false,
            description: t('delete_one_modal.description'),
            confirmTitle: t('delete_one_modal.confirm'),
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

    useErrorToast(isErrorFetchingNotifications, errorFetchingNotifications || t('errors.fetch_failed'));
    useErrorToast(isErrorMarkingAsRead, errorMarkingAsRead || t('errors.mark_read_failed'));
    useErrorToast(isErrorMarkingAllAsRead, errorMarkingAllAsRead || t('errors.mark_all_read_failed'));
    useErrorToast(isErrorDeletingNotification, errorDeletingNotification || t('errors.delete_failed'));
    useErrorToast(isErrorDeletingAllNotifications, errorDeletingAllNotifications || t('errors.delete_all_failed'));

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
                    message={t('description')}
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
                            {t('filters.all')}
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
                            {t('filters.unread')}
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
                                {t('actions.mark_all_read')}
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
                            {t('actions.delete_all')}
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
                        emptyTitle={filter === 'unread' ? t('empty.all_read.title') : t('empty.no_notifications.title')}
                        emptyMessage={filter === 'unread'
                            ? t('empty.all_read.message')
                            : t('empty.no_notifications.message')}
                        emptyIcon={<FiBell />}
                        className=''
                        showCommandButton={true}
                        commandLoadingMessage={t('empty.command_loading')}
                    />
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;