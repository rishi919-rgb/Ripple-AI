/**
 * Valid node types representing specific environmental layers or inputs in the Ripple platform.
 */
export type NodeType = 
  | 'MEAL' 
  | 'INGREDIENT' 
  | 'CROP' 
  | 'REGION' 
  | 'WATERSHED' 
  | 'HABITAT' 
  | 'SPECIES' 
  | 'EVIDENCE';

/**
 * Represents a single entity (vertex) in the Environmental Context Graph.
 */
export interface GraphNode {
  /** Unique identifier for the node. */
  id: string;
  /** Layer type of the node. */
  type: NodeType;
  /** Human-readable display label. */
  label: string;
  /** Custom properties storing domain-specific attributes (e.g. quantity, composition). */
  properties: Record<string, any>;
  /** System metadata (e.g. source, reliability metrics). */
  metadata: Record<string, any>;
  /** Reference citation IDs mapping back to verified life cycle databases or papers. */
  evidence: string[];
}
