import { cn } from '@/lib';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('card-pingspot', className)}
            {...props}
        >
            {children}
        </div>
    ),
);

Card.displayName = 'Card';

export default Card;