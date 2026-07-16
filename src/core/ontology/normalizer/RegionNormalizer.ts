import type { RegionRecord } from '../../../core/environment/intelligence/types';
import type { RegionEntity } from '../types';
import regionsJson from '../datasets/regions/regions.json';
import relationshipsJson from '../datasets/relationships.json';

export class RegionNormalizer {
  static normalize(entity: RegionEntity): RegionRecord {
    const belongsRel = (relationshipsJson as any[])
      .find(r => r.from === entity.id && r.relationship === 'belongsTo');

    return {
      id: entity.id,
      name: entity.name,
      state: entity.stateOrProvince || '',
      watershedId: belongsRel ? belongsRel.to : ''
    };
  }

  static normalizeAll(): RegionRecord[] {
    return (regionsJson as RegionEntity[]).map(entity => this.normalize(entity));
  }
}
