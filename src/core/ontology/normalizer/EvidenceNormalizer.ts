import type { EvidenceEntity } from '../types';
import evidenceJson from '../datasets/evidence/evidence.json';

export class EvidenceNormalizer {
  static normalize(entity: EvidenceEntity): any {
    return {
      id: entity.id,
      type: entity.type,
      value: entity.value,
      metric: entity.metric,
      observedDate: entity.observedDate,
      methodology: entity.methodology,
      citations: entity.citations || [],
      confidence: entity.confidence?.score ?? 0.8,
      provenance: entity.provenance
    };
  }

  static normalizeAll(): any[] {
    return (evidenceJson as EvidenceEntity[]).map(entity => this.normalize(entity));
  }
}
