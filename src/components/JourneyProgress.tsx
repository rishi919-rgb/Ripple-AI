import React from 'react';

interface JourneyProgressProps {
  currentStage: number; // 1 to 5
}

export const JourneyProgress: React.FC<JourneyProgressProps> = ({ currentStage }) => {
  const progressPercent = (currentStage / 5) * 100;
  const depths = ['0m (Surface)', '250m (Agrarian Substrate)', '500m (Hydro-catchment)', '750m (Eco-Canopy)', '1000m (Keystone Telemetry)'];

  return (
    <div className="space-y-2 font-mono text-[10px] text-text-secondary w-full">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <span className="text-text-muted">EXPLORATION DEPTH:</span>
          <span className="text-accent-cyan font-bold animate-pulse">{depths[currentStage - 1]}</span>
        </div>
        <div className="flex gap-2">
          <span>PROGRESS:</span>
          <span className="text-text-primary font-bold">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-1 bg-bg-panel border border-border-subtle rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
export default JourneyProgress;
