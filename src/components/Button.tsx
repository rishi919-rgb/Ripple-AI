import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-accent-indigo text-text-primary hover:bg-indigo-600 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] active:bg-indigo-700 border border-indigo-500/20',
    secondary: 'bg-bg-panel text-text-primary hover:bg-bg-panel-hover active:bg-bg-dark border border-border-subtle hover:border-border-muted shadow-sm',
    outline: 'bg-transparent text-text-primary hover:bg-bg-panel-hover border border-border-muted hover:border-border-active',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-panel-hover',
    danger: 'bg-status-danger text-text-primary hover:bg-red-600 active:bg-red-700 shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-sm gap-1.5',
    md: 'h-10 px-4 text-sm rounded-md gap-2',
    lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
export default Button;
