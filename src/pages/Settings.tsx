import React from 'react';
import { PageContainer, PageHeader } from '@/components';

export const Settings: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Settings & Parameters" 
        subtitle="Manage platform preferences, telemetry settings, and module parameters."
      />
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border-muted rounded-xl p-8 bg-bg-panel/10">
        <div className="font-mono text-xs tracking-widest text-accent-cyan uppercase mb-2">
          [ TODO: PLATFORM SETTINGS EDITOR ]
        </div>
        <p className="text-xs text-text-secondary text-center max-w-sm leading-relaxed">
          Platform configurations, API access keys, and system level toggles will reside here.
        </p>
      </div>
    </PageContainer>
  );
};
export default Settings;
