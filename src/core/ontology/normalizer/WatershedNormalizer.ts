import type { WatershedRecord } from '../../../core/environment/intelligence/types';
import type { WatershedEntity } from '../types';
import watershedsJson from '../datasets/watersheds/watersheds.json';
import relationshipsJson from '../datasets/relationships.json';

export class WatershedNormalizer {
  static normalize(entity: WatershedEntity): WatershedRecord {
    const areaStr = entity.basinAreaSqKm 
      ? entity.basinAreaSqKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
      : '';

    const habitats = (relationshipsJson as any[])
      .filter(r => r.from === entity.id && r.relationship === 'contains')
      .map(r => r.to);

    return {
      id: entity.id,
      name: entity.name,
      riverSystem: entity.riverSystem,
      areaSqKm: areaStr,
      habitats,
      stressIndex: entity.metadata?.stressIndex ?? 0.0,
      metadata: entity.metadata
    };
  }

  static normalizeAll(): WatershedRecord[] {
    return (watershedsJson as WatershedEntity[]).map(entity => this.normalize(entity));
  }
}
