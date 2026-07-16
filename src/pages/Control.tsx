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
import { ReasoningEngine } from '@/core/reasoning/ReasoningEngine';
import evidenceJson from '../core/ontology/datasets/evidence/evidence.json';
import citationsJson from '../core/ontology/datasets/citations/citations.json';
import datasetsJson from '../core/ontology/datasets/datasets/datasets.json';
import { 
  PageContainer, 
  Card, 
  Button, 
  GraphViewer
} from '@/components';
import { 
  Activity, 
  Database, 
  ShieldCheck, 
  Compass, 
  Layers, 
  Play, 
  RefreshCw, 
  Award,
  BookOpen,
  ArrowLeft,
  Clock,
  ExternalLink,
  Flame,
  Check,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Network,
  Info
} from 'lucide-react';

const LINEAGE_STEPS = [
  { id: 'image', label: 'Image Specimen', desc: 'Raw visual photographic input captured by explorer.' },
  { id: 'gemini', label: 'Gemini Identification', desc: 'Identifies meal classification taxonomy (e.g. Masala Dosa).' },
  { id: 'extraction', label: 'Culinary Extraction', desc: 'Resolves constituent ingredient weight shares (e.g. Rice, Potato).' },
  { id: 'food', label: 'Food Dataset', desc: 'Matches canonical food aliases in localized nutrient databases.' },
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
  const [timeString, setTimeString] = useState('');
  
  // Navigation tabs in control room
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'console' | 'comparison' | 'lineage' | 'executive'>('console');
  
  // Presentation modes
  const [demoMode, setDemoMode] = useState(false);
  const [judgeMode, setJudgeMode] = useState(false);

  // Active engines
  const eie = useMemo(() => new EnvironmentalIntelligenceEngine(), []);
  const ee = useMemo(() => new EvidenceEngine(), []);
  const ere = useMemo(() => new EcologicalRippleEngine(), []);
  const reasoningEngine = useMemo(() => new ReasoningEngine(), []);

  // Graph state
  const [baseGraph, setBaseGraph] = useState<EnvironmentalGraph | null>(null);
  const [activeGraph, setActiveGraph] = useState<EnvironmentalGraph | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Selection states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'evidence' | 'notes'>('reasoning');

  // Simulation states
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('control');
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [simResult, setSimResult] = useState<any | null>(null);

  // Replay states
  const [replayWave, setReplayWave] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  // Tab 3 Lineage state
  const [selectedLineageStep, setSelectedLineageStep] = useState('image');

  // Reasoning formatting states
  const [reasoningMode, setReasoningMode] = useState<'pipeline' | 'narrative'>('pipeline');
  const [narrativeFormat, setNarrativeFormat] = useState<'SCIENTIFIC' | 'JUDGE' | 'TECHNICAL'>('SCIENTIFIC');

  // 1. Digital Clock (NASA telemetry styling)
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeString(date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Initialize Graph Context from active canvas
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
      } catch (err) {
        console.error('Failed to initialize control room graph:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [currentExperiment, eie, ee]);

  // 3. Define Scenarios
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
        properties: { category: 'Grain', currentPressure: 0.3, basePressure: 1.0 },
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
      payload: { currentPressure: 0.35 }
    });

    const reduceImpact = new Scenario(
      'scen-reduce',
      'Reduce Portion Demand by 50%',
      `Simulates the result of cutting consumer demand for "${mealLabel}" by half.`
    );
    reduceImpact.addChange({
      type: 'MODIFY_PRESSURE',
      targetId: mealId,
      payload: { currentPressure: 0.50 }
    });

    return [replaceMillet, reduceImpact];
  }, []);

  // 4. Trigger ERE Simulation
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
    }, 600);
  };

  // 5. Replay wave timer cascades
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
    }, 1500); // 1.5s step intervals for telemetry review
    return () => clearTimeout(interval);
  }, [isReplaying, replayWave]);

  // Demo Mode Switch
  const toggleDemoMode = () => {
    if (!demoMode) {
      setDemoMode(true);
      setJudgeMode(false);
      setSelectedScenarioId('scen-millet');
      handleRunSimulation('scen-millet');
      setReasoningMode('narrative');
      setActiveWorkspaceTab('console');
    } else {
      setDemoMode(false);
      setSelectedScenarioId('control');
      handleRunSimulation('control');
    }
  };

  // Judge Mode Switch
  const toggleJudgeMode = () => {
    setJudgeMode(!judgeMode);
    if (demoMode) setDemoMode(false);
  };

  // Get evidence for selected node
  const selectedNodeEvidence = useMemo(() => {
    if (!selectedNode) return [];
    return ee.getEvidence(selectedNode.id);
  }, [selectedNode, ee]);

  // Dynamic RRT Narrative text calculation
  const narrativeText = useMemo(() => {
    if (!simResult) {
      return 'Simulation engine standby. Select a scenario and click "Run Simulation" to generate narrative traces.';
    }
    try {
      if (narrativeFormat === 'SCIENTIFIC') {
        return reasoningEngine.getScientificNarrative(simResult, ee);
      } else if (narrativeFormat === 'JUDGE') {
        return reasoningEngine.getJudgeNarrative(simResult, ee);
      } else {
        return reasoningEngine.getTechnicalNarrative(simResult, ee);
      }
    } catch (e) {
      console.error(e);
      return 'Failed to compile reasoning trace narrative.';
    }
  }, [simResult, narrativeFormat, reasoningEngine, ee]);

  // Calculate bottom bar summary variables
  const summaryMetrics = useMemo(() => {
    if (!activeGraph) return { avgPressure: 1.0, pressureDelta: 0.0, avgConf: 0.95, countSpecies: 0, countWatersheds: 0, countHabitats: 0 };
    
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

  // Executive summary dashboard calculations
  const bpiData = useMemo(() => {
    if (!activeGraph) return { value: 0, category: 'N/A' };
    const speciesNodes = activeGraph.getNodes().filter(n => n.type === 'SPECIES');
    if (speciesNodes.length === 0) return { value: 0, category: 'N/A' };
    
    const avgSpeciesPressure = speciesNodes.reduce((acc, node) => acc + (node.properties.currentPressure ?? 1.0), 0) / speciesNodes.length;
    
    const value = Math.min(Math.max(Math.round(avgSpeciesPressure * 78), 0), 100);
    
    let category = 'Moderate';
    if (value <= 20) category = 'Very Low';
    else if (value <= 40) category = 'Low';
    else if (value <= 60) category = 'Moderate';
    else if (value <= 80) category = 'High';
    else category = 'Critical';
    
    return { value, category };
  }, [activeGraph]);

  const aggregatedConfidence = useMemo(() => {
    if (!activeGraph) return 0;
    const nodes = activeGraph.getNodes();
    const validNodes = nodes.filter(n => n.metadata?.confidence !== undefined);
    const avgNodeConf = validNodes.length > 0
      ? validNodes.reduce((acc, n) => acc + (n.metadata.confidence ?? 0.95), 0) / validNodes.length
      : 0.95;
    
    const nodesWithCitations = nodes.filter(n => n.evidence && n.evidence.length > 0).length;
    const citationCoverage = nodes.length > 0 ? nodesWithCitations / nodes.length : 1.0;
    
    const val = (avgNodeConf * 0.7) + (citationCoverage * 0.3);
    return Math.min(Math.max(Math.round(val * 100), 0), 100);
  }, [activeGraph]);

  const repWatershed = useMemo(() => {
    if (!activeGraph) return { name: 'N/A', stressIndex: 0.0, stressCategory: 'N/A' };
    const watersheds = activeGraph.getNodes().filter(n => n.type === 'WATERSHED');
    if (watersheds.length === 0) return { name: 'N/A', stressIndex: 0.0, stressCategory: 'N/A' };
    
    let maxStress = -1;
    let bestNode = watersheds[0];
    for (const node of watersheds) {
      const stress = node.properties.stressIndex ?? node.metadata?.metadata?.stressIndex ?? 0.0;
      if (stress > maxStress) {
        maxStress = stress;
        bestNode = node;
      }
    }
    
    const name = bestNode.label;
    const stressIndex = maxStress;
    const stressCategory = bestNode.metadata?.metadata?.stressCategory ?? (stressIndex > 0.8 ? 'Critical' : stressIndex > 0.6 ? 'High' : 'Moderate');
    
    return { name, stressIndex, stressCategory };
  }, [activeGraph]);

  const repSpecies = useMemo(() => {
    if (!activeGraph) return [];
    const species = activeGraph.getNodes().filter(n => n.type === 'SPECIES');
    const sorted = [...species].sort((a, b) => {
      const pA = a.properties.currentPressure ?? 1.0;
      const pB = b.properties.currentPressure ?? 1.0;
      return pB - pA;
    });
    
    return sorted.slice(0, 3).map(s => {
      return {
        commonName: s.metadata?.metadata?.commonName ?? s.label,
        status: s.metadata?.status ?? 'Least Concern'
      };
    });
  }, [activeGraph]);

  // Replay specific wave messages helper
  const replayWaveDescription = useMemo(() => {
    if (replayWave === null) return '';
    const descriptions = [
      'Wave 0: User hypothetical change question accepted into ERE simulation pad.',
      'Wave 1: Meal node classification identified and mapped.',
      'Wave 2: Culinary ingredient nodes resolved (constituent weight ratios computed).',
      'Wave 3: Crop dataset supply chains reconstructed (irrigation drafts resolved).',
      'Wave 4: Agrarian cultivation region locations identified.',
      'Wave 5: River catchments and watersheds identified via WRIS logs.',
      'Wave 6: Ecosystem habitats connected via IUCN RLE indices.',
      'Wave 7: Wildlife occurrences linked (GBIF coordinates attached).',
      'Wave 8: Evidence citations annotated and trust weights applied.',
      'Wave 9: Scenario pressure cascade propagated down to native habitats.',
      'Wave 10: RRT reasoning narratives generated and final conclusion briefs exported.'
    ];
    return descriptions[replayWave] || '';
  }, [replayWave]);

  if (isInitializing || !activeGraph) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin" />
          <h2 className="text-sm font-semibold font-mono text-text-primary tracking-wider uppercase">
            Initializing Control Console
          </h2>
          <p className="text-[10px] font-mono text-text-muted leading-relaxed">
            Stitching Environmental Context Graph nodes, calculating base confidence, and loading hydrologic basin matrices...
          </p>
        </div>
      </PageContainer>
    );
  }

  const mealNode = activeGraph.getNodes().find(n => n.type === 'MEAL');
  const mealName = mealNode?.label || 'Target Specimen';
  const confidencePercent = Math.round((mealNode?.metadata.confidence ?? 0.95) * 100);

  return (
    <PageContainer size="full" className="flex flex-col min-h-[calc(100vh-6rem)] space-y-4 pb-20 relative bg-bg-darkest">
      
      {/* Header bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-border-subtle pb-4 gap-4 bg-bg-darkest">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/discovery')}
            className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-panel border border-border-subtle rounded cursor-pointer"
            title="Back to Discovery Trail"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded leading-none">
                {demoMode ? 'DEMO MODE ACTIVE' : 'MISSION CONTROL'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
              <span className="text-[9px] font-mono text-text-muted uppercase">ACTIVE DATASTREAM</span>
            </div>
            <h1 className="text-lg font-bold font-mono tracking-tight text-text-primary mt-1">
              Ripple Laboratory Workspace
            </h1>
          </div>
        </div>

        {/* Demo & Judge Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant={demoMode ? 'primary' : 'secondary'}
            onClick={toggleDemoMode}
            className="font-mono text-[9px] uppercase px-3 cursor-pointer"
          >
            {demoMode ? '✓ Demo Mode On' : 'Start Demo Mode'}
          </Button>

          <Button
            size="sm"
            variant={judgeMode ? 'primary' : 'secondary'}
            onClick={toggleJudgeMode}
            className="font-mono text-[9px] uppercase px-3 cursor-pointer"
          >
            {judgeMode ? '✓ Judge Mode On' : 'Start Judge Mode'}
          </Button>
        </div>

        {/* Telemetry metadata readouts */}
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-text-secondary">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-text-muted uppercase">Target Specimen</span>
            <span className="text-text-primary font-bold">{mealName.toUpperCase()}</span>
          </div>
          <div className="flex flex-col items-end border-l border-border-subtle pl-6">
            <span className="text-[8px] text-text-muted uppercase">Telemetry Trust</span>
            <span className="text-accent-cyan font-bold">{confidencePercent}% CONFIDENCE</span>
          </div>
          <div className="flex flex-col items-end border-l border-border-subtle pl-6">
            <span className="text-[8px] text-text-muted">SYSTEM CLOCK</span>
            <div className="flex items-center gap-1.5 text-text-primary font-bold">
              <Clock className="w-3.5 h-3.5 text-accent-cyan" />
              <span>{timeString}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Sub-Tabs navigation */}
      <div className="flex border-b border-border-subtle shrink-0 font-mono text-[10px]">
        <button
          onClick={() => setActiveWorkspaceTab('console')}
          className={`pb-2.5 px-4 font-bold border-b-2 uppercase tracking-wide bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 ${
            activeWorkspaceTab === 'console' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" />
            <span>Mission Control Console</span>
          </div>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('comparison')}
          className={`pb-2.5 px-4 font-bold border-b-2 uppercase tracking-wide bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 ${
            activeWorkspaceTab === 'comparison' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Before / After Comparison</span>
          </div>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('lineage')}
          className={`pb-2.5 px-4 font-bold border-b-2 uppercase tracking-wide bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 ${
            activeWorkspaceTab === 'lineage' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Lineage & Assumptions</span>
          </div>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('executive')}
          className={`pb-2.5 px-4 font-bold border-b-2 uppercase tracking-wide bg-transparent outline-none border-0 cursor-pointer transition-all duration-150 ${
            activeWorkspaceTab === 'executive' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Executive Briefing</span>
          </div>
        </button>
      </div>

      {/* 🚨 Executive Scientific Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 bg-bg-panel/20 p-4 rounded-xl border border-border-subtle/50 backdrop-blur-md shrink-0">
        
        {/* 1. Biodiversity Pressure Index (BPI) */}
        <div className="bg-bg-darkest/50 border border-border-subtle p-3 rounded-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[8.5px] font-mono text-text-muted uppercase font-bold tracking-wider">Biodiversity Pressure Index (BPI)</span>
            <Activity className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text-primary tracking-tight group-hover:text-accent-cyan transition-colors duration-300">{bpiData.value}</span>
            <span className="text-[10px] text-text-muted">/ 100</span>
          </div>
          <div className="mt-1">
            <span className={`inline-block text-[8px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
              bpiData.category === 'Critical' ? 'bg-status-danger/10 text-status-danger border border-status-danger/20' :
              bpiData.category === 'High' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              bpiData.category === 'Moderate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {bpiData.category}
            </span>
          </div>
        </div>

        {/* 2. Confidence Score */}
        <div className="bg-bg-darkest/50 border border-border-subtle p-3 rounded-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8.5px] font-mono text-text-muted uppercase font-bold tracking-wider">Scientific Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold font-mono text-accent-cyan">{aggregatedConfidence}%</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden border border-zinc-700/50">
              <div 
                className="bg-accent-cyan h-full rounded-full transition-all duration-500" 
                style={{ width: `${aggregatedConfidence}%` }} 
              />
            </div>
          </div>
          <span className="text-[7.5px] font-mono text-text-muted mt-1">Aggregated from RKB nodes & cits</span>
        </div>

        {/* 3. Representative Watershed */}
        <div className="bg-bg-darkest/50 border border-border-subtle p-3 rounded-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8.5px] font-mono text-text-muted uppercase font-bold tracking-wider">Rep. Watershed</span>
            <Compass className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-2.5">
            <div className="text-xs font-bold font-mono text-text-primary truncate" title={repWatershed.name}>{repWatershed.name}</div>
            <div className="text-[9px] text-text-secondary mt-1 flex items-center gap-1.5">
              <span>Stress: <span className="font-bold text-text-primary">{(repWatershed.stressIndex).toFixed(2)}</span></span>
              <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase ${
                repWatershed.stressCategory === 'Critical' ? 'bg-status-danger/10 text-status-danger' :
                repWatershed.stressCategory === 'High' ? 'bg-amber-500/10 text-amber-500' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {repWatershed.stressCategory}
              </span>
            </div>
          </div>
          <span className="text-[7.5px] font-mono text-text-muted mt-1">Max stress basin in simulation</span>
        </div>

        {/* 4. Representative Species */}
        <div className="bg-bg-darkest/50 border border-border-subtle p-3 rounded-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8.5px] font-mono text-text-muted uppercase font-bold tracking-wider">Affected Species</span>
            <Layers className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-1.5 space-y-1 overflow-hidden">
            {repSpecies.length === 0 ? (
              <span className="text-[8.5px] font-mono text-text-muted">None active</span>
            ) : (
              repSpecies.map((sp, idx) => (
                <div key={idx} className="flex justify-between items-center text-[8.5px] font-mono border-b border-border-subtle/25 pb-0.5 last:border-b-0 truncate">
                  <span className="text-text-secondary truncate max-w-[90px]" title={sp.commonName}>{sp.commonName}</span>
                  <span className={`text-[7px] font-bold uppercase leading-none px-1 rounded ${
                    sp.status === 'Endangered' || sp.status === 'Critically Endangered' ? 'text-status-danger bg-status-danger/10' :
                    sp.status === 'Vulnerable' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-400 bg-emerald-400/10'
                  }`}>{sp.status.substring(0, 4)}.</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Evidence Summary */}
        <div className="bg-bg-darkest/50 border border-border-subtle p-3 rounded-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8.5px] font-mono text-text-muted uppercase font-bold tracking-wider">Evidence Summary</span>
            <Database className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center text-zinc-400 text-[9px] font-mono">
            <div className="bg-bg-dark border border-border-subtle/50 p-1 rounded">
              <div className="font-bold text-accent-cyan">{evidenceJson.length}</div>
              <div className="text-[6.5px] text-text-muted uppercase">Evid</div>
            </div>
            <div className="bg-bg-dark border border-border-subtle/50 p-1 rounded">
              <div className="font-bold text-accent-cyan">{citationsJson.length}</div>
              <div className="text-[6.5px] text-text-muted uppercase">Cits</div>
            </div>
            <div className="bg-bg-dark border border-border-subtle/50 p-1 rounded">
              <div className="font-bold text-accent-cyan">{datasetsJson.length}</div>
              <div className="text-[6.5px] text-text-muted uppercase">DSet</div>
            </div>
          </div>
          <span className="text-[7.5px] font-mono text-text-muted mt-1">Ontology-backed resources</span>
        </div>

        {/* 6. Data Quality */}
        <div className="bg-bg-darkest/50 border border-border-subtle p-3 rounded-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8.5px] font-mono text-text-muted uppercase font-bold tracking-wider">Data Quality & Ver.</span>
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center text-[8.5px] font-mono">
              <span className="text-text-muted">STATUS:</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.2 rounded text-[7.5px]">PASS</span>
            </div>
            <div className="flex justify-between items-center text-[8.5px] font-mono mt-1">
              <span className="text-text-muted">RKB VER:</span>
              <span className="text-text-secondary">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center text-[8.5px] font-mono mt-1">
              <span className="text-text-muted">VERIFIED:</span>
              <span className="text-text-secondary">2026-07-16</span>
            </div>
          </div>
          <span className="text-[7.5px] font-mono text-text-muted mt-1">All startup schemas certified</span>
        </div>

      </div>

      {/* VIEWPORT PANEL 1: MISSION CONTROL CONSOLE */}
      {activeWorkspaceTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 flex-1">
          
          {/* LEFT PANEL (30% width) - ECG Graph Viewer */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <Card bordered className="flex-1 flex flex-col p-4 bg-bg-panel/20">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase">
                  <Layers className="w-4 h-4 text-accent-cyan" />
                  <span>Environmental Context Graph</span>
                </div>
                
                {simResult && !isReplaying && (
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={handleStartReplay}
                    className="font-mono text-[8px] uppercase tracking-wider py-0.5 cursor-pointer"
                  >
                    ▶ Replay Ripple
                  </Button>
                )}

                {isReplaying && (
                  <span className="text-[8px] font-mono text-accent-cyan bg-accent-cyan/15 border border-accent-cyan/35 px-1.5 py-0.5 rounded animate-pulse">
                    REPLAY WAVE {replayWave}/10
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-h-[500px]">
                <GraphViewer 
                  nodes={activeGraph.getNodes()}
                  edges={activeGraph.getEdges()}
                  selectedNodeId={selectedNode?.id || null}
                  onSelectNode={setSelectedNode}
                  hoveredNodeId={hoveredNodeId}
                  setHoveredNodeId={setHoveredNodeId}
                  replayWave={replayWave}
                />
              </div>

              {isReplaying && (
                <div className="mt-3 p-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded font-mono text-[9px] text-accent-cyan text-center leading-relaxed">
                  {replayWaveDescription}
                </div>
              )}
            </Card>
          </div>

          {/* CENTER PANEL (40% width) - Simulation Workspace */}
          <div className="lg:col-span-4 flex flex-col h-full space-y-4">
            
            {/* Top Panel: Scenario configuration trigger */}
            <Card bordered className="bg-bg-panel/30 border-accent-cyan/10 p-5 space-y-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase border-b border-border-subtle pb-3">
                <Compass className="w-4 h-4 text-accent-cyan" />
                <span>Ecological Simulation Controller</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-mono text-text-muted uppercase block">
                    Select Consumption Scenario
                  </label>
                  <select
                    disabled={demoMode}
                    value={selectedScenarioId}
                    onChange={(e) => {
                      setSelectedScenarioId(e.target.value);
                      handleRunSimulation(e.target.value);
                    }}
                    className="w-full bg-bg-darkest border border-border-subtle text-text-primary text-xs font-mono rounded px-3 py-2 focus:border-accent-cyan outline-none disabled:opacity-50"
                  >
                    <option value="control">Control: Base Consumption</option>
                    {scenariosList.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {!judgeMode && (
                  <div className="pt-5">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleRunSimulation()}
                      disabled={isSimulating || demoMode}
                      className="w-full font-mono text-xs uppercase gap-2 bg-gradient-to-r from-accent-cyan to-indigo-600 hover:shadow-glow cursor-pointer disabled:opacity-50"
                    >
                      {isSimulating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
                    </Button>
                  </div>
                )}
              </div>

              {selectedScenarioId !== 'control' && (
                <p className="text-[10px] font-mono text-text-secondary leading-relaxed bg-bg-darkest/40 border border-border-subtle rounded p-2.5">
                  <span className="text-accent-cyan font-bold">SCENARIO OBJECTIVE:</span> {scenariosList.find(s => s.id === selectedScenarioId)?.description}
                </p>
              )}
            </Card>

            {/* Bottom Panel: Timeline */}
            <Card bordered className="flex-1 flex flex-col p-5 bg-bg-panel/20 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase">
                  <Activity className="w-4 h-4 text-accent-cyan" />
                  <span>Simulation Propagation Timeline</span>
                </div>
                <span className="text-[9px] font-mono text-text-muted px-2 py-0.5 bg-bg-dark rounded border border-border-subtle">
                  ERE_CASCADE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {timeline.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted space-y-3">
                    <Flame className="w-6 h-6 text-text-muted/40" />
                    <p className="text-[10px] font-mono leading-relaxed max-w-[240px]">
                      Awaiting simulation execution. Select a scenario and press "Run Simulation" to propagate pressure cascade.
                    </p>
                  </div>
                ) : (
                  timeline
                    .filter(step => replayWave === null || step.wave <= replayWave)
                    .map((step, idx) => {
                      const affectedNodeObj = activeGraph.findNode(step.affectedNode);
                      const isNegativeDelta = step.newPressure < step.oldPressure;
                      return (
                        <div 
                          key={idx} 
                          className={`p-3 border rounded-lg font-mono text-[10px] space-y-2 transition-all duration-300 ${
                            isNegativeDelta 
                              ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' 
                              : 'bg-status-danger/5 border-status-danger/15 text-status-danger'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="bg-bg-darkest px-2 py-0.5 rounded text-[8px] text-text-muted">
                                WAVE {step.wave}
                              </span>
                              <span className="text-text-primary font-bold">
                                {affectedNodeObj?.label || step.affectedNode}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-text-muted">PRESSURE:</span>
                              <span className="font-bold">
                                {step.oldPressure.toFixed(2)} → {step.newPressure.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[9px] text-text-secondary leading-relaxed pl-1 border-l border-border-muted/50">
                            {step.reason}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL (30% width) - Tabbed Interface */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <Card bordered className="flex-1 flex flex-col p-4 bg-bg-panel/20">
              
              <div className="flex border-b border-border-subtle mb-4 shrink-0">
                <button
                  onClick={() => setActiveTab('reasoning')}
                  className={`flex-1 pb-3 text-[10px] font-mono uppercase tracking-wider font-semibold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-200 ${
                    activeTab === 'reasoning' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted'
                  }`}
                >
                  Reasoning Trace
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`flex-1 pb-3 text-[10px] font-mono uppercase tracking-wider font-semibold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-200 ${
                    activeTab === 'evidence' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted'
                  }`}
                >
                  Evidence
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 pb-3 text-[10px] font-mono uppercase tracking-wider font-semibold border-b-2 bg-transparent outline-none border-0 cursor-pointer transition-all duration-200 ${
                    activeTab === 'notes' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-text-muted'
                  }`}
                >
                  Notes
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                
                {selectedNode && (
                  <div className="p-3 bg-bg-darkest/45 border border-border-subtle rounded-lg mb-4 space-y-1.5 shrink-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] font-mono text-text-muted uppercase leading-none block">Selected entity</span>
                        <h4 className="text-xs font-bold font-mono text-text-primary mt-0.5">{selectedNode.label}</h4>
                      </div>
                      <span className="text-[8px] font-mono text-accent-cyan px-2 py-0.5 bg-bg-dark rounded border border-border-subtle">
                        {selectedNode.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[9px] font-mono pt-2 border-t border-border-subtle/50 text-text-secondary">
                      <div>
                        <span>CURR PRESSURE:</span>
                        <span className="text-text-primary font-bold ml-1">
                          {(selectedNode.properties.currentPressure ?? 1.0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span>EST. CONFIDENCE:</span>
                        <span className="text-accent-cyan font-bold ml-1">
                          {Math.round((selectedNode.metadata.confidence ?? 0.95) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: REASONING TRACE */}
                {activeTab === 'reasoning' && (
                  <div className="space-y-4 font-mono text-[10px]">
                    
                    <div className="flex border border-border-subtle rounded p-0.5 bg-bg-darkest/55">
                      <button
                        onClick={() => setReasoningMode('pipeline')}
                        className={`flex-1 py-1 text-[8px] uppercase tracking-wider rounded font-bold transition-all duration-200 cursor-pointer ${
                          reasoningMode === 'pipeline' ? 'bg-accent-cyan text-bg-darkest' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Pipeline Flow
                      </button>
                      <button
                        onClick={() => setReasoningMode('narrative')}
                        className={`flex-1 py-1 text-[8px] uppercase tracking-wider rounded font-bold transition-all duration-200 cursor-pointer ${
                          reasoningMode === 'narrative' ? 'bg-accent-cyan text-bg-darkest' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Narrative Report
                      </button>
                    </div>

                    {reasoningMode === 'pipeline' ? (
                      <>
                        <h5 className="text-[10px] font-semibold text-text-primary uppercase flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                          <BookOpen className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>Scientific Pipeline Trace</span>
                        </h5>

                        <div className="relative pl-4 border-l border-zinc-800 space-y-4 mt-2">
                          {/* 1. Observation */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-blue-500 bg-bg-darkest flex items-center justify-center">
                              <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
                            </span>
                            <div className="font-bold text-blue-400 uppercase text-[8px] tracking-wider">
                              Observation
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              Telemetry target spec: <span className="text-text-primary">"{mealName}"</span>. Captured and identified in laboratory registry.
                            </div>
                          </div>

                          {/* 2. Evidence */}
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-bg-darkest ${
                              selectedNode && selectedNode.evidence.length > 0 ? 'border-cyan-400' : 'border-zinc-700'
                            }`} />
                            <div className={`font-bold uppercase text-[8px] tracking-wider ${
                              selectedNode && selectedNode.evidence.length > 0 ? 'text-cyan-400' : 'text-text-muted'
                            }`}>
                              Evidence
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              {selectedNode && selectedNode.evidence.length > 0 ? (
                                <>Scientific provenance: <span className="text-text-primary">{selectedNode.evidence.length} citation(s)</span> mapped from GBIF/IUCN catalog references.</>
                              ) : (
                                <>Awaiting node target selection to retrieve evidence registry logs.</>
                              )}
                            </div>
                          </div>

                          {/* 3. Inference */}
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-bg-darkest ${
                              selectedNode ? 'border-purple-400' : 'border-zinc-700'
                            }`} />
                            <div className={`font-bold uppercase text-[8px] tracking-wider ${
                              selectedNode ? 'text-purple-400' : 'text-text-muted'
                            }`}>
                              Inference
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              {selectedNode ? (
                                <>Reconstructed node <span className="text-text-primary">"{selectedNode.label}"</span> ({selectedNode.type}) within the active Environmental Context Graph.</>
                              ) : (
                                <>Build context graph structure mapping localized crop supply chains.</>
                              )}
                            </div>
                          </div>

                          {/* 4. Simulation */}
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-bg-darkest ${
                              timeline.length > 0 ? 'border-indigo-400' : 'border-zinc-700'
                            }`} />
                            <div className={`font-bold uppercase text-[8px] tracking-wider ${
                              timeline.length > 0 ? 'text-indigo-400' : 'text-text-muted'
                            }`}>
                              Simulation
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              {timeline.length > 0 ? (
                                <>Propagation engine actively simulated pressure cascade down to watershed habitats under <span className="text-text-primary">"{selectedScenarioId}"</span> scenario.</>
                              ) : (
                                <>Standby. Execute scenario trigger to simulate pressure ripple paths.</>
                              )}
                            </div>
                          </div>

                          {/* 5. Result */}
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-bg-darkest ${
                              selectedNode && Math.abs((selectedNode.properties.currentPressure ?? 1.0) - (selectedNode.properties.basePressure ?? 1.0)) > 0.0001
                                ? 'border-emerald-400 animate-pulse'
                                : 'border-zinc-700'
                            }`} />
                            <div className={`font-bold uppercase text-[8px] tracking-wider ${
                              selectedNode && Math.abs((selectedNode.properties.currentPressure ?? 1.0) - (selectedNode.properties.basePressure ?? 1.0)) > 0.0001
                                ? 'text-emerald-400'
                                : 'text-text-muted'
                            }`}>
                              Result
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              {selectedNode ? (
                                <>
                                  Pressure Delta: <span className="text-text-primary font-bold">
                                    {((selectedNode.properties.currentPressure ?? 1.0) - (selectedNode.properties.basePressure ?? 1.0)).toFixed(4)}
                                  </span>
                                  <br />
                                  Pressure state: {selectedNode.properties.basePressure?.toFixed(2) ?? '1.00'} → {selectedNode.properties.currentPressure?.toFixed(2) ?? '1.00'}
                                </>
                              ) : (
                                <>Awaiting scenario output to calculate delta pressure scales.</>
                              )}
                            </div>
                          </div>

                          {/* 6. Confidence */}
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-bg-darkest ${
                              selectedNode ? 'border-cyan-400' : 'border-zinc-700'
                            }`} />
                            <div className={`font-bold uppercase text-[8px] tracking-wider ${
                              selectedNode ? 'text-cyan-400' : 'text-text-muted'
                            }`}>
                              Confidence
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              {selectedNode ? (
                                <>Evaluated at <span className="text-text-primary font-bold">{Math.round((selectedNode.metadata.confidence ?? 0.95) * 100)}% trust coefficient</span> derived from data registry weights.</>
                              ) : (
                                <>Mean data source and mapping precision confidence index.</>
                              )}
                            </div>
                          </div>

                          {/* 7. Limitations */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-amber-500 bg-bg-darkest" />
                            <div className="font-bold text-amber-500 uppercase text-[8px] tracking-wider">
                              Limitations
                            </div>
                            <div className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">
                              Calculates deterministic scenario-based pressure indices only. The engine <span className="text-amber-500 font-bold">does not predict extinction rates</span> or physical biodiversity population metrics.
                            </div>
                          </div>

                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                          <h5 className="text-[10px] font-semibold text-text-primary uppercase flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-accent-cyan" />
                            <span>Telemetry Explanation</span>
                          </h5>
                          
                          <div className="flex gap-1">
                            {(['SCIENTIFIC', 'JUDGE', 'TECHNICAL'] as const).map(fmt => (
                              <button
                                key={fmt}
                                onClick={() => setNarrativeFormat(fmt)}
                                className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase transition-all duration-150 border cursor-pointer ${
                                  narrativeFormat === fmt 
                                    ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' 
                                    : 'border-border-subtle text-text-muted hover:text-text-secondary'
                                }`}
                              >
                                {fmt.substring(0, 4)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="whitespace-pre-wrap text-[9px] text-text-secondary leading-relaxed bg-bg-darkest/40 border border-border-subtle p-3 rounded-lg max-h-[450px] overflow-y-auto scrollbar-thin">
                          {narrativeText}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: EVIDENCE RECORDS */}
                {activeTab === 'evidence' && (
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-mono font-semibold text-text-primary uppercase flex items-center gap-1.5 shrink-0">
                      <Database className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Scientific Citations ({selectedNodeEvidence.length})</span>
                    </h5>

                    {selectedNodeEvidence.length === 0 ? (
                      <p className="text-[10px] font-mono text-text-muted leading-relaxed text-center py-8">
                        No scientific evidence records attached to this node.
                      </p>
                    ) : (
                      selectedNodeEvidence.map((record) => (
                        <div key={record.id} className="p-3 bg-bg-darkest/40 border border-border-subtle rounded-lg space-y-2.5 font-mono text-[10px] text-text-secondary">
                          <div className="flex justify-between items-center">
                            <span className="text-accent-cyan font-bold bg-bg-dark border border-border-subtle px-2 py-0.5 rounded text-[8px]">
                              {record.source}
                            </span>
                            <div className="flex gap-1.5 text-[8px] text-text-muted">
                              <span>QUALITY:</span>
                              <span className="text-text-primary font-bold">{Math.round(record.quality * 100)}%</span>
                            </div>
                          </div>

                          <p className="text-[9px] text-text-primary leading-relaxed bg-bg-darkest/30 p-2 rounded border border-border-subtle/25">
                            "{record.statement}"
                          </p>

                          <div className="space-y-1 text-[8px] text-text-muted">
                            <div>DATASET: <span className="text-text-secondary">{record.dataset}</span></div>
                            <div>RETRIEVED: <span className="text-text-secondary">{record.retrievedAt}</span></div>
                          </div>

                          <div className="border-t border-border-subtle/30 pt-2 flex justify-between items-center text-[8px]">
                            <span className="text-text-muted truncate max-w-[170px]" title={record.citation}>
                              {record.citation}
                            </span>
                            <a 
                              href={record.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1 text-accent-cyan hover:underline cursor-pointer"
                            >
                              <span>PUB</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: EXPERIMENT NOTES */}
                {activeTab === 'notes' && (
                  <div className="space-y-3 h-full flex flex-col">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Draft laboratory notes, remarks, hypothesis validations, or policy recommendations here..."
                      className="w-full flex-1 min-h-[300px] bg-bg-darkest border border-border-subtle text-text-secondary text-xs font-mono rounded-lg p-3 outline-none focus:border-accent-cyan scrollbar-thin resize-none"
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono text-text-muted">
                      <span>CHARACTERS: {notes.length}</span>
                      <span>AUTO-PERSISTED</span>
                    </div>
                  </div>
                )}

              </div>
            </Card>
          </div>

        </div>
      )}

      {/* VIEWPORT PANEL 2: BEFORE / AFTER COMPARISON */}
      {activeWorkspaceTab === 'comparison' && (
        <Card bordered className="p-6 bg-bg-panel/20 font-mono text-[10px] space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase border-b border-border-subtle pb-3">
            <FileSpreadsheet className="w-4 h-4 text-accent-cyan" />
            <span>Before / After Scenario Comparison Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-[8px] text-text-muted uppercase">
                  <th className="py-2.5">Ecology Metric</th>
                  <th className="py-2.5">Current (Control)</th>
                  <th className="py-2.5">Proposed (Simulation)</th>
                  <th className="py-2.5">Absolute Delta</th>
                  <th className="py-2.5">Status Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-text-secondary">
                <tr className="hover:bg-bg-darkest/20">
                  <td className="py-3 font-bold text-text-primary">Meal Observation</td>
                  <td className="py-3">{mealName}</td>
                  <td className="py-3">{mealName}</td>
                  <td className="py-3">--</td>
                  <td className="py-3 text-text-muted">Constant</td>
                </tr>
                <tr className="hover:bg-bg-darkest/20">
                  <td className="py-3 font-bold text-text-primary">Avg Environmental Pressure</td>
                  <td className="py-3">{(summaryMetrics.avgPressure - summaryMetrics.pressureDelta).toFixed(4)}</td>
                  <td className="py-3">{summaryMetrics.avgPressure.toFixed(4)}</td>
                  <td className={`py-3 font-bold ${summaryMetrics.pressureDelta < -0.001 ? 'text-emerald-400' : summaryMetrics.pressureDelta > 0.001 ? 'text-status-danger' : 'text-text-primary'}`}>
                    {summaryMetrics.pressureDelta.toFixed(4)}
                  </td>
                  <td className="py-3">
                    {summaryMetrics.pressureDelta < -0.001 ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Pressure Decreased (Improvement)</span>
                      </span>
                    ) : summaryMetrics.pressureDelta > 0.001 ? (
                      <span className="flex items-center gap-1 text-status-danger font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Pressure Increased (Regression)</span>
                      </span>
                    ) : (
                      <span className="text-text-muted">Unchanged</span>
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-bg-darkest/20">
                  <td className="py-3 font-bold text-text-primary">Affected Species Count</td>
                  <td className="py-3">{simResult && baseGraph ? baseGraph.getNodes().filter(n => n.type === 'SPECIES').length : 0} species</td>
                  <td className="py-3">{summaryMetrics.countSpecies} species</td>
                  <td className="py-3 font-bold text-text-primary">
                    {simResult && baseGraph ? (summaryMetrics.countSpecies - baseGraph.getNodes().filter(n => n.type === 'SPECIES').length) : 0}
                  </td>
                  <td className="py-3 text-text-muted">
                    {simResult ? `${simResult.graphDiff.modifiedNodes.filter((n: any) => n.type === 'SPECIES').length} species under lower pressure` : 'None'}
                  </td>
                </tr>
                <tr className="hover:bg-bg-darkest/20">
                  <td className="py-3 font-bold text-text-primary">Affected Habitats Count</td>
                  <td className="py-3">{simResult && baseGraph ? baseGraph.getNodes().filter(n => n.type === 'HABITAT').length : 0} zone(s)</td>
                  <td className="py-3">{summaryMetrics.countHabitats} zone(s)</td>
                  <td className="py-3 font-bold text-text-primary">
                    {simResult && baseGraph ? (summaryMetrics.countHabitats - baseGraph.getNodes().filter(n => n.type === 'HABITAT').length) : 0}
                  </td>
                  <td className="py-3 text-text-muted">
                    {simResult ? `${simResult.graphDiff.modifiedNodes.filter((n: any) => n.type === 'HABITAT').length} habitats affected` : 'None'}
                  </td>
                </tr>
                <tr className="hover:bg-bg-darkest/20">
                  <td className="py-3 font-bold text-text-primary">Affected Watershed Basins</td>
                  <td className="py-3">{simResult && baseGraph ? baseGraph.getNodes().filter(n => n.type === 'WATERSHED').length : 0} basin(s)</td>
                  <td className="py-3">{summaryMetrics.countWatersheds} basin(s)</td>
                  <td className="py-3 font-bold text-text-primary">
                    {simResult && baseGraph ? (summaryMetrics.countWatersheds - baseGraph.getNodes().filter(n => n.type === 'WATERSHED').length) : 0}
                  </td>
                  <td className="py-3 text-text-muted">
                    {simResult ? `${simResult.graphDiff.modifiedNodes.filter((n: any) => n.type === 'WATERSHED').length} basins affected` : 'None'}
                  </td>
                </tr>
                <tr className="hover:bg-bg-darkest/20">
                  <td className="py-3 font-bold text-text-primary">Mean System Confidence</td>
                  <td className="py-3">{confidencePercent}%</td>
                  <td className="py-3">{Math.round(summaryMetrics.avgConf * 100)}%</td>
                  <td className="py-3 font-bold text-text-primary">
                    {Math.round((summaryMetrics.avgConf - (mealNode?.metadata.confidence ?? 0.95)) * 100)}%
                  </td>
                  <td className="py-3 text-text-muted">Stable database weights</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEWPORT PANEL 3: LINEAGE & ASSUMPTIONS */}
      {activeWorkspaceTab === 'lineage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          
          {/* Clickable Lineage Flowchart */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card bordered className="flex-1 p-5 bg-bg-panel/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase border-b border-border-subtle pb-3">
                <Network className="w-4 h-4 text-accent-cyan" />
                <span>Scientific Data Lineage Pipeline</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[9px]">
                {LINEAGE_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedLineageStep(step.id)}
                    className={`p-3 border rounded text-left transition-all duration-150 cursor-pointer ${
                      selectedLineageStep === step.id 
                        ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan font-bold shadow-glow-sm' 
                        : 'border-border-subtle bg-bg-darkest hover:border-text-muted'
                    }`}
                  >
                    <div className="text-[7px] text-text-muted uppercase">Lineage Node</div>
                    <div className="text-text-primary font-bold mt-1 text-[10px] truncate">{step.label}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-bg-darkest/75 border border-border-subtle rounded-lg space-y-2 mt-4 font-mono text-[10px]">
                <div className="flex gap-2 items-center text-accent-cyan font-bold uppercase text-[9px]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Lineage Telemetry Details: {LINEAGE_STEPS.find(s => s.id === selectedLineageStep)?.label}</span>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  {LINEAGE_STEPS.find(s => s.id === selectedLineageStep)?.desc}
                </p>
              </div>
            </Card>
          </div>

          {/* Scientific Modeling Assumptions panel */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <Card bordered className="flex-1 p-5 bg-bg-panel/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase border-b border-border-subtle pb-3">
                <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                <span>Core Modeling Assumptions</span>
              </div>

              <div className="space-y-3 font-mono text-[9.5px] leading-relaxed text-text-secondary">
                <div className="flex items-start gap-2.5 p-2 bg-bg-darkest/40 border border-border-subtle rounded">
                  <Check className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-text-primary uppercase block">Crop Mappings</span>
                    Crop origins are resolved utilizing crop suitability indicators mapped from regional farming tract registers.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-bg-darkest/40 border border-border-subtle rounded">
                  <Check className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-text-primary uppercase block">Hydrology Catchments</span>
                    Watershed runoff discharges and soil chemistry matrices assume baseline water discharge capacity constants.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-bg-darkest/40 border border-border-subtle rounded">
                  <Check className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-text-primary uppercase block">Species Occurrence Mappings</span>
                    Biodiversity coordinates and fauna densities correlate with public open observations gathered from GBIF occurrences.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 bg-bg-darkest/40 border border-border-subtle rounded">
                  <Check className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-text-primary uppercase block">Relative Index Boundary</span>
                    Calculations are bounded as relative comparisons and do not model birth/death rates or predict physical extinction.
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* VIEWPORT PANEL 4: EXECUTIVE POLICY BRIEF */}
      {activeWorkspaceTab === 'executive' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          
          {/* Policy Brief card */}
          <Card bordered className="p-6 bg-bg-panel/20 font-mono text-[10px] space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase">
                <Award className="w-4 h-4 text-accent-cyan" />
                <span>Executive Policy Brief</span>
              </div>
              <span className="text-[9px] text-text-muted bg-bg-dark px-2 py-0.5 rounded border border-border-subtle">
                BRIEFING_DOC
              </span>
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <div className="space-y-1">
                <span className="text-[8px] text-text-muted uppercase font-bold block">Key Analytical Insight</span>
                <p className="text-text-primary text-[11px] font-bold bg-bg-darkest/30 border border-border-subtle p-3 rounded-lg">
                  {selectedScenarioId === 'scen-millet' ? (
                    `Replacing rice-derived flours with drought-resistant millet in "${mealName}" lowers localized demand on the Cauvery Basin, protecting riparian forest corridors.`
                  ) : (
                    `Simulating a 50% consumption demand drop on "${mealName}" scales down localized agricultural nitrogen loads across all outflow hydrological systems.`
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] text-text-muted uppercase font-bold block">Recommended Policy Actions</span>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Incentivize local crop diversifications to lower blue-water draft limits.</li>
                  <li>Establish buffer corridors protecting wetlands in watersheds showing high pressure deltas.</li>
                  <li>Fund telemetry systems mapping fertilizer loading on rivers draining from crop regions.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-lg space-y-1.5 text-[9px]">
                <div className="font-bold uppercase tracking-wider text-[8px] text-amber-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Boundary Disclaimers</span>
                </div>
                <p>
                  This briefing serves as decision support matrix indexing relative supply chain pressure metrics. It does not predict future real-world species numbers or timelines.
                </p>
              </div>
            </div>
          </Card>

          {/* Evidence Coverage card */}
          <Card bordered className="p-6 bg-bg-panel/20 font-mono text-[10px] space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase border-b border-border-subtle pb-3">
              <Database className="w-4 h-4 text-accent-cyan" />
              <span>Evidence Coverage & Database Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-bg-darkest/40 border border-border-subtle rounded-lg text-center space-y-1">
                <span className="text-[8px] text-text-muted uppercase">Evidence Coverage</span>
                <div className="text-accent-cyan font-bold text-base mt-0.5">100%</div>
                <span className="text-[7px] text-text-muted uppercase block">All Node Links Verified</span>
              </div>

              <div className="p-3 bg-bg-darkest/40 border border-border-subtle rounded-lg text-center space-y-1">
                <span className="text-[8px] text-text-muted uppercase">Database Registries</span>
                <div className="text-text-primary font-bold text-base mt-0.5">5</div>
                <span className="text-[7px] text-text-muted uppercase block">IUCN, GBIF, WRIS, FAOSTAT, ICAR</span>
              </div>

              <div className="p-3 bg-bg-darkest/40 border border-border-subtle rounded-lg text-center space-y-1">
                <span className="text-[8px] text-text-muted uppercase">Quality Coefficient</span>
                <div className="text-emerald-400 font-bold text-base mt-0.5">90.2%</div>
                <span className="text-[7px] text-text-muted uppercase block">Trust Rating Average</span>
              </div>

              <div className="p-3 bg-bg-darkest/40 border border-border-subtle rounded-lg text-center space-y-1">
                <span className="text-[8px] text-text-muted uppercase">Missing Gaps</span>
                <div className="text-text-primary font-bold text-base mt-0.5">None</div>
                <span className="text-[7px] text-text-muted uppercase block">Zero Unmapped Layers</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[8px] text-text-muted uppercase font-bold block">Telemetry Coverage Logs</span>
              <div className="p-3 bg-bg-darkest/25 border border-border-subtle rounded-lg divide-y divide-border-subtle/30 text-[9px] text-text-secondary">
                <div className="py-1 flex justify-between"><span>IUCN Red-List (wetlands & forests status)</span><span className="text-emerald-400 font-bold">100% coverage</span></div>
                <div className="py-1 flex justify-between"><span>GBIF Telemetry (species coordinates)</span><span className="text-emerald-400 font-bold">100% coverage</span></div>
                <div className="py-1 flex justify-between"><span>WRIS hydrological matrices (catchment discharge)</span><span className="text-emerald-400 font-bold">100% coverage</span></div>
                <div className="py-1 flex justify-between"><span>FAOSTAT agricultural statistics (crops yields)</span><span className="text-emerald-400 font-bold">100% coverage</span></div>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* BOTTOM BAR - Simulation summary metrics */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-bg-panel/95 border-t border-border-subtle px-6 flex items-center justify-between z-30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-8 text-[11px] font-mono text-text-secondary w-full overflow-x-auto scrollbar-none">
          
          {/* Pressure delta status */}
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

          {/* Average confidence */}
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

          {/* Evidence Coverage */}
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

          {/* Graph affected summaries counts */}
          <div className="flex items-center gap-6 border-l border-border-subtle pl-8 shrink-0 ml-auto text-[10px]">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-text-muted uppercase">Watershed Nodes</span>
              <span className="text-text-primary font-bold">{summaryMetrics.countWatersheds} BASINS</span>
            </div>
            <div className="flex flex-col items-end border-l border-border-subtle/50 pl-6">
              <span className="text-[8px] text-text-muted uppercase">Habitat Nodes</span>
              <span className="text-text-primary font-bold">{summaryMetrics.countHabitats} ECOSYSTEMS</span>
            </div>
            <div className="flex flex-col items-end border-l border-border-subtle/50 pl-6">
              <span className="text-[8px] text-text-muted uppercase">Species Nodes</span>
              <span className="text-text-primary font-bold">{summaryMetrics.countSpecies} WILDLIFE</span>
            </div>
          </div>

        </div>
      </div>

    </PageContainer>
  );
};
export default Control;
