import type { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import { PressureModel } from './PressureModel';
import type { GraphDiffReport, GraphDiffNode, GraphDiffEdge } from './types';

/**
 * GraphDiff computes the delta differences between two graphs.
 */
export class GraphDiff {
  constructor() {}

  /**
   * Compares the original graph and mutated graph, returning a detailed GraphDiffReport.
   * 
   * @param original Original reference EnvironmentalGraph.
   * @param mutated Mutated scenario EnvironmentalGraph.
   */
  static compare(original: EnvironmentalGraph, mutated: EnvironmentalGraph): GraphDiffReport {
    const addedNodes: GraphDiffNode[] = [];
    const removedNodes: GraphDiffNode[] = [];
    const modifiedNodes: GraphDiffNode[] = [];

    const addedEdges: GraphDiffEdge[] = [];
    const removedEdges: GraphDiffEdge[] = [];
    const modifiedEdges: GraphDiffEdge[] = [];

    const origNodes = original.getNodes();
    const mutNodes = mutated.getNodes();
    const origNodeMap = new Map(origNodes.map(n => [n.id, n]));
    const mutNodeMap = new Map(mutNodes.map(n => [n.id, n]));

    const origEdges = original.getEdges();
    const mutEdges = mutated.getEdges();
    const origEdgeMap = new Map(origEdges.map(e => [e.id, e]));
    const mutEdgeMap = new Map(mutEdges.map(e => [e.id, e]));

    // Compare Nodes
    for (const node of mutNodes) {
      const origNode = origNodeMap.get(node.id);
      const mutPres = PressureModel.getNodePressureDetails(node);
      
      if (!origNode) {
        // Node Added
        addedNodes.push({
          id: node.id,
          action: 'ADD',
          type: node.type,
          label: node.label,
          oldPressure: 0.0,
          newPressure: mutPres.currentPressure,
          pressureDelta: mutPres.currentPressure
        });
      } else {
        // Node Existed: check if pressure or confidence modified
        const origPres = PressureModel.getNodePressureDetails(origNode);
        const pressureDelta = mutPres.currentPressure - origPres.currentPressure;

        if (Math.abs(pressureDelta) > 0.00001) {
          modifiedNodes.push({
            id: node.id,
            action: 'MODIFY',
            type: node.type,
            label: node.label,
            oldPressure: origPres.currentPressure,
            newPressure: mutPres.currentPressure,
            pressureDelta
          });
        }
      }
    }

    for (const node of origNodes) {
      if (!mutNodeMap.has(node.id)) {
        const origPres = PressureModel.getNodePressureDetails(node);
        // Node Removed
        removedNodes.push({
          id: node.id,
          action: 'REMOVE',
          type: node.type,
          label: node.label,
          oldPressure: origPres.currentPressure,
          newPressure: 0.0,
          pressureDelta: -origPres.currentPressure
        });
      }
    }

    // Compare Edges
    for (const edge of mutEdges) {
      const origEdge = origEdgeMap.get(edge.id);
      if (!origEdge) {
        // Edge Added
        addedEdges.push({
          id: edge.id,
          action: 'ADD',
          from: edge.from,
          to: edge.to,
          relationship: edge.relationship,
          oldConfidence: 0.0,
          newConfidence: edge.confidence
        });
      } else {
        // Edge Existed: Check if confidence modified
        const confidenceDelta = edge.confidence - origEdge.confidence;
        if (Math.abs(confidenceDelta) > 0.00001) {
          modifiedEdges.push({
            id: edge.id,
            action: 'MODIFY',
            from: edge.from,
            to: edge.to,
            relationship: edge.relationship,
            oldConfidence: origEdge.confidence,
            newConfidence: edge.confidence
          });
        }
      }
    }

    for (const edge of origEdges) {
      if (!mutEdgeMap.has(edge.id)) {
        // Edge Removed
        removedEdges.push({
          id: edge.id,
          action: 'REMOVE',
          from: edge.from,
          to: edge.to,
          relationship: edge.relationship,
          oldConfidence: edge.confidence,
          newConfidence: 0.0
        });
      }
    }

    return {
      addedNodes,
      removedNodes,
      modifiedNodes,
      addedEdges,
      removedEdges,
      modifiedEdges
    };
  }
}
export default GraphDiff;
