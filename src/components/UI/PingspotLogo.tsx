import React from 'react'
import Image from 'next/image'

interface PingspotLogoProps {
    variant?: 'full' | 'semi'
    color?: 'primary' | 'white';
    size: string | number;
    className?: string;
}

const PingspotLogo: React.FC<PingspotLogoProps> = ({
    variant = 'primary',
    color = 'primary',
    size = '150',
    className = ''
}) => {
    const src = color === 'primary'
        ? variant === 'full' 
            ? '/images/pingspot-full.png'
            : '/images/pingspot-semi.png'
        : variant === 'full'
            ? '/images/pingspot-full-white.png'
            : '/images/pingspot-semi-white.png';

    return (
        <Image
            src={src}
            alt="PingSpot Logo"
            width={size as number}
            height={size as number}
            className={className}
            style={{ objectFit: 'contain' }}
        />
    )
}

export default PingspotLogo