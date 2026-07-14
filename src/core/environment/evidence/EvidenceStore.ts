import type { EvidenceRecord } from './types';

/**
 * EvidenceStore manages the in-memory cache of scientific references.
 */
export class EvidenceStore {
  private records: Map<string, EvidenceRecord> = new Map();
  /** Secondary index mapping entity ID to a set of evidence record IDs. */
  private entityIndex: Map<string, Set<string>> = new Map();
  /** Secondary index mapping dataset string to a set of evidence record IDs. */
  private datasetIndex: Map<string, Set<string>> = new Map();

  constructor() {}

  /**
   * Adds an evidence record to the store.
   * 
   * @param record The EvidenceRecord to store.
   */
  add(record: EvidenceRecord): void {
    this.records.set(record.id, record);

    // Update entity index
    if (!this.entityIndex.has(record.entityId)) {
      this.entityIndex.set(record.entityId, new Set());
    }
    this.entityIndex.get(record.entityId)!.add(record.id);

    // Update dataset index
    if (!this.datasetIndex.has(record.dataset)) {
      this.datasetIndex.set(record.dataset, new Set());
    }
    this.datasetIndex.get(record.dataset)!.add(record.id);
  }

  /**
   * Find an evidence record by its unique ID.
   * 
   * @param id Target evidence ID.
   */
  find(id: string): EvidenceRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Find all evidence records associated with a specific graph Node or Edge ID.
   * 
   * @param entityId Target GraphNode ID or GraphEdge ID.
   */
  findByEntity(entityId: string): EvidenceRecord[] {
    const ids = this.entityIndex.get(entityId);
    if (!ids) return [];

    const result: EvidenceRecord[] = [];
    for (const recordId of ids) {
      const record = this.records.get(recordId);
      if (record) {
        result.push(record);
      }
    }
    return result;
  }

  /**
   * Find all evidence records from a specific dataset source.
   * 
   * @param dataset Target dataset name.
   */
  findByDataset(dataset: string): EvidenceRecord[] {
    const ids = this.datasetIndex.get(dataset);
    if (!ids) return [];

    const result: EvidenceRecord[] = [];
    for (const recordId of ids) {
      const record = this.records.get(recordId);
      if (record) {
        result.push(record);
      }
    }
    return result;
  }

  /**
   * Removes an evidence record by ID.
   * 
   * @param id Target evidence ID to delete.
   */
  remove(id: string): void {
    const record = this.records.get(id);
    if (!record) return;

    this.records.delete(id);

    // Clean indices
    const entitySet = this.entityIndex.get(record.entityId);
    if (entitySet) entitySet.delete(id);

    const datasetSet = this.datasetIndex.get(record.dataset);
    if (datasetSet) datasetSet.delete(id);
  }

  /**
   * Serializes the evidence store into a JSON string.
   */
  export(): string {
    return JSON.stringify(Array.from(this.records.values()));
  }

  /**
   * Clears and imports records from a serialized JSON string.
   * 
   * @param serialized Serialized JSON array of EvidenceRecord.
   */
  import(serialized: string): void {
    this.records.clear();
    this.entityIndex.clear();
    this.datasetIndex.clear();

    const data = JSON.parse(serialized) as EvidenceRecord[];
    if (Array.isArray(data)) {
      for (const rec of data) {
        this.add(rec);
      }
    }
  }
}
export default EvidenceStore;
