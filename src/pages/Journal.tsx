import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components';
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  BookOpen
} from 'lucide-react';

interface SavedExperiment {
  id: string;
  meal: string;
  createdAt: string;
  watersheds: number;
  species: number;
  citations: number;
  bpi: number;
  ingredients: { name: string; percentage: number }[];
}

export const Journal: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SavedExperiment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load history from local storage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ripple_experiment_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        // Seed default history records for visual presentation
        const seedHistory: SavedExperiment[] = [
          {
            id: 'EXP-908127',
            meal: 'Chicken Biryani',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            watersheds: 2,
            species: 3,
            citations: 17,
            bpi: 82,
            ingredients: [
              { name: 'Rice', percentage: 40 },
              { name: 'Chicken', percentage: 30 },
              { name: 'Spices', percentage: 20 },
              { name: 'Oil', percentage: 10 }
            ]
          },
          {
            id: 'EXP-109283',
            meal: 'Healthy Salad',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            watersheds: 1,
            species: 2,
            citations: 9,
            bpi: 15,
            ingredients: [
              { name: 'Leafy Greens', percentage: 50 },
              { name: 'Legumes', percentage: 30 },
              { name: 'Cucumber', percentage: 20 }
            ]
          }
        ];
        localStorage.setItem('ripple_experiment_history', JSON.stringify(seedHistory));
        setHistory(seedHistory);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Filter list by search query
  const filteredHistory = history.filter(item => 
    item.meal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete an experiment from history
  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('ripple_experiment_history', JSON.stringify(updated));
  };

  // Restore active canvas parameters and navigate to workspace Graph/Simulation
  const handleRestore = (item: SavedExperiment) => {
    const canvas = {
      question: `Analyze restored ${item.meal} specimen.`,
      meal: item.meal,
      ingredients: item.ingredients,
      experimentType: 'FOOD',
      location: { state: 'Karnataka', district: 'Mysore' },
      dietPreference: 'Vegetarian',
      objective: `Simulate supply chain ripples and watershed pressure delta maps for ${item.meal}.`
    };
    localStorage.setItem('ripple_experiment_canvas', JSON.stringify(canvas));
    
    // Jump straight to the workspace Graph stage (Step 3)
    navigate('/workspace?step=3');
  };

  return (
    <PageContainer size="lg" className="py-10 text-left font-sans text-text-secondary bg-bg-darkest select-none">
      
      {/* Title */}
      <div className="space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-panel/40 border border-border-subtle rounded-full text-[10px] tracking-widest text-accent-cyan uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>telemetry logs</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-sans">
          Investigator Journal
        </h1>
        <p className="text-xs text-text-muted max-w-lg leading-relaxed">
          Search, audit, delete, or restore previously resolved food specimen telemetry logs.
        </p>
      </div>

      {/* Search inputs */}
      <div className="relative max-w-md mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-text-muted" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by specimen name or ID..."
          className="w-full bg-bg-panel/20 border border-border-subtle hover:border-text-muted text-text-secondary text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-accent-cyan"
        />
      </div>

      {/* History table list */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border-subtle rounded-2xl text-text-muted font-sans text-xs">
            No telemetry logs match search query.
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="p-5 bg-bg-panel/10 border border-border-subtle hover:border-text-muted rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider">
                    {item.id}
                  </span>
                  <h3 className="text-sm font-bold text-text-primary">{item.meal}</h3>
                  <span className="text-[8.5px] text-text-muted">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-[10px] text-text-muted pt-1">
                  <span>Basins: <strong className="text-text-secondary">{item.watersheds}</strong></span>
                  <span>Species: <strong className="text-text-secondary">{item.species}</strong></span>
                  <span>Citations: <strong className="text-text-secondary">{item.citations}</strong></span>
                  <span>BPI: <strong className={item.bpi >= 70 ? 'text-red-400' : 'text-emerald-400'}>{item.bpi}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestore(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-dark border border-border-subtle hover:border-text-primary rounded-xl text-[10.5px] text-text-secondary font-sans font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150"
                  title="Restore Active Telemetry"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 border border-border-subtle hover:border-red-400/30 hover:bg-red-500/5 text-text-muted hover:text-red-400 rounded-xl cursor-pointer transition-colors duration-150"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </PageContainer>
  );
};
export default Journal;
