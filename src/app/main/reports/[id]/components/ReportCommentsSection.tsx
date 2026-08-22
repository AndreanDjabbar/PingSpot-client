"use client";

import React from 'react';
import { IReportComment, ICreateReportCommentRequest, ISearchUsersResponse } from '@/types';
import { z } from 'zod';
import { CreateReportCommentSchema } from '@/app/main/schema';
import { ErrorSection, ImagePreview } from '@/components';
import { getErrorResponseDetails, getErrorResponseMessage, isInternalServerError } from '@/utils';
import { useReportsStore } from '@/stores';
import { CommentInput, CommentList } from '../../components';
import { InfiniteData } from '@tanstack/react-query';


interface ReportCommentsSectionProps {
    comments: IReportComment[];
    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    isFetchingCommentsError?: boolean;
    errorFetchingComments?: Error;
    onRetryFetchComments?: () => void;
    hasMoreComments?: boolean;
    isFetchingMoreComments?: boolean;
    isSubmitting?: boolean;
    onFetchingMoreComments?: () => void;
    setSearchTermChange: React.Dispatch<React.SetStateAction<string>>;
    setIsSearchUsersOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchUsersLoading?: boolean;
    hasNextPageSearchUsers?: boolean;
    isFetchingNextPageSearchUsers?: boolean;
    searchUsersData: InfiniteData<ISearchUsersResponse> | undefined;
    isSearchUsersError?: boolean;
    errorSearchUsers?: Error;
    refetchSearchUsers?: () => void;
    fetchNextPageSearchUsers?: () => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({
    comments,
    hasMoreComments,
    isFetchingMoreComments,
    isSubmitting = false,
    errorFetchingComments = null,
    isFetchingCommentsError,
    onRetryFetchComments,
    onFetchingMoreComments,
    onCreateReportComment,
    setSearchTermChange,
    isSearchUsersLoading,
    setIsSearchUsersOpen,
    hasNextPageSearchUsers,
    isFetchingNextPageSearchUsers,
    searchUsersData,
    isSearchUsersError,
    errorSearchUsers,
    refetchSearchUsers,
    fetchNextPageSearchUsers,
}) => {
    const reportCommentCounts = useReportsStore((state) => state.reportCommentsCount);
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const handleSubmitComment = (formData: ICreateReportCommentRequest) => {
        if(onCreateReportComment) {
            setCommentMediaImage(null);
            setImagePreview(null);
            onCreateReportComment(formData);
        }
    }

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

    if (isFetchingCommentsError) {
        const isServerError = isInternalServerError(errorFetchingComments);
        return (
            <div className="min-h-screen">
                <div className='mt-4'>
                    <ErrorSection
                        message={getErrorResponseMessage(errorFetchingComments || "Gagal memuat komentar.")}
                        onRetry={onRetryFetchComments}
                        showRetryButton={isServerError}
                        errors={getErrorResponseDetails(errorFetchingComments) || "Gagal memuat komentar."}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border overflow-hidden border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        Komentar ({reportCommentCounts || 0})
                    </h2>
                </div>
            </div>

            <div className="flex w-full gap-2 justify-center items-center relative">
                <div className="py-4 px-3 border-b border-gray-200 bg-gray-50 w-full">
                    {imagePreview && (
                        <ImagePreview
                            preview={imagePreview}
                            onRemove={handleRemoveImage}
                            className="mb-3"
                        />
                    )}
                    <CommentInput
                        onCreateReportComment={handleSubmitComment}
                        isSubmitting={isSubmitting}
                        searchUsersData={searchUsersData}
                        setSearchTermChange={setSearchTermChange}
                        setIsSearchUsersOpen={setIsSearchUsersOpen}
                        isSearchUsersLoading={isSearchUsersLoading}
                        isFetchingNextPageSearchUsers={isFetchingNextPageSearchUsers}
                        hasNextPageSearchUsers={hasNextPageSearchUsers}
                        refetchSearchUsers={refetchSearchUsers}
                        fetchNextPageSearchUsers={fetchNextPageSearchUsers}
                        isSearchUsersError={isSearchUsersError}
                        errorSearchUsers={errorSearchUsers}
                        onImageSelect={handleImageSelect}
                        onImageRemove={handleRemoveImage}
                        imagePreview={imagePreview}
                        commentMediaImage={commentMediaImage}
                    />
                </div>
            </div>

            <CommentList
                comments={comments}
                hasMoreComments={hasMoreComments}
                isFetchingMoreComments={isFetchingMoreComments}
                onFetchingMoreComments={onFetchingMoreComments}
                onCreateReportComment={onCreateReportComment}
                isSubmitting={isSubmitting}
                searchUsersData={searchUsersData}
                setSearchTermChange={setSearchTermChange}
                setIsSearchUsersOpen={setIsSearchUsersOpen}
                isSearchUsersLoading={isSearchUsersLoading}
                isSearchUsersError={isSearchUsersError}
                errorSearchUsers={errorSearchUsers}
                onImageRemove={handleRemoveImage}
                imagePreview={imagePreview}
                commentMediaImage={commentMediaImage}
            />
        </div>
    );
};