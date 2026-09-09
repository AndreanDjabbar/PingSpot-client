"use client";
import React, { useState } from 'react'
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BiPlus } from 'react-icons/bi'
import { FaUser } from 'react-icons/fa'
import { GoAlert } from 'react-icons/go'
import { FiBell } from 'react-icons/fi';
import { useLocationStore } from '@/stores';
import { cn } from '@/lib/styles';
import { Button, EmptyState, Loading, ErrorSection, HeaderSection } from '@/components';
import { RxCrossCircled } from 'react-icons/rx';
import { FaLocationDot } from 'react-icons/fa6';
import { useCurrentLocation, useGetNotifications, useGetReportStatistics, useErrorToast, useGetUserStatistics } from '@/hooks';
import { getErrorResponseMessage, getFormattedDate, getRelativeTime, isInternalServerError } from '@/utils';
import { IoMdPulse } from 'react-icons/io';
import { MdCalendarMonth } from 'react-icons/md';
import Card from '@/components/UI/Card';
import { useTranslations } from 'next-intl';

const Map = dynamic(() => import('@/components/UI/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-muted animate-pulse rounded-lg"></div>
});

const Homepage = () => {
    const currentPath = usePathname();
    const router = useRouter();
    const t = useTranslations('home');
    const location = useLocationStore((state) => state.location);
    const { 
        requestLocation, 
        loading: loadingRequestLocation, 
        permissionDenied, 
        isPermissionDenied, 
    } = useCurrentLocation();

    const {
        data: reportStatisticsData,
        isLoading: loadingReportStatistics,
        isError: isErrorReportStatistics,
        refetch: refetchReportStatistics,
        error: errorReportStatistics
    } = useGetReportStatistics();

    const {
        data: userStatisticsData,
        isLoading: loadingUserStatistics,
        refetch: refetchUserStatistics,
        isError: isErrorUserStatistics,
        error: errorUserStatistics
    } = useGetUserStatistics();

    const {
        data: notificationsDataResponse,
        isLoading: loadingNotifications,
        isError: isErrorNotifications,
        error: errorNotifications,
    } = useGetNotifications();

    useErrorToast(isPermissionDenied, permissionDenied);
    useErrorToast(isErrorNotifications, errorNotifications || t('activity_card.load_error'));

    const isReportStatisticServerError = isInternalServerError(errorReportStatistics);
    const isUserStatisticServerError = isInternalServerError(errorUserStatistics);

    const totalReports = reportStatisticsData?.data?.totalReports || 0;
    const totalActiveReports = (reportStatisticsData?.data?.reportsByStatus["ON_PROGRESS"] || 0) + (reportStatisticsData?.data?.reportsByStatus["WAITING"] || 0);
    const [today] = useState(() => Date.now());
    const thisMonth = getFormattedDate(today, {
        formatStr: 'yyyy-MM',
    });
    const totalReportsThisMonth = reportStatisticsData?.data?.monthlyReportCounts[thisMonth] || 0;
    const totalUsers = userStatisticsData?.data?.totalUsers || 0;
    const notifications = notificationsDataResponse?.data?.notifications || [];
    const recentNotifications = [...notifications]
        .sort((first, second) => second.createdAt - first.createdAt)
        .slice(0, 5);
    
    const labelClass = "text-sm font-medium text-surface/70 mb-1";
    const valueClass = "text-xl font-bold text-surface";
    const iconWrapClass = "p-3 rounded-lg bg-primary";
    const iconClass = "w-6 h-6 text-white";
    const loadingWrapClass = "pt-3";

    const reportErrorSection = (
        <ErrorSection 
        errors={errorReportStatistics}
        message={getErrorResponseMessage(errorReportStatistics)}
        onRetry={() => refetchReportStatistics}
        showRetryButton={isReportStatisticServerError}
        />
    ) 

    const userErrorSection = (
        <ErrorSection 
        errors={errorUserStatistics}
        message={getErrorResponseMessage(errorUserStatistics)}
        onRetry={() => refetchUserStatistics}
        showRetryButton={isUserStatisticServerError}
        />
    ) 

    const renderStatCardSkeleton = () => (
        <div className={loadingWrapClass}>
            <Loading type="dots" text={t('loading')} />
        </div>
    );

    return (
        <div>
            <HeaderSection 
            currentPath={currentPath}
            isCardHeader={false}
            showBreadcrumb={false}
            message={t('description')}>
                <Button
                icon={<BiPlus className="w-5 h-5" />}
                onClick={() => router.push('/main/reports/create-report')}
                className='px-6 py-4'
                >
                    <span>{t('create_report')}</span>
                </Button>
            </HeaderSection>
            <div className="space-y-8">
                <div className='flex w-full justify-between gap-10'>
                    {isErrorReportStatistics && (
                        <div className='w-1/2'>
                            {reportErrorSection}
                        </div>
                    )}
                    {isErrorUserStatistics && (
                        <div className='w-1/2'>
                            {userErrorSection}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        {loadingReportStatistics ? (
                            renderStatCardSkeleton()
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>{t('stats.total_reports.label')}</p>
                                    <p className={valueClass}>{totalReports} {t('stats.total_reports.unit')}</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <GoAlert className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card>
                        {loadingReportStatistics ? (
                            renderStatCardSkeleton()
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>{t('stats.total_active_reports.label')}</p>
                                    <p className={valueClass}>{totalActiveReports} {t('stats.total_active_reports.unit')}</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <IoMdPulse className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card>
                        {loadingReportStatistics ? (
                            renderStatCardSkeleton()
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>{t('stats.total_reports_this_month.label')}</p>
                                    <p className={valueClass}>{totalReportsThisMonth} {t('stats.total_reports_this_month.unit')}</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <MdCalendarMonth className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card>
                        {loadingUserStatistics ? (
                            renderStatCardSkeleton()
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>{t('stats.total_active_users.label')}</p>
                                    <p className={valueClass}>{totalUsers} {t('stats.total_active_users.unit')}</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <FaUser className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="">
                        <div className='flex justify-between items-center mb-4'>
                            <div className='flex flex-col'>
                                <h2 className="text-xl font-semibold text-surface">
                                    {t('location_card.title')}
                                </h2>
                                {location?.lastUpdated && (
                                    <p className="text-xs text-surface/70 mt-1">
                                        {t('location_card.updated_at', { time: getRelativeTime(location.lastUpdated) })}
                                    </p>
                                )}
                            </div>
                            {location !== null && (
                                <Button 
                                size='sm'
                                isLoading={loadingRequestLocation}
                                loadingText={t('location_card.updating')}
                                onClick={() => {
                                    requestLocation(true)
                                }}>
                                    {t('location_card.update_button')}
                                </Button>
                            )}
                        </div>
                        {location !== null ? (
                            <div className="space-y-4 h-full">
                                <div className='h-full'>
                                    <Map 
                                    latitude={Number(location?.lat)}
                                    height={400}
                                    longitude={Number(location?.lng)}
                                    />
                                </div>
                            </div>

                        ) : (
                            <div className="space-y-4 h-full">
                                <div className='h-full'>
                                    <EmptyState
                                        emptyTitle={t('location_card.empty.title')}
                                        emptyMessage={t('location_card.empty.message')}
                                        emptyIcon={<RxCrossCircled />}
                                        showCommandButton={true}
                                        commandLabel={t('location_card.empty.command_label')}
                                        commandLoading={loadingRequestLocation}
                                        commandIcon={<FaLocationDot/>}
                                        commandLoadingMessage={t('location_card.empty.command_loading')}
                                        onCommandButton={() => {requestLocation()}}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                    <Card className="flex h-full flex-col">
                        <div className="mb-4 flex shrink-0 items-center justify-between">
                            <h2 className="text-xl font-semibold text-surface flex items-center gap-2">
                                    {t('activity_card.title')}
                            </h2>
                            <Link
                                href="/main/notifications"
                                className="text-sm font-medium text-primary hover:text-primary-hover hover:underline underline-offset-2"
                            >
                                {recentNotifications.length > 0 && t('activity_card.view_all')}
                            </Link>
                        </div>
                        {loadingNotifications ? (
                            <Loading type="dots" text={t('activity_card.loading')} />
                        ) : recentNotifications.length > 0 ? (
                            <div
                                className={cn(
                                    'divide-y divide-muted/60 mt-6',
                                    recentNotifications.length === 5 && 'grid flex-1 grid-rows-5'
                                )}
                                role="list"
                            >
                                {recentNotifications.map((notification) => (
                                    <Link
                                        key={notification.id}
                                        href="/main/notifications"
                                        role="listitem"
                                        className="group flex min-h-0 items-start gap-3 px-1 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-primary/3"
                                    >
                                        <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                                            notification.isRead ? 'bg-muted' : 'bg-primary'
                                        }`} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-surface transition-colors group-hover:text-primary">
                                                {notification.title}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-surface/70">
                                                {notification.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center mt-15 text-center">
                                <EmptyState
                                    emptyTitle={t('activity_card.empty.title')}
                                    emptyMessage={t('activity_card.empty.message')}
                                    emptyIcon={<FiBell />}
                                    className=''
                                    showCommandButton={true}
                                    commandLoadingMessage={t('activity_card.empty.command_loading')}
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Homepage