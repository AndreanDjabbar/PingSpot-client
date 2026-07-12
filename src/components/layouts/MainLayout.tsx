"use client";
import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import Footer from './Footer';
import { useUserProfileStore, useConfirmationModalStore } from '@/stores';
import { useRouter } from 'next/navigation';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebarCollapsed?: boolean;
}

interface MainContentProps {
    children?: React.ReactNode;
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
        <div className="h-screen flex flex-col ">
            <TopNavigation onMenuToggle={toggleSidebar} />

            <div className="flex flex-1 overflow-hidden bg-background">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onToggle={closeSidebar} 
                    onBottomNavHeightChange={handleBottomNavHeightChange}
                />

                <div className={`flex-1 overflow-y-auto`}>
                    <MainContent>{children}</MainContent>
                    {/* <Footer 
                    bottomNavHeightPosition={bottomNavHeightPosition}
                    /> */}
                </div>

                <div>
                </div>
            </div>
        </div>
    )
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    return (
        <main className="flex-1 min-h-screen">
            <div className="h-full py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default MainLayout