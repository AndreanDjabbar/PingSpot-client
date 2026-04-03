import React from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { Button, InputField } from '@/components';
import { BiX } from 'react-icons/bi';

interface ExploreSearchProps {
    searchTerm: string;
    isNonModalOpen: boolean;
    onNonModalClose: () => void;
    onSearchChange: (value: string) => void;
    onSearchClick: () => void;
    isLoading?: boolean;
}

const ExploreSearch: React.FC<ExploreSearchProps> = ({
    searchTerm,
    onSearchChange,
    isNonModalOpen,
    onNonModalClose,
    onSearchClick,
    isLoading = false
}) => {
    return (
        <div className="">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex w-full gap-2 cursor-pointer" onClick={onSearchClick}>
                    <div className='w-full relative'>
                        <InputField
                            id="search"
                            type='text'
                            isUseAutoComplete={false}
                            placeHolder='Cari pengguna, laporan, atau komunitas'
                            icon={(isLoading && searchTerm.length >= 3) ? <FaSpinner className="animate-spin" size={15} /> : <FaSearch size={15} />}
                            withLabel={false}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    {isNonModalOpen && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onNonModalClose();
                            }}
                            variant='outline'
                            size='md'
                            aria-label="Close search"
                        >
                            <BiX size={18} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExploreSearch;