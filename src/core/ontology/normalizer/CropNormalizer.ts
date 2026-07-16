import type { CropRecord } from '../../../core/environment/intelligence/types';
import type { CropEntity } from '../types';
import cropsJson from '../datasets/crops/crops.json';
import relationshipsJson from '../datasets/relationships.json';

export class CropNormalizer {
  static normalize(entity: CropEntity): CropRecord {
    const cultivatedInRegionIds = (relationshipsJson as any[])
      .filter(r => r.from === entity.id && r.relationship === 'cultivatedIn')
      .map(r => r.to);

    return {
      id: entity.id,
      name: entity.name,
      scientificName: entity.scientificName,
      cultivatedInRegionIds
    };
  }

  static normalizeAll(): CropRecord[] {
    return (cropsJson as CropEntity[]).map(entity => this.normalize(entity));
  }
}
