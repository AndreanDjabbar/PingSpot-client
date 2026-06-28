"use client";

import React from 'react';
import Link from 'next/link';
import { IReportCommentMentions, IUserProfile } from '@/types';

interface MentionTextProps {
    text: string;
    commentUserID: number;
    className?: string;
    commentMentions?: IReportCommentMentions[];
    userMentioned: IUserProfile | null;
}

const MentionText: React.FC<MentionTextProps> = ({ 
    text, 
    commentUserID,
    className = "",
    commentMentions = [],
    userMentioned 
}) => {
    const parseMentionsFormat = (commentContent: string): React.ReactNode[] => {
        const mentionRegex = /(\[mention:\d+\])/g;
        const parts = commentContent.split(mentionRegex);

        return parts.map((part, index) => {
            const match = part.match(/\[mention:(\d+)\]/);
            if (match) {
                const userID = match[1];
                const mention = commentMentions.find((m) => String(m.userID) === userID);
                
                if (mention) {
                    return (
                        <Link 
                            key={index}
                            href={`/main/profile/${mention.username}`}
                            className="text-primary hover:text-primary/80 font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            @{mention.username}
                        </Link>
                    );
                }
            }
            return part;
        });
    };

    return (
        <span className={className}>
            {userMentioned && Number(userMentioned.userID) !== commentUserID ? (
                <div className='flex gap-1 items-center flex-wrap'>
                    <Link
                        href={`/main/profile/${userMentioned.username}`}
                        className="text-primary hover:text-primary/80 font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        @{userMentioned.username}
                    </Link>
                    {parseMentionsFormat(text)}
                </div>
            ) : (
                <>
                    {parseMentionsFormat(text)}
                </>
            )}
        </span>
    );
};

export default MentionText;