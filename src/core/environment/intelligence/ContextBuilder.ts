import { GraphBuilder } from '../graph/GraphBuilder';
import { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import { DatasetLoader } from './DatasetLoader';
import { EntityResolver } from './EntityResolver';
import { GraphMapper } from './GraphMapper';

/**
 * ContextBuilder orchestrates the mapping chain from physical inputs to ecological nodes,
 * constructing a unified EnvironmentalGraph.
 */
export class ContextBuilder {
  private loader: DatasetLoader;
  private resolver: EntityResolver;
  private mapper: GraphMapper;

  constructor(loader: DatasetLoader, resolver: EntityResolver, mapper: GraphMapper) {
    this.loader = loader;
    this.resolver = resolver;
    this.mapper = mapper;
  }

  /**
   * Generates a fully populated ECG beginning with a Meal and custom ingredients.
   * 
   * @param mealName Name of the meal.
   * @param ingredients List of ingredient names and ratios.
   */
  async buildMealContext(
    mealName: string, 
    ingredients?: { name: string; percentage: number }[]
  ): Promise<EnvironmentalGraph> {
    const builder = new GraphBuilder();
    
    // 1. Resolve Meal
    const foodRecord = await this.resolver.resolveFood(mealName) || {
      id: `meal-${mealName.toLowerCase().replace(/\s+/g, '-')}`,
      name: mealName,
      ingredients: ingredients?.map(i => i.name) || []
    };
    this.mapper.mapMeal(builder, foodRecord);

    // Get ingredients to map
    const ingredientsToMap = ingredients && ingredients.length > 0
      ? ingredients.map(i => i.name)
      : foodRecord.ingredients;

    // 2. Loop through and map each ingredient recursively
    for (const ingName of ingredientsToMap) {
      const ingRecord = await this.resolver.resolveIngredient(ingName);
      if (!ingRecord) {
        // Fallback placeholder node to ensure no orphans/broken branches
        const fallbackIngId = `ing-${ingName.toLowerCase().replace(/\s+/g, '-')}`;
        builder.addIngredient(fallbackIngId, ingName);
        this.mapper.connect(builder, foodRecord.id, fallbackIngId, 'CONTAINS');
        continue;
      }

      this.mapper.mapIngredient(builder, ingRecord);
      this.mapper.connect(builder, foodRecord.id, ingRecord.id, 'CONTAINS');

      // 3. Map Crops
      const cropRecord = await this.resolver.resolveCrop(ingRecord.derivedFromCropId) || 
                         await this.loader.loadCrops().then(crops => crops.find(c => c.id === ingRecord.derivedFromCropId));
      if (!cropRecord) continue;

      this.mapper.mapCrop(builder, cropRecord);
      this.mapper.connect(builder, ingRecord.id, cropRecord.id, 'DERIVED_FROM');

      // 4. Map Regions
      for (const regionId of cropRecord.cultivatedInRegionIds) {
        const regionRecord = await this.loader.loadRegions().then(regions => regions.find(r => r.id === regionId));
        if (!regionRecord) continue;

        this.mapper.mapRegion(builder, regionRecord);
        this.mapper.connect(builder, cropRecord.id, regionRecord.id, 'CULTIVATED_IN');

        // 5. Map Watersheds
        const watershedRecord = await this.loader.loadWatersheds().then(ws => ws.find(w => w.id === regionRecord.watershedId));
        if (!watershedRecord) continue;

        this.mapper.mapWatershed(builder, watershedRecord);
        this.mapper.connect(builder, regionRecord.id, watershedRecord.id, 'BELONGS_TO');

        // 6. Map Habitats
        for (const habitatId of watershedRecord.habitats) {
          const habitatRecord = await this.loader.loadHabitats().then(habs => habs.find(h => h.id === habitatId));
          if (!habitatRecord) continue;

          this.mapper.mapHabitat(builder, habitatRecord);
          this.mapper.connect(builder, watershedRecord.id, habitatRecord.id, 'CONTAINS_HABITAT');

          // 7. Map Species
          for (const speciesId of habitatRecord.supportedSpeciesIds) {
            const speciesRecord = await this.loader.loadSpecies().then(species => species.find(s => s.id === speciesId));
            if (!speciesRecord) continue;

            this.mapper.mapSpecies(builder, speciesRecord);
            this.mapper.connect(builder, habitatRecord.id, speciesRecord.id, 'SUPPORTS');
          }
        }
      }
    }

    return builder.build();
  }

  /**
   * Generates a sub-hierarchy beginning from a single Ingredient.
   */
  async buildIngredientContext(ingredientName: string): Promise<EnvironmentalGraph> {
    const builder = new GraphBuilder();
    const ingRecord = await this.resolver.resolveIngredient(ingredientName);
    if (!ingRecord) {
      const fallbackIngId = `ing-${ingredientName.toLowerCase().replace(/\s+/g, '-')}`;
      builder.addIngredient(fallbackIngId, ingredientName);
      return builder.build();
    }

    this.mapper.mapIngredient(builder, ingRecord);

    const cropRecord = await this.loader.loadCrops().then(crops => crops.find(c => c.id === ingRecord.derivedFromCropId));
    if (cropRecord) {
      this.mapper.mapCrop(builder, cropRecord);
      this.mapper.connect(builder, ingRecord.id, cropRecord.id, 'DERIVED_FROM');

      for (const regionId of cropRecord.cultivatedInRegionIds) {
        const regionRecord = await this.loader.loadRegions().then(regions => regions.find(r => r.id === regionId));
        if (!regionRecord) continue;

        this.mapper.mapRegion(builder, regionRecord);
        this.mapper.connect(builder, cropRecord.id, regionRecord.id, 'CULTIVATED_IN');

        const watershedRecord = await this.loader.loadWatersheds().then(ws => ws.find(w => w.id === regionRecord.watershedId));
        if (!watershedRecord) continue;

        this.mapper.mapWatershed(builder, watershedRecord);
        this.mapper.connect(builder, regionRecord.id, watershedRecord.id, 'BELONGS_TO');
      }
    }

    return builder.build();
  }

  /**
   * Generates a sub-hierarchy beginning from a Region.
   */
  async buildRegionContext(regionName: string): Promise<EnvironmentalGraph> {
    const builder = new GraphBuilder();
    const regionRecord = await this.resolver.resolveRegion(regionName);
    if (!regionRecord) return builder.build();

    this.mapper.mapRegion(builder, regionRecord);

    const watershedRecord = await this.loader.loadWatersheds().then(ws => ws.find(w => w.id === regionRecord.watershedId));
    if (watershedRecord) {
      this.mapper.mapWatershed(builder, watershedRecord);
      this.mapper.connect(builder, regionRecord.id, watershedRecord.id, 'BELONGS_TO');

      for (const habitatId of watershedRecord.habitats) {
        const habitatRecord = await this.loader.loadHabitats().then(habs => habs.find(h => h.id === habitatId));
        if (!habitatRecord) continue;

        this.mapper.mapHabitat(builder, habitatRecord);
        this.mapper.connect(builder, watershedRecord.id, habitatRecord.id, 'CONTAINS_HABITAT');
      }
    }

    return builder.build();
  }

  /**
   * Generates a simple context linking a Species to its supported Ecosystem Habitat.
   */
  async buildSpeciesContext(speciesName: string): Promise<EnvironmentalGraph> {
    const builder = new GraphBuilder();
    const speciesRecord = await this.resolver.resolveSpecies(speciesName);
    if (!speciesRecord) return builder.build();

    this.mapper.mapSpecies(builder, speciesRecord);

    // Trace back to the habitat that supports this species
    const habitats = await this.loader.loadHabitats();
    const supportingHabitat = habitats.find(h => h.supportedSpeciesIds.includes(speciesRecord.id));
    if (supportingHabitat) {
      this.mapper.mapHabitat(builder, supportingHabitat);
      this.mapper.connect(builder, supportingHabitat.id, speciesRecord.id, 'SUPPORTS');
    }

    return builder.build();
  }
}
export default ContextBuilder;
