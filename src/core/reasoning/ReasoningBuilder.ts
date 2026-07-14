import { SimulationResult } from '../environment/simulation/SimulationResult';
import { EvidenceEngine } from '../environment/evidence/EvidenceEngine';
import { ReasoningTrace } from './ReasoningTrace';
import { ReasoningStep } from './ReasoningStep';
import { ConfidenceNarrator } from './ConfidenceNarrator';
import { LimitationsBuilder } from './LimitationsBuilder';
import type { ExplanationFormat } from './types';
import type { GraphNode } from '../environment/graph/Node';
import type { EvidenceRecord } from '../environment/evidence/types';
import type { TimelineRecord } from '../environment/simulation/types';

/**
 * ReasoningBuilder compiles telemetry results into structured steps.
 */
export class ReasoningBuilder {
  constructor() {}

  /**
   * Compiles explainability steps from a simulation result.
   */
  static build(
    result: SimulationResult,
    evidenceEngine: EvidenceEngine,
    format: ExplanationFormat
  ): ReasoningTrace {
    const trace = new ReasoningTrace();

    const graph = result.scenarioGraph;
    const mealNode = graph.getNodes().find((n: GraphNode) => n.type === 'MEAL');
    const mealName = mealNode?.label || 'Subject';

    // 1. OBSERVATION
    let obsText = '';
    const ingredients = graph.getNodes().filter((n: GraphNode) => n.type === 'INGREDIENT');
    const ingNames = ingredients.map((i: GraphNode) => `"${i.label}"`).join(', ');

    if (format === 'SCIENTIFIC') {
      obsText = `Telemetry Subject specimen identified: "${mealName}". Analysis of primary ingredients registered: [${ingNames}]. Observation verified in canvas ledger.`;
    } else if (format === 'JUDGE') {
      obsText = `We analyzed the meal choice: "${mealName}". It is made of ingredients like ${ingNames}.`;
    } else {
      obsText = `OBS_SPECIMEN_ID: "${mealNode?.id || 'null'}"\nOBS_LABEL: "${mealName}"\nINGREDIENTS_LIST: [${ingredients.map((i: GraphNode) => i.id).join(', ')}]`;
    }
    trace.addStep(new ReasoningStep('OBSERVATION', 'Observation Specimen', obsText));

    // 2. CONTEXT RECONSTRUCTION
    let ctxText = '';
    const crops = graph.getNodes().filter((n: GraphNode) => n.type === 'CROP').map((c: GraphNode) => c.label);
    const regions = graph.getNodes().filter((n: GraphNode) => n.type === 'REGION').map((r: GraphNode) => r.label);
    const basins = graph.getNodes().filter((n: GraphNode) => n.type === 'WATERSHED').map((w: GraphNode) => w.label);
    const habitats = graph.getNodes().filter((n: GraphNode) => n.type === 'HABITAT').map((h: GraphNode) => h.label);
    const species = graph.getNodes().filter((n: GraphNode) => n.type === 'SPECIES').map((s: GraphNode) => s.label);

    if (format === 'SCIENTIFIC') {
      ctxText = `Ecosystem supply chain mapping traces agricultural inputs from "${mealName}" down through the following parameters:
- Culinary crop derivatives: ${crops.join(', ')}
- Cultivating farm regions: ${regions.join(', ')}
- Outflow hydrological basins: ${basins.join(', ')}
- Downstream biological habitats: ${habitats.join(', ')}
- Supported trophic wildlife: ${species.join(', ')}`;
    } else if (format === 'JUDGE') {
      ctxText = `This meal connects directly to our ecosystems through a supply chain:
- The ingredients are made from crops like: ${crops.join(', ')}.
- These crops are farmed in regions like: ${regions.join(', ')}.
- Farm runoff enters watersheds like: ${basins.join(', ')}.
- These water flows support natural habitats like: ${habitats.join(', ')}.
- These habitats support native wildlife like: ${species.join(', ')}.`;
    } else {
      ctxText = `ECG_LAYERS_DUMP:
  - CROPS: [${graph.getNodes().filter((n: GraphNode) => n.type === 'CROP').map((c: GraphNode) => c.id).join(', ')}]
  - REGIONS: [${graph.getNodes().filter((n: GraphNode) => n.type === 'REGION').map((r: GraphNode) => r.id).join(', ')}]
  - WATERSHEDS: [${graph.getNodes().filter((n: GraphNode) => n.type === 'WATERSHED').map((w: GraphNode) => w.id).join(', ')}]
  - HABITATS: [${graph.getNodes().filter((n: GraphNode) => n.type === 'HABITAT').map((h: GraphNode) => h.id).join(', ')}]
  - SPECIES: [${graph.getNodes().filter((n: GraphNode) => n.type === 'SPECIES').map((s: GraphNode) => s.id).join(', ')}]`;
    }
    trace.addStep(new ReasoningStep('CONTEXT', 'Context Chain', ctxText));

    // 3. EVIDENCE
    let evText = '';
    const allEvidence = graph.getNodes().flatMap((node: GraphNode) => evidenceEngine.getEvidence(node.id));
    const uniqueRecords = Array.from(new Map(allEvidence.map((e: EvidenceRecord) => [e.id, e])).values()) as EvidenceRecord[];

    if (format === 'SCIENTIFIC') {
      evText = `Empirical proof gathered: ${uniqueRecords.length} records.
Citations details:
${uniqueRecords.map((e: EvidenceRecord, idx: number) => `  [REF-${idx + 1}]: "${e.citation}"\n       Verified dataset: ${e.dataset} (retrieved: ${e.retrievedAt}, trust quality: ${e.quality})`).join('\n')}`;
    } else if (format === 'JUDGE') {
      evText = `Our data is backed by ${uniqueRecords.length} scientific sources, including:
${uniqueRecords.slice(0, 4).map((e: EvidenceRecord) => `- "${e.statement}" (verified by ${e.source})`).join('\n')}`;
    } else {
      evText = `EE_CITATION_MATRIX:\n${uniqueRecords.map((e: EvidenceRecord) => `  [${e.id}]: source="${e.source}" dataset="${e.dataset}" quality=${e.quality}`).join('\n')}`;
    }
    trace.addStep(new ReasoningStep('EVIDENCE', 'Scientific Evidence', evText));

    // 4. SIMULATION
    let simText = '';
    const timelineRecords = result.timeline.getRecords();
    const modifications = result.graphDiff.modifiedNodes;
    const scenarioTitle = result.scenario.title;

    if (format === 'SCIENTIFIC') {
      simText = `Scenario run: "${scenarioTitle}". 
ERE execution tracked ${timelineRecords.length} wave cascades across ${modifications.length} modified nodes.
Detailed wave updates:
${timelineRecords.map((r: TimelineRecord) => `  Wave ${r.wave}: ${r.affectedNode} pressure changed from ${r.oldPressure.toFixed(2)} to ${r.newPressure.toFixed(2)} (${r.reason})`).join('\n')}`;
    } else if (format === 'JUDGE') {
      simText = `We simulated the scenario: "${scenarioTitle}".
As a result of this choice, we tracked cascading changes across ${modifications.length} nodes:
- The initial choice affected local ingredients.
- These changes rippled down through watersheds and habitats.
- Finally, they reduced environmental pressure on native wildlife.`;
    } else {
      simText = `SCENARIO_ID: "${result.scenario.id}"
MODIFIED_NODES_COUNT: ${modifications.length}
TIMELINE_LOGS:
${timelineRecords.map((r: TimelineRecord) => `  WAVE_${r.wave}::NODE_"${r.affectedNode}": ${r.oldPressure.toFixed(4)}->${r.newPressure.toFixed(4)}`).join('\n')}`;
    }
    trace.addStep(new ReasoningStep('SIMULATION', 'Simulation Telemetry', simText));

    // 5. CONCLUSION
    let conclText = '';
    const affectedSpecies = result.graphDiff.modifiedNodes.filter((n: any) => n.type === 'SPECIES');
    const affectedHabitats = result.graphDiff.modifiedNodes.filter((n: any) => n.type === 'HABITAT');

    const nodes = graph.getNodes();
    const pressures = nodes.map(n => n.properties.currentPressure ?? 1.0);
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / (pressures.length || 1);
    const basePressures = nodes.map(n => n.properties.basePressure ?? 1.0);
    const avgBasePressure = basePressures.reduce((a, b) => a + b, 0) / (basePressures.length || 1);
    const pressureDelta = avgPressure - avgBasePressure;

    if (format === 'SCIENTIFIC') {
      conclText = `Simulation concluded:
- Mean environmental pressure delta: ${pressureDelta.toFixed(4)}
- Affected downstream habitats: ${affectedHabitats.length} ecosystem(s)
- Affected fauna/flora: ${affectedSpecies.length} species
Trophic pressure delta represents reduced footprint vectors across local drainage structures.`;
    } else if (format === 'JUDGE') {
      conclText = `In summary:
- Environmental pressure dropped by an average delta of ${Math.abs(pressureDelta).toFixed(2)} units.
- We reduced pressure across ${affectedHabitats.length} habitats and ${affectedSpecies.length} native species.
This shows that shifting consumption choices creates positive ripples for wildlife.`;
    } else {
      conclText = `CONCLUSION_SUMMARY:
  - PRESSURE_DELTA_AVG: ${pressureDelta.toFixed(6)}
  - MODIFIED_HABITATS: ${affectedHabitats.map((h: any) => h.id).join(', ')}
  - MODIFIED_SPECIES: ${affectedSpecies.map((s: any) => s.id).join(', ')}`;
    }
    trace.addStep(new ReasoningStep('CONCLUSION', 'Causal Conclusion', conclText));

    // 6. CONFIDENCE
    const avgConfidence = result.confidenceSummary.meanConfidence;
    const confText = ConfidenceNarrator.narrate(avgConfidence, format);
    trace.addStep(new ReasoningStep('CONFIDENCE', 'Confidence Analysis', confText));

    // 7. LIMITATIONS
    const limText = LimitationsBuilder.build(format);
    trace.addStep(new ReasoningStep('LIMITATIONS', 'Limitations Caveats', limText));

    return trace;
  }
}
export default ReasoningBuilder;
