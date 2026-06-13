"use client";

import React from 'react';
import { IReportComment, ICreateReportCommentRequest } from '@/types';
import { z } from 'zod';
import { CreateReportCommentSchema } from '@/app/main/schema';
import { Button, ErrorSection, ImagePreview, InlineImageUpload, TextAreaField } from '@/components';
import { getErrorResponseDetails, getErrorResponseMessage, isInternalServerError } from '@/utils';
import { useReportsStore } from '@/stores';
import { CommentList } from '../../components';
import { FaSpinner } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';

interface ReportCommentsSectionProps {
    comments: IReportComment[];
    setCommentContent?: React.Dispatch<React.SetStateAction<string>>;
    setCommentMediaImage?: React.Dispatch<React.SetStateAction<File | null>>;
    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    isFetchingCommentsError?: boolean;
    errorFetchingComments?: Error;
    onRetryFetchComments?: () => void;
    hasMoreComments?: boolean;
    isFetchingMoreComments?: boolean;
    isSubmitting?: boolean;
    onFetchingMoreComments?: () => void;
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
}) => {
    const [commentContent, setCommentContent] = React.useState('');
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

    const reportCommentCounts = useReportsStore((state) => state.reportCommentsCount);

    const handleImageSelect = (file: File) => {
        setCommentMediaImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if ((commentContent.trim() || commentMediaImage)) {
                handleSubmitComment();
            }
        }
    };

    const handleRemoveImage = () => {
        setCommentMediaImage(null);
        setImagePreview(null);
    };

    const handleCommentContentChange = (content: string) => {
        setCommentContent(content);
        if (validationErrors.commentContent) {
            setValidationErrors(prev => ({ ...prev, commentContent: '' }));
        }
    };

    const handleSubmitComment = () => {
        const newCommentFormat: ICreateReportCommentRequest = {
            commentContent: commentContent,
            mediaFile: commentMediaImage || undefined,
            mediaType: commentMediaImage ? 'IMAGE' : undefined,
        };
        handleCreateReportComment(newCommentFormat);
    };

    const handleCreateReportComment = async (formData: ICreateReportCommentRequest) => {
        try {
            CreateReportCommentSchema.parse(formData);
            setValidationErrors({});
            
            onCreateReportComment(formData);
            setCommentContent('');
            setCommentMediaImage(null);
            setImagePreview(null);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        errors[issue.path[0].toString()] = issue.message;
                    }
                });
                setValidationErrors(errors);
            }
        }
    }

    const handleReplyComment = (formData: ICreateReportCommentRequest) => {
        try {
            CreateReportCommentSchema.parse(formData);
            setValidationErrors({});
            
            onCreateReportComment(formData);
            setCommentContent('');
            setCommentMediaImage(null);
            setImagePreview(null);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        errors[issue.path[0].toString()] = issue.message;
                    }
                });
                setValidationErrors(errors);
            }
        }
    }

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
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        Komentar ({reportCommentCounts || 0})
                    </h2>
                </div>
            </div>
            <div className="flex w-full gap-2 justify-center items-center">
                <div className="py-4 px-3 border-b border-gray-200 bg-gray-50 w-full">
                    <div className="flex-1">
                        {imagePreview && (
                            <ImagePreview 
                                preview={imagePreview}
                                onRemove={handleRemoveImage}
                                className="mb-3"
                            />
                        )}
                        
                        <div className="flex w-full gap-2 justify-center items-center">
                            <InlineImageUpload
                                preview={imagePreview}
                                onImageSelect={handleImageSelect}
                                onImageRemove={handleRemoveImage}
                                maxSizeMB={5}
                                buttonSize='sm'
                                buttonClassName='h-11'
                                previewPosition="separate"
                            />
                            <div className="flex-1">
                                <TextAreaField 
                                    id='commentContent'
                                    value={commentContent}
                                    onChange={(e) => {

                                            handleCommentContentChange(e.target.value);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder='Tulis komentar...'
                                    className='h-11'
                                    resize='none'
                                    withLabel={false}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex items-center gap-2 ">
                                <Button
                                    variant="primary"
                                    size='sm'
                                    onClick={handleSubmitComment}
                                    disabled={(!commentContent.trim() && !commentMediaImage) || isSubmitting}
                                    className='bg-transparent'
                                >
                                    {isSubmitting ? (
                                        <FaSpinner size={23} className='text-primary animate-spin' />
                                    ) : (
                                        <BiSend size={23} className='text-primary' />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {(validationErrors.commentContent || validationErrors.mediaFile) && (
                            <div className='flex flex-col gap-1 mt-2'>
                                {validationErrors.commentContent && (
                                    <p className="text-red-500 text-sm">
                                        {validationErrors.commentContent}
                                    </p>
                                )}
                                {validationErrors.mediaFile && (
                                    <p className="text-red-500 text-sm">
                                        {validationErrors.mediaFile}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CommentList
                comments={comments}
                onReply={handleReplyComment}
                hasMoreComments={hasMoreComments}
                isFetchingMoreComments={isFetchingMoreComments}
                onFetchingMoreComments={onFetchingMoreComments}
            />
        </div>
    );
};