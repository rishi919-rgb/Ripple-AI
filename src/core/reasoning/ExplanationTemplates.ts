import type { ReasoningSectionType, ExplanationFormat } from './types';

/**
 * Textual metadata descriptors for sections in different formats.
 */
export interface SectionTemplate {
  header: string;
  prefix: string;
}

export const EXPLANATION_TEMPLATES: Record<
  ExplanationFormat,
  Record<ReasoningSectionType, SectionTemplate>
> = {
  SCIENTIFIC: {
    OBSERVATION: {
      header: '1. SPECIMEN OBSERVATION & IDENTIFICATION ASSESSMENT',
      prefix: 'Evaluation of target dietary subject: '
    },
    CONTEXT: {
      header: '2. GEOGRAPHIC SUPPLY CHAIN & CONTEXT RECONSTRUCTION',
      prefix: 'Trophic flow analysis mapping cultivation supply paths: '
    },
    EVIDENCE: {
      header: '3. SYSTEMATIC EMPIRICAL EVIDENCE & TELEMETRY CITATIONS',
      prefix: 'Bibliographic entries tracing observations to registered scientific databases: '
    },
    SIMULATION: {
      header: '4. SCENARIO PROPAGATION & ATTENUATION TELEMETRY',
      prefix: 'Forward pressure calculations cascading consumption modifications: '
    },
    CONCLUSION: {
      header: '5. CAUSAL CONVERSION SUMMARY & CONCLUSION',
      prefix: 'Aggregated ecosystem outcomes calculated from model coefficients: '
    },
    CONFIDENCE: {
      header: '6. STATISTICAL CONFIDENCE & ERROR LIMIT BOUNDS',
      prefix: 'Calculated reliability values mapping source precision indexes: '
    },
    LIMITATIONS: {
      header: '7. METHODOLOGICAL LIMITATIONS & DISCLAIMERS',
      prefix: 'Scientific boundaries of active simulation datasets: '
    }
  },
  JUDGE: {
    OBSERVATION: {
      header: 'WHAT SPECIES WE SPOTTED',
      prefix: 'We took a look at the specimen: '
    },
    CONTEXT: {
      header: 'HOW IT CONNECTS TO NATURE',
      prefix: 'This observation is tied back to the natural world like this: '
    },
    EVIDENCE: {
      header: 'THE SCIENCE BEHIND IT',
      prefix: 'Here is the scientific evidence verifying these claims: '
    },
    SIMULATION: {
      header: 'WHAT HAPPPENS IF WE SWITCH IT',
      prefix: 'We simulated making a change: '
    },
    CONCLUSION: {
      header: 'WHAT IT MEANS FOR OUR ECOSYSTEMS',
      prefix: 'In short: '
    },
    CONFIDENCE: {
      header: 'HOW SURE ARE WE?',
      prefix: 'How sure are we of these connections? '
    },
    LIMITATIONS: {
      header: 'THINGS TO KEEP IN MIND',
      prefix: 'Scientific boundaries: '
    }
  },
  TECHNICAL: {
    OBSERVATION: {
      header: '[RAW_TELEMETRY::OBSERVATION]',
      prefix: 'OBS_SPECIMEN_ID: '
    },
    CONTEXT: {
      header: '[RAW_TELEMETRY::ECG_RECONSTRUCTION]',
      prefix: 'ECG_NODES_PATH_TRACE: '
    },
    EVIDENCE: {
      header: '[RAW_TELEMETRY::BIBLIOGRAPHY_PROVENANCE]',
      prefix: 'EE_STORE_QUERY_RECORDS: '
    },
    SIMULATION: {
      header: '[RAW_TELEMETRY::ERE_PRESSURE_ATTENUATION]',
      prefix: 'ERE_SIMULATION_DELTA_WAVES: '
    },
    CONCLUSION: {
      header: '[RAW_TELEMETRY::CONCLUSION_REPORT]',
      prefix: 'SYSTEM_PRESSURE_DELTA_SUM: '
    },
    CONFIDENCE: {
      header: '[RAW_TELEMETRY::CONFIDENCE_VECTORS]',
      prefix: 'MEAN_SYSTEM_CONFIDENCE_VEC: '
    },
    LIMITATIONS: {
      header: '[RAW_TELEMETRY::SYSTEM_LIMITATION_BOUNDS]',
      prefix: 'DISCLAIMER_MATRIX: '
    }
  }
};
