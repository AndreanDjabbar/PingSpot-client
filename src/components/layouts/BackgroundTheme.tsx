import React from 'react'

interface BackgroundThemeProps {
    className?: string;
}

const BackgroundTheme: React.FC<BackgroundThemeProps> = ({ className }) => (
    <div
        className={`${className} w-1/2 h-full fixed right-0 flex items-center justify-center`}
        style={{
            backgroundImage: "url('/images/background1.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}
    >
        <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(45,52,54,0.75) 0%, rgba(108,92,231,0.15) 100%)' }}
        />

        <div
            className="relative z-10 flex flex-col items-center gap-8 text-white text-center px-10 py-12 mx-8 rounded-3xl"
            style={{
                background: 'rgba(45, 52, 54, 0.5)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
        >

            <div className="flex flex-col gap-3">
                <h2
                    className="text-4xl font-bold tracking-tight"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                >
                    PingSpot
                </h2>
                <p
                    className="text-base font-light leading-relaxed"
                    style={{ color: 'white' }}
                >
                    Platform komunitas real-time untuk melaporkan dan memantau permasalahan lokal pada peta interaktif.
                </p>
            </div>

            <div className="w-full flex flex-col items-center gap-2">
                <div
                    className="w-full h-px"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.50), transparent)' }}
                />
                <p style={{ color: 'white', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    &copy; 2025 PingSpot. Hak cipta dilindungi.
                </p>
            </div>
        </div>
    </div>
);

export default BackgroundTheme;