"use client"

import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { cn } from '@/lib';

interface InputFieldProps {
    className?: string;
    withLabel: boolean;
    labelTitle?: string;
    id: string;
    name?: string;
    type?: string;
    required?: boolean;
    icon: React.ReactNode;
    placeHolder?: string;
    showPasswordToggle?: boolean;
    value?: string;
    isUseAutoComplete?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    register?: unknown;
    disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    id,
    isUseAutoComplete=true,
    name,
    type = 'text',
    required = false,
    className = '',
    placeHolder = '',
    withLabel = true,
    labelTitle = '',
    showPasswordToggle = false,
    icon,
    value,
    onChange,
    onBlur,
    register,
    disabled = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
    return (
        <div className={`space-y-1 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-sm font-semibold ">
                    {labelTitle}
                    {required && <span className="text-danger-dark ml-1">*</span>}
                </label>
            )}
            <div className='relative'>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
                <input
                    id={id}
                    autoComplete={isUseAutoComplete ? 'on' : 'off'}
                    name={name}
                    type={inputType}
                    required={required}
                    className={cn(
                    "block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm transition-all duration-200",
                    "bg-white border border-muted placeholder-surface/40 text-surface",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                    disabled ? "bg-muted cursor-not-allowed opacity-60" : "hover:border-primary/50",
                    )}
                    placeholder={placeHolder || `Masukkan ${labelTitle.toLowerCase()}`}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                    onBlur={onBlur}
                    {...(register || {})}
                />
                {type === 'password' && showPasswordToggle && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                        type="button"
                        className="transition-colors cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default InputField