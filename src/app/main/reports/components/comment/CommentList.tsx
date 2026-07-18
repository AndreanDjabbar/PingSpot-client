"use client";

import React, { useEffect } from 'react';
import { IReportComment, ICreateReportCommentRequest } from '@/types';
import { FaComment } from 'react-icons/fa';;
import { useInView } from 'react-intersection-observer';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import CommentItem from './CommentItem';
import { Scrollbar } from '@/components';

interface CommentListProps {
    comments: IReportComment[];
    onReply?: (formData: ICreateReportCommentRequest) => void;
    commentsLoading?: boolean;
    hasMoreComments?: boolean;
    isFetchingMoreComments?: boolean;
    onFetchingMoreComments?: () => void;
    emptyStateMessage?: string;
    className?: string;
}

const CommentList: React.FC<CommentListProps> = ({
    comments,
    onReply,
    commentsLoading = false,
    hasMoreComments = false,
    onFetchingMoreComments,
    isFetchingMoreComments = false,
    emptyStateMessage = 'Belum ada komentar',
    className = '',
}) => {
    const { ref, inView } = useInView({
        threshold: 0,
    })

    const handleFetchMoreComments = () => {
        if (onFetchingMoreComments) {
            onFetchingMoreComments();
        }
    }

    useEffect(() => {
        if (inView && hasMoreComments && !isFetchingMoreComments) {
            handleFetchMoreComments();
        }
    }, [inView, hasMoreComments, isFetchingMoreComments]);

    return (
            <Scrollbar className={`bg-white ${className} min-h-[200px]`} height={'400px'}>
                <div className="px-4 sm:px-6 py-5">
                    {commentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.commentID}
                                    comment={comment}
                                    onReply={onReply || (() => {})}
                                />
                            ))}
                            {hasMoreComments && (
                                <div ref={ref} className="p-6 text-center border-t border-gray-200">
                                    {isFetchingMoreComments && (
                                        <div className="flex items-center space-x-2 text-primary/70 w-full justify-center">
                                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                            <span className="text-sm">Memuat lebih banyak...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FaComment className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">{emptyStateMessage}</p>
                            <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama berkomentar!</p>
                        </div>
                    )}
                </div>
            </Scrollbar>
    );
};

export default CommentList;