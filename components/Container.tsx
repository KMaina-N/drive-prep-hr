import React, { ReactNode } from 'react';

type ContainerProps = {
    children: ReactNode;
    className?: string;
};

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
    return (
        <div className={`mx-auto max-w-7xl px-4 ${className}`}>
            {children}
        </div>
    );
};

export default Container;