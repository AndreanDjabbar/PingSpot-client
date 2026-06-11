import React from 'react'
import { PingspotLogo } from '@/components/UI'
import BackgroundTheme from './BackgroundTheme'

const AuthLayout: React.FC<React.PropsWithChildren> = ({
    children
}) => {
    return (
    <div className="flex min-h-screen">
        <div className="w-full lg:w-1/2 flex flex-col">
            <div className="py-3 px-6">
                <div className="w-17">
                    <PingspotLogo
                        size={160}
                        variant='full'
                        className='h-full w-full object-cover'
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-2 sm:px-8 md:px-15 lg:px-10">
                <div className="p-4 w-full">
                    {children}
                </div>
            </div>
        </div>

        <div className="w-1/2 hidden lg:block">
            <BackgroundTheme />
        </div>
    </div>
)
}

export default AuthLayout