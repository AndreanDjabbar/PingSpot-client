/* eslint-disable react-hooks/rules-of-hooks */
"use client";

export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { BiLock, BiEnvelope, BiUser, BiCog } from 'react-icons/bi';
import { MdOutlineLanguage, MdOutlineMarkEmailUnread } from 'react-icons/md';
import { useErrorToast, useSuccessToast, useLogout, useGetFollowData } from '@/hooks';
import { useRouter, usePathname } from 'next/navigation';
import { ImExit } from 'react-icons/im';
import { IoIosNotifications } from "react-icons/io";
import { useUserProfileStore, useConfirmationModalStore } from '@/stores';
import { SettingCard, SettingItem } from './components';
import { Button, ToggleSwitch, HeaderSection, ProfileBadge } from '@/components';
import { useLocale, useTranslations } from 'next-intl';

const SettingsPage = () => {
    const t = useTranslations('settings');
    const locale = useLocale();
    const router = useRouter();
    const currentPath = usePathname();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState(locale);

    const user = useUserProfileStore(state => state.userProfile);
    const openConfirm = useConfirmationModalStore((state) => state.openConfirm);

    const {
        isPending: isFetchingFollowData,
        isError: isErrorFetchingFollowData,
        error: errorFetchingFollowData,
        data: followData
    } = useGetFollowData(Number(user?.userID) || 0, 'user');
    const followingCount = followData?.data?.followingCount || 0;
    const followersCount = followData?.data?.followersCount || 0;

    const { mutate: logout, isPending, isError, error, isSuccess, data } = useLogout();

    const languages = [
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'en', name: 'English' },
    ];

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
    };

    const confirmationModal = () => {
        openConfirm({
            type: "danger",
            title: t('logout_modal.title'),
            subtitle: t('logout_modal.subtitle'),
            isPending: isPending,
            description: t('logout_modal.description'),
            confirmTitle: t('logout_modal.confirm'),
            onConfirm: () => confirmLogout(),
        });
    }

    const changeLanguageConfirmationModal = (langCode: string) => {
        openConfirm({
            type: "warning",
            title: t('change_language_modal.title'),
            subtitle: t('change_language_modal.subtitle'),
            description: t('change_language_modal.description', {
                language: languages.find(lang => lang.code === langCode)?.name || '',
            }),
            confirmTitle: t('change_language_modal.confirm'),
            onConfirm: () => handleLanguageChange(langCode),
        });
    }
    
    const confirmLogout = () => {
        logout();
    };

    const handleLogout = () => {
        confirmationModal();
    };

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);
    useErrorToast(isErrorFetchingFollowData, errorFetchingFollowData);

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, router]);
    
    return (
        <div className="space-y-8">
            <HeaderSection
            currentPath={currentPath || '/main/settings'}
            isCardHeader={false}
            showBreadcrumb={false}
            message={t('description')}/>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SettingCard title={t('account_profile_card')} icon={BiUser}>
                <div className="flex flex-col gap-6">
                    <div className='p-4 rounded-lg flex flex-col gap-4 border border-muted '>
                        <ProfileBadge 
                        name={user?.username || ''}
                        followers={isFetchingFollowData ? undefined : followersCount}
                        following={isFetchingFollowData ? undefined : followingCount}
                        imageUrl={user?.profilePicture}       
                        email={user?.email || 'Andreanjabar19@gmail.com'}                 
                        textColors={{ 
                            name: 'text-gray-900', 
                            email: 'text-gray-500', 
                            profileRing: 'ring-gray-300',
                            followers: 'text-gray-900',
                            following: 'text-gray-900', 
                        }}
                        />
                        <Button className='border border-gray-300 text-gray-900 w-fit bg-white hover:bg-gray-100 transition-all duration-200 '
                        variant='outline'
                        onClick={() => router.push(`/main/profile/${user?.username}`)}>
                            {t('look_profile')}
                        </Button>
                    </div>
                    <div className=''>
                        <SettingItem
                        title={t('edit_profile.title')}
                        description={t('edit_profile.description')}
                        icon={BiUser}
                        action={
                            <Button
                            onClick={() => router.push('/main/settings/profile')}
                            className="px-3 py-1 text-sm w-full md:w-auto"
                            variant='outline'
                            >
                                {t('edit')}
                            </Button>
                        }
                        />
                        <SettingItem
                        title={t('edit_security.title')}
                        description={t('edit_security.description')}
                        icon={BiLock}
                        action={
                            <Button
                            onClick={() => router.push('/main/settings/security')}
                            className="px-3 py-1 text-sm w-full"
                            variant='outline'
                            >
                                {t('edit')}
                            </Button>
                        }
                        />
                        <SettingItem
                        title={t('email_label')}
                        description={user?.email || ''}
                        icon={BiEnvelope}
                        />
                    </div>
                </div>
                </SettingCard>

                <SettingCard title={t('general_preferences_card')} icon={BiCog}>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-surface mb-3">{t('language')}</h3>
                        <div className="flex flex-col space-y-2">
                            {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguageConfirmationModal(lang.code)}
                                className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                                selectedLanguage === lang.code
                                    ? 'border-primary bg-background text-primary'
                                    : 'border-muted hover:bg-background'
                                }`}
                            >
                                <MdOutlineLanguage className="mr-2 text-primary" />
                                <span>{lang.name}</span>
                            </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-surface mb-3">{t('notifications_section_title')}</h3>
                        <div className="flex flex-col space-y-2">
                            <SettingItem
                            icon={IoIosNotifications}
                            title={t('notifications.title')}
                            description={t('notifications.description')}
                            action={
                                <ToggleSwitch
                                enabled={notificationsEnabled}
                                onChange={() => {
                                    setNotificationsEnabled(!notificationsEnabled);
                                }}
                                />
                            }
                            />
                            <SettingItem
                            title={t('email_notifications.title')}
                            icon={MdOutlineMarkEmailUnread}
                            description={t('email_notifications.description')}
                            action={
                                <ToggleSwitch
                                enabled={emailNotificationsEnabled}
                                onChange={() => {
                                    setEmailNotificationsEnabled(!emailNotificationsEnabled);
                                }}
                                />
                            }
                            />
                        </div>
                    </div>

                    <Button
                    onClick={handleLogout}
                    className='w-full'
                    variant='danger'
                    disabled={isPending}
                    icon={<ImExit className={`w-5 h-5 ${isPending ? 'animate-pulse' : ''}`}/>}
                >
                    <span>{isPending ? t('logging_out') : t('logout')}</span>
                </Button>

                </div>
                </SettingCard>
            </div>
        </div>
    );
};

export default SettingsPage