import type { TimelineRecord } from './types';

/**
 * SimulationTimeline maintains the propagation step-by-step logs.
 */
export class SimulationTimeline {
  private records: TimelineRecord[] = [];

  constructor(initialRecords: TimelineRecord[] = []) {
    this.records = [...initialRecords];
  }

  /**
   * Append a propagation record to the simulation timeline.
   */
  addRecord(record: TimelineRecord): void {
    this.records.push(record);
  }

  /**
   * Returns all timeline records logged.
   */
  getRecords(): TimelineRecord[] {
    return [...this.records];
  }
}
export default SimulationTimeline;
