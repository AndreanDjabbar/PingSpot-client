"use client";

import React from 'react';
import { IReport, ReportType } from '@/types';
import { getFormattedDate as formattedDate } from '@/utils';
import { useConfirmationModalStore, useUserProfileStore } from '@/stores';
import { MdInfo } from 'react-icons/md';
import { ImInfo } from 'react-icons/im';
import { Button } from '@/components';
import { BiEdit } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { IoMdTrash } from 'react-icons/io';
import { useTranslations } from 'next-intl';

interface ReportInfoSidebarProps {
    report: IReport;
    onRemoveReport: (reportID: number) => void;
    getReportTypeLabel: (type: ReportType) => string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'RESOLVED':
            return 'bg-green-700 border-green-700 text-white';
        case 'EXPIRED':
            return 'bg-indigo-700 text-white';
        case 'WAITING':
            return 'bg-sky-600 border-sky-600 text-white';
        case 'ON_PROGRESS':
            return 'bg-yellow-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};

export const ReportInfoSidebar: React.FC<ReportInfoSidebarProps> = ({ 
    report, 
    getReportTypeLabel,
    onRemoveReport
}) => {
    const t = useTranslations('report.component.report_info_sidebar');
    const router = useRouter();
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isWaitingConfirmation = report?.reportStatus === 'WAITING_CONFIRMATION';
    const showWarning = isReportOwner && isWaitingConfirmation;

    const openDeleteConfirm = () => {
        openConfirm({ 
            title: t('delete_confirm.title'), 
            subtitle: t('delete_confirm.subtitle'),
            description: t('delete_confirm.description'),
            type: 'danger',
            confirmTitle: t('delete_confirm.confirm_button'),
            onConfirm: () => { onDeleteClick(report.id); } 
        });
    }

    const onDeleteClick = (reportID: number) => {
        onRemoveReport(reportID);
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4 lg:flex-col lg:items-start lg:gap-2 xl:items-center xl:flex-row">
                <h3 className="font-bold text-base text-gray-900">{t('title')}</h3>
            </div>
            <div className="space-y-3">
                {report.hasProgress ? (
                    <>
                        <div className='flex'>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('status_labels.default').split(' ')[0]}</p>
                                <div className='flex items-center'>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.reportStatus)}`}>
                                        {t(`status_labels.${report.reportStatus}`, { defaultValue: t('status_labels.default') })}
                                    </span>
                                    {showWarning && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openConfirm({
                                                    title: t('resolution_confirm.title'),
                                                    type: 'warning',
                                                    useCancelButton: false,
                                                    description: t('resolution_confirm.description'),
                                                    additionalInfo: t('resolution_confirm.additional_info')
                                                })}
                                            }
                                            className='inline-flex items-center p-1.5 sm:p-2 hover:bg-primary/10 rounded-full transition-colors group cursor-pointer'
                                            aria-label={t('status_info_aria')}
                                        >
                                            <MdInfo size={25} className="text-primary transition-colors sm:w-6 sm:h-6"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-300"></div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('status_labels.default').split(' ')[0]}</p>
                            <span className="text-xs text-gray-600 font-medium">{t('no_status_type')}</span>
                        </div>
                        <div className="h-px bg-gray-300"></div>
                    </>
                )}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('reported_label')}</p>
                    <p className="text-sm text-gray-900"><span className='text-[11px] text-gray-500'>{t('on_prefix')}</span>
                        {formattedDate(report.reportCreatedAt, {
                            formatStr: 'dd MMMM yyyy, HH:mm',
                        })}
                    </p>
                </div>
                <div className="h-px bg-gray-300"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('category_label')}</p>
                    <p className="text-sm text-gray-900">{getReportTypeLabel(report.reportType)}</p>
                </div>
                <div className="h-px bg-gray-300"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('progress_updated_label')}</p>
                    {report.hasProgress && report.reportProgress ? (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col leading-tight">
                                <span className='text-gray-500 text-[11px]'>{t('by_prefix')}<span className="text-sm font-bold text-gray-700"> {report.lastUpdatedBy ? t(`last_updated_by.${report.lastUpdatedBy}`) : '-'}</span></span>
                                <p className="text-sm text-gray-900"><span className='text-[11px] text-gray-500'>{t('on_prefix')}</span>
                                    {formattedDate(report.lastUpdatedProgressAt || 0, {
                                        formatStr: 'dd MMMM yyyy, HH:mm',
                                    })}
                                </p>
                            </div>
                            {report.lastUpdatedBy === 'OWNER' && (
                                <button 
                                    onClick={() => openConfirm({
                                        title: t('owner_update_info.title'),
                                        type: 'warning',
                                        description: t('owner_update_info.description'),
                                        additionalInfo: t('owner_update_info.additional_info')
                                    })}
                                    className='ml-auto inline-flex items-center p-1.5 sm:p-2 hover:bg-yellow-50 rounded-full transition-colors group cursor-pointer'
                                    aria-label={t('status_info_aria')}
                                >
                                    <ImInfo size={16} className="text-yellow-600 group-hover:text-yellow-700 transition-colors sm:w-6 sm:h-6"/>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {report.hasProgress ? (
                                <span className="text-sm text-gray-900">-</span>
                            ): (
                                <>
                                    <div>
                                        <span className="text-xs text-gray-600 font-medium">{t('no_progress_update_type')}</span>
                                    </div>
                                    <div className="h-px bg-gray-300"></div>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className="h-px bg-gray-300"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('report_updated_by_creator_label')}</p>
                    {(report.reportUpdatedAt !== report.reportCreatedAt) && (report.reportUpdatedAt > report.reportCreatedAt) ? (
                        <p className="text-sm text-gray-900"><span className='text-[11px] text-gray-500'>{t('on_prefix')}</span>
                            {formattedDate(report.reportUpdatedAt, {
                                formatStr: 'dd MMMM yyyy, HH:mm',
                            })}
                        </p>
                    ) : (
                        <span className="text-sm text-gray-900">-</span>
                    )}
                </div>
            </div>
            {isReportOwner && report.hasProgress && (
                <div className='flex gap-2 mt-6'>
                    <Button
                        onClick={() => router.push(`/main/reports/${report.id}/edit`)}
                        icon={<BiEdit />}
                        size='sm'
                        disabled={report.reportStatus === 'RESOLVED' || report.reportStatus === 'EXPIRED'}
                    >
                        {t('buttons.update')}
                    </Button>
                    <Button
                        onClick={() => openDeleteConfirm()}
                        icon={<IoMdTrash />}
                        size='sm'
                        variant='danger'
                        disabled={report.reportStatus === 'RESOLVED' || report.reportStatus === 'EXPIRED'}
                    >
                        {t('buttons.delete')}
                    </Button>
                </div>
            )}
        </div>
    );
};
