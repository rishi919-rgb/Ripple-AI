import type { GraphNode } from '../graph/Node';
import type { GraphEdge } from '../graph/Edge';
import type { EvidenceRecord } from './types';

/**
 * Configuration weight settings for confidence calculations.
 */
export interface ConfidenceWeights {
  /** Relative weight of the source quality (0.0 to 1.0). */
  sourceQualityWeight: number;
  /** Relative weight of the mapping match precision (0.0 to 1.0). */
  mappingPrecisionWeight: number;
}

/**
 * ConfidenceCalculator computes the overall reliability coefficients of nodes and edges,
 * utilizing configurable, weighted statistics.
 */
export class ConfidenceCalculator {
  private weights: ConfidenceWeights = {
    sourceQualityWeight: 0.60,
    mappingPrecisionWeight: 0.40
  };

  constructor(customWeights?: Partial<ConfidenceWeights>) {
    if (customWeights) {
      this.weights = { ...this.weights, ...customWeights };
    }
  }

  /**
   * Configures the active calculation weights.
   * 
   * @param sourceWeight Weight allocated to the source quality index (must sum to 1.0 with mapping weight).
   * @param mappingWeight Weight allocated to match precision.
   */
  configureWeights(sourceWeight: number, mappingWeight: number): void {
    const sum = sourceWeight + mappingWeight;
    if (Math.abs(sum - 1.0) > 0.0001) {
      throw new Error(`Weights must sum to 1.0. Given sum: ${sum}`);
    }
    this.weights.sourceQualityWeight = sourceWeight;
    this.weights.mappingPrecisionWeight = mappingWeight;
  }

  /**
   * Calculates the overall confidence score for a node, averaging all connecting EvidenceRecords.
   * 
   * @param node Target GraphNode.
   * @param evidenceRecords Array of associated EvidenceRecords.
   */
  calculateNodeConfidence(_node: GraphNode, evidenceRecords: EvidenceRecord[]): number {
    if (evidenceRecords.length === 0) {
      // Base default confidence if no evidence records are present
      return 0.50;
    }

    let totalNodeConfidence = 0;

    for (const record of evidenceRecords) {
      const sourceConfidence = record.quality;
      const mappingConfidence = record.confidence;

      // Weighted average calculation:
      const overallRecordConfidence = 
        (sourceConfidence * this.weights.sourceQualityWeight) + 
        (mappingConfidence * this.weights.mappingPrecisionWeight);

      totalNodeConfidence += overallRecordConfidence;
    }

    return totalNodeConfidence / evidenceRecords.length;
  }

  /**
   * Evaluates the confidence score of a directed Edge connection,
   * factoring in source confidence and mapping match types.
   * 
   * @param edge Target GraphEdge.
   * @param sourceNodeConfidence Confidence score of the source node.
   * @param targetNodeConfidence Confidence score of the target node.
   */
  calculateEdgeConfidence(
    edge: GraphEdge, 
    sourceNodeConfidence: number, 
    targetNodeConfidence: number
  ): number {
    // Edge confidence is the product of the edge's intrinsic confidence
    // and the average confidence of its connected nodes.
    const averageEndnodesConfidence = (sourceNodeConfidence + targetNodeConfidence) / 2;
    return edge.confidence * averageEndnodesConfidence;
  }
}
export default ConfidenceCalculator;
