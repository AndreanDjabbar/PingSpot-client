/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationStore, useReportFilterModalStore, useReportsStore } from '@/stores';
import { ReportFilterOptions, ReportType } from '@/types';
import { MdAccessTime, MdCancel, MdCheckCircle } from 'react-icons/md';
import { BiCategory, BiLike, BiMap } from 'react-icons/bi';
import { RiProgress3Fill } from 'react-icons/ri';
import { Button } from '@/components/UI';
import { Scrollbar } from '@/components';
import { useTranslations } from 'next-intl';

type SortOption = 'latest' | 'oldest' | 'most_liked' | 'least_liked';
type StatusFilter = 'all' | 'WAITING' | 'ON_PROGRESS' | 'RESOLVED' | 'WAITING_CONFIRMATION' | 'EXPIRED';
type DistanceFilter = 'all' | '1000' | '5000' | '10000';
type ProgressFilter = 'all' | 'true' | 'false';

const ReportFilterModal: React.FC = () => {
    const t = useTranslations('component.modal.report_filter');
    const { isOpen: isReportFilterModalOpen, anchorRef, closeReportFilterModal } = useReportFilterModalStore();
    const [position, setPosition] = useState({ top: 0, right: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const [triangleLeft, setTriangleLeft] = useState<number | null>(null);
    const [triangleRight, setTriangleRight] = useState<number | null>(null);
    const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');

    const reportFilters = useReportsStore((s) => s.reportFilters);
    const updateReportFilters = useReportsStore((s) => s.updateReportFilters);
    const resetReportFilters = useReportsStore((s) => s.resetReportFilters);
    const [filters, setFilters] = useState<ReportFilterOptions>(reportFilters);

    const userLocation = useLocationStore((s) => s.location);
    const [disableStatus, setDisableStatus] = useState(false);

    useEffect(() => {
        if (isReportFilterModalOpen && anchorRef?.current) {
            const buttonRect = anchorRef.current.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            const availableBelow = window.innerHeight - buttonRect.bottom;
            const availableAbove = buttonRect.top;
            const preferTop = availableBelow < 220 && availableAbove > availableBelow;
            setPlacement(preferTop ? 'top' : 'bottom');

            setPosition({
                top: preferTop ? buttonRect.top + scrollY - 300 : buttonRect.bottom + scrollY + 8,
                right: window.innerWidth - buttonRect.right - 6,
            });

            setTriangleLeft(null);
            setTriangleRight(null);
        }
    }, [isReportFilterModalOpen, anchorRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                anchorRef?.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                setFilters(reportFilters);
                closeReportFilterModal();
            }
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeReportFilterModal();
        };

        if (isReportFilterModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isReportFilterModalOpen, anchorRef, closeReportFilterModal, reportFilters]);

    useEffect(() => {
        if (!isReportFilterModalOpen || !modalRef.current || !anchorRef?.current) return;

        setTriangleLeft(null);
        setTriangleRight(null);

        const measureAndPosition = () => {
            if (!modalRef.current || !anchorRef?.current) return;

            const modalRect = modalRef.current.getBoundingClientRect();
            const buttonRect = anchorRef.current.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;

            if (placement === 'bottom') {
                const availableBelow = window.innerHeight - buttonRect.bottom;
                if (modalRect.height + 24 > availableBelow && buttonRect.top > availableBelow) {
                    const top = buttonRect.top + scrollY - modalRect.height - 8;
                    setPosition({ top, right: window.innerWidth - buttonRect.right });
                    setPlacement('top');
                } else {
                    const top = buttonRect.bottom + scrollY + 8;
                    setPosition({ top, right: window.innerWidth - buttonRect.right });
                }
            } else {
                const top = buttonRect.top + scrollY - modalRect.height - 8;
                setPosition({ top, right: window.innerWidth - buttonRect.right });
            }

            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            let left = buttonCenterX - modalRect.left - 10;
            const min = 12;
            const max = modalRect.width - 40;
            if (left < min) left = min;
            if (left > max) left = max;

            const distanceFromModalRight = modalRect.right - buttonCenterX;
            if (distanceFromModalRight < 80) {
                const rightOffset = Math.max(12, Math.round(modalRect.right - buttonCenterX) - 8);
                setTriangleRight(rightOffset);
                setTriangleLeft(null);
            } else {
                setTriangleLeft(left);
                setTriangleRight(null);
            }
        };

        const timeoutId = setTimeout(measureAndPosition, 50);

        window.addEventListener('resize', measureAndPosition);
        window.addEventListener('scroll', measureAndPosition, { passive: true });

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', measureAndPosition);
            window.removeEventListener('scroll', measureAndPosition as EventListener);
        };
    }, [isReportFilterModalOpen, anchorRef, placement]);

    const handleApply = () => {
        updateReportFilters(filters);
        closeReportFilterModal();
    };

    const handleReset = () => {
        resetReportFilters();
        setFilters({
            sortBy: 'latest',
            reportType: 'all',
            status: 'all',
            distance: {
                distance: 'all',
                lat: null,
                lng: null,
            },
            hasProgress: 'all'
        });
        closeReportFilterModal();
    };

    const sortOptions = [
        { value: 'latest', label: t('sort_options.latest'), icon: <MdAccessTime /> },
        { value: 'oldest', label: t('sort_options.oldest'), icon: <MdAccessTime /> },
        { value: 'most_liked', label: t('sort_options.most_liked'), icon: <BiLike /> },
    ];

    const reportTypeOptions = [
        { value: 'all', label: t('report_type_options.all') },
        { value: 'INFRASTRUCTURE', label: t('report_type_options.INFRASTRUCTURE') },
        { value: 'ENVIRONMENT', label: t('report_type_options.ENVIRONMENT') },
        { value: 'SAFETY', label: t('report_type_options.SAFETY') },
        { value: 'TRAFFIC', label: t('report_type_options.TRAFFIC') },
        { value: 'PUBLIC_FACILITY', label: t('report_type_options.PUBLIC_FACILITY') },
        { value: 'WASTE', label: t('report_type_options.WASTE') },
        { value: 'WATER', label: t('report_type_options.WATER') },
        { value: 'ELECTRICITY', label: t('report_type_options.ELECTRICITY') },
        { value: 'HEALTH', label: t('report_type_options.HEALTH') },
        { value: 'SOCIAL', label: t('report_type_options.SOCIAL') },
        { value: 'EDUCATION', label: t('report_type_options.EDUCATION') },
        { value: 'ADMINISTRATIVE', label: t('report_type_options.ADMINISTRATIVE') },
        { value: 'DISASTER', label: t('report_type_options.DISASTER') },
        { value: 'OTHER', label: t('report_type_options.OTHER') },
    ];

    const statusOptions = [
        { value: 'all', label: t('status_options.all'), icon: <BiCategory />, color: 'gray' },
        { value: 'RESOLVED', label: t('status_options.RESOLVED'), icon: <MdCheckCircle />, color: 'green' },
        { value: 'POTENTIALLY_RESOLVED', label: t('status_options.POTENTIALLY_RESOLVED'), icon: <RiProgress3Fill />, color: 'blue' },
        { value: 'EXPIRED', label: t('status_options.EXPIRED'), icon: <MdAccessTime />, color: 'indigo' },
        { value: 'ON_PROGRESS', label: t('status_options.ON_PROGRESS'), icon: <RiProgress3Fill />, color: 'yellow' },
        { value: 'NOT_RESOLVED', label: t('status_options.NOT_RESOLVED'), icon: <MdCancel />, color: 'red' },
        { value: 'WAITING', label: t('status_options.WAITING'), icon: <MdAccessTime />, color: 'gray' },
    ];

    const progressOptions = [
        { value: 'all', label: t('progress_options.all'), icon: <BiCategory /> },
        { value: 'true', label: t('progress_options.true'), icon: <RiProgress3Fill /> },
        { value: 'false', label: t('progress_options.false'), icon: <MdCancel /> },
    ];

    const distanceOptions = [
        { value: 'all', label: t('distance_options.all'), icon: <BiMap /> },
        { value: '1000', label: t('distance_options.1000'), icon: <BiMap /> },
        { value: '5000', label: t('distance_options.5000'), icon: <BiMap /> },
        { value: '10000', label: t('distance_options.10000'), icon: <BiMap /> },
    ];

    return (
        <AnimatePresence>
            {isReportFilterModalOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        aria-hidden
                    />

                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: `${position.top}px`,
                            right: `${position.right}px`,
                        }}
                        className="z-50 w-full max-w-md sm:max-w-lg lg:max-w-2xl"
                    >
                        {(triangleLeft !== null || triangleRight !== null) && (
                            placement === 'bottom' ? (
                                <div
                                    className="absolute -top-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-200"
                                    style={
                                        triangleLeft !== null
                                            ? { left: `${triangleLeft}px` }
                                            : { right: `${triangleRight ?? 24}px` }
                                    }
                                />
                            ) : (
                                <div
                                    className="absolute -bottom-2 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"
                                    style={
                                        triangleLeft !== null
                                            ? { left: `${triangleLeft}px` }
                                            : { right: `${triangleRight ?? 24}px` }
                                    }
                                />
                            )
                        )}

                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-75 sm:h-78 md:h-95 lg:h-105 xl:h-120">
                            <Scrollbar height={'80%'}>
                                <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 h-[80%]">
                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                            <BiLike className="w-4 h-4 sm:w-5 sm:h-5" />
                                            {t('sections.sort')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFilters({ ...filters, sortBy: option.value as SortOption })}
                                                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                        filters.sortBy === option.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                    }`}
                                                >
                                                    <span className={filters.sortBy === option.value ? 'text-primary' : 'text-gray-400'}>
                                                        {option.icon}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                            <BiCategory className="w-4 h-4 sm:w-5 sm:h-5" />
                                            {t('sections.category')}
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                            {reportTypeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFilters({ ...filters, reportType: option.value as ReportType | 'all' })}
                                                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium cursor-pointer ${
                                                        filters.reportType === option.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                            <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                            {t('sections.status')}
                                        </label>
                                        <div className="space-y-2">
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    disabled={disableStatus}
                                                    onClick={() => setFilters({ ...filters, status: option.value as StatusFilter })}
                                                    className={`w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                        disableStatus
                                                            ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-100'
                                                            : filters.status === option.value
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <span className={`text-base sm:text-lg ${
                                                        disableStatus
                                                            ? 'text-gray-300'
                                                            : filters.status === option.value
                                                            ? 'text-primary'
                                                            : option.color === 'green'
                                                            ? 'text-green-500'
                                                            : option.color === 'blue'
                                                            ? 'text-blue-500'
                                                            : option.color === 'yellow'
                                                            ? 'text-yellow-500'
                                                            : option.color === 'red'
                                                            ? 'text-red-500'
                                                            : 'text-gray-400'
                                                    }`}>
                                                        {option.icon}
                                                    </span>
                                                    <span className={`text-xs sm:text-sm font-medium ${
                                                        disableStatus
                                                            ? 'text-gray-400'
                                                            : filters.status === option.value ? 'text-primary' : 'text-gray-700'
                                                    }`}>
                                                        {option.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                            <RiProgress3Fill className="w-4 h-4 sm:w-5 sm:h-5" />
                                            {t('sections.progress')}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            {progressOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        if (option.value as ProgressFilter === 'false') {
                                                            setDisableStatus(true);
                                                            setFilters({ ...filters, hasProgress: option.value as ProgressFilter, status: 'all' });
                                                        } else {
                                                            setDisableStatus(false);
                                                            setFilters({ ...filters, hasProgress: option.value as ProgressFilter });
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                        filters.hasProgress === option.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                    }`}
                                                >
                                                    <span className={filters.hasProgress === option.value ? 'text-primary' : 'text-gray-400'}>
                                                        {option.icon}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                                            <BiMap className="w-4 h-4 sm:w-5 sm:h-5" />
                                            {t('sections.distance')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            {distanceOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        const lat = option.value === 'all' ? null : userLocation?.lat || null;
                                                        const lng = option.value === 'all' ? null : userLocation?.lng || null;
                                                        setFilters({
                                                            ...filters,
                                                            distance: { ...filters.distance, distance: option.value as DistanceFilter, lat: lat, lng: lng }
                                                        });
                                                    }}
                                                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                        filters.distance.distance === option.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                    }`}
                                                >
                                                    <span className={filters.distance.distance === option.value ? 'text-primary' : 'text-gray-400'}>
                                                        {option.icon}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Scrollbar>
                            <div className="p-2 md:p-4 lg:p-6 border-t border-gray-200 bg-gray-50 h-[20%]">
                                <div className="flex gap-2 sm:gap-3">
                                    <Button
                                        onClick={handleReset}
                                        className="flex-1 px-4 sm:px-6 bg-gray-200 py-2.5 sm:py-3 rounded-xl text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                    >
                                        {t('actions.reset')}
                                    </Button>
                                    <Button
                                        onClick={handleApply}
                                        className="flex-1 px-4 sm:px-6 bg-primary py-2.5 sm:py-3 rounded-xl text-white hover:bg-primary/80 transition-colors cursor-pointer"
                                    >
                                        {t('actions.apply')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReportFilterModal;