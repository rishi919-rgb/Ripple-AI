import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'normal' | 'heavy';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  intensity = 'normal',
  ...props
}) => {
  const blurClasses = {
    light: 'backdrop-blur-xs bg-bg-panel/40',
    normal: 'backdrop-blur-md bg-bg-panel/60',
    heavy: 'backdrop-blur-xl bg-bg-panel/85',
  };

  return (
    <div
      className={`
        rounded-xl
        border
        border-white/[0.04]
        shadow-panel
        ${blurClasses[intensity]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassPanel;
