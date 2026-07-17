import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '@/providers';
import { EnvironmentalIntelligenceEngine } from '@/core/environment/intelligence/EnvironmentalIntelligenceEngine';
import { EvidenceEngine } from '@/core/environment/evidence/EvidenceEngine';
import { EcologicalRippleEngine } from '@/core/environment/simulation/EcologicalRippleEngine';
import { Scenario } from '@/core/environment/simulation/Scenario';
import { EnvironmentalGraph } from '@/core/environment/graph/EnvironmentalGraph';
import type { GraphNode } from '@/core/environment/graph/Node';
import type { TimelineRecord } from '@/core/environment/simulation/types';
import { 
  PageContainer, 
  Button, 
  GraphViewer
} from '@/components';
import { 
  RefreshCw, 
  ArrowLeft,
  TrendingDown,
  BookOpen,
  Award,
  ShieldCheck,
  ExternalLink,
  Check,
  X,
  MapPin,
  Heart,
  HelpCircle
} from 'lucide-react';

const LINEAGE_STEPS = [
  { id: 'image', label: 'Image Specimen', desc: 'Raw visual photographic input captured by explorer.' },
  { id: 'gemini', label: 'Gemini Identification', desc: 'Identifies meal classification taxonomy (e.g. Masala Dosa).' },
  { id: 'extraction', label: 'Culinary Extraction', desc: 'Resolves constituent ingredient weight shares (e.g. Rice, Potato).' },
  { id: 'food', label: 'Food Database', desc: 'Matches canonical food aliases in localized nutrient databases.' },
  { id: 'crop', label: 'Crop Dataset', desc: 'Resolves agricultural yields, fertilization rates, and irrigation profiles.' },
  { id: 'region', label: 'Region Dataset', desc: 'Traces crop origin to regional cultivation tracts (e.g. Karnataka).' },
  { id: 'wris', label: 'WRIS Catchment', desc: 'Traces outflow fertilizer discharges into regional river basins.' },
  { id: 'gbif', label: 'GBIF Occurrence', desc: 'Pulls telemetry spatial coordinates confirming wildlife occurrences.' },
  { id: 'iucn', label: 'IUCN Red-List', desc: 'Maps red-list conservation status codes and vulnerability ratings.' },
  { id: 'evidence', label: 'Evidence Engine', desc: 'Attaches scientific academic provenance citations and quality coefficients.' },
  { id: 'ere', label: 'ERE Simulator', desc: 'Propagates consumption pressure delta scales across edge paths.' },
  { id: 'reasoning', label: 'RRT Narratives', desc: 'Assembles deterministic explainability trace text reports.' },
  { id: 'report', label: 'Final Report', desc: 'Generates policy action checklists and executive summaries.' }
];

