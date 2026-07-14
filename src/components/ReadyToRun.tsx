import { useNavigate } from 'react-router-dom';
import { Play, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components';
import type { ExperimentCanvas as CanvasType } from '@/types/meal';

interface ReadyToRunProps {
  canvas: CanvasType;
  confidence: number;
  isIngredientsSumValid: boolean;
}

export const ReadyToRun: React.FC<ReadyToRunProps> = ({
  canvas,
  confidence,
  isIngredientsSumValid,
}) => {
  const navigate = useNavigate();

  const handleRun = () => {
    if (!isIngredientsSumValid) return;
    navigate('/discovery');
  };

  return (
    <>
      <Card bordered glow className="bg-bg-panel/30 border-accent-indigo/20 space-y-6 relative overflow-hidden">
        {/* Abstract glowing corner decor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-indigo/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
          <Sparkles className="w-4 h-4 text-accent-indigo" />
          <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase">
            Ready to Run
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
          {/* Question */}
          <div className="space-y-1 md:col-span-2">
            <span className="text-[10px] text-text-muted uppercase">Experiment Question</span>
            <p className="text-xs text-text-primary font-sans font-medium line-clamp-2 leading-relaxed">
              "{canvas.question}"
            </p>
          </div>

          {/* Target Meal */}
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted uppercase">Target Meal</span>
            <p className="text-xs text-text-primary font-sans font-medium">
              {canvas.meal}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted uppercase">Simulation Grid Location</span>
            <p className="text-xs text-text-primary font-sans font-medium">
              {canvas.location.district}, {canvas.location.state}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border-subtle/80 text-xs font-mono items-center">
          {/* Objective summary */}
          <div className="space-y-1 md:col-span-2">
            <span className="text-[10px] text-text-muted uppercase">Simulation Objective</span>
            <p className="text-xs text-text-secondary font-sans leading-relaxed line-clamp-2">
              {canvas.objective || 'No custom simulation objective specified.'}
            </p>
          </div>

          {/* Confidence and CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 sm:items-center md:items-end justify-end">
            <div className="text-right font-mono text-[10px] text-text-secondary">
              EST. CONFIDENCE: <span className="text-accent-cyan font-bold">{Math.round(confidence * 100)}%</span>
            </div>
            
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleRun}
              disabled={!isIngredientsSumValid}
              className={`w-full sm:w-auto md:w-full font-mono text-xs uppercase tracking-wider gap-2 px-6 ${
                !isIngredientsSumValid ? 'opacity-40 cursor-not-allowed' : 'bg-gradient-to-r from-accent-indigo to-indigo-600 hover:shadow-glow'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Experiment</span>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
export default ReadyToRun;
