import React from 'react';
import { PageContainer, PageHeader } from '@/components';

export const Experiment: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Experiment Hub" 
        subtitle="Configure, launch, and monitor environmental simulation pipelines."
      />
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border-muted rounded-xl p-8 bg-bg-panel/10">
        <div className="font-mono text-xs tracking-widest text-accent-cyan uppercase mb-2">
          [ TODO: SIMULATION PIPELINE CONSTRUCTOR ]
        </div>
        <p className="text-xs text-text-secondary text-center max-w-sm leading-relaxed">
          This panel is scheduled for development in Sprint 1. The telemetry dashboard, parameter inputs, and visualization graphs will reside here.
        </p>
      </div>
    </PageContainer>
  );
};
export default Experiment;
