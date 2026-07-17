import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '@/providers';
import { PageContainer, Button } from '@/components';
import { 
  ArrowRight, 
  UploadCloud, 
  Sparkles, 
  Leaf, 
  Droplets, 
  Compass, 
  CheckCircle
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { createExperiment } = useExperiment();

  // Primary CTA action: Create an experiment and navigate to workspace upload
  const handleUploadClick = () => {
    createExperiment('Specimen image analysis');
    navigate('/workspace');
  };

  // Secondary CTA action: Direct live demo transition
  const handleDemoClick = () => {
    createExperiment('Millet Bowl analysis');
    const demoCanvas = {
      question: 'Hypothesis: Replacing white rice in Masala Dosa with dryland pearl millet flour decreases runoff draft in watershed basins.',
      meal: 'Masala Dosa',
      ingredients: [
        { name: 'Rice Flour', percentage: 40 },
        { name: 'Black Gram', percentage: 30 },
        { name: 'Potato Filling', percentage: 20 },
        { name: 'Spices', percentage: 10 }
      ],
      experimentType: 'FOOD',
      location: {
        state: 'Karnataka',
        district: 'Mysore'
      },
      dietPreference: 'Vegetarian',
      objective: 'Simulate crop drawdowns and catchment drafts for Masala Dosa.'
    };
    localStorage.setItem('ripple_experiment_canvas', JSON.stringify(demoCanvas));
    navigate('/control');
  };

  // Demo cards actions: Pre-populates and navigates to workspace
  const handleExploreCard = (mealName: string, diet: string, ingredients: { name: string, percentage: number }[]) => {
    createExperiment(`Explore ${mealName}`);
    const canvas = {
      question: `Ecological baseline trace for ${mealName}.`,
      meal: mealName,
      ingredients,
      experimentType: 'FOOD',
      location: {
        state: 'Karnataka',
        district: 'Bangalore'
      },
      dietPreference: diet,
      objective: `Simulate supply chain paths and watershed pressure delta maps for ${mealName}.`
    };
    localStorage.setItem('ripple_experiment_canvas', JSON.stringify(canvas));
    navigate('/workspace');
  };

  return (
    <PageContainer size="lg" className="flex flex-col min-h-[calc(100vh-4rem)] justify-between py-12 md:py-20 font-sans text-text-secondary bg-bg-darkest selection:bg-accent-cyan/35 selection:text-text-primary">
      
      {/* 1. HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-6xl mx-auto px-4">
        
        {/* Left text column (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-panel/40 border border-border-subtle rounded-full text-[10px] tracking-widest text-accent-cyan uppercase font-sans">
            <Sparkles className="w-3 h-3" />
            <span>Environmental intelligence platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1] font-sans">
            Every Meal Creates <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-indigo-400">
              Invisible Ripples.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-text-muted leading-relaxed max-w-lg font-sans">
            Discover how your food choices affect rivers, biodiversity and wildlife using explainable AI.
          </p>

          {/* Action buttons CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              onClick={handleUploadClick}
              variant="primary"
              size="lg"
              className="font-sans text-xs font-semibold uppercase tracking-wider gap-2 px-6 py-3 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow transition-all duration-300"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Meal</span>
            </Button>
            
            <Button
              onClick={handleDemoClick}
              variant="secondary"
              size="lg"
              className="font-sans text-xs font-semibold uppercase tracking-wider gap-1.5 px-6 py-3 border border-border-subtle hover:border-text-muted cursor-pointer transition-colors duration-200"
            >
              <span>Try Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Right graphic column (5 cols) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
            {/* Animated background ripple circles */}
            <div className="absolute inset-0 border border-accent-cyan/15 rounded-full animate-[ping_6s_infinite_linear]" />
            <div className="absolute inset-6 border border-indigo-500/20 rounded-full animate-[ping_4s_infinite_linear]" />
            <div className="absolute inset-16 border border-zinc-800 rounded-full" />
            <div className="absolute inset-28 border border-zinc-800 rounded-full" />

            {/* Glowing radial core */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-accent-cyan/10 to-indigo-500/10 blur-xl" />

            {/* Center Ecology node rings */}
            <div className="relative z-10 w-36 h-36 rounded-full border border-border-subtle bg-bg-panel/65 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md">
              <Leaf className="w-7 h-7 text-accent-cyan mb-1 animate-pulse" />
              <span className="text-[10px] font-sans text-text-primary tracking-widest uppercase font-bold">Ripple ERE</span>
              <span className="text-[7.5px] font-mono text-text-muted leading-none uppercase mt-0.5">Active Simulation</span>
            </div>

            {/* Floating satellite nodes representing components */}
            <div className="absolute top-10 right-10 p-2.5 rounded-full border border-border-subtle bg-bg-panel/90 shadow-lg">
              <Droplets className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="absolute bottom-8 left-6 p-2.5 rounded-full border border-border-subtle bg-bg-panel/90 shadow-lg">
              <Compass className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. DEMO CARDS SECTION */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-20 md:mt-28 space-y-6">
        <div className="text-left space-y-1.5 border-b border-border-subtle pb-4">
          <h2 className="text-xs font-sans font-bold tracking-widest text-text-primary uppercase">
            SELECT A SPECIEMEN TO ANALYZE
          </h2>
          <p className="text-[11px] font-sans text-text-muted">
            Choose a pre-mapped food item to explore its ecological drainage and biodiversity index.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Card 1: Healthy Salad */}
          <div className="group flex flex-col justify-between border border-border-subtle rounded-xl overflow-hidden bg-bg-panel/15 hover:border-text-muted transition-all duration-300">
            <div className="relative h-44 overflow-hidden bg-bg-darkest/40">
              <img 
                src="/salad.png" 
                alt="Healthy Salad" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[8px] font-sans text-emerald-400 uppercase font-bold">
                🥗 Green Choice
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-text-primary font-sans">Healthy Salad</h3>
                <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                  Mixed fresh leafy greens, cucumbers, and legumes sourced from local cooperative farming blocks.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border-subtle/50 text-[10px]">
                <div className="text-left">
                  <span className="text-[8px] text-text-muted uppercase block leading-none">Biodiversity Draft</span>
                  <span className="text-emerald-400 font-bold font-sans">0.15 (Low Pressure)</span>
                </div>
                
                <button
                  onClick={() => handleExploreCard('Healthy Salad', 'Vegetarian', [
                    { name: 'Leafy Greens', percentage: 50 },
                    { name: 'Legumes', percentage: 30 },
                    { name: 'Cucumber', percentage: 20 }
                  ])}
                  className="px-3 py-1 bg-bg-dark border border-border-subtle hover:border-text-secondary rounded text-[9px] text-text-secondary hover:text-text-primary font-sans font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Chicken Biryani */}
          <div className="group flex flex-col justify-between border border-border-subtle rounded-xl overflow-hidden bg-bg-panel/15 hover:border-text-muted transition-all duration-300">
            <div className="relative h-44 overflow-hidden bg-bg-darkest/40">
              <img 
                src="/biryani.png" 
                alt="Chicken Biryani" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded text-[8px] font-sans text-red-400 uppercase font-bold">
                🍛 High Impact
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-text-primary font-sans">Chicken Biryani</h3>
                <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                  Sourced from intensive rice paddies and livestock supply chains with significant nitrogen and water drafts.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border-subtle/50 text-[10px]">
                <div className="text-left">
                  <span className="text-[8px] text-text-muted uppercase block leading-none">Biodiversity Draft</span>
                  <span className="text-status-danger font-bold font-sans">0.82 (High Pressure)</span>
                </div>
                
                <button
                  onClick={() => handleExploreCard('Chicken Biryani', 'Non-Vegetarian', [
                    { name: 'Rice', percentage: 40 },
                    { name: 'Chicken', percentage: 30 },
                    { name: 'Spices', percentage: 20 },
                    { name: 'Oil', percentage: 10 }
                  ])}
                  className="px-3 py-1 bg-bg-dark border border-border-subtle hover:border-text-secondary rounded text-[9px] text-text-secondary hover:text-text-primary font-sans font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Millet Bowl */}
          <div className="group flex flex-col justify-between border border-border-subtle rounded-xl overflow-hidden bg-bg-panel/15 hover:border-text-muted transition-all duration-300">
            <div className="relative h-44 overflow-hidden bg-bg-darkest/40">
              <img 
                src="/millet.png" 
                alt="Millet Bowl" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-accent-cyan/10 border border-accent-cyan/25 px-2 py-0.5 rounded text-[8px] font-sans text-accent-cyan uppercase font-bold">
                🌾 Sustainable Grain
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-text-primary font-sans">Millet Bowl</h3>
                <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                  Cultivated in semi-arid drylands, displaying minimal blue-water consumption requirements.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border-subtle/50 text-[10px]">
                <div className="text-left">
                  <span className="text-[8px] text-text-muted uppercase block leading-none">Biodiversity Draft</span>
                  <span className="text-indigo-400 font-bold font-sans">0.24 (Mild Pressure)</span>
                </div>
                
                <button
                  onClick={() => handleExploreCard('Millet Bowl', 'Vegetarian', [
                    { name: 'Millet Flour', percentage: 50 },
                    { name: 'Vegetables', percentage: 30 },
                    { name: 'Legumes', percentage: 20 }
                  ])}
                  className="px-3 py-1 bg-bg-dark border border-border-subtle hover:border-text-secondary rounded text-[9px] text-text-secondary hover:text-text-primary font-sans font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. HOW RIPPLE WORKS SECTION */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-20 md:mt-28 space-y-6">
        <div className="text-left space-y-1.5 border-b border-border-subtle pb-4">
          <h2 className="text-xs font-sans font-bold tracking-widest text-text-primary uppercase">
            HOW RIPPLE WORKS
          </h2>
          <p className="text-[11px] font-sans text-text-muted">
            Follow the pathway of environmental intelligence from scan to action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 text-left font-sans">
          {/* Step 1 */}
          <div className="p-4 bg-bg-panel/10 border border-border-subtle/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold">1</span>
              <span className="text-xs font-bold text-text-primary uppercase">Upload</span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-relaxed">
              Scan a meal photo or supply ingredients to map exact constituent weight splits.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-bg-panel/10 border border-border-subtle/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold">2</span>
              <span className="text-xs font-bold text-text-primary uppercase">Analyze</span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-relaxed">
              EIE dynamically maps ingredients back to crops, cultivation regions, and runoff.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-bg-panel/10 border border-border-subtle/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold">3</span>
              <span className="text-xs font-bold text-text-primary uppercase">Discover</span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-relaxed">
              Trace occurrences and ecological threat mappings using IUCN Red List references.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-bg-panel/10 border border-border-subtle/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold">4</span>
              <span className="text-xs font-bold text-text-primary uppercase">Improve</span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-relaxed">
              Simulate swaps (such as millets) to mitigate watersheds drafts and riparian footprint.
            </p>
          </div>
        </div>
      </div>

      {/* 4. TRUST STRIP FOOTER */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-20 md:mt-28 pt-8 border-t border-border-subtle/60 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="space-y-1">
          <h4 className="text-[10px] font-sans font-bold tracking-wider text-text-primary uppercase">
            TRUSTED ENVIRONMENTAL DATASOURCES
          </h4>
          <p className="text-[9px] text-text-muted">
            All telemetry is backed deterministically by validated global registries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] font-sans font-bold">
          <span className="flex items-center gap-1.5 bg-bg-panel/40 border border-border-subtle px-2.5 py-1 rounded text-text-muted">
            <CheckCircle className="w-3 h-3 text-accent-cyan" />
            <span>GBIF OCCURRENCE</span>
          </span>
          <span className="flex items-center gap-1.5 bg-bg-panel/40 border border-border-subtle px-2.5 py-1 rounded text-text-muted">
            <CheckCircle className="w-3 h-3 text-accent-cyan" />
            <span>IUCN RED LIST</span>
          </span>
          <span className="flex items-center gap-1.5 bg-bg-panel/40 border border-border-subtle px-2.5 py-1 rounded text-text-muted">
            <CheckCircle className="w-3 h-3 text-accent-cyan" />
            <span>WRIS HYDROLOGY</span>
          </span>
          <span className="flex items-center gap-1.5 bg-bg-panel/40 border border-border-subtle px-2.5 py-1 rounded text-text-muted">
            <CheckCircle className="w-3 h-3 text-accent-cyan" />
            <span>FAOSTAT CROPS</span>
          </span>
          <span className="flex items-center gap-1.5 bg-bg-panel/40 border border-border-subtle px-2.5 py-1 rounded text-text-muted">
            <CheckCircle className="w-3 h-3 text-accent-cyan" />
            <span>ICAR AGRONOMY</span>
          </span>
        </div>
      </div>

    </PageContainer>
  );
};
export default Home;
