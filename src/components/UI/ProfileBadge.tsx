"use client";

import React from 'react';
import Image from 'next/image';
import { getImageURL } from '@/utils';

interface TextColorProps {
    name?: string;
    email?: string;
    profileRing?: string;
    followers?: string;
    following?: string;
}

interface ProfileBadgeProps {
    name: string;
    email?: string;
    imageUrl?: string;
    followers?: number;
    following?: number;
    size?: 'sm' | 'md' | 'lg';
    showStats?: boolean;
    onClick?: () => void;
    className?: string;
    textColors?: TextColorProps;
}

const ProfileBadge: React.FC<ProfileBadgeProps> = ({
    name,
    email,
    imageUrl="",
    followers,
    following,
    size = 'md',
    showStats = true,
    onClick,
    className = '',
    textColors = { 
        name: 'text-white', 
        email: 'text-white',
        profileRing: 'ring-white', 
        followers: 'text-white',
        following: 'text-white',
    },
}) => {
    const sizeClasses = {
        sm: {
            container: 'gap-2',
            avatar: 'w-10 h-10',
            icon: 'w-6 h-6',
            name: 'text-sm',
            email: 'text-xs',
            stats: 'text-xs',
        },
        md: {
            container: 'gap-3',
            avatar: 'w-12 h-12',
            icon: 'w-7 h-7',
            name: 'text-base',
            email: 'text-sm',
            stats: 'text-xs',
        },
        lg: {
            container: 'gap-4',
            avatar: 'w-16 h-16',
            icon: 'w-10 h-10',
            name: 'text-lg',
            email: 'text-base',
            stats: 'text-sm',
        },
    };

    const currentSize = sizeClasses[size];

    return (
        <div
            className={`flex items-center ${currentSize.container} ${
                onClick ? 'cursor-pointer rounded-xl p-2 transition-all duration-200 group' : ''
            } ${className}`}
            onClick={onClick}
        >

            <div className={`${currentSize.avatar} rounded-full flex items-center justify-center overflow-hidden ring-2 ${textColors.profileRing} shadow-lg flex-shrink-0`}>
                <Image
                    src={getImageURL(imageUrl, 'user')}
                    alt={name}
                    width={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
                    height={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className={`${currentSize.name} font-bold ${textColors.name} truncate group-hover:text-muted`}>
                    {name}
                </div>
                {email && (
                    <div className={`${currentSize.email} ${textColors.email} group-hover:text-muted truncate`}>
                        {email}
                    </div>
                )}
                {showStats && (followers !== undefined || following !== undefined) && (
                    <div className={`flex items-center gap-2 ${currentSize.stats} text-gray-400 mt-1`}>
                        {followers !== undefined && (
                            <div className="flex items-center gap-1">
                                <span className={`font-semibold ${textColors.followers}`}>{followers}</span>
                                <span className={`text-gray-500`}>Pengikut</span>
                            </div>
                        )}
                        {followers !== undefined && following !== undefined && (
                            <span className={`text-gray-500`}>•</span>
                        )}
                        {following !== undefined && (
                            <div className="flex items-center gap-1">
                                <span className={`font-semibold ${textColors.following}`}>{following}</span>
                                <span className={`text-gray-500`}>Mengikuti</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileBadge;
