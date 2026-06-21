"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import { compressImages, getErrorResponseMessage } from '@/utils';
import { IReportComment, ISearchUsersResponse } from '@/types';
import { useReportsStore, useUserProfileStore } from '@/stores';
import ReportCard from './ReportCard';
import { ICreateReportCommentRequest, ICreateReportCommentResponse } from '@/types/api/report';
import { ErrorSection, ImagePreview } from '@/components/';
import { InfiniteData, UseMutateFunction } from '@tanstack/react-query';
import { CommentInput, CommentList } from '../comment';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLike: () => void;
    onDislike: () => void;
    reportID: number;
    onSave: () => void;
    onShare: () => void;
    onStatusVote: (voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
    onStatusUpdate?: (reportID: number, newStatus: string) => void;
    commentsLoading?: boolean;
    onLoadMoreComments?: () => void;
    hasMoreComments?: boolean;
    isFetchingMoreComments?: boolean;
    createReportCommentMutation?: UseMutateFunction<ICreateReportCommentResponse, Error, { reportID: number; data: FormData; }, unknown>;
    isCreateReportCommentError: boolean;
    createReportCommentError?: Error;
    isSubmitting?: boolean;
    onFetchingMoreComments?: () => void;
    setSearchTermChange: React.Dispatch<React.SetStateAction<string>>;
    setIsSearchUsersOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchUsersLoading?: boolean;
    hasNextPageSearchUsers?: boolean;
    searchUsersData: InfiniteData<ISearchUsersResponse> | undefined;
    isSearchUsersError?: boolean;
    isFetchingSearchUsers?: boolean;
    errorSearchUsers?: Error;
    refetchSearchUsers?: () => void;
    fetchNextPageSearchUsers?: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    onLike,
    onShare,
    reportID,
    commentsLoading = false,
    hasMoreComments = false,
    createReportCommentMutation,
    onLoadMoreComments,
    isFetchingMoreComments = false,
    isCreateReportCommentError,
    createReportCommentError,
    isSubmitting,
    setSearchTermChange,
    setIsSearchUsersOpen,
    isSearchUsersLoading,
    searchUsersData,
    isSearchUsersError,
    isFetchingSearchUsers,
    errorSearchUsers,
}) => {
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const userProfile = useUserProfileStore((state) => state.userProfile);
    const report = useReportsStore((state) => state.selectedReport);
    const reportComments = useReportsStore((state) => state.reportComments);
    const reportCommentCounts = useReportsStore((state) => state.reportCommentsCount);
    const setReportCommentCounts = useReportsStore((state) => state.setReportCommentsCount);
    const setReportComments = useReportsStore((state) => state.setReportComments);

    const handleLoadMoreComments = () => {
        if (onLoadMoreComments) {
            onLoadMoreComments();
        }
    };

    const setOptimisticComment = (formData: ICreateReportCommentRequest) => {
        if (formData.parentCommentID) {
            setReportComments(
                reportComments.map((comment) =>
                    comment.commentID === formData.parentCommentID
                        ? {
                            ...comment,
                            replies: [
                                ...(comment.replies ?? []),
                                {
                                    commentID: 'temp-id-' + Date.now(),
                                    reportID: report?.id || 0,
                                    createdAt: Math.floor(Date.now() / 1000),
                                    content: formData.commentContent,
                                    media: formData.mediaFile
                                        ? {
                                            url: URL.createObjectURL(formData.mediaFile),
                                            type: 'IMAGE',
                                            height: 100,
                                            width: 100,
                                        }
                                        : undefined,
                                    userInformation: userProfile!,
                                    commentType: 'TEMP',
                                } as IReportComment,
                            ],
                        }
                        : comment
                )
            );
        } else {
            setReportComments([...reportComments, {
                commentID: 'temp-id-' + Date.now(),
                reportID: report?.id || 0,
                createdAt: Math.floor(Date.now() / 1000),
                content: formData.commentContent,
                media: formData.mediaFile
                    ? {
                        url: URL.createObjectURL(formData.mediaFile),
                        type: 'IMAGE',
                        height: 100,
                        width: 100,
                    }
                    : undefined,
                userInformation: userProfile!,
                commentType: 'TEMP',
            } as IReportComment]);
        }
    };

    const prepareFormData = async (formData: ICreateReportCommentRequest): Promise<FormData> => {
        const data = new FormData();
        data.append('reportID', String(report?.id || 0));
        data.append('content', formData.commentContent);
        if (formData.parentCommentID) {
            data.append('parentCommentID', formData.parentCommentID.toString());
        }
        if (formData.threadRootID) {
            data.append('threadRootID', formData.threadRootID.toString());
        }
        if (formData.mediaFile) {
            const compressedFile = await compressImages(formData.mediaFile);
            data.append('mediaFile', compressedFile);
            data.append('mediaType', 'IMAGE');
        }
        return data;
    };

    // Single entry point for both the main composer and replies.
    // CommentInput / CommentList already validate before calling this.
    const handleCreateReportComment = async (formData: ICreateReportCommentRequest) => {
        if (!report?.id) return;

        setOptimisticComment(formData);
        setReportCommentCounts(reportCommentCounts + 1);

        const preparedData = await prepareFormData(formData);
        createReportCommentMutation!({
            reportID: report.id,
            data: preparedData,
        });

        // Only the main composer's image is owned here; clear it after a successful send.
        if (!formData.parentCommentID) {
            setCommentMediaImage(null);
            setImagePreview(null);
        }
    };

    const handleImageSelect = (file: File) => {
        setCommentMediaImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setCommentMediaImage(null);
        setImagePreview(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999] px-2 sm:px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 group cursor-pointer"
                        aria-label="Close modal"
                    >
                        <FaTimes className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
                    </button>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white">
                            <ReportCard
                                reportID={reportID}
                                onLike={onLike}
                                enableOptions={false}
                                enableInformation={false}
                                onShare={onShare}
                            />
                        </div>

                        {isCreateReportCommentError && (
                            <div className='mb-4 px-4'>
                                <ErrorSection
                                    message={getErrorResponseMessage(createReportCommentError) || 'Terjadi kesalahan saat mengirim komentar'}
                                    errors={createReportCommentError}
                                />
                            </div>
                        )}
                        <div>
                            <div className="sticky top-0 bg-white border-t border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm z-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Komentar ({reportCommentCounts || 0})
                                    </h2>
                                </div>
                            </div>
                            <CommentList
                                comments={reportComments!}
                                onReply={handleCreateReportComment}
                                commentsLoading={commentsLoading}
                                hasMoreComments={hasMoreComments}
                                onFetchingMoreComments={handleLoadMoreComments}
                                isFetchingMoreComments={isFetchingMoreComments}
                            />
                        </div>
                    </div>
                    <div className={`py-4 px-3 border-t border-gray-200 bg-gray-50 w-full`}
                    >
                        {imagePreview && (
                            <ImagePreview
                                preview={imagePreview}
                                onRemove={handleRemoveImage}
                                className="mb-3"
                            />
                        )}
                        <CommentInput
                            onCreateReportComment={handleCreateReportComment}
                            isSubmitting={isSubmitting}
                            searchUsersData={searchUsersData}
                            setSearchTermChange={setSearchTermChange}
                            setIsSearchUsersOpen={setIsSearchUsersOpen}
                            isSearchUsersLoading={isSearchUsersLoading}
                            isFetchingSearchUsers={isFetchingSearchUsers}
                            isSearchUsersError={isSearchUsersError}
                            errorSearchUsers={errorSearchUsers}
                            onImageSelect={handleImageSelect}
                            onImageRemove={handleRemoveImage}
                            imagePreview={imagePreview}
                            commentMediaImage={commentMediaImage}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReportModal;