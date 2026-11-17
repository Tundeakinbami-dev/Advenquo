/**
 * Advenquo: Construction World — Block Snapping System
 *
 * Discovers and validates snap candidates between held components and existing placed structures.
 */

import { Quaternion, Vector3 } from '@iwsdk/core';
import type {
  ComponentType,
  PlacedComponentRecord,
  SnapPoint,
} from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';
import { ConnectionValidator } from './connection-validator.js';

export interface SnapCandidateResult {
  hasCandidate: boolean;
  targetInstanceId?: string;
  sourceSnapPointId?: string;
  targetSnapPointId?: string;
  snappedPosition?: [number, number, number];
  snappedRotation?: [number, number, number, number];
  distance?: number;
}

export class BlockSnappingSystem {
  /**
   * Search placed components for the closest compatible snap point to the held object.
   */
  public static findBestSnapCandidate(
    heldType: ComponentType,
    heldWorldPos: [number, number, number],
    heldWorldRot: [number, number, number, number],
    placedComponents: Map<string, PlacedComponentRecord>
  ): SnapCandidateResult {
    const heldSpec = CONSTRUCTION_CATALOG[heldType];
    if (!heldSpec || heldSpec.snapPoints.length === 0) {
      return { hasCandidate: false };
    }

    const heldRotQuat = new Quaternion(...heldWorldRot);
    const heldPosVec = new Vector3(...heldWorldPos);

    let bestCandidate: SnapCandidateResult = { hasCandidate: false };
    let minDistance = Infinity;

    for (const [targetId, targetRecord] of placedComponents.entries()) {
      const targetSpec = CONSTRUCTION_CATALOG[targetRecord.componentType];
      if (!targetSpec) continue;

      const targetRotQuat = new Quaternion(...targetRecord.rotation);
      const targetPosVec = new Vector3(...targetRecord.position);

      for (const targetSnap of targetSpec.snapPoints) {
        // Skip occupied sockets
        if (targetSnap.occupiedByEntityId) continue;

        // Compute world position and normal of target socket
        const targetLocalPos = new Vector3(...targetSnap.localPosition);
        const targetWorldPosVec = targetLocalPos.clone().applyQuaternion(targetRotQuat).add(targetPosVec);
        const targetWorldNormalVec = new Vector3(...targetSnap.localNormal).applyQuaternion(targetRotQuat).normalize();

        for (const sourceSnap of heldSpec.snapPoints) {
          // Compute world position and normal of source socket
          const sourceLocalPos = new Vector3(...sourceSnap.localPosition);
          const sourceWorldPosVec = sourceLocalPos.clone().applyQuaternion(heldRotQuat).add(heldPosVec);
          const sourceWorldNormalVec = new Vector3(...sourceSnap.localNormal).applyQuaternion(heldRotQuat).normalize();

          const validation = ConnectionValidator.validate({
            sourceType: heldType,
            sourceRole: heldSpec.structuralRole,
            sourceSnap,
            sourceWorldPos: [sourceWorldPosVec.x, sourceWorldPosVec.y, sourceWorldPosVec.z],
            sourceWorldNormal: [sourceWorldNormalVec.x, sourceWorldNormalVec.y, sourceWorldNormalVec.z],

            targetType: targetRecord.componentType,
            targetRole: targetRecord.structuralRole,
            targetSnap,
            targetWorldPos: [targetWorldPosVec.x, targetWorldPosVec.y, targetWorldPosVec.z],
            targetWorldNormal: [targetWorldNormalVec.x, targetWorldNormalVec.y, targetWorldNormalVec.z],
          });

          if (validation.isValid && validation.distance < minDistance) {
            minDistance = validation.distance;

            // Calculate exact snapped position: align source socket with target socket
            const targetPos = targetWorldPosVec.clone();
            const offsetFromCenter = sourceLocalPos.clone().applyQuaternion(heldRotQuat);
            const snappedCenter = targetPos.clone().sub(offsetFromCenter);

            bestCandidate = {
              hasCandidate: true,
              targetInstanceId: targetId,
              sourceSnapPointId: sourceSnap.id,
              targetSnapPointId: targetSnap.id,
              snappedPosition: [snappedCenter.x, snappedCenter.y, snappedCenter.z],
              snappedRotation: [...heldWorldRot],
              distance: validation.distance,
            };
          }
        }
      }
    }

    return bestCandidate;
  }
}
