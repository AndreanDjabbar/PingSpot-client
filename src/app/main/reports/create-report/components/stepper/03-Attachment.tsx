import React from 'react';
import { MultipleImageField } from '@/components';
import { ImageItem } from '@/types';
import { useTranslations } from 'next-intl';

interface AttachmentStepProps {
    onImageChange: (files: ImageItem[]) => void;
    images: ImageItem[];
    onImageClick: (imageUrl: string) => void;
}

const AttachmentStep: React.FC<AttachmentStepProps> = ({ 
    onImageChange, 
    images,
    onImageClick 
}) => {
    const t = useTranslations('report.create_report_page.attachment_step');
    return (
        <div>
            <div className="w-full">
                <div className='flex flex-col justify-center items-center gap-6'>
                    <label htmlFor="reportImages" className="text-md font-semibold text-gray-900 items-center">
                        {t('label')}
                    </label>
                    <div>
                        <div className=''>
                            <MultipleImageField
                                id="reportImages"
                                images={images}
                                withLabel={false}
                                buttonTitle={t('button_title')}
                                width={200}
                                height={200}
                                shape="square"
                                maxImages={5}
                                onChange={onImageChange}
                                onImageClick={onImageClick}
                            />
                        </div>
                        <p className="text-sm text-center text-gray-500 mt-1">
                            {t('helper_text')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttachmentStep;
