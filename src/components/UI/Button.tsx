import { cn } from '@/lib';
import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
type ButtonSize    = 'sm' | 'md' | 'lg';
type ButtonType    = 'submit' | 'button';

const variantClasses: Record<ButtonVariant, string> = {
    primary:   'bg-pingspot-hoverable text-white focus:ring-primary',
    secondary: 'bg-secondary text-white focus:ring-secondary',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success:   'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline:   'border border-muted bg-white text-surface hover:bg-background focus:ring-primary',
    ghost:     'bg-transparent text-surface hover:bg-muted focus:ring-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8  px-3   text-sm   gap-1.5',
    md: 'h-10 px-5   text-base gap-2',
    lg: 'h-12 px-8   text-lg   gap-2.5',
};

const iconSizeClasses: Record<ButtonSize, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:      ButtonVariant;
    size?:         ButtonSize;
    type?:         ButtonType;
    isLoading?:    boolean;
    loadingText?:  string;
    icon?:         React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?:    boolean;
    children:      React.ReactNode;
    iconClassName?:     string;
    spinnerClassName?:  string;
    labelClassName?:    string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant       = 'primary',
            size          = 'md',
            type          = 'button',
            isLoading     = false,
            loadingText,
            icon,
            iconPosition  = 'left',
            fullWidth     = false,
            children,
            className,            
            iconClassName,
            spinnerClassName,
            labelClassName,
            disabled,
            ...props
        },
        ref,
    ) => {
        const isDisabled = disabled || isLoading;

        const rootClass = cn(
            'inline-flex items-center justify-center',
            'font-medium rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'cursor-pointer',
            variantClasses[variant],
            sizeClasses[size],
            fullWidth && 'w-full',
            className,
        );

        const spinner = (
            <AiOutlineLoading3Quarters
                className={cn('animate-spin shrink-0', iconSizeClasses[size], spinnerClassName)}
            />
        );

        const iconNode = isLoading ? spinner : icon ? (
            <span className={cn('shrink-0 leading-none', iconSizeClasses[size], iconClassName)}>
                {icon}
            </span>
        ) : null;

        const label = (
            <span className={cn('leading-none', labelClassName)}>
                {isLoading && loadingText ? loadingText : children}
            </span>
        );

        return (
            <button
                ref={ref}
                type={type}
                className={rootClass}
                disabled={isDisabled}
                aria-busy={isLoading}
                {...props}
            >
                {iconPosition === 'right' ? (
                    <>
                        {label}
                        {iconNode}
                    </>
                ) : (
                    <>
                        {iconNode}
                        {label}
                    </>
                )}
            </button>
        );
    },
);

Button.displayName = 'Button';

export default Button;