import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '@/providers';
import { 
  PageContainer, 
  Section, 
  Card, 
  Button 
} from '@/components';
import { 
  Apple, 
  Wheat, 
  Dna, 
  Droplet, 
  CloudSun, 
  FileText,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ExperimentModule {
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  icon: React.ReactNode;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { createExperiment } = useExperiment();
  const [question, setQuestion] = useState('');

  const examples = [
    'What happens if my hostel replaces rice with millet?',
    'Which breakfast has the lowest biodiversity impact?',
    'What if rainfall decreases by 20%?',
    'How does cotton farming affect biodiversity?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    createExperiment(question.trim());
    navigate('/workspace');
  };

  const handleExampleClick = (text: string) => {
    setQuestion(text);
  };

  const modules: ExperimentModule[] = [
    {
      name: 'Food',
      description: 'Scan or model food items to reveal hidden resource loops, emissions, and ecological impact pathways.',
      status: 'available',
      icon: <Apple className="w-5 h-5 text-accent-cyan" />,
    },
    {
      name: 'Agriculture',
      description: 'Model agricultural crop rotation, pesticide run-off, and soil health changes over multi-year scales.',
      status: 'coming-soon',
      icon: <Wheat className="w-5 h-5 text-text-muted" />,
    },
    {
      name: 'Species',
      description: 'Simulate ecological food web disruptions when keystone species are introduced or removed from local biomes.',
      status: 'coming-soon',
      icon: <Dna className="w-5 h-5 text-text-muted" />,
    },
    {
      name: 'Watershed',
      description: 'Track hydrology perturbations, heavy metal seepage, and micro-plastics dispersal within catchment basins.',
      status: 'coming-soon',
      icon: <Droplet className="w-5 h-5 text-text-muted" />,
    },
    {
      name: 'Climate',
      description: 'Analyze heat dome structures, carbon sink decay rates, and local micro-climate pressure variances.',
      status: 'coming-soon',
      icon: <CloudSun className="w-5 h-5 text-text-muted" />,
    },
    {
      name: 'Policy',
      description: 'Impose ecological taxes or plastic bans to simulate regional economic and supply-chain ripple reactions.',
      status: 'coming-soon',
      icon: <FileText className="w-5 h-5 text-text-muted" />,
    },
  ];

  return (
    <PageContainer size="lg" className="flex flex-col min-h-[calc(100vh-4rem)] justify-center">
      {/* Hero Section */}
      <Section spacing="lg" className="max-w-3xl mx-auto w-full pt-6 md:pt-16 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-panel border border-border-muted rounded-full text-[10px] font-mono tracking-widest text-accent-cyan uppercase shadow-glow">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            ENVIRONMENTAL EXPERIMENTATION PLATFORM
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary">
            Welcome, Explorer.
          </h1>
          
          <p className="text-base md:text-lg text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
            What environmental question would you like to explore today?
          </p>
        </div>

        {/* Large Beautiful Question Input */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative flex items-center bg-bg-panel border border-border-muted hover:border-border-active focus-within:border-accent-cyan focus-within:ring-1 focus-within:ring-accent-cyan/35 rounded-xl px-4 py-2 transition-all duration-200 shadow-panel">
            <Search className="w-5 h-5 text-text-muted shrink-0 mr-3" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your environmental hypothesis or query..."
              className="w-full bg-transparent border-0 outline-none text-text-primary text-sm md:text-base py-2 placeholder-text-muted/60"
            />
            <Button 
              type="submit"
              variant="primary" 
              size="md"
              disabled={!question.trim()}
              className="font-mono text-xs tracking-wider uppercase gap-1 shrink-0 ml-2 rounded-lg"
            >
              <span>Create Experiment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Clickable Inspiration Example List */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">
              Suggested Hypotheses:
            </span>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => handleExampleClick(ex)}
                  className="text-left text-xs text-text-secondary hover:text-text-primary hover:border-border-active bg-bg-panel/40 border border-border-subtle rounded-lg px-3 py-1.5 transition-all duration-150 font-sans cursor-pointer active:bg-bg-panel"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Section>

      {/* Grid Section */}
      <Section spacing="md" className="border-t border-border-subtle pt-12 mt-12">
        <div className="flex flex-col space-y-2 mb-8">
          <h2 className="text-xs font-mono tracking-widest text-text-muted uppercase">
            ACTIVE EXPERIMENT MODULES
          </h2>
          <p className="text-sm text-text-secondary">
            Modules provide structured telemetry overlays for specific environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Card 
              key={mod.name} 
              hoverable
              className="flex flex-col justify-between text-left h-full border border-border-subtle min-h-[170px] bg-bg-panel/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-bg-dark rounded-md border border-border-subtle">
                    {mod.icon}
                  </div>
                  
                  {mod.status === 'available' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-status-available/10 text-status-available border border-status-available/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                      AVAILABLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-bg-dark text-text-muted border border-border-subtle">
                      COMING SOON
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-text-primary font-mono">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
};
export default Home;
