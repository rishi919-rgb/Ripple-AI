/**
 * Standard environmental and biological telemetry sources.
 */
export type EvidenceSourceType =
  | 'GBIF'                     // Global Biodiversity Information Facility
  | 'IUCN'                     // International Union for Conservation of Nature
  | 'WRIS'                     // Water Resources Information System
  | 'WATER_FOOTPRINT_NETWORK'  // Water Footprint Network
  | 'FAOSTAT'                  // Food and Agriculture Organization Corporate Statistical Database
  | 'ICAR'                     // Indian Council of Agricultural Research
  | 'OPEN_METEO';              // Climate and Meteorological databases

/**
 * Represents a single reference citation validating an environmental node, property, or link.
 */
export interface EvidenceRecord {
  /** Unique identifier for the evidence entry. */
  id: string;
  /** Direct statement or scientific finding proven by this evidence. */
  statement: string;
  /** Node ID or Edge ID this evidence validates. */
  entityId: string;
  /** Categorized evidence provider. */
  source: EvidenceSourceType | string;
  /** Specific dataset code or database reference name. */
  dataset: string;
  /** Access URL link for public citation. */
  url: string;
  /** Full academic or institutional citation string. */
  citation: string;
  /** ISO Date stamp when the observation telemetry was pulled. */
  retrievedAt: string;
  /** Est. confidence of this record (0.0 to 1.0). */
  confidence: number;
  /** Baseline quality/trustworthiness of the database provider (0.0 to 1.0). */
  quality: number;
  /** Additional annotation details. */
  notes?: string;
}
