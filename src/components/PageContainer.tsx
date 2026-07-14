import React from 'react';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  size = 'xl',
  ...props
}) => {
  const maxW = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`
        w-full
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-8
        ${maxW[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default PageContainer;
