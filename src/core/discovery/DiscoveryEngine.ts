import type { MealIngredient } from '@/types/meal';

export interface OriginData {
  ingredient: string;
  state: string;
  description: string;
}

export interface WatershedData {
  name: string;
  region: string;
  area: string;
  description: string;
}

export interface HabitatData {
  name: 'Wetlands' | 'Grasslands' | 'Agricultural Plains' | 'Forests';
  description: string;
  features: string[];
  iconName: string;
}

export interface SpeciesData {
  name: string;
  scientificName: string;
  status: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Least Concern';
  description: string;
  role: string;
}

export interface StageDetails {
  mealName: string;
  ingredients: MealIngredient[];
  origins: OriginData[];
  watershed: WatershedData;
  habitat: HabitatData;
  speciesList: SpeciesData[];
}

export class DiscoveryEngine {
  static getStageDetails(mealName: string, ingredients: MealIngredient[]): StageDetails {
    const primaryIngredient = ingredients[0]?.name.toLowerCase() || 'generic';

    // 1. Dynamic Origin Mapping
    const origins: OriginData[] = ingredients.map((ing) => {
      const name = ing.name.toLowerCase();
      if (name.includes('rice') || name.includes('millet')) {
        return {
          ingredient: ing.name,
          state: 'Punjab',
          description: 'Cultivated in the alluvial plains under extensive canal irrigation networks.'
        };
      } else if (name.includes('wheat') || name.includes('dough') || name.includes('bread')) {
        return {
          ingredient: ing.name,
          state: 'Haryana',
          description: 'Produced in highly mechanized crop rotation grids of northern India.'
        };
      } else if (name.includes('potato') || name.includes('potato filling') || name.includes('onion') || name.includes('tomato')) {
        return {
          ingredient: ing.name,
          state: 'Uttar Pradesh',
          description: 'Harvested from the fertile soil beds of the central Indo-Gangetic belt.'
        };
      } else if (name.includes('cheese') || name.includes('milk') || name.includes('dairy') || name.includes('mozzarella')) {
        return {
          ingredient: ing.name,
          state: 'Gujarat',
          description: 'Sourced from the extensive pastoral dairy cooperatives of western India.'
        };
      } else if (name.includes('coconut') || name.includes('chutney') || name.includes('basil') || name.includes('oil')) {
        return {
          ingredient: ing.name,
          state: 'Karnataka',
          description: 'Harvested from coastal plantation groves and agroforestry tracts.'
        };
      }
      return {
        ingredient: ing.name,
        state: 'Maharashtra',
        description: 'Sourced from dryland agriculture regions in the Deccan Plateau.'
      };
    });

    // 2. Dynamic Watershed Mapping
    let watershed: WatershedData = {
      name: 'Indus Basin',
      region: 'North-Western Catchment',
      area: '321,289 sq km (Indian territory)',
      description: 'Fed by major glacial melt rivers, this watershed supports dense irrigation systems but faces critical groundwater depletion.'
    };

    if (primaryIngredient.includes('potato') || primaryIngredient.includes('onion') || primaryIngredient.includes('tomato') || primaryIngredient.includes('vegetable')) {
      watershed = {
        name: 'Ganga Basin',
        region: 'Central-Eastern Catchment',
        area: '861,452 sq km',
        description: 'The largest river basin in India, draining fertile plains and hosting massive agricultural runoff load.'
      };
    } else if (primaryIngredient.includes('coconut') || primaryIngredient.includes('basil') || primaryIngredient.includes('salad')) {
      watershed = {
        name: 'Cauvery Basin',
        region: 'Southern Peninsula Catchment',
        area: '81,155 sq km',
        description: 'Draining the Western Ghats into southern plains, this basin experiences heavy water stress and seasonal flow conflicts.'
      };
    } else if (primaryIngredient.includes('cheese') || primaryIngredient.includes('milk')) {
      watershed = {
        name: 'Sabarmati Basin',
        region: 'Western Dry Catchment',
        area: '21,674 sq km',
        description: 'An arid Peninsular basin draining into the Gulf of Khambhat, severely affected by industrial discharge and urban drafts.'
      };
    }

    // 3. Dynamic Habitat Mapping
    let habitat: HabitatData = {
      name: 'Agricultural Plains',
      description: 'Highly modified ecosystems dominated by monoculture crop grids, artificial fertilizers, and dense irrigation canals.',
      features: ['Monoculture grids', 'Irrigation canals', 'Silt-heavy runoff'],
      iconName: 'Wheat'
    };

    if (watershed.name === 'Ganga Basin') {
      habitat = {
        name: 'Wetlands',
        description: 'Biodiverse swampy floodplains, lagoons, and riverine marshlands filtering heavy runoff before it merges downstream.',
        features: ['Reedy marshlands', 'Seasonally flooded silt', 'High water retention'],
        iconName: 'Waves'
      };
    } else if (watershed.name === 'Cauvery Basin') {
      habitat = {
        name: 'Forests',
        description: 'Tropical moist and dry deciduous canopy covers lining riparian corridors, buffering river banks against flash erosion.',
        features: ['Dense canopy cover', 'Riparian forest corridors', 'Leaf-litter soil filters'],
        iconName: 'Trees'
      };
    } else if (watershed.name === 'Sabarmati Basin') {
      habitat = {
        name: 'Grasslands',
        description: 'Semi-arid savannah grasses and scrublands supporting deep-root vegetation adapted to low rainfall.',
        features: ['Scrub vegetation', 'Highly porous sandy soils', 'Seasonal grass cover'],
        iconName: 'Compass'
      };
    }

    // 4. Dynamic Species Mapping
    let speciesList: SpeciesData[] = [];
    if (habitat.name === 'Agricultural Plains') {
      speciesList = [
        {
          name: 'Common Barn Owl',
          scientificName: 'Tyto alba',
          status: 'Least Concern',
          description: 'Keystone nocturnal predator controlling rodent densities in crop fields without chemicals.',
          role: 'Trophic pest regulation'
        },
        {
          name: 'Dwarf Honeybee',
          scientificName: 'Apis florea',
          status: 'Least Concern',
          description: 'Wild pollinator essential for the fertilization of both wild flora and agricultural crops.',
          role: 'Pollination and flora propagation'
        },
        {
          name: 'Scarab Beetle',
          scientificName: 'Scarabaeus sacer',
          status: 'Least Concern',
          description: 'Decomposer that recycles organic waste, aerating soil layers and improving crop root hydration.',
          role: 'Soil aeration and nutrient cycling'
        }
      ];
    } else if (habitat.name === 'Wetlands') {
      speciesList = [
        {
          name: 'Gangetic Dolphin',
          scientificName: 'Platanista gangetica',
          status: 'Endangered',
          description: 'Apex blind cetacean whose population densities reflect the chemical oxygen demand of the Ganga watershed.',
          role: 'Apex aquatic trophic health indicator'
        },
        {
          name: 'Smooth-coated Otter',
          scientificName: 'Lutrogale perspicillata',
          status: 'Vulnerable',
          description: 'Riparian predator maintaining balance by foraging on invasive bottom-feeding fish.',
          role: 'Silt and marshland trophic regulation'
        },
        {
          name: 'Sarus Crane',
          scientificName: 'Grus antigone',
          status: 'Vulnerable',
          description: 'The world\'s tallest flying bird, nesting exclusively in shallow wetland marshlands.',
          role: 'Marshland vegetation indicator'
        }
      ];
    } else if (habitat.name === 'Forests') {
      speciesList = [
        {
          name: 'Indian Elephant',
          scientificName: 'Elephas maximus',
          status: 'Endangered',
          description: 'Megaherbivore acting as a forest engineer by clearing pathways and propagating hard-shelled seeds.',
          role: 'Agroforestry architect'
        },
        {
          name: 'Nilgiri Tahr',
          scientificName: 'Nilgiritragus hylocrius',
          status: 'Endangered',
          description: 'Mountain ungulate endemic to forest fringes, grazing grass canopies to prevent scrub fires.',
          role: 'Alpine forest fire buffer'
        },
        {
          name: 'Malabar Whistling Thrush',
          scientificName: 'Myophonus horsfieldii',
          status: 'Least Concern',
          description: 'Riparian insectivore controlling populations of snails and beetles along damp river edges.',
          role: 'Wet forest insect control'
        }
      ];
    } else if (habitat.name === 'Grasslands') {
      speciesList = [
        {
          name: 'Great Indian Bustard',
          scientificName: 'Ardeotis nigriceps',
          status: 'Critically Endangered',
          description: 'Flagship grassland bird facing extreme extinction risk due to grassland conversion and high-voltage lines.',
          role: 'Dry grassland indicator species'
        },
        {
          name: 'Blackbuck',
          scientificName: 'Antilope cervicapra',
          status: 'Least Concern',
          description: 'Fast grazing herbivore shaping grass heights and promoting seed dispersal across dry scrublands.',
          role: 'Scrubland grazing balance'
        },
        {
          name: 'Indian Grey Mongoose',
          scientificName: 'Urva edwardsii',
          status: 'Least Concern',
          description: 'Agile predator hunting venomous snakes and crop-destroying insect swarms.',
          role: 'Grassland pest control'
        }
      ];
    }

    return {
      mealName,
      ingredients,
      origins,
      watershed,
      habitat,
      speciesList
    };
  }
}
