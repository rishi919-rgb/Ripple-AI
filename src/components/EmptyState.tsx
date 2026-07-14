import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Telemetry Data',
  description = 'No active environment simulations or telemetry logs have been recorded yet.',
  icon = <Database className="w-8 h-8 text-text-muted" />,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-muted rounded-xl bg-bg-panel/20 max-w-md mx-auto space-y-4">
      <div className="p-3 bg-bg-panel rounded-full border border-border-subtle">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-text-primary font-mono tracking-tight">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed max-w-xs">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
export default EmptyState;
