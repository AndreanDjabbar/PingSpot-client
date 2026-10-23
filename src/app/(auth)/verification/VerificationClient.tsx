"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useVerification } from '@/hooks/api/useAuth';
import { useErrorToast, useSuccessToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { createVerificationSchema } from '@/schemas/auth.schema';
import { getDataResponseDetails, getErrorResponseDetails, getErrorResponseMessage } from '@/utils/api';
import { IVerificationRequest } from '@/types/api/auth';
import { SuccessSection } from '@/components/feedback/SuccessSection';
import { ErrorSection } from '@/components/feedback/ErrorSection';

const VerificationClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('auth.email_verification');
    const tSchema = useTranslations('schema.auth');
    const verificationSchema = createVerificationSchema(tSchema);

    const code1 = searchParams.get('code1');
    const userId = searchParams.get('userId');
    const code2 = searchParams.get('code2');

    const { mutate, isPending, isError, isSuccess, error, data } = useVerification();

    const { 
        formState: { } 
    } = useForm<IVerificationRequest>({
        resolver: zodResolver(verificationSchema)
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
                router.push("/login");
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