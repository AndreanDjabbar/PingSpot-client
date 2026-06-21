/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaReply, FaHeart, FaRegHeart, FaChevronUp } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { useUserProfileStore, useImagePreviewModalStore } from '@/stores';
import { useGetReportCommentReplies } from '@/hooks';
import MentionInput from './MentionInput';
import MentionText from './MentionText';
import { Button } from '@/components/UI';
import { IReportComment, ICreateReportCommentRequest, IMentionedUser } from '@/types';
import { ImagePreview, InlineImageUpload } from '@/components/';

interface CommentItemProps {
    comment: IReportComment;
    commentReplies?: IReportComment[];
    onChangeCommentReplies?: (replies: IReportComment[]) => void;
    level?: number;
    availableUsers?: IMentionedUser[];
    onReply: (formData: ICreateReportCommentRequest) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    level = 0, 
    availableUsers = [],
    onReply,
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyMentions, setReplyMentions] = useState<number[]>([]);
    const [replyMediaImage, setReplyMediaImage] = useState<File | null>(null);
    const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<IReportComment[]>([]);
    
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);
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
        if (isReplying && replyInputRef.current) {
            replyInputRef.current.focus();
            setReplyContent(`@${comment.userInformation?.username || ''} `);
        }
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isReplying, isEditing, comment.userInformation?.username]);

    useEffect(() => {
        if (repliesData) {
            const allReplies = repliesData.pages.flatMap(page => page.data?.replies.replies || []);
            setReplies(allReplies);
        }
    }, [repliesData]);

    const handleToggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const parseMentionsFormat = (commentContent: string): string => {
        const mentions = comment.mentions || [];
        const mentionRegex = /\[mention:(\d+)\]/g;

        return commentContent.replace(mentionRegex, (match, userID) => {
            const mention = mentions.find((m) => String(m.userID) === userID);
            return mention ? `@${mention.username}` : match;
        });
    };

    const handleReply = () => {
        if (replyContent.trim() || replyMediaImage) {
            onReply({
                commentContent: replyContent,
                mediaFile: replyMediaImage || undefined,
                mediaType: replyMediaImage ? 'IMAGE' : undefined,
                threadRootID: comment.threadRootID || comment.commentID,
                parentCommentID: comment.commentID,
            });
            setReplyContent('');
            setReplyMentions([]);
            setReplyMediaImage(null);
            setReplyImagePreview(null);
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
    };

    const handleImageClick = (imageURL: string) => {
        openPreviewModal(imageURL);
    };

    const marginLeft = Math.min(level * 16, 32);

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
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-sm text-gray-900 shrink-0">
                            {comment.userInformation?.username || 'User'}
                        </span>
                        <span className="text-sm text-gray-800 break-words">
                            <MentionText 
                            commentUserID={Number(comment.userInformation?.userID || 0)}
                            text={parseMentionsFormat(comment.content || "")}
                            userMentioned={comment.replyTo || null} 
                            />
                        </span>
                    </div>
                    {comment.media && (
                        <div className="mt-2">
                            {comment.media.type === 'IMAGE' || comment.media.type === 'gif' ? (
                                <div className="relative rounded-lg overflow-hidden max-w-[200px]">
                                    <Image
                                        src={comment.commentType === 'TEMP' ? comment.media.url : getImageURL(`/report/comments/${comment.media.url}`, "main")}
                                        alt="Comment media"
                                        onClick={() => handleImageClick(getImageURL(`/report/comments/${comment?.media?.url}`, "main"))}
                                        width={comment?.media?.width || 200}
                                        height={comment?.media?.height || 150}
                                        className="object-cover w-full h-auto cursor-pointer"
                                    />
                                </div>
                            ) : null}
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-1">
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
                                    <div className="ml-8 mb-2">
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
                                        <InlineImageUpload
                                            preview={replyImagePreview}
                                            onImageSelect={(file) => {
                                                setReplyMediaImage(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setReplyImagePreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                            onImageRemove={() => {
                                                setReplyMediaImage(null);
                                                setReplyImagePreview(null);
                                            }}
                                            maxSizeMB={5}
                                            buttonSize='sm'
                                            buttonClassName='h-11'
                                            previewPosition="separate"
                                        />
                                            <MentionInput
                                                value={replyContent}
                                                onChange={setReplyContent}
                                                onMentionsChange={setReplyMentions}
                                                placeholder={`Balas ${comment.userInformation?.username || 'pengguna'}...`}
                                                rows={2}
                                                users={availableUsers}
                                                autoFocus
                                                onSubmit={handleReply}
                                            />
                                        <div className="flex items-center gap-2 ">
                                            <Button
                                                onClick={handleReply}
                                                size='sm'
                                                disabled={!replyContent.trim() && !replyMediaImage}
                                                className='bg-transparent'
                                            >
                                                <BiSend size={23} className="text-primary" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-start space-x-2 mt-2">
                                    <Button
                                        onClick={() => {
                                            setIsReplying(false);
                                            setReplyContent('');
                                            setReplyMentions([]);
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
                                        onReply={onReply}
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