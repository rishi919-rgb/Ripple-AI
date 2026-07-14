import type {
  FoodRecord,
  IngredientRecord,
  CropRecord,
  RegionRecord,
  WatershedRecord,
  HabitatRecord,
  SpeciesRecord
} from './types';

/**
 * DatasetLoader loads and caches local environment datasets.
 * It is structured to permit future file system / API integrations without changes to query structures.
 */
export class DatasetLoader {
  private cache: Map<string, any> = new Map();

  // --- MOCK DATABASE RECORDS ---
  private static readonly FOODS: FoodRecord[] = [
    { id: 'meal-dosa', name: 'Masala Dosa', ingredients: ['Rice flour', 'Potato filling', 'Coconut chutney'] },
    { id: 'meal-samosa', name: 'Samosa', ingredients: ['Potato stuffing', 'Wheat flour', 'Spices'] },
    { id: 'meal-burger', name: 'Veggie Burger', ingredients: ['Wheat bun', 'Potato patty', 'Tomato slice'] },
    { id: 'meal-salad', name: 'Healthy Salad Bowl', ingredients: ['Mixed Greens', 'Tomato slice', 'Olive oil'] }
  ];

  private static readonly INGREDIENTS: IngredientRecord[] = [
    { id: 'ing-rice-flour', name: 'Rice flour', category: 'Grain', aliases: ['rice', 'rice flour', 'basmati rice'], derivedFromCropId: 'crop-rice' },
    { id: 'ing-wheat-flour', name: 'Wheat flour', category: 'Grain', aliases: ['wheat', 'wheat flour', 'flour', 'wheat bun', 'dough', 'bread'], derivedFromCropId: 'crop-wheat' },
    { id: 'ing-potato-filling', name: 'Potato filling', category: 'Tuber', aliases: ['potato', 'potato filling', 'potato stuffing', 'potato patty', 'french fries'], derivedFromCropId: 'crop-potato' },
    { id: 'ing-coconut-chutney', name: 'Coconut chutney', category: 'Oilseed', aliases: ['coconut', 'coconut chutney', 'chutney'], derivedFromCropId: 'crop-coconut' },
    { id: 'ing-tomato-slice', name: 'Tomato slice', category: 'Fruit', aliases: ['tomato', 'tomato slice', 'tomatoes'], derivedFromCropId: 'crop-tomato' },
    { id: 'ing-mixed-greens', name: 'Mixed Greens', category: 'Leafy', aliases: ['mixed greens', 'greens', 'salad', 'lettuce', 'spinach', 'basil'], derivedFromCropId: 'crop-greens' },
    { id: 'ing-olive-oil', name: 'Olive oil', category: 'Oil', aliases: ['olive oil', 'oil', 'dressing'], derivedFromCropId: 'crop-olive' },
    { id: 'ing-spices', name: 'Spices', category: 'Herb', aliases: ['spices', 'chilli', 'turmeric', 'ginger'], derivedFromCropId: 'crop-spices' }
  ];

  private static readonly CROPS: CropRecord[] = [
    { id: 'crop-rice', name: 'Rice Crop', scientificName: 'Oryza sativa', cultivatedInRegionIds: ['reg-punjab'] },
    { id: 'crop-wheat', name: 'Wheat Crop', scientificName: 'Triticum aestivum', cultivatedInRegionIds: ['reg-haryana'] },
    { id: 'crop-potato', name: 'Potato Crop', scientificName: 'Solanum tuberosum', cultivatedInRegionIds: ['reg-up'] },
    { id: 'crop-coconut', name: 'Coconut Palm', scientificName: 'Cocos nucifera', cultivatedInRegionIds: ['reg-karnataka'] },
    { id: 'crop-tomato', name: 'Tomato Crop', scientificName: 'Solanum lycopersicum', cultivatedInRegionIds: ['reg-maharashtra'] },
    { id: 'crop-greens', name: 'Wild Lettuce Crop', scientificName: 'Lactuca sativa', cultivatedInRegionIds: ['reg-karnataka'] },
    { id: 'crop-olive', name: 'Olive Tree', scientificName: 'Olea europaea', cultivatedInRegionIds: ['reg-maharashtra'] },
    { id: 'crop-spices', name: 'Ginger & Herbs', scientificName: 'Zingiber officinale', cultivatedInRegionIds: ['reg-karnataka'] }
  ];

  private static readonly REGIONS: RegionRecord[] = [
    { id: 'reg-punjab', name: 'Punjab Plains', state: 'Punjab', watershedId: 'ws-indus' },
    { id: 'reg-haryana', name: 'Haryana Dry Grid', state: 'Haryana', watershedId: 'ws-indus' },
    { id: 'reg-up', name: 'Indo-Gangetic Central Bed', state: 'Uttar Pradesh', watershedId: 'ws-ganga' },
    { id: 'reg-karnataka', name: 'Western Ghats Riparian Corridor', state: 'Karnataka', watershedId: 'ws-cauvery' },
    { id: 'reg-maharashtra', name: 'Deccan Drylands', state: 'Maharashtra', watershedId: 'ws-sabarmati' }
  ];

  private static readonly WATERSHEDS: WatershedRecord[] = [
    { id: 'ws-indus', name: 'Indus Basin', riverSystem: 'Indus River System', areaSqKm: '321,289', habitats: ['hab-plains'] },
    { id: 'ws-ganga', name: 'Ganga Basin', riverSystem: 'Ganga River System', areaSqKm: '861,452', habitats: ['hab-wetlands'] },
    { id: 'ws-cauvery', name: 'Cauvery Basin', riverSystem: 'Cauvery River System', areaSqKm: '81,155', habitats: ['hab-forests'] },
    { id: 'ws-sabarmati', name: 'Sabarmati Basin', riverSystem: 'Sabarmati River System', areaSqKm: '21,674', habitats: ['hab-grasslands'] }
  ];

  private static readonly HABITATS: HabitatRecord[] = [
    { 
      id: 'hab-plains', 
      name: 'Agricultural Plains', 
      description: 'Monoculture agrarian lands structured around artificial canal systems and high crop outputs.',
      features: ['Monoculture grids', 'Canal irrigation', 'Fertilizer washouts'],
      iconName: 'Wheat',
      supportedSpeciesIds: ['sp-owl', 'sp-bee', 'sp-beetle']
    },
    { 
      id: 'hab-wetlands', 
      name: 'Wetlands', 
      description: 'Biodiverse swampy floodplains acting as natural silt filters for agricultural runoff.',
      features: ['Reedy marshlands', 'Seasonally flooded soil', 'High water retention'],
      iconName: 'Waves',
      supportedSpeciesIds: ['sp-dolphin', 'sp-otter', 'sp-crane']
    },
    { 
      id: 'hab-forests', 
      name: 'Forests', 
      description: 'Deciduous riverine canopies buffering catchment banks against rain erosion.',
      features: ['Dense canopy cover', 'Riparian corridors', 'Leaf-litter soil'],
      iconName: 'Trees',
      supportedSpeciesIds: ['sp-elephant', 'sp-tahr', 'sp-thrush']
    },
    { 
      id: 'hab-grasslands', 
      name: 'Grasslands', 
      description: 'Arid savannah grasslands adapted to porous soils and low rainfall drafts.',
      features: ['Scrub vegetation', 'Porous sandy soils', 'Seasonal grass cover'],
      iconName: 'Compass',
      supportedSpeciesIds: ['sp-bustard', 'sp-blackbuck', 'sp-mongoose']
    }
  ];

