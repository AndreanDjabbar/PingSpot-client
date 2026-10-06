"use client";

import React from 'react'
import { PingspotLogo, SelectField } from '@/components/UI'
import BackgroundTheme from './BackgroundTheme'
import { Scrollbar } from "@/components";
import { FaGlobe } from 'react-icons/fa';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useConfirmationModalStore } from '@/stores';

const AuthLayout: React.FC<React.PropsWithChildren> = ({
    children
}) => {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations('settings');
    const openConfirm = useConfirmationModalStore((state) => state.openConfirm);

    const languages = [
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'en', name: 'English' },
    ];

    const handleLanguageChange = (langCode: string) => {
        document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
    };

    const changeLanguageConfirmationModal = (langCode: string) => {
        if (langCode === locale) return;

        openConfirm({
            type: 'warning',
            title: t('change_language_modal.title'),
            subtitle: t('change_language_modal.subtitle'),
            description: t('change_language_modal.description', {
                language: languages.find((language) => language.code === langCode)?.name || '',
            }),
            confirmTitle: t('change_language_modal.confirm'),
            onConfirm: () => handleLanguageChange(langCode),
        });
    };

    return (
    <div className="flex min-h-screen">
        <div className="w-full lg:w-1/2 flex flex-col h-screen">
            <Scrollbar>
                    <div className="py-3 px-6 flex items-center justify-between">
                        <div className="w-17">
                            <PingspotLogo
                                size={160}
                                variant='full'
                                className='h-full w-full object-cover'
                            />
                        </div>
                        <div className="">
                            <SelectField 
                            id={''} 
                            icon={<FaGlobe className='text-primary'/>}
                            options={[{ value: 'id', label: 'Indonesia' }, { value: 'en', label: 'English' }]}
                            value={locale}
                            onChange={changeLanguageConfirmationModal}
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center px-2 sm:px-8 md:px-15 lg:px-10">
                        <div className="p-4 w-full">
                            {children}
                        </div>
                    </div>
            </Scrollbar>
        </div>
        <div className="w-1/2 hidden lg:block">
            <BackgroundTheme />
        </div>
    </div>
)
}

export default AuthLayout