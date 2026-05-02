import React from 'react'
import { Breadcrumb } from '@/components';

interface HeaderSectionProps {
    currentPath: string;
    message: string;
    children?: React.ReactNode;
    isCardHeader?: boolean;
    showBreadcrumb?: boolean;
}

const paths = [
    { id: 'home', label: '🏠 Beranda',},
    { id: 'map', label: 'Peta Interaktif', },
    { id: 'explore', label: '🔍 Jelajahi', },
    { id: 'community', label: 'Komunitas', },
    { id: 'messages', label: 'Pesan', },
    { id: 'activity', label: 'Aktivitas', },
    { id: 'settings', label: '⚙️ Pengaturan', },
    { id: 'help', label: 'Bantuan' },
    { id: 'profile', label: 'Profil' },
    { id: 'notifications', label: '🔔 Notifikasi' },
    { id: 'security', label: 'Keamanan' },
    { id: 'reports', label: '📝 Laporan' },
    { id: 'create-report', label: 'Buat Laporan' },
]

const HeaderSection: React.FC<HeaderSectionProps> = ({
    currentPath,
    message = "Kelola pengaturan akun dan preferensi Anda di sini.",
    children,
    isCardHeader = true,
    showBreadcrumb = true,
}) => {
    const currentPathParts = currentPath.split("/").filter(Boolean);
    return (
        <div className={`${isCardHeader ? 'p-6 bg-white rounded-lg border border-gray-200 shadow-sm' : 'py-3 mb-4'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className='flex flex-col gap-3'>
                    {showBreadcrumb ? (
                        <Breadcrumb path={currentPath}/>
                    ) : (
                        <h1 className="text-2xl font-bold text-surface">
                            {paths.find((p) => p.id === currentPathParts[1])?.label || (currentPathParts.length > 0 ? currentPathParts[currentPathParts.length - 1].charAt(0).toUpperCase() + currentPathParts[currentPathParts.length - 1].slice(1) : 'Dashboard')}
                        </h1>
                    )}
                    <p className="text-surface text-sm">
                        {message}
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}

export default HeaderSection
