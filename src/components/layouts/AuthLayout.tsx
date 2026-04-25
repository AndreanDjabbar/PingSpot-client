import React from 'react'
import { PingspotLogo } from '@/components/UI'
import BackgroundTheme from './BackgroundTheme'

const AuthLayout: React.FC<React.PropsWithChildren> = ({
    children
}) => {
    return (
        <div className="flex min-h-screen">
            <div className="w-full px-2 sm:px-8 md:px-15 lg:px-10 lg:w-1/2 lg:flex lg:flex-col lg:justify-center">
                <div className='mt-5 flex justify-center items-center w-full border-b border-gray-300 pb-5 lg:hidden'>
                    <div className='w-20 rounded-full overflow-hidden lg:hidden'>
                        <PingspotLogo
                            size={160}
                            variant='primary'
                            className='h-full w-full object-cover'
                        />
                    </div>
                </div>
                <div className='p-4'>
                    {children}
                </div>
            </div>
            <div className="w-1/2 hidden lg:block">
                <BackgroundTheme/>
            </div>
        </div>
    )
}

export default AuthLayout