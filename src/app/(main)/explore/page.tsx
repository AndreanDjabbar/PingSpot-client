"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ExploreSearch, ExploreSearchNonModal } from './components';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { HeaderSection } from '@/components/layouts/HeaderSection';
import { useSearchUsers } from '@/hooks/api/useUser';
import { useSearchReports } from '@/hooks/api/useReport';

const ExplorePage = () => {
    const currentPath = usePathname();
    const t = useTranslations('explore');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchNonModalOpen, setIsSearchNonModalOpen] = useState(false);

    const isSearchEnabled = searchTerm.trim().length >= 3;

    const {
        data: searchUsersData,
        fetchNextPage: fetchNextSearchUsersPage,
        hasNextPage: hasNextSearchUsersPage,
        isFetching: isFetchingSearchUsers,
        isLoading: isLoadingSearchUsers,
        isError: isErrorSearchUsers,
        error: errorSearchUsers,
        refetch: refetchSearchUsers
    } = useSearchUsers(searchTerm, isSearchEnabled);

    const {
        data: searchReportsData,
        fetchNextPage: fetchNextSearchReportsPage,
        hasNextPage: hasNextSearchReportsPage,
        isFetching: isFetchingSearchReports,
        isLoading: isLoadingSearchReports,
        isError: isErrorSearchReports,
        error: errorSearchReports,
        refetch: refetchSearchReports
    } = useSearchReports(searchTerm, isSearchEnabled);

    const usersData = searchUsersData?.pages.flatMap(page => page.data?.usersData?.usersData || []) || [];
    const reportsData = searchReportsData?.pages.flatMap(page => page.data?.reportsData?.reportsData || []) || [];

    const flattenedSearchData = {
        usersData: {
            users: usersData,
            type: "users"
        },
        reportsData: {
            reports: reportsData,
            type: "reports"
        },
    };

    const hasNextPage = !!(hasNextSearchUsersPage || hasNextSearchReportsPage);
    const isFetching = isFetchingSearchUsers || isFetchingSearchReports;
    const isLoading = isLoadingSearchUsers || isLoadingSearchReports;
    const isError = isErrorSearchUsers || isErrorSearchReports;
    const error = errorSearchUsers || errorSearchReports;

    const fetchNextPage = () => {
        if (hasNextSearchUsersPage) fetchNextSearchUsersPage();
        if (hasNextSearchReportsPage) fetchNextSearchReportsPage();
    };

    const refetch = () => {
        refetchSearchUsers();
        refetchSearchReports();
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);

        if (value.trim().length < 3) {
            queryClient.removeQueries({ queryKey: ['search'] });
            if (value.trim().length === 0) {
                setIsSearchNonModalOpen(false);
            }
        } else {
            setIsSearchNonModalOpen(true);
        }
    };

    return (
        <div className=''>
            <div className='flex flex-col space-y-4'>
                <div className='flex gap-6 lg:gap-8 '>
                    <div className="flex-1 space-y-4">
                        <HeaderSection
                            currentPath={currentPath || '/explore'}
                            isCardHeader={false}
                            showBreadcrumb={false}
                            message={t('description')}
                        />
                    </div>
                </div>
                <div className='relative gap-2 flex flex-col'>
                    <ExploreSearch
                        onSearchChange={handleSearchChange}
                        searchTerm={searchTerm}
                        onNonModalClose={() => setIsSearchNonModalOpen(false)}
                        isNonModalOpen={isSearchNonModalOpen}
                        onSearchClick={() => setIsSearchNonModalOpen(true)}
                        isLoading={isLoading}
                    />
                    <ExploreSearchNonModal
                        searchTerm={searchTerm}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetching}
                        fetchNextPage={fetchNextPage}
                        searchData={flattenedSearchData}
                        isOpen={isSearchNonModalOpen}
                        onClose={() => setIsSearchNonModalOpen(false)}
                        onSearchChange={handleSearchChange}
                        isLoading={isLoading}
                        isError={isError}
                        error={error}
                        refetch={refetch}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;