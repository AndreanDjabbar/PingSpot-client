import React from 'react'
import { Breadcrumb } from '@/components';
import { useTranslations } from 'next-intl';

interface HeaderSectionProps {
    currentPath: string;
    message: string;
    children?: React.ReactNode;
    isCardHeader?: boolean;
    showBreadcrumb?: boolean;
}

const pathIds = [
    'home', 'map', 'explore', 'community', 'messages', 'activity',
    'settings', 'help', 'profile', 'notifications', 'security', 'reports',
    'create-report',
];

const HeaderSection: React.FC<HeaderSectionProps> = ({
    currentPath,
    message,
    children,
    isCardHeader = true,
    showBreadcrumb = true,
}) => {
    const t = useTranslations('component.header_section');
    const currentPathParts = currentPath.split("/").filter(Boolean);
    const currentPage = currentPathParts[1] || currentPathParts[currentPathParts.length - 1] || 'home';
    return (
        <div className={`${isCardHeader ? 'p-6 bg-white rounded-lg border border-gray-200 shadow-sm' : 'py-3 mb-4'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className='flex flex-col gap-3'>
                    {showBreadcrumb ? (
                        <Breadcrumb path={currentPath}/>
                    ) : (
                        <h1 className="text-2xl font-bold text-surface">
                            {pathIds.includes(currentPage) ? t(currentPage) : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                        </h1>
                    )}
                    <p className="text-surface text-sm">
                        {message || t('default_message')}
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}

export default HeaderSection
