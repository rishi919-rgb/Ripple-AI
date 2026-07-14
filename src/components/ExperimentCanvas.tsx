import React from 'react';
import { Plus, Trash2, Sliders, AlertTriangle, Layers } from 'lucide-react';
import { Card, Button } from '@/components';
import type { ExperimentCanvas as CanvasType, MealIngredient } from '@/types/meal';

interface ExperimentCanvasProps {
  canvas: CanvasType;
  onChange: (updated: CanvasType) => void;
}

export const ExperimentCanvas: React.FC<ExperimentCanvasProps> = ({
  canvas,
  onChange,
}) => {
  const handleTextChange = (field: keyof Omit<CanvasType, 'ingredients' | 'location'>, value: string) => {
    onChange({
      ...canvas,
      [field]: value,
    });
  };

  const handleLocationChange = (field: 'state' | 'district', value: string) => {
    onChange({
      ...canvas,
      location: {
        ...canvas.location,
        [field]: value,
      },
    });
  };

  const handleIngredientChange = (idx: number, field: keyof MealIngredient, value: string | number) => {
    const updatedIngredients = [...canvas.ingredients];
    updatedIngredients[idx] = {
      ...updatedIngredients[idx],
      [field]: value,
    };
    onChange({
      ...canvas,
      ingredients: updatedIngredients,
    });
  };

  const addIngredient = () => {
    onChange({
      ...canvas,
      ingredients: [...canvas.ingredients, { name: 'New Ingredient', percentage: 10 }],
    });
  };

  const removeIngredient = (idx: number) => {
    onChange({
      ...canvas,
      ingredients: canvas.ingredients.filter((_, i) => i !== idx),
    });
  };

  const ingredientsSum = canvas.ingredients.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
  const isSumValid = ingredientsSum === 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Parameters Panel */}
      <Card bordered className="lg:col-span-2 space-y-6 bg-bg-panel/10">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <Sliders className="w-4 h-4 text-accent-cyan" />
          <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase">
            Experiment Parameters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">
              Experiment Question
            </label>
            <input
              type="text"
              value={canvas.question}
              onChange={(e) => handleTextChange('question', e.target.value)}
              className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none"
            />
          </div>

          {/* Meal Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">
              Target Meal / Product
            </label>
            <input
              type="text"
              value={canvas.meal}
              onChange={(e) => handleTextChange('meal', e.target.value)}
              className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none"
            />
          </div>

          {/* Diet Preference */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">
              Dietary Profile
            </label>
            <select
              value={canvas.dietPreference}
              onChange={(e) => handleTextChange('dietPreference', e.target.value)}
              className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none cursor-pointer"
            >
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Pescatarian">Pescatarian</option>
            </select>
          </div>

          {/* Location - State */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">
              Target Location (State)
            </label>
            <input
              type="text"
              value={canvas.location.state}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              placeholder="e.g. Karnataka"
              className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none"
            />
          </div>

          {/* Location - District */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">
              Target Location (District)
            </label>
            <input
              type="text"
              value={canvas.location.district}
              onChange={(e) => handleLocationChange('district', e.target.value)}
              placeholder="e.g. Bengaluru"
              className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none"
            />
          </div>

          {/* Objective Statement */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">
              Simulation Objective Statement
            </label>
            <textarea
              rows={3}
              value={canvas.objective}
              onChange={(e) => handleTextChange('objective', e.target.value)}
              className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Ingredients Composition Panel */}
      <Card bordered className="space-y-6 bg-bg-panel/15">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase">
              Ingredients Mix
            </h3>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addIngredient}
            className="h-7 px-2 font-mono text-[9px] gap-1 hover:border-accent-cyan hover:text-accent-cyan"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </Button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {canvas.ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                className="flex-1 bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none"
              />
              <div className="relative w-16 shrink-0">
                <input
                  type="number"
                  value={ing.percentage}
                  onChange={(e) => handleIngredientChange(idx, 'percentage', parseInt(e.target.value) || 0)}
                  className="w-full bg-bg-darkest border border-border-subtle focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/35 rounded-lg pl-2 pr-6 py-1.5 text-xs text-text-primary outline-none text-right font-mono"
                />
                <span className="absolute right-2 top-1.5 text-[9px] font-mono text-text-muted">%</span>
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="p-1.5 text-text-muted hover:text-status-danger bg-bg-panel hover:bg-status-danger/10 border border-border-subtle hover:border-status-danger/25 rounded-md transition-colors cursor-pointer"
                disabled={canvas.ingredients.length <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sum Indicator */}
        <div className="pt-4 border-t border-border-subtle">
          <div className={`flex items-center justify-between text-xs font-mono p-3 rounded-lg ${isSumValid ? 'bg-status-available/10 border border-status-available/20 text-status-available' : 'bg-status-danger/10 border border-status-danger/20 text-status-danger'}`}>
            <span className="flex items-center gap-1.5">
              {!isSumValid && <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>TOTAL SUM:</span>
            </span>
            <span className="font-bold">{ingredientsSum}%</span>
          </div>
          {!isSumValid && (
            <p className="text-[10px] text-status-danger mt-1.5 font-mono">
              * Composition ratios must total exactly 100%.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
export default ExperimentCanvas;
