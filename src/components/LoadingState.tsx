import React from 'react';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing environmental data telemetry...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-cyan animate-spin" />
      </div>
      <p className="text-xs font-mono tracking-widest text-text-secondary uppercase animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-bg-darkest flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
export default LoadingState;
