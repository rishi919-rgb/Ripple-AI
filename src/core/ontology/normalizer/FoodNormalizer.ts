import type { FoodRecord } from '../../../core/environment/intelligence/types';
import type { FoodEntity } from '../types';
import foodsJson from '../datasets/foods/foods.json';
import ingredientsJson from '../datasets/ingredients/ingredients.json';
import relationshipsJson from '../datasets/relationships.json';

export class FoodNormalizer {
  static normalize(entity: FoodEntity): FoodRecord {
    const ingredientIds = (relationshipsJson as any[])
      .filter(r => r.from === entity.id && r.relationship === 'contains')
      .map(r => r.to);

    const ingredients = ingredientIds.map(id => {
      const ing = (ingredientsJson as any[]).find(i => i.id === id);
      return ing ? ing.name : id;
    });

    return {
      id: entity.id,
      name: entity.name,
      ingredients,
      description: entity.description
    };
  }

  static normalizeAll(): FoodRecord[] {
    return (foodsJson as FoodEntity[]).map(entity => this.normalize(entity));
  }
}
