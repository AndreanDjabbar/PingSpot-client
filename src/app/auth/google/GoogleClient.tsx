"use client";
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks';
import { SuccessSection } from '@/components';
import { useTranslations } from 'next-intl';

const GoogleAuthClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('auth.google');

    const status = searchParams.get('status');

    const { toastSuccess } = useToast();

    useEffect(() => {
        if (status) {
            if (status === '202') {
                setTimeout(() => {
                    router.push("/main/home");
                }, 1500);
                toastSuccess(t('toast_verified'));
            } else {
                router.push("/auth/login");
            }
        }
    }, [status, toastSuccess, router, t]);
    
    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-surface">{t('title')}</h1>
                <p className="text-surface">{t('subtitle')}</p>
            </div>
            {status === '202' && (
                <SuccessSection message={t('success_message')} />
            )}
        </div>
    );
}

export default GoogleAuthClient;