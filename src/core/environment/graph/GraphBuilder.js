import { EnvironmentalGraph } from './EnvironmentalGraph';
/**
 * Fluent API Builder for constructing Environmental Context Graphs in a readable, chainable format.
 */
export class GraphBuilder {
    constructor() {
        this.graph = new EnvironmentalGraph();
    }
    /**
     * Internal generic node adder to chain nodes of specific types.
     */
    addNode(id, type, label, properties = {}, metadata = {}, evidence = []) {
        this.graph.addNode({
            id,
            type,
            label,
            properties,
            metadata,
            evidence
        });
        return this;
    }
    /**
     * Fluent method to append a MEAL entity.
     */
    addMeal(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'MEAL', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append an INGREDIENT entity.
     */
    addIngredient(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'INGREDIENT', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append a CROP entity.
     */
    addCrop(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'CROP', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append a REGION entity.
     */
    addRegion(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'REGION', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append a WATERSHED entity.
     */
    addWatershed(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'WATERSHED', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append a HABITAT entity.
     */
    addHabitat(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'HABITAT', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append a SPECIES entity.
     */
    addSpecies(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'SPECIES', label, properties, metadata, evidence);
    }
    /**
     * Fluent method to append an EVIDENCE entity.
     */
    addEvidence(id, label, properties, metadata, evidence) {
        return this.addNode(id, 'EVIDENCE', label, properties, metadata, evidence);
    }
    /**
     * Creates a directed ecological connection between two nodes.
     *
     * @param fromId Source Node ID.
     * @param toId Target Node ID.
     * @param relationship Relationship type.
     * @param confidence Confidence coefficient (defaults to 1.0).
     * @param metadata Custom metadata attributes.
     * @param customEdgeId Optional custom edge ID (defaults to automatic string concatenation).
     */
    connect(fromId, toId, relationship, confidence = 1.0, metadata = {}, customEdgeId) {
        const id = customEdgeId || `${fromId}-${relationship}-${toId}`;
        this.graph.addEdge({
            id,
            from: fromId,
            to: toId,
            relationship,
            confidence,
            metadata
        });
        return this;
    }
    /**
     * Returns the constructed EnvironmentalGraph instance.
     */
    build() {
        return this.graph;
    }
}
