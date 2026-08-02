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

const SettingsPage = () => {
    const router = useRouter();
    const currentPath = usePathname();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('id');

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
    };

    const confirmationModal = () => {
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
            message='Sesuaikan PingSpot dengan preferensi Anda untuk pengalaman yang lebih baik.'/>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SettingCard title="Akun & Profil" icon={BiUser}>
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
                            Lihat Profil
                        </Button>
                    </div>
                    <div className=''>
                        <SettingItem
                        title="Edit Profil Pengguna"
                        description="Edit informasi profil, foto, dan preferensi Anda"
                        icon={BiUser}
                        action={
                            <Button
                            onClick={() => router.push('/main/settings/profile')}
                            className="px-3 py-1 text-sm w-full md:w-auto"
                            variant='outline'
                            >
                                Edit
                            </Button>
                        }
                        />
                        <SettingItem
                        title="Keamanan Akun"
                        description="Ubah password dan pengaturan keamanan"
                        icon={BiLock}
                        action={
                            <Button
                            onClick={() => router.push('/main/settings/security')}
                            className="px-3 py-1 text-sm w-full"
                            variant='outline'
                            >
                                Edit
                            </Button>
                        }
                        />
                        <SettingItem
                        title="Email"
                        description={user?.email || ''}
                        icon={BiEnvelope}
                        />
                    </div>
                </div>
                </SettingCard>

                <SettingCard title="Preferensi Umum" icon={BiCog}>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-surface mb-3">Bahasa</h3>
                        <div className="flex flex-col space-y-2">
                            {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
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
                        <h3 className="font-medium text-surface mb-3">Notifikasi</h3>
                        <div className="flex flex-col space-y-2">
                            <SettingItem
                            icon={IoIosNotifications}
                            title="Notifikasi"
                            description="Aktifkan atau nonaktifkan semua notifikasi"
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
                            title="Notifikasi Email"
                            icon={MdOutlineMarkEmailUnread}
                            description="Terima notifikasi melalui email"
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
                    <span>{isPending ? 'Keluar...' : 'Keluar'}</span>
                </Button>

                </div>
                </SettingCard>
            </div>
        </div>
    );
};

export default SettingsPage