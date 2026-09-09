import { Guide } from '@/components'
import React from 'react'
import { LuNotebookText } from 'react-icons/lu'
import { useTranslations } from 'next-intl';

const GuideSection = () => {
    const t = useTranslations('report.update_progress_page.guide_section');
    return (
        <div>
            <Guide
                title={t('title')}
                subtitle={t('subtitle')}
                icon={<LuNotebookText size={20}/>}
                steps={[
                    {
                        number: 1,
                        title: t('steps.1.title'),
                        description: t('steps.1.description')
                    },
                    {
                        number: 2,
                        title: t('steps.2.title'),
                        description: t('steps.2.description')
                    },
                    {
                        number: 3,
                        title: t('steps.3.title'),
                        description: t('steps.3.description')
                    },
                    {
                        number: 4,
                        title: t('steps.4.title'),
                        description: t('steps.4.description')
                    }
                ]}
                alerts={[
                    {
                        type: 'warning',
                        emoji: '⚠️',
                        title: t('alerts.warning.title'),
                        message: t('alerts.warning.message')
                    },
                    {
                        type: 'success',
                        emoji: '💡',
                        title: t('alerts.tip.title'),
                        message: t('alerts.tip.message')
                    }
                ]}
            />
        </div>
    )
}

export default GuideSection