/**
 * Ripple Canonical Data Model (RCDM) - Ontology v1 TypeScript Definitions
 * 
 * Freeze Date: 2026-07-15
 * Everything Ripple builds must conform to these interfaces.
 */

export interface ProvenanceInfo {
  creator: string;
  created: string; // ISO 8601 Date String
  updated?: string; // ISO 8601 Date String
  sourceSystem: string;
  lineage?: string[]; // Array of IDs representing source records
}

export interface ConfidenceValue {
  score?: number; // Normalized certainty (0.0 to 1.0)
  confidenceEntityId?: string; // Reference to a Confidence entity
  level?: 'Low' | 'Medium' | 'High';
}

/**
 * Base interface for every entity in the Ripple Canonical Data Model.
 */
export interface RCDMBaseEntity {
  id: string; // Universal ID (UUID or URI)
  type: string; // Entity type discriminator (matching the class name)
  version: string; // Ontology/schema version (e.g. "1.0.0")
  confidence: ConfidenceValue; // Certainty metrics or reference
  provenance: ProvenanceInfo; // Lineage and audit information
  citations: string[]; // Universal IDs of Citation entities
  lastVerified: string; // ISO 8601 timestamp of last domain validation
  notes?: string; // Human annotations or expert notes
  metadata: Record<string, any>; // Key-value store for extensible parameters
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  boundaryPolygon?: { latitude: number; longitude: number }[];
}

export interface ReasoningStep {
  stepNumber: number;
  summary: string;
  detail?: string;
}

// ==========================================
// 1. Food Entity
// ==========================================
export interface FoodEntity extends RCDMBaseEntity {
  type: 'Food';
  name: string;
  description?: string;
  brandOrSource?: string;
  category?: string; // e.g., 'Beverage', 'Grain', 'Produce', 'Prepared Meal'
}

// ==========================================
// 2. Ingredient Entity
// ==========================================
export interface IngredientEntity extends RCDMBaseEntity {
  type: 'Ingredient';
  name: string;
  category: string; // e.g., 'Legume', 'Sweetener', 'Preservative', 'Starch'
  aliases?: string[]; // Standardized aliases for resolver lookup
  isKeyComponent?: boolean; // True if it determines environmental profiles
}

// ==========================================
// 3. Crop Entity
// ==========================================
export interface CropEntity extends RCDMBaseEntity {
  type: 'Crop';
  name: string;
  scientificName: string;
  variety?: string;
  growingSeason?: string; // e.g., 'Summer', 'Kharif', 'Rabi'
}

// ==========================================
// 4. Region Entity
// ==========================================
export interface RegionEntity extends RCDMBaseEntity {
  type: 'Region';
  name: string;
  country: string;
  stateOrProvince?: string;
  coordinates?: Coordinates;
}

// ==========================================
// 5. Watershed Entity
// ==========================================
export interface WatershedEntity extends RCDMBaseEntity {
  type: 'Watershed';
  name: string;
  riverSystem: string;
  basinAreaSqKm?: number;
  dischargeRate?: number; // Average annual discharge in m3/s
}

// ==========================================
// 6. Habitat Entity
// ==========================================
export interface HabitatEntity extends RCDMBaseEntity {
  type: 'Habitat';
  name: string;
  classification: string; // e.g., 'Wetlands', 'Grasslands', 'Forests', 'Plains'
  ecologicalHealthScore?: number; // 0.0 to 1.0 index of habitat integrity
}

// ==========================================
// 7. Species Entity
// ==========================================
export interface SpeciesEntity extends RCDMBaseEntity {
  type: 'Species';
  name: string;
  scientificName: string;
  conservationStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern' | 'Data Deficient';
  trophicLevel?: string; // e.g., 'Keystone Pollinator', 'Primary Producer'
}

