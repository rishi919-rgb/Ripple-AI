import type { EvidenceSourceType } from './types';

/**
 * Metadata configuration for a registered evidence source.
 */
export interface SourceMetadata {
  name: string;
  reliabilityWeight: number; // Quality index between 0.0 and 1.0
  description: string;
}

/**
 * Registry of environmental database metadata.
 */
export const EVIDENCE_SOURCE_REGISTRY: Record<EvidenceSourceType, SourceMetadata> = {
  GBIF: {
    name: 'Global Biodiversity Information Facility',
    reliabilityWeight: 0.88,
    description: 'International open data infrastructure providing species occurrence records gathered via global telemetry logs.'
  },
  IUCN: {
    name: 'International Union for Conservation of Nature',
    reliabilityWeight: 0.98,
    description: 'Global standard for species conservation status assessment and extinction risks.'
  },
  WRIS: {
    name: 'Water Resources Information System',
    reliabilityWeight: 0.90,
    description: 'National and international hydrologic database tracing river discharges, water tables, and basin areas.'
  },
  WATER_FOOTPRINT_NETWORK: {
    name: 'Water Footprint Network',
    reliabilityWeight: 0.92,
    description: 'Scientific authority calculating blue, green, and grey agricultural water footprints.'
  },
  FAOSTAT: {
    name: 'FAOSTAT Database',
    reliabilityWeight: 0.94,
    description: 'United Nations Food and Agriculture Organization database compiling international crop production grids.'
  },
  ICAR: {
    name: 'Indian Council of Agricultural Research',
    reliabilityWeight: 0.95,
    description: 'Agronomy research council providing crop yield and soil profile databases for the Indian subcontinent.'
  },
  OPEN_METEO: {
    name: 'Open-Meteo Meteorological Database',
    reliabilityWeight: 0.85,
    description: 'Climatic database providing precipitation tables and meteorological logs.'
  }
};

/**
 * Returns the baseline quality coefficient for an evidence source.
 * 
 * @param source Target source category identifier.
 */
export function getSourceQuality(source: EvidenceSourceType | string): number {
  const normalized = source.toUpperCase() as EvidenceSourceType;
  if (normalized in EVIDENCE_SOURCE_REGISTRY) {
    return EVIDENCE_SOURCE_REGISTRY[normalized].reliabilityWeight;
  }
  return 0.75; // Fallback baseline quality for third-party estimates
}
