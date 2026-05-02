/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
"use client";

import React, { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { SiGmail } from "react-icons/si";
import { PingspotLogo } from '../UI';
import { cn } from '@/lib';

interface FooterProps {
    bottomNavHeightPosition?: number;
}

const Footer: React.FC<FooterProps> = ({ bottomNavHeightPosition = 0 }) => {
    const currentYear = new Date().getFullYear();
    const footerRef = React.useRef<HTMLDivElement>(null);
    const [logoSize, setLogoSize] = useState(200);

    useEffect(() => {
        const updateLogoSize = () => {
            if (window.innerWidth < 640) {
                setLogoSize(150);
            } else if (window.innerWidth < 1024) {
                setLogoSize(180);
            } else {
                setLogoSize(200);
            }
        };

        updateLogoSize();
        window.addEventListener('resize', updateLogoSize);
        return () => window.removeEventListener('resize', updateLogoSize);
    }, []);

    return (
        <footer 
        className={cn("bg-pingspot relative border-l border-white xl:h-(--dynamic-height) h-auto")}
        style={{ ['--dynamic-height' as any]: `${bottomNavHeightPosition}px` } as React.CSSProperties}
        ref={footerRef}
        >
            <div className="px-4 flex flex-col justify-center items">
                <div className='flex flex-col py-1 px-8 gap-10'>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 sm:gap-8 lg:gap-12">
                        <div className='flex gap-15 justify-between w-full items-center pt-3 px-3'>
                            <div className="flex flex-col items-center">
                                <div className="lg:w-40 sm:w-30 md:w-35 w-20">
                                    <PingspotLogo size={logoSize} variant='full' color='white' />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 items-center lg:items-start">
                                <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">
                                    Hubungi Pengembang
                                </h3>
                                <div className="space-y-3 sm:space-y-3 w-full max-w-sm group">
                                    <a 
                                        href="mailto:andreanjabar18@gmail.com"
                                        className="flex items-center gap-2 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
                                    >
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center shadow-lg">
                                            <SiGmail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="text-xs sm:text-sm lg:text-base font-medium truncate pr-1">
                                                andreanjabar18@gmail.com
                                            </p>
                                        </div>
                                    </a>
                                    <a 
                                        href="https://github.com/AndreanDjabbar"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg text-white hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
                                    >
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center shadow-lg ">
                                            <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400">GitHub</p>
                                            <p className="text-xs sm:text-sm lg:text-base font-medium truncate pr-1">
                                                @AndreanDjabbar
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-full border-t border-white/30 mb-2 sm:mb-7"></div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 text-xs sm:text-sm lg:text-base mb-3 sm:mb-3">
                            <span>© {currentYear} PingSpot.</span>
                            <div>
                                <span>Dikembangkan oleh </span>
                                <a
                                    href="https://github.com/AndreanDjabbar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-white hover:border-b hover:border-white cursor-pointer"
                                >
                                    Andrean Gusman Djabbar
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;