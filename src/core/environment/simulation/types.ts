import type { NodeType } from '../graph/Node';
import type { RelationshipType } from '../graph/Edge';

/**
 * Standard action types representing structural or value updates during scenario execution.
 */
export type ScenarioChangeType =
  | 'ADD_NODE'
  | 'REMOVE_NODE'
  | 'MODIFY_NODE'
  | 'ADD_EDGE'
  | 'REMOVE_EDGE'
  | 'MODIFY_PRESSURE';

/**
 * Description of a single structural or parametric change in a consumption scenario.
 */
export interface ScenarioChange {
  /** Mode of edit action. */
  type: ScenarioChangeType;
  /** Targeted Node ID or Edge ID. */
  targetId: string;
  /** Payload attributes containing changed parameters or properties. */
  payload: Record<string, any>;
}

/**
 * Log record tracing one specific step or wave update in the propagation.
 */
export interface TimelineRecord {
  /** Timestamp when the propagation step occurred. */
  timestamp: string;
  /** Wave index (sequential step iteration). */
  wave: number;
  /** Node ID affected by the ripple. */
  affectedNode: string;
  /** Previous pressure value. */
  oldPressure: number;
  /** New calculated pressure value. */
  newPressure: number;
  /** Text description explaining the propagation vector and logic. */
  reason: string;
  /** Confidence coefficient of the source validation. */
  confidence: number;
}

/**
 * Graph difference details for a modified node.
 */
export interface GraphDiffNode {
  id: string;
  action: 'ADD' | 'REMOVE' | 'MODIFY';
  type: NodeType;
  label: string;
  oldPressure: number;
  newPressure: number;
  pressureDelta: number;
}

/**
 * Graph difference details for a modified edge.
 */
export interface GraphDiffEdge {
  id: string;
  action: 'ADD' | 'REMOVE' | 'MODIFY';
  from: string;
  to: string;
  relationship: RelationshipType;
  oldConfidence: number;
  newConfidence: number;
}

/**
 * Collected report of structural difference analysis.
 */
export interface GraphDiffReport {
  addedNodes: GraphDiffNode[];
  removedNodes: GraphDiffNode[];
  modifiedNodes: GraphDiffNode[];
  addedEdges: GraphDiffEdge[];
  removedEdges: GraphDiffEdge[];
  modifiedEdges: GraphDiffEdge[];
}