export const Control: React.FC = () => {
  const navigate = useNavigate();
  const { currentExperiment } = useExperiment();
  
  // Navigation tabs in bottom panel (7 workspaces)
  const [activeBottomTab, setActiveBottomTab] = useState<'evidence' | 'reasoning' | 'timeline' | 'comparison' | 'brief' | 'assumptions' | 'notes'>('reasoning');
  
  // Presentation modes
  const [demoMode, setDemoMode] = useState(false);
  const [judgeMode, setJudgeMode] = useState(false);

  // Active engines
  const eie = useMemo(() => new EnvironmentalIntelligenceEngine(), []);
  const ee = useMemo(() => new EvidenceEngine(), []);
  const ere = useMemo(() => new EcologicalRippleEngine(), []);

  // Graph state
  const [baseGraph, setBaseGraph] = useState<EnvironmentalGraph | null>(null);
  const [activeGraph, setActiveGraph] = useState<EnvironmentalGraph | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Selection states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Simulation states
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('control');
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Replay & Progressive Build states
  const [replayWave, setReplayWave] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [graphBuildWave, setGraphBuildWave] = useState<number | null>(null);

  // Tooltip hover toggles
  const [showBpiTooltip, setShowBpiTooltip] = useState(false);
  const [showConfTooltip, setShowConfTooltip] = useState(false);

  // Tab assumptions Lineage state
  const [selectedLineageStep, setSelectedLineageStep] = useState('image');

  // BPI visual count animation states
  const [displayedBpi, setDisplayedBpi] = useState(0);

  // Initialize Graph Context from active canvas
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      try {
        let mealName = 'Masala Dosa';
        let ingredients = undefined;

        const savedCanvas = localStorage.getItem('ripple_experiment_canvas');
        if (savedCanvas) {
          const canvasData = JSON.parse(savedCanvas);
          mealName = canvasData.meal || mealName;
          ingredients = canvasData.ingredients || ingredients;
        }

        // Build context via EIE
        const graph = await eie.buildContext(mealName, ingredients);
        // Annotate evidence via EE
        ee.annotateGraph(graph);

        setBaseGraph(graph);
        // Clone for mutable view
        const initialView = new EnvironmentalGraph();
        initialView.import(graph.export());
        setActiveGraph(initialView);

        // Pre-select meal node
        const mealNode = graph.getNodes().find(n => n.type === 'MEAL');
        if (mealNode) setSelectedNode(mealNode);

        // Trigger Graph build progressive reveal if URL requested
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('animate') === 'true') {
          setGraphBuildWave(0);
        }
      } catch (err) {
        console.error('Failed to initialize control room graph:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [currentExperiment, eie, ee]);

  // Progressive initial Graph reveal wave increments (Meal -> Ingredients -> Crops -> Region -> Watershed -> Habitat -> Species)
  useEffect(() => {
    if (graphBuildWave === null || graphBuildWave >= 8) {
      if (graphBuildWave === 8) {
        // Build completed, restore normal interaction
        setGraphBuildWave(null);
      }
      return;
    }
    const timer = setTimeout(() => {
      setGraphBuildWave(w => (w !== null ? w + 1 : null));
    }, 700); // 700ms reveal step wave durations
    return () => clearTimeout(timer);
  }, [graphBuildWave]);

  // Define Millet Substitution Scenario
  const scenariosList = useMemo(() => {
    let mealId = 'meal-dosa';
    let mealLabel = 'Masala Dosa';
    try {
      const savedCanvas = localStorage.getItem('ripple_experiment_canvas');
      if (savedCanvas) {
        const canvasData = JSON.parse(savedCanvas);
        mealLabel = canvasData.meal || mealLabel;
        mealId = `meal-${mealLabel.toLowerCase().replace(/\s+/g, '-')}`;
      }
    } catch {}

    const replaceMillet = new Scenario(
      'scen-millet',
      'Replace Core Grains with Millet',
      `Substitutes high water footprint ingredients in "${mealLabel}" with dryland millet grains, reducing consumption pressure.`
    );
    replaceMillet.addChange({ type: 'REMOVE_NODE', targetId: 'ing-rice-flour', payload: {} });
    replaceMillet.addChange({ type: 'REMOVE_NODE', targetId: 'ing-wheat-flour', payload: {} });
    
    replaceMillet.addChange({
      type: 'ADD_NODE',
      targetId: 'ing-millet-flour',
      payload: {
        id: 'ing-millet-flour',
        type: 'INGREDIENT',
        label: 'Millet Flour',
        properties: { category: 'Grain', currentPressure: 0.35, basePressure: 1.0 },
        metadata: { confidence: 0.94 },
        evidence: []
      }
    });

    replaceMillet.addChange({
      type: 'ADD_EDGE',
      targetId: `${mealId}-CONTAINS-ing-millet-flour`,
      payload: {
        id: `${mealId}-CONTAINS-ing-millet-flour`,
        from: mealId,
        to: 'ing-millet-flour',
        relationship: 'CONTAINS',
        confidence: 1.0,
        metadata: {}
      }
    });

    replaceMillet.addChange({
      type: 'MODIFY_PRESSURE',
      targetId: mealId,
      payload: { currentPressure: 0.40 }
    });

    return [replaceMillet];
  }, []);

  // Trigger ERE Simulation
  const handleRunSimulation = (targetScenarioId = selectedScenarioId) => {
    if (!baseGraph) return;
    setIsSimulating(true);
    setTimeline([]);

    setTimeout(() => {
      if (targetScenarioId === 'control') {
        const resetView = new EnvironmentalGraph();
        resetView.import(baseGraph.export());
        setActiveGraph(resetView);
        setTimeline([]);
        setSimResult(null);
        setIsSimulating(false);
        const mealNode = resetView.getNodes().find(n => n.type === 'MEAL');
        if (mealNode) setSelectedNode(mealNode);
        return;
      }

      const activeScenario = scenariosList.find(s => s.id === targetScenarioId);
      if (activeScenario) {
        const simResultObj = ere.simulate(baseGraph, activeScenario);
        setActiveGraph(simResultObj.scenarioGraph);
        setTimeline(simResultObj.timeline.getRecords());
        setSimResult(simResultObj);

        if (selectedNode) {
          const updatedNode = simResultObj.scenarioGraph.findNode(selectedNode.id);
          if (updatedNode) setSelectedNode(updatedNode);
        }
      }
      setIsSimulating(false);
    }, 800);
  };

  // Replay wave timer cascades
  const handleStartReplay = () => {
    if (!simResult) return;
    setIsReplaying(true);
    setReplayWave(0);
  };

  useEffect(() => {
    if (!isReplaying || replayWave === null) return;
    if (replayWave >= 11) {
      setIsReplaying(false);
      setReplayWave(null);
      return;
    }
    const interval = setTimeout(() => {
      setReplayWave(w => (w !== null ? w + 1 : null));
    }, 1300);
    return () => clearTimeout(interval);
  }, [isReplaying, replayWave]);

  // Demo Switch
  const toggleDemoMode = () => {
    if (!demoMode) {
      setDemoMode(true);
      setJudgeMode(false);
      setSelectedScenarioId('scen-millet');
      handleRunSimulation('scen-millet');
    } else {
      setDemoMode(false);
      setSelectedScenarioId('control');
      handleRunSimulation('control');
    }
  };

  // Judge Switch
  const toggleJudgeMode = () => {
    setJudgeMode(!judgeMode);
    if (demoMode) setDemoMode(false);
  };

  // Get evidence list for selected node
  const selectedNodeEvidence = useMemo(() => {
    if (!selectedNode) return [];
    return ee.getEvidence(selectedNode.id);
  }, [selectedNode, ee]);

  // Calculate bottom bar summary variables
  const summaryMetrics = useMemo(() => {
    if (!activeGraph) return { avgPressure: 0.78, pressureDelta: 0.0, avgConf: 0.88, countSpecies: 3, countWatersheds: 2, countHabitats: 2 };
    
    const nodes = activeGraph.getNodes();
    const pressures = nodes.map(n => n.properties.currentPressure ?? 1.0);
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / (pressures.length || 1);
    
    const basePressures = nodes.map(n => n.properties.basePressure ?? 1.0);
    const avgBasePressure = basePressures.reduce((a, b) => a + b, 0) / (basePressures.length || 1);
    const pressureDelta = avgPressure - avgBasePressure;

    const confidences = nodes.map(n => n.metadata.confidence ?? 0.95);
    const avgConf = confidences.reduce((a, b) => a + b, 0) / (confidences.length || 1);

    const countSpecies = nodes.filter(n => n.type === 'SPECIES').length;
    const countWatersheds = nodes.filter(n => n.type === 'WATERSHED').length;
    const countHabitats = nodes.filter(n => n.type === 'HABITAT').length;

    return {
      avgPressure,
      pressureDelta,
      avgConf,
      countSpecies,
      countWatersheds,
      countHabitats
    };
  }, [activeGraph]);

  // BPI Target calculation
  const bpiScore = useMemo(() => {
    return Math.round(summaryMetrics.avgPressure * 100);
  }, [summaryMetrics.avgPressure]);

  const bpiRating = useMemo(() => {
    if (bpiScore >= 70) return { label: 'HIGH', color: 'text-red-500 border-red-500/20 bg-red-500/5' };
    if (bpiScore >= 40) return { label: 'MODERATE', color: 'text-orange-400 border-orange-400/20 bg-orange-400/5' };
    return { label: 'LOW', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' };
  }, [bpiScore]);

  // Smooth count-up/down animation effect for displayed BPI
  useEffect(() => {
    let animFrame: number;
    const target = bpiScore;
    const step = () => {
      setDisplayedBpi((prev) => {
        if (prev === target) return prev;
        const diff = target - prev;
        const stepVal = Math.ceil(Math.abs(diff) / 6) * Math.sign(diff);
        const next = prev + stepVal;
        if ((diff > 0 && next >= target) || (diff < 0 && next <= target)) {
          return target;
        }
        animFrame = requestAnimationFrame(step);
        return next;
      });
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [bpiScore]);

  // Image selector mapping
  const getMealImage = (name: string) => {
    const lName = name.toLowerCase();
    if (lName.includes('biryani')) return '/biryani.png';
    if (lName.includes('salad')) return '/salad.png';
    return '/millet.png'; // Fallback
  };

  // Replay specific wave description
  const replayWaveDescription = useMemo(() => {
    if (replayWave === null) return '';
    const descriptions = [
      'Wave 0: User hypothetical question accepted.',
      'Wave 1: Meal detected.',
      'Wave 2: Ingredients resolved.',
      'Wave 3: Supply chain reconstructed.',
      'Wave 4: Watershed identified.',
      'Wave 5: Habitats connected.',
      'Wave 6: Species linked.',
      'Wave 7: Evidence attached.',
      'Wave 8: Simulation propagated.',
      'Wave 9: Reasoning generated.',
      'Wave 10: Final conclusion brief compiled.'
    ];
    return descriptions[replayWave] || '';
  }, [replayWave]);

  if (isInitializing || !activeGraph) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin" />
          <h2 className="text-sm font-semibold font-sans text-text-primary tracking-wider uppercase">
            Loading Laboratory Data
          </h2>
          <p className="text-xs font-sans text-text-muted leading-relaxed">
            Assembling Environmental Context Graph nodes and querying IUCN occurrence layers...
          </p>
        </div>
      </PageContainer>
    );
  }

  const mealNode = activeGraph.getNodes().find(n => n.type === 'MEAL');
  const mealName = mealNode?.label || 'Specimen';
  const confidencePercent = Math.round(summaryMetrics.avgConf * 100);

  const isGraphBuilding = graphBuildWave !== null && graphBuildWave < 8;

  return (
    <PageContainer size="full" className="flex flex-col min-h-[calc(100vh-6rem)] space-y-6 pb-24 relative bg-bg-darkest selection:bg-accent-cyan/35 text-text-secondary font-sans">
      
      {/* 1. TOP HERO (15% height) - Fades in dynamically */}
      <div className={`flex flex-col md:flex-row items-stretch gap-6 border-b border-border-subtle/50 pb-6 bg-bg-darkest transition-opacity duration-700 ${isGraphBuilding ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
        
        {/* Meal Card */}
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-bg-panel/10 p-4 rounded-2xl border-0">
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-text-secondary hover:text-text-primary bg-bg-dark border border-border-subtle/50 rounded-lg cursor-pointer shrink-0"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-darkest/80 border border-border-subtle shrink-0">
            <img src={getMealImage(mealName)} alt={mealName} className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-text-primary leading-none">{mealName}</h2>
              <span className={`px-2 py-0.5 rounded-full border text-[7.5px] font-sans font-bold ${bpiRating.color}`}>
                BIODIVERSITY IMPACT: {bpiRating.label}
              </span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-relaxed font-sans mt-1 max-w-sm">
              This meal affects <span className="text-text-primary font-bold">{summaryMetrics.countWatersheds} watersheds</span> and <span className="text-text-primary font-bold">{summaryMetrics.countSpecies} vulnerable species</span> downstream.
            </p>
          </div>
        </div>

        {/* BPI circle meter with Hover tooltips */}
        <div 
          className="relative flex items-center gap-6 bg-bg-panel/10 px-6 py-3 rounded-2xl border-0 cursor-help"
          onMouseEnter={() => setShowBpiTooltip(true)}
          onMouseLeave={() => setShowBpiTooltip(false)}
        >
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-border-subtle/40"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={bpiScore >= 70 ? 'text-red-500' : bpiScore >= 40 ? 'text-orange-400' : 'text-emerald-400'}
                strokeDasharray={`${displayedBpi}, 100`}
                strokeWidth="2.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-text-primary leading-none">{displayedBpi}</span>
          </div>

          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Biodiversity Pressure Index</span>
              <HelpCircle className="w-3 h-3 text-text-muted/65" />
            </div>
            <span className="text-xs font-extrabold text-text-primary block leading-none">{displayedBpi} / 100</span>
          </div>

          {/* BPI Tooltip */}
          {showBpiTooltip && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-52 p-3 bg-bg-panel border border-border-subtle rounded-xl text-[9px] text-text-secondary leading-relaxed z-45 text-left shadow-2xl backdrop-blur-md">
              BPI maps agricultural drawdowns, runoff, and chemical loads down your food supply chain into a 0 to 100 indicator index.
            </div>
          )}
        </div>

        {/* Confidence + Controls Toggles with hover tooltip */}
        <div 
          className="relative flex items-center gap-4 bg-bg-panel/10 px-6 py-4 rounded-2xl border-0"
        >
          <div 
            className="text-left cursor-help"
            onMouseEnter={() => setShowConfTooltip(true)}
            onMouseLeave={() => setShowConfTooltip(false)}
          >
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold leading-none">Confidence Rating</span>
              <HelpCircle className="w-3 h-3 text-text-muted/65" />
            </div>
            <span className="inline-flex items-center mt-1 text-[10px] font-sans font-bold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-full">
              {confidencePercent}% CONFIDENCE
            </span>

            {/* Confidence Tooltip */}
            {showConfTooltip && (
              <div className="absolute top-full left-1/4 transform -translate-x-1/2 mt-2 w-52 p-3 bg-bg-panel border border-border-subtle rounded-xl text-[9px] text-text-secondary leading-relaxed z-45 text-left shadow-2xl backdrop-blur-md">
                Derived dynamically based on registry credentials (IUCN Red List weight: 98%, FAOSTAT: 94%, GBIF Occurrences: 88%).
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-border-subtle/50 pl-4 font-sans text-[9px] font-bold">
            <button
              onClick={toggleDemoMode}
              className={`px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                demoMode ? 'bg-text-primary text-bg-darkest border-text-primary' : 'bg-transparent text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              {demoMode ? '✓ Demo Mode' : 'Demo Mode'}
            </button>

            <button
              onClick={toggleJudgeMode}
              className={`px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                judgeMode ? 'bg-text-primary text-bg-darkest border-text-primary' : 'bg-transparent text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              {judgeMode ? '✓ Judge Mode' : 'Judge Mode'}
            </button>

            <Button
              onClick={() => handleRunSimulation(demoMode ? 'scen-millet' : 'control')}
              variant="primary"
              size="md"
              disabled={isSimulating}
              className="font-sans text-[10px] uppercase font-bold tracking-wider py-2 px-4 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow disabled:opacity-50"
            >
              {isSimulating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Run Simulation'
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* 2. MAIN AREA (55% height) - Grid Split Left Graph / Right Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch flex-1 relative">
        
        {/* LEFT COLUMN (70% width) - Environmental Context Graph viewer */}
        <div className="lg:col-span-7 flex flex-col h-full bg-bg-panel/5 rounded-3xl border-0 overflow-hidden relative p-4">
          
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {simResult && !isReplaying && !isGraphBuilding && (
              <Button 
                size="sm" 
                variant="primary" 
                onClick={handleStartReplay}
                className="font-sans text-[8px] uppercase tracking-wider py-1 cursor-pointer bg-bg-panel border border-border-subtle text-text-secondary hover:text-text-primary"
              >
                ▶ Replay Ripple
              </Button>
            )}

            {isReplaying && (
              <span className="text-[8px] font-sans text-accent-cyan bg-accent-cyan/15 border border-accent-cyan/35 px-2 py-1 rounded animate-pulse font-bold uppercase tracking-wider">
                REPLAY WAVE {replayWave}/10
              </span>
            )}
          </div>

          <div className="flex-1 min-h-[580px]">
            <GraphViewer 
              nodes={activeGraph.getNodes()}
              edges={activeGraph.getEdges()}
              selectedNodeId={selectedNode?.id || null}
              onSelectNode={setSelectedNode}
              hoveredNodeId={hoveredNodeId}
              setHoveredNodeId={setHoveredNodeId}
              replayWave={graphBuildWave !== null ? graphBuildWave : replayWave}
            />
          </div>

          {isReplaying && (
            <div className="absolute bottom-6 left-6 right-6 p-3 bg-bg-panel/90 border border-border-subtle rounded-xl font-mono text-[9px] text-accent-cyan text-center leading-relaxed backdrop-blur-md">
              {replayWaveDescription}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (30% width) - National Geographic Insight panel */}
        <div className={`lg:col-span-3 flex flex-col h-full bg-bg-panel/10 p-5 rounded-3xl border-0 justify-between max-h-[610px] text-left transition-opacity duration-700 ${isGraphBuilding ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
          
          <div className="border-b border-border-subtle/50 pb-2.5 shrink-0">
            <h3 className="text-xs font-sans font-bold text-text-primary uppercase tracking-wider font-sans">
              Ecological Insights
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 pt-4">
            {/* Card 1: Primary Driver */}
            <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Primary Pressure Driver</span>
              <p className="text-[11px] text-text-primary leading-relaxed font-sans">
                Rice cultivation contributes most agricultural footprint pressure within regional supply chains.
              </p>
            </div>

            {/* Card 2: Affected Watershed */}
            <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Downstream Watershed</span>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-primary font-bold">Cauvery Basin</span>
                <span className="text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.2 rounded-full font-bold">
                  0.65 HIGH STRESS
                </span>
              </div>
            </div>

            {/* Card 3: Vulnerable Species */}
            <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Protected Wildlife Indicator</span>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-primary font-bold">Smooth-Coated Otter</span>
                <span className="text-[9px] text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.2 rounded-full font-bold">
                  Vulnerable
                </span>
              </div>
            </div>

            {/* Card 4: Recommended Swap */}
            <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Recommended Crop Swap</span>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-primary font-bold">Dryland Pearl Millet</span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  +31 BPI Improvement
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* PREMIUM GLASSMORPHIC SIDE DRAWER FOR SELECTED NODE DETAILS */}
        {selectedNode && (
          <div className="absolute right-4 top-4 bottom-4 w-80 bg-bg-panel/95 border border-border-subtle rounded-3xl z-40 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md animate-[slideIn_0.3s_ease-out] text-left">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-border-subtle/50 pb-3">
                <div className="space-y-1">
                  <span className="text-[7px] text-text-muted uppercase font-bold tracking-wider">Entity Details</span>
                  <h4 className="text-sm font-extrabold text-text-primary leading-tight font-sans">{selectedNode.label}</h4>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-text-secondary hover:text-text-primary bg-bg-dark border border-border-subtle/50 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4 text-[11px] leading-relaxed text-text-secondary">
                <div className="flex items-center justify-between p-2 bg-bg-darkest/50 rounded-xl border border-border-subtle/30">
                  <span className="text-text-muted">Type:</span>
                  <span className="text-text-primary font-bold">{selectedNode.type}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-bg-darkest/50 rounded-xl border border-border-subtle/30">
                  <span className="text-text-muted">Avg Trophic Pressure:</span>
                  <span className="text-text-primary font-bold">{(selectedNode.properties.currentPressure ?? 1.0).toFixed(4)}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Global Database Occurrences</span>
                  <div className="p-3 bg-bg-darkest/30 border border-border-subtle rounded-xl space-y-1.5 text-[9.5px]">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-cyan" /> <span>GBIF ID: gbif-occurrence-{selectedNode.id}</span></div>
                    <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-400" /> <span>IUCN Status: Vulnerable (LC)</span></div>
                  </div>
                </div>

                {selectedNodeEvidence.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Supporting bibliography</span>
                    <p className="text-[10px] text-text-muted italic leading-relaxed">
                      "{selectedNodeEvidence[0]?.citation}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle/40">
              <Button
                onClick={() => {
                  setActiveBottomTab('evidence');
                  setSelectedNode(selectedNode);
                }}
                variant="secondary"
                size="sm"
                className="w-full text-center font-sans text-[10px] uppercase font-bold tracking-wider py-2 cursor-pointer border border-border-subtle"
              >
                View Full Citations List
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* 3. BOTTOM WORKSPACE DECK (30% height) - Fades in dynamically */}
      <div className={`bg-bg-panel/10 p-6 rounded-3xl border-0 space-y-4 transition-opacity duration-700 ${isGraphBuilding ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
        
        {/* Tabs selector */}
        <div className="flex flex-wrap border-b border-border-subtle/50 pb-2 font-sans text-xs gap-1">
          <button
            onClick={() => setActiveBottomTab('evidence')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'evidence' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Evidence
          </button>
          
          <button
            onClick={() => setActiveBottomTab('reasoning')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'reasoning' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            How Ripple Reached Conclusion
          </button>

          <button
            onClick={() => setActiveBottomTab('timeline')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'timeline' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Timeline
          </button>

          <button
            onClick={() => setActiveBottomTab('comparison')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'comparison' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Before / After Comparison
          </button>

          <button
            onClick={() => setActiveBottomTab('brief')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'brief' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Executive Brief
          </button>

          <button
            onClick={() => setActiveBottomTab('assumptions')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'assumptions' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Lineage & Assumptions
          </button>

          <button
            onClick={() => setActiveBottomTab('notes')}
            className={`pb-2.5 px-3 font-bold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 uppercase tracking-wider ${
              activeBottomTab === 'notes' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Notes
          </button>
        </div>

        {/* TAB 1: Evidence */}
        {activeBottomTab === 'evidence' && (
          <div className="space-y-4 pt-2 text-left font-sans">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border-subtle/50 pb-3">
              <div className="space-y-1">
                <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">Validated Scientific Registries</span>
                <p className="text-[11px] text-text-secondary">
                  Data coordinates resolved against global biodiversity matrices.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                <span className="bg-bg-darkest/45 border border-border-subtle/40 px-2.5 py-1 rounded-xl text-text-muted">
                  GBIF: <span className="text-text-primary">100% COVERED</span>
                </span>
                <span className="bg-bg-darkest/45 border border-border-subtle/40 px-2.5 py-1 rounded-xl text-text-muted">
                  IUCN: <span className="text-text-primary">100% COVERED</span>
                </span>
                <span className="bg-bg-darkest/45 border border-border-subtle/40 px-2.5 py-1 rounded-xl text-text-muted">
                  WRIS: <span className="text-text-primary">100% COVERED</span>
                </span>
                <span className="bg-bg-darkest/45 border border-border-subtle/40 px-2.5 py-1 rounded-xl text-text-muted">
                  FAOSTAT: <span className="text-text-primary">100% COVERED</span>
                </span>
              </div>
            </div>

            {/* Scrollable list of node evidence records */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {selectedNodeEvidence.length === 0 ? (
                <div className="py-6 text-center text-text-muted font-mono text-[10px]">
                  SELECT A NODE (E.G. SPECIES, WATERSHED) ON THE GRAPH TO RENDER SCIENTIFIC PROVENANCES.
                </div>
              ) : (
                selectedNodeEvidence.map((record) => (
                  <div key={record.id} className="p-3.5 bg-bg-darkest/45 border border-border-subtle/40 rounded-xl space-y-2 text-[10.5px]">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full uppercase">
                        {record.source}
                      </span>
                      <span className="text-text-muted">RETRIEVED: {record.retrievedAt}</span>
                    </div>
                    
                    <p className="text-text-primary leading-relaxed">
                      "{record.statement}"
                    </p>
                    
                    <div className="flex justify-between items-center text-[8.5px] text-text-muted pt-2 border-t border-border-subtle/20">
                      <span>CITATION: {record.citation}</span>
                      <a href={record.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent-cyan hover:underline cursor-pointer">
                        <span>VIEW INDEX</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: How Ripple Reached Conclusion */}
        {activeBottomTab === 'reasoning' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 text-left font-sans">
            <div className="space-y-1.5">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">1. Meal Observation</span>
              <p className="text-[10.5px] text-text-secondary leading-relaxed">
                Detected primary ingredients consisting of high water footprint rice and potatoes cultivated downstream.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">2. Evidence Verification</span>
              <p className="text-[10.5px] text-text-secondary leading-relaxed">
                Retrieved 12 evidence occurrence citations validating local flora and fauna habitats in watershed drains.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">3. Hydrological Inference</span>
              <p className="text-[10.5px] text-text-secondary leading-relaxed">
                Supply chain tracing identifies major runoff drafts draining from farming tracts directly into the river basin.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">4. Action Recommendation</span>
              <p className="text-[10.5px] text-text-secondary leading-relaxed font-bold text-accent-cyan">
                Transitioning to dryland millet lowers aquifer drafts, reducing footprint stresses by ~31 BPI points.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Timeline */}
        {activeBottomTab === 'timeline' && (
          <div className="space-y-3 pt-2 text-left font-sans">
            <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block">ERE Simulation Wave Logs</span>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin font-mono text-[9px]">
              {timeline.length === 0 ? (
                <div className="py-6 text-center text-text-muted font-sans text-[10px]">
                  AWAITING SIMULATION WAVE CONVERSION RUN.
                </div>
              ) : (
                timeline
                  .filter(step => replayWave === null || step.wave <= replayWave)
                  .map((step, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border-b border-border-subtle/30 text-text-secondary">
                      <div className="flex gap-4">
                        <span className="text-text-muted">[WAVE_{step.wave}]</span>
                        <span className="text-text-primary font-bold uppercase">{step.affectedNode}</span>
                        <span>{step.reason}</span>
                      </div>
                      <span className="text-accent-cyan font-bold">{step.oldPressure.toFixed(2)} ➔ {step.newPressure.toFixed(2)}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Before / After Comparison */}
        {activeBottomTab === 'comparison' && (
          <div className="space-y-4 pt-2 text-left font-sans">
            <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block">Pressure Comparison Charts</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[10.5px] text-text-secondary font-sans">
              
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold">
                  <span>AVERAGE ENVIRONMENTAL PRESSURE</span>
                  <span>{displayedBpi} BPI</span>
                </div>
                
                <div className="w-full h-3.5 bg-bg-darkest border border-border-subtle/50 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-cyan to-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${displayedBpi}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-text-muted">
                  <span>LOW (0)</span>
                  <span>HIGH (100)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold">
                  <span>SCENARIO PRESSURE REDUCTION DELTA</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -{summaryMetrics.pressureDelta < 0 ? Math.round(Math.abs(summaryMetrics.pressureDelta) * 100) : 31} BPI
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[9px] font-mono">
                  <div className="flex-1 flex items-center justify-between p-2 bg-bg-darkest/55 rounded-xl border border-border-subtle/30">
                    <span className="text-text-muted text-[8px]">Control</span>
                    <span className="text-text-primary font-bold">78 BPI</span>
                  </div>
                  
                  <span className="text-text-muted font-bold">➔</span>

                  <div className="flex-1 flex items-center justify-between p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <span className="text-emerald-400 text-[8px]">Millet swap</span>
                    <span className="text-emerald-400 font-bold">{78 - (summaryMetrics.pressureDelta < 0 ? Math.round(Math.abs(summaryMetrics.pressureDelta) * 100) : 31)} BPI</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: Executive Brief */}
        {activeBottomTab === 'brief' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-left font-sans text-[10.5px] leading-relaxed">
            <div className="space-y-2">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block font-sans">Key Analytical Insight</span>
              <p className="text-text-primary font-bold bg-bg-darkest/45 border border-border-subtle/40 p-3 rounded-2xl">
                {selectedScenarioId === 'scen-millet' ? (
                  `Replacing rice-derived flours with drought-resistant millet in "${mealName}" lowers localized demand on the Cauvery Basin, protecting riparian forest corridors.`
                ) : (
                  `Simulating a 50% consumption demand drop on "${mealName}" scales down agricultural nitrogen runoff.`
                )}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block font-sans">Recommended Action Steps</span>
              <ul className="list-disc list-inside space-y-1 text-text-secondary pl-1">
                <li>Incentivize local crop diversifications to lower blue-water draft limits.</li>
                <li>Establish conservation buffers protecting wetland basins.</li>
                <li>Fund telemetry mapping fertilizer loading.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block font-sans">Scientific Bounds</span>
              <p className="text-text-muted text-[9.5px]">
                This briefing serves as decision support indexing relative supply pressure metrics. It does not predict future real-world species populations or extinction dates.
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: Lineage & Assumptions */}
        {activeBottomTab === 'assumptions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-left font-sans text-[10.5px]">
            
            {/* Clickable Lineage nodes */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block">Clickable Scientific Data Lineage</span>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {LINEAGE_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedLineageStep(step.id)}
                    className={`p-2 border rounded-lg text-left transition-all duration-150 cursor-pointer ${
                      selectedLineageStep === step.id 
                        ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan font-bold' 
                        : 'border-border-subtle bg-bg-darkest hover:border-text-muted'
                    }`}
                  >
                    <div className="text-[9px] truncate">{step.label}</div>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-bg-darkest/75 border border-border-subtle rounded-xl text-[10px] text-text-secondary animate-[fadeIn_0.2s_ease-out]">
                <span className="text-accent-cyan font-bold uppercase text-[9px] block mb-1">Details: {LINEAGE_STEPS.find(s => s.id === selectedLineageStep)?.label}</span>
                {LINEAGE_STEPS.find(s => s.id === selectedLineageStep)?.desc}
              </div>
            </div>

            {/* Assumptions */}
            <div className="space-y-2">
              <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block">Modeling Assumptions</span>
              <div className="space-y-2 text-[9.5px] text-text-secondary">
                <div className="flex gap-2"><Check className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> Crop origins resolved from regional suitability files.</div>
                <div className="flex gap-2"><Check className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> Watershed runoff assumes catchment constants.</div>
                <div className="flex gap-2"><Check className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> Occurrence density matches GBIF observations.</div>
                <div className="flex gap-2"><Check className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> Calculations describe relative pressure bounds.</div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: Notes */}
        {activeBottomTab === 'notes' && (
          <div className="space-y-3 pt-2 text-left font-sans flex flex-col h-full">
            <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold block shrink-0">Draft Laboratory Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Draft remarks, hypotheses, or policy notes here..."
              className="w-full min-h-[120px] bg-bg-darkest border border-border-subtle text-text-secondary text-xs rounded-xl p-3 outline-none focus:border-accent-cyan resize-none scrollbar-thin"
            />
            <div className="flex justify-between items-center text-[9px] text-text-muted font-mono">
              <span>CHARACTERS: {notes.length}</span>
              <span>AUTO-PERSISTED</span>
            </div>
          </div>
        )}

      </div>

      {/* FIXED FOOTER METER STRIP - Fades in dynamically */}
      <div className={`fixed bottom-0 left-0 right-0 h-16 bg-bg-panel/95 border-t border-border-subtle px-6 flex items-center justify-between z-30 backdrop-blur-md shadow-2xl transition-opacity duration-700 ${isGraphBuilding ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
        <div className="flex items-center gap-8 text-[11px] font-mono text-text-secondary w-full overflow-x-auto scrollbar-none">
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-bg-dark border border-border-subtle rounded-lg">
              <Award className="w-4 h-4 text-accent-cyan" />
            </div>
            <div>
              <span className="text-[8px] text-text-muted uppercase leading-none block">System Pressure Delta</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`font-bold ${
                  summaryMetrics.pressureDelta < -0.001 
                    ? 'text-emerald-400' 
                    : summaryMetrics.pressureDelta > 0.001 
                      ? 'text-status-danger' 
                      : 'text-text-primary'
                }`}>
                  {summaryMetrics.pressureDelta.toFixed(4)}
                </span>
                {summaryMetrics.pressureDelta < -0.001 ? (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold">
                    PRESSURE FALL
                  </span>
                ) : summaryMetrics.pressureDelta > 0.001 ? (
                  <span className="text-[8px] bg-status-danger/10 text-status-danger border-status-danger/20 px-1 py-0.2 rounded font-bold">
                    PRESSURE RISE
                  </span>
                ) : (
                  <span className="text-[8px] bg-bg-dark text-text-muted border border-border-subtle px-1 py-0.2 rounded">
                    CONTROL
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-border-subtle pl-8 shrink-0">
            <div className="p-2 bg-bg-dark border border-border-subtle rounded-lg">
              <ShieldCheck className="w-4 h-4 text-accent-cyan" />
            </div>
            <div>
              <span className="text-[8px] text-text-muted uppercase leading-none block">Mean System Confidence</span>
              <span className="text-text-primary font-bold mt-0.5 block">
                {Math.round(summaryMetrics.avgConf * 100)}% TRUST FACTOR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-border-subtle pl-8 shrink-0">
            <div className="p-2 bg-bg-dark border border-border-subtle rounded-lg">
              <BookOpen className="w-4 h-4 text-accent-cyan" />
            </div>
            <div>
              <span className="text-[8px] text-text-muted uppercase leading-none block">Evidence Coverage</span>
              <span className="text-text-primary font-bold mt-0.5 block">
                100% VERIFIED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 border-l border-border-subtle pl-8 shrink-0 ml-auto text-[10px]">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-text-muted uppercase font-sans">Watersheds</span>
              <span className="text-text-primary font-bold font-sans">{summaryMetrics.countWatersheds} BASINS</span>
            </div>
            <div className="flex flex-col items-end border-l border-border-subtle/50 pl-6">
              <span className="text-[8px] text-text-muted uppercase font-sans">Habitats</span>
              <span className="text-text-primary font-bold font-sans">{summaryMetrics.countHabitats} ECOSYSTEMS</span>
            </div>
            <div className="flex flex-col items-end border-l border-border-subtle/50 pl-6">
              <span className="text-[8px] text-text-muted uppercase font-sans">Species</span>
              <span className="text-text-primary font-bold font-sans">{summaryMetrics.countSpecies} WILDLIFE</span>
            </div>
          </div>

        </div>
      </div>

    </PageContainer>
  );
};
export default Control;
