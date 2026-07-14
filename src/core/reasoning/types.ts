/**
 * Standard segments forming a complete RRT explanation.
 */
export type ReasoningSectionType =
  | 'OBSERVATION'
  | 'CONTEXT'
  | 'EVIDENCE'
  | 'SIMULATION'
  | 'CONCLUSION'
  | 'CONFIDENCE'
  | 'LIMITATIONS';

/**
 * Output presentation modes for reasoning explanations.
 */
export type ExplanationFormat = 'SCIENTIFIC' | 'JUDGE' | 'TECHNICAL';

/**
 * Single step segment in the reasoning trace.
 */
export interface IReasoningStep {
  section: ReasoningSectionType;
  title: string;
  content: string;
}
