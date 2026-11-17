/**
 * Advenquo: Construction World — Assessment Engine
 *
 * Evaluates player construction against blueprint specifications:
 * - Component quantity validation
 * - Placement coordinate validation (within positionToleranceMeters)
 * - Orientation validation (within rotationToleranceDeg)
 * - Connection validation (verifies required structural bonds in the graph)
 * - Structural stability validation (delegates to StructuralValidator)
 * - Educational disclaimer
 */

import { Quaternion, Vector3 } from '@iwsdk/core';

import type { ConnectionGraph } from '../assembly/connection-graph.js';
import type { BlueprintDefinition } from '../blueprints/blueprint-types.js';
import { CONSTRUCTION_CONSTANTS } from '../core/constants.js';
import type {
  ComponentType,
  StructuralAssessmentResult,
} from '../core/construction-types.js';
import { StructuralValidator } from './structural-validator.js';

export class AssessmentEngine {
  /**
   * Assesses an assembled structure against a target blueprint.
   */
  public static assessBlueprint(
    blueprint: BlueprintDefinition,
    graph: ConnectionGraph,
  ): StructuralAssessmentResult {
    const placedNodes = graph.getAllNodes().filter((n) => n.structuralRole !== 'foundation');
    const placementErrors: string[] = [];
    const connectionErrors: string[] = [];
    const feedbackNotes: string[] = [];

    // 1. Quantity Validation
    const placedCounts: Partial<Record<ComponentType, number>> = {};
    for (const node of placedNodes) {
      placedCounts[node.componentType] = (placedCounts[node.componentType] || 0) + 1;
    }

    const missingComponents: Array<{ type: ComponentType; count: number }> = [];
    for (const [typeStr, reqCount] of Object.entries(blueprint.requiredQuantities)) {
      const type = typeStr as ComponentType;
      const count = placedCounts[type] || 0;
      if (count < reqCount) {
        missingComponents.push({ type, count: reqCount - count });
      }
    }

    // 2. Target Matching: Check each blueprint target against placed nodes
    const matchedNodeIds = new Set<string>();
    let targetsMatched = 0;

    for (const target of blueprint.targets) {
      const targetPos = new Vector3(...target.targetPosition);
      const targetRot = new Quaternion(...target.targetRotation);

      let bestMatchNodeId: string | null = null;
      let closestDist = Infinity;

      for (const node of placedNodes) {
        if (matchedNodeIds.has(node.instanceId)) continue;
        if (node.componentType !== target.componentType) continue;

        const nodePos = new Vector3(...node.position);
        const dist = nodePos.distanceTo(targetPos);

        const posTol = target.positionToleranceMeters ?? 0.15;
        const rotTol = target.rotationToleranceDeg ?? 25;

        if (dist <= posTol && dist < closestDist) {
          // Check rotation tolerance
          const nodeRot = new Quaternion(...node.rotation);
          const angleDiffDeg = (nodeRot.angleTo(targetRot) * 180) / Math.PI;

          if (angleDiffDeg <= rotTol) {
            closestDist = dist;
            bestMatchNodeId = node.instanceId;
          }
        }
      }

      if (bestMatchNodeId) {
        matchedNodeIds.add(bestMatchNodeId);
        targetsMatched++;

        // Verify required connections for this matched target
        for (const req of (target.requiredConnections ?? [])) {
          if (req.targetItemId === 'foundation_slab') {
            const isGrounded = graph.isConnectedToGround(bestMatchNodeId);
            if (!isGrounded) {
              connectionErrors.push(
                `Required foundation anchor missing on "${target.id}" (${target.componentType}).`,
              );
            }
          }
        }
      } else {
        placementErrors.push(
          `Missing or misplaced ${target.componentType} at target "${target.id}" (stage: ${target.stageName}).`,
        );
      }
    }

    // 3. Structural Stability Validation
    const stabilityReport = StructuralValidator.validateStructure(graph);

    // 4. Scoring and Completion Determination
    const totalTargets = blueprint.targets.length;
    const placementRatio = totalTargets > 0 ? targetsMatched / totalTargets : 0;
    const stabilityScore = stabilityReport.score / 100;

    const overallScore = Math.round((placementRatio * 0.6 + stabilityScore * 0.4) * 100);

    // Critical rule: A structure must NOT pass if a critical required connection is missing or if stability fails!
    const passed =
      targetsMatched === totalTargets &&
      missingComponents.length === 0 &&
      connectionErrors.length === 0 &&
      stabilityReport.isStable;

    if (passed) {
      feedbackNotes.push(
        'Congratulations! Construction challenge passed with full blueprint compliance and stable load-bearing transfer.',
      );
    } else {
      if (missingComponents.length > 0) {
        feedbackNotes.push(
          `Incomplete materials: ${missingComponents.map((m) => `${m.count}x ${m.type}`).join(', ')} remaining to place.`,
        );
      }
      if (placementErrors.length > 0) {
        feedbackNotes.push(
          `${placementErrors.length} components are out of alignment or missing from their blueprint positions.`,
        );
      }
      if (connectionErrors.length > 0) {
        feedbackNotes.push('Critical snap connections are missing between load-bearing members.');
      }
      feedbackNotes.push(...stabilityReport.feedbackNotes);
    }

    return {
      passed,
      score: overallScore,
      totalComponentsRequired: totalTargets,
      totalComponentsPlaced: placedNodes.length,
      missingComponents,
      placementErrors,
      connectionErrors,
      stabilityErrors: stabilityReport.stabilityErrors,
      feedbackNotes,
      disclaimer: CONSTRUCTION_CONSTANTS.DISCLAIMER,
    };
  }
}