// ==========================================
// 8. Evidence Entity
// ==========================================
export interface EvidenceEntity extends RCDMBaseEntity {
  type: 'Evidence';
  value: any; // Dynamic measured value (numeric, boolean, or category)
  metric: string; // e.g., 'water_footprint_m3_per_ton', 'nitrogen_runoff_ppm'
  observedDate: string; // ISO 8601 Date of collection
  methodology?: string; // e.g., 'Life Cycle Assessment (LCA)', 'Field Sensor'
}

// ==========================================
// 9. Citation Entity
// ==========================================
export interface CitationEntity extends RCDMBaseEntity {
  type: 'Citation';
  title: string;
  authors: string[];
  journalOrPublisher?: string;
  publicationYear: number;
  doi?: string;
  url?: string;
}

// ==========================================
// 10. Dataset Entity
// ==========================================
export interface DatasetEntity extends RCDMBaseEntity {
  type: 'Dataset';
  name: string;
  description?: string;
  license?: string;
  owner: string;
  recordCount: number;
}

// ==========================================
// 11. Confidence Entity
// ==========================================
export interface ConfidenceEntity extends RCDMBaseEntity {
  type: 'Confidence';
  score: number; // 0.0 to 1.0 range
  level: 'Low' | 'Medium' | 'High';
  methodology?: string;
  evaluator?: string;
}

// ==========================================
// 12. SimulationMetadata Entity
// ==========================================
export interface SimulationMetadataEntity extends RCDMBaseEntity {
  type: 'SimulationMetadata';
  modelName: string;
  modelVersion: string;
  parameters: Record<string, any>;
  executionTimestamp: string;
  runId: string;
}

// ==========================================
// 13. ReasoningMetadata Entity
// ==========================================
export interface ReasoningMetadataEntity extends RCDMBaseEntity {
  type: 'ReasoningMetadata';
  reasoningType: 'LLM' | 'Rule-based' | 'Symbolic' | 'Hybrid';
  steps: ReasoningStep[];
  modelUsed?: string;
  promptTemplate?: string;
}

/**
 * Union type representing any entity within the RCDM.
 */
export type RCDMEntity =
  | FoodEntity
  | IngredientEntity
  | CropEntity
  | RegionEntity
  | WatershedEntity
  | HabitatEntity
  | SpeciesEntity
  | EvidenceEntity
  | CitationEntity
  | DatasetEntity
  | ConfidenceEntity
  | SimulationMetadataEntity
  | ReasoningMetadataEntity;

export type RCDMEntityType = RCDMEntity['type'];

// ==========================================
// Relationships
// ==========================================
export type RelationshipType =
  | 'contains'      // e.g. Food -> Ingredient, Watershed -> Habitat, Dataset -> Entity
  | 'derivedFrom'   // e.g. Ingredient -> Crop, Dataset -> Evidence, Crop -> Crop
  | 'cultivatedIn'  // e.g. Crop -> Region
  | 'belongsTo'     // e.g. Region -> Watershed, Habitat -> Watershed
  | 'supports'      // e.g. Habitat -> Species, Watershed -> Species
  | 'observedIn'    // e.g. Species -> Habitat, Evidence -> Region
  | 'documentedBy'  // e.g. Crop -> Evidence, Species -> Evidence
  | 'references'    // e.g. Evidence -> Citation, Citation -> Citation
  | 'derivedUsing'  // e.g. Evidence -> SimulationMetadata/ReasoningMetadata
  | 'simulatedBy'   // e.g. Evidence -> SimulationMetadata
  | 'explainedBy';  // e.g. Evidence -> ReasoningMetadata, Confidence -> ReasoningMetadata

export interface RCDMRelationship {
  id: string; // Universal ID (UUID or URI)
  from: string; // Source Node ID
  to: string; // Target Node ID
  relationship: RelationshipType;
  version: string; // Version of relationship ontology (e.g. "1.0.0")
  confidence?: ConfidenceValue;
  provenance?: ProvenanceInfo;
  metadata?: Record<string, any>;
}
