'use client';

import { cn } from '@/lib';
import React, { createContext, useContext } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type LoadingType    = 'spinner' | 'dots' | 'pulse' | 'bars';
type LoadingSize    = 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'primary' | 'secondary' | 'white';

export const iconSizeMap: Record<LoadingSize, string> = {
    sm: 'text-base',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
};

export const textSizeMap: Record<LoadingSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
};

export const dotSizeMap: Record<LoadingSize, string> = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5',
    xl: 'h-4   w-4',
};

export const barSizeMap: Record<LoadingSize, string> = {
    sm: 'h-4  w-1',
    md: 'h-6  w-1.5',
    lg: 'h-8  w-2',
    xl: 'h-10 w-2.5',
};

const textColorMap: Record<LoadingVariant, string> = {
    primary:   'text-primary',
    secondary: 'text-muted',
    white:     'text-white',
};

const bgColorMap: Record<LoadingVariant, string> = {
    primary:   'bg-primary',
    secondary: 'bg-secondary',
    white:     'bg-white',
};

type LoadingConfig = Partial<
    Pick<LoadingProps, 'type' | 'size' | 'variant' | 'color' | 'speed'>
>;

const LoadingConfigContext = createContext<LoadingConfig>({});

export const LoadingConfigProvider = ({
    value,
    children,
}: {
    value: LoadingConfig;
    children: React.ReactNode;
}) => (
    <LoadingConfigContext.Provider value={value}>
        {children}
    </LoadingConfigContext.Provider>
);

export const useLoadingConfig = () => useContext(LoadingConfigContext);

interface LoaderProps {
    size?:      LoadingSize;
    variant?:   LoadingVariant;
    color?:     string;
    speed?:     string;
    className?: string;
    style?:     React.CSSProperties;
}

const useColorStyle = (
    color: string | undefined,
    style: React.CSSProperties | undefined,
    cssVar: '--tw-text-opacity-color' | 'backgroundColor' | 'color',
) => {
    if (!color) return style;
    return cssVar === 'color'
        ? { color, ...style }
        : cssVar === 'backgroundColor'
        ? { backgroundColor: color, ...style }
        : style;
};

const SpinnerLoader = ({ size = 'md', variant = 'primary', color, style, className }: LoaderProps) => (
    <AiOutlineLoading3Quarters
        className={cn('animate-spin', iconSizeMap[size], !color && textColorMap[variant], className)}
        style={useColorStyle(color, style, 'color')}
        role="status"
        aria-label="Loading"
    />
);

const DotsLoader = ({ size = 'md', variant = 'primary', color, speed = '0.6s', style, className }: LoaderProps) => (
    <div className={cn('flex items-center gap-2', className)} style={style} role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className={cn('rounded-full animate-bounce', dotSizeMap[size], !color && bgColorMap[variant])}
                style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: speed,
                    ...(color ? { backgroundColor: color } : {}),
                }}
            />
        ))}
    </div>
);

const PulseLoader = ({ size = 'md', variant = 'primary', color, style, className }: LoaderProps) => (
    <div
        className={cn('rounded-full animate-pulse', dotSizeMap[size], !color && bgColorMap[variant], className)}
        style={useColorStyle(color, style, 'backgroundColor')}
        role="status"
        aria-label="Loading"
    />
);

const BarsLoader = ({ size = 'md', variant = 'primary', color, speed = '0.8s', style, className }: LoaderProps) => (
    <div className={cn('flex items-end gap-1.5', className)} style={style} role="status" aria-label="Loading">
        {[0, 1, 2, 3].map((i) => (
            <div
                key={i}
                className={cn('rounded-sm animate-pulse', barSizeMap[size], !color && bgColorMap[variant])}
                style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: speed,
                    ...(color ? { backgroundColor: color } : {}),
                }}
            />
        ))}
    </div>
);

interface LoadingProps {
    type?:             LoadingType;
    size?:             LoadingSize;
    variant?:          LoadingVariant;
    color?:            string;
    speed?:            string;
    text?:             string;
    label?:            string;
    fullScreen?:       boolean;
    className?:        string;
    loaderClassName?:  string;
    textClassName?:    string;
    overlayClassName?: string;
    style?:            React.CSSProperties;
}

const loaderMap: Record<LoadingType, React.FC<LoaderProps>> = {
    spinner: SpinnerLoader,
    dots:    DotsLoader,
    pulse:   PulseLoader,
    bars:    BarsLoader,
};

const LoadingRoot = React.forwardRef<HTMLDivElement, LoadingProps>(
    (props, ref) => {
        const config = useLoadingConfig();

        const {
            type       = config.type ?? 'spinner',
            size       = config.size ?? 'md',
            variant    = config.variant ?? 'primary',
            color      = config.color,
            speed      = config.speed,
            text,
            label      = 'Loading',
            fullScreen = false,
            className,
            loaderClassName,
            textClassName,
            overlayClassName,
            style,
        } = props;

        const Loader = loaderMap[type];

        const content = (
            <div
                ref={fullScreen ? undefined : ref}
                className={cn('flex flex-col items-center justify-center gap-3', className)}
                style={style}
            >
                <Loader
                    size={size}
                    variant={variant}
                    color={color}
                    speed={speed}
                    className={loaderClassName}
                />

                {text && (
                    <p
                        className={cn(
                            'font-medium',
                            textSizeMap[size],
                            !color && textColorMap[variant],
                            textClassName,
                        )}
                        style={color ? { color } : undefined}
                    >
                        {text}
                    </p>
                )}
            </div>
        );

        if (fullScreen) {
            return (
                <div
                    ref={ref}
                    role="alert"
                    aria-busy="true"
                    aria-label={label}
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

LoadingRoot.displayName = 'Loading';


type LoadingComponent = typeof LoadingRoot & {
    Spinner: typeof SpinnerLoader;
    Dots:    typeof DotsLoader;
    Pulse:   typeof PulseLoader;
    Bars:    typeof BarsLoader;
};

const Loading = LoadingRoot as LoadingComponent;
Loading.Spinner = SpinnerLoader;
Loading.Dots    = DotsLoader;
Loading.Pulse   = PulseLoader;
Loading.Bars    = BarsLoader;

export default Loading;