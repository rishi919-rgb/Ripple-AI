import { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import { cloneGraph } from './SimulationUtils';
import { PressureModel } from './PressureModel';
import { Scenario } from './Scenario';
import type { TimelineRecord } from './types';

/**
 * PropagationEngine applies structural edits and forward propagates pressure across the graph.
 */
export class PropagationEngine {
  private pressureModel: PressureModel;

  constructor(pressureModel: PressureModel) {
    this.pressureModel = pressureModel;
  }

  /**
   * Evaluates the pressure update for a target node using the default attenuation model:
   * NewPressure = OldPressure + (IncomingDelta * EdgeWeight * Confidence).
   * 
   * Swap-in replacement wrapper to satisfy modular architecture requirements.
   */
  calculateTargetDelta(
    incomingDelta: number,
    edgeWeight: number,
    edgeConfidence: number
  ): number {
    return incomingDelta * edgeWeight * edgeConfidence;
  }

  /**
   * Executes the propagation routine, returning the mutated graph and timeline logs.
   * 
   * @param original Graph context database.
   * @param scenario hypothetical consumption modifications.
   * @param maxDepth Boundaries of wave levels.
   */
  propagate(
    original: EnvironmentalGraph,
    scenario: Scenario,
    maxDepth = 10
  ): { graph: EnvironmentalGraph; timeline: TimelineRecord[] } {
    // 1. Deep clone graph
    const graph = cloneGraph(original);
    const timeline: TimelineRecord[] = [];
    
    // Queue for BFS-wave propagation:
    // Holds target node ID, wave index, incoming delta pressure, and explanation reason
    const queue: {
      nodeId: string;
      wave: number;
      incomingDelta: number;
      reason: string;
    }[] = [];

    // 2. Apply Scenario Changes
    for (const change of scenario.getChanges()) {
      switch (change.type) {
        case 'REMOVE_NODE':
          graph.removeNode(change.targetId);
          break;

        case 'REMOVE_EDGE':
          graph.removeEdge(change.targetId);
          break;

        case 'ADD_NODE':
          graph.addNode(change.payload as any);
          break;

        case 'ADD_EDGE':
          graph.addEdge(change.payload as any);
          break;

        case 'MODIFY_NODE':
          const modNode = graph.findNode(change.targetId);
          if (modNode) {
            Object.assign(modNode.properties, change.payload.properties || {});
            Object.assign(modNode.metadata, change.payload.metadata || {});
          }
          break;

        case 'MODIFY_PRESSURE':
          const node = graph.findNode(change.targetId);
          if (node) {
            const oldPres = PressureModel.getNodePressureDetails(node).currentPressure;
            const newPres = typeof change.payload.currentPressure === 'number'
              ? change.payload.currentPressure
              : oldPres;

            node.properties.currentPressure = newPres;
            const delta = newPres - oldPres;
            node.properties.pressureDelta = delta;

            // Log wave 0 initial trigger
            timeline.push({
              timestamp: new Date().toISOString(),
              wave: 0,
              affectedNode: node.id,
              oldPressure: oldPres,
              newPressure: newPres,
              reason: `Scenario input trigger: "${scenario.title}"`,
              confidence: node.metadata.confidence ?? 0.95
            });

            // Queue outgoing connections
            queue.push({
              nodeId: node.id,
              wave: 1,
              incomingDelta: delta,
              reason: `Initial scenario input: "${scenario.title}"`
            });
          }
          break;
      }
    }

    // 3. Forward Propagate Pressure (BFS Wave queue)
    while (queue.length > 0) {
      const { nodeId, wave, incomingDelta, reason } = queue.shift()!;
      if (wave > maxDepth) continue;

      // Fetch outgoing connections
      const neighbors = graph.getNeighbors(nodeId);
      for (const neighbor of neighbors) {
        const targetNode = neighbor.node;
        const edge = neighbor.edge;

        // Skip if target node was removed
        if (!graph.findNode(targetNode.id)) continue;

        const edgeWeight = this.pressureModel.getEdgeWeight(edge.relationship);
        const edgeConfidence = edge.confidence ?? 0.95;

        // Calculate delta ripple
        const delta = this.calculateTargetDelta(incomingDelta, edgeWeight, edgeConfidence);

        if (Math.abs(delta) > 0.00001) {
          const oldPres = PressureModel.getNodePressureDetails(targetNode).currentPressure;
          const newPres = oldPres + delta;

          // Mutate target node properties
          targetNode.properties.currentPressure = newPres;
          targetNode.properties.pressureDelta = delta;

          // Log timeline step
          timeline.push({
            timestamp: new Date().toISOString(),
            wave,
            affectedNode: targetNode.id,
            oldPressure: oldPres,
            newPressure: newPres,
            reason: `Propagated wave via [${edge.relationship}] from "${nodeId}" (${reason})`,
            confidence: edgeConfidence
          });

          // Queue downstream neighbors
          queue.push({
            nodeId: targetNode.id,
            wave: wave + 1,
            incomingDelta: delta,
            reason: `Wave ${wave} cascade via "${nodeId}"`
          });
        }
      }
    }

    return {
      graph,
      timeline
    };
  }
}
export default PropagationEngine;
