/**
 * Advenquo: Construction World — Blueprint Validator
 *
 * Evaluates the player's assembled structure against the Authoritative Building Design:
 * - Foundation: Footprint, position, and dimensions
 * - Floor: Coverage and alignment
 * - Walls: Position, height, and plumbness
 * - Internal partitions: Correct room layout
 * - Openings: Lintel load transfer beams
 * - Doors: Opening placement and sizing
 * - Windows: Position, size, and orientation
 * - Roof: Structural truss alignment, bearing, and roof deck coverage
 * - Finishing: Fascia and eave elements
 * - Overall building: Compliance with target design
 *
 * Educational and gameplay feedback only — not professional structural certification.
 */

import { Quaternion, Vector3 } from '@iwsdk/core';
import type {
  ComponentType,
  PlacedComponentRecord,
} from '../core/construction-types.js';
import type { BlueprintDefinition } from '../blueprints/blueprint-types.js';
import type {
  AuthoritativeBuildingDesign,
  DesignComponent,
} from '../blueprints/building-design.js';

export interface BlueprintValidationResult {
  passed: boolean;
  accuracyScore: number; // 0 to 40
  totalTargets: number;
  matchedTargets: number;
  missingComponents: Array<{ type: ComponentType; count: number }>;
  placementErrors: string[];
}

export interface ElementValidationReport {
  category: string;
  passed: boolean;
  score: number; // 0 to 100
  matchedCount: number;
  totalRequired: number;
  feedback: string[];
  missingComponents: string[];
}

export interface DetailedDesignValidationResult {
  passed: boolean;
  overallScore: number; // 0 to 100
  starRating: 0 | 1 | 2 | 3;
  totalComponents: number;
  matchedComponents: number;
  foundation: ElementValidationReport;
  floor: ElementValidationReport;
  walls: ElementValidationReport;
  internalPartitions: ElementValidationReport;
  openings: ElementValidationReport;
  doors: ElementValidationReport;
  windows: ElementValidationReport;
  roof: ElementValidationReport;
  finishing: ElementValidationReport;
  overallFeedback: string[];
  disclaimer: string;
}

export class BlueprintValidator {
  /**
   * Validates placed components against a BlueprintDefinition (backward-compatible).
   */
  public static validate(
    blueprint: BlueprintDefinition,
    placedComponents: Map<string, PlacedComponentRecord> | PlacedComponentRecord[],
    toleranceM: number = 0.25,
  ): BlueprintValidationResult {
    const placedList = Array.isArray(placedComponents)
      ? placedComponents
      : Array.from(placedComponents.values());
    const matchedTargetIds = new Set<string>();
    const placementErrors: string[] = [];

    // Check targets
    for (const target of blueprint.targets) {
      let foundMatch = false;
      const targetId = target.id || target.targetId || 'target';

      for (const placed of placedList) {
        if (placed.componentType !== target.componentType) continue;

        const p1 = new Vector3(...placed.position);
        const p2 = new Vector3(...target.targetPosition);
        const dist = p1.distanceTo(p2);

        if (dist <= toleranceM) {
          // Check orientation if specified
          const q1 = new Quaternion(...placed.rotation);
          const q2 = new Quaternion(...target.targetRotation);
          const angle = q1.angleTo(q2);

          if (angle <= 0.6) {
            foundMatch = true;
            matchedTargetIds.add(targetId);
            break;
          }
        }
      }

      if (!foundMatch && target.criticalLoadBearing) {
        placementErrors.push(
          `Missing critical target: ${target.description || targetId} (${target.componentType})`,
        );
      }
    }

    // Check quantity requirements
    const missingComponents: Array<{ type: ComponentType; count: number }> = [];
    if (blueprint.requiredQuantities) {
      for (const [type, requiredCount] of Object.entries(blueprint.requiredQuantities)) {
        const placedCount = placedList.filter((p) => p.componentType === type).length;
        if (placedCount < (requiredCount || 0)) {
          missingComponents.push({
            type: type as ComponentType,
            count: (requiredCount || 0) - placedCount,
          });
        }
      }
    }

    const totalTargets = blueprint.targets.length;
    const matchedTargets = matchedTargetIds.size;
    const ratio = totalTargets > 0 ? matchedTargets / totalTargets : 1.0;
    const accuracyScore = Math.round(ratio * 40);

    const passed =
      matchedTargets === totalTargets &&
      missingComponents.length === 0 &&
      placementErrors.length === 0;

    return {
      passed,
      accuracyScore,
      totalTargets,
      matchedTargets,
      missingComponents,
      placementErrors,
    };
  }

