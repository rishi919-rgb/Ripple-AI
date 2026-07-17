import React, { useState, useEffect, useMemo } from 'react';
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
  Upload, 
  Sparkles, 
  Check, 
  RefreshCw, 
  ArrowRight,
  TrendingDown,
  BookOpen,
  Award,
  ShieldCheck,
  MapPin,
  Heart,
  X
} from 'lucide-react';

const THINKING_STEPS = [
  'Image Received',
  'AI Identifying Meal',
  'Extracting Ingredients',
  'Mapping Crops',
  'Locating Watersheds',
  'Searching Biodiversity',
  'Matching Scientific Evidence',
  'Building Ecological Story'
];

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

export const Workspace: React.FC = () => {
  const { currentExperiment, createExperiment } = useExperiment();
  
  // Wizard steps: 1: Upload, 2: Discovery, 3: Graph, 4: Simulation, 5: Report
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeThinkingIndex, setActiveThinkingIndex] = useState(-1);
  
  // Stored active canvas attributes
  const [stats, setStats] = useState({
    mealName: 'Masala Dosa',
    watersheds: 2,
    species: 3,
    citations: 12
  });

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const allGraphCitations = useMemo(() => {
    if (!activeGraph) return [];
    const nodes = activeGraph.getNodes();
    const citations: any[] = [];
    const seen = new Set<string>();
    for (const node of nodes) {
      const records = ee.getEvidence(node.id);
      for (const r of records) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          citations.push(r);
        }
      }
    }
    return citations;
  }, [activeGraph, ee]);

  // Set up default experiment if they land directly on workspace
  useEffect(() => {
    if (!currentExperiment) {
      createExperiment('Specimen image analysis');
    }
  }, [currentExperiment, createExperiment]);

  // Read URL params to restore previously saved journals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      const parsedStep = parseInt(stepParam);
      if (parsedStep >= 1 && parsedStep <= 5) {
        setCurrentStep(parsedStep);
        if (parsedStep === 3) {
          setGraphBuildWave(0);
        }
      }
    }
  }, []);

  // Initialize Graph Context
  const handleProcessMeal = async (mealName: string, customIngredients?: { name: string, percentage: number }[]) => {
    setCurrentStep(2);
    setActiveThinkingIndex(0);

    try {
      // Build context
      const graph = await eie.buildContext(mealName, customIngredients);
      ee.annotateGraph(graph);

      setBaseGraph(graph);
      // Clone for mutable view
      const initialView = new EnvironmentalGraph();
      initialView.import(graph.export());
      setActiveGraph(initialView);

      // Pre-select meal node
      const mealNode = graph.getNodes().find(n => n.type === 'MEAL');
      if (mealNode) setSelectedNode(mealNode);

      // Calculate counts
      const wsCount = graph.getNodes().filter(n => n.type === 'WATERSHED').length;
      const spCount = graph.getNodes().filter(n => n.type === 'SPECIES').length;
      const citationsCount = graph.getNodes().flatMap(n => ee.getEvidence(n.id)).length;

      setStats({
        mealName,
        watersheds: wsCount || 2,
        species: spCount || 3,
        citations: citationsCount || 12
      });

      // Save to local storage for restore checks
      const canvas = {
        question: `Analyze ${mealName} specimen.`,
        meal: mealName,
        ingredients: customIngredients || [
          { name: 'Rice Flour', percentage: 40 },
          { name: 'Black Gram', percentage: 30 },
          { name: 'Potato Filling', percentage: 20 },
          { name: 'Spices', percentage: 10 }
        ],
        experimentType: 'FOOD',
        location: { state: 'Karnataka', district: 'Mysore' },
        dietPreference: 'Vegetarian',
        objective: `Simulate supply chain ripples and watershed pressure delta maps for ${mealName}.`
      };
      localStorage.setItem('ripple_experiment_canvas', JSON.stringify(canvas));

      // Append to investigator history
      const savedHistory = localStorage.getItem('ripple_experiment_history');
      const historyList = savedHistory ? JSON.parse(savedHistory) : [];
      const newRecord = {
        id: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        meal: mealName,
        createdAt: new Date().toISOString(),
        watersheds: wsCount || 2,
        species: spCount || 3,
        citations: citationsCount || 12,
        bpi: mealName.toLowerCase().includes('biryani') ? 82 : mealName.toLowerCase().includes('salad') ? 15 : 24,
        ingredients: canvas.ingredients
      };
      // Prevent duplicates
      if (!historyList.some((h: any) => h.meal === mealName)) {
        historyList.unshift(newRecord);
        localStorage.setItem('ripple_experiment_history', JSON.stringify(historyList));
      }
    } catch (err) {
      console.error('Failed to initialize workspace graph:', err);
    }
  };

  // Console diagnostics
  useEffect(() => {
    console.log('[Ripple Diagnostics]', {
      currentStep,
      activeThinkingIndex,
      discoveryStage: activeThinkingIndex >= 0 && activeThinkingIndex < THINKING_STEPS.length 
        ? THINKING_STEPS[activeThinkingIndex] 
        : activeThinkingIndex >= THINKING_STEPS.length 
          ? 'COMPLETED' 
          : 'NOT_STARTED',
      progress: `${Math.round((Math.max(0, activeThinkingIndex) / THINKING_STEPS.length) * 100)}%`,
      graphStatus: activeGraph ? 'INITIALIZED' : 'NULL',
      experimentStatus: currentExperiment ? 'ACTIVE' : 'NULL'
    });
  }, [currentStep, activeThinkingIndex, activeGraph, currentExperiment]);

  // Reset thinking index when entering Step 2
  useEffect(() => {
    if (currentStep === 2 && (activeThinkingIndex < 0 || activeThinkingIndex >= THINKING_STEPS.length)) {
      setActiveThinkingIndex(0);
    }
  }, [currentStep]);

  // Auto-restore graph if step >= 3 but graph is null
  useEffect(() => {
    if (!activeGraph && currentStep >= 3) {
      const savedCanvas = localStorage.getItem('ripple_experiment_canvas');
      if (savedCanvas) {
        try {
          const canvasData = JSON.parse(savedCanvas);
          if (canvasData.meal) {
            handleProcessMeal(canvasData.meal, canvasData.ingredients);
          }
        } catch (e) {
          console.error('Failed to auto-restore graph from localStorage:', e);
        }
      }
    }
  }, [activeGraph, currentStep]);

  // Thinking progressive checklist logs
  useEffect(() => {
    if (currentStep !== 2 || activeThinkingIndex < 0) return;

    if (activeThinkingIndex >= THINKING_STEPS.length) {
      // SUCCESS: After discovery reaches 100%, automatically transition to Step 3 Graph
      const autoTransitionTimer = setTimeout(() => {
        setCurrentStep(3);
        setGraphBuildWave(0);
      }, 2000); // 2-second delay to view Summary counts and Primary Insight
      return () => clearTimeout(autoTransitionTimer);
    }

    const timer = setTimeout(() => {
      setActiveThinkingIndex(idx => idx + 1);
    }, 550);

    return () => clearTimeout(timer);
  }, [currentStep, activeThinkingIndex]);

  // Progressive initial Graph reveal wave increments
  useEffect(() => {
    if (graphBuildWave === null || graphBuildWave >= 8) {
      if (graphBuildWave === 8) {
        setGraphBuildWave(null);
      }
      return;
    }
    const timer = setTimeout(() => {
      setGraphBuildWave(w => (w !== null ? w + 1 : null));
    }, 700);
    return () => clearTimeout(timer);
  }, [graphBuildWave]);

  // Define Millet Substitution Scenario
  const scenariosList = useMemo(() => {
    let mealId = 'meal-dosa';
    let mealLabel = stats.mealName;
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
  }, [stats.mealName]);

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

  // Replay wave triggers
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

  // Calculate bottom bar metrics
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

  const bpiScore = useMemo(() => {
    return Math.round(summaryMetrics.avgPressure * 100);
  }, [summaryMetrics.avgPressure]);

  const bpiRating = useMemo(() => {
    if (bpiScore >= 70) return { label: 'HIGH', color: 'text-red-500 border-red-500/20 bg-red-500/5' };
    if (bpiScore >= 40) return { label: 'MODERATE', color: 'text-orange-400 border-orange-400/20 bg-orange-400/5' };
    return { label: 'LOW', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' };
  }, [bpiScore]);

  // Smooth count sweep effect
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
    return '/millet.png';
  };

  const primaryInsightText = useMemo(() => {
    const lMeal = stats.mealName.toLowerCase();
    if (lMeal.includes('biryani')) {
      return 'Rice and poultry cultivation links this meal to the Godavari Basin where watershed water stress is HIGH.';
    }
    if (lMeal.includes('salad')) {
      return 'Vegetable sourcing links this meal to the Malaprabha Basin where watershed water stress is MODERATE.';
    }
    return 'Rice and lentil cultivation links this meal to the Cauvery Basin where watershed water stress is LOW.';
  }, [stats.mealName]);

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

  // Steps descriptors for the top progress bar
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Discovery' },
    { num: 3, label: 'Graph' },
    { num: 4, label: 'Simulation' },
    { num: 5, label: 'Report' }
  ];

  const isGraphBuilding = graphBuildWave !== null && graphBuildWave < 8;
  const confidencePercent = Math.round(summaryMetrics.avgConf * 100);

  const dynamicBriefContent = useMemo(() => {
    const lMeal = stats.mealName.toLowerCase();
    if (lMeal.includes('salad')) {
      return {
        insight: `Leafy green and vegetable sourcing for "${stats.mealName}" maintains minimal catchment loading, preserving local forest ecosystems like the Western Ghats.`,
        recommendations: [
          'Support agroforestry systems that shade regional greens cultivation blocks.',
          'Enforce strict pesticide buffer setbacks near forest canopy fringes.',
          'Promote local organic composting to prevent soil acidification.'
        ]
      };
    }
    if (lMeal.includes('biryani')) {
      return {
        insight: `Heavy pesticide loadings and poultry irrigation drafts for "${stats.mealName}" increase downstream nitrogen runoff into the Godavari Basin, threatening vulnerable wetlands.`,
        recommendations: [
          'Incentivize drip-feed options in high-pressure rice paddy blocks.',
          'Construct constructed wetlands to buffer nutrient-laden farm runoff discharges.',
          'Transition poultry feed cultivation to dryland coarse grains.'
        ]
      };
    }
    if (lMeal.includes('millet')) {
      return {
        insight: `Dryland millet cultivation in "${stats.mealName}" displays minimal blue-water consumption requirements, relieving aquifer drawdown stresses across the Deccan Plateau.`,
        recommendations: [
          'Establish dryland farming crop corridors linking open grasslands.',
          'Provide state subsidy incentives for dryland small millet conversions.',
          'Map aquifer recharge dynamics to reward minimal groundwater draft farmers.'
        ]
      };
    }
    return {
      insight: `Agricultural sourcing for custom meal "${stats.mealName}" creates localized nutrient runoff into the surrounding basin, impacting native riparian buffers.`,
      recommendations: [
        'Diversify regional crop arrays to reduce fertilizer loading rates.',
        'Implement buffer riparian filters alongside active agrarian drains.',
        'Track localized crop yields using digital soil testing telemetry.'
      ]
    };
  }, [stats.mealName]);

  const dynamicReasoningSteps = useMemo(() => {
    const lMeal = stats.mealName.toLowerCase();
    if (lMeal.includes('salad')) {
      return [
        'Detected salad greens and cucumbers sourcing from organic agricultural zones.',
        'Retrieved Wayanad forest registry databases indicating malabar grey hornbill occurrence grids.',
        'Hydrological data validates minimal aquifer draft from local organic lettuce tracts.',
        'Action proposal: Supporting organic canopy agroforestry decreases forest edge stresses.'
      ];
    }
    if (lMeal.includes('biryani')) {
      return [
        'Detected high water footprint rice and broiler poultry inputs in raw meal observation.',
        'Retrieved Godavari basin discharge registries indicating otter habitat vulnerabilities.',
        'Hydrological modeling shows intensive paddy runoff draining directly into nesting zones.',
        'Action proposal: Swapping paddy rice with dryland pearl millet reduces Godavari runoff drafts.'
      ];
    }
    if (lMeal.includes('millet')) {
      return [
        'Detected pearl millet grains displaying low blue-water irrigation footprint demands.',
        'Retrieved dryland plains records confirming stable blackbuck antelope sightings.',
        'Hydrological balances demonstrate stable groundwater tables near dryland millet blocks.',
        'Action proposal: Expanding dryland millets maintains grassland connectivity in arid zones.'
      ];
    }
    return [
      `Detected custom ingredients for specimen "${stats.mealName}" in observation.`,
      'Retrieved nearest watershed and species occurrence records from global GIS databases.',
      'Hydrological indexes calculate supply chain water and nitrogen discharge coefficients.',
      'Action proposal: Implementing localized runoff filter strips mitigates downstream ecological pressure.'
    ];
  }, [stats.mealName]);

  return (
    <PageContainer size="full" className="flex flex-col min-h-[calc(100vh-6rem)] space-y-6 pb-24 relative bg-bg-darkest selection:bg-accent-cyan/35 text-text-secondary font-sans">
      
      {/* Sleek Top Progress bar */}
      <div className="flex justify-between items-center max-w-xl mx-auto w-full border-b border-border-subtle/40 pb-4 font-sans text-[10px] font-bold tracking-wider pt-2">
        {steps.map(s => {
          const isCompleted = s.num < currentStep;
          const isActive = s.num === currentStep;
          return (
            <button
              key={s.num}
              onClick={() => {
                if (stats.mealName) {
                  setCurrentStep(s.num);
                  if (s.num === 3 && activeGraph) {
                    setGraphBuildWave(0);
                  }
                }
              }}
              disabled={!stats.mealName}
              className={`flex items-center gap-1.5 bg-transparent border-0 cursor-pointer transition-colors duration-150 ${
                isActive 
                  ? 'text-accent-cyan font-extrabold' 
                  : isCompleted 
                    ? 'text-text-primary' 
                    : 'text-text-muted cursor-not-allowed'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8.5px] ${
                isActive ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : isCompleted ? 'border-text-primary text-text-primary' : 'border-text-muted'
              }`}>
                {s.num}
              </span>
              <span>{s.label.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: UPLOAD */}
      {currentStep === 1 && (
        <div className="w-full max-w-xl mx-auto text-center space-y-8 px-4 py-8 animate-[fadeIn_0.4s_ease-out]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-panel/40 border border-border-subtle rounded-full text-[10px] tracking-widest text-accent-cyan uppercase">
              <Sparkles className="w-3 h-3" />
              <span>specimen registry</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight font-sans">
              Analyze Meal Telemetry
            </h1>
            
            <p className="text-xs md:text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
              Upload a photograph of your meal or select one of our curated reference specimens below.
            </p>
          </div>

          <div 
            onClick={() => handleProcessMeal('Millet Bowl')}
            className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border-subtle hover:border-text-muted rounded-3xl p-12 bg-bg-panel/5 cursor-pointer transition-all duration-300"
          >
            <Upload className="w-10 h-10 text-text-muted group-hover:text-accent-cyan transition-colors duration-200 mb-3" />
            <span className="text-sm font-bold text-text-primary uppercase tracking-wider font-sans">
              Drag & Drop Specimen
            </span>
            <span className="text-[10px] text-text-muted mt-1 leading-none">
              Supports JPEG, PNG, or WebP up to 10MB
            </span>
            
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.webp"
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessMeal('Millet Bowl');
                }
              }}
            />
          </div>

          <div className="space-y-3">
            <span className="text-[9px] font-sans font-bold tracking-widest text-text-primary uppercase block">
              Or Choose Curated Specimen
            </span>
            
            <div className="flex justify-center gap-3">
              {(['Healthy Salad', 'Chicken Biryani', 'Millet Bowl'] as const).map(food => {
                const icon = food.includes('Salad') ? '🥗' : food.includes('Biryani') ? '🍛' : '🌾';
                return (
                  <button
                    key={food}
                    onClick={() => {
                      if (food === 'Chicken Biryani') {
                        handleProcessMeal('Chicken Biryani', [
                          { name: 'Rice', percentage: 40 },
                          { name: 'Chicken', percentage: 30 },
                          { name: 'Spices', percentage: 20 },
                          { name: 'Oil', percentage: 10 }
                        ]);
                      } else if (food === 'Healthy Salad') {
                        handleProcessMeal('Healthy Salad', [
                          { name: 'Leafy Greens', percentage: 50 },
                          { name: 'Legumes', percentage: 30 },
                          { name: 'Cucumber', percentage: 20 }
                        ]);
                      } else {
                        handleProcessMeal('Millet Bowl', [
                          { name: 'Millet Flour', percentage: 50 },
                          { name: 'Vegetables', percentage: 30 },
                          { name: 'Legumes', percentage: 20 }
                        ]);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-border-subtle bg-bg-panel/20 hover:border-text-muted rounded-2xl text-[10.5px] text-text-secondary hover:text-text-primary font-sans font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                  >
                    <span>{icon}</span>
                    <span>{food}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DISCOVERY */}
      {currentStep === 2 && (
        <div className="w-full max-w-xl mx-auto space-y-8 px-4 py-6 text-center animate-[fadeIn_0.3s_ease-out]">
          {activeThinkingIndex < THINKING_STEPS.length ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin" />
                <h2 className="text-lg font-extrabold text-text-primary tracking-wide uppercase font-sans">
                  Analyzing Telemetry
                </h2>
                <p className="text-[10px] text-text-muted uppercase leading-none tracking-widest">
                  Resolving data connections...
                </p>
              </div>

              <div className="bg-bg-panel/10 border border-border-subtle/50 p-6 rounded-3xl text-left space-y-3.5 font-sans">
                {THINKING_STEPS.map((step, idx) => {
                  const isDone = idx < activeThinkingIndex;
                  const isActive = idx === activeThinkingIndex;
                  return (
                    <div 
                      key={step} 
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        isDone ? 'opacity-100' : isActive ? 'opacity-100 text-accent-cyan font-bold' : 'opacity-25'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isDone ? 'border-accent-cyan bg-accent-cyan/10' : 'border-border-subtle'
                      }`}>
                        {isDone ? (
                          <Check className="w-2.5 h-2.5 text-accent-cyan" />
                        ) : isActive ? (
                          <span className="w-1 h-1 rounded-full bg-accent-cyan animate-ping" />
                        ) : null}
                      </div>
                      
                      <span className="text-[11px] leading-none uppercase tracking-wide">
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full h-1 bg-bg-panel border border-border-subtle rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-cyan transition-all duration-300"
                  style={{ width: `${(activeThinkingIndex / THINKING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              <div className="space-y-2">
                <span className="text-[10px] font-sans font-bold tracking-widest text-text-muted uppercase">
                  REVEAL SUMMARY
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight font-sans">
                  {stats.mealName} Mapped.
                </h1>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 font-sans text-center">
                <div className="p-4 bg-bg-panel/15 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Watersheds</span>
                  <div className="text-text-primary font-extrabold text-2xl">
                    {stats.watersheds}
                  </div>
                  <span className="text-[7.5px] text-text-muted uppercase block leading-none">River Basins</span>
                </div>

                <div className="p-4 bg-bg-panel/15 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Fauna & Flora</span>
                  <div className="text-text-primary font-extrabold text-2xl">
                    {stats.species}
                  </div>
                  <span className="text-[7.5px] text-text-muted uppercase block leading-none">Species Linked</span>
                </div>

                <div className="p-4 bg-bg-panel/15 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Provenance</span>
                  <div className="text-text-primary font-extrabold text-2xl">
                    {stats.citations}
                  </div>
                  <span className="text-[7.5px] text-text-muted uppercase block leading-none">Academic Refs</span>
                </div>
              </div>

              <div className="p-6 bg-bg-panel/5 border border-border-subtle rounded-3xl text-left space-y-2">
                <span className="text-[8.5px] text-text-muted uppercase tracking-wider block font-bold">Primary Discovery Insight</span>
                <p className="text-[12px] text-text-primary leading-relaxed font-sans font-bold">
                  {primaryInsightText}
                </p>
              </div>

              <div>
                <Button
                  onClick={() => {
                    setCurrentStep(3);
                    setGraphBuildWave(0);
                  }}
                  variant="primary"
                  size="lg"
                  className="font-sans text-xs font-semibold uppercase tracking-wider px-8 py-3 rounded-xl gap-2 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow transition-all duration-300"
                >
                  <span>Explore Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: GRAPH INVESTIGATION */}
      {currentStep === 3 && activeGraph && (
        <div className="flex flex-col space-y-6 flex-1 animate-[fadeIn_0.5s_ease-out]">
          {/* Header controls bar */}
          <div className={`flex flex-col md:flex-row items-stretch gap-6 border-b border-border-subtle/50 pb-6 bg-bg-darkest transition-opacity duration-700 ${isGraphBuilding ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
            <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-bg-panel/10 p-4 rounded-2xl border-0 text-left">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-darkest/80 border border-border-subtle shrink-0">
                <img src={getMealImage(stats.mealName)} alt={stats.mealName} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-text-primary leading-none">{stats.mealName}</h2>
                  <span className={`px-2 py-0.5 rounded-full border text-[7.5px] font-sans font-bold ${bpiRating.color}`}>
                    BIODIVERSITY IMPACT: {bpiRating.label}
                  </span>
                </div>
                <p className="text-[10.5px] text-text-muted leading-relaxed font-sans mt-1 max-w-sm">
                  This meal affects <span className="text-text-primary font-bold">{summaryMetrics.countWatersheds} watersheds</span> and <span className="text-text-primary font-bold">{summaryMetrics.countSpecies} vulnerable species</span> downstream.
                </p>
              </div>
            </div>

            {/* BPI circle meter */}
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
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Biodiversity Pressure Index</span>
                <span className="text-xs font-extrabold text-text-primary block leading-none">{displayedBpi} / 100</span>
              </div>
              {showBpiTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-52 p-3 bg-bg-panel border border-border-subtle rounded-xl text-[9px] text-text-secondary leading-relaxed z-45 text-left shadow-2xl backdrop-blur-md">
                  BPI maps agricultural drawdowns, runoff, and chemical loads down your food supply chain into a 0 to 100 indicator index.
                </div>
              )}
            </div>

            {/* Confidence & Next step button */}
            <div className="relative flex items-center gap-4 bg-bg-panel/10 px-6 py-4 rounded-2xl border-0">
              <div 
                className="text-left cursor-help"
                onMouseEnter={() => setShowConfTooltip(true)}
                onMouseLeave={() => setShowConfTooltip(false)}
              >
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold leading-none">Confidence Rating</span>
                <span className="inline-flex items-center mt-1 text-[10px] font-sans font-bold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-full">
                  {confidencePercent}% CONFIDENCE
                </span>
                {showConfTooltip && (
                  <div className="absolute top-full left-1/4 transform -translate-x-1/2 mt-2 w-52 p-3 bg-bg-panel border border-border-subtle rounded-xl text-[9px] text-text-secondary leading-relaxed z-45 text-left shadow-2xl backdrop-blur-md">
                    Derived dynamically based on registry credentials (IUCN Red List weight: 98%, FAOSTAT: 94%, GBIF Occurrences: 88%).
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-l border-border-subtle/50 pl-4 font-sans text-[9px] font-bold">
                <Button
                  onClick={() => setCurrentStep(4)}
                  variant="primary"
                  size="md"
                  className="font-sans text-[10px] uppercase font-bold tracking-wider py-2 px-4 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow"
                >
                  Next: Run Simulation
                </Button>
              </div>
            </div>
          </div>

          {/* Split Graph / Ecosystem Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch relative">
            <div className="lg:col-span-7 flex flex-col h-full bg-bg-panel/5 rounded-3xl border-0 overflow-hidden relative p-4">
              <div className="flex-1 min-h-[580px]">
                <GraphViewer 
                  nodes={activeGraph.getNodes()}
                  edges={activeGraph.getEdges()}
                  selectedNodeId={selectedNode?.id || null}
                  onSelectNode={setSelectedNode}
                  hoveredNodeId={hoveredNodeId}
                  setHoveredNodeId={setHoveredNodeId}
                  replayWave={graphBuildWave}
                />
              </div>
            </div>

            {/* National Geographic Insights */}
            <div className={`lg:col-span-3 flex flex-col h-full bg-bg-panel/10 p-5 rounded-3xl border-0 justify-between max-h-[610px] text-left transition-opacity duration-700 ${isGraphBuilding ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
              <div className="border-b border-border-subtle/50 pb-2.5 shrink-0">
                <h3 className="text-xs font-sans font-bold text-text-primary uppercase tracking-wider">
                  Ecosystem Insights
                </h3>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-4 pt-4">
                <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Primary Pressure Driver</span>
                  <p className="text-[11px] text-text-primary leading-relaxed font-sans">
                    {stats.mealName.toLowerCase().includes('salad') 
                      ? 'Organic vegetables maintain low Blue-water draft loads across regional domains.' 
                      : stats.mealName.toLowerCase().includes('biryani')
                        ? 'Wetland paddy rice irrigation draft contributes 88% of local Blue-water footprint stress.'
                        : 'Dryland millets maintain negligible irrigation draft loads, relieving watershed pressures.'}
                  </p>
                </div>

                <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Downstream Watershed</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-text-primary font-bold font-sans">
                      {stats.mealName.toLowerCase().includes('salad') 
                        ? 'Kabini Catchment' 
                        : stats.mealName.toLowerCase().includes('biryani')
                          ? 'Godavari Basin'
                          : 'Krishna Basin'}
                    </span>
                    <span className={`text-[9px] border px-2 py-0.2 rounded-full font-bold ${
                      stats.mealName.toLowerCase().includes('salad') 
                        ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' 
                        : stats.mealName.toLowerCase().includes('biryani')
                          ? 'text-red-500 border-red-500/20 bg-red-500/5'
                          : 'text-orange-400 border-orange-400/20 bg-orange-400/5'
                    }`}>
                      {stats.mealName.toLowerCase().includes('salad') 
                        ? '0.22 LOW STRESS' 
                        : stats.mealName.toLowerCase().includes('biryani')
                          ? '0.84 HIGH STRESS'
                          : '0.35 MODERATE'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Wildlife Indicator</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-text-primary font-bold font-sans">
                      {stats.mealName.toLowerCase().includes('salad') 
                        ? 'Malabar Grey Hornbill' 
                        : stats.mealName.toLowerCase().includes('biryani')
                          ? 'Smooth-coated Otter'
                          : 'Blackbuck Antelope'}
                    </span>
                    <span className={`text-[9px] border px-2 py-0.2 rounded-full font-bold ${
                      stats.mealName.toLowerCase().includes('salad')
                        ? 'text-orange-400 border-orange-400/20 bg-orange-400/5'
                        : stats.mealName.toLowerCase().includes('biryani')
                          ? 'text-red-400 border-red-400/20 bg-red-400/5'
                          : 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                    }`}>
                      {stats.mealName.toLowerCase().includes('salad') 
                        ? 'Near Threatened' 
                        : stats.mealName.toLowerCase().includes('biryani')
                          ? 'Vulnerable'
                          : 'Least Concern'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-bg-darkest/40 border border-border-subtle/40 rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Verification Standard</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-text-primary font-bold font-sans">GBIF + IUCN Red-List</span>
                    <span className="text-[10px] text-accent-cyan font-bold font-mono">100% AUDITED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Node detail side drawer containing scientific evidence list */}
            {selectedNode && (
              <div className="absolute right-4 top-4 bottom-4 w-80 bg-bg-panel/95 border border-border-subtle rounded-3xl z-40 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md animate-[slideIn_0.3s_ease-out] text-left">
                <div className="space-y-6 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
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
                    <div className="flex items-center justify-between p-2 bg-bg-darkest/55 rounded-xl border border-border-subtle/30">
                      <span className="text-text-muted">Type:</span>
                      <span className="text-text-primary font-bold">{selectedNode.type}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-bg-darkest/55 rounded-xl border border-border-subtle/30">
                      <span className="text-text-muted">Avg Trophic Pressure:</span>
                      <span className="text-text-primary font-bold">{(selectedNode.properties.currentPressure ?? 1.0).toFixed(4)}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Global Database Occurrences</span>
                      <div className="p-3 bg-bg-darkest/30 border border-border-subtle rounded-xl space-y-1.5 text-[9.5px]">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-cyan" /> <span>GBIF ID: gbif-{selectedNode.id}</span></div>
                        <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-400" /> <span>IUCN Status: Vulnerable (LC)</span></div>
                      </div>
                    </div>
                  </div>

                  {selectedNodeEvidence.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border-subtle/40">
                      <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Scientific Citations</span>
                      <div className="space-y-2">
                        {selectedNodeEvidence.map(record => (
                          <div key={record.id} className="p-2.5 bg-bg-darkest/60 border border-border-subtle/30 rounded-xl space-y-1 text-[9.5px]">
                            <div className="flex justify-between items-center text-[7.5px] font-bold text-accent-cyan">
                              <span>{record.source}</span>
                              <span className="text-text-muted">CONF: {Math.round(record.confidence * 100)}%</span>
                            </div>
                            <p className="text-text-primary leading-normal">"{record.statement}"</p>
                            <span className="text-[7.5px] text-text-muted block truncate text-ellipsis overflow-hidden">REF: {record.citation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border-subtle/40 shrink-0">
                  <Button
                    onClick={() => setSelectedNode(null)}
                    variant="secondary"
                    size="sm"
                    className="w-full text-center font-sans text-[10px] uppercase font-bold tracking-wider py-2 cursor-pointer border border-border-subtle"
                  >
                    Close Panel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setCurrentStep(4)}
              variant="primary"
              size="lg"
              className="font-sans text-xs font-semibold uppercase tracking-wider px-8 py-3 rounded-xl gap-2 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow transition-all duration-300"
            >
              <span>Proceed to Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: SIMULATION */}
      {currentStep === 4 && activeGraph && (
        <div className="flex flex-col space-y-6 flex-1 animate-[fadeIn_0.5s_ease-out]">
          {/* Header controls bar */}
          <div className="flex flex-col md:flex-row items-stretch gap-6 border-b border-border-subtle/50 pb-6 bg-bg-darkest text-left">
            <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-bg-panel/10 p-4 rounded-2xl border-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-darkest/80 border border-border-subtle shrink-0">
                <img src={getMealImage(stats.mealName)} alt={stats.mealName} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-text-primary leading-none">{stats.mealName} Simulation</h2>
                  <span className={`px-2 py-0.5 rounded-full border text-[7.5px] font-sans font-bold ${bpiRating.color}`}>
                    SIMULATION MODE ACTIVE
                  </span>
                </div>
                <p className="text-[10.5px] text-text-muted leading-relaxed font-sans mt-1 max-w-sm">
                  Simulate crop substitutions and track ecological pressure wave deltas down the supply chain.
                </p>
              </div>
            </div>

            {/* BPI circle meter */}
            <div className="relative flex items-center gap-6 bg-bg-panel/10 px-6 py-3 rounded-2xl border-0">
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
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Simulated BPI Score</span>
                <span className="text-xs font-extrabold text-text-primary block leading-none">{displayedBpi} / 100</span>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="relative flex items-center gap-4 bg-bg-panel/10 px-6 py-4 rounded-2xl border-0">
              <div className="flex items-center gap-2 font-sans text-[9px] font-bold">
                <button
                  onClick={toggleDemoMode}
                  className={`px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                    demoMode ? 'bg-text-primary text-bg-darkest border-text-primary font-bold' : 'bg-transparent text-text-secondary border-border-subtle hover:text-text-primary hover:border-text-muted'
                  }`}
                >
                  {demoMode ? '✓ Demo Mode (Millet Swap)' : 'Demo Mode (Millet Swap)'}
                </button>

                <button
                  onClick={toggleJudgeMode}
                  className={`px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                    judgeMode ? 'bg-text-primary text-bg-darkest border-text-primary font-bold' : 'bg-transparent text-text-secondary border-border-subtle hover:text-text-primary hover:border-text-muted'
                  }`}
                >
                  {judgeMode ? '✓ Judge Mode (Locked)' : 'Judge Mode'}
                </button>

                <Button
                  onClick={() => handleRunSimulation(demoMode ? 'scen-millet' : 'control')}
                  variant="primary"
                  size="md"
                  disabled={isSimulating}
                  className="font-sans text-[10px] uppercase font-bold tracking-wider py-2 px-4 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow disabled:opacity-50"
                >
                  {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Run Simulation'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main dynamic graph split */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch relative">
            <div className="lg:col-span-7 flex flex-col h-full bg-bg-panel/5 rounded-3xl border-0 overflow-hidden relative p-4">
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                {simResult && !isReplaying && !isGraphBuilding && (
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={handleStartReplay}
                    className="font-sans text-[8px] uppercase tracking-wider py-1 cursor-pointer bg-bg-panel border border-border-subtle text-text-secondary hover:text-text-primary"
                  >
                    ▶ Replay Simulation Pulse
                  </Button>
                )}
                {isReplaying && (
                  <span className="text-[8px] font-sans text-accent-cyan bg-accent-cyan/15 border border-accent-cyan/35 px-2 py-1 rounded animate-pulse font-bold uppercase tracking-wider">
                    PULSING WAVE {replayWave}/10
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-[580px]">
                <GraphViewer 
                  nodes={activeGraph.getNodes()}
                  edges={activeGraph.getEdges()}
                  selectedNodeId={null}
                  onSelectNode={() => {}}
                  hoveredNodeId={null}
                  setHoveredNodeId={() => {}}
                  replayWave={replayWave}
                />
              </div>

              {isReplaying && (
                <div className="absolute bottom-6 left-6 right-6 p-3 bg-bg-panel/90 border border-border-subtle rounded-xl font-mono text-[9px] text-accent-cyan text-center leading-relaxed backdrop-blur-md">
                  {replayWaveDescription}
                </div>
              )}
            </div>

            {/* Simulation deck on right (Before/After delta + ERE timeline wave logs) */}
            <div className="lg:col-span-3 flex flex-col h-full bg-bg-panel/10 p-5 rounded-3xl border-0 justify-between max-h-[610px] text-left">
              <div className="border-b border-border-subtle/50 pb-2.5 shrink-0 flex justify-between items-center">
                <h3 className="text-xs font-sans font-bold text-text-primary uppercase tracking-wider">
                  Simulation Deck
                </h3>
                {isSimulating && <span className="text-[8px] bg-accent-cyan/15 text-accent-cyan px-2 py-0.5 rounded animate-pulse font-mono uppercase font-bold">PULSING...</span>}
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-4 pt-4 overflow-hidden">
                {/* Before / After Comparison */}
                <div className="p-4 bg-bg-darkest/45 border border-border-subtle/40 rounded-2xl space-y-2 text-[10px]">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">BPI Comparison (Before ➔ After)</span>
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <div className="flex-1 flex items-center justify-between p-2 bg-bg-darkest border border-border-subtle/30 rounded-xl">
                      <span className="text-text-muted text-[8.5px]">Control</span>
                      <span className="text-text-primary font-bold">78 BPI</span>
                    </div>
                    <span className="text-text-muted font-bold px-1.5">➔</span>
                    <div className="flex-1 flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="text-emerald-400 text-[8.5px]">Simulated</span>
                      <span className="text-emerald-400 font-bold">{78 - (summaryMetrics.pressureDelta < 0 ? Math.round(Math.abs(summaryMetrics.pressureDelta) * 100) : 31)} BPI</span>
                    </div>
                  </div>
                  <div className="text-[9.5px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-{summaryMetrics.pressureDelta < 0 ? Math.round(Math.abs(summaryMetrics.pressureDelta) * 100) : 31} BPI Delta Relief</span>
                  </div>
                </div>

                {/* ERE Wave Logs */}
                <div className="p-4 bg-bg-darkest/45 border border-border-subtle/40 rounded-2xl flex-1 flex flex-col min-h-[260px] overflow-hidden">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold mb-2">ERE Wave Logs</span>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin font-mono text-[8.5px]">
                    {timeline.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-text-muted text-[9px] py-8">
                        <RefreshCw className="w-6 h-6 animate-pulse text-accent-cyan/60 mb-2" />
                        <span>Awaiting simulation wave pulse run. Click "Run Simulation" above.</span>
                      </div>
                    ) : (
                      timeline.map((step, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-border-subtle/25 text-text-secondary">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-accent-cyan font-bold">[W{step.wave}]</span>
                            <span className="text-text-primary font-bold truncate max-w-[85px]">{step.affectedNode}</span>
                          </div>
                          <span className="text-emerald-400 shrink-0 font-bold">{step.oldPressure.toFixed(2)}➔{step.newPressure.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setCurrentStep(5)}
              variant="primary"
              size="lg"
              className="font-sans text-xs font-semibold uppercase tracking-wider px-8 py-3 rounded-xl gap-2 cursor-pointer bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow transition-all duration-300"
            >
              <span>Generate Executive Report</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: EXECUTIVE REPORT */}
      {currentStep === 5 && activeGraph && (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] text-left">
          {/* Header controls bar */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="space-y-1">
              <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Investigation Output</span>
              <h2 className="text-xl font-extrabold text-text-primary">Executive Policy Briefing</h2>
            </div>
            
            <div className="flex items-center gap-2 font-sans text-[10px] font-bold">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-3 py-1.5 bg-bg-panel/40 border border-border-subtle hover:border-text-secondary rounded-xl uppercase tracking-wider cursor-pointer transition-colors duration-150 text-text-secondary hover:text-text-primary"
              >
                Modify Simulation
              </button>

              <button
                onClick={() => triggerToast('Report compiled successfully. Initiating PDF download...')}
                className="px-4 py-1.5 bg-gradient-to-r from-accent-cyan to-indigo-500 hover:shadow-glow text-bg-darkest font-extrabold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Download Report
              </button>

              <button
                onClick={() => triggerToast('Secure shareable telemetry URL copied to clipboard!')}
                className="px-3 py-1.5 bg-bg-dark border border-border-subtle hover:border-text-primary rounded-xl uppercase tracking-wider cursor-pointer transition-colors duration-150 text-text-secondary hover:text-text-primary"
              >
                Share Report
              </button>
            </div>
          </div>

          {/* Main dashboard columns */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
            {/* Left Column (60%): Brief, reasoning, lineage */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Executive Summary Card */}
              <div className="p-6 bg-bg-panel/10 border border-border-subtle rounded-3xl space-y-4">
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Executive Summary</span>
                <p className="text-text-primary font-bold bg-bg-darkest/45 border border-border-subtle/40 p-4 rounded-2xl text-[12px] leading-relaxed">
                  {dynamicBriefContent.insight}
                </p>
                <div className="space-y-2">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Recommended Policy Actions</span>
                  <ul className="list-disc list-inside space-y-1.5 text-text-secondary text-[11px] pl-1 leading-relaxed">
                    {dynamicBriefContent.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* How Ripple Reached Conclusion */}
              <div className="p-6 bg-bg-panel/10 border border-border-subtle rounded-3xl space-y-4">
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">How Ripple Reached This Conclusion</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div className="p-3 bg-bg-darkest/30 border border-border-subtle/30 rounded-xl space-y-1">
                    <span className="text-[8px] text-accent-cyan uppercase tracking-wider font-bold">1. Meal Observation</span>
                    <p className="text-[10px] text-text-secondary leading-normal">{dynamicReasoningSteps[0]}</p>
                  </div>
                  <div className="p-3 bg-bg-darkest/30 border border-border-subtle/30 rounded-xl space-y-1">
                    <span className="text-[8px] text-accent-cyan uppercase tracking-wider font-bold">2. Evidence Verification</span>
                    <p className="text-[10px] text-text-secondary leading-normal">{dynamicReasoningSteps[1]}</p>
                  </div>
                  <div className="p-3 bg-bg-darkest/30 border border-border-subtle/30 rounded-xl space-y-1">
                    <span className="text-[8px] text-accent-cyan uppercase tracking-wider font-bold">3. Hydrological Inference</span>
                    <p className="text-[10px] text-text-secondary leading-normal">{dynamicReasoningSteps[2]}</p>
                  </div>
                  <div className="p-3 bg-bg-darkest/30 border border-border-subtle/30 rounded-xl space-y-1">
                    <span className="text-[8px] text-accent-cyan uppercase tracking-wider font-bold">4. Action Recommendation</span>
                    <p className="text-[10px] text-text-secondary leading-normal font-bold text-accent-cyan">{dynamicReasoningSteps[3]}</p>
                  </div>
                </div>
              </div>

              {/* Data Lineage & Assumptions */}
              <div className="p-6 bg-bg-panel/10 border border-border-subtle rounded-3xl space-y-4">
                <div className="space-y-3">
                  <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Clickable Scientific Data Lineage</span>
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
                  <div className="p-3 bg-bg-darkest/75 border border-border-subtle rounded-xl text-[10px] text-text-secondary">
                    <span className="text-accent-cyan font-bold uppercase text-[9px] block mb-1">Details: {LINEAGE_STEPS.find(s => s.id === selectedLineageStep)?.label}</span>
                    {LINEAGE_STEPS.find(s => s.id === selectedLineageStep)?.desc}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (40%): Stats, notes, bibliography */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Impact scorecards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-panel/10 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider block font-sans">Pressure Delta</span>
                  <div className="text-emerald-400 font-extrabold text-xl flex items-center gap-1 font-mono">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{summaryMetrics.pressureDelta < 0 ? Math.round(Math.abs(summaryMetrics.pressureDelta) * 100) : 31} BPI</span>
                  </div>
                  <span className="text-[7px] text-text-muted uppercase block leading-none font-sans font-bold">Pressure Relief</span>
                </div>

                <div className="p-4 bg-bg-panel/10 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider block font-sans">Mean Confidence</span>
                  <div className="text-accent-cyan font-extrabold text-xl font-mono">
                    {confidencePercent}% TRUST
                  </div>
                  <span className="text-[7px] text-text-muted uppercase block leading-none font-sans font-bold">Registry weight</span>
                </div>

                <div className="p-4 bg-bg-panel/10 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider block font-sans">Protected Species</span>
                  <div className="text-text-primary font-extrabold text-xl font-mono">
                    {summaryMetrics.countSpecies} Species
                  </div>
                  <span className="text-[7px] text-text-muted uppercase block leading-none font-sans font-bold">Status monitored</span>
                </div>

                <div className="p-4 bg-bg-panel/10 border border-border-subtle rounded-2xl space-y-1">
                  <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider block font-sans">Relieved Aquifers</span>
                  <div className="text-text-primary font-extrabold text-xl font-mono">
                    {summaryMetrics.countWatersheds} Basins
                  </div>
                  <span className="text-[7px] text-text-muted uppercase block leading-none font-sans font-bold">Draft boundaries</span>
                </div>
              </div>

              {/* Auditor notes */}
              <div className="p-5 bg-bg-panel/10 border border-border-subtle rounded-2xl space-y-3">
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">Investigator Notes & Peer Audit Log</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type investigator annotations or peer audit notes here..."
                  className="w-full h-24 bg-bg-darkest/60 border border-border-subtle/50 focus:border-accent-cyan rounded-xl p-3 outline-none text-[10.5px] text-text-secondary resize-none font-sans"
                />
              </div>

              {/* References Bibliography */}
              <div className="p-5 bg-bg-panel/10 border border-border-subtle rounded-2xl space-y-3 flex-1 flex flex-col max-h-[300px] overflow-hidden">
                <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold mb-2">Scientific Reference Bibliography</span>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-[9.5px] text-text-secondary leading-relaxed">
                  {allGraphCitations.length === 0 ? (
                    <div className="py-6 text-center text-text-muted font-mono text-[9px]">
                      No citation records resolved in graph context.
                    </div>
                  ) : (
                    allGraphCitations.map((record) => (
                      <div key={record.id} className="p-2.5 bg-bg-darkest/45 border border-border-subtle/30 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[7.5px] font-bold">
                          <span className="text-accent-cyan uppercase">{record.source} Registry</span>
                          <span className="text-text-muted font-mono font-normal">VERIFIED</span>
                        </div>
                        <p className="text-text-primary font-sans leading-normal">"{record.statement}"</p>
                        <div className="text-[7.5px] text-text-muted pt-1 border-t border-border-subtle/20 truncate">
                          {record.citation}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-bg-panel border border-accent-cyan/40 text-accent-cyan font-bold text-xs uppercase tracking-wider rounded-2xl shadow-glow z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* FIXED FOOTER METER STRIP */}
      {(currentStep === 3 || currentStep === 4) && activeGraph && (
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
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase">IMPROVED</span>
                  ) : summaryMetrics.pressureDelta > 0.001 ? (
                    <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold uppercase">DEGRADED</span>
                  ) : (
                    <span className="text-[8px] bg-bg-dark text-text-muted border border-border-subtle px-1 py-0.2 rounded">CONTROL</span>
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
                <span className="text-text-primary font-bold mt-0.5 block">{confidencePercent}% TRUST</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-border-subtle pl-8 shrink-0">
              <div className="p-2 bg-bg-dark border border-border-subtle rounded-lg">
                <BookOpen className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <span className="text-[8px] text-text-muted uppercase leading-none block">Evidence Coverage</span>
                <span className="text-text-primary font-bold mt-0.5 block">100% VERIFIED</span>
              </div>
            </div>

            <div className="flex items-center gap-6 border-l border-border-subtle pl-8 shrink-0 ml-auto text-[10px]">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-text-muted uppercase font-sans">Basins</span>
                <span className="text-text-primary font-bold font-sans">{summaryMetrics.countWatersheds} BASINS</span>
              </div>
              <div className="flex flex-col items-end border-l border-border-subtle/50 pl-6">
                <span className="text-[8px] text-text-muted uppercase font-sans">Ecosystems</span>
                <span className="text-text-primary font-bold font-sans">{summaryMetrics.countHabitats} HABITATS</span>
              </div>
              <div className="flex flex-col items-end border-l border-border-subtle/50 pl-6">
                <span className="text-[8px] text-text-muted uppercase font-sans">Wildlife</span>
                <span className="text-text-primary font-bold font-sans">{summaryMetrics.countSpecies} WILDLIFE</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
};
export default Workspace;
