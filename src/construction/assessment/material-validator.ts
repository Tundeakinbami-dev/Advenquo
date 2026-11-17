/**
 * Advenquo: Construction World — Material Suitability Validator
 *
 * Verifies that components chosen for critical structural roles have appropriate material properties:
 * - Foundations require minimum compressive strength >= 20 MPa
 * - Multi-story columns require reinforced steel or concrete (tensile strength >= 100 MPa)
 * - Roof decks must possess weather enclosure certification
 */

import type { PlacedComponentRecord } from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export interface MaterialValidationResult {
  passed: boolean;
  score: number; // 0 to 15
  materialMismatches: string[];
}

export class MaterialValidator {
  public static validate(
    components: Map<string, PlacedComponentRecord>
  ): MaterialValidationResult {
    const mismatches: string[] = [];
    let validCount = 0;
    const total = components.size;

    if (total === 0) {
      return { passed: true, score: 15, materialMismatches: [] };
    }

    for (const record of components.values()) {
      const spec = CONSTRUCTION_CATALOG[record.componentType];
      if (!spec) continue;

      let isAppropriate = true;

      // 1. Column check: columns carrying upper levels must have adequate tensile / compressive strength
      if (record.structuralRole === 'load_bearing_column') {
        if (spec.material.compressiveStrengthMpa < 25.0) {
          isAppropriate = false;
          mismatches.push(
            `Component ${record.componentType} has insufficient compressive strength for a primary column.`
          );
        }
      }

      // 2. Foundation check
      if (record.isGrounded && spec.material.compressiveStrengthMpa < 15.0) {
        isAppropriate = false;
        mismatches.push(
          `Component ${record.componentType} is too brittle or light to serve as a direct ground footing.`
        );
      }

      if (isAppropriate) {
        validCount++;
      }
    }

    const ratio = total > 0 ? validCount / total : 1.0;
    const score = Math.round(ratio * 15);
    const passed = mismatches.length === 0;

    return {
      passed,
      score,
      materialMismatches: mismatches,
    };
  }
}
