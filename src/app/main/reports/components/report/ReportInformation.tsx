/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from 'react';
import { useErrorToast, useSuccessToast, useUploadProgressReport } from '@/hooks';
import { FaUsers } from 'react-icons/fa';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore } from '@/stores';
import { compressImages, getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { ImageItem, IUploadProgressReportRequest } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadProgressReportSchema } from '../../../schema';
import { useQueryClient } from '@tanstack/react-query';
import { FiEdit } from 'react-icons/fi';
import { Accordion, ErrorSection, SuccessSection } from '@/components';
import { MdInfo } from 'react-icons/md';
import { CurrentProgress, ProgressHistory, ProgressSection } from '../progress';
import ResolvedReport from './ResolvedReport';
import { PublicVotes, VotingSection } from '../voting';
import { useTranslations } from 'next-intl';


interface ReportInformationProps {
    reportID?: number;
    onVote: (voteType: string) => void;
    onImageClick: (imageUrl: string) => void;
    isLoading?: boolean;
}

const ReportInformation: React.FC<ReportInformationProps> = ({
    reportID,
    onVote,
    onImageClick,
    isLoading = false,
}) => {
    const t = useTranslations('report.report_card.report_information');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [progressImages, setProgressImages] = useState<ImageItem[]>([]);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);

    const handleVote = (voteType: string) => {
        if (isLoading || currentStatus === 'RESOLVED') return;
        onVote(voteType);
    };

    const queryClient = useQueryClient();

    const handleImageClick = (imageUrl: string) => {
        onImageClick(imageUrl);
    };

    const reports = useReportsStore((s) => s.reports);
    const addReportProgress = useReportsStore((s) => s.addReportProgress);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    
    const report = reports.find(r => r.id === reportID);
    const currentStatus = report?.reportStatus || '';
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isUserCanVote = !isReportOwner && currentStatus !== 'RESOLVED' && currentStatus !== 'EXPIRED' && !report?.isOnProgressByCurrentUser && !report?.isResolvedByCurrentUser;
    const isReportResolved = (report?.reportStatus ?? currentStatus) === 'RESOLVED';
    const isReportExpired = (report?.reportStatus ?? currentStatus) === 'EXPIRED';
    const isWaitingConfirmation = report?.reportStatus === 'WAITING_CONFIRMATION';
    const progressData = report?.reportProgress || [];
    const showWarning = isReportOwner && isWaitingConfirmation;
    const totalVotes = report?.totalVotes || 0;
    const userCurrentVote = report?.isResolvedByCurrentUser 
        ? 'RESOLVED'
            : report?.isOnProgressByCurrentUser
                ? 'ON_PROGRESS'
                : null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-700 border-green-700 text-white';
            case 'WAITING_CONFIRMATION':
                return 'bg-sky-600 border-sky-600 text-white';
            case 'EXPIRED':
                return 'bg-indigo-700 text-white';
            case 'ON_PROGRESS':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleConfirmationModal = (formData: IUploadProgressReportRequest) => {
        openConfirm({
            type: "info",
            title: formData.progressStatus === 'RESOLVED'
                ?   t('close_report_modal.title')
                :   t('update_progress_modal.title'),
            subtitle: formData.progressStatus === 'RESOLVED'
                ?   t('close_report_modal.subtitle')
                :   t('update_progress_modal.subtitle'),
            isPending: isUploadProgressReportPending,
            description: formData.progressStatus === 'RESOLVED'
                ?   t('close_report_modal.description')
                :   t('update_progress_modal.description'),
            confirmTitle: formData.progressStatus === 'RESOLVED' ? t('close_report_modal.confirm') : t('update_progress_modal.confirm'),
            onConfirm: () => onSubmit(formData),
        });
    }

    const onSubmit = (formData: IUploadProgressReportRequest) => {
        if (reportID) {
            const preparedFormData = prepareFormData(formData);
            uploadProgress({
                reportID: reportID,
                data: preparedFormData
            });
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return t('status_labels.RESOLVED');
            case 'EXPIRED':
                return t('status_labels.EXPIRED');
            case 'WAITING_CONFIRMATION':
                return t('status_labels.WAITING_CONFIRMATION');
            case 'ON_PROGRESS':
                return t('status_labels.ON_PROGRESS');
            default:
                return t('status_labels.default');
        }
    };
    
    const { 
        mutate: uploadProgress, 
        isPending: isUploadProgressReportPending, 
        isError: isUploadProgressError, 
        isSuccess: isUploadProgressSuccess, 
        error: uploadProgressError,
        data: uploadProgressData,
        reset: resetUploadProgress
    } = useUploadProgressReport();

    const {
        register: registerProgress,
        handleSubmit: handleSubmitProgress,
        formState: { errors: progressErrors },
        reset: resetProgress,
        setValue: setProgressValue
    } = useForm<IUploadProgressReportRequest>({
        resolver: zodResolver(UploadProgressReportSchema),
    });

    const prepareFormData = (formData: IUploadProgressReportRequest): FormData => {
        const data = new FormData();
        data.append('reportID', String(reportID));
        data.append('progressStatus', formData.progressStatus);
        if (formData.progressNotes) {
            data.append('progressNotes', formData.progressNotes);
        }
        if (progressImages && progressImages.length > 0 ) {
            progressImages.forEach(async(file) => {
                const compressedFile = await compressImages(file.file);
                data.append('progressAttachments', compressedFile);
            });
        }
        return data;
    }

    const handleProgressUpload = async (formData: IUploadProgressReportRequest) => {
        if (isReportResolved) return;
        if (!reportID) return;
        handleConfirmationModal(formData);
    };

    useEffect(() => {
        if (isUploadProgressSuccess && uploadProgressData) {
            resetProgress();
            const dataResponse = uploadProgressData.data;
            if (dataResponse && reportID) {
                const newProgressEntry = {
                    id: dataResponse.id,
                    reportID: dataResponse.reportID,
                    status: dataResponse.status,
                    notes: dataResponse?.notes,
                    attachment1: dataResponse?.attachment1,
                    attachment2: dataResponse?.attachment2,
                    createdAt: dataResponse.createdAt,
                };
                addReportProgress(reportID, newProgressEntry);
            }
            setProgressImages([]);
            setSelectedStatus(null);
            resetUploadProgress();
            queryClient.invalidateQueries({ queryKey: ['report-progress', reportID] });
        }
    }, [isUploadProgressSuccess, uploadProgressData, resetProgress, queryClient, reportID, resetUploadProgress, addReportProgress]);

    useErrorToast(isUploadProgressError, uploadProgressError);
    useSuccessToast(isUploadProgressSuccess, uploadProgressData);
    
    return (
            <div className="rounded-xl p-4 bg-linear-to-br from-gray-50 to-white">
            <div className='mb-4'>
                {isUploadProgressSuccess && (
                    <SuccessSection message={uploadProgressData.message || t('success_default')} />
                )}

                {isUploadProgressError && (
                    <ErrorSection 
                        message={getErrorResponseMessage(uploadProgressError)} 
                        errors={getErrorResponseDetails(uploadProgressError)} 
                    />
                )}
            </div>

            <Accordion type="single" className="">
                <Accordion.Item
                    id="informasi-laporan"
                    title={t('section_title')}
                    icon={<FaUsers className="w-5 h-5" />}
                    rightContent={(
                        <div className='flex items-center gap-2'>
                            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(currentStatus)}`}>
                                {getStatusLabel(currentStatus)}
                            </div>
                            {showWarning && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openConfirm({
                                            title: t('confirmation_reminder.title'),
                                            type: 'warning',
                                            useCancelButton: false,
                                            description: t('confirmation_reminder.description'),
                                            additionalInfo: t('confirmation_reminder.additional_info')
                                        })}
                                    }
                                    className='inline-flex items-center p-1.5 sm:p-2 hover:bg-primary/10 rounded-full transition-colors group cursor-pointer'
                                    aria-label={t('confirmation_reminder.aria_label')}
                                >
                                    <MdInfo size={25} className="text-primary transition-colors sm:w-6 sm:h-6"/>
                                </button>
                            )}
                        </div>
                    )}
                    className="bg-transparent border-0 shadow-none"
                    headerClassName="bg-transparent"
                >
                    <div className="space-y-4 mt-2">
                        {reportID && (
                            <div className='mb-3 space-y-4'>
                                {progressData && progressData.length > 0 && report && (
                                    <CurrentProgress 
                                    handleImageClick={handleImageClick} 
                                    reportProgress={report.reportProgress}/>
                                )}

                                {report && report?.reportProgress?.length > 1 && (
                                    <Accordion type="single" defaultValue={[]}>
                                        <Accordion.Item id="timeline" title={t('timeline_section', { count: report.reportProgress.length })}>
                                            <ProgressHistory handleImageClick={handleImageClick} reportProgress={report.reportProgress}/>
                                        </Accordion.Item>
                                    </Accordion>
                                )}
                            </div>
                        )}

                        {isReportOwner && (
                            <Accordion type="single">
                                <Accordion.Item
                                    id="update-status"
                                    title={t('update_status_section')}
                                    icon={<FiEdit className="w-4 h-4 text-gray-700" />}
                                    headerClassName="text-gray-900 font-semibold"
                                >
                                    {isReportResolved ? (
                                        <ResolvedReport/>
                                    ) : (
                                        reportID && (
                                            <ProgressSection
                                                reportID={reportID}
                                                currentStatus={currentStatus}
                                                isUploadProgressReportPending={isUploadProgressReportPending}
                                                registerProgress={registerProgress}
                                                handleSubmitProgress={handleSubmitProgress}
                                                handleProgressUpload={handleProgressUpload}
                                                progressErrors={progressErrors}
                                                setProgressValue={setProgressValue}
                                                handleImageClick={handleImageClick}
                                                selectedStatus={selectedStatus}
                                                setSelectedStatus={setSelectedStatus}
                                                progressImages={progressImages}
                                                setProgressImages={setProgressImages}
                                            />
                                        )
                                    )}
                                </Accordion.Item>
                                <Accordion.Item
                                    id="report-votes"
                                    title={t('votes_section')}
                                    icon={<FaUsers className="w-4 h-4 text-gray-700" />}
                                    headerClassName="text-gray-900 font-semibold"
                                >
                                    {isReportOwner && (
                                        <PublicVotes 
                                        totalVotes={totalVotes}
                                        totalResolvedVotes={report?.totalResolvedVotes || 0}
                                        totalOnProgressVotes={report?.totalOnProgressVotes || 0}
                                        />
                                    )}
                                </Accordion.Item>
                            </Accordion>
                        )}

                        {!isReportOwner && (
                            <VotingSection
                                totalVotes={totalVotes}
                                totalResolvedVotes={report?.totalResolvedVotes || 0}
                                totalOnProgressVotes={report?.totalOnProgressVotes || 0}
                                userCurrentVote={userCurrentVote}
                                onVote={handleVote}
                                isLoading={isLoading}
                                isReportResolved={isReportResolved}
                                isReportExpired={isReportExpired}
                                isUserCanVote={isUserCanVote}
                                getStatusLabel={getStatusLabel}
                            />
                        )}
                    </div>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default ReportInformation;