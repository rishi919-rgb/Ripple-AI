import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  spacing = 'md',
  ...props
}) => {
  const gap = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12',
  };

  return (
    <section className={`${gap[spacing]} ${className}`} {...props}>
      {children}
    </section>
  );
};
export default Section;
