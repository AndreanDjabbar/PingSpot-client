/* eslint-disable react/display-name */
"use client";

import { BiX } from "react-icons/bi";
import { ProfileBadge } from "../UI";
import { FaInbox } from "react-icons/fa";
import { IoMdHome, IoMdWarning } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import { useConfirmationModalStore, useGlobalStore, useUserProfileStore } from "@/stores";
import React, { useEffect, useRef } from "react";
import { IoSettings } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { ImExit } from "react-icons/im";
import { useErrorToast, useLogout, useSuccessToast } from "@/hooks";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onBottomNavHeightChange?: (position: number) => void;
}

interface NavigationItem {
    id: string;
    label: string;
    icon: IconType;
    badge?: string;
}

interface SidebarButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    item: NavigationItem;
    isActive: boolean;
    onClick: () => void;
}


const ButtonSidebar = React.forwardRef<HTMLButtonElement, SidebarButton>(({ 
    item,
    isActive,
    onClick,
    className,
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            onClick={onClick}
            className={`
                w-full flex items-center px-4 py-3 rounded-xl
                transition-all duration-200 group relative cursor-pointer
                ${isActive
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10 hover:text-muted'
                }
                ${className || ''}`}
            {...props}
        >
            <item.icon size={20} />
            <>
                <span className="ml-3 font-medium">{item.label}</span>
                {item.badge && (
                <span className="ml-auto bg-danger text-background text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {item.badge}
                </span>
                )}
            </>
            {item.badge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
            </span>
            )}
        </button>
    )
})

const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Beranda', icon: IoMdHome },
    { id: 'explore', label: 'Jelajahi', icon: FaMagnifyingGlass },
    { id: 'notifications', label: 'Notifikasi', icon: FaInbox },
    { id: 'reports', label: 'Laporan', icon: IoMdWarning,  },
    // { id: 'map', label: 'Peta Interaktif', icon: FaMap },
    { id: 'settings', label: 'Pengaturan', icon: IoSettings },
    // { id: 'help', label: 'Bantuan', icon: IoMdHelpCircle },
    // { id: 'community', label: 'Komunitas', icon: FaUsers },
    // { id: 'messages', label: 'Pesan', icon: LuMessageCircle, badge: '12' },
    // { id: 'activity', label: 'Aktivitas', icon: LuActivity },
]

const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    onToggle, 
    onBottomNavHeightChange 
}) => {
    const router = useRouter();
    const currentPath = usePathname().split('/')[2] || 'home';
    const { setCurrentPage } = useGlobalStore();
    const user = useUserProfileStore(state => state.userProfile);
    const bottomNavRef = useRef<HTMLDivElement>(null);
    const openConfirm = useConfirmationModalStore((state) => state.openConfirm);
    const { mutate: logout, isPending, isError, error, isSuccess, data } = useLogout();

    const logoutConfirmationModal = () => {
        openConfirm({
            type: "warning",
            title: "Konfirmasi Keluar",
            subtitle: "Apakah Anda yakin ingin keluar?",
            isPending: isPending,
            description: "Anda akan keluar dari sesi Pingspot saat ini.",
            confirmTitle: "Keluar",
            onConfirm: () => confirmLogout(),
        });
    }
    const confirmLogout = () => {
        logout();
    };

    const handleLogout = () => {
        logoutConfirmationModal();
    };

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, router]);

    useEffect(() => {
        const updateBorderPosition = () => {
            if (bottomNavRef.current && onBottomNavHeightChange) {
                const rect = bottomNavRef.current.getBoundingClientRect();
                onBottomNavHeightChange(rect.height);
            }
        };

        updateBorderPosition();
        window.addEventListener('resize', updateBorderPosition);

        return () => {
            window.removeEventListener('resize', updateBorderPosition);
        };
    }, [onBottomNavHeightChange]);

    return (
        <>
            <div className={`
                fixed left-0 w-70 h-full inset-y-0  z-50 
                bg-primary 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? '' : '-translate-x-full xl:translate-x-0'}
            `}>
                <div className="h-full flex flex-col ">
                    {isOpen && (
                        <div className={`block absolute top-1 right-1 cursor-pointer hover:bg-white/10 rounded-full p-1 transition-all duration-200`} onClick={onToggle}>
                            <BiX size={25} className="text-white hover:text-muted" />
                        </div>
                    )}
                    <div className="flex flex-col h-full">
                        <div className={`p-4 border-b border-white`}>
                            <div className="">
                                <ProfileBadge
                                    name={user?.username || 'User'}
                                    email={user?.email || 'User@email.com'}
                                    followers={123}
                                    imageUrl={user?.profilePicture}
                                    following={456}
                                    size="md"
                                    onClick={() => router.push('/main/settings/profile')}
                                />
                            </div>
                        </div>

                        <div className="">
                            <nav className="flex flex-col px-4 py-6 gap-3">
                                {navigationItems.map((item) => (
                                    <ButtonSidebar
                                        key={item.id}
                                        item={item}
                                        isActive={item.id === currentPath}
                                        onClick={() => {
                                            onToggle();
                                            router.push(`/main/${item.id}`)
                                            setCurrentPage(item.id);
                                        }}
                                    />
                                ))}
                                <ButtonSidebar
                                    item={{
                                        id: 'logout',
                                        label: 'Keluar',
                                        icon: ImExit
                                    }}
                                    disabled={isPending}
                                    isActive={false}
                                    onClick={handleLogout}
                                    className="mt-45"
                                />
                            </nav>    
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
                onClick={onToggle}
                />
            )}
        </>
    )
}

export default Sidebar;