/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect } from 'react';
import { z } from 'zod';
import { BiSend } from 'react-icons/bi';
import { FaSpinner, FaUser } from 'react-icons/fa';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { InfiniteData } from '@tanstack/react-query';
import { InlineImageUpload, TextAreaField, Button, Scrollbar } from '@/components';
import { getErrorResponseMessage, getImageURL } from '@/utils';
import { CreateReportCommentSchema } from '@/app/main/schema';
import { ICreateReportCommentRequest, ISearchUsersResponse } from '@/types';
import { useUserProfileStore } from '@/stores';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface SelectedMentions {
    userID: string;
    username: string;
}

interface CommentInputProps {
    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    isSubmitting?: boolean;
    searchUsersData: InfiniteData<ISearchUsersResponse> | undefined;
    setSearchTermChange: React.Dispatch<React.SetStateAction<string>>;
    setIsSearchUsersOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchUsersLoading?: boolean;
    isFetchingSearchUsers?: boolean;
    isSearchUsersError?: boolean;
    hasNextPageSearchUsers?: boolean;
    isFetchingNextPageSearchUsers?: boolean;
    refetchSearchUsers?: () => void;
    fetchNextPageSearchUsers?: () => void;
    errorSearchUsers?: Error;
    className?: string;
    onImageSelect?: (file: File) => void;
    onImageRemove?: () => void;
    imagePreview?: string | null;
    commentMediaImage?: File | null;
    replyTo?: {
        userID: string;
        username: string;
    } | null;
}

const suggestionDropdownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
        scale: 0.98,
        filter: 'blur(4px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 420,
            damping: 30,
            mass: 0.7,
        },
    },
    exit: {
        opacity: 0,
        y: 6,
        scale: 0.98,
        filter: 'blur(4px)',
        transition: {
            duration: 0.16,
            ease: 'easeOut',
        },
    },
};

const MIN_DROPDOWN_HEIGHT = 120;
const MAX_DROPDOWN_HEIGHT = 224;
const VIEWPORT_PADDING = 16;

