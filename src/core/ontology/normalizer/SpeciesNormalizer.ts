import type { SpeciesRecord } from '../../../core/environment/intelligence/types';
import type { SpeciesEntity } from '../types';
import speciesJson from '../datasets/species/species.json';

export class SpeciesNormalizer {
  static normalize(entity: SpeciesEntity): SpeciesRecord {
    const status = ['Critically Endangered', 'Endangered', 'Vulnerable', 'Least Concern']
      .includes(entity.conservationStatus)
      ? (entity.conservationStatus as any)
      : 'Least Concern';

    return {
      id: entity.id,
      name: entity.name,
      scientificName: entity.scientificName,
      status,
      description: entity.notes || `A native species: ${entity.name} (${entity.scientificName}) plays a key role as a ${entity.trophicLevel || 'ecological indicator'}.`,
      role: entity.trophicLevel || 'Ecological indicator',
      metadata: entity.metadata
    } as any;
  }

  static normalizeAll(): SpeciesRecord[] {
    return (speciesJson as SpeciesEntity[]).map(entity => this.normalize(entity));
  }
}
