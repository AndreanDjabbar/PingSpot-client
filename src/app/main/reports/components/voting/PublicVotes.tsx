import React from 'react'
import { FaCheck } from 'react-icons/fa';
import { RiProgress3Fill } from 'react-icons/ri';

interface PublicVotesProps {
    totalVotes: number;
    totalResolvedVotes: number;
    totalOnProgressVotes: number;
}

const PublicVotes: React.FC<PublicVotesProps> = ({
    totalVotes,
    totalResolvedVotes,
    totalOnProgressVotes,
}) => {
    const resolvedPercentage = totalVotes > 0 ? (totalResolvedVotes / totalVotes) * 100 : 0;
    const onProgressPercentage = totalVotes > 0 ? (totalOnProgressVotes / totalVotes) * 100 : 0;
    return (
        <div>
            <div className="mt-4 px-3">
                <div className='mb-4'>
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                        <span>Pendapat Komunitas</span>
                        <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                            {totalVotes} vote
                        </span>
                    </div>
                    <span className='text-sm text-gray-600'>Pendapat komunitas mengenai proses perkembangan laporan:</span>
                </div>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className='flex gap-2 font-medium text-yellow-700 items-center'>
                                <RiProgress3Fill/>
                                <span className="">Dalam Proses</span>
                            </div>
                            <span className="text-gray-600 font-semibold">{totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                style={{ width: `${onProgressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className='flex gap-2 font-medium text-green-700 items-center'>
                                <FaCheck/>
                                <span className="">Terselesaikan</span>
                            </div>
                            <span className="text-gray-600 font-semibold">{totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                style={{ width: `${resolvedPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicVotes