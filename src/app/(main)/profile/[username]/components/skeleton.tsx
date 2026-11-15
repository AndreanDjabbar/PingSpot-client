

const Skeleton = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative pb-50 animate-pulse">
                <div className="h-24 sm:h-32 md:h-33 lg:h-48 bg-gray-200"></div>
                <div className="px-4 md:px-10">
                <div className="flex items-center justify-between md:justify-center md:gap-30 lg:gap-70">
                    <div className='flex flex-col md:flex-row items-start md:items-center gap-4 -mt-12 md:-mt-20'>
                    <div className="rounded-2xl sm:rounded-3xl w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-58 lg:h-58 bg-gray-300 ring-4 sm:ring-6 md:ring-8 ring-white"></div>
                    <div className='flex items-center gap-6'>
                        <div className="flex-1 space-y-3 w-full md:pt-25">
                        <div className="h-8 bg-gray-300 rounded w-28"></div>
                        <div className="h-5 bg-gray-300 rounded w-32"></div>

                        <div className="flex gap-2 hidden md:flex">
                            <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                            <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div>
                    <div className='flex flex-col items-center gap-4'>
                        <div className="flex gap-6 md:pt-20 md:hidden">
                        <div className="text-center space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                            <div className="h-6 bg-gray-300 rounded w-12"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                            <div className="h-6 bg-gray-300 rounded w-12"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                            <div className="h-6 bg-gray-300 rounded w-12"></div>
                        </div>
                        </div>
                        <div className="flex gap-2 md:hidden">
                        <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                        <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
                        </div>
                    </div>

                    <div className="flex gap-6 md:pt-20 hidden md:flex">
                        <div className="text-center space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                        <div className="h-6 bg-gray-300 rounded w-12"></div>
                        </div>
                        <div className="text-center space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                        <div className="h-6 bg-gray-300 rounded w-12"></div>
                        </div>
                        <div className="text-center space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                        <div className="h-6 bg-gray-300 rounded w-12"></div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default Skeleton