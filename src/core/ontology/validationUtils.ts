import type { RCDMEntity, RCDMRelationship, RCDMEntityType } from './types';
import { isRelationshipAllowed, SEMANTIC_CONSTRAINTS } from './validationRules';
import { SCHEMAS } from './schemas';

export interface ValidationError {
  path: string;
  message: string;
  errorCode: string;
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface GraphValidationReport {
  isValid: boolean;
  entityReports: Record<string, ValidationReport>;
  relationshipReports: Record<string, ValidationReport>;
  structuralErrors: ValidationError[];
  warnings: string[];
}

/**
 * Validates a single RCDM Entity against its JSON Schema and semantic rules.
 */
export function validateEntity(entity: any): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!entity || typeof entity !== 'object') {
    return {
      isValid: false,
      errors: [{ path: '', message: 'Entity must be a non-null object', errorCode: 'INVALID_OBJECT' }],
      warnings
    };
  }

  // 1. Validate Core Base Fields
  const requiredBaseFields = ['id', 'type', 'version', 'confidence', 'provenance', 'citations', 'lastVerified'];
  for (const field of requiredBaseFields) {
    if (entity[field] === undefined || entity[field] === null) {
      errors.push({
        path: field,
        message: `Missing required base property: ${field}`,
        errorCode: 'MISSING_BASE_FIELD'
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Verify ID format
  if (typeof entity.id !== 'string' || entity.id.trim() === '') {
    errors.push({ path: 'id', message: 'Entity ID must be a non-empty string', errorCode: 'INVALID_ID' });
  }

  // Verify Version
  if (typeof entity.version !== 'string') {
    errors.push({ path: 'version', message: 'Entity version must be a string', errorCode: 'INVALID_VERSION' });
  }

  // Verify Citations
  if (!Array.isArray(entity.citations)) {
    errors.push({ path: 'citations', message: 'Citations must be an array of strings', errorCode: 'INVALID_CITATIONS' });
  } else {
    entity.citations.forEach((citId: any, idx: number) => {
      if (typeof citId !== 'string') {
        errors.push({ path: `citations[${idx}]`, message: 'Citation reference must be a string ID', errorCode: 'INVALID_CITATION_ID' });
      }
    });
  }

  // Verify lastVerified date-time
  if (typeof entity.lastVerified !== 'string' || !SEMANTIC_CONSTRAINTS.validateIsoTimestamp(entity.lastVerified)) {
    errors.push({ path: 'lastVerified', message: 'lastVerified must be a valid ISO 8601 date-time string', errorCode: 'INVALID_TIMESTAMP' });
  }

  // Verify Provenance
  const prov = entity.provenance;
  if (typeof prov !== 'object' || prov === null) {
    errors.push({ path: 'provenance', message: 'Provenance must be an object', errorCode: 'INVALID_PROVENANCE' });
  } else {
    if (!prov.creator || typeof prov.creator !== 'string') {
      errors.push({ path: 'provenance.creator', message: 'Provenance creator is required and must be a string', errorCode: 'INVALID_PROVENANCE' });
    }
    if (!prov.created || typeof prov.created !== 'string' || !SEMANTIC_CONSTRAINTS.validateIsoTimestamp(prov.created)) {
      errors.push({ path: 'provenance.created', message: 'Provenance created timestamp is required and must be a valid ISO string', errorCode: 'INVALID_PROVENANCE' });
    }
    if (prov.updated && (typeof prov.updated !== 'string' || !SEMANTIC_CONSTRAINTS.validateIsoTimestamp(prov.updated))) {
      errors.push({ path: 'provenance.updated', message: 'Provenance updated timestamp must be a valid ISO string', errorCode: 'INVALID_PROVENANCE' });
    }
    if (!prov.sourceSystem || typeof prov.sourceSystem !== 'string') {
      errors.push({ path: 'provenance.sourceSystem', message: 'Provenance sourceSystem is required and must be a string', errorCode: 'INVALID_PROVENANCE' });
    }
  }

  // Verify Confidence
  const conf = entity.confidence;
  if (typeof conf !== 'object' || conf === null) {
    errors.push({ path: 'confidence', message: 'Confidence must be an object', errorCode: 'INVALID_CONFIDENCE' });
  } else {
    if (conf.score !== undefined) {
      if (typeof conf.score !== 'number' || !SEMANTIC_CONSTRAINTS.validateConfidenceScore(conf.score)) {
        errors.push({ path: 'confidence.score', message: 'Confidence score must be a number between 0.0 and 1.0', errorCode: 'INVALID_CONFIDENCE_SCORE' });
      }
    }
    if (conf.level !== undefined && !['Low', 'Medium', 'High'].includes(conf.level)) {
      errors.push({ path: 'confidence.level', message: 'Confidence level must be Low, Medium, or High', errorCode: 'INVALID_CONFIDENCE_LEVEL' });
    }
  }

  // 2. Validate Specific Entity Types and Required Fields
  const type: RCDMEntityType = entity.type;
  const schema = SCHEMAS[type];

  if (!schema) {
    errors.push({
      path: 'type',
      message: `Unknown entity type: ${type}`,
      errorCode: 'UNKNOWN_ENTITY_TYPE'
    });
    return { isValid: false, errors, warnings };
  }

  // Custom Schema Rule Verification
  switch (type) {
    case 'Food':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Food name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      break;

    case 'Ingredient':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Ingredient name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.category !== 'string' || entity.category.trim() === '') {
        errors.push({ path: 'category', message: 'Ingredient category must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (entity.aliases && !Array.isArray(entity.aliases)) {
        errors.push({ path: 'aliases', message: 'Aliases must be an array of strings', errorCode: 'INVALID_TYPE' });
      }
      break;

    case 'Crop':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Crop name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.scientificName !== 'string' || entity.scientificName.trim() === '') {
        errors.push({ path: 'scientificName', message: 'Crop scientificName must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      break;

    case 'Region':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Region name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.country !== 'string' || entity.country.trim() === '') {
        errors.push({ path: 'country', message: 'Region country must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (entity.coordinates) {
        const coords = entity.coordinates;
        if (typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number' ||
            !SEMANTIC_CONSTRAINTS.validateCoordinates(coords.latitude, coords.longitude)) {
          errors.push({ path: 'coordinates', message: 'Region coordinates must contain valid latitude (-90 to 90) and longitude (-180 to 180)', errorCode: 'INVALID_COORDINATES' });
        }
      }
      break;

    case 'Watershed':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Watershed name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.riverSystem !== 'string' || entity.riverSystem.trim() === '') {
        errors.push({ path: 'riverSystem', message: 'Watershed riverSystem must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (entity.basinAreaSqKm !== undefined && entity.basinAreaSqKm !== null) {
        if (typeof entity.basinAreaSqKm !== 'number' || entity.basinAreaSqKm <= 0) {
          errors.push({ path: 'basinAreaSqKm', message: 'basinAreaSqKm must be a positive number', errorCode: 'INVALID_BASIN_AREA' });
        }
      }
      const stressIndex = entity.metadata?.stressIndex;
      if (stressIndex !== undefined && stressIndex !== null) {
        if (typeof stressIndex !== 'number' || stressIndex < 0 || stressIndex > 1) {
          errors.push({ path: 'metadata.stressIndex', message: 'stressIndex must be a number between 0 and 1', errorCode: 'INVALID_STRESS_INDEX' });
        }
      }
      const rainfall = entity.metadata?.averageAnnualRainfall;
      if (rainfall !== undefined && rainfall !== null) {
        if (typeof rainfall !== 'number' || rainfall <= 0) {
          errors.push({ path: 'metadata.averageAnnualRainfall', message: 'averageAnnualRainfall must be a positive number', errorCode: 'INVALID_RAINFALL' });
        }
      }
      const sourceDataset = entity.metadata?.sourceDataset;
      if (sourceDataset === undefined || sourceDataset === null || typeof sourceDataset !== 'string' || sourceDataset.trim() === '') {
        errors.push({ path: 'metadata.sourceDataset', message: 'sourceDataset is required', errorCode: 'MISSING_SOURCE_DATASET' });
      }
      break;

    case 'Habitat':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Habitat name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.classification !== 'string' || entity.classification.trim() === '') {
        errors.push({ path: 'classification', message: 'Habitat classification must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (entity.ecologicalHealthScore !== undefined) {
        if (typeof entity.ecologicalHealthScore !== 'number' || entity.ecologicalHealthScore < 0 || entity.ecologicalHealthScore > 1) {
          errors.push({ path: 'ecologicalHealthScore', message: 'ecologicalHealthScore must be a number between 0.0 and 1.0', errorCode: 'INVALID_TYPE' });
        }
      }
      break;

    case 'Species':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Species name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (entity.scientificName === undefined || entity.scientificName === null || typeof entity.scientificName !== 'string' || entity.scientificName.trim() === '') {
        warnings.push(`Species '${entity.id || 'unknown'}' is missing a scientificName.`);
      }
      const validStatuses = ['Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient'];
      if (entity.conservationStatus === undefined || entity.conservationStatus === null || !validStatuses.includes(entity.conservationStatus)) {
        warnings.push(`Species '${entity.id || 'unknown'}' is missing a valid conservationStatus.`);
      }
      if (entity.metadata) {
        if (entity.metadata.gbifKey !== undefined && entity.metadata.gbifKey !== null) {
          const key = entity.metadata.gbifKey;
          const isInteger = Number.isInteger(key);
          const isNumericString = typeof key === 'string' && /^\d+$/.test(key);
          const val = isInteger ? key : (isNumericString ? parseInt(key, 10) : -1);
          if (val <= 0) {
            errors.push({
              path: 'metadata.gbifKey',
              message: `Species '${entity.id}' has an invalid GBIF ID: ${key}`,
              errorCode: 'INVALID_GBIF_ID'
            });
          }
        }
        if (entity.metadata.iucnUrl !== undefined && entity.metadata.iucnUrl !== null) {
          const url = entity.metadata.iucnUrl;
          let isUrlValid = true;
          try {
            new URL(url);
          } catch (e) {
            isUrlValid = false;
          }
          if (!isUrlValid || typeof url !== 'string' || !url.startsWith('https://www.iucnredlist.org/')) {
            errors.push({
              path: 'metadata.iucnUrl',
              message: `Species '${entity.id}' has a malformed IUCN URL: ${url}`,
              errorCode: 'INVALID_IUCN_URL'
            });
          }
        }
      }
      break;

    case 'Evidence':
      if (entity.value === undefined) {
        errors.push({ path: 'value', message: 'Evidence value is required', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.metric !== 'string' || entity.metric.trim() === '') {
        errors.push({ path: 'metric', message: 'Evidence metric must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.observedDate !== 'string' || !SEMANTIC_CONSTRAINTS.validateIsoTimestamp(entity.observedDate)) {
        errors.push({ path: 'observedDate', message: 'Evidence observedDate must be a valid ISO 8601 timestamp', errorCode: 'INVALID_TIMESTAMP' });
      }
      break;

    case 'Citation':
      if (typeof entity.title !== 'string' || entity.title.trim() === '') {
        errors.push({ path: 'title', message: 'Citation title must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (!Array.isArray(entity.authors) || entity.authors.length === 0) {
        errors.push({ path: 'authors', message: 'Citation authors must be an array of at least 1 author name string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.publicationYear !== 'number' || entity.publicationYear < 0) {
        errors.push({ path: 'publicationYear', message: 'Citation publicationYear must be a non-negative number', errorCode: 'INVALID_TYPE' });
      }
      break;

    case 'Dataset':
      if (typeof entity.name !== 'string' || entity.name.trim() === '') {
        errors.push({ path: 'name', message: 'Dataset name must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.owner !== 'string' || entity.owner.trim() === '') {
        errors.push({ path: 'owner', message: 'Dataset owner must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.recordCount !== 'number' || entity.recordCount < 0) {
        errors.push({ path: 'recordCount', message: 'Dataset recordCount must be a non-negative integer', errorCode: 'INVALID_TYPE' });
      }
      break;

    case 'Confidence':
      if (typeof entity.score !== 'number' || !SEMANTIC_CONSTRAINTS.validateConfidenceScore(entity.score)) {
        errors.push({ path: 'score', message: 'Confidence score must be a number between 0.0 and 1.0', errorCode: 'INVALID_TYPE' });
      }
      if (!['Low', 'Medium', 'High'].includes(entity.level)) {
        errors.push({ path: 'level', message: 'Confidence level must be Low, Medium, or High', errorCode: 'INVALID_ENUM_VALUE' });
      }
      break;

    case 'SimulationMetadata':
      if (typeof entity.modelName !== 'string' || entity.modelName.trim() === '') {
        errors.push({ path: 'modelName', message: 'Simulation modelName must be a string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.modelVersion !== 'string' || entity.modelVersion.trim() === '') {
        errors.push({ path: 'modelVersion', message: 'Simulation modelVersion must be a string', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.parameters !== 'object' || entity.parameters === null) {
        errors.push({ path: 'parameters', message: 'Simulation parameters must be an object', errorCode: 'MISSING_FIELD' });
      }
      if (typeof entity.executionTimestamp !== 'string' || !SEMANTIC_CONSTRAINTS.validateIsoTimestamp(entity.executionTimestamp)) {
        errors.push({ path: 'executionTimestamp', message: 'Simulation executionTimestamp must be a valid ISO timestamp', errorCode: 'INVALID_TIMESTAMP' });
      }
      if (typeof entity.runId !== 'string' || entity.runId.trim() === '') {
        errors.push({ path: 'runId', message: 'Simulation runId must be a non-empty string', errorCode: 'MISSING_FIELD' });
      }
      break;

    case 'ReasoningMetadata':
      if (!['LLM', 'Rule-based', 'Symbolic', 'Hybrid'].includes(entity.reasoningType)) {
        errors.push({ path: 'reasoningType', message: 'reasoningType must be one of: LLM, Rule-based, Symbolic, Hybrid', errorCode: 'INVALID_ENUM_VALUE' });
      }
      if (!Array.isArray(entity.steps) || entity.steps.length === 0) {
        errors.push({ path: 'steps', message: 'Reasoning steps must be a non-empty array', errorCode: 'MISSING_FIELD' });
      } else {
        entity.steps.forEach((step: any, idx: number) => {
          if (typeof step !== 'object' || step === null) {
            errors.push({ path: `steps[${idx}]`, message: 'Reasoning step must be an object', errorCode: 'INVALID_TYPE' });
          } else {
            if (typeof step.stepNumber !== 'number' || step.stepNumber < 1) {
              errors.push({ path: `steps[${idx}].stepNumber`, message: 'Reasoning stepNumber must be a positive integer', errorCode: 'INVALID_TYPE' });
            }
            if (typeof step.summary !== 'string' || step.summary.trim() === '') {
              errors.push({ path: `steps[${idx}].summary`, message: 'Reasoning step summary must be a non-empty string', errorCode: 'INVALID_TYPE' });
            }
          }
        });
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a single directed Relationship between source and target RCDM entities.
 */
export function validateRelationship(
  source: RCDMEntity,
  relationship: RCDMRelationship,
  target: RCDMEntity
): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!source) {
    errors.push({ path: 'source', message: 'Source entity is required', errorCode: 'MISSING_SOURCE' });
  }
  if (!relationship) {
    errors.push({ path: 'relationship', message: 'Relationship object is required', errorCode: 'MISSING_RELATIONSHIP' });
  }
  if (!target) {
    errors.push({ path: 'target', message: 'Target entity is required', errorCode: 'MISSING_TARGET' });
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  if (relationship.from !== source.id) {
    errors.push({ path: 'relationship.from', message: `Relationship from ID (${relationship.from}) does not match source entity ID (${source.id})`, errorCode: 'ID_MISMATCH' });
  }

  if (relationship.to !== target.id) {
    errors.push({ path: 'relationship.to', message: `Relationship to ID (${relationship.to}) does not match target entity ID (${target.id})`, errorCode: 'ID_MISMATCH' });
  }

  const isAllowed = isRelationshipAllowed(source.type, relationship.relationship, target.type);
  if (!isAllowed) {
    errors.push({
      path: 'relationship.relationship',
      message: `Invalid relationship: Entity type '${source.type}' cannot connect to entity type '${target.type}' via relationship '${relationship.relationship}'`,
      errorCode: 'DISALLOWED_RELATIONSHIP'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a complete graph of entities and relationships conforming to RCDM v1.
 */
export function validateGraph(
  nodes: RCDMEntity[],
  edges: RCDMRelationship[]
): GraphValidationReport {
  const entityReports: Record<string, ValidationReport> = {};
  const relationshipReports: Record<string, ValidationReport> = {};
  const structuralErrors: ValidationError[] = [];
  const warnings: string[] = [];

  const nodeMap = new Map<string, RCDMEntity>();

  // 1. Verify Entity Uniqueness and Validity
  for (const node of nodes) {
    if (!node.id) {
      structuralErrors.push({ path: 'nodes', message: 'Graph node is missing ID field', errorCode: 'MISSING_NODE_ID' });
      continue;
    }

    if (nodeMap.has(node.id)) {
      structuralErrors.push({ path: `nodes.${node.id}`, message: `Duplicate entity ID detected: ${node.id}`, errorCode: 'DUPLICATE_NODE_ID' });
      continue;
    }

    nodeMap.set(node.id, node);
    const report = validateEntity(node);
    entityReports[node.id] = report;
  }

  // 2. Verify Relationships
  for (const edge of edges) {
    if (!edge.id) {
      structuralErrors.push({ path: 'edges', message: 'Graph edge is missing ID field', errorCode: 'MISSING_EDGE_ID' });
      continue;
    }

    const source = nodeMap.get(edge.from);
    const target = nodeMap.get(edge.to);

    if (!source) {
      structuralErrors.push({
        path: `edges.${edge.id}.from`,
        message: `Edge source ID '${edge.from}' cannot be found in node list`,
        errorCode: 'ORPHAN_EDGE_SOURCE'
      });
    }

    if (!target) {
      structuralErrors.push({
        path: `edges.${edge.id}.to`,
        message: `Edge target ID '${edge.to}' cannot be found in node list`,
        errorCode: 'ORPHAN_EDGE_TARGET'
      });
    }

    if (source && target) {
      const report = validateRelationship(source, edge, target);
      relationshipReports[edge.id] = report;
    }
  }

  // 3. Compile aggregate validity
  let isValid = structuralErrors.length === 0;

  for (const rep of Object.values(entityReports)) {
    if (!rep.isValid) isValid = false;
  }

  for (const rep of Object.values(relationshipReports)) {
    if (!rep.isValid) isValid = false;
  }

  return {
    isValid,
    entityReports,
    relationshipReports,
    structuralErrors,
    warnings
  };
}
