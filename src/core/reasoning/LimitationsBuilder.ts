import type { ExplanationFormat } from './types';

/**
 * LimitationsBuilder compiles the standardized scientific caveats and disclaimers.
 */
export class LimitationsBuilder {
  private static readonly DISCLAIMERS = [
    'This is a scenario-based pressure propagation model, not a predictive ecosystem simulation.',
    'It does not compute physical wildlife populations, birth/extinction timelines, or extinction rates.',
    'Calculated pressure changes are relative indices indicating supply chain drawdowns.',
    'Simulation results are bounded by currently mapped dataset coordinates and registry aliases.'
  ];

  /**
   * Generates the limitations disclaimer block based on format.
   */
  static build(format: ExplanationFormat): string {
    switch (format) {
      case 'SCIENTIFIC':
        return `Methodological disclaimers and boundary parameters:
${this.DISCLAIMERS.map((d, i) => `  ${i + 1}. ${d}`).join('\n')}
The propagation model attenuates delta pressure coefficients mathematically without modeling physical ecological transitions or chemical dispersion scales.`;

      case 'JUDGE':
        return `Things to keep in mind:
- This is a hypothetical scenario comparison tool, not a crystal ball.
- It does not predict species going extinct or exactly when populations will drop.
- The numbers show general pressure trends based on agricultural demand.
- All results depend on current public scientific databases.`;

      case 'TECHNICAL':
        return `SYS_LIMITATIONS_DESCRIPTOR_VECTORS:
${this.DISCLAIMERS.map((d, i) => `  [LIMITATION_VEC_${i}]: "${d}"`).join('\n')}
DETERMINISTIC_SCENARIO_BOUNDS: TRUE
PREDICTIVE_POPULATION_MODEL: FALSE
DISPERSION_CHEMICAL_SCALES: NULL`;
    }
  }
}
export default LimitationsBuilder;
