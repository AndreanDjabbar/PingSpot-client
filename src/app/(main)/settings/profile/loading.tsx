import { Loading } from '@/components/feedback/Loading';
import React from 'react';

const ProfileLoading = () => {
    return (
        <div className="">
            <Loading size='xl' className='fixed inset-0 left-0 xl:left-60'/>
        </div>
    );
}

export default ProfileLoading;