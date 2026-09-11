"use client";
import React, { useCallback, useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { useUserProfileStore, useConfirmationModalStore } from '@/stores';
import { useRouter } from 'next/navigation';
import Scrollbar from './Scrollbar';
import { useTranslations } from 'next-intl';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebarCollapsed?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const t = useTranslations('component.layout.main_layout');
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const loadUser = useUserProfileStore((state) => state.loadUser);
    const router = useRouter();

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    const openEditProfileConfirm = useCallback(() => {
        openConfirm({
            title: t('edit_profile_confirm.title'),
            description: t('edit_profile_confirm.description'),
            onConfirm: () => {
                router.push("/main/settings/profile");
            },
            confirmTitle: t('edit_profile_confirm.confirm_button'),
        });
    }, [openConfirm, router, t]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (userProfile && !userProfile.isCompleteProfile) {
            openEditProfileConfirm();
        }
    }, [userProfile, openEditProfileConfirm]);

    return (
        <div className="flex flex-col">
            <TopNavigation onMenuToggle={toggleSidebar} />
            <div className="flex overflow-hidden bg-background h-screen w-full">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onToggle={closeSidebar} 
                />
                <div className="flex-1 min-w-0 xl:ml-70 mt-18 xl:mt-0">
                    <Scrollbar >
                        <div className="p-5">
                            {children}
                        </div>
                    </Scrollbar>
                </div>
            </div>
        </div>
    )
}
export default MainLayout