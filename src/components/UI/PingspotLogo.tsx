import React from 'react'
import Image from 'next/image'

interface PingspotLogoProps {
    variant?: 'primary' | 'secondary'
    size: string | number;
    className?: string;
}

const PingspotLogo: React.FC<PingspotLogoProps> = ({
    variant = 'primary',
    size = '150',
    className = ''
}) => {
    const src = (variant === 'primary' ? '/images/pingspot-primary-icon.png' : '/images/pingspot-secondary-icon.png')

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