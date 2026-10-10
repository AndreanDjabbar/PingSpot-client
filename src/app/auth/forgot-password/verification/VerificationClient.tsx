"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { SuccessSection, ErrorSection } from '@/components/feedback';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLinkVerification, useResetPassword, useErrorToast, useSuccessToast } from '@/hooks';
import { Button, InputField } from '@/components';
import { LuLockKeyhole } from 'react-icons/lu';
import { IForgotPasswordResetPasswordRequest } from '@/types';
import { createForgotPasswordResetPasswordSchema } from '../../Schema';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { useTranslations } from 'next-intl';

const VerificationClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('auth.forgot_password_verification');
    const tSchema = useTranslations('schema.auth');
    const resetPasswordSchema = createForgotPasswordResetPasswordSchema(tSchema);

    const code = searchParams.get('code');
    const email = searchParams.get('email');

    const { mutate: resetPassword, isPending, isError, isSuccess, error, data } = useResetPassword();
    const { 
        mutate: verifyLink, 
        isPending: isPendingVerify, 
        isError: isErrorVerify, 
        isSuccess: isSuccessVerify, 
        error: errorVerify, 
    } = useLinkVerification();

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IForgotPasswordResetPasswordRequest>({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = (formData: IForgotPasswordResetPasswordRequest) => {
        resetPassword({ 
            ...formData,
            email: email || '',
        });
    };

    useErrorToast(isError, error);
    useErrorToast(isErrorVerify, errorVerify);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (email && code) {
            verifyLink({
                code,
                email
            });
        }
    }, [code, email, verifyLink]);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
    }, [isSuccess, data, router]);

    useEffect(() => {
        if (isErrorVerify && errorVerify) {
            console.error("Link verification error:", errorVerify);
            setTimeout(() => {
                router.push("/auth/forgot-password");
            }, 2000);
        }
    }, [isErrorVerify, errorVerify, router]);

    if (!code || !email) {
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

    if (isPendingVerify) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-surface">{t('title')}</h1>
                    <p className="text-surface">{t('verifying.subtitle')}</p>
                </div>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-surface"></div>
                    <p className="mt-2 text-surface">{t('verifying.message')}</p>
                </div>
            </div>
        );
    }

    if (isErrorVerify) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-surface">{t('title')}</h1>
                    <p className="text-surface">{t('verify_failed.subtitle')}</p>
                </div>
                <ErrorSection 
                    message={getErrorResponseMessage(errorVerify) || t('verify_failed.fallback_message')}
                    errors={getErrorResponseDetails(errorVerify)}
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
            
            {isSuccess && (
                <SuccessSection 
                    message={t('success.title')}
                    data={() => {
                        return t('success.description');
                    }}
                />
            )}
            
            {isError && (
                <ErrorSection 
                    message={getErrorResponseMessage(error) || t('reset_failed')}
                    errors={getErrorResponseDetails(error)}
                />
            )}

            {!isSuccess && isSuccessVerify && (
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <InputField
                            id="password"
                            name="password"
                            type={'password'}
                            register={register("password")}
                            className="w-full"
                            withLabel={true}
                            labelTitle={t('new_password.label')}
                            icon={<LuLockKeyhole size={20} />}
                            placeHolder={t('new_password.placeholder')}
                            showPasswordToggle={true}
                        />
                        {errors.password?.message && (
                            <div className="text-danger-dark text-sm font-semibold mt-1">
                                {errors.password.message}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <InputField
                            id="passwordConfirmation"
                            register={register("passwordConfirmation")}
                            type="password"
                            className="w-full"
                            withLabel={true}
                            labelTitle={t('new_password_confirmation.label')}
                            icon={<LuLockKeyhole size={20}/>} 
                            placeHolder={t('new_password_confirmation.placeholder')}
                            showPasswordToggle={true}
                        />
                        {errors.passwordConfirmation?.message && (
                            <div className="text-danger-dark text-sm font-semibold mt-1">
                                {errors.passwordConfirmation.message}
                            </div>
                        )}
                    </div>

                    <Button
                        className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium"
                        type='submit'
                        loadingText={t('submit.loading')}
                        isLoading={isPending}
                    >      
                    {t('submit.default')}
                    </Button>
                </form>
            )}

            <div className="text-center">
                <p className="text-sm ">
                    {t('back_to_login.text')}{' '}
                    <a href="/auth/login" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors duration-200 cursor-pointer">
                        {t('back_to_login.link')}
                    </a>
                </p>
            </div>
        </div>
    )
}

export default VerificationClient;