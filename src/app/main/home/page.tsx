/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from 'react'
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

const Map = dynamic(() => import('@/components/UI/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-muted animate-pulse rounded-lg"></div>
});

const Homepage = () => {
    const currentPath = usePathname();
    const router = useRouter();
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
    useErrorToast(isErrorNotifications, errorNotifications || 'Gagal memuat aktivitas terbaru.');

    const isReportStatisticServerError = isInternalServerError(errorReportStatistics);
    const isUserStatisticServerError = isInternalServerError(errorUserStatistics);

    const totalReports = reportStatisticsData?.data?.totalReports || 0;
    const totalActiveReports = (reportStatisticsData?.data?.reportsByStatus["ON_PROGRESS"] || 0) + (reportStatisticsData?.data?.reportsByStatus["WAITING"] || 0);
    const today = Date.now();
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

    const StatCardSkeleton = () => (
        <div className={loadingWrapClass}>
            <Loading type="dots" text="Memuat..." />
        </div>
    );

    return (
        <div>
            <HeaderSection 
            currentPath={currentPath}
            isCardHeader={false}
            showBreadcrumb={false}
            message='Kelola laporan dan pantau kondisi lingkungan sekitar Anda secara real-time.'>
                <Button
                icon={<BiPlus className="w-5 h-5" />}
                onClick={() => router.push('/main/reports/create-report')}
                className='px-6 py-4'
                >
                    <span>Buat Laporan</span>
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
                            <StatCardSkeleton />
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>Total Laporan</p>
                                    <p className={valueClass}>{totalReports} Laporan</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <GoAlert className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card>
                        {loadingReportStatistics ? (
                            <StatCardSkeleton />
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>Total Laporan Aktif</p>
                                    <p className={valueClass}>{totalActiveReports} Laporan</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <IoMdPulse className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card>
                        {loadingReportStatistics ? (
                            <StatCardSkeleton />
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>Total Laporan Bulan Ini</p>
                                    <p className={valueClass}>{totalReportsThisMonth} Laporan</p>
                                </div>
                                <div className={iconWrapClass}>
                                    <MdCalendarMonth className={iconClass} />
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card>
                        {loadingUserStatistics ? (
                            <StatCardSkeleton />
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={labelClass}>Total Pengguna Aktif</p>
                                    <p className={valueClass}>{totalUsers} Pengguna</p>
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
                                    Lokasi Anda
                                </h2>
                                {location?.lastUpdated && (
                                    <p className="text-xs text-surface/70 mt-1">
                                        Diperbarui {getRelativeTime(location.lastUpdated)}
                                    </p>
                                )}
                            </div>
                            {location !== null && (
                                <Button 
                                size='sm'
                                isLoading={loadingRequestLocation}
                                loadingText='Memperbarui...'
                                onClick={() => {
                                    requestLocation(true)
                                }}>
                                    Perbarui Lokasi
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
                                        emptyTitle='Lokasi tidak tersedia'
                                        emptyMessage='Untuk menampilkan laporan di sekitar Anda, izinkan aplikasi mengakses lokasi Anda.'
                                        emptyIcon={<RxCrossCircled />}
                                        showCommandButton={true}
                                        commandLabel='Deteksi Lokasi'
                                        commandLoading={loadingRequestLocation}
                                        commandIcon={<FaLocationDot/>}
                                        commandLoadingMessage='Mendeteksi...'
                                        onCommandButton={() => {requestLocation()}}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                    <Card className="flex h-full flex-col">
                        <div className="mb-4 flex shrink-0 items-center justify-between">
                            <h2 className="text-xl font-semibold text-surface flex items-center gap-2">
                                Aktivitas Terbaru
                            </h2>
                            <Link
                                href="/main/notifications"
                                className="text-sm font-medium text-primary hover:text-primary-hover hover:underline underline-offset-2"
                            >
                                {recentNotifications.length > 0 && 'Lihat Semua'}
                            </Link>
                        </div>
                        {loadingNotifications ? (
                            <Loading type="dots" text="Memuat aktivitas..." />
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
                                    emptyTitle="Belum ada aktivitas terbaru"
                                    emptyMessage='Aktivitas terbaru akan muncul di sini ketika ada pembaruan terkait laporan atau akun Anda.'
                                    emptyIcon={<FiBell />}
                                    className=''
                                    showCommandButton={true}
                                    commandLoadingMessage='Memuat...'
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