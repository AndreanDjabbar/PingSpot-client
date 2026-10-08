"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { VerificationSchema } from '../Schema';
import { useForm } from 'react-hook-form';
import { useVerification, useErrorToast, useSuccessToast } from '@/hooks';
import { ErrorSection, SuccessSection } from '@/components';
import { getDataResponseDetails, getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { IVerificationRequest } from '@/types';
import { useTranslations } from 'next-intl';

const VerificationClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('auth.email_verification');

    const code1 = searchParams.get('code1');
    const userId = searchParams.get('userId');
    const code2 = searchParams.get('code2');

    const { mutate, isPending, isError, isSuccess, error, data } = useVerification();

    const { 
        formState: { } 
    } = useForm<IVerificationRequest>({
        resolver: zodResolver(VerificationSchema)
    });

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (code1 && userId && code2) {
            mutate({
                code1,
                userId,
                code2
            });
        }
    }, [code1, userId, code2, mutate]);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, data, router]);

    if (!code1 || !userId || !code2) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-surface">{t('title')}</h1>
                    <p className="text-surface">{t('subtitle')}</p>
                </div>
                <ErrorSection 
                    message={t('invalid_link')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-surface">{t('title')}</h1>
                <p className="text-surface">{t('subtitle')}</p>
            </div>
            
            {isPending && (
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-surface"></div>
                    <p className="mt-2 text-surface">{t('verifying')}</p>
                </div>
            )}
            
            {isSuccess && (
                <SuccessSection 
                message={t('success.title')}
                data={() => {
                    const {username} = getDataResponseDetails(data);
                    return t('success.welcome', { username });
                }}/>
            )}
            
            {isError && (
                <ErrorSection 
                    message={getErrorResponseMessage(error) || t('failed_fallback')}
                    errors={getErrorResponseDetails(error)}
                />
            )}
        </div>
    )
}

export default VerificationClient;