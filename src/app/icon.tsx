import { ImageResponse } from 'next/og'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    return new ImageResponse(
        (
            <img
                src={`${baseUrl}/images/pingspot-semi.png`}
                width={32}
                height={32}
                style={{
                    objectFit: 'contain',
                }}
            />
        ),
        { ...size }
    )
}