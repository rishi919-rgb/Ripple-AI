import { Check, Lock } from 'lucide-react';

interface DiscoveryTimelineProps {
  currentStage: number; // 1 to 5
}

export const DiscoveryTimeline: React.FC<DiscoveryTimelineProps> = ({ currentStage }) => {
  const steps = [
    { label: 'Meal Profile', depth: 'Surface Level' },
    { label: 'Agricultural Origin', depth: 'Soil Depth' },
    { label: 'Watershed Basin', depth: 'Aquatic Grid' },
    { label: 'Ecosystem Habitat', depth: 'Biogeographical' },
    { label: 'Keystone Species', depth: 'Macro-ecological' },
    { label: 'Ripple Simulation', depth: 'Predictive (Locked)' },
  ];

  return (
    <div className="relative pl-6 space-y-8">
      {/* Vertical Timeline bar */}
      <div className="absolute left-[9px] top-1.5 bottom-1.5 w-[2px] bg-border-subtle" />

      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStage;
        const isCompleted = stepNum < currentStage;
        const isLocked = stepNum > 5; // Simulation is always locked in Sprint 3

        return (
          <div key={step.label} className="relative flex items-start gap-4 text-left">
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[23px] top-0.5 bg-bg-panel rounded-full p-0.5 z-10 transition-all duration-300">
              {isCompleted ? (
                <div className="w-4 h-4 rounded-full bg-status-available flex items-center justify-center text-bg-darkest shadow-[0_0_8px_rgba(16,185,129,0.35)]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              ) : isActive ? (
                <div className="w-4 h-4 rounded-full bg-accent-cyan flex items-center justify-center text-bg-darkest animate-pulse shadow-glow" />
              ) : isLocked ? (
                <div className="w-4 h-4 rounded-full bg-bg-dark border border-border-subtle flex items-center justify-center text-text-muted">
                  <Lock className="w-2.5 h-2.5" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-bg-dark border border-border-subtle" />
              )}
            </div>

            <div className="space-y-0.5">
              <h4 className={`text-xs font-mono font-semibold uppercase leading-none transition-colors duration-300 ${
                isActive ? 'text-accent-cyan' : isCompleted ? 'text-text-primary' : 'text-text-muted'
              }`}>
                {step.label}
              </h4>
              <p className={`text-[10px] font-mono ${
                isActive ? 'text-text-secondary' : 'text-text-muted/50'
              }`}>
                {step.depth}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default DiscoveryTimeline;
