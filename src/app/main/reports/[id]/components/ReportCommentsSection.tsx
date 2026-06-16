"use client";

import React, { useEffect } from 'react';
import { IReportComment, ICreateReportCommentRequest, ISearchUsersResponse } from '@/types';
import { z } from 'zod';
import { CreateReportCommentSchema } from '@/app/main/schema';
import { Button, ErrorSection, ImagePreview, InlineImageUpload, TextAreaField } from '@/components';
import { getErrorResponseDetails, getErrorResponseMessage, getImageURL, isInternalServerError } from '@/utils';
import { useReportsStore } from '@/stores';
import { CommentList } from '../../components';
import { FaSpinner, FaUser } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { InfiniteData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    searchUsersData,
    isSearchUsersError,
    isFetchingSearchUsers,
    errorSearchUsers,
}) => {
    const [commentContent, setCommentContent] = React.useState('');
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [suggestionPosition, setSuggestionPosition] = React.useState({ top: 0, right: 0 });
    const [suggestionsWidth, setSuggestionsWidth] = React.useState<number | undefined>(undefined);

    const router = useRouter();
    const textAreaRef = React.useRef<HTMLDivElement>(null);
    const suggestionsRef = React.useRef<HTMLDivElement>(null);

    const suggestions = searchUsersData?.pages.flatMap(page => page.data?.usersData.usersData || []) || [];

    const isSuggestionsStale = isFetchingSearchUsers || isSearchUsersLoading;

    const reportCommentCounts = useReportsStore((state) => state.reportCommentsCount);

    const recalculatePosition = React.useCallback(() => {
        if (textAreaRef.current) {
            const rect = textAreaRef.current.getBoundingClientRect();
            const availableBelow = window.innerHeight - rect.bottom;
            const availableAbove = rect.top;
            const preferTop = availableBelow < 220 && availableAbove > availableBelow;
            const suggestionsHeight = suggestionsRef.current?.offsetHeight ?? 230;
            setSuggestionPosition({
                top: preferTop ? availableAbove - suggestionsHeight - 8 : rect.bottom + 8,
                right: window.innerWidth - rect.right - 6,
            });
            setSuggestionsWidth(textAreaRef.current.offsetWidth);
        }
    }, []);

    useEffect(() => {
        if (!showSuggestions) return;

        const handleScroll = (event: Event) => {
            const target = event.target;

            if (textAreaRef.current && !textAreaRef.current.contains(target as Node)) {
                setShowSuggestions(false);
            }
        };
        recalculatePosition();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', recalculatePosition);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', recalculatePosition);
        };
    }, [showSuggestions, recalculatePosition, suggestions.length, isSuggestionsStale, isSearchUsersError]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                textAreaRef.current &&
                !textAreaRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowSuggestions(false);
        };

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [showSuggestions]);

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

    const handleCommentContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const content = e.target.value;
        setIsSearchUsersOpen(false);
        const textBeforeCursor = content.slice(0, e.target.selectionStart);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        setCommentContent(content);
        if (validationErrors.commentContent) {
            setValidationErrors(prev => ({ ...prev, commentContent: '' }));
        }
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
            if (textAfterAt.includes(' ')) {
                setShowSuggestions(false);
                return;
            }
            if (setIsSearchUsersOpen && setSearchTermChange) {
                setIsSearchUsersOpen(true);
                setShowSuggestions(true);
                setSearchTermChange(textAfterAt);
            }
        } else {
            setShowSuggestions(false);
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
    };

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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        Komentar ({reportCommentCounts || 0})
                    </h2>
                </div>
            </div>
            <div className="flex w-full gap-2 justify-center items-center relative">
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
                            <div className="flex-1 relative" ref={textAreaRef}>
                                <TextAreaField 
                                    id='commentContent'
                                    value={commentContent}
                                    onChange={handleCommentContentChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder='Tulis komentar...'
                                    className='h-11'
                                    resize='none'
                                    withLabel={false}
                                    disabled={isSubmitting}
                                />

                                {showSuggestions && (
                                    <div
                                        ref={suggestionsRef}
                                        className="max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                                        style={{
                                            position: 'fixed',
                                            top: suggestionPosition.top,
                                            right: suggestionPosition.right,
                                            width: suggestionsWidth,
                                        }}
                                    >
                                        {isSuggestionsStale ? (
                                            <div className="p-3 text-sm text-gray-400 flex items-center gap-2">
                                                <FaSpinner className="animate-spin" />
                                                Mencari pengguna...
                                            </div>
                                        ) : isSearchUsersError ? (
                                            <div className="p-3 text-sm text-red-500">
                                                {getErrorResponseMessage(errorSearchUsers || "Gagal mencari pengguna.")}
                                            </div>
                                        ) : suggestions.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-400">
                                                Tidak ada pengguna ditemukan
                                            </div>
                                        ) : (
                                            <div>
                                                {suggestions.map((user) => (
                                                    <div key={user.userID}>
                                                        <div
                                                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                                            onClick={() => {
                                                                router.push(`/main/profile/${user.username}`);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {user.profilePicture ? (
                                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                                        <Image
                                                                            src={getImageURL(user.profilePicture, 'user')}
                                                                            alt={user.fullName}
                                                                            width={40}
                                                                            height={40}
                                                                            className="object-cover w-full h-full rounded-full"
                                                                        />
                                                                    </div>
                                                                ) : (
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
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