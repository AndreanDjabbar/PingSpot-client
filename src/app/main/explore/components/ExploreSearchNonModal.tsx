/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaUsers, FaSearch } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';
import SearchResultTabs from './SearchResultTabs';
import { IReport, ReportType, IUserProfile, TabType } from '@/types';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useInView } from 'react-intersection-observer';
import { getImageURL } from '@/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components';
import { useTranslations } from 'next-intl';

interface SearchResult {
    users: IUserProfile[];
    reports: IReport[];
    communities: any[];
}

const reportStatus: Record<string, { color: string }> = {
    RESOLVED: {
        color: 'bg-green-700 border-green-700 text-white'
    },
    EXPIRED: {
        color: 'bg-indigo-700 text-white'
    },
    WAITING_CONFIRMATION: {
        color: 'bg-sky-600 border-sky-600 text-white'
    },
    ON_PROGRESS: {
        color: 'bg-yellow-500 text-white'
    },
    WAITING: {
        color: 'bg-gray-500 text-white'
    }
}

interface ExploreSearchNonModalProps {
    searchTerm: string;
    isOpen: boolean;
    searchData: {
        usersData: {
            users: IUserProfile[];
            type: string;
        };
        reportsData: {
            reports: IReport[];
            type: string;
        }
    } | null;
    onClose: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    onSearchChange: (value: string) => void;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    refetch?: () => void;
}

const ExploreSearchNonModal: React.FC<ExploreSearchNonModalProps> = ({ 
    searchTerm, 
    isOpen, 
    onClose,
    hasNextPage = false,
    isFetchingNextPage = false,
    fetchNextPage = () => {},
    onSearchChange,
    searchData,
    isLoading = false,
    isError = false,
    error = null,
    refetch
}) => {
    const router = useRouter();
    const t = useTranslations('explore');
    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [searchResults, setSearchResults] = useState<SearchResult>({
        users: [],
        reports: [],
        communities: []
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        const reportsData = searchData?.reportsData.reports || [];
        const usersData = searchData?.usersData.users || [];

        if (searchTerm.trim().length < 3) {
            setSearchResults({
                users: [],
                reports: [],
                communities: []
            });
            return;
        }

        if (!isLoading && searchData) {
            setSearchResults({
                users: usersData,
                reports: reportsData,
                communities: []
            });
        }
    }, [searchTerm, isLoading, searchData]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const renderLoadingState = () => (
        <div className="p-8 text-center border-t bg-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <AiOutlineLoading3Quarters className="w-7 h-7 text-primary animate-spin" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {t('loading_state.title')}
            </h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
                {t('loading_state.message', { type: t(`result_type_noun.${activeTab}`) })}
            </p>
        </div>
    );

    const renderErrorState = () => (
        <div className="p-8 text-center border-t border-gray-200 bg-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <GoAlert className="w-7 h-7 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {t('error_state.title')}
            </h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto mb-4">
                {error?.message || t('error_state.default_message')}
            </p>
            <Button
                onClick={() => {
                    refetch ? refetch() : onSearchChange(searchTerm);
                }}
                variant='primary'
                className="px-4 py-2 text-sm w-full md:w-auto"
            >
                {t('error_state.retry')}
            </Button>
        </div>
    );

    const renderResults = () => {
        if (isLoading) {
            return renderLoadingState();
        }

        if (isError) {
            return renderErrorState();
        }

        const results = searchResults[activeTab];
        
        if (searchTerm.length < 3) {
            return (
                <div className="p-8 text-center border-t border-gray-200 bg-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                        <FaSearch className="w-7 h-7 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {t('prompt_state.title')}
                    </h4>
                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        {t('prompt_state.min_chars_message', { type: t(`result_type_noun.${activeTab}`) })}
                    </p>
                </div>
            )
        }

        if (results.length === 0 && searchTerm.length >= 3) {
            return (
                <div className="p-8 text-center border-t border-gray-200 bg-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                        <FaSearch className="w-7 h-7 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {t('empty_results.title')}
                    </h4>
                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        {t('empty_results.message', { type: t(`result_type_noun.${activeTab}`) })}
                    </p>
                </div>
            );
        }

        return (
            <>  
                <div className="divide-y divide-gray-200">
                    {activeTab === 'users' && searchResults.users.map((user) => (
                        <div 
                        key={user.userID} 
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                            router.push(`/main/profile/${user.username}`);
                        }}
                        >
                            <div className="flex items-center gap-3">
                                {user.profilePicture ? (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Image
                                            src={getImageURL(user.profilePicture, 'user')}
                                            alt={user.fullName}
                                            width={5}
                                            height={5}
                                            className="object-cover w-full h-full rounded-full"
                                        />
                                    </div>
                                ): (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FaUser className="w-5 h-5 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                                    <p className="text-sm text-gray-600">@{user.username}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeTab === 'reports' && searchResults.reports.map((report, index) => (
                        <div 
                        key={`${report.id}-${index}`} 
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" 
                        onClick={() => {
                            router.push(`/main/reports/${report.id}`);
                        }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <GoAlert className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{report.reportTitle}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-3 py-1 bg-primary/10 text-xs font-bold text-primary rounded-full`}>
                                            {t(`report_types.${report.reportType}`)}
                                        </span>
                                        <span className={`text-xs  px-3 py-1 rounded-full font-semibold ${reportStatus[report.reportStatus].color}`}>{t(`report_status.${report.reportStatus}`)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeTab === 'communities' && searchResults.communities.map((community) => (
                        <div key={community.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FaUsers className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{community.name}</p>
                                    <p className="text-sm text-gray-600">{t('members_count', { count: community.members })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {hasNextPage && (
                    <div ref={ref} className="py-4 flex justify-center border-t border-gray-200">
                        {isFetchingNextPage && (
                            <div className="flex items-center space-x-2 text-primary/70">
                                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                <span className="text-sm">{t('loading_more')}</span>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.20, ease: "easeOut" }}
                >   
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="relative">
                            {searchTerm && searchTerm.length >= 3 && (
                                <div className="sticky top-0 z-10 pt-1 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between border-b border-gray-200 p-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-surface">
                                                {t('results_header.title')}
                                            </h3>
                                            <p className="text-xs text-surface/80 mt-0.5">
                                                {t('results_header.showing_for', { term: searchTerm })}
                                            </p>
                                        </div>
                                        {isLoading && (
                                            <AiOutlineLoading3Quarters className="w-4 h-4 text-primary animate-spin" />
                                        )}
                                    </div>
                                    {searchTerm && (
                                        <SearchResultTabs
                                            activeTab={activeTab}
                                            onTabChange={setActiveTab}
                                            userCount={searchResults.users.length}
                                            reportCount={searchResults.reports.length}
                                            communityCount={searchResults.communities.length}
                                        />
                                    )}
                                </div>
                            )}
                            
                            {!searchTerm && (
                                <div className="p-8 text-center bg-gray-100">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                                        <FaSearch className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                        {t('prompt_state.title')}
                                    </h4>
                                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                                        {t('prompt_state.initial_message')}
                                    </p>
                                </div>
                            )}
                            <div className='max-h-[380px] overflow-y-auto'>
                                {searchTerm && renderResults()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExploreSearchNonModal;