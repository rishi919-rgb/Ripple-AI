import { DatasetLoader } from './DatasetLoader';
import { EntityResolver } from './EntityResolver';
import { GraphMapper } from './GraphMapper';
import { ContextBuilder } from './ContextBuilder';
import { GraphValidator, type EIEValidationResult } from './GraphValidator';
import type { EnvironmentalGraph } from '../graph/EnvironmentalGraph';

/**
 * EnvironmentalIntelligenceEngine (EIE) serves as the primary intelligence facade,
 * orchestrating canonical resolution, subgraph mapping, and validations.
 */
export class EnvironmentalIntelligenceEngine {
  private loader: DatasetLoader;
  private resolver: EntityResolver;
  private mapper: GraphMapper;
  private builder: ContextBuilder;
  private validator: GraphValidator;

  constructor() {
    this.loader = new DatasetLoader();
    this.resolver = new EntityResolver(this.loader);
    this.mapper = new GraphMapper();
    this.builder = new ContextBuilder(this.loader, this.resolver, this.mapper);
    this.validator = new GraphValidator();
  }

  /**
   * Constructs an Environmental Context Graph from a meal name and custom ingredients list.
   * 
   * @param mealName Name of the observation meal.
   * @param ingredients Array of custom ingredient names and percentages.
   */
  async buildContext(
    mealName: string, 
    ingredients?: { name: string; percentage: number }[]
  ): Promise<EnvironmentalGraph> {
    return this.builder.buildMealContext(mealName, ingredients);
  }

  /**
   * Reconstructs the complete environmental context from a meal name using dataset defaults.
   * 
   * @param mealName Target meal name.
   */
  async buildMealContext(mealName: string): Promise<EnvironmentalGraph> {
    return this.builder.buildMealContext(mealName);
  }

  /**
   * Reconstructs the supply chain starting at an ingredient node.
   * 
   * @param ingredientName Name of the ingredient.
   */
  async buildIngredientContext(ingredientName: string): Promise<EnvironmentalGraph> {
    return this.builder.buildIngredientContext(ingredientName);
  }

  /**
   * Reconstructs the local hydrology ecosystem starting at a region node.
   * 
   * @param regionName Name of the region.
   */
  async buildRegionContext(regionName: string): Promise<EnvironmentalGraph> {
    return this.builder.buildRegionContext(regionName);
  }

  /**
   * Reconstructs a subgraph linking a species to its habitat ecosystem.
   * 
   * @param speciesName Name of the species.
   */
  async buildSpeciesContext(speciesName: string): Promise<EnvironmentalGraph> {
    return this.builder.buildSpeciesContext(speciesName);
  }

  /**
   * Validates a generated Environmental Context Graph.
   * 
   * @param graph The graph instance to validate.
   */
  validateContext(graph: EnvironmentalGraph): EIEValidationResult {
    return this.validator.validate(graph);
  }

  /**
   * Traces all nodes and edges connected to a target meal up to depth 10, returning a flattened set.
   * 
   * @param mealName Target meal name.
   */
  async traceMeal(mealName: string): Promise<{ nodes: any[]; edges: any[] }> {
    const graph = await this.buildMealContext(mealName);
    const mealNode = graph.getNodes().find(n => n.type === 'MEAL');
    if (!mealNode) return { nodes: [], edges: [] };
    
    // Trace outgoing relationships up to max depth 10
    return graph.trace(mealNode.id, 10);
  }
}
export default EnvironmentalIntelligenceEngine;
