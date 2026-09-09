import React, { useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { InputField, TextAreaField, SelectField, CheckboxField } from '@/components';
import { LuNotebookText } from "react-icons/lu";
import { IoLocationOutline } from 'react-icons/io5';
import { BiCategory } from 'react-icons/bi';
import { ICreateReportRequest } from '@/types';
import { useTranslations } from 'next-intl';

interface DetailStepProps {
    register: UseFormRegister<ICreateReportRequest>;
    setValue: UseFormSetValue<ICreateReportRequest>;
    errors: FieldErrors<ICreateReportRequest>;
    reportTypeValue?: string;
    hasProgressValue?: boolean;
}

const DetailStep: React.FC<DetailStepProps> = ({ 
    register, 
    setValue, 
    errors, 
    reportTypeValue, 
    hasProgressValue 
}) => {
    const t = useTranslations('report.create_report_page.detail_step');
    useEffect(() => {
        const titleInput = document.getElementById('title');
        if (titleInput) {
            titleInput.focus();
        }
    }, []);
    
    const issueTypes = [
        { value: 'infrastructure', label: t('issue_types.infrastructure') },
        { value: 'environment', label: t('issue_types.environment') },
        { value: 'safety', label: t('issue_types.safety') },
        { value: 'traffic', label: t('issue_types.traffic') },
        { value: 'public_facility', label: t('issue_types.public_facility') },
        { value: 'waste', label: t('issue_types.waste') },
        { value: 'water', label: t('issue_types.water') },
        { value: 'electricity', label: t('issue_types.electricity') },
        { value: 'health', label: t('issue_types.health') },
        { value: 'social', label: t('issue_types.social') },
        { value: 'education', label: t('issue_types.education') },
        { value: 'administrative', label: t('issue_types.administrative') },
        { value: 'disaster', label: t('issue_types.disaster') },
        { value: 'other', label: t('issue_types.other') },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                    <InputField
                        id="title"
                        register={register("reportTitle")}
                        type="text"
                        className="w-full"
                        withLabel={true}
                        required
                        labelTitle={t('title_field.label')}
                        icon={<LuNotebookText size={20} />}
                        placeHolder={t('title_field.placeholder')}
                    />
                    <div className="text-red-500 text-sm font-semibold">
                        {errors.reportTitle?.message as string}
                    </div>
                </div>

                <div className="w-full">
                    <InputField
                        id="location"
                        register={register("location")}
                        type="text"
                        className="w-full"
                        required
                        withLabel={true}
                        labelTitle={t('location_field.label')}
                        icon={<IoLocationOutline size={20} />}
                        placeHolder={t('location_field.placeholder')}
                    />
                    <div className="text-red-500 text-sm font-semibold">
                        {errors.location?.message as string}
                    </div>
                </div>
            </div>

            <div className="w-full">
                <TextAreaField
                    id="description"
                    register={register("reportDescription")}
                    rows={4}
                    required
                    className="w-full"
                    withLabel={true}
                    labelTitle={t('description_field.label')}
                    placeholder={t('description_field.placeholder')}
                />
                <div className="text-red-500 text-sm font-semibold">
                    {errors.reportDescription?.message as string}
                </div>
            </div>

            <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                <div className="w-full md:w-1/2">
                    <SelectField
                        id="reportType"
                        name="reportType"
                        value={reportTypeValue || ''}
                        register={register("reportType")}
                        onChange={(value) => setValue('reportType', value as 'infrastructure' | 'environment' | 'safety' | 'other')}
                        withLabel={true}
                        labelTitle={t('type_field.label')}
                        options={issueTypes}
                        placeholder={t('type_field.placeholder')}
                        required={true}
                        icon={<BiCategory size={20} />}
                        error={errors.reportType?.message as string}
                    />
                </div>

                <div className="w-full md:w-1/2">
                    <CheckboxField
                        id="hasProgress"
                        name="hasProgress"
                        values={hasProgressValue ? ['enable'] : []}
                        onChange={(values) => setValue('hasProgress', values.includes('enable'))}
                        withLabel={true}
                        labelTitle={t('has_progress.label')} 
                        options={[
                            { value: 'enable', label: t('has_progress.option_label') }
                        ]}
                        informationSubtitle={t('has_progress.info_subtitle')}
                        informationTitle={t('has_progress.info_title')}
                        informationDescription={t('has_progress.info_description')}
                        informationAdditionalInfo={t('has_progress.info_additional')}
                        informationConfirmTitle={t('has_progress.info_confirm')}
                        layout="vertical"
                    />
                </div>
            </div>
        </>
    );
};

export default DetailStep;
