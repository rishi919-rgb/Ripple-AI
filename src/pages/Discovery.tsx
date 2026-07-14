import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '@/providers';
import { DiscoveryEngine, type StageDetails } from '@/core/discovery/DiscoveryEngine';
import type { ExperimentCanvas as CanvasType } from '@/types/meal';
import { 
  PageContainer, 
  PageHeader, 
  Card, 
  Button, 
  GlassPanel,
  DiscoveryTimeline,
  JourneyProgress,
  DiscoveryStage,
  DiscoveryCard,
  OriginCard,
  HabitatCard,
  SpeciesCard
} from '@/components';
import { 
  ArrowRight, 
  Compass, 
  ChevronRight, 
  X, 
  ShieldAlert, 
  Activity, 
  ArrowLeft,
  Sparkles,
  MapPin,
  Waves,
  Trees
} from 'lucide-react';

export const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const { currentExperiment } = useExperiment();
  const [stage, setStage] = useState(1);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [journeyData, setJourneyData] = useState<StageDetails | null>(null);

  useEffect(() => {
    // Load canvas from localStorage
    let canvasData: CanvasType | null = null;
    try {
      const saved = localStorage.getItem('ripple_experiment_canvas');
      if (saved) {
        canvasData = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading canvas data:', e);
    }

    // Default fallback if no active experiment or canvas
    const mealName = canvasData?.meal || 'Healthy Salad Bowl';
    const ingredients = canvasData?.ingredients || [
      { name: 'Mixed Greens', percentage: 40 },
      { name: 'Tomatoes', percentage: 20 },
      { name: 'Cucumbers', percentage: 20 },
      { name: 'Olive Oil', percentage: 20 }
    ];

    // Compute journey stages
    const calculatedDetails = DiscoveryEngine.getStageDetails(mealName, ingredients);
    setJourneyData(calculatedDetails);
  }, [currentExperiment]);

  const handleContinue = () => {
    if (stage < 5) {
      setStage((prev) => prev + 1);
      // Smooth scroll to bottom to focus new content
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      setShowEngineModal(true);
    }
  };

  const handleBack = () => {
    if (stage > 1) {
      setStage((prev) => prev - 1);
    } else {
      navigate('/workspace');
    }
  };

  if (!journeyData) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-pulse text-xs font-mono text-text-secondary tracking-widest">
          CALCULATING DISCOVERY GRID LAYER...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="xl" className="space-y-8 pb-24">
      {/* Back to workspace shortcut */}
      <div className="flex justify-between items-center text-xs font-mono">
        <button 
          onClick={handleBack}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary bg-transparent border-0 outline-none cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{stage > 1 ? 'PREVIOUS STAGE' : 'BACK TO WORKSPACE'}</span>
        </button>
        <span className="text-text-muted">STAGE {stage} OF 5</span>
      </div>

      <PageHeader 
        title="Discovery Journey" 
        subtitle="Every environmental decision leaves traces. Let's uncover them."
      />

      {/* Progress Telemetry */}
      <JourneyProgress currentStage={stage} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progressive Journey Stream */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stage 1: Meal Profile (Always visible) */}
          <DiscoveryStage>
            <DiscoveryCard 
              title="Stage 1: Meal Profile" 
              subtitle="Target Specimen" 
              icon={<Sparkles className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-text-muted uppercase">Detected Meal Profile</span>
                  <h4 className="text-lg font-bold text-text-primary font-mono">{journeyData.mealName}</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {journeyData.ingredients.map((ing) => (
                    <div key={ing.name} className="p-3 bg-bg-darkest/40 border border-border-subtle rounded-lg flex items-center justify-between text-xs">
                      <span className="text-text-secondary font-medium truncate">{ing.name}</span>
                      <span className="font-mono text-accent-cyan font-semibold">{ing.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </DiscoveryCard>
          </DiscoveryStage>

          {/* Stage 2: Agricultural Origin */}
          {stage >= 2 && (
            <DiscoveryStage>
              <DiscoveryCard 
                title="Stage 2: Agricultural Origin" 
                subtitle="Regional Soil Traces" 
                icon={<MapPin className="w-4 h-4" />}
              >
                <OriginCard origins={journeyData.origins} />
              </DiscoveryCard>
            </DiscoveryStage>
          )}

          {/* Stage 3: Watershed Basin */}
          {stage >= 3 && (
            <DiscoveryStage>
              <DiscoveryCard 
                title="Stage 3: Watershed Catchment" 
                subtitle="Hydrologic Flow" 
                icon={<Waves className="w-4 h-4" />}
              >
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-baseline gap-2.5">
                        <h4 className="text-base font-bold text-text-primary font-mono">{journeyData.watershed.name}</h4>
                        <span className="text-[9px] font-mono text-accent-cyan">{journeyData.watershed.region}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed bg-bg-darkest/40 border border-border-subtle rounded-lg p-3">
                        {journeyData.watershed.description}
                      </p>
                    </div>
                    <GlassPanel intensity="light" className="p-4 border border-border-subtle/80 flex flex-col justify-center shrink-0 min-w-[150px] text-xs font-mono">
                      <span className="text-text-muted">DRAINAGE AREA:</span>
                      <span className="text-text-primary font-bold mt-0.5">{journeyData.watershed.area}</span>
                    </GlassPanel>
                  </div>
                </div>
              </DiscoveryCard>
            </DiscoveryStage>
          )}

          {/* Stage 4: Ecosystem Habitat */}
          {stage >= 4 && (
            <DiscoveryStage>
              <DiscoveryCard 
                title="Stage 4: Ecosystem Habitat" 
                subtitle="Biogeographical Grid" 
                icon={<Trees className="w-4 h-4" />}
              >
                <HabitatCard habitat={journeyData.habitat} />
              </DiscoveryCard>
            </DiscoveryStage>
          )}

          {/* Stage 5: Keystone Species */}
          {stage >= 5 && (
            <DiscoveryStage>
              <DiscoveryCard 
                title="Stage 5: Keystone Wildlife" 
                subtitle="Ecological Indicators" 
                icon={<Activity className="w-4 h-4" />}
              >
                <SpeciesCard species={journeyData.speciesList} />
              </DiscoveryCard>
            </DiscoveryStage>
          )}

          {/* Continue / Next Stage Action footer inside main feed */}
          <div className="pt-4 border-t border-border-subtle flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="font-mono text-xs uppercase tracking-wider gap-2 px-8"
            >
              <span>{stage === 5 ? 'Begin Ecological Simulation' : 'Continue Discovery'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

        {/* Right Column: Timeline tracker */}
        <div className="space-y-6">
          <Card bordered className="space-y-6 bg-bg-panel/20 sticky top-24">
            <div className="border-b border-border-subtle pb-3">
              <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-cyan" />
                <span>Discovery Trail</span>
              </h3>
            </div>

            <DiscoveryTimeline currentStage={stage} />

            <div className="pt-4 border-t border-border-subtle/80 text-[10px] font-mono text-text-muted space-y-1.5 leading-relaxed bg-bg-darkest/20 p-3 rounded-lg">
              <div className="flex gap-2 items-center">
                <Activity className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                <span className="text-text-secondary">TRACKER LOGS:</span>
              </div>
              <p className="text-[9px]">
                [LAYER REVEALED]: Stage {stage} analysis dispatched. Ready for telemetry stream.
              </p>
            </div>
          </Card>
        </div>

      </div>

      {/* Telemetry Modal disclaimer popup */}
      {showEngineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-150">
          <GlassPanel intensity="heavy" className="max-w-md w-full border border-border-muted p-6 space-y-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowEngineModal(false)}
              className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-panel transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono tracking-tight text-text-primary">
                  Simulation Engine Offline
                </h4>
                <p className="text-[10px] font-mono text-accent-cyan">
                  CODE: STG_4_ENGINE_PENDING
                </p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed bg-bg-darkest/50 border border-border-subtle rounded-lg p-3">
              The environmental simulation models, watershed run-off tables, biodiversity indices, and carbon/water footprint calculation engines are scheduled for compilation in **Sprint 4**. 
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEngineModal(false)}
                className="font-mono text-xs uppercase"
              >
                Close pad
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowEngineModal(false)}
                className="font-mono text-xs uppercase gap-1"
              >
                <span>Acknowledge</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </GlassPanel>
        </div>
      )}
    </PageContainer>
  );
};
export default Discovery;
