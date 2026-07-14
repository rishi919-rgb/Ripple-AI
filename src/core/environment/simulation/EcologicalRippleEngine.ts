import { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import type { GraphNode } from '../graph/Node';
import { Scenario } from './Scenario';
import { PressureModel } from './PressureModel';
import { PropagationEngine } from './PropagationEngine';
import { GraphDiff } from './GraphDiff';
import { SimulationTimeline } from './SimulationTimeline';
import { SimulationResult } from './SimulationResult';
import type { GraphDiffReport, TimelineRecord } from './types';

/**
 * EcologicalRippleEngine (ERE) serves as the primary simulation facade,
 * executing deterministic, scenario-based pressure propagation calculations.
 */
export class EcologicalRippleEngine {
  private pressureModel: PressureModel;
  private propagationEngine: PropagationEngine;

  constructor(customWeights?: Partial<Record<string, any>>) {
    this.pressureModel = new PressureModel(customWeights);
    this.propagationEngine = new PropagationEngine(this.pressureModel);
  }

  /**
   * Executes a propagation simulation applying a scenario to an EnvironmentalGraph,
   * returning a comprehensive, deterministic SimulationResult report.
   * 
   * @param graph Reference EnvironmentalGraph.
   * @param scenario hypothetical human consumption choice scenario.
   * @param maxDepth Boundaries of cascade waves.
   */
  simulate(
    graph: EnvironmentalGraph, 
    scenario: Scenario, 
    maxDepth = 10
  ): SimulationResult {
    const { graph: mutatedGraph, timeline: rawTimeline } = 
      this.propagationEngine.propagate(graph, scenario, maxDepth);

    const diff = GraphDiff.compare(graph, mutatedGraph);
    const timeline = new SimulationTimeline(rawTimeline);

    return new SimulationResult(
      scenario,
      graph,
      mutatedGraph,
      diff,
      timeline
    );
  }

  /**
   * Compares two graphs and returns a detailed structural and value diff report.
   * 
   * @param original Reference graph.
   * @param mutated Changed graph.
   */
  compare(original: EnvironmentalGraph, mutated: EnvironmentalGraph): GraphDiffReport {
    return GraphDiff.compare(original, mutated);
  }

  /**
   * Generates a structural and value diff report between two graphs.
   * Duplicate alias wrapper to satisfy specific Sprint specifications.
   */
  generateDiff(original: EnvironmentalGraph, mutated: EnvironmentalGraph): GraphDiffReport {
    return GraphDiff.compare(original, mutated);
  }

  /**
   * Wraps an array of timeline log records into a SimulationTimeline class instance.
   * 
   * @param records Array of raw propagation step logs.
   */
  generateTimeline(records: TimelineRecord[]): SimulationTimeline {
    return new SimulationTimeline(records);
  }

  /**
   * Extracts the calculated current pressure from a GraphNode.
   * 
   * @param node The GraphNode to inspect.
   */
  calculatePressure(node: GraphNode): number {
    return PressureModel.getNodePressureDetails(node).currentPressure;
  }
}
export default EcologicalRippleEngine;
