"use client";

import React from 'react';
import { BiSend } from 'react-icons/bi';
import { FaSpinner } from 'react-icons/fa';
import { ImagePreview, InlineImageUpload, TextAreaField, Button } from '@/components';

interface CommentInputProps {
    commentContent: string;
    commentMediaImage?: File | null;
    imagePreview?: string | null;
    validationErrors?: Record<string, string>;
    isSubmitting?: boolean;
    onCommentContentChange: (content: string) => void;
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    onSubmitComment: () => void;
    className?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
    commentContent,
    commentMediaImage = null,
    imagePreview = null,
    validationErrors = {},
    isSubmitting = false,
    onCommentContentChange,
    onImageSelect,
    onImageRemove,
    onSubmitComment,
    className = '',
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (commentContent.trim() || commentMediaImage) {
                onSubmitComment();
            }
        }
    };

    return (
        <div className={`py-6 px-3 border-b border-gray-200 bg-gray-50 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    {imagePreview && (
                        <ImagePreview 
                            preview={imagePreview}
                            onRemove={onImageRemove}
                            className="mb-3"
                        />
                    )}
                    
                    <div className="flex w-full gap-2 justify-center items-center">
                        {(
                            <InlineImageUpload
                                preview={imagePreview}
                                onImageSelect={onImageSelect}
                                onImageRemove={onImageRemove}
                                maxSizeMB={5}
                                buttonSize='sm'
                                buttonClassName='h-11'
                                previewPosition="separate"
                            />
                        )}
                        <div className="flex-1">
                            <TextAreaField 
                                id='commentContent'
                                value={commentContent}
                                onChange={(e) => {
                                    onCommentContentChange(e.target.value);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder='Tulis komentar...'
                                className='h-11'
                                resize='none'
                                withLabel={false}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="primary"
                                size='sm'
                                onClick={onSubmitComment}
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
    );
};

export default CommentInput;