import type { HabitatRecord } from '../../../core/environment/intelligence/types';
import type { HabitatEntity } from '../types';
import habitatsJson from '../datasets/habitats/habitats.json';
import relationshipsJson from '../datasets/relationships.json';

export class HabitatNormalizer {
  static normalize(entity: HabitatEntity): HabitatRecord {
    const lowerName = entity.name.toLowerCase();
    let name: 'Wetlands' | 'Grasslands' | 'Agricultural Plains' | 'Forests' = 'Agricultural Plains';
    let iconName = 'Wheat';
    let features: string[] = [];

    if (lowerName.includes('wetland')) {
      name = 'Wetlands';
      iconName = 'Waves';
      features = ['Reedy marshlands', 'Seasonally flooded soil', 'High water retention'];
    } else if (lowerName.includes('grassland')) {
      name = 'Grasslands';
      iconName = 'Compass';
      features = ['Scrub vegetation', 'Porous sandy soils', 'Seasonal grass cover'];
    } else if (lowerName.includes('forest')) {
      name = 'Forests';
      iconName = 'Trees';
      features = ['Dense canopy cover', 'Riparian corridors', 'Leaf-litter soil'];
    } else {
      name = 'Agricultural Plains';
      iconName = 'Wheat';
      features = ['Monoculture grids', 'Canal irrigation', 'Fertilizer washouts'];
    }

    const supportedSpeciesIds = (relationshipsJson as any[])
      .filter(r => r.from === entity.id && r.relationship === 'supports')
      .map(r => r.to);

    return {
      id: entity.id,
      name,
      description: entity.classification,
      features,
      iconName,
      supportedSpeciesIds
    };
  }

  static normalizeAll(): HabitatRecord[] {
    return (habitatsJson as HabitatEntity[]).map(entity => this.normalize(entity));
  }
}
