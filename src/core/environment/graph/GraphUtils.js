/**
 * Validates the structural integrity of the nodes and edges array.
 *
 * @param nodes List of nodes in the graph.
 * @param edges List of edges in the graph.
 * @returns Comprehensive structural validation result.
 */
export function validateGraphStructure(nodes, edges) {
    const errors = [];
    const warnings = [];
    const orphans = [];
    const missingReferences = [];
    const nodeMap = new Map();
    const duplicateNodeIds = new Set();
    // Check duplicate nodes
    for (const node of nodes) {
        if (nodeMap.has(node.id)) {
            duplicateNodeIds.add(node.id);
            errors.push(`Duplicate Node ID found: "${node.id}" (Label: "${node.label}")`);
        }
        else {
            nodeMap.set(node.id, node);
        }
    }
    // Track degrees of each node
    const inDegree = new Map();
    const outDegree = new Map();
    for (const node of nodes) {
        inDegree.set(node.id, 0);
        outDegree.set(node.id, 0);
    }
    const edgeMap = new Map();
    const duplicateEdgeIds = new Set();
    const duplicateConnections = new Map();
    // Check edges
    for (const edge of edges) {
        // Check edge ID duplicates
        if (edgeMap.has(edge.id)) {
            duplicateEdgeIds.add(edge.id);
            errors.push(`Duplicate Edge ID found: "${edge.id}"`);
        }
        else {
            edgeMap.set(edge.id, edge);
        }
        // Check missing reference nodes
        const fromExists = nodeMap.has(edge.from);
        const toExists = nodeMap.has(edge.to);
        if (!fromExists) {
            errors.push(`Edge "${edge.id}" references non-existent source node: "${edge.from}"`);
            missingReferences.push({ edgeId: edge.id, missingNodeId: edge.from });
        }
        else {
            outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
        }
        if (!toExists) {
            errors.push(`Edge "${edge.id}" references non-existent target node: "${edge.to}"`);
            missingReferences.push({ edgeId: edge.id, missingNodeId: edge.to });
        }
        else {
            inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
        }
        // Check duplicate relationships between same nodes
        const connectionKey = `${edge.from}->${edge.to}`;
        if (!duplicateConnections.has(connectionKey)) {
            duplicateConnections.set(connectionKey, new Set());
        }
        const relationships = duplicateConnections.get(connectionKey);
        if (relationships.has(edge.relationship)) {
            warnings.push(`Duplicate relationship "${edge.relationship}" detected between "${edge.from}" and "${edge.to}"`);
        }
        else {
            relationships.add(edge.relationship);
        }
    }
    // Detect orphans (nodes with no connections)
    for (const node of nodes) {
        const totalDegree = (inDegree.get(node.id) || 0) + (outDegree.get(node.id) || 0);
        if (totalDegree === 0) {
            orphans.push(node.id);
            warnings.push(`Orphan node detected (no connections): "${node.id}" (Label: "${node.label}")`);
        }
    }
    // Detect directed cycles using DFS coloring
    const cycles = findCycles(nodes.map(n => n.id), (nodeId) => {
        // Return outgoing neighbor node IDs
        return edges
            .filter(e => e.from === nodeId && nodeMap.has(e.to))
            .map(e => e.to);
    });
    if (cycles.length > 0) {
        warnings.push(`Circular dependency path(s) detected: ${cycles.length} loop(s) found.`);
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        orphans,
        missingReferences,
        cycles
    };
}
/**
 * Searches for cycles in a directed graph representation using standard coloring.
 */
function findCycles(nodeIds, getNeighbors) {
    const visited = new Set();
    const visiting = new Set();
    const currentPath = [];
    const cycles = [];
    function dfs(nodeId) {
        visiting.add(nodeId);
        currentPath.push(nodeId);
        const neighbors = getNeighbors(nodeId);
        for (const neighbor of neighbors) {
            if (visiting.has(neighbor)) {
                // Back-edge found: compile the cycle loop path
                const startIndex = currentPath.indexOf(neighbor);
                if (startIndex !== -1) {
                    const cycle = currentPath.slice(startIndex);
                    cycle.push(neighbor); // close loop
                    cycles.push(cycle);
                }
            }
            else if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }
        currentPath.pop();
        visiting.delete(nodeId);
        visited.add(nodeId);
    }
    for (const nodeId of nodeIds) {
        if (!visited.has(nodeId)) {
            dfs(nodeId);
        }
    }
    return cycles;
}