const CommentInput: React.FC<CommentInputProps> = ({
    onCreateReportComment,
    isSubmitting = false,
    searchUsersData,
    setSearchTermChange,
    setIsSearchUsersOpen,
    isSearchUsersLoading,
    isFetchingSearchUsers,
    hasNextPageSearchUsers,
    fetchNextPageSearchUsers,
    isFetchingNextPageSearchUsers,
    isSearchUsersError,
    errorSearchUsers,
    className = '',
    onImageSelect,
    onImageRemove,
    imagePreview,
    commentMediaImage,
    replyTo = null
}) => {
    const [commentContent, setCommentContent] = React.useState('');
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [suggestionPosition, setSuggestionPosition] = React.useState({ top: 0, right: 0 });
    const [suggestionsWidth, setSuggestionsWidth] = React.useState<number | undefined>(undefined);
    const [suggestionsMaxHeight, setSuggestionsMaxHeight] = React.useState<number>(MAX_DROPDOWN_HEIGHT);
    const [selectedMentions, setSelectedMentions] = React.useState<SelectedMentions[]>([]);

    const currentUser = useUserProfileStore((s) => s.userProfile);
    const textAreaRef = React.useRef<HTMLDivElement>(null);
    const suggestionsRef = React.useRef<HTMLDivElement>(null);

    const suggestions = searchUsersData?.pages.flatMap(page => page.data?.usersData.usersData || []) || [];
    const isSuggestionsStale = isFetchingSearchUsers || isSearchUsersLoading;

    const recalculatePosition = React.useCallback(() => {
        if (!textAreaRef.current) return;

        const rect = textAreaRef.current.getBoundingClientRect();
        const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
        const availableAbove = rect.top - VIEWPORT_PADDING;
        const preferTop = availableBelow < 220 && availableAbove > availableBelow;

        const maxHeight = Math.max(
            MIN_DROPDOWN_HEIGHT,
            Math.min(MAX_DROPDOWN_HEIGHT, preferTop ? availableAbove : availableBelow)
        );
        const suggestionsHeight = Math.min(
            suggestionsRef.current?.offsetHeight ?? maxHeight,
            maxHeight
        );

        const top = preferTop
            ? Math.max(VIEWPORT_PADDING, rect.top - suggestionsHeight - 8)
            : rect.bottom + 8;

        setSuggestionsMaxHeight(maxHeight);
        setSuggestionPosition({
            top,
            right: window.innerWidth - rect.right - 6,
        });
        setSuggestionsWidth(textAreaRef.current.offsetWidth);
    }, []);

    const handleSuggestionsScroll = React.useCallback((element: HTMLElement) => {
        const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 24;

        if (isNearBottom && hasNextPageSearchUsers && !isFetchingNextPageSearchUsers) {
            fetchNextPageSearchUsers?.();
        }
    }, [hasNextPageSearchUsers, isFetchingNextPageSearchUsers, fetchNextPageSearchUsers]);

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
        if (!showSuggestions || !suggestionsRef.current) return;

        const observer = new ResizeObserver(() => {
            recalculatePosition();
        });
        observer.observe(suggestionsRef.current);

        return () => observer.disconnect();
    }, [showSuggestions, recalculatePosition]);

    useEffect(() => {
        if (!showSuggestions || !suggestionsRef.current) return;

        const scrollNode = suggestionsRef.current.querySelector('.simplebar-content-wrapper');
        if (!scrollNode) return;

        const handleScroll = () => {
            handleSuggestionsScroll(scrollNode as HTMLElement);
        };

        scrollNode.addEventListener('scroll', handleScroll);
        return () => {
            scrollNode.removeEventListener('scroll', handleScroll);
        };
    }, [showSuggestions, handleSuggestionsScroll]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (textAreaRef.current && !textAreaRef.current.contains(event.target as Node)) {
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

    const handleRemoveImage = () => {
        if (onImageRemove) {
            onImageRemove();
        }
    };

    const handleImageSelect = (file: File) => {
        if (onImageSelect) {
            onImageSelect(file);
        }
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

        setSelectedMentions((prev) => prev.filter(user => content.includes(`@${user.username}`)));

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
            if (textAfterAt.includes(' ')) {
                setShowSuggestions(false);
                return;
            }
            setIsSearchUsersOpen(true);
            setShowSuggestions(true);
            setSearchTermChange(textAfterAt);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === '@') {
            const cursorPosition = e.currentTarget.selectionStart ?? commentContent.length;
            const textBeforeCursor = commentContent.slice(0, cursorPosition);
            const currentToken = textBeforeCursor.split(/\s/).pop() || '';

            if (currentToken.includes('@')) {
                e.preventDefault();
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (commentContent.trim() || commentMediaImage) {
                handleSubmitComment();
            }
        }
    };

    const handleSubmitComment = () => {
        let updatedCommentContent = commentContent;
        selectedMentions.forEach(mention => {
            const mentionedFormat = `[mention:${mention.userID}]`;
            const mentionRegex = new RegExp(`@${mention.username}(?!\\w)`, 'g');
            updatedCommentContent = updatedCommentContent.replace(mentionRegex, mentionedFormat);
        });

        const newCommentFormat: ICreateReportCommentRequest = {
            commentContent: updatedCommentContent,
            mediaFile: commentMediaImage || undefined,
            mediaType: commentMediaImage ? 'IMAGE' : undefined,
        };

        try {
            CreateReportCommentSchema.parse(newCommentFormat);
            setValidationErrors({});
            onCreateReportComment(newCommentFormat);
            setCommentContent('');
            setSelectedMentions([]);
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

    const handleSelectMention = (user: { userID: string | number; username: string }) => {
        const textarea = textAreaRef.current?.querySelector('textarea');
        const cursorPosition = textarea?.selectionStart ?? commentContent.length;
        const textBeforeCursor = commentContent.slice(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const newText =
                textBeforeCursor.slice(0, lastAtIndex) +
                '@' + user.username + ' ' +
                commentContent.slice(cursorPosition);
            setCommentContent(newText);
        }

        setShowSuggestions(false);
        setIsSearchUsersOpen(false);
        setSelectedMentions(prev => [...prev, { userID: user.userID.toString(), username: user.username }]);
    };

    return (
        <div className={`flex-1 ${className}`}>
            <div className="flex w-full gap-2 justify-center items-center">
                <InlineImageUpload
                    preview={imagePreview || null}
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
                        placeholder={`${(replyTo && replyTo.username !== currentUser?.username) ? `Balas ke @${replyTo.username}` : 'Tulis komentar...'}`}
                        className='h-11'
                        resize='none'
                        withLabel={false}
                        disabled={isSubmitting}
                    />

                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div
                                ref={suggestionsRef}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={suggestionDropdownVariants}
                                className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 will-change-transform"
                                style={{
                                    position: 'fixed',
                                    top: suggestionPosition.top,
                                    right: suggestionPosition.right,
                                    width: suggestionsWidth,
                                    maxHeight: suggestionsMaxHeight,
                                    transformOrigin: 'top right',
                                }}
                            >
                                <Scrollbar height={suggestionsMaxHeight}>
                                    {isSuggestionsStale ? (
                                        <div className="p-3 text-sm text-primary flex items-center gap-2">
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
                                        <AnimatePresence>
                                            {suggestions.map((user) => (
                                                <motion.div
                                                    key={user.userID}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => handleSelectMention(user)}
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
                                                </motion.div>
                                            ))}
                                            {hasNextPageSearchUsers && (
                                                <div className="py-4 flex justify-center border-t border-gray-200">
                                                    {isFetchingNextPageSearchUsers && (
                                                        <div className="flex items-center space-x-2 text-primary/70">
                                                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                                            <span className="text-sm">Memuat lebih banyak...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </Scrollbar>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                        <p className="text-red-500 text-sm">{validationErrors.commentContent}</p>
                    )}
                    {validationErrors.mediaFile && (
                        <p className="text-red-500 text-sm">{validationErrors.mediaFile}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentInput;