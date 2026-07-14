import { ReasoningTrace } from './ReasoningTrace';
import { EXPLANATION_TEMPLATES } from './ExplanationTemplates';
import type { ExplanationFormat } from './types';

/**
 * ReasoningFormatter converts a compiled ReasoningTrace into a unified markdown narrative.
 */
export class ReasoningFormatter {
  constructor() {}

  /**
   * Compiles the trace steps into the target format.
   * 
   * @param trace The compiled ReasoningTrace containing section steps.
   * @param format Formatting mode (Scientific, Judge, Technical).
   */
  static format(trace: ReasoningTrace, format: ExplanationFormat): string {
    const steps = trace.getSteps();
    const templates = EXPLANATION_TEMPLATES[format];
    const output: string[] = [];

    // Header layout
    switch (format) {
      case 'SCIENTIFIC':
        output.push('# SCIENTIFIC REASONING TRACE AND CASUAL ANALYSIS REPORT\n');
        output.push(`*Document telemetry compiled on: ${new Date().toISOString()}*`);
        output.push('---');
        break;
      case 'JUDGE':
        output.push('# ECO-INFLUENCE STUDY: VERBAL PRESENTATION PANEL\n');
        output.push('---');
        break;
      case 'TECHNICAL':
        output.push('=========================================================');
        output.push(`[SYSTEM_DEBUG_REASONING_TRACE::${new Date().toISOString()}]`);
        output.push('=========================================================\n');
        break;
    }

    for (const step of steps) {
      const template = templates[step.section];
      const header = template?.header || step.title;

      switch (format) {
        case 'SCIENTIFIC':
          output.push(`\n## ${header}\n`);
          output.push(step.content);
          output.push('\n---');
          break;
        case 'JUDGE':
          output.push(`\n### ${header}\n`);
          output.push(step.content);
          output.push('\n');
          break;
        case 'TECHNICAL':
          output.push(`\n>>> ${header} <<<`);
          output.push(step.content);
          output.push('\n');
          break;
      }
    }

    if (format === 'TECHNICAL') {
      output.push('=========================================================');
      output.push('[END_REASONING_TRACE_DUMP]');
      output.push('=========================================================');
    }

    return output.join('\n');
  }
}
export default ReasoningFormatter;
