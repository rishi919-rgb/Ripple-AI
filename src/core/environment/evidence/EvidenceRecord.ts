import type { EvidenceRecord as IEvidenceRecord, EvidenceSourceType } from './types';

/**
 * Concrete class representation of an EvidenceRecord for environmental validations.
 */
export class EvidenceRecord implements IEvidenceRecord {
  id: string;
  statement: string;
  entityId: string;
  source: EvidenceSourceType | string;
  dataset: string;
  url: string;
  citation: string;
  retrievedAt: string;
  confidence: number;
  quality: number;
  notes?: string;

  constructor(data: IEvidenceRecord) {
    this.id = data.id;
    this.statement = data.statement;
    this.entityId = data.entityId;
    this.source = data.source;
    this.dataset = data.dataset;
    this.url = data.url;
    this.citation = data.citation;
    this.retrievedAt = data.retrievedAt;
    this.confidence = data.confidence;
    this.quality = data.quality;
    this.notes = data.notes;
  }
}
export default EvidenceRecord;
