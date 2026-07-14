import React from 'react';
import { PageContainer, PageHeader } from '@/components';

export const Observations: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Field Observations" 
        subtitle="Manage and view logged data telemetry from environmental experiments."
      />
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border-muted rounded-xl p-8 bg-bg-panel/10">
        <div className="font-mono text-xs tracking-widest text-accent-cyan uppercase mb-2">
          [ TODO: OBSERVATIONS DATA GRID ]
        </div>
        <p className="text-xs text-text-secondary text-center max-w-sm leading-relaxed">
          Historical telemetry records, scan logs, and raw simulation output datasets will be tabulated here.
        </p>
      </div>
    </PageContainer>
  );
};
export default Observations;
