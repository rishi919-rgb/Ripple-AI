import type { IngredientRecord } from '../../../core/environment/intelligence/types';
import type { IngredientEntity } from '../types';
import ingredientsJson from '../datasets/ingredients/ingredients.json';
import relationshipsJson from '../datasets/relationships.json';

export class IngredientNormalizer {
  static normalize(entity: IngredientEntity): IngredientRecord {
    const derivedRel = (relationshipsJson as any[])
      .find(r => r.from === entity.id && r.relationship === 'derivedFrom');

    return {
      id: entity.id,
      name: entity.name,
      category: entity.category,
      aliases: entity.aliases || [],
      derivedFromCropId: derivedRel ? derivedRel.to : ''
    };
  }

  static normalizeAll(): IngredientRecord[] {
    return (ingredientsJson as IngredientEntity[]).map(entity => this.normalize(entity));
  }
}
