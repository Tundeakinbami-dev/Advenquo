/**
 * Advenquo: Construction World — Blueprint Types & Schema
 *
 * Defines the structural specification for construction challenges:
 * - Sequential construction stages (foundation -> first course -> walls -> openings -> lintel/columns -> roof)
 * - Required components with target positions, rotations, tolerances, and connections
 * - Blueprint verification criteria
 */

import type { ComponentType, StructuralRole } from '../core/construction-types.js';

export interface BlueprintTargetItem {
  id?: string;
  targetId?: string;
  componentType: ComponentType;
  structuralRole?: StructuralRole;
  targetPosition: [number, number, number];
  targetRotation: [number, number, number, number]; // Quaternion [x, y, z, w]
  positionToleranceMeters?: number; // e.g. 0.15m
  rotationToleranceDeg?: number; // e.g. 25 deg
  requiredConnections?: Array<{
    mySnapPointId: string;
    targetItemId: string;
    targetSnapPointId: string;
  }>;
  stageIndex: number; // 1 to 6
  stageName?: string;
  criticalLoadBearing?: boolean;
  description?: string;
}

export type BlueprintTarget = BlueprintTargetItem;

export interface BlueprintStageItem {
  stageIndex: number;
  title: string;
  instruction: string;
  criticalCheck: string;
}

export type BlueprintStage = BlueprintStageItem;

export interface BlueprintDefinition {
  id: string;
  title: string;
  description: string;
  estimatedBuildTimeMinutes: number;
  foundationDimensions: [number, number, number];
  foundationPosition: [number, number, number];
  requiredQuantities: Partial<Record<ComponentType, number>>;
  targets: BlueprintTargetItem[];
  stages: BlueprintStageItem[];
}
