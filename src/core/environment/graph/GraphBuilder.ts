import { EnvironmentalGraph } from './EnvironmentalGraph';
import type { NodeType } from './Node';
import type { RelationshipType } from './Edge';

/**
 * Fluent API Builder for constructing Environmental Context Graphs in a readable, chainable format.
 */
export class GraphBuilder {
  private graph: EnvironmentalGraph;

  constructor() {
    this.graph = new EnvironmentalGraph();
  }

  /**
   * Internal generic node adder to chain nodes of specific types.
   */
  private addNode(
    id: string, 
    type: NodeType, 
    label: string, 
    properties: Record<string, any> = {}, 
    metadata: Record<string, any> = {}, 
    evidence: string[] = []
  ): this {
    this.graph.addNode({
      id,
      type,
      label,
      properties,
      metadata,
      evidence
    });
    return this;
  }

  /**
   * Fluent method to append a MEAL entity.
   */
  addMeal(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'MEAL', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append an INGREDIENT entity.
   */
  addIngredient(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'INGREDIENT', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append a CROP entity.
   */
  addCrop(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'CROP', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append a REGION entity.
   */
  addRegion(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'REGION', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append a WATERSHED entity.
   */
  addWatershed(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'WATERSHED', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append a HABITAT entity.
   */
  addHabitat(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'HABITAT', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append a SPECIES entity.
   */
  addSpecies(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'SPECIES', label, properties, metadata, evidence);
  }

  /**
   * Fluent method to append an EVIDENCE entity.
   */
  addEvidence(
    id: string, 
    label: string, 
    properties?: Record<string, any>, 
    metadata?: Record<string, any>, 
    evidence?: string[]
  ): this {
    return this.addNode(id, 'EVIDENCE', label, properties, metadata, evidence);
  }

  /**
   * Creates a directed ecological connection between two nodes.
   * 
   * @param fromId Source Node ID.
   * @param toId Target Node ID.
   * @param relationship Relationship type.
   * @param confidence Confidence coefficient (defaults to 1.0).
   * @param metadata Custom metadata attributes.
   * @param customEdgeId Optional custom edge ID (defaults to automatic string concatenation).
   */
  connect(
    fromId: string,
    toId: string,
    relationship: RelationshipType,
    confidence = 1.0,
    metadata: Record<string, any> = {},
    customEdgeId?: string
  ): this {
    const id = customEdgeId || `${fromId}-${relationship}-${toId}`;
    this.graph.addEdge({
      id,
      from: fromId,
      to: toId,
      relationship,
      confidence,
      metadata
    });
    return this;
  }

  /**
   * Returns the constructed EnvironmentalGraph instance.
   */
  build(): EnvironmentalGraph {
    return this.graph;
  }
}
