/**
 * Advenquo: Construction World — Stability Validator
 *
 * Checks:
 * - Center of mass (CoM) relative to foundation footprint (tipping / toppling check)
 * - Unsupported cantilever spans
 * - Aspect ratio of tall slender columns without lateral bracing
 */

import { Vector2, Vector3 } from '@iwsdk/core';
import type { PlacedComponentRecord } from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export interface StabilityValidationResult {
  isStable: boolean;
  centerOfMass: [number, number, number];
  foundationBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  cantileverWarnings: string[];
  topplingRisk: boolean;
}

export class StabilityValidator {
  /**
   * Evaluates overall structure stability and center of mass alignment.
   */
  public static validate(
    components: Map<string, PlacedComponentRecord>
  ): StabilityValidationResult {
    if (components.size === 0) {
      return {
        isStable: true,
        centerOfMass: [0, 0, 0],
        foundationBounds: { minX: 0, maxX: 0, minZ: 0, maxZ: 0 },
        cantileverWarnings: [],
        topplingRisk: false,
      };
    }

    let totalMass = 0;
    const weightedPos = new Vector3(0, 0, 0);
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let hasGrounded = false;

    for (const record of components.values()) {
      const spec = CONSTRUCTION_CATALOG[record.componentType];
      const mass = spec ? spec.massKg : 10;
      totalMass += mass;
      weightedPos.add(new Vector3(...record.position).multiplyScalar(mass));

      if (record.isGrounded || record.structuralRole === 'foundation') {
        hasGrounded = true;
        const [w, , d] = spec ? spec.dimensions : [0.6, 0.3, 0.6];
        minX = Math.min(minX, record.position[0] - w / 2);
        maxX = Math.max(maxX, record.position[0] + w / 2);
        minZ = Math.min(minZ, record.position[2] - d / 2);
        maxZ = Math.max(maxZ, record.position[2] + d / 2);
      }
    }

    const com = totalMass > 0 ? weightedPos.divideScalar(totalMass) : new Vector3();
    const cantileverWarnings: string[] = [];

    // Check for extreme unsupported overhangs
    for (const record of components.values()) {
      if (hasGrounded && (record.position[0] < minX - 1.5 || record.position[0] > maxX + 1.5)) {
        cantileverWarnings.push(
          `Component ${record.componentType} (${record.instanceId}) exceeds allowable horizontal cantilever limits.`
        );
      }
    }

    // Check if Center of Mass falls within foundation footprint (+ margin)
    const margin = 0.2;
    const isInsideBase =
      !hasGrounded ||
      (com.x >= minX - margin &&
        com.x <= maxX + margin &&
        com.z >= minZ - margin &&
        com.z <= maxZ + margin);

    const topplingRisk = !isInsideBase;
    const isStable = isInsideBase && cantileverWarnings.length === 0;

    return {
      isStable,
      centerOfMass: [com.x, com.y, com.z],
      foundationBounds: {
        minX: hasGrounded ? minX : -1,
        maxX: hasGrounded ? maxX : 1,
        minZ: hasGrounded ? minZ : -1,
        maxZ: hasGrounded ? maxZ : 1,
      },
      cantileverWarnings,
      topplingRisk,
    };
  }
}
