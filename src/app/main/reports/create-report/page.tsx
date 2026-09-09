"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SuccessSection, ErrorSection, Stepper, Button, HeaderSection } from '@/components';
import { getErrorResponseDetails, getErrorResponseMessage, getDataResponseMessage, compressImages } from '@/utils';
import { useErrorToast, useSuccessToast, useCreateReport, useReverseCurrentLocation } from '@/hooks';
import { CreateReportSchema } from '../../schema';
import { ICreateReportRequest } from '@/types/api/report';
import { useConfirmationModalStore, useImagePreviewModalStore } from '@/stores';
import { AttachmentStep, DetailStep, MapStep, SummaryStep } from './components';
import { ImageItem } from '@/types';
import { useTranslations } from 'next-intl';

const CreateReportPage = () => {
    const currentPath = usePathname();
    const router = useRouter();
    const t = useTranslations('report.create_report_page');

    const [reportImages, setReportImages] = useState<ImageItem[]>([]);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(15);
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);

    const { mutate, isPending, isError, isSuccess, error, data } = useCreateReport();
    const { 
        mutate: reverseLocation, 
        data: reverseLocationData, 
        isPending: reverseLoading,
        isSuccess: reverseSuccess, 
    } = useReverseCurrentLocation();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        watch
    } = useForm<ICreateReportRequest>({
        resolver: zodResolver(CreateReportSchema),
        defaultValues: {
            hasProgress: false
        }
    });

    const reportTypeValue = watch('reportType');
    const hasProgressValue = watch('hasProgress');

    const steps = [
        { label: t('steps.location.label'), description: t('steps.location.description') },
        { label: t('steps.detail.label'), description: t('steps.detail.description') },
        { label: t('steps.attachment.label'), description: t('steps.attachment.description') },
        { label: t('steps.confirmation.label'), description: t('steps.confirmation.description') }
    ];

    const handleImageClick = (imageUrl: string) => {
        openImagePreview(imageUrl);
    };

    const validateStep = (stepIndex: number): boolean => {
        if (stepIndex === 0) {
            return !!markerPosition?.lat && !!markerPosition?.lng;
        }
        if (stepIndex === 1) {
            const title = watch('reportTitle');
            const description = watch('reportDescription');
            const type = watch('reportType');
            const location = watch('location');
            return !!(title && description && type && location);
        }
        return true;
    };

    const prepareFormData = async (formData: ICreateReportRequest): Promise<FormData> => {
        const data = new FormData();
        data.append('reportTitle', formData.reportTitle);
        data.append('reportDescription', formData.reportDescription);
        data.append('reportType', formData.reportType.toUpperCase());
        data.append('detailLocation', formData.location);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        data.append('hasProgress', formData.hasProgress ? 'true' : 'false');
        if (reportImages && reportImages.length > 0 ) {
            reportImages.forEach(async (file) => {
                const compressedFile = await compressImages(file.file);
                console.log("COMPRESSED FILE: ", compressedFile);
                data.append('reportImages', compressedFile);
            });
        }
        return data;
    }

    const onSubmit = async(formData: ICreateReportRequest) => {
        const preparedData = await prepareFormData(formData);
        handleConfirmationModal(preparedData);
    };

    const handleConfirmationModal = (preparedData: FormData) => {
        openConfirm({
            type: "info",
            title: t('confirm_modal.title'),
            subtitle: t('confirm_modal.subtitle'),
            isPending: isPending || reverseLoading,
            description: t('confirm_modal.description'),
            confirmTitle: t('confirm_modal.confirm_button'),
            onConfirm: () => confirmSubmit(preparedData),
        });
    }

    const confirmSubmit = (dataToSubmit: FormData) => {
        if (dataToSubmit && markerPosition) {
            setFormDataToSubmit(dataToSubmit);
            reverseLocation({
                latitude: markerPosition.lat.toString(),
                longitude: markerPosition.lng.toString()
            });
        }
    }

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (markerPosition) {
            setValue('latitude', markerPosition.lat.toString());
            setValue('longitude', markerPosition.lng.toString());
        }
    }, [markerPosition, setValue]);

    useEffect(() => {
        if (reverseLocationData && formDataToSubmit) {
            const {
                country, 
                country_code, 
                county, 
                postcode, 
                region, 
                road,
                state, 
                village, 
                suburb
            } = reverseLocationData.address || {};
            
            formDataToSubmit.append('displayName', reverseLocationData.display_name || '');
            formDataToSubmit.append('road', road || '');
            formDataToSubmit.append('country', country || '');
            formDataToSubmit.append('countryCode', country_code || '');
            formDataToSubmit.append('county', county || '');
            formDataToSubmit.append('postCode', postcode || '');
            formDataToSubmit.append('mapZoom', zoomLevel.toString());
            formDataToSubmit.append('region', region || '');
            formDataToSubmit.append('state', state || '');
            formDataToSubmit.append('village', village || '');
            formDataToSubmit.append('suburb', suburb || '');
            mutate(formDataToSubmit);
        }
    }, [reverseLocationData, reverseSuccess, formDataToSubmit, mutate, zoomLevel]);

    useEffect(() => {
        if (isSuccess) {
            reset();
            setReportImages([]);
            setMarkerPosition(null);
            setFormDataToSubmit(null);
            setCurrentStep(0);
            setTimeout(() => {
                router.push("/main/reports");
            }, 1000);
        }
    }, [isSuccess, data, reset, router]);

    return (
        <div className="space-y-8">
        <HeaderSection 
            currentPath={currentPath}
            isCardHeader={false}
            showBreadcrumb={false}
            message={t('header_message')}
        />

        {isSuccess && (
            <SuccessSection message={getDataResponseMessage(data) || t('success_default')} />
        )}

        {isError && (
            <ErrorSection 
            message={getErrorResponseMessage(error)} 
            errors={getErrorResponseDetails(error)} 
            />
        )}

        {!isSuccess && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                <div className="mb-8">
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        onStepChange={setCurrentStep}
                        validateStep={validateStep}
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center p-5 space-y-8 w-full" encType="multipart/form-data">
                    <input type="hidden" {...register('latitude')} />
                    <input type="hidden" {...register('longitude')} />

                    <div className="w-full flex flex-col gap-6">
                        {currentStep === 0 && (
                            <MapStep
                                onMarkerPositionChange={setMarkerPosition}
                                markerPosition={markerPosition}
                                onZoomLevelChange={setZoomLevel}
                                defaultZoom={zoomLevel}
                                latitudeError={errors?.latitude?.message as string}
                                longitudeError={errors?.longitude?.message as string}
                            />
                        )}

                        {currentStep === 1 && (
                            <DetailStep
                                register={register}
                                setValue={setValue}
                                errors={errors}
                                reportTypeValue={reportTypeValue}
                                hasProgressValue={hasProgressValue}
                            />
                        )}

                        {currentStep === 2 && (
                            <AttachmentStep
                                onImageChange={setReportImages}
                                images={reportImages}
                                onImageClick={handleImageClick}
                            />
                        )}

                        {currentStep === 3 && (
                            <SummaryStep
                                watch={watch}
                                reportImages={reportImages}
                                reportImagesCount={reportImages.length}
                            />
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-muted">

                            <Button
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                                variant='outline'
                            >
                                {t('buttons.back')}
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button
                                    type='button'
                                    onClick={(event) => {
                                        event.preventDefault();
                                        if (validateStep(currentStep)) {
                                            setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
                                        }
                                    }}
                                    disabled={!validateStep(currentStep)}
                                >
                                    {t('buttons.next')}
                                </Button>

                            ) : (
                                <Button
                                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium "
                                    loadingText={t('buttons.submitting')}
                                    type='submit'
                                    isLoading={isPending || reverseLoading}
                                >
                                    {t('buttons.submit')}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        )}
        </div>
    );
};

export default CreateReportPage;