import type { ScenarioChange } from './types';

/**
 * Scenario represents a hypothetical human consumption choice (e.g. Replace Burger with Millet).
 * Holds a structured sequence of changes to apply to the Environmental Graph.
 */
export class Scenario {
  id: string;
  title: string;
  description: string;
  private changes: ScenarioChange[] = [];

  constructor(id: string, title: string, description: string, initialChanges: ScenarioChange[] = []) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.changes = [...initialChanges];
  }

  /**
   * Append a change action to the scenario.
   */
  addChange(change: ScenarioChange): void {
    this.changes.push(change);
  }

  /**
   * Retrieve all changes configured under this scenario.
   */
  getChanges(): ScenarioChange[] {
    return [...this.changes];
  }
}
export default Scenario;
