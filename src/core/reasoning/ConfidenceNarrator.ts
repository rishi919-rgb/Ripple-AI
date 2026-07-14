import type { ExplanationFormat } from './types';

/**
 * ConfidenceNarrator compiles textual descriptions of credibility scores.
 */
export class ConfidenceNarrator {
  constructor() {}

  /**
   * Narrates the system trust index based on the format mode.
   * 
   * @param avgConfidence Mean system confidence coefficient (0.0 to 1.0).
   * @param format Formatting mode (Scientific, Judge, Technical).
   */
  static narrate(avgConfidence: number, format: ExplanationFormat): string {
    const percent = Math.round(avgConfidence * 100);
    let qualitativeText = 'Medium';
    if (avgConfidence >= 0.90) qualitativeText = 'Highly Reliable';
    else if (avgConfidence >= 0.80) qualitativeText = 'Solid';
    else if (avgConfidence < 0.70) qualitativeText = 'Inferred / Baseline Estimate';

    switch (format) {
      case 'SCIENTIFIC':
        return `The overall system confidence score is calculated at ${avgConfidence.toFixed(4)} (${percent}%), which qualifies as "${qualitativeText}" under standardized reliability thresholds. 
- Source reliability vectors are weighted based on source quality registries (e.g. IUCN Red List weight = 0.98, FAOSTAT weight = 0.94, GBIF weight = 0.88).
- Mapping precision is calculated based on binomial nomenclature alias resolutions.
- Propagation calculations utilize these parameters as attenuation thresholds: NewPressure = OldPressure + (Delta * EdgeWeight * Confidence).`;

      case 'JUDGE':
        return `We have a ${percent}% confidence rating in these connections. This means our data is "${qualitativeText.toLowerCase()}" and comes from established databases like the IUCN Red List and the United Nations FAO database. We use these ratings to make sure our simulation weights are as accurate as possible, ensuring that we do not make unsupported environmental claims.`;

      case 'TECHNICAL':
        return `SYS_MEAN_CONFIDENCE: ${avgConfidence.toFixed(6)}
SYS_QUALITATIVE_INDEX: "${qualitativeText.toUpperCase()}"
SOURCE_WEIGHT_REGISTRY: [IUCN: 0.98, FAOSTAT: 0.94, WATER_FOOTPRINT: 0.92, WRIS: 0.90, GBIF: 0.88, ICAR: 0.95, OPEN_METEO: 0.85]
MAPPING_PRECISION_VECTOR: EXACT_binomial_alias_match
PROPAGATION_ATTENUATION_COEFFICIENT: active_edge_confidence_scaling`;
    }
  }
}
export default ConfidenceNarrator;
