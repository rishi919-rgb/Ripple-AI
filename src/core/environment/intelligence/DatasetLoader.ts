import type {
  FoodRecord,
  IngredientRecord,
  CropRecord,
  RegionRecord,
  WatershedRecord,
  HabitatRecord,
  SpeciesRecord
} from './types';
import { validateKnowledgeBase } from '../../ontology/validation';
import {
  FoodNormalizer,
  IngredientNormalizer,
  CropNormalizer,
  RegionNormalizer,
  WatershedNormalizer,
  HabitatNormalizer,
  SpeciesNormalizer
} from '../../ontology/normalizer';

/**
 * DatasetLoader loads and caches local environment datasets.
 * It is structured to permit future file system / API integrations without changes to query structures.
 */
export class DatasetLoader {
  private cache: Map<string, any> = new Map();

  constructor() {
    // 5. Startup Validation
    validateKnowledgeBase();
  }

  /**
   * Loads the complete Foods dataset. Caches results for future queries.
   */
  async loadFoods(): Promise<FoodRecord[]> {
    if (this.cache.has('foods')) return this.cache.get('foods');
    const data = FoodNormalizer.normalizeAll();
    this.cache.set('foods', data);
    return data;
  }

  /**
   * Loads the complete Ingredients dataset. Caches results.
   */
  async loadIngredients(): Promise<IngredientRecord[]> {
    if (this.cache.has('ingredients')) return this.cache.get('ingredients');
    const data = IngredientNormalizer.normalizeAll();
    this.cache.set('ingredients', data);
    return data;
  }

  /**
   * Loads the complete Crops dataset. Caches results.
   */
  async loadCrops(): Promise<CropRecord[]> {
    if (this.cache.has('crops')) return this.cache.get('crops');
    const data = CropNormalizer.normalizeAll();
    this.cache.set('crops', data);
    return data;
  }

  /**
   * Loads the complete Regions dataset. Caches results.
   */
  async loadRegions(): Promise<RegionRecord[]> {
    if (this.cache.has('regions')) return this.cache.get('regions');
    const data = RegionNormalizer.normalizeAll();
    this.cache.set('regions', data);
    return data;
  }

  /**
   * Loads the complete Watersheds dataset. Caches results.
   */
  async loadWatersheds(): Promise<WatershedRecord[]> {
    if (this.cache.has('watersheds')) return this.cache.get('watersheds');
    const data = WatershedNormalizer.normalizeAll();
    this.cache.set('watersheds', data);
    return data;
  }

  /**
   * Loads the complete Habitats dataset. Caches results.
   */
  async loadHabitats(): Promise<HabitatRecord[]> {
    if (this.cache.has('habitats')) return this.cache.get('habitats');
    const data = HabitatNormalizer.normalizeAll();
    this.cache.set('habitats', data);
    return data;
  }

  /**
   * Loads the complete Species dataset. Caches results.
   */
  async loadSpecies(): Promise<SpeciesRecord[]> {
    if (this.cache.has('species')) return this.cache.get('species');
    const data = SpeciesNormalizer.normalizeAll();
    this.cache.set('species', data);
    return data;
  }
}
