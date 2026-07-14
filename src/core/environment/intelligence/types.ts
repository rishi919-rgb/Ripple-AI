/**
 * Representation of a target meal record.
 */
export interface FoodRecord {
  id: string;
  name: string;
  ingredients: string[]; // default ingredient names
  description?: string;
}

/**
 * Representation of a culinary or physical ingredient.
 */
export interface IngredientRecord {
  id: string;
  name: string;
  category: string;
  aliases: string[]; // alternative names for resolver normalization
  derivedFromCropId: string; // Crop node ID it represents
}

/**
 * Representation of a botanical crop entity.
 */
export interface CropRecord {
  id: string;
  name: string;
  scientificName: string;
  cultivatedInRegionIds: string[]; // Region node IDs
}

/**
 * Representation of a geographic production region.
 */
export interface RegionRecord {
  id: string;
  name: string;
  state: string;
  watershedId: string; // Watershed node ID it belongs to
}

/**
 * Representation of a catchment basin watershed.
 */
export interface WatershedRecord {
  id: string;
  name: string;
  riverSystem: string;
  areaSqKm: string;
  habitats: string[]; // Habitat node IDs
}

/**
 * Representation of an ecosystem habitat classification.
 */
export interface HabitatRecord {
  id: string;
  name: 'Wetlands' | 'Grasslands' | 'Agricultural Plains' | 'Forests';
  description: string;
  features: string[];
  iconName: string;
  supportedSpeciesIds: string[]; // Species node IDs
}

/**
 * Representation of a native animal or insect keystone species.
 */
export interface SpeciesRecord {
  id: string;
  name: string;
  scientificName: string;
  status: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Least Concern';
  description: string;
  role: string;
}