  /**
   * Detailed architectural validation against an AuthoritativeBuildingDesign.
   * Evaluates Foundation, Floor, Walls, Partitions, Openings, Doors, Windows, Roof, and Finishing layers
   * with realistic hand-placement tolerances.
   */
  public static validateAgainstDesign(
    design: AuthoritativeBuildingDesign,
    placedComponents: Map<string, PlacedComponentRecord> | PlacedComponentRecord[],
    toleranceM: number = 0.25,
    rotationToleranceDeg: number = 30,
  ): DetailedDesignValidationResult {
    const placedList = Array.isArray(placedComponents)
      ? placedComponents
      : Array.from(placedComponents.values());

    const maxRad = (rotationToleranceDeg * Math.PI) / 180;
    const matchedCompIds = new Set<string>();

    const checkCategory = (
      name: string,
      filter: (c: DesignComponent) => boolean,
    ): ElementValidationReport => {
      const targets = design.components.filter(filter);
      const missing: string[] = [];
      const feedback: string[] = [];
      let matched = 0;

      for (const target of targets) {
        let match = false;
        const tol = target.positionToleranceM ?? toleranceM;
        const rotTol = target.rotationToleranceDeg ? (target.rotationToleranceDeg * Math.PI) / 180 : maxRad;

        for (const placed of placedList) {
          if (placed.componentType !== target.componentType) continue;

          const p1 = new Vector3(...placed.position);
          const p2 = new Vector3(...target.position);
          const dist = p1.distanceTo(p2);

          if (dist <= tol) {
            const q1 = new Quaternion(...placed.rotation);
            const q2 = new Quaternion(...target.rotation);
            const angle = q1.angleTo(q2);

            if (angle <= rotTol) {
              match = true;
              matchedCompIds.add(target.id);
              break;
            }
          }
        }

        if (match) {
          matched++;
        } else {
          missing.push(target.description || target.id);
        }
      }

      const total = targets.length;
      const score = total > 0 ? Math.round((matched / total) * 100) : 100;
      const passed = matched === total;

      if (passed) {
        feedback.push(`${name} is correctly positioned and aligned.`);
      } else if (missing.length > 0) {
        feedback.push(`${name}: ${missing.length} component(s) missing or misaligned.`);
      }

      return {
        category: name,
        passed,
        score,
        matchedCount: matched,
        totalRequired: total,
        feedback,
        missingComponents: missing,
      };
    };

    // Evaluate all 9 architectural categories
    const foundation = checkCategory('Foundation', (c) => c.layerId === 'foundation');
    const floor = checkCategory('Floor', (c) => c.layerId === 'floor_slab');
    const walls = checkCategory('Structural Walls', (c) => c.layerId === 'structural_walls');
    const internalPartitions = checkCategory('Internal Partitions', (c) => c.layerId === 'internal_partitions');
    const openings = checkCategory('Openings & Lintels', (c) => c.layerId === 'openings');
    const doors = checkCategory('Doors', (c) => c.layerId === 'doors_windows' && c.componentType === 'door_frame');
    const windows = checkCategory('Windows', (c) => c.layerId === 'doors_windows' && c.componentType === 'window_frame');
    const roof = checkCategory(
      'Roof',
      (c) => c.layerId === 'roof_structure' || c.layerId === 'roofing_materials',
    );
    const finishing = checkCategory('Finishing Elements', (c) => c.layerId === 'finishing');

    const totalComps = design.components.length;
    const matchedCount = matchedCompIds.size;
    const overallScore = totalComps > 0 ? Math.round((matchedCount / totalComps) * 100) : 100;

    let starRating: 0 | 1 | 2 | 3 = 0;
    if (overallScore >= 90) starRating = 3;
    else if (overallScore >= 75) starRating = 2;
    else if (overallScore >= 50) starRating = 1;

    const overallFeedback: string[] = [];
    if (foundation.passed) overallFeedback.push('✓ Foundation footprint confirmed.');
    else overallFeedback.push('⚠ Foundation footings incomplete or misaligned.');

    if (floor.passed) overallFeedback.push('✓ Floor slab coverage complete.');
    if (walls.passed && internalPartitions.passed) overallFeedback.push('✓ Wall layout & room partitioning validated.');
    if (openings.passed) overallFeedback.push('✓ Lintel beams seated across openings.');
    if (doors.passed && windows.passed) overallFeedback.push('✓ Door & window openings properly framed.');
    if (roof.passed) overallFeedback.push('✓ Roof trusses and weather cladding installed.');
    if (finishing.passed) overallFeedback.push('✓ Eaves finishing boards secured.');

    const passed =
      foundation.passed &&
      floor.passed &&
      walls.passed &&
      internalPartitions.passed &&
      roof.passed &&
      overallScore >= 75;

    return {
      passed,
      overallScore,
      starRating,
      totalComponents: totalComps,
      matchedComponents: matchedCount,
      foundation,
      floor,
      walls,
      internalPartitions,
      openings,
      doors,
      windows,
      roof,
      finishing,
      overallFeedback,
      disclaimer:
        'Validation is for gameplay and educational purposes only and does not constitute certified civil or structural engineering approval.',
    };
  }
}