  private static readonly SPECIES: SpeciesRecord[] = [
    // Plains
    { id: 'sp-owl', name: 'Common Barn Owl', scientificName: 'Tyto alba', status: 'Least Concern', description: 'Keystone nocturnal raptor managing agricultural rodent populations.', role: 'Trophic pest regulation' },
    { id: 'sp-bee', name: 'Dwarf Honeybee', scientificName: 'Apis florea', status: 'Least Concern', description: 'Wild pollinator crucial for fertilizing crops and local flora.', role: 'Pollination and flora propagation' },
    { id: 'sp-beetle', name: 'Scarab Beetle', scientificName: 'Scarabaeus sacer', status: 'Least Concern', description: 'Dung decomposer aerating soils and recycling crop root nutrients.', role: 'Soil aeration and nutrient cycling' },
    // Wetlands
    { id: 'sp-dolphin', name: 'Gangetic Dolphin', scientificName: 'Platanista gangetica', status: 'Endangered', description: 'Apex riverine mammal displaying chemical health of Ganga basin.', role: 'Apex aquatic trophic indicator' },
    { id: 'sp-otter', name: 'Smooth-coated Otter', scientificName: 'Lutrogale perspicillata', status: 'Vulnerable', description: 'Marshland predator keeping invasive bottom-feeding fish balanced.', role: 'Silt and marshland trophic regulation' },
    { id: 'sp-crane', name: 'Sarus Crane', scientificName: 'Grus antigone', status: 'Vulnerable', description: 'Tall marsh bird indicator of shallow wetlands soil saturation.', role: 'Marshland vegetation indicator' },
    // Forests
    { id: 'sp-elephant', name: 'Indian Elephant', scientificName: 'Elephas maximus', status: 'Endangered', description: 'Deciduous forest architect dispersing hard seeds and making forest trails.', role: 'Agroforestry architect' },
    { id: 'sp-tahr', name: 'Nilgiri Tahr', scientificName: 'Nilgiritragus hylocrius', status: 'Endangered', description: 'Ungulate grazing high cliffs, acting as scrub-fire buffer.', role: 'Alpine forest fire buffer' },
    { id: 'sp-thrush', name: 'Malabar Whistling Thrush', scientificName: 'Myophonus horsfieldii', status: 'Least Concern', description: 'Riparian insectivore controlling damp-soil forest pests.', role: 'Wet forest insect control' },
    // Grasslands
    { id: 'sp-bustard', name: 'Great Indian Bustard', scientificName: 'Ardeotis nigriceps', status: 'Critically Endangered', description: 'Rare grassland bird highly vulnerable to high-power wires.', role: 'Dry grassland indicator species' },
    { id: 'sp-blackbuck', name: 'Blackbuck', scientificName: 'Antilope cervicapra', status: 'Least Concern', description: 'Fast herbivore grazing grass layers to promote new seed shoots.', role: 'Scrubland grazing balance' },
    { id: 'sp-mongoose', name: 'Indian Grey Mongoose', scientificName: 'Urva edwardsii', status: 'Least Concern', description: 'Active predator hunting rodents and crop-eating insect swarms.', role: 'Grassland pest control' }
  ];

  constructor() {}

  /**
   * Loads the complete Foods dataset. Caches results for future queries.
   */
  async loadFoods(): Promise<FoodRecord[]> {
    if (this.cache.has('foods')) return this.cache.get('foods');
    const data = [...DatasetLoader.FOODS];
    this.cache.set('foods', data);
    return data;
  }

  /**
   * Loads the complete Ingredients dataset. Caches results.
   */
  async loadIngredients(): Promise<IngredientRecord[]> {
    if (this.cache.has('ingredients')) return this.cache.get('ingredients');
    const data = [...DatasetLoader.INGREDIENTS];
    this.cache.set('ingredients', data);
    return data;
  }

  /**
   * Loads the complete Crops dataset. Caches results.
   */
  async loadCrops(): Promise<CropRecord[]> {
    if (this.cache.has('crops')) return this.cache.get('crops');
    const data = [...DatasetLoader.CROPS];
    this.cache.set('crops', data);
    return data;
  }

  /**
   * Loads the complete Regions dataset. Caches results.
   */
  async loadRegions(): Promise<RegionRecord[]> {
    if (this.cache.has('regions')) return this.cache.get('regions');
    const data = [...DatasetLoader.REGIONS];
    this.cache.set('regions', data);
    return data;
  }

  /**
   * Loads the complete Watersheds dataset. Caches results.
   */
  async loadWatersheds(): Promise<WatershedRecord[]> {
    if (this.cache.has('watersheds')) return this.cache.get('watersheds');
    const data = [...DatasetLoader.WATERSHEDS];
    this.cache.set('watersheds', data);
    return data;
  }

  /**
   * Loads the complete Habitats dataset. Caches results.
   */
  async loadHabitats(): Promise<HabitatRecord[]> {
    if (this.cache.has('habitats')) return this.cache.get('habitats');
    const data = [...DatasetLoader.HABITATS];
    this.cache.set('habitats', data);
    return data;
  }

  /**
   * Loads the complete Species dataset. Caches results.
   */
  async loadSpecies(): Promise<SpeciesRecord[]> {
    if (this.cache.has('species')) return this.cache.get('species');
    const data = [...DatasetLoader.SPECIES];
    this.cache.set('species', data);
    return data;
  }
}
