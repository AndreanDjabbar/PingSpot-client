'use client';

import React from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface SimpleBarProps {
    children: React.ReactNode;
    height?: string | number;
    width?: string | number;
    autoHide?: boolean;
    className?: string;
}

const Scrollbar = ({ children, height = '100%', width = '100%', autoHide = true, className = '' }: SimpleBarProps) => {
    return (
        <SimpleBar
        className={className}
        style={{ maxHeight: height, width }}
        autoHide={autoHide}
        >
            {children}
        </SimpleBar>
    );
};

export default Scrollbar;