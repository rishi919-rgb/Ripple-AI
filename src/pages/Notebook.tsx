import React from 'react';
import { PageContainer, PageHeader } from '@/components';

export const Notebook: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Research Notebook" 
        subtitle="Document findings, hypotheses, and conclusions from environmental simulations."
      />
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border-muted rounded-xl p-8 bg-bg-panel/10">
        <div className="font-mono text-xs tracking-widest text-accent-cyan uppercase mb-2">
          [ TODO: RESEARCH LAB JOURNAL ]
        </div>
        <p className="text-xs text-text-secondary text-center max-w-sm leading-relaxed">
          Markdown notebooks, rich-text logs, and shared scientific observations will be managed in this view.
        </p>
      </div>
    </PageContainer>
  );
};
export default Notebook;
