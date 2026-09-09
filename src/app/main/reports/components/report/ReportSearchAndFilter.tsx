import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoFunnelOutline } from 'react-icons/io5';
import { InputField } from '@/components';
import { useTranslations } from 'next-intl';

interface ReportSearchAndFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onFilterClick: () => void;
    activeFiltersCount?: number;
    filterButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const ReportSearchAndFilter: React.FC<ReportSearchAndFilterProps> = ({
    onFilterClick,
    activeFiltersCount = 0,
    filterButtonRef
}) => {
    const t = useTranslations('report.report_search_filter');
    return (
        <div className="">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                    <InputField
                    id="search"
                    placeHolder={t('placeholder')}
                    icon={<FaSearch size={15} />}
                    withLabel={false}
                    />
                </div>
                    
                <button
                    ref={filterButtonRef}
                    onClick={onFilterClick}
                    className="relative flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:text-gray-700 font-medium whitespace-nowrap active:bg-gray-200 cursor-pointer"
                >
                    <IoFunnelOutline className="w-5 h-5" />
                    <span>{t('filter_button')}</span>
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-primary rounded-full border-2 border-white">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReportSearchAndFilter;