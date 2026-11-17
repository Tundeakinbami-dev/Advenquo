/**
 * Advenquo: Blueprint Assistance & Learning System
 *
 * Provides 3 optional assistance tiers for players:
 * - Level 1: Visual Hint (highlights next required component and ghost target position)
 * - Level 2: Guided Hint (shows relevant architectural callout, dimensions, and snap connection explanation)
 * - Level 3: Demonstration (animated assembly trajectory showing how the component fits into place)
 */

import { Quaternion, Vector3 } from '@iwsdk/core';
import type {
  AuthoritativeBuildingDesign,
  DesignComponent,
} from './building-design.js';
import type { PlacedComponentRecord } from '../core/construction-types.js';

export type AssistanceLevel = 0 | 1 | 2 | 3;

export interface VisualHint {
  targetId: string;
  componentType: string;
  targetPosition: [number, number, number];
  targetRotation: [number, number, number, number];
  dimensions: [number, number, number];
  description: string;
}

export interface GuidedHint extends VisualHint {
  stageTitle: string;
  architecturalNote: string;
  connectionInstructions: string;
  relevantView: 'plan' | 'elevation_front' | 'elevation_rear' | 'elevation_left' | 'elevation_right';
}

export interface AssemblyDemoKeyframe {
  timeSeconds: number; // 0.0 to durationSeconds
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: number;
}

export interface DemonstrationHint extends GuidedHint {
  durationSeconds: number;
  keyframes: AssemblyDemoKeyframe[];
  assemblyTips: string[];
}

export class BlueprintAssistance {
  private design: AuthoritativeBuildingDesign;
  private currentLevel: AssistanceLevel = 0;
  private activeTargetComponent: DesignComponent | null = null;

  constructor(design: AuthoritativeBuildingDesign) {
    this.design = design;
  }

  public setAssistanceLevel(level: AssistanceLevel): void {
    this.currentLevel = level;
  }

  public getAssistanceLevel(): AssistanceLevel {
    return this.currentLevel;
  }

  /**
   * Finds the next unplaced component for the current stage.
   */
  public getNextRequiredComponent(
    currentStageIndex: number,
    placedComponents: Map<string, PlacedComponentRecord> | PlacedComponentRecord[],
    toleranceM: number = 0.25,
  ): DesignComponent | null {
    const placedList = Array.isArray(placedComponents)
      ? placedComponents
      : Array.from(placedComponents.values());

    const stageTargets = this.design.components.filter(
      (c) => c.stageIndex === currentStageIndex,
    );

    for (const target of stageTargets) {
      let isPlaced = false;
      for (const placed of placedList) {
        if (placed.componentType === target.componentType) {
          const dist = new Vector3(...placed.position).distanceTo(
            new Vector3(...target.position),
          );
          if (dist <= (target.positionToleranceM ?? toleranceM)) {
            isPlaced = true;
            break;
          }
        }
      }
      if (!isPlaced) {
        this.activeTargetComponent = target;
        return target;
      }
    }

    return null;
  }

  /**
   * Generates Level 1: Visual Hint
   */
  public getVisualHint(
    currentStageIndex: number,
    placedComponents: Map<string, PlacedComponentRecord> | PlacedComponentRecord[],
  ): VisualHint | null {
    const nextComp = this.getNextRequiredComponent(currentStageIndex, placedComponents);
    if (!nextComp) return null;

    return {
      targetId: nextComp.id,
      componentType: nextComp.componentType,
      targetPosition: nextComp.position,
      targetRotation: nextComp.rotation,
      dimensions: nextComp.dimensions,
      description: nextComp.description,
    };
  }

  /**
   * Generates Level 2: Guided Hint with architectural explanation & drawing recommendation
   */
  public getGuidedHint(
    currentStageIndex: number,
    placedComponents: Map<string, PlacedComponentRecord> | PlacedComponentRecord[],
  ): GuidedHint | null {
    const visual = this.getVisualHint(currentStageIndex, placedComponents);
    if (!visual) return null;

    const comp = this.activeTargetComponent!;
    let relevantView: GuidedHint['relevantView'] = 'plan';
    let connNote = 'Align component snap sockets flush with adjacent structural elements.';

    if (comp.layerId === 'foundation' || comp.layerId === 'floor_slab') {
      relevantView = 'plan';
      connNote = 'Align with perimeter foundation grid. Sits directly on compacted ground level ±0.00.';
    } else if (comp.layerId === 'structural_walls' || comp.layerId === 'internal_partitions') {
      relevantView = comp.position[2] > -2.0 ? 'elevation_front' : 'elevation_rear';
      connNote = 'Interlock bottom block socket with the foundation/floor deck. Ensure wall is plumb.';
    } else if (comp.layerId === 'openings' || comp.layerId === 'doors_windows') {
      relevantView = 'elevation_front';
      connNote = 'Slide frame into reserved portal gap. Lintel beam rests across the top bearing columns.';
    } else if (comp.layerId === 'roof_structure' || comp.layerId === 'roofing_materials') {
      relevantView = 'elevation_front';
      connNote = 'Seat truss heel directly onto the wall head plates. Sloped roof panels overlap at ridge apex.';
    }

    return {
      ...visual,
      stageTitle: `Stage ${comp.stageIndex}: ${comp.description}`,
      architecturalNote: `Requires ${comp.componentType.replace(/_/g, ' ')} (${comp.dimensions[0].toFixed(2)}m × ${comp.dimensions[1].toFixed(2)}m × ${comp.dimensions[2].toFixed(2)}m).`,
      connectionInstructions: connNote,
      relevantView,
    };
  }

  /**
   * Generates Level 3: Demonstration with keyframed assembly trajectory
   */
  public getDemonstration(
    currentStageIndex: number,
    placedComponents: Map<string, PlacedComponentRecord> | PlacedComponentRecord[],
  ): DemonstrationHint | null {
    const guided = this.getGuidedHint(currentStageIndex, placedComponents);
    if (!guided) return null;

    const comp = this.activeTargetComponent!;
    const targetPos = comp.position;
    const targetRot = comp.rotation;

    // Trajectory keyframes: Spawn above/beside, float towards placement, settle and lock
    const keyframes: AssemblyDemoKeyframe[] = [
      {
        timeSeconds: 0.0,
        position: [targetPos[0], targetPos[1] + 0.6, targetPos[2] + 0.4],
        rotation: [0, 0.3827, 0, 0.9239],
        scale: 0.9,
      },
      {
        timeSeconds: 1.0,
        position: [targetPos[0], targetPos[1] + 0.25, targetPos[2] + 0.1],
        rotation: targetRot,
        scale: 1.0,
      },
      {
        timeSeconds: 2.0,
        position: targetPos,
        rotation: targetRot,
        scale: 1.0,
      },
    ];

    return {
      ...guided,
      durationSeconds: 2.0,
      keyframes,
      assemblyTips: [
        'Grab component using hand pinch (index finger to thumb) or desktop drag.',
        'Use wrist rotation to align component with target ghost.',
        'Bring component within snap tolerance (0.20m) and release to lock.',
      ],
    };
  }
}
