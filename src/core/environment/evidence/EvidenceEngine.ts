import { EvidenceStore } from './EvidenceStore';
import { EvidenceResolver } from './EvidenceResolver';
import { ConfidenceCalculator } from './ConfidenceCalculator';
import type { EvidenceRecord } from './types';
import type { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import type { GraphNode } from '../graph/Node';
import type { GraphEdge } from '../graph/Edge';

/**
 * EvidenceEngine is Ripple's scientific validation facade.
 * It resolves evidence records, computes confidence matrices, and annotates ECG components.
 */
export class EvidenceEngine {
  private store: EvidenceStore;
  private resolver: EvidenceResolver;
  private calculator: ConfidenceCalculator;

  constructor() {
    this.store = new EvidenceStore();
    this.resolver = new EvidenceResolver(this.store);
    this.calculator = new ConfidenceCalculator();
  }

  /**
   * Annotates every node and edge in the graph with evidence citations and confidence scores.
   * 
   * @param graph Target EnvironmentalGraph to validate and annotate.
   */
  annotateGraph(graph: EnvironmentalGraph): void {
    const nodes = graph.getNodes();
    const edges = graph.getEdges();

    // 1. First pass: Annotate all nodes
    for (const node of nodes) {
      this.annotateNode(node);
    }

    // 2. Second pass: Annotate all edges utilizing node confidence scores
    for (const edge of edges) {
      this.annotateEdge(edge, graph);
    }
  }

  /**
   * Annotates a single node with evidence references and updates its metadata confidence.
   * 
   * @param node The GraphNode to annotate.
   */
  annotateNode(node: GraphNode): void {
    // Resolve scientific evidence records
    const records = this.resolver.resolveNode(node);

    // Compute node confidence
    const confidence = this.calculator.calculateNodeConfidence(node, records);
    
    // Annotate node metadata and properties
    node.metadata.confidence = confidence;
    node.metadata.annotatedAt = new Date().toISOString();
  }

  /**
   * Annotates an edge with calculated confidence, evaluating the source and target node confidences.
   * 
   * @param edge The GraphEdge to annotate.
   * @param graph Reference EnvironmentalGraph holding the nodes.
   */
  annotateEdge(edge: GraphEdge, graph: EnvironmentalGraph): void {
    const sourceNode = graph.findNode(edge.from);
    const targetNode = graph.findNode(edge.to);

    const sourceConfidence = sourceNode?.metadata.confidence ?? 0.50;
    const targetConfidence = targetNode?.metadata.confidence ?? 0.50;

    // Calculate edge confidence
    const confidence = this.calculator.calculateEdgeConfidence(
      edge, 
      sourceConfidence, 
      targetConfidence
    );

    // Write back computed confidence
    edge.confidence = confidence;
    edge.metadata.annotatedAt = new Date().toISOString();
  }

  /**
   * Retrieves all evidence records associated with a specific node or edge ID.
   * 
   * @param entityId Target GraphNode or GraphEdge ID.
   */
  getEvidence(entityId: string): EvidenceRecord[] {
    return this.store.findByEntity(entityId);
  }

  /**
   * Calculates the current confidence value of a node or edge.
   * 
   * @param entityId Target Node or Edge ID.
   * @param graph Reference EnvironmentalGraph.
   */
  calculateConfidence(entityId: string, graph: EnvironmentalGraph): number {
    const node = graph.findNode(entityId);
    if (node) {
      const records = this.store.findByEntity(entityId);
      return this.calculator.calculateNodeConfidence(node, records);
    }

    const edge = graph.getEdges().find(e => e.id === entityId);
    if (edge) {
      const sourceNode = graph.findNode(edge.from);
      const targetNode = graph.findNode(edge.to);
      const sourceConfidence = sourceNode?.metadata.confidence ?? 0.50;
      const targetConfidence = targetNode?.metadata.confidence ?? 0.50;
      return this.calculator.calculateEdgeConfidence(edge, sourceConfidence, targetConfidence);
    }

    return 0.50; // default fallback if entity not resolved
  }
}
export default EvidenceEngine;
