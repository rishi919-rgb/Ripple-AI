import type { EnvironmentalGraph } from '../graph/EnvironmentalGraph';
import type { GraphValidationResult } from '../graph/GraphUtils';

/**
 * EIEValidationResult extends standard graph validation reports with domain-specific supply chain checks.
 */
export interface EIEValidationResult extends GraphValidationResult {
  /** True if the graph incorporates a root meal entity. */
  hasMealNode: boolean;
  /** True if any ingredients fail to trace to botanical crop sources. */
  hasDanglingSupplyChain: boolean;
  /** Domain-specific environmental validation warnings. */
  domainWarnings: string[];
}

/**
 * GraphValidator performs strict structural and logical audits on reconstructed graphs.
 */
export class GraphValidator {
  constructor() {}

  /**
   * Performs graph integrity validation and runs supply chain dependency audits.
   * 
   * @param graph Generated EnvironmentalGraph instance.
   */
  validate(graph: EnvironmentalGraph): EIEValidationResult {
    const coreReport = graph.validate();
    const domainWarnings: string[] = [];

    const nodes = graph.getNodes();
    const edges = graph.getEdges();

    const hasMeal = nodes.some(n => n.type === 'MEAL');
    let hasDanglingSupplyChain = false;

    // Check if ingredient nodes trace to crops
    const ingredients = nodes.filter(n => n.type === 'INGREDIENT');
    for (const ing of ingredients) {
      const connectsToCrop = edges.some(e => e.from === ing.id && e.relationship === 'DERIVED_FROM');
      if (!connectsToCrop) {
        hasDanglingSupplyChain = true;
        domainWarnings.push(`Ingredient "${ing.label}" (${ing.id}) fails to trace to a Crop node via DERIVED_FROM.`);
      }
    }

    // Check if crop nodes trace to regions
    const crops = nodes.filter(n => n.type === 'CROP');
    for (const crop of crops) {
      const connectsToRegion = edges.some(e => e.from === crop.id && e.relationship === 'CULTIVATED_IN');
      if (!connectsToRegion) {
        domainWarnings.push(`Crop "${crop.label}" (${crop.id}) fails to map to a cultivation Region via CULTIVATED_IN.`);
      }
    }

    return {
      ...coreReport,
      hasMealNode: hasMeal,
      hasDanglingSupplyChain,
      domainWarnings: [...domainWarnings, ...coreReport.warnings]
    };
  }
}
export default GraphValidator;
