/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaReply, FaHeart, FaRegHeart, FaChevronUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { useImagePreviewModalStore } from '@/stores';
import { useGetReportCommentReplies } from '@/hooks';
import MentionText from './MentionText';
import { Button } from '@/components/UI';
import { IReportComment, ICreateReportCommentRequest, IMentionedUser, ISearchUsersResponse } from '@/types';
import { ImagePreview } from '@/components/';
import CommentInput from './CommentInput';
import { InfiniteData } from '@tanstack/react-query';

interface CommentItemProps {
    comment: IReportComment;
    commentReplies?: IReportComment[];
    onChangeCommentReplies?: (replies: IReportComment[]) => void;
    level?: number;
    availableUsers?: IMentionedUser[];

    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    isSubmitting?: boolean;
    searchUsersData: InfiniteData<ISearchUsersResponse> | undefined;
    setSearchTermChange: React.Dispatch<React.SetStateAction<string>>;
    setIsSearchUsersOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchUsersLoading?: boolean;
    isFetchingSearchUsers?: boolean;
    isSearchUsersError?: boolean;
    errorSearchUsers?: Error;
    className?: string;
    onImageRemove?: () => void;
    imagePreview?: string | null;
    commentMediaImage?: File | null;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    level = 0, 
    availableUsers = [],
    onCreateReportComment,
    isSubmitting,
    searchUsersData,
    setSearchTermChange,
    setIsSearchUsersOpen,
    isSearchUsersLoading,
    isFetchingSearchUsers,
    isSearchUsersError,
    errorSearchUsers,
    className,
    onImageRemove,
    imagePreview,
    commentMediaImage
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyMediaImage, setReplyMediaImage] = useState<File | null>(null);
    const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<IReportComment[]>([]);
    const loadMoreButtonRef = useRef<HTMLDivElement>(null);
    const openPreviewModal = useImagePreviewModalStore((s) => s.openImagePreview);

    const { 
        data: repliesData,
        isLoading: repliesLoading,
        fetchNextPage: fetchMoreReplies,
        hasNextPage: hasMoreReplies,
        isFetchingNextPage: isFetchingMoreReplies,
    } = useGetReportCommentReplies(
        comment.commentID,
        showReplies && !comment.parentCommentID
    );

    useEffect(() => {
        if (repliesData) {
            const allReplies = repliesData.pages.flatMap(page => page.data?.replies.replies || []);
            setReplies(allReplies);
        }
    }, [repliesData]);
    
    const handleToggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const handleSubmitComment = (formData: ICreateReportCommentRequest) => {
        if(onCreateReportComment) {
            setReplyMediaImage(null);
            setReplyImagePreview(null);
            formData.threadRootID = comment.threadRootID || comment.commentID;
            formData.parentCommentID = comment.commentID;
            onCreateReportComment(formData);
            setIsReplying(false);
            setShowReplies(true);
            if (hasMoreReplies) {
                setTimeout(() => {
                    loadMoreButtonRef.current?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 100);
            }
        }
    }

    const handleImageSelect = (file: File) => {
        setReplyMediaImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setReplyImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setReplyMediaImage(null);
        setReplyImagePreview(null);
    };

    const handleImageClick = (imageURL: string) => {
        openPreviewModal(imageURL);
    };

    const marginLeft = Math.min(level * 16, 32);
    
    const isMediaComment = comment.media && (comment.media.type === 'IMAGE' || comment.media.type === 'gif');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
            style={{ marginLeft: `${marginLeft}px` }}
        >
            <div className="flex space-x-2">
                <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full overflow-hidden border border-gray-200`}>
                        <Image 
                            src={getImageURL(comment.userInformation?.profilePicture || '', "user")}
                            alt={comment.userInformation?.fullName || 'User'}
                            width={24}
                            height={24}
                            className="object-cover h-full w-full"
                        />
                    </div>
                </div>
                
                <div className="flex-1 min-w-0 ">
                    <div className="flex flex-wrap items-baseline gap-1">
                        <span className="font-semibold text-sm text-gray-900 shrink-0">
                            {comment.userInformation?.username || 'User'}
                        </span>
                        <span className="text-sm text-gray-800 break-words">
                            {!isMediaComment && (
                                <MentionText 
                                commentUserID={Number(comment.userInformation?.userID || 0)}
                                text={comment.content || ""}
                                userMentioned={comment.replyTo || null} 
                                commentMentions={comment.mentions || []}
                                />
                            )}
                        </span>
                    </div>
                    {isMediaComment && (
                        <div className="mt-1">
                            <div className="flex flex-col gap-1">
                                <div className="relative rounded-lg overflow-hidden max-w-[200px] sm:max-w-[240px]">
                                    <Image
                                        src={comment.commentType === 'TEMP' ? (comment.media?.url || '') : getImageURL(`/report/comments/${(comment.media?.url || '')}`, "main")}
                                        alt="Comment media"
                                        onClick={() => handleImageClick(getImageURL(`/report/comments/${(comment.media?.url || '')}`, "main"))}
                                        width={comment?.media?.width || 200}
                                        height={comment?.media?.height || 150}
                                        className="object-cover w-full h-auto cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm text-gray-800 break-words">
                                    <MentionText 
                                    commentUserID={Number(comment.userInformation?.userID || 0)}
                                    text={comment.content || ""}
                                    userMentioned={comment.replyTo || null} 
                                    commentMentions={comment.mentions || []}
                                    />
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-gray-400">
                            {formattedDate(comment.createdAt, { formatStr: 'dd MMM yyyy, HH:mm' })}
                        </span>
                        <p className="text-xs text-gray-400 font-medium">72 Suka</p>
                        <button
                            onClick={() => {
                                setIsReplying(true)
                                setShowReplies(true);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
                        >
                            Balas
                        </button>
                        {comment.totalReplies !== undefined && comment.totalReplies > 0 && (
                            <button
                                onClick={handleToggleReplies}
                                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer"
                            >
                                {showReplies ? (
                                    <FaChevronUp className="w-3 h-3" />
                                ) : (
                                    <FaReply className="w-3 h-3" />
                                )}
                                <span>
                                    {showReplies ? 'Sembunyikan' : `${comment.totalReplies} ${comment.totalReplies === 1 ? 'balasan' : 'balasan'}`}
                                </span>
                            </button>
                        )}
                    </div>
                    
                    {isReplying && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 ml-4"
                        >
                            <div className="flex flex-col w-full">
                                {replyImagePreview && (
                                    <div className="mb-1">
                                        <ImagePreview 
                                            preview={replyImagePreview}
                                            onRemove={() => {
                                                setReplyMediaImage(null);
                                                setReplyImagePreview(null);
                                            }}
                                        />
                                    </div>
                                )}
                                <div className='flex items-center '>
                                    <div className="flex-1 flex gap-2 justify-center items-center">
                                        <CommentInput 
                                            onCreateReportComment={handleSubmitComment} 
                                            searchUsersData={searchUsersData} 
                                            setSearchTermChange={setSearchTermChange} 
                                            setIsSearchUsersOpen={setIsSearchUsersOpen} 
                                            isSearchUsersLoading={isSearchUsersLoading} 
                                            isFetchingSearchUsers={isFetchingSearchUsers} 
                                            isSearchUsersError={isSearchUsersError} 
                                            errorSearchUsers={errorSearchUsers} 
                                            className={className} 
                                            onImageSelect={handleImageSelect}
                                            onImageRemove={handleRemoveImage} 
                                            imagePreview={replyImagePreview} 
                                            commentMediaImage={replyMediaImage} 
                                            replyTo={comment.userInformation || null}
                                            />
                                    </div>
                                </div>
                                <div className="flex justify-start space-x-2 mt-2">
                                    <Button
                                        onClick={() => {
                                            setIsReplying(false);
                                            setReplyMediaImage(null);
                                            setReplyImagePreview(null);
                                        }}
                                        variant='outline'
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {showReplies && (
                        <div className="mt-4">
                            {repliesLoading && (
                                <div className="text-sm text-gray-500 ml-4">
                                    Memuat balasan...
                                </div>
                            )}
                            <div className="flex flex-col gap-3">
                                {replies.map((reply) => (
                                    <CommentItem
                                        key={reply.commentID}
                                        comment={reply}
                                        level={level + 1}
                                        availableUsers={availableUsers}
                                        onCreateReportComment={onCreateReportComment}
                                        isSubmitting={isSubmitting}
                                        searchUsersData={searchUsersData}
                                        setSearchTermChange={setSearchTermChange}
                                        setIsSearchUsersOpen={setIsSearchUsersOpen}
                                        isSearchUsersLoading={isSearchUsersLoading}
                                        isFetchingSearchUsers={isFetchingSearchUsers}
                                        isSearchUsersError={isSearchUsersError}
                                        errorSearchUsers={errorSearchUsers}
                                        className={className}
                                        onImageRemove={onImageRemove}
                                        imagePreview={imagePreview}
                                        commentMediaImage={commentMediaImage}
                                    />
                                ))}
                            </div>
                            <div ref={loadMoreButtonRef}>
                                {hasMoreReplies && !repliesLoading && (
                                    <button
                                        onClick={() => fetchMoreReplies()}
                                        disabled={isFetchingMoreReplies}
                                        className="ml-4 mt-2 text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                                    >
                                        {isFetchingMoreReplies ? 'Memuat...' : 'Muat lebih banyak'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className='flex flex-col items-center'>
                    <div>
                        {liked ? <FaHeart className="w-4 h-4 text-red-500" /> : <FaRegHeart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />}
                    </div>
                    <div className="text-xs text-gray-500">
                        72
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CommentItem;