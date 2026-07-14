import { EnvironmentalGraph } from '../graph/EnvironmentalGraph';

/**
 * Deep-clones an EnvironmentalGraph by serializing and importing its structure,
 * preventing reference leak mutations.
 * 
 * @param graph Source EnvironmentalGraph instance.
 * @returns Clean cloned EnvironmentalGraph copy.
 */
export function cloneGraph(graph: EnvironmentalGraph): EnvironmentalGraph {
  const cloned = new EnvironmentalGraph();
  cloned.import(graph.export());
  return cloned;
}
