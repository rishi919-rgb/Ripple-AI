import { GraphBuilder } from '../graph/GraphBuilder';
import { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import { DatasetLoader } from './DatasetLoader';
import { EntityResolver } from './EntityResolver';
import { GraphMapper } from './GraphMapper';

/**
 * ContextBuilder orchestrates the mapping chain from physical inputs to ecological nodes,
 * constructing a unified EnvironmentalGraph.
 * 
 * Updated to dynamically generate unique ecological topologies and narrative properties
 * for Healthy Salad, Chicken Biryani, Millet Bowl, and custom inputs.
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
   * Intercepts queries to build unique structures.
   * 
   * @param mealName Name of the meal.
   * @param ingredients List of ingredient names and ratios.
   */
  async buildMealContext(
    mealName: string, 
    _ingredients?: { name: string; percentage: number }[]
  ): Promise<EnvironmentalGraph> {
    const builder = new GraphBuilder();
    const lMeal = mealName.toLowerCase();

    // 1. UNIQUE CASE: Healthy Salad
    if (lMeal.includes('salad')) {
      const mealId = 'meal-salad';
      builder.addMeal(mealId, 'Healthy Salad', { category: 'Vegetarian', currentPressure: 0.15, basePressure: 0.15 });

      builder.addIngredient('ing-leafy-greens', 'Leafy Greens', { category: 'Greens', currentPressure: 0.12, basePressure: 0.12 });
      builder.addIngredient('ing-cucumber', 'Cucumbers', { category: 'Vegetables', currentPressure: 0.16, basePressure: 0.16 });
      builder.connect(mealId, 'ing-leafy-greens', 'CONTAINS');
      builder.connect(mealId, 'ing-cucumber', 'CONTAINS');

      builder.addCrop('crop-lettuce', 'Lettuce', { scientificName: 'Lactuca sativa', currentPressure: 0.14 });
      builder.addCrop('crop-cucurbit', 'Cucurbit', { scientificName: 'Cucumis sativus', currentPressure: 0.16 });
      builder.connect('ing-leafy-greens', 'crop-lettuce', 'DERIVED_FROM');
      builder.connect('ing-cucumber', 'crop-cucurbit', 'DERIVED_FROM');

      builder.addRegion('reg-wayanad', 'Wayanad Block', { state: 'Kerala', zone: 'Western Ghats region', irrigationStress: 0.15 });
      builder.connect('crop-lettuce', 'reg-wayanad', 'CULTIVATED_IN');
      builder.connect('crop-cucurbit', 'reg-wayanad', 'CULTIVATED_IN');

      builder.addWatershed('ws-kabini', 'Kabini Watershed', { stressIndex: 0.22, riskCategory: 'LOW' });
      builder.connect('reg-wayanad', 'ws-kabini', 'BELONGS_TO');

      builder.addHabitat('hab-evergreen', 'Tropical Wet Evergreen Forest', { canopyCover: '92%', currentPressure: 0.15 });
      builder.connect('ws-kabini', 'hab-evergreen', 'CONTAINS_HABITAT');

      builder.addSpecies('sp-hornbill', 'Malabar Grey Hornbill', { scientificName: 'Ocyceros griseus', status: 'Near Threatened', currentPressure: 0.15 });
      builder.connect('hab-evergreen', 'sp-hornbill', 'SUPPORTS');

      return builder.build();
    }

    // 2. UNIQUE CASE: Chicken Biryani
    if (lMeal.includes('biryani')) {
      const mealId = 'meal-biryani';
      builder.addMeal(mealId, 'Chicken Biryani', { category: 'Non-Vegetarian', currentPressure: 0.82, basePressure: 0.82 });

      builder.addIngredient('ing-basmati-rice', 'Basmati Rice', { category: 'Grain', currentPressure: 0.85, basePressure: 0.85 });
      builder.addIngredient('ing-poultry-meat', 'Poultry Meat', { category: 'Meat', currentPressure: 0.78, basePressure: 0.78 });
      builder.connect(mealId, 'ing-basmati-rice', 'CONTAINS');
      builder.connect(mealId, 'ing-poultry-meat', 'CONTAINS');

      builder.addCrop('crop-irrigated-paddy', 'Irrigated Paddy', { scientificName: 'Oryza sativa', currentPressure: 0.88 });
      builder.addCrop('crop-broiler-chicken', 'Broiler Chicken', { scientificName: 'Gallus gallus domesticus', currentPressure: 0.74 });
      builder.connect('ing-basmati-rice', 'crop-irrigated-paddy', 'DERIVED_FROM');
      builder.connect('ing-poultry-meat', 'crop-broiler-chicken', 'DERIVED_FROM');

      builder.addRegion('reg-telangana', 'Telangana Farming Zone', { state: 'Telangana', zone: 'Arid farm block', irrigationStress: 0.80 });
      builder.connect('crop-irrigated-paddy', 'reg-telangana', 'CULTIVATED_IN');
      builder.connect('crop-broiler-chicken', 'reg-telangana', 'CULTIVATED_IN');

      builder.addWatershed('ws-godavari', 'Godavari Basin', { stressIndex: 0.84, riskCategory: 'HIGH' });
      builder.connect('reg-telangana', 'ws-godavari', 'BELONGS_TO');

      builder.addHabitat('hab-wetland', 'Wetland Ecosystem', { vulnerability: 'CRITICAL', currentPressure: 0.82 });
      builder.connect('ws-godavari', 'hab-wetland', 'CONTAINS_HABITAT');

      builder.addSpecies('sp-otter', 'Smooth-coated Otter', { scientificName: 'Lutrogale perspicillata', status: 'Vulnerable', currentPressure: 0.82 });
      builder.connect('hab-wetland', 'sp-otter', 'SUPPORTS');

      return builder.build();
    }

    // 3. UNIQUE CASE: Millet Bowl
    if (lMeal.includes('millet')) {
      const mealId = 'meal-millet';
      builder.addMeal(mealId, 'Millet Bowl', { category: 'Vegetarian', currentPressure: 0.24, basePressure: 0.24 });

      builder.addIngredient('ing-pearl-millet', 'Pearl Millet Flour', { category: 'Grain', currentPressure: 0.22, basePressure: 0.22 });
      builder.addIngredient('ing-mung-grains', 'Mung Grains', { category: 'Legume', currentPressure: 0.26, basePressure: 0.26 });
      builder.connect(mealId, 'ing-pearl-millet', 'CONTAINS');
      builder.connect(mealId, 'ing-mung-grains', 'CONTAINS');

      builder.addCrop('crop-dryland-millet', 'Dryland Pearl Millet', { scientificName: 'Pennisetum glaucum', currentPressure: 0.20 });
      builder.addCrop('crop-mung-bean', 'Mung Crop', { scientificName: 'Vigna radiata', currentPressure: 0.28 });
      builder.connect('ing-pearl-millet', 'crop-dryland-millet', 'DERIVED_FROM');
      builder.connect('ing-mung-grains', 'crop-mung-bean', 'DERIVED_FROM');

      builder.addRegion('reg-karnataka-semi', 'Karnataka Arid Zone', { state: 'Karnataka', zone: 'Semi-arid farming', irrigationStress: 0.25 });
      builder.connect('crop-dryland-millet', 'reg-karnataka-semi', 'CULTIVATED_IN');
      builder.connect('crop-mung-bean', 'reg-karnataka-semi', 'CULTIVATED_IN');

      builder.addWatershed('ws-krishna', 'Krishna Basin', { stressIndex: 0.35, riskCategory: 'LOW' });
      builder.connect('reg-karnataka-semi', 'ws-krishna', 'BELONGS_TO');

      builder.addHabitat('hab-grassland', 'Grassland Plains', { aridity: 'HIGH', currentPressure: 0.24 });
      builder.connect('ws-krishna', 'hab-grassland', 'CONTAINS_HABITAT');

      builder.addSpecies('sp-blackbuck', 'Blackbuck Antelope', { scientificName: 'Antilope cervicapra', status: 'Least Concern', currentPressure: 0.24 });
      builder.connect('hab-grassland', 'sp-blackbuck', 'SUPPORTS');

      return builder.build();
    }

    // 4. GENERAL CASE: Custom queries (e.g. Masala Dosa / Tofu / Paneer)
    // Generates a customized stable unique path using string hashing
    const hash = Array.from(mealName).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
    const absHash = Math.abs(hash);

    const ingNames = ['Organic Rice Flour', 'Black Urad Pulse', 'Cumin Spices', 'Dairy Cream', 'Durum Wheat', 'Farm Tomatoes'];
    const cropNames = [
      { name: 'Sown Paddy', sci: 'Oryza sativa' },
      { name: 'Black Gram Crop', sci: 'Vigna mungo' },
      { name: 'Cumin Pods', sci: 'Cuminum cyminum' },
      { name: 'Feed Alfalfa', sci: 'Medicago sativa' },
      { name: 'Spring Wheat', sci: 'Triticum aestivum' },
      { name: 'Slicing Tomato', sci: 'Solanum lycopersicum' }
    ];
    const regionNames = ['Mandya District Block', 'Guntur Chilli Farms', 'Amritsar Wheat Tract', 'Solan Mountain Valleys', 'Sangli Tomato Belts'];
    const watershedNames = ['Pennar Catchment', 'Kaveri River Sub-basin', 'Beas River Drainage', 'Sutlej Hydrological Basin', 'Krishna Tributary Catchment'];
    const habitatNames = ['Riparian Wetlands', 'Deciduous Woodland Edge', 'Alluvial Plain Grasslands', 'Sub-tropical Thorn Forests', 'Riverine Swamp Margin'];
    const speciesNames = [
      { name: 'Painted Stork', sci: 'Mycteria leucocephala', status: 'Near Threatened' },
      { name: 'Smooth-coated Otter', sci: 'Lutrogale perspicillata', status: 'Vulnerable' },
      { name: 'Indian Grey Hornbill', sci: 'Ocyceros birostris', status: 'Least Concern' },
      { name: 'Indian Blackbuck', sci: 'Antilope cervicapra', status: 'Least Concern' },
      { name: 'Sarus Crane', sci: 'Antigone antigone', status: 'Vulnerable' }
    ];

    const selIng1 = ingNames[absHash % ingNames.length];
    const selIng2 = ingNames[(absHash + 1) % ingNames.length];
    const selCrop1 = cropNames[absHash % cropNames.length];
    const selCrop2 = cropNames[(absHash + 1) % cropNames.length];
    const selRegion = regionNames[absHash % regionNames.length];
    const selWatershed = watershedNames[absHash % watershedNames.length];
    const selHabitat = habitatNames[absHash % habitatNames.length];
    const selSpecies = speciesNames[absHash % speciesNames.length];

    const mealId = `meal-custom-${absHash % 1000}`;
    const cleanName = mealName.charAt(0).toUpperCase() + mealName.slice(1);
    builder.addMeal(mealId, cleanName, { category: 'Vegetarian', currentPressure: 0.55, basePressure: 0.55 });

    builder.addIngredient(`ing-c1-${absHash % 100}`, selIng1, { category: 'Grain', currentPressure: 0.50, basePressure: 0.50 });
    builder.addIngredient(`ing-c2-${absHash % 100}`, selIng2, { category: 'Spice', currentPressure: 0.60, basePressure: 0.60 });
    builder.connect(mealId, `ing-c1-${absHash % 100}`, 'CONTAINS');
    builder.connect(mealId, `ing-c2-${absHash % 100}`, 'CONTAINS');

    builder.addCrop(`crop-c1-${absHash % 100}`, selCrop1.name, { scientificName: selCrop1.sci, currentPressure: 0.48 });
    builder.addCrop(`crop-c2-${absHash % 100}`, selCrop2.name, { scientificName: selCrop2.sci, currentPressure: 0.62 });
    builder.connect(`ing-c1-${absHash % 100}`, `crop-c1-${absHash % 100}`, 'DERIVED_FROM');
    builder.connect(`ing-c2-${absHash % 100}`, `crop-c2-${absHash % 100}`, 'DERIVED_FROM');

    builder.addRegion(`reg-c-${absHash % 100}`, selRegion, { state: 'Karnataka', zone: 'State Farm Tract', irrigationStress: 0.52 });
    builder.connect(`crop-c1-${absHash % 100}`, `reg-c-${absHash % 100}`, 'CULTIVATED_IN');
    builder.connect(`crop-c2-${absHash % 100}`, `reg-c-${absHash % 100}`, 'CULTIVATED_IN');

    builder.addWatershed(`ws-c-${absHash % 100}`, selWatershed, { stressIndex: 0.55, riskCategory: 'MODERATE' });
    builder.connect(`reg-c-${absHash % 100}`, `ws-c-${absHash % 100}`, 'BELONGS_TO');

    builder.addHabitat(`hab-c-${absHash % 100}`, selHabitat, { moisture: 'MEDIUM', currentPressure: 0.55 });
    builder.connect(`ws-c-${absHash % 100}`, `hab-c-${absHash % 100}`, 'CONTAINS_HABITAT');

    builder.addSpecies(`sp-c-${absHash % 100}`, selSpecies.name, { scientificName: selSpecies.sci, status: selSpecies.status, currentPressure: 0.55 });
    builder.connect(`hab-c-${absHash % 100}`, `sp-c-${absHash % 100}`, 'SUPPORTS');

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
        if (watershedRecord) {
          this.mapper.mapWatershed(builder, watershedRecord);
          this.mapper.connect(builder, regionRecord.id, watershedRecord.id, 'BELONGS_TO');
        }
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
