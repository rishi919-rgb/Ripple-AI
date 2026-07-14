import type { IReasoningStep, ReasoningSectionType } from './types';

/**
 * Concrete class representation of a single section step in the explainability trail.
 */
export class ReasoningStep implements IReasoningStep {
  section: ReasoningSectionType;
  title: string;
  content: string;

  constructor(section: ReasoningSectionType, title: string, content: string) {
    this.section = section;
    this.title = title;
    this.content = content;
  }
}
export default ReasoningStep;
