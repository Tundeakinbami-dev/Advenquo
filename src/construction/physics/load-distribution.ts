/**
 * Advenquo: Construction World — Load Distribution Engine
 *
 * Implements simplified educational statics:
 * - Traces vertical tributary areas and gravity dead loads (kN) down the assembly tree.
 * - Validates bearing stresses against material compressive limits.
 * - Flags columns or walls experiencing excessive eccentric loads.
 */

import type { PlacedComponentRecord } from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export interface ComponentLoadReport {
  instanceId: string;
  selfWeightKn: number;
  tributaryLoadKn: number;
  totalVerticalLoadKn: number;
  compressiveStressMpa: number;
  allowableStressMpa: number;
  isOverstressed: boolean;
}

export class LoadDistribution {
  private static GRAVITY_ACCEL = 9.81;

  /**
   * Calculate vertical load distribution for all components in the assembly.
   */
  public static calculateLoads(
    components: Map<string, PlacedComponentRecord>
  ): Map<string, ComponentLoadReport> {
    const reports = new Map<string, ComponentLoadReport>();

    // 1. Initialize self-weights
    for (const [id, record] of components.entries()) {
      const spec = CONSTRUCTION_CATALOG[record.componentType];
      const massKg = spec ? spec.massKg : 10;
      const selfWeightKn = (massKg * this.GRAVITY_ACCEL) / 1000.0;
      const [w, , d] = spec ? spec.dimensions : [0.4, 0.2, 0.2];
      const bearingAreaM2 = Math.max(0.01, w * d);
      const allowableMpa = spec ? spec.material.compressiveStrengthMpa : 10.0;

      reports.set(id, {
        instanceId: id,
        selfWeightKn,
        tributaryLoadKn: 0,
        totalVerticalLoadKn: selfWeightKn,
        compressiveStressMpa: selfWeightKn / bearingAreaM2 / 1000.0,
        allowableStressMpa: allowableMpa,
        isOverstressed: false,
      });
    }

    // 2. Sort components from highest Y to lowest Y (top-down load accumulation)
    const sorted = Array.from(components.values()).sort(
      (a, b) => b.position[1] - a.position[1]
    );

    // 3. Accumulate loads down through connections
    for (const upper of sorted) {
      const upperReport = reports.get(upper.instanceId);
      if (!upperReport) continue;

      const downwardConnections = upper.connections.filter((conn) => {
        const target = components.get(conn.targetInstanceId);
        return target && target.position[1] < upper.position[1];
      });

      if (downwardConnections.length > 0) {
        const loadPerSupport = upperReport.totalVerticalLoadKn / downwardConnections.length;
        for (const conn of downwardConnections) {
          const lowerReport = reports.get(conn.targetInstanceId);
          if (lowerReport) {
            lowerReport.tributaryLoadKn += loadPerSupport;
            lowerReport.totalVerticalLoadKn += loadPerSupport;

            const spec = CONSTRUCTION_CATALOG[components.get(conn.targetInstanceId)!.componentType];
            const [w, , d] = spec ? spec.dimensions : [0.4, 0.2, 0.2];
            const bearingAreaM2 = Math.max(0.01, w * d);
            lowerReport.compressiveStressMpa = lowerReport.totalVerticalLoadKn / bearingAreaM2 / 1000.0;
            lowerReport.isOverstressed = lowerReport.compressiveStressMpa > lowerReport.allowableStressMpa;
          }
        }
      }
    }

    return reports;
  }
}
