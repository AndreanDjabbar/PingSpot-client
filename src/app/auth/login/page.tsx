'use client';
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { Button, InputField, ErrorSection, SuccessSection } from "@/components";
import { useForm } from "react-hook-form";
import { ILoginRequest } from "@/types/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../Schema";
import { useLogin, useErrorToast, useSuccessToast } from "@/hooks";
import { getDataResponseMessage, getErrorResponseDetails, getErrorResponseMessage } from "@/utils";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const LoginPage = () => {
    const router = useRouter();
    const t = useTranslations('auth.login');

    const { mutate, isPending, isError, isSuccess, error, data } = useLogin();

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<ILoginRequest>({
        resolver: zodResolver(LoginSchema)
    });

    const onSubmit = (data: ILoginRequest) => {
        mutate({ ...data, provider: "EMAIL" });
    };

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/main/home");
            }, 1500);
        }
    }, [isSuccess, data, router]);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="">{t('subtitle')}</p>
            </div>

            {isSuccess && (
                <SuccessSection message={getDataResponseMessage(data)}/>
            )}

            {isError && (
                <ErrorSection 
                message={getErrorResponseMessage(error)} 
                errors={getErrorResponseDetails(error)}/>
            )}
            
            {!isSuccess && (
                <>
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <InputField
                                id="emailOrUsername"
                                name="emailOrUsername"
                                type="text"
                                register={register("emailOrUsername")}
                                className="w-full"
                                withLabel={true}
                                labelTitle={t('email_or_username.label')}
                                icon={<MdMailOutline size={20} />}
                                placeHolder={t('email_or_username.placeholder')}
                            />
                            <div className="text-danger-dark text-sm font-semibold">{errors.emailOrUsername?.message as string}</div>
                        </div>
                        <div>
                            <InputField
                                id="password"
                                name="password"
                                type={'password'}
                                register={register("password")}
                                className="w-full"
                                withLabel={true}
                                labelTitle={t('password.label')}
                                icon={<LuLockKeyhole size={20} />}
                                placeHolder={t('password.placeholder')}
                                showPasswordToggle={true}
                            />
                            <div className="text-danger-dark text-sm font-semibold">{errors.password?.message as string}</div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                            <a href="/auth/forgot-password" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors duration-200 cursor-pointer">
                                {t('forgot_password')}
                            </a>
                            </div>
                        </div>

                        <Button
                            className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium "
                            title={t('submit.default')}
                            type="submit"
                            loadingText={t('submit.loading')}
                            isLoading={isPending}
                        >
                            {t('submit.default')}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-background">{t('divider')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-muted rounded-lg shadow-sm bg-white text-sm font-medium hover:bg-muted focus:outline-none focus:ring focus:ring-primary cursor-pointer transition-all duration-300"
                                onClick={() => window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || ''}
                            >
                                <FaGoogle size={20}/>
                                <span className="ml-2">{t('google')}</span>
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-sm text-surface">
                    {t('no_account.text')}{' '}
                    <a href="/auth/register" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors cursor-pointer duration-200">
                        {t('no_account.link')}
                    </a>
                    </p>
                </>
            )}
        
        </div>
        );
    };
export default LoginPage;