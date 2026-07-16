import type { RCDMRelationship } from '../types';
import relationshipsJson from '../datasets/relationships.json';

export class RelationshipNormalizer {
  static normalize(rel: RCDMRelationship): any {
    return {
      id: rel.id,
      from: rel.from,
      to: rel.to,
      relationship: rel.relationship,
      version: rel.version,
      confidence: rel.confidence?.score ?? 1.0,
      provenance: rel.provenance
    };
  }

  static normalizeAll(): any[] {
    return (relationshipsJson as RCDMRelationship[]).map(rel => this.normalize(rel));
  }
}
