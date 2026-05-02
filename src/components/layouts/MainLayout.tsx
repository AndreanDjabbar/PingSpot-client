"use client";
import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import Footer from './Footer';
import { useUserProfileStore } from '@/stores';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebarCollapsed?: boolean;
}

interface MainContentProps {
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    sidebarCollapsed = false, 
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bottomNavHeightPosition, setBottomNavHeightPosition] = useState(0);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleBottomNavHeightChange = (position: number) => {
        setBottomNavHeightPosition(position);
    };

    return (
        <div className="h-screen flex flex-col ">
            <TopNavigation onMenuToggle={toggleSidebar} />

            <div className="flex flex-1 overflow-hidden bg-background">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onToggle={toggleSidebar} 
                    collapsed={sidebarCollapsed}
                    onBottomNavHeightChange={handleBottomNavHeightChange}
                />

                <div className={`flex-1 overflow-y-auto`}>
                    <MainContent>{children}</MainContent>
                    <Footer 
                    bottomNavHeightPosition={bottomNavHeightPosition}
                    />
                </div>

                <div>
                </div>
            </div>
        </div>
    )
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    const loadUser = useUserProfileStore((state) => state.loadUser);
    
    useEffect(() => {
        loadUser();
    }, [loadUser]);

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