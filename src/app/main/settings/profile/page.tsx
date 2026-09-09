"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
    InputField, 
    DateTimeField, 
    RadioField, 
    ImageField, 
    TextAreaField, 
    SuccessSection, 
    ErrorSection, 
    Button,
    HeaderSection
} from '@/components';
import { IoPersonSharp } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import { SaveProfileSchema } from '../../schema';
import { ISaveProfileRequest } from '@/types/api/user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSaveProfile, useErrorToast, useSuccessToast } from '@/hooks';
import { useConfirmationModalStore, useUserProfileStore } from '@/stores';
import { useTranslations } from 'next-intl';
import { compressImages, getDataResponseMessage, getErrorResponseDetails, getErrorResponseMessage, getImageURL } from '@/utils';

const ProfilePage = () => {
    const currentPath = usePathname();
    const t = useTranslations('settings.profile');

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [birthdayDate, setBirthdayDate] = useState<string>('');
    const [removedProfilePicture, setRemovedProfilePicture] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const user = useUserProfileStore(state => state.userProfile);
    const openConfirm = useConfirmationModalStore((state) => state.openConfirm);

    const { mutate, isPending, isError, isSuccess, error, data } = useSaveProfile();

    const defaultValues = {
        fullName: user?.fullName || '',
        username: user?.username || '',
        gender: user?.gender as "male" | "female" | null | undefined,
        bio: user?.bio || '',
        birthday: user?.birthday || null,
        profilePicture: user?.profilePicture ? undefined : undefined
    };

    const { 
        register, 
        handleSubmit, 
        setValue,
        watch,
        formState: { errors } 
    } = useForm<ISaveProfileRequest>({
        resolver: zodResolver(SaveProfileSchema),
        defaultValues: defaultValues
    });

    const genderValue = watch('gender');
    
    const genderOptions = [
        { value: 'male', label: t('gender.options.male') },
        { value: 'female', label: t('gender.options.female') },
    ];
    const prepareFormData = async(formData: ISaveProfileRequest): Promise<FormData> => {
        const data = new FormData();

        data.append('fullName', formData.fullName);
        data.append('username', formData.username);
        
        if (formData.bio) {
            data.append('bio', formData.bio);
        }
        
        if (formData.birthday) {
            if (birthdayDate.trim() === "") {
                data.append("birthday", user?.birthday ? user.birthday : "");
            } else {
                const date = new Date(birthdayDate);
                const formatted = date.toISOString().split("T")[0];
                data.append("birthday", formatted);
            }
        }
        
        if (formData.gender) {
            data.append('gender', formData.gender);
        }
        
        if (profilePicture) {
            setIsCompressing(true);
            const compressedFile = await compressImages(profilePicture);
            data.append('profilePicture', compressedFile);
        } else {
            if (removedProfilePicture) {
                data.append('removeProfilePicture', 'true');
            } else if (user?.profilePicture) {
                data.append('defaultProfilePicture', user?.profilePicture ? user.profilePicture : '');
            }
        }
        return data;
    }
    
    const submitData = async(formData: ISaveProfileRequest) => {
        const preparedData = await prepareFormData(formData);
        setIsCompressing(false);
        mutate(preparedData);
    }

    const onSubmit = async (formData: ISaveProfileRequest) => {
        openConfirm({
            type: "info",
            title: t('confirm_modal.title'),
            subtitle: t('confirm_modal.subtitle'),
            isPending: isPending,
            description: t('confirm_modal.description'),
            confirmTitle: t('confirm_modal.confirm'),
            onConfirm: async() => await submitData(formData),  
        });
    };

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (user) {
            setValue('fullName', user.fullName || '');
            setValue('username', user.username || '');
            setValue('gender', user.gender as "male" | "female" | null | undefined);
            setValue('bio', user.bio || '');
            setValue('birthday', user.birthday || undefined);
            setBirthdayDate(user.birthday || '');
        }
    }, [user, setValue]);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                window.location.reload();
            }, 500)
        }
    }, [isSuccess, data]);

    return (
        <div className="space-y-8">
            <HeaderSection 
            currentPath={currentPath}
            isCardHeader={false}
            message={t('description')}/>

            {isSuccess && (
                <SuccessSection message={getDataResponseMessage(data)}/>
            )}

            {isError && (
                <ErrorSection 
                message={getErrorResponseMessage(error)} 
                errors={getErrorResponseDetails(error)}/>
            )}

            {!isSuccess && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                    <div className="">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center p-5 space-y-4  w-full gap-10" encType="multipart/form-data">
                            <div className='w-full flex flex-col gap-6 justify-between'>
                                <div className="w-full flex flex-col justify-center items-center">
                                    <ImageField
                                        id="profilePicture"
                                        withLabel={true}
                                        labelTitle={t('profile_picture.label')}
                                        usingCrop
                                        buttonTitle={t('profile_picture.button')}
                                        currentImage={getImageURL(user?.profilePicture || '', "user")}
                                        onChange={(file) => {
                                            setProfilePicture(file);                             
                                        }}
                                        onRemove={() => {
                                            setProfilePicture(null);
                                            setRemovedProfilePicture(true);
                                        }}
                                        shape="circle"
                                        height={160}
                                        width={160}
                                    />
                                    {profilePicture && (
                                        <div className="mt-2 text-sm text-green-600">
                                            {t('profile_picture.file_selected', { fileName: profilePicture.name })}
                                        </div>
                                    )}
                                    <div className="text-danger-dark text-sm font-semibold">{errors.profilePicture?.message as string}</div>
                                </div>

                                <div className='flex flex-col gap-6 md:flex-row'>
                                    <div className="w-full">
                                        <InputField
                                            id="fullName"
                                            register={register("fullName")}
                                            type="text"
                                            className="w-full"
                                            withLabel={true}
                                            labelTitle={t('full_name.label')}
                                            icon={<IoPersonSharp size={20}/>} 
                                            placeHolder={t('full_name.placeholder')}
                                        />
                                        <div className="text-danger-dark text-sm font-semibold">{errors.fullName?.message as string}</div>
                                    </div>
                                    <div className="w-full">
                                        <InputField
                                            id="username"
                                            register={register("username")}
                                            type="text"
                                            className="w-full"
                                            withLabel={true}
                                            labelTitle={t('username.label')}
                                            icon={<IoPersonSharp size={20}/>} 
                                            placeHolder={t('username.placeholder')}
                                        />
                                        <div className="text-danger-dark text-sm font-semibold">{errors.username?.message as string}</div>
                                    </div>
                                </div>
                                
                                <div className='flex flex-col gap-6 md:flex-row'>
                                    <div className='w-full'>
                                        <DateTimeField
                                            id="birthday"
                                            name="birthday"
                                            type="date"
                                            onChange={(e) => {
                                                setBirthdayDate(e.target.value);
                                                setValue("birthday", e.target.value);
                                            }}
                                            value={user?.birthday || ''}
                                            labelTitle={t('birthday.label')}
                                            icon={<FaCalendarAlt />}
                                            withLabel={true}
                                            max={"2023-12-31"}
                                            min={"1905-01-01"}
                                        />
                                        <div className="text-danger-dark text-sm font-semibold">{errors.birthday?.message as string}</div>
                                    </div>

                                    <div className='w-full'>
                                        <RadioField
                                            id="gender"
                                            name="gender"
                                            withLabel={true}
                                            register={register("gender")}
                                            labelTitle={t('gender.label')}
                                            options={genderOptions}
                                            value={genderValue || ''}
                                            onChange={(val) => {
                                                setValue("gender", val as "male" | "female");
                                            }}
                                            layout='horizontal'
                                        />
                                        <div className="text-danger-dark text-sm font-semibold">{errors?.gender?.message as string}</div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <TextAreaField
                                        id="bio"
                                        className="w-full"
                                        withLabel={true}
                                        register={register("bio")}
                                        labelTitle={t('bio.label')}
                                        placeholder={t('bio.placeholder')}
                                    />
                                    <div className="text-danger-dark text-sm font-semibold">{errors.bio?.message as string}</div>
                                </div>
                                
                                <div className="w-full flex justify-end mt-6">
                                    <Button
                                        className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-hoverable "
                                        loadingText={t('submit.loading')}
                                        type='submit'
                                        isLoading={isPending || isCompressing}
                                    >
                                        {t('submit.default')}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage