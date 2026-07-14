import { Sparkles, BarChart2, ShieldCheck } from 'lucide-react';
import { Card, GlassPanel } from '@/components';
import type { MealAnalysis } from '@/types/meal';

interface AIUnderstandingProps {
  analysis: MealAnalysis | null;
  isAnalyzing: boolean;
}

export const AIUnderstanding: React.FC<AIUnderstandingProps> = ({
  analysis,
  isAnalyzing,
}) => {
  if (isAnalyzing) {
    return (
      <Card bordered className="space-y-6 bg-bg-panel/20 animate-pulse">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
          <div className="w-4 h-4 bg-border-muted rounded-full" />
          <div className="h-4 bg-border-muted rounded w-32" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-border-muted rounded w-48" />
            <div className="h-5 bg-border-muted rounded w-16" />
          </div>
          <div className="h-16 bg-border-muted rounded w-full" />
        </div>

        <div className="space-y-3 pt-4 border-t border-border-subtle">
          <div className="h-4 bg-border-muted rounded w-24" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-border-muted rounded w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <Card bordered glow className="space-y-6 bg-bg-panel/20">
      {/* Header telemetry info */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-accent-cyan" />
          <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase">
            Telemetry Assessment
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary bg-bg-dark border border-border-subtle px-2.5 py-1 rounded">
          <ShieldCheck className="w-4 h-4 text-status-available" />
          <span>CONFIDENCE:</span>
          <span className="text-status-available font-semibold">{confidencePercent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 cols: Meal description */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase block">
              IDENTIFIED SYSTEM TARGET:
            </span>
            <h4 className="text-xl font-bold text-text-primary font-mono">
              {analysis.detectedMeal}
            </h4>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase block">
              ASSESSMENT DESCRIPTION:
            </span>
            <p className="text-xs text-text-secondary leading-relaxed bg-bg-darkest/40 border border-border-subtle rounded-lg p-3">
              {analysis.explanation}
            </p>
          </div>
        </div>

        {/* Right 1 col: Confidence Ring or Radial telemetry visual */}
        <div className="flex flex-col items-center justify-center border-l border-border-subtle/50 pl-6 hidden md:flex">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                className="stroke-border-muted" 
                strokeWidth="4" 
                fill="transparent" 
              />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                className="stroke-accent-cyan" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * confidencePercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-bold font-mono tracking-tighter text-text-primary">
                {analysis.confidence.toFixed(2)}
              </span>
              <span className="text-[9px] font-mono text-text-muted block uppercase">
                COEF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients breakdown section */}
      <div className="space-y-3 pt-4 border-t border-border-subtle">
        <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase block flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Estimated Ingredient Composition:</span>
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {analysis.ingredients.map((ing) => (
            <GlassPanel key={ing.name} intensity="light" className="p-3 border border-border-subtle/80 flex flex-col justify-between h-16">
              <span className="text-xs font-semibold text-text-primary truncate">{ing.name}</span>
              <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary mt-1">
                <span>RATIO:</span>
                <span className="text-accent-cyan font-bold">{ing.percentage}%</span>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </Card>
  );
};
export default AIUnderstanding;
