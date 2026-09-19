"use client";

import { HeaderSection } from '@/components';
import StaticMap from '@/components/UI/StaticMap';
import { useGetSavedReports } from '@/hooks';
import { useUserProfileStore } from '@/stores';
import { getImageURL } from '@/utils';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { IGetReportSaved } from '@/types';

interface SavedReportMiniCardProps {
    report: IGetReportSaved;
}

const SavedReportMiniCard: React.FC<SavedReportMiniCardProps> = ({ report }) => {
    const router = useRouter();

    const locationText = [report.reportState, report.reportCountry]
        .filter(Boolean)
        .join(', ') || 'Location unavailable';

    return (
        <div
            className="bg-white backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => router.push(`/main/reports/${report.reportID}`)}
        >
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                            <Image
                                src={getImageURL(report.profilePicture? report.profilePicture : '', 'user')}
                                alt="Report owner"
                                width={32}
                                height={32}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-gray-900 truncate">
                                {report.userName || report.fullName || 'Unknown User'}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 min-w-0">
                                <FaMapMarkerAlt className="text-primary" />
                                <span className="truncate">{locationText}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-[10px] font-bold text-primary rounded-full">
                            {report.reportType}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-600 rounded-full">
                            {report.reportStatus}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-3 pb-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">
                    {report.reportTitle}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 break-words">
                    {report.reportDescription}
                </p>
            </div>

            <div className="px-3 pb-3">
                <div className="relative w-full h-[230px] overflow-hidden bg-gray-100 rounded-lg shadow-sm">
                    <StaticMap
                        key={`map-${report.reportID}`}
                        latitude={report.reportLatitude}
                        longitude={report.reportLongitude}
                        height={230}
                        zoom={report.reportMapZoom || 15}
                        markerColor="red"
                        popupText={report.reportTitle}
                    />
                </div>
            </div>
        </div>
    );
};

const SavedReportsPage = () => {
    const currentPath = usePathname();
    const currentUser = useUserProfileStore((state) => state.userProfile);

    const {
        data: savedReports,
        isLoading: isSavedReportsLoading,
        isError: isSavedReportsError,
        fetchNextPage: fetchNextSavedReportsPage,
        hasNextPage: hasNextSavedReportsPage,
    } = useGetSavedReports(Number(currentUser?.userID) || 0);

    const reportsData: IGetReportSaved[] =
        (savedReports?.pages.flatMap((page) => page.data?.savedReports.savedReports) || []) as IGetReportSaved[];

    return (
        <div className="w-full">
            <div className="mb-8">
                <HeaderSection
                    isCardHeader={false}
                    currentPath={currentPath}
                    showBreadcrumb={true}
                    message={'You can view and manage your saved reports here.'}
                />
            </div>

            {isSavedReportsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-[260px] rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                </div>
            )}

            {!isSavedReportsLoading && isSavedReportsError && (
                <div className="text-sm text-gray-500 text-center py-12">
                    Failed to load your saved reports. Please try again.
                </div>
            )}

            {!isSavedReportsLoading && !isSavedReportsError && reportsData.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-12">
                    You haven&apos;t saved any reports yet.
                </div>
            )}

            {!isSavedReportsLoading && !isSavedReportsError && reportsData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportsData.map((report) => (
                        <SavedReportMiniCard key={report.reportSavedID} report={report} />
                    ))}
                </div>
            )}

            {/* {hasNextSavedReportsPage && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => fetchNextSavedReportsPage()}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        Load more
                    </button>
                </div>
            )} */}
        </div>
    );
};

export default SavedReportsPage;