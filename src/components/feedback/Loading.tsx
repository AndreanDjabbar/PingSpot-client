import { cn } from '@/lib';
import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type LoadingType    = 'spinner' | 'dots' | 'pulse' | 'bars';
type LoadingSize    = 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'primary' | 'secondary' | 'white';

interface LoadingProps {
    type?:             LoadingType;
    size?:             LoadingSize;
    variant?:          LoadingVariant;
    text?:             string;
    fullScreen?:       boolean;
    className?:        string; 
    loaderClassName?:  string;
    textClassName?:    string;
    overlayClassName?: string;
}

const iconSize: Record<LoadingSize, string> = {
    sm: 'text-base',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
};

const textSize: Record<LoadingSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
};

const dotSize: Record<LoadingSize, string> = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5',
    xl: 'h-4   w-4',
};

const barSize: Record<LoadingSize, string> = {
    sm: 'h-4  w-1',
    md: 'h-6  w-1.5',
    lg: 'h-8  w-2',
    xl: 'h-10 w-2.5',
};

const textColor: Record<LoadingVariant, string> = {
    primary:   'text-primary',
    secondary: 'text-muted',
    white:     'text-white',
};

const bgColor: Record<LoadingVariant, string> = {
    primary:   'bg-primary',
    secondary: 'bg-secondary',
    white:     'bg-white',
};

interface LoaderProps {
    size: LoadingSize;
    variant: LoadingVariant;
    className?: string;
}

const SpinnerLoader = ({ size, variant, className }: LoaderProps) => (
    <AiOutlineLoading3Quarters
        className={cn('animate-spin', iconSize[size], textColor[variant], className)}
        role="status"
        aria-label="Loading"
    />
);

const DotsLoader = ({ size, variant, className }: LoaderProps) => (
    <div className={cn('flex items-center gap-2', className)} role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className={cn('rounded-full animate-bounce', dotSize[size], bgColor[variant])}
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }}
            />
        ))}
    </div>
);

const PulseLoader = ({ size, variant, className }: LoaderProps) => (
    <div
        className={cn('rounded-full animate-pulse', dotSize[size], bgColor[variant], className)}
        role="status"
        aria-label="Loading"
    />
);

const BarsLoader = ({ size, variant, className }: LoaderProps) => (
    <div className={cn('flex items-end gap-1.5', className)} role="status" aria-label="Loading">
        {[0, 1, 2, 3].map((i) => (
            <div
                key={i}
                className={cn('rounded-sm animate-pulse', barSize[size], bgColor[variant])}
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
        ))}
    </div>
);

const loaderMap: Record<LoadingType, React.FC<LoaderProps>> = {
    spinner: SpinnerLoader,
    dots:    DotsLoader,
    pulse:   PulseLoader,
    bars:    BarsLoader,
};

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
    (
        {
            type            = 'spinner',
            size            = 'md',
            variant         = 'primary',
            text,
            fullScreen      = false,
            className,
            loaderClassName,
            textClassName,
            overlayClassName,
        },
        ref,
    ) => {
        const Loader = loaderMap[type];

        const content = (
            <div
                ref={fullScreen ? undefined : ref}
                className={cn('flex flex-col items-center justify-center gap-3', className)}
            >
                <Loader size={size} variant={variant} className={loaderClassName} />

                {text && (
                    <p className={cn('font-medium', textSize[size], textColor[variant], textClassName)}>
                        {text}
                    </p>
                )}
            </div>
        );

        if (fullScreen) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        'fixed inset-0 z-50 flex items-center justify-center',
                        'bg-white/80 backdrop-blur-sm',
                        overlayClassName,
                    )}
                >
                    {content}
                </div>
            );
        }

        return content;
    },
);

Loading.displayName = 'Loading';

export default Loading;