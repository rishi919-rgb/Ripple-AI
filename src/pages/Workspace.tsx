import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '@/providers';
import { aiService } from '@/core/ai';
import type { MealAnalysis, ExperimentCanvas as CanvasType } from '@/types/meal';
import { 
  PageContainer, 
  PageHeader, 
  Card, 
  Button, 
  MealUpload,
  AIUnderstanding,
  ExperimentCanvas,
  ReadyToRun
} from '@/components';
import { 
  Trash2, 
  Clock, 
  Activity, 
  Compass, 
  CheckCircle2, 
  Circle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const { currentExperiment, clearExperiment } = useExperiment();
  
  // State variables for Sprint 2 upload & analysis pipeline
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [canvas, setCanvas] = useState<CanvasType | null>(() => {
    try {
      const saved = localStorage.getItem('ripple_experiment_canvas');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    clearExperiment();
    localStorage.removeItem('ripple_experiment_canvas');
    navigate('/');
  };

  const handleImageSelected = async (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setAnalysis(null);
      setCanvas(null);
      setError(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await aiService.analyzeMealImage(file);
      setAnalysis(result);
      
      // Auto-populate Experiment Canvas
      const initialCanvas: CanvasType = {
        question: currentExperiment?.question || '',
        meal: result.detectedMeal,
        ingredients: result.ingredients,
        experimentType: currentExperiment?.experimentType || 'GENERAL',
        location: {
          state: '',
          district: '',
        },
        dietPreference: 'Vegetarian',
        objective: `Simulate the ecological feedback loops, resource consumption and supply impacts for ${result.detectedMeal}.`
      };
      setCanvas(initialCanvas);
      localStorage.setItem('ripple_experiment_canvas', JSON.stringify(initialCanvas));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error occurred during image telemetry processing.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCanvasChange = (updatedCanvas: CanvasType) => {
    setCanvas(updatedCanvas);
    localStorage.setItem('ripple_experiment_canvas', JSON.stringify(updatedCanvas));
  };

  if (!currentExperiment) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center justify-center text-center p-12 max-w-md w-full border border-border-muted bg-bg-panel/10 rounded-xl space-y-6">
          <div className="p-4 bg-bg-dark rounded-full border border-border-subtle">
            <Compass className="w-8 h-8 text-accent-cyan" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text-primary font-mono">
              No Active Workspace
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              No simulation has been constructed. Please return to the telemetry pad to draft your environmental query.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="md" 
            className="font-mono text-xs uppercase"
            onClick={() => navigate('/')}
          >
            Create Experiment
          </Button>
        </div>
      </PageContainer>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' UTC';
    } catch {
      return isoString;
    }
  };

  const timelineSteps = [
    { label: 'Question', description: 'Environmental query defined and classified.', status: 'completed' },
    { label: 'Hypothesis', description: 'AI meal identification and variable preparation.', status: analysis ? 'completed' : 'disabled' },
    { label: 'Evidence', description: 'Collect reference databases and lifecycle metrics.', status: 'disabled' },
    { label: 'Simulation', description: 'Project resource loop feedback responses.', status: 'disabled' },
    { label: 'Observations', description: 'Compare feedback ripples across control scenarios.', status: 'disabled' },
    { label: 'Decision', description: 'Formulate policy and consumption recommendations.', status: 'disabled' },
  ];

  const isIngredientsSumValid = canvas 
    ? canvas.ingredients.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) === 100
    : false;

  return (
    <PageContainer size="xl" className="space-y-8 pb-16">
      <PageHeader 
        title="Workspace Laboratory" 
        subtitle="Deconstruct environmental feedback loops using precision telemetry."
        actions={
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-text-muted hover:text-status-danger border border-border-subtle font-mono text-xs uppercase gap-2 hover:bg-status-danger/10"
            onClick={handleReset}
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Workspace</span>
          </Button>
        }
      />

      {/* Five-Section Workspace Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive panel column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1: Experiment Overview */}
          <Card bordered glow className="space-y-6 bg-bg-panel/20">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono bg-bg-dark border border-border-muted px-2.5 py-1 rounded text-text-secondary tracking-widest">
                  {currentExperiment.id}
                </span>
                
                {currentExperiment.experimentType === 'FOOD' ? (
                  <span className="text-[10px] font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-2 py-0.5 rounded">
                    FOOD MODULE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-bg-dark text-text-secondary border border-border-subtle px-2 py-0.5 rounded">
                    GENERAL MODULE
                  </span>
                )}
              </div>

              <span className="flex items-center gap-1.5 text-[10px] font-mono bg-status-available/10 text-status-available border border-status-available/20 px-2.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-status-available" />
                {currentExperiment.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase block">
                ENVIRONMENTAL QUESTION:
              </span>
              <p className="text-lg md:text-xl font-medium text-text-primary leading-snug">
                "{currentExperiment.question}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-6 text-xs font-mono">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-4 h-4 text-text-muted" />
                <span>CREATED:</span>
                <span className="text-text-primary">{formatDate(currentExperiment.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary sm:justify-end">
                <Activity className="w-4 h-4 text-text-muted" />
                <span>CLASSIFIER:</span>
                <span className="text-accent-cyan uppercase">RULE_MATCH_V1.0</span>
              </div>
            </div>
          </Card>

          {/* SECTION 2: Meal Upload */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-primary font-mono uppercase tracking-wider">
                1. Target Meal Upload
              </h3>
              <p className="text-xs text-text-secondary">
                Upload an image of your meal to identify composition percentages.
              </p>
            </div>
            
            <MealUpload 
              selectedImage={imageFile} 
              onImageSelected={handleImageSelected} 
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 3: AI Understanding */}
          {(isAnalyzing || analysis) && (
            <div className="space-y-3 transition-all duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text-primary font-mono uppercase tracking-wider">
                  2. AI Image Assessment
                </h3>
                <p className="text-xs text-text-secondary">
                  Gemini Vision identified physical ingredients and visual characteristics.
                </p>
              </div>

              <AIUnderstanding 
                analysis={analysis} 
                isAnalyzing={isAnalyzing} 
              />
            </div>
          )}

          {/* SECTION 4: Experiment Canvas */}
          {canvas && !isAnalyzing && (
            <div className="space-y-3 transition-all duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text-primary font-mono uppercase tracking-wider">
                  3. Experiment Canvas Configurator
                </h3>
                <p className="text-xs text-text-secondary">
                  Adjust ingredient volumes, geographical nodes, and test objectives.
                </p>
              </div>

              <ExperimentCanvas 
                canvas={canvas} 
                onChange={handleCanvasChange} 
              />
            </div>
          )}

          {/* SECTION 5: Ready to Run */}
          {canvas && !isAnalyzing && (
            <div className="space-y-3 transition-all duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text-primary font-mono uppercase tracking-wider">
                  4. Deploy Simulation Panel
                </h3>
                <p className="text-xs text-text-secondary">
                  Review parameters and dispatch query to the calculation engine.
                </p>
              </div>

              <ReadyToRun 
                canvas={canvas} 
                confidence={analysis?.confidence || 0.95} 
                isIngredientsSumValid={isIngredientsSumValid}
              />
            </div>
          )}

        </div>

        {/* Sidebar column: Progress indicator */}
        <div className="space-y-6">
          <Card bordered className="space-y-6 bg-bg-panel/20 sticky top-24">
            <div className="border-b border-border-subtle pb-3">
              <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-cyan" />
                <span>Simulation Timeline</span>
              </h3>
            </div>

            {/* Vertical progress timeline */}
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[9px] top-1 bottom-1 w-[2px] bg-border-subtle" />

              {timelineSteps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                return (
                  <div key={step.label} className="relative group flex items-start gap-4">
                    <div className="absolute -left-[23px] top-0.5 bg-bg-panel rounded-full p-0.5 z-10">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-status-available fill-status-available/10 shadow-glow" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted/50" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-sm font-semibold font-mono leading-none ${isCompleted ? 'text-accent-cyan' : 'text-text-muted'}`}>
                        {idx + 1}. {step.label}
                      </h4>
                      <p className={`text-xs ${isCompleted ? 'text-text-secondary' : 'text-text-muted/60'} leading-relaxed`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-4 border-t border-border-subtle/80 text-[10px] font-mono text-text-muted space-y-1.5 leading-relaxed bg-bg-darkest/20 p-3 rounded-lg">
              <div className="flex gap-2 items-center">
                <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
                <span className="text-text-secondary">SYSTEM LOGS:</span>
              </div>
              <p className="text-[9px]">
                {analysis 
                  ? `[${new Date().toLocaleTimeString()}] Telemetry updated. Canvas variables loaded.` 
                  : `[${new Date().toLocaleTimeString()}] Awaiting image upload payload.`
                }
              </p>
            </div>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
};
export default Workspace;
