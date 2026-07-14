import { validateGraphStructure } from './GraphUtils';
/**
 * Main Environmental Context Graph data structure managing nodes and directed connections.
 */
export class EnvironmentalGraph {
    constructor() {
        this.nodesMap = new Map();
        this.edgesMap = new Map();
        /** Adjacency map: maps node ID to a set of OUTGOING edge IDs for rapid traversal. */
        this.outAdjacency = new Map();
        /** Adjacency map: maps node ID to a set of INCOMING edge IDs. */
        this.inAdjacency = new Map();
    }
    /**
     * Retrieves all nodes currently stored in the graph.
     */
    getNodes() {
        return Array.from(this.nodesMap.values());
    }
    /**
     * Retrieves all edges currently stored in the graph.
     */
    getEdges() {
        return Array.from(this.edgesMap.values());
    }
    /**
     * Adds a node to the graph. If a node with the same ID exists, it will be overwritten.
     *
     * @param node GraphNode to insert.
     */
    addNode(node) {
        this.nodesMap.set(node.id, node);
        if (!this.outAdjacency.has(node.id)) {
            this.outAdjacency.set(node.id, new Set());
        }
        if (!this.inAdjacency.has(node.id)) {
            this.inAdjacency.set(node.id, new Set());
        }
    }
    /**
     * Removes a node from the graph, alongside any connecting edges (incoming or outgoing).
     *
     * @param id Target Node ID to remove.
     */
    removeNode(id) {
        if (!this.nodesMap.has(id))
            return;
        this.nodesMap.delete(id);
        // Collect and remove all associated edges
        const outgoing = this.outAdjacency.get(id) || new Set();
        const incoming = this.inAdjacency.get(id) || new Set();
        for (const edgeId of outgoing) {
            const edge = this.edgesMap.get(edgeId);
            if (edge) {
                this.edgesMap.delete(edgeId);
                // Clean up from the target node's incoming adjacency
                const targetIn = this.inAdjacency.get(edge.to);
                if (targetIn)
                    targetIn.delete(edgeId);
            }
        }
        for (const edgeId of incoming) {
            const edge = this.edgesMap.get(edgeId);
            if (edge) {
                this.edgesMap.delete(edgeId);
                // Clean up from the source node's outgoing adjacency
                const sourceOut = this.outAdjacency.get(edge.from);
                if (sourceOut)
                    sourceOut.delete(edgeId);
            }
        }
        this.outAdjacency.delete(id);
        this.inAdjacency.delete(id);
    }
    /**
     * Adds a directed edge to the graph. Overwrites if same edge ID exists.
     *
     * @param edge GraphEdge connection details.
     */
    addEdge(edge) {
        // Overwrite existing edge if ID is present
        if (this.edgesMap.has(edge.id)) {
            this.removeEdge(edge.id);
        }
        this.edgesMap.set(edge.id, edge);
        // Initialize adjacency containers if needed (for missing reference nodes validation support)
        if (!this.outAdjacency.has(edge.from)) {
            this.outAdjacency.set(edge.from, new Set());
        }
        if (!this.inAdjacency.has(edge.to)) {
            this.inAdjacency.set(edge.to, new Set());
        }
        this.outAdjacency.get(edge.from).add(edge.id);
        this.inAdjacency.get(edge.to).add(edge.id);
    }
    /**
     * Removes an edge by its identifier.
     *
     * @param id Target Edge ID to remove.
     */
    removeEdge(id) {
        const edge = this.edgesMap.get(id);
        if (!edge)
            return;
        this.edgesMap.delete(id);
        const outSet = this.outAdjacency.get(edge.from);
        if (outSet)
            outSet.delete(id);
        const inSet = this.inAdjacency.get(edge.to);
        if (inSet)
            inSet.delete(id);
    }
    /**
     * Returns a node by its ID, or undefined if not found.
     *
     * @param id Target Node ID.
     */
    findNode(id) {
        return this.nodesMap.get(id);
    }
    /**
     * Filter and return all nodes belonging to a specific type.
     *
     * @param type Selected NodeType query.
     */
    findNodesByType(type) {
        const result = [];
        for (const node of this.nodesMap.values()) {
            if (node.type === type) {
                result.push(node);
            }
        }
        return result;
    }
    /**
     * Fetch all immediately connected outgoing neighbors from a node.
     *
     * @param id Source Node ID.
     */
    getNeighbors(id) {
        const neighbors = [];
        const edgeIds = this.outAdjacency.get(id);
        if (edgeIds) {
            for (const edgeId of edgeIds) {
                const edge = this.edgesMap.get(edgeId);
                if (edge) {
                    const targetNode = this.nodesMap.get(edge.to);
                    if (targetNode) {
                        neighbors.push({ node: targetNode, edge });
                    }
                }
            }
        }
        return neighbors;
    }
    /**
     * Traces all reachable nodes and traversed edges up to a specified depth limit.
     * Useful for extracting environmental paths from a starting meal.
     *
     * @param startId Starting Node ID.
     * @param maxDepth Level boundaries of recursive tracing depth.
     */
    trace(startId, maxDepth) {
        const visitedNodes = new Set();
        const visitedEdges = new Set();
        const nodesList = [];
        const edgesList = [];
        const traverse = (nodeId, currentDepth) => {
            const node = this.nodesMap.get(nodeId);
            if (!node)
                return;
            if (!visitedNodes.has(nodeId)) {
                visitedNodes.add(nodeId);
                nodesList.push(node);
            }
            if (currentDepth >= maxDepth)
                return;
            const edgeIds = this.outAdjacency.get(nodeId);
            if (edgeIds) {
                for (const edgeId of edgeIds) {
                    const edge = this.edgesMap.get(edgeId);
                    if (edge) {
                        if (!visitedEdges.has(edgeId)) {
                            visitedEdges.add(edgeId);
                            edgesList.push(edge);
                        }
                        traverse(edge.to, currentDepth + 1);
                    }
                }
            }
        };
        traverse(startId, 0);
        return {
            nodes: nodesList,
            edges: edgesList
        };
    }
    /**
     * Constructs a new EnvironmentalGraph composed of only the target node IDs,
     * retaining any original connecting edges between the subset.
     *
     * @param nodeIds Set of target node IDs to isolate.
     */
    subgraph(nodeIds) {
        const sub = new EnvironmentalGraph();
        const targetSet = new Set(nodeIds);
        // Add nodes
        for (const nodeId of nodeIds) {
            const node = this.nodesMap.get(nodeId);
            if (node) {
                sub.addNode(JSON.parse(JSON.stringify(node))); // deep copy node
            }
        }
        // Add edges that connect nodes within the subgraph subset
        for (const edge of this.edgesMap.values()) {
            if (targetSet.has(edge.from) && targetSet.has(edge.to)) {
                sub.addEdge(JSON.parse(JSON.stringify(edge))); // deep copy edge
            }
        }
        return sub;
    }
    /**
     * Run structural audits to find missing references, orphans, and circular loops.
     */
    validate() {
        return validateGraphStructure(this.getNodes(), this.getEdges());
    }
    /**
     * Serializes the graph state into a JSON string.
     */
    export() {
        const data = {
            nodes: this.getNodes(),
            edges: this.getEdges()
        };
        return JSON.stringify(data);
    }
    /**
     * Clears the current graph and imports nodes/edges from a serialized JSON string.
     *
     * @param serialized Serialized JSON graph payload.
     */
    import(serialized) {
        this.nodesMap.clear();
        this.edgesMap.clear();
        this.outAdjacency.clear();
        this.inAdjacency.clear();
        const data = JSON.parse(serialized);
        if (data.nodes && Array.isArray(data.nodes)) {
            for (const node of data.nodes) {
                this.addNode(node);
            }
        }
        if (data.edges && Array.isArray(data.edges)) {
            for (const edge of data.edges) {
                this.addEdge(edge);
            }
        }
    }
}
export default EnvironmentalGraph;
