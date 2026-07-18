"use client";
import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import Footer from './Footer';
import { useUserProfileStore, useConfirmationModalStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Scrollbar from './Scrollbar';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebarCollapsed?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bottomNavHeightPosition, setBottomNavHeightPosition] = useState(0);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const loadUser = useUserProfileStore((state) => state.loadUser);
    const router = useRouter();

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    const openEditProfileConfirm = () => {
        openConfirm({
            title: "Perbarui Informasi Profil",
            description: "Profil Anda masih belum lengkap. Anda perlu memperbarui informasi profil anda.",
            onConfirm: () => {
                router.push("/main/settings/profile");
            },
            confirmTitle: "Perbarui Profil",
        });
    };

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (userProfile && !userProfile.isCompleteProfile) {
            openEditProfileConfirm();
        }
    }, [userProfile]);

    const handleBottomNavHeightChange = (position: number) => {
        setBottomNavHeightPosition(position);
    };

    return (
        <div className="flex flex-col">
            <TopNavigation onMenuToggle={toggleSidebar} />

            <div className="flex overflow-hidden bg-background h-screen w-full">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onToggle={closeSidebar} 
                    onBottomNavHeightChange={handleBottomNavHeightChange}
                />
                <div className="flex-1 min-w-0 bg-violet-50 xl:ml-70">
                    <Scrollbar>
                        <div className="px-5">
                            {children}
                        </div>
                    </Scrollbar>
                </div>
            </div>
        </div>
    )
}
export default MainLayout