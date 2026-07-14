import { SimulationResult } from '../environment/simulation/SimulationResult';
import { EvidenceEngine } from '../environment/evidence/EvidenceEngine';
import { ReasoningTrace } from './ReasoningTrace';
import { ReasoningBuilder } from './ReasoningBuilder';
import { ReasoningFormatter } from './ReasoningFormatter';

/**
 * ReasoningEngine serves as the primary facade for Ripple's explainability layer.
 * It compiles SimulationResults into Scientific, Judge, and Technical narratives.
 */
export class ReasoningEngine {
  constructor() {}

  /**
   * Generates a complete ReasoningTrace compiled for all formats.
   * 
   * @param simulationResult Completed ERE simulation outputs.
   * @param evidenceEngine Reference EvidenceEngine holding citations.
   */
  generateTrace(
    simulationResult: SimulationResult, 
    evidenceEngine: EvidenceEngine
  ): ReasoningTrace {
    return ReasoningBuilder.build(simulationResult, evidenceEngine, 'SCIENTIFIC');
  }

  /**
   * Generates a formal research-paper style markdown explanation.
   * 
   * @param simulationResult Completed simulation data.
   * @param evidenceEngine References evidence catalog.
   */
  getScientificNarrative(simulationResult: SimulationResult, evidenceEngine: EvidenceEngine): string {
    const trace = ReasoningBuilder.build(simulationResult, evidenceEngine, 'SCIENTIFIC');
    return ReasoningFormatter.format(trace, 'SCIENTIFIC');
  }

  /**
   * Generates a simple layperson-friendly narrative trace.
   * 
   * @param simulationResult Completed simulation data.
   * @param evidenceEngine References evidence catalog.
   */
  getJudgeNarrative(simulationResult: SimulationResult, evidenceEngine: EvidenceEngine): string {
    const trace = ReasoningBuilder.build(simulationResult, evidenceEngine, 'JUDGE');
    return ReasoningFormatter.format(trace, 'JUDGE');
  }

  /**
   * Generates a detailed technical console debug printout trace.
   * 
   * @param simulationResult Completed simulation data.
   * @param evidenceEngine References evidence catalog.
   */
  getTechnicalNarrative(simulationResult: SimulationResult, evidenceEngine: EvidenceEngine): string {
    const trace = ReasoningBuilder.build(simulationResult, evidenceEngine, 'TECHNICAL');
    return ReasoningFormatter.format(trace, 'TECHNICAL');
  }
}
export default ReasoningEngine;
