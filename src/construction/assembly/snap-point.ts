/**
 * Advenquo: Construction World — Snap Socket & Alignment Logic
 *
 * Implements:
 * - Snap point compatibility evaluation (types, roles, occupancy)
 * - Spatial distance & orientation tolerance checks
 * - Exact snap transform calculation (position & rotation alignment)
 * - World space transformation of snap sockets
 */

import { Quaternion, Vector3 } from '@iwsdk/core';

import { CONSTRUCTION_CONSTANTS } from '../core/constants.js';
import type { ComponentType, SnapPoint } from '../core/construction-types.js';

export interface WorldSnapPoint {
  id: string;
  sourceInstanceId: string;
  componentType: ComponentType;
  point: SnapPoint;
  worldPosition: Vector3;
  worldNormal: Vector3;
  isOccupied: boolean;
}

export interface SnapCandidate {
  sourceSnapPoint: WorldSnapPoint;
  targetSnapPoint: WorldSnapPoint;
  distance: number;
  normalDot: number;
  snappedPosition: Vector3;
  snappedRotation: Quaternion;
  isValid: boolean;
  rejectionReason?: string;
}

/**
 * Computes world position and world normal for a snap point on an entity.
 */
export function computeWorldSnapPoint(
  sourceInstanceId: string,
  componentType: ComponentType,
  point: SnapPoint,
  entityWorldPosition: Vector3,
  entityWorldQuaternion: Quaternion,
): WorldSnapPoint {
  const localPos = new Vector3(...point.localPosition);
  const localNorm = new Vector3(...point.localNormal);

  const worldPosition = localPos.applyQuaternion(entityWorldQuaternion).add(entityWorldPosition);
  const worldNormal = localNorm.applyQuaternion(entityWorldQuaternion).normalize();

  return {
    id: point.id,
    sourceInstanceId,
    componentType,
    point,
    worldPosition,
    worldNormal,
    isOccupied: Boolean(point.occupiedByEntityId),
  };
}

/**
 * Validates whether two snap sockets are compatible to form a structural bond.
 */
export function areSnapPointsCompatible(
  source: WorldSnapPoint,
  target: WorldSnapPoint,
): { compatible: boolean; reason?: string } {
  // 1. Same entity cannot snap to itself
  if (source.sourceInstanceId === target.sourceInstanceId) {
    return { compatible: false, reason: 'Cannot connect to self' };
  }

  // 2. Occupancy check
  if (source.isOccupied || target.isOccupied) {
    return { compatible: false, reason: 'Snap point already occupied' };
  }

  // 3. Gender/role compatibility (male <-> female, neutral <-> neutral)
  const roleA = source.point.role;
  const roleB = target.point.role;
  const rolesMatch =
    (roleA === 'male' && roleB === 'female') ||
    (roleA === 'female' && roleB === 'male') ||
    (roleA === 'neutral' && roleB === 'neutral');

  if (!rolesMatch) {
    return {
      compatible: false,
      reason: `Incompatible socket roles: ${roleA} cannot mate with ${roleB}`,
    };
  }

  // 4. Component type compatibility
  const sourceAccepts = source.point.compatibleTypes.includes(target.componentType);
  const targetAccepts = target.point.compatibleTypes.includes(source.componentType);

  if (!sourceAccepts || !targetAccepts) {
    return {
      compatible: false,
      reason: `Component incompatibility: ${source.componentType} cannot connect to ${target.componentType}`,
    };
  }

  return { compatible: true };
}

/**
 * Evaluates spatial proximity and normal alignment to find the best snap candidate.
 */
export function evaluateSnapCandidate(
  source: WorldSnapPoint,
  target: WorldSnapPoint,
  heldEntityRotation: Quaternion,
): SnapCandidate {
  const distance = source.worldPosition.distanceTo(target.worldPosition);
  const normalDot = source.worldNormal.dot(target.worldNormal);

  const compatibility = areSnapPointsCompatible(source, target);
  if (!compatibility.compatible) {
    return {
      sourceSnapPoint: source,
      targetSnapPoint: target,
      distance,
      normalDot,
      snappedPosition: source.worldPosition.clone(),
      snappedRotation: heldEntityRotation.clone(),
      isValid: false,
      rejectionReason: compatibility.reason,
    };
  }

  // Distance check
  if (distance > CONSTRUCTION_CONSTANTS.SNAP_DISTANCE_TOLERANCE) {
    return {
      sourceSnapPoint: source,
      targetSnapPoint: target,
      distance,
      normalDot,
      snappedPosition: source.worldPosition.clone(),
      snappedRotation: heldEntityRotation.clone(),
      isValid: false,
      rejectionReason: `Distance ${distance.toFixed(2)}m exceeds tolerance (${CONSTRUCTION_CONSTANTS.SNAP_DISTANCE_TOLERANCE}m)`,
    };
  }

  // Orientation check: normals should oppose each other (dot product near -1)
  if (normalDot > CONSTRUCTION_CONSTANTS.SNAP_NORMAL_ALIGNMENT_DOT) {
    return {
      sourceSnapPoint: source,
      targetSnapPoint: target,
      distance,
      normalDot,
      snappedPosition: source.worldPosition.clone(),
      snappedRotation: heldEntityRotation.clone(),
      isValid: false,
      rejectionReason: `Angular misalignment: normals do not oppose each other (dot = ${normalDot.toFixed(2)})`,
    };
  }

  // Calculate required rotation to align source normal opposite to target normal
  const targetOppositeNormal = target.worldNormal.clone().negate();
  const rotationAlign = new Quaternion().setFromUnitVectors(
    source.worldNormal,
    targetOppositeNormal,
  );
  const snappedRotation = rotationAlign.multiply(heldEntityRotation).normalize();

  // Calculate snapped world position for the source entity
  // offset = targetWorldPosition - rotatedSourceLocalPosition
  const rotatedLocalPos = new Vector3(...source.point.localPosition).applyQuaternion(
    snappedRotation,
  );
  const snappedPosition = target.worldPosition.clone().sub(rotatedLocalPos);

  return {
    sourceSnapPoint: source,
    targetSnapPoint: target,
    distance,
    normalDot,
    snappedPosition,
    snappedRotation,
    isValid: true,
  };
}
