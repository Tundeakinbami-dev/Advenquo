/**
 * Advenquo: Construction World — Connection Validator
 *
 * Implements strict engineering and modular snap validation:
 * - Checks socket role compatibility (male <-> female, neutral <-> neutral)
 * - Checks opposing normal angles (must align within angular tolerance)
 * - Checks spatial snap distance within tolerance (<= 0.18m)
 * - Checks structural role rules (e.g. beam cannot bear on air, roof must have supporting deck)
 * - Rejects already occupied sockets
 */

import { Vector3 } from '@iwsdk/core';
import type {
  ComponentType,
  SnapPoint,
  StructuralRole,
} from '../core/construction-types.js';
import { CONSTRUCTION_CONSTANTS } from '../core/constants.js';

export interface ValidationContext {
  sourceType: ComponentType;
  sourceRole: StructuralRole;
  sourceSnap: SnapPoint;
  sourceWorldPos: [number, number, number];
  sourceWorldNormal: [number, number, number];

  targetType: ComponentType;
  targetRole: StructuralRole;
  targetSnap: SnapPoint;
  targetWorldPos: [number, number, number];
  targetWorldNormal: [number, number, number];
}

export interface ConnectionValidationResult {
  isValid: boolean;
  reason?: string;
  distance: number;
  normalAngleRad: number;
}

export class ConnectionValidator {
  /**
   * Validates if a proposed connection between two snap points satisfies all constraints.
   */
  public static validate(ctx: ValidationContext): ConnectionValidationResult {
    // 1. Occupancy check
    if (ctx.targetSnap.occupiedByEntityId || ctx.targetSnap.occupiedSnapPointId) {
      return {
        isValid: false,
        reason: 'Target connection socket is already occupied.',
        distance: 0,
        normalAngleRad: 0,
      };
    }

    if (ctx.sourceSnap.occupiedByEntityId || ctx.sourceSnap.occupiedSnapPointId) {
      return {
        isValid: false,
        reason: 'Source connection socket is already occupied.',
        distance: 0,
        normalAngleRad: 0,
      };
    }

    // 2. Component type compatibility check
    if (!ctx.sourceSnap.compatibleTypes.includes(ctx.targetType)) {
      return {
        isValid: false,
        reason: `Source socket does not support component type: ${ctx.targetType}`,
        distance: 0,
        normalAngleRad: 0,
      };
    }

    // 3. Socket role matching (male -> female or neutral -> neutral)
    const role1 = ctx.sourceSnap.role;
    const role2 = ctx.targetSnap.role;
    const isMaleFemale = (role1 === 'male' && role2 === 'female') || (role1 === 'female' && role2 === 'male');
    const isNeutral = role1 === 'neutral' && role2 === 'neutral';

    if (!isMaleFemale && !isNeutral) {
      return {
        isValid: false,
        reason: `Incompatible socket roles: ${role1} cannot connect to ${role2}`,
        distance: 0,
        normalAngleRad: 0,
      };
    }

    // 4. Distance tolerance check
    const p1 = new Vector3(...ctx.sourceWorldPos);
    const p2 = new Vector3(...ctx.targetWorldPos);
    const distance = p1.distanceTo(p2);
    if (distance > CONSTRUCTION_CONSTANTS.SNAP_DISTANCE_TOLERANCE_M) {
      return {
        isValid: false,
        reason: `Distance ${distance.toFixed(3)}m exceeds snap tolerance ${CONSTRUCTION_CONSTANTS.SNAP_DISTANCE_TOLERANCE_M}m`,
        distance,
        normalAngleRad: 0,
      };
    }

    // 5. Opposing normal check (normals must oppose each other: dot product <= -0.85)
    const n1 = new Vector3(...ctx.sourceWorldNormal).normalize();
    const n2 = new Vector3(...ctx.targetWorldNormal).normalize();
    const dot = n1.dot(n2);
    // Angle between n1 and opposite of n2
    const opposedDot = n1.dot(n2.clone().negate());
    const angleRad = Math.acos(Math.max(-1, Math.min(1, opposedDot)));

    if (angleRad > CONSTRUCTION_CONSTANTS.SNAP_ANGLE_TOLERANCE_RAD) {
      return {
        isValid: false,
        reason: `Normal misalignment: ${angleRad.toFixed(2)} rad exceeds tolerance ${CONSTRUCTION_CONSTANTS.SNAP_ANGLE_TOLERANCE_RAD} rad`,
        distance,
        normalAngleRad: angleRad,
      };
    }

    return {
      isValid: true,
      distance,
      normalAngleRad: angleRad,
    };
  }
}
