import { RCDMEntityType, RelationshipType } from './types';

/**
 * Interface defining a valid source-target configuration for a relationship.
 */
export interface AllowedRelationshipRule {
  fromTypes: RCDMEntityType[];
  toTypes: RCDMEntityType[];
}

/**
 * Semantic Validation Matrix defining valid source-to-target entity pairs 
 * for every relationship defined in the Ripple Canonical Data Model (RCDM) v1.
 */
export const RELATIONSHIP_RULES: Record<RelationshipType, AllowedRelationshipRule> = {
  contains: {
    fromTypes: ['Food', 'Watershed', 'Dataset'],
    toTypes: ['Ingredient', 'Habitat', 'Food', 'Ingredient', 'Crop', 'Region', 'Watershed', 'Habitat', 'Species', 'Evidence', 'Citation', 'Confidence', 'SimulationMetadata', 'ReasoningMetadata']
  },
  derivedFrom: {
    fromTypes: ['Ingredient', 'Crop', 'Evidence', 'Dataset'],
    toTypes: ['Crop', 'Crop', 'Food', 'Ingredient', 'Region', 'Watershed', 'Habitat', 'Species', 'Evidence', 'Dataset']
  },
  cultivatedIn: {
    fromTypes: ['Crop'],
    toTypes: ['Region']
  },
  belongsTo: {
    fromTypes: ['Region', 'Habitat'],
    toTypes: ['Watershed']
  },
  supports: {
    fromTypes: ['Region', 'Watershed', 'Habitat'],
    toTypes: ['Species']
  },
  observedIn: {
    fromTypes: ['Species', 'Evidence'],
    toTypes: ['Region', 'Watershed', 'Habitat']
  },
  documentedBy: {
    fromTypes: [
      'Food', 'Ingredient', 'Crop', 'Region', 'Watershed', 
      'Habitat', 'Species', 'Evidence', 'Citation', 'Dataset', 
      'Confidence', 'SimulationMetadata', 'ReasoningMetadata'
    ],
    toTypes: ['Evidence']
  },
  references: {
    fromTypes: ['Evidence', 'Dataset', 'Citation'],
    toTypes: ['Citation']
  },
  derivedUsing: {
    fromTypes: ['Evidence'],
    toTypes: ['SimulationMetadata', 'ReasoningMetadata']
  },
  simulatedBy: {
    fromTypes: ['Evidence', 'SimulationMetadata'],
    toTypes: ['SimulationMetadata']
  },
  explainedBy: {
    fromTypes: ['Evidence', 'Confidence'],
    toTypes: ['ReasoningMetadata']
  }
};

/**
 * Validate whether a directed connection is semantically valid according to RCDM v1.
 */
export function isRelationshipAllowed(
  fromType: RCDMEntityType,
  relationship: RelationshipType,
  toType: RCDMEntityType
): boolean {
  const rule = RELATIONSHIP_RULES[relationship];
  if (!rule) return false;
  return rule.fromTypes.includes(fromType) && rule.toTypes.includes(toType);
}

/**
 * Custom semantic constraints that cannot be fully expressed in JSON Schema.
 */
export const SEMANTIC_CONSTRAINTS = {
  validateConfidenceScore(score: number): boolean {
    return score >= 0.0 && score <= 1.0;
  },

  validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -90.0 && lat <= 90.0 && lon >= -180.0 && lon <= 180.0;
  },

  validateIsoTimestamp(timestamp: string): boolean {
    const d = new Date(timestamp);
    return !isNaN(d.getTime()) && timestamp.includes('T');
  }
};
