import type { RelationshipType } from '../graph/Edge';
import type { GraphNode } from '../graph/Node';

/**
 * Registry of dynamic transmission weights mapped by relationship type.
 */
export class PressureModel {
  private static readonly DEFAULT_WEIGHTS: Record<RelationshipType, number> = {
    CONTAINS: 1.0,
    DERIVED_FROM: 0.9,
    CULTIVATED_IN: 0.8,
    BELONGS_TO: 0.7,
    CONTAINS_HABITAT: 0.6,
    SUPPORTS: 0.5,
    POLLINATES: 0.4,
    DEPENDS_ON: 0.3,
    THREATENED_BY: 0.6
  };

  private weights: Record<RelationshipType, number>;

  constructor(customWeights?: Partial<Record<RelationshipType, number>>) {
    this.weights = { ...PressureModel.DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Retrieves the current influence weight configuration for a relationship category.
   * 
   * @param relationship Target RelationshipType.
   */
  getEdgeWeight(relationship: RelationshipType): number {
    return this.weights[relationship] ?? 0.50; // Fallback weight if relationship unknown
  }

  /**
   * Modifies an influence transmission weight dynamically.
   * 
   * @param relationship Target RelationshipType to modify.
   * @param weight New weight coefficient (between 0.0 and 1.0).
   */
  setEdgeWeight(relationship: RelationshipType, weight: number): void {
    if (weight < 0.0 || weight > 1.0) {
      throw new Error(`Influence weight must be bounded between 0.0 and 1.0. Given: ${weight}`);
    }
    this.weights[relationship] = weight;
  }

  /**
   * Extracts or initializes pressure-related metrics from a GraphNode.
   * 
   * @param node Target GraphNode.
   */
  static getNodePressureDetails(node: GraphNode): {
    basePressure: number;
    currentPressure: number;
    pressureDelta: number;
    confidence: number;
  } {
    const basePressure = typeof node.properties.basePressure === 'number' 
      ? node.properties.basePressure 
      : 1.0; // default baseline unit of pressure

    const currentPressure = typeof node.properties.currentPressure === 'number'
      ? node.properties.currentPressure
      : basePressure;

    const pressureDelta = typeof node.properties.pressureDelta === 'number'
      ? node.properties.pressureDelta
      : (currentPressure - basePressure);

    const confidence = typeof node.metadata.confidence === 'number'
      ? node.metadata.confidence
      : 0.95; // default high validation baseline

    return {
      basePressure,
      currentPressure,
      pressureDelta,
      confidence
    };
  }
}
export default PressureModel;
