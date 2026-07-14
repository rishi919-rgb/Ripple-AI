import { GraphBuilder } from '../graph/GraphBuilder';
import type { RelationshipType } from '../graph/Edge';
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
 * GraphMapper interfaces database records with the Environmental Context GraphBuilder,
 * standardizing node properties and metadata configurations.
 */
export class GraphMapper {
  constructor() {}

  /**
   * Appends a Meal node to the GraphBuilder.
   */
  mapMeal(builder: GraphBuilder, record: FoodRecord, properties: Record<string, any> = {}): void {
    builder.addMeal(
      record.id,
      record.name,
      { ...properties, description: record.description || '' },
      { source: 'eie_meal_resolver_v1.0' }
    );
  }

  /**
   * Appends an Ingredient node to the GraphBuilder.
   */
  mapIngredient(builder: GraphBuilder, record: IngredientRecord, properties: Record<string, any> = {}): void {
    builder.addIngredient(
      record.id,
      record.name,
      { ...properties, category: record.category },
      { aliases: record.aliases }
    );
  }

  /**
   * Appends a Crop node to the GraphBuilder.
   */
  mapCrop(builder: GraphBuilder, record: CropRecord, properties: Record<string, any> = {}): void {
    builder.addCrop(
      record.id,
      record.name,
      { ...properties, scientificName: record.scientificName },
      { source: 'crop_botanical_registry' }
    );
  }

  /**
   * Appends a Region node to the GraphBuilder.
   */
  mapRegion(builder: GraphBuilder, record: RegionRecord, properties: Record<string, any> = {}): void {
    builder.addRegion(
      record.id,
      record.name,
      { ...properties, state: record.state },
      { source: 'regional_census' }
    );
  }

  /**
   * Appends a Watershed node to the GraphBuilder.
   */
  mapWatershed(builder: GraphBuilder, record: WatershedRecord, properties: Record<string, any> = {}): void {
    builder.addWatershed(
      record.id,
      record.name,
      { ...properties, riverSystem: record.riverSystem, areaSqKm: record.areaSqKm },
      { source: 'hydrological_grids' }
    );
  }

  /**
   * Appends a Habitat node to the GraphBuilder.
   */
  mapHabitat(builder: GraphBuilder, record: HabitatRecord, properties: Record<string, any> = {}): void {
    builder.addHabitat(
      record.id,
      record.name,
      { ...properties, description: record.description, features: record.features },
      { iconName: record.iconName }
    );
  }

  /**
   * Appends a Species node to the GraphBuilder.
   */
  mapSpecies(builder: GraphBuilder, record: SpeciesRecord, properties: Record<string, any> = {}): void {
    builder.addSpecies(
      record.id,
      record.name,
      { ...properties, scientificName: record.scientificName, role: record.role },
      { status: record.status }
    );
  }

  /**
   * Adds an edge connection between two entities.
   */
  connect(
    builder: GraphBuilder,
    fromId: string,
    toId: string,
    relationship: RelationshipType,
    confidence = 1.0,
    metadata: Record<string, any> = {}
  ): void {
    builder.connect(fromId, toId, relationship, confidence, metadata);
  }
}
export default GraphMapper;
