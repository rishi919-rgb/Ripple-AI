import { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import { Scenario } from './Scenario';
import { SimulationTimeline } from './SimulationTimeline';
import type { GraphDiffReport } from './types';
import { PressureModel } from './PressureModel';

/**
 * Collected results compiling initial and scenario states, deltas, and timeline audits.
 */
export class SimulationResult {
  scenario: Scenario;
  originalGraph: EnvironmentalGraph;
  scenarioGraph: EnvironmentalGraph;
  graphDiff: GraphDiffReport;
  timeline: SimulationTimeline;
  affectedNodes: string[];
  pressureSummary: {
    meanDelta: number;
    maxDelta: number;
    totalDeltas: number;
  };
  confidenceSummary: {
    meanConfidence: number;
  };

  constructor(
    scenario: Scenario,
    originalGraph: EnvironmentalGraph,
    scenarioGraph: EnvironmentalGraph,
    graphDiff: GraphDiffReport,
    timeline: SimulationTimeline
  ) {
    this.scenario = scenario;
    this.originalGraph = originalGraph;
    this.scenarioGraph = scenarioGraph;
    this.graphDiff = graphDiff;
    this.timeline = timeline;

    // Compile summary statistics
    this.affectedNodes = graphDiff.modifiedNodes.map(n => n.id);

    const deltas = graphDiff.modifiedNodes.map(n => Math.abs(n.pressureDelta));
    const totalDeltas = deltas.reduce((a, b) => a + b, 0);
    const meanDelta = deltas.length > 0 ? totalDeltas / deltas.length : 0.0;
    const maxDelta = deltas.length > 0 ? Math.max(...deltas) : 0.0;

    this.pressureSummary = {
      meanDelta,
      maxDelta,
      totalDeltas
    };

    // Calculate average confidence of the scenario graph nodes
    const confidences = scenarioGraph.getNodes().map(n => {
      const pres = PressureModel.getNodePressureDetails(n);
      return pres.confidence;
    });
    const totalConf = confidences.reduce((a, b) => a + b, 0);
    const meanConfidence = confidences.length > 0 ? totalConf / confidences.length : 0.95;

    this.confidenceSummary = {
      meanConfidence
    };
  }
}
export default SimulationResult;
