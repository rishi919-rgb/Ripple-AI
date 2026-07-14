import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  bordered = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-bg-panel
        rounded-lg
        p-6
        transition-all
        duration-250
        ${bordered ? 'border border-border-subtle' : ''}
        ${hoverable ? 'hover:border-border-active hover:-translate-y-0.5 hover:shadow-panel' : ''}
        ${glow ? 'shadow-glow hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
