/**
 * Valid relationship types representing directed ecological connections.
 */
export type RelationshipType =
  | 'CONTAINS'
  | 'DERIVED_FROM'
  | 'CULTIVATED_IN'
  | 'BELONGS_TO'
  | 'CONTAINS_HABITAT'
  | 'SUPPORTS'
  | 'POLLINATES'
  | 'DEPENDS_ON'
  | 'THREATENED_BY';

/**
 * Represents a directed link (arc) between two entities in the Environmental Context Graph.
 */
export interface GraphEdge {
  /** Unique identifier for the edge. */
  id: string;
  /** Source node ID (tail of the directed edge). */
  from: string;
  /** Target node ID (head of the directed edge). */
  to: string;
  /** Ecological connection category. */
  relationship: RelationshipType;
  /** Certainty coefficient of the connection, bounded between 0.0 and 1.0. */
  confidence: number;
  /** Custom metadata (e.g. calculation parameters, lifecycle reference links). */
  metadata: Record<string, any>;
}
