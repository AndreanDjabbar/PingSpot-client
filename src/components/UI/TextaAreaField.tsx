import React from 'react';
import { cn } from '@/lib';

type ResizeOption = 'none' | 'y' | 'x' | 'both';
type VariantOption = 'default' | 'filled' | 'ghost';
type SizeOption = 'sm' | 'md' | 'lg';

interface TextAreaFieldProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    className?: string;
    register?: unknown;
    wrapperClassName?: string;
    withLabel?: boolean;
    labelTitle?: string;
    labelIcon?: React.ReactNode;
    labelClassName?: string;
    icon?: React.ReactNode;
    rows?: number;
    size?: SizeOption;
    variant?: VariantOption;
    resize?: ResizeOption;
    error?: string;
}

const sizeClasses: Record<SizeOption, string> = {
    sm: 'py-1.5 text-xs',
    md: 'py-2.5 text-sm',
    lg: 'py-3.5 text-base',
};

const variantClasses: Record<VariantOption, string> = {
    default: 'bg-white border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary',
    filled:  'bg-gray-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary',
    ghost:   'bg-transparent border-b border-gray-300 rounded-none shadow-none focus:ring-0 focus:border-primary',
};

const resizeClasses: Record<ResizeOption, string> = {
    none:  'resize-none',
    y:     'resize-y',
    x:     'resize-x',
    both:  'resize',
};

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
    (
        {
            className,
            wrapperClassName,
            register,
            withLabel = true,
            labelTitle = '',
            labelIcon,
            labelClassName,
            icon,
            rows = 4,
            size = 'md',
            variant = 'default',
            resize = 'y',
            error,
            id,
            required,
            disabled,
            placeholder,
            ...rest
        },
        ref,
    ) => {
        const resolvedPlaceholder =
            placeholder ?? (labelTitle ? `Masukkan ${labelTitle.toLowerCase()}` : '');

        return (
            <div className={cn('space-y-1', wrapperClassName)}>
                {withLabel && labelTitle && (
                    <div className="flex gap-2 items-center">
                        {labelIcon && (
                            <span className="text-gray-500">{labelIcon}</span>
                        )}
                        <label
                            htmlFor={id}
                            className={cn(
                                'block text-sm font-semibold text-gray-900',
                                labelClassName,
                            )}
                        >
                            {labelTitle}
                            {required && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>
                    </div>
                )}

                <div className="relative flex">
                    {icon && (
                        <div className="absolute left-3 top-3 flex items-start pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}

                    <textarea
                        ref={ref}
                        id={id}
                        required={required}
                        disabled={disabled}
                        rows={rows}
                        placeholder={resolvedPlaceholder}
                        className={cn(
                            'block w-full rounded-lg shadow-sm',
                            'placeholder-gray-400',
                            'transition-all duration-200',
                            'focus:outline-none',
                            icon ? 'pl-10' : 'pl-3',
                            'pr-3',
                            sizeClasses[size],
                            variantClasses[variant],
                            resizeClasses[resize],
                            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                            error && '!border-red-400 focus:!ring-red-400 focus:!border-red-400',
                            className,
                        )}
                        {...rest}
                        {...(register || {})}
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-500 mt-0.5">{error}</p>
                )}
            </div>
        );
    },
);

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;