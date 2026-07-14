import { DatasetLoader } from './DatasetLoader';
import type { 
  FoodRecord, 
  IngredientRecord, 
  CropRecord, 
  RegionRecord, 
  SpeciesRecord 
} from './types';

/**
 * EntityResolver canonicalizes user inputs into database records.
 * Compares inputs against exact names, fuzzy partials, and registered aliases.
 */
export class EntityResolver {
  private loader: DatasetLoader;

  constructor(loader: DatasetLoader) {
    this.loader = loader;
  }

  /**
   * Normalizes and attempts to match a user input meal name to a FoodRecord.
   * 
   * @param inputName User query meal name.
   */
  async resolveFood(inputName: string): Promise<FoodRecord | null> {
    const foods = await this.loader.loadFoods();
    const clean = inputName.trim().toLowerCase();

    // 1. Exact Match
    let matched = foods.find(f => f.name.toLowerCase() === clean);
    if (matched) return matched;

    // 2. Fuzzy Partial Match
    matched = foods.find(f => f.name.toLowerCase().includes(clean) || clean.includes(f.name.toLowerCase()));
    if (matched) return matched;

    return null;
  }

  /**
   * Resolves a query ingredient string to a canonical IngredientRecord by inspecting aliases.
   * 
   * @param inputName Query ingredient name.
   */
  async resolveIngredient(inputName: string): Promise<IngredientRecord | null> {
    const ingredients = await this.loader.loadIngredients();
    const clean = inputName.trim().toLowerCase();

    // 1. Check exact name
    let matched = ingredients.find(ing => ing.name.toLowerCase() === clean);
    if (matched) return matched;

    // 2. Check registered aliases
    matched = ingredients.find(ing => 
      ing.aliases.some(alias => alias.toLowerCase() === clean || clean.includes(alias.toLowerCase()))
    );
    if (matched) return matched;

    return null;
  }

  /**
   * Resolves a crop by name.
   * 
   * @param cropName Crop node query name.
   */
  async resolveCrop(cropName: string): Promise<CropRecord | null> {
    const crops = await this.loader.loadCrops();
    const clean = cropName.trim().toLowerCase();

    return crops.find(c => 
      c.name.toLowerCase() === clean || 
      c.scientificName.toLowerCase() === clean || 
      c.name.toLowerCase().includes(clean)
    ) || null;
  }

  /**
   * Resolves a region by state or district name.
   * 
   * @param regionName Regional query name.
   */
  async resolveRegion(regionName: string): Promise<RegionRecord | null> {
    const regions = await this.loader.loadRegions();
    const clean = regionName.trim().toLowerCase();

    return regions.find(r => 
      r.name.toLowerCase() === clean || 
      r.state.toLowerCase() === clean || 
      r.name.toLowerCase().includes(clean) ||
      clean.includes(r.state.toLowerCase())
    ) || null;
  }

  /**
   * Resolves a species by name or scientific designation.
   * 
   * @param speciesName Species query.
   */
  async resolveSpecies(speciesName: string): Promise<SpeciesRecord | null> {
    const species = await this.loader.loadSpecies();
    const clean = speciesName.trim().toLowerCase();

    return species.find(s => 
      s.name.toLowerCase() === clean || 
      s.scientificName.toLowerCase() === clean ||
      s.name.toLowerCase().includes(clean) ||
      s.scientificName.toLowerCase().includes(clean)
    ) || null;
  }
}
export default EntityResolver;
