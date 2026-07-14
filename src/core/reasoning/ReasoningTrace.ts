import { ReasoningStep } from './ReasoningStep';
import type { ReasoningSectionType } from './types';

/**
 * ReasoningTrace collects and organizes completed explanation steps.
 */
export class ReasoningTrace {
  private steps: Map<ReasoningSectionType, ReasoningStep> = new Map();

  constructor(initialSteps: ReasoningStep[] = []) {
    for (const step of initialSteps) {
      this.addStep(step);
    }
  }

  /**
   * Append a step segment to the trace.
   */
  addStep(step: ReasoningStep): void {
    this.steps.set(step.section, step);
  }

  /**
   * Fetch a specific section of explanation from the trace.
   */
  getStep(section: ReasoningSectionType): ReasoningStep | undefined {
    return this.steps.get(section);
  }

  /**
   * Retrieve all explanation steps ordered chronologically by standard pipeline flow.
   */
  getSteps(): ReasoningStep[] {
    const order: ReasoningSectionType[] = [
      'OBSERVATION',
      'CONTEXT',
      'EVIDENCE',
      'SIMULATION',
      'CONCLUSION',
      'CONFIDENCE',
      'LIMITATIONS'
    ];

    const result: ReasoningStep[] = [];
    for (const sec of order) {
      const step = this.steps.get(sec);
      if (step) {
        result.push(step);
      }
    }
    return result;
  }
}
export default ReasoningTrace;
