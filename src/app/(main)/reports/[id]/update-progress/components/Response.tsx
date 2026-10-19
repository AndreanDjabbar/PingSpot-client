import { ErrorSection, SuccessSection } from '@/components'
import { IUploadProgressReportResponse } from '@/types'
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils'
import React from 'react'
import { useTranslations } from 'next-intl'

interface ResponseSectionProps {
    isUploadProgressSuccess: boolean
    uploadProgressData: IUploadProgressReportResponse
    isUploadProgressError: boolean
    uploadProgressError: unknown
}

const ResponseSection: React.FC<ResponseSectionProps> = ({
    isUploadProgressSuccess,
    uploadProgressData,
    isUploadProgressError,
    uploadProgressError,
}) => {
    const t = useTranslations('report.update_progress_page.response_section');
  return (
    <div>
        {isUploadProgressSuccess && (
            <div className="mb-4">
                <SuccessSection message={uploadProgressData.message || t('success_default')} />
            </div>
        )}

        {isUploadProgressError && (
            <div className="mb-4">
                <ErrorSection 
                    message={getErrorResponseMessage(uploadProgressError)} 
                    errors={getErrorResponseDetails(uploadProgressError)} 
                />
            </div>
        )}
    </div>
  )
}

export default ResponseSection