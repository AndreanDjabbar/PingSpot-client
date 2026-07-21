/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { MdMailOutline } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import { InputField, ErrorSection, SuccessSection, Button } from "@/components";
import { useForm } from "react-hook-form";
import { IForgotPasswordEmailVerificationRequest } from "@/types/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDataResponseMessage, getErrorResponseDetails, getErrorResponseMessage } from "@/utils";
import { useEffect, useState } from "react";
import { useEmailVerification, useErrorToast, useSuccessToast } from "@/hooks";
import { useRouter } from "next/navigation";
import { ForgotPasswordEmailVerificationSchema } from "../Schema";

const ForgotPasswordPage = () => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IForgotPasswordEmailVerificationRequest>({
        resolver: zodResolver(ForgotPasswordEmailVerificationSchema)
    });
    
    const { mutate, isPending, isError, isSuccess, error, data, reset } = useEmailVerification();
    const router = useRouter();
    const [countdown, setCountdown] = useState<number | null>(null);
    
    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isError && error) {
            const errorDetails = getErrorResponseDetails(error) as any;
            const countdownValue = errorDetails?.retry_after_seconds || null;
            
            if (countdownValue && countdown === null) {
                setCountdown(countdownValue);
            }
        } else {
            setCountdown(null);
        }
    }, [isError, error, countdown]);

    useEffect(() => {
        if (countdown === null || countdown <= 0) {
            setCountdown(null);
            reset();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev !== null ? prev - 1 : null);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);
    
    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, data, router]);

    const onSubmit = (data: IForgotPasswordEmailVerificationRequest) => {
        mutate({ ...data });
    };
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-surface">Lupa Kata Sandi?</h1>
                <p className="text-surface">Masukan email anda agar kami dapat mengirimkan link untuk mengatur ulang kata sandi</p>
            </div>

            {isSuccess && (
                <SuccessSection message={getDataResponseMessage(data)}/>
            )}

            {isError && (
                <ErrorSection 
                message={countdown !== null ? `Silakan coba lagi dalam ${countdown} detik.` : getErrorResponseMessage(error)}/>
            )}
            
            {!isSuccess && (
                <>
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <InputField
                                id="email"
                                name="email"
                                type="email"
                                register={register("email")}
                                className="w-full"
                                withLabel={true}
                                labelTitle="Alamat Email"
                                icon={<MdMailOutline size={20} />}
                                placeHolder="Masukkan email Anda"
                            />
                            <div className="text-danger-dark text-sm font-semibold">{errors.email?.message as string}</div>
                        </div>
                        
                        <p className="text-center text-sm text-surface">
                            Sudah punya akun?{' '}
                            <a href="/auth/login" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors duration-200 cursor-pointer">
                                Masuk
                            </a>
                        </p>

                        <Button
                            className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium "
                            type="submit"
                            loadingText="Mengirim.."
                            isLoading={isPending}
                        >
                            Kirim Email
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-background text-surface">Atau lanjutkan dengan</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-muted rounded-lg shadow-sm bg-white text-sm font-medium text-surface hover:bg-muted focus:outline-none focus:ring focus:ring-primary cursor-pointer transition-all duration-300"
                                onClick={() => window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || ''}
                            >
                                <FaGoogle size={20}/>
                                <span className="ml-2">Google</span>
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-sm text-surface">
                    Belum punya akun?{' '}
                    <a href="/auth/register" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors duration-200 cursor-pointer">
                        Daftar gratis
                    </a>
                    </p>
                </>
            )}
        </div>
        );
    };
export default ForgotPasswordPage;