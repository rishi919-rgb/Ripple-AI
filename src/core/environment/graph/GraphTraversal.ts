import type { EnvironmentalGraph } from './EnvironmentalGraph';
import type { GraphNode } from './Node';

/**
 * Executes a Depth-First Search (DFS) traversal starting at a node.
 * 
 * @param graph Source EnvironmentalGraph.
 * @param startId Starting Node ID.
 * @param visit Callback function triggered on each unique node discovered.
 */
export function dfs(
  graph: EnvironmentalGraph,
  startId: string,
  visit: (node: GraphNode) => void
): void {
  const visited = new Set<string>();

  const traverse = (nodeId: string) => {
    const node = graph.findNode(nodeId);
    if (!node || visited.has(nodeId)) return;

    visited.add(nodeId);
    visit(node);

    const neighbors = graph.getNeighbors(nodeId);
    for (const neighbor of neighbors) {
      traverse(neighbor.node.id);
    }
  };

  traverse(startId);
}

/**
 * Executes a Breadth-First Search (BFS) traversal starting at a node.
 * 
 * @param graph Source EnvironmentalGraph.
 * @param startId Starting Node ID.
 * @param visit Callback function triggered on each unique node visited.
 */
export function bfs(
  graph: EnvironmentalGraph,
  startId: string,
  visit: (node: GraphNode) => void
): void {
  const visited = new Set<string>();
  const queue: string[] = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const node = graph.findNode(currId);
    if (node) {
      visit(node);
      const neighbors = graph.getNeighbors(currId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node.id)) {
          visited.add(neighbor.node.id);
          queue.push(neighbor.node.id);
        }
      }
    }
  }
}

/**
 * Computes the shortest path between two nodes in the directed graph using BFS.
 * 
 * @param graph Source EnvironmentalGraph.
 * @param startId Starting Node ID.
 * @param endId Target Node ID to reach.
 * @returns Array of Node IDs forming the shortest path, or null if unreachable.
 */
export function shortestPath(
  graph: EnvironmentalGraph,
  startId: string,
  endId: string
): string[] | null {
  if (startId === endId) return [startId];

  const visited = new Set<string>();
  const parentMap = new Map<string, string>(); // child -> parent
  const queue: string[] = [startId];
  visited.add(startId);

  let found = false;
  while (queue.length > 0) {
    const currId = queue.shift()!;
    if (currId === endId) {
      found = true;
      break;
    }

    const neighbors = graph.getNeighbors(currId);
    for (const neighbor of neighbors) {
      const neighborId = neighbor.node.id;
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parentMap.set(neighborId, currId);
        queue.push(neighborId);
      }
    }
  }

  if (!found) return null;

  // Reconstruct path backward
  const path: string[] = [];
  let curr: string | undefined = endId;
  while (curr) {
    path.push(curr);
    curr = parentMap.get(curr);
  }
  return path.reverse();
}

/**
 * Executes a Depth-Limited Search (DLS) traversal starting at a node.
 * 
 * @param graph Source EnvironmentalGraph.
 * @param startId Starting Node ID.
 * @param maxDepth Bound level of recursive depth.
 * @param visit Callback function triggered on node visits, passing the node and its depth index.
 */
export function depthLimitedSearch(
  graph: EnvironmentalGraph,
  startId: string,
  maxDepth: number,
  visit: (node: GraphNode, depth: number) => void
): void {
  const visited = new Map<string, number>(); // node ID -> minimum depth visited

  const traverse = (nodeId: string, depth: number) => {
    const node = graph.findNode(nodeId);
    if (!node) return;

    // Prune if we already visited at a shallower or equal depth
    if (visited.has(nodeId) && visited.get(nodeId)! <= depth) {
      return;
    }

    visited.set(nodeId, depth);
    visit(node, depth);

    if (depth >= maxDepth) return;

    const neighbors = graph.getNeighbors(nodeId);
    for (const neighbor of neighbors) {
      traverse(neighbor.node.id, depth + 1);
    }
  };

  traverse(startId, 0);
}
