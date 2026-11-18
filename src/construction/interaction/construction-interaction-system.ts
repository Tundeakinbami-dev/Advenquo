/**
 * Advenquo: Construction World — Hand Interaction & Snap Supervisor System
 *
 * Reuses native IWSDK hand-tracking integration (`useHandPinchForGrab: true`):
 * - Pinch-to-grab via `OneHandGrabbable` and `TwoHandsGrabbable`
 * - Hand-controlled movement and wrist rotation tracking
 * - Release-to-place snapping into assembly
 * - Dynamic-to-Static physics freeze upon placement to maintain Meta Quest 3 frame rates
 * - Placement preview and snap highlight updates
 * - Allocates scratch math objects once in init() (zero per-frame allocations)
 */

import {
  createSystem,
  Entity,
  Grabbed,
  Object3D,
  OneHandGrabbable,
  Quaternion,
  TwoHandsGrabbable,
  Vector3,
} from '@iwsdk/core';

import { assemblySystem } from '../assembly/assembly-system.js';
import type { SnapCandidate } from '../assembly/snap-point.js';
import {
  BlueprintPlacementGuide,
  ConstructionBlock,
  ConstructionWorkshopState,
} from '../core/construction-components.js';
import type { ComponentType } from '../core/construction-types.js';
import { constructionPhysicsManager } from '../physics/construction-physics-manager.js';
import { challengeManager } from '../progression/challenge-manager.js';
import { constructionTutorialManager } from '../progression/construction-tutorial-manager.js';
import {
  blueprintProgressionEngine,
  type TaskProgressSummary,
} from '../progression/blueprint-progression-engine.js';
import { PlacementPreview } from './placement-preview.js';

export class ConstructionInteractionSystem extends createSystem({
  grabbableBlocks: {
    required: [ConstructionBlock],
  },
  heldBlocks: {
    required: [ConstructionBlock, Grabbed],
  },
}) {
  private static instance: ConstructionInteractionSystem | null = null;
  private preview: PlacementPreview = new PlacementPreview();
  private activeCandidate: SnapCandidate | null = null;
  private lastHeldEntity: Entity | null = null;
  private guideEntity: Entity | null = null;

  // Scratch math objects allocated once
  private tempPos = new Vector3();
  private tempQuat = new Quaternion();

  public static getInstance(): ConstructionInteractionSystem | null {
    return ConstructionInteractionSystem.instance;
  }

  public getPreviewRoot(): Object3D {
    return this.preview.getRoot();
  }

  public getActiveCandidate(): SnapCandidate | null {
    return this.activeCandidate;
  }

  init(): void {
    ConstructionInteractionSystem.instance = this;
    if (this.world && (this.world as any).scene) {
      (this.world as any).scene.add(this.preview.getRoot());
    }

    // Create persistent ECS entity tracking blueprint placement guide & workshop state
    this.guideEntity = this.world.createTransformEntity();
    if (this.guideEntity.object3D) {
      this.guideEntity.object3D.name = 'BlueprintPlacementGuideEntity';
    }
    this.guideEntity.addComponent(BlueprintPlacementGuide);
    this.guideEntity.addComponent(ConstructionWorkshopState);

    const unsub = blueprintProgressionEngine.subscribe((summary) => {
      this._syncGuideEntity(summary);
    });
    this.cleanupFuncs.push(unsub);

    // Subscribe to grabbed entities
    this.queries.heldBlocks.subscribe('qualify', (entity: Entity) => {
      this.onBlockGrabbed(entity);
    });

    this.queries.heldBlocks.subscribe('disqualify', (entity: Entity) => {
      this.onBlockReleased(entity);
    });
  }

  private _syncGuideEntity(summary: TaskProgressSummary): void {
    if (!this.guideEntity) return;
    this.guideEntity.setValue(BlueprintPlacementGuide, 'targetComponentId', summary.activeTargetId || '');
    const activeTarget = blueprintProgressionEngine.getActiveTarget();
    this.guideEntity.setValue(BlueprintPlacementGuide, 'targetMaterialType', activeTarget?.componentType || '');
    this.guideEntity.setValue(BlueprintPlacementGuide, 'currentTaskId', `Task_${summary.currentTaskIndex}`);
    this.guideEntity.setValue(BlueprintPlacementGuide, 'isGhostActive', summary.activeTargetId !== null);
    this.guideEntity.setValue(
      BlueprintPlacementGuide,
      'validationStatus',
      summary.activeTargetId ? blueprintProgressionEngine.getTargetStatus(summary.activeTargetId) : 'unplaced',
    );

    this.guideEntity.setValue(ConstructionWorkshopState, 'activeChallengeId', summary.currentLevelId);
    this.guideEntity.setValue(ConstructionWorkshopState, 'completionPercentage', summary.overallLevelCompletionPercent);
    this.guideEntity.setValue(ConstructionWorkshopState, 'validationPassed', summary.isTaskCompleted);
    this.guideEntity.setValue(ConstructionWorkshopState, 'isCompleted', summary.isLevelCompleted);
  }

  private onBlockGrabbed(entity: Entity): void {
    const instanceId = entity.getValue(ConstructionBlock, 'instanceId') as string;
    const isPlaced = entity.getValue(ConstructionBlock, 'isPlaced') as boolean;
    if (!instanceId) return;

    entity.setValue(ConstructionBlock, 'isHeld', true);
    this.lastHeldEntity = entity;

    // Wake up physics body for kinematic manipulation
    constructionPhysicsManager.activateComponentForGrab(instanceId);
    constructionTutorialManager.onComponentSelected(entity.getValue(ConstructionBlock, 'componentType') as ComponentType);

    // If it was previously part of the assembly, temporarily detach it
    if (isPlaced) {
      entity.setValue(ConstructionBlock, 'isPlaced', false);
      assemblySystem.unregisterBlock(instanceId);
      blueprintProgressionEngine.onComponentRemoved(instanceId);
    }
  }

  private onBlockReleased(entity: Entity): void {
    const instanceId = entity.getValue(ConstructionBlock, 'instanceId') as string;
    const componentType = entity.getValue(ConstructionBlock, 'componentType') as ComponentType;
    if (!instanceId) return;

    entity.setValue(ConstructionBlock, 'isHeld', false);
    let isStacked = false;
    let hasConnection = false;

    if (this.activeCandidate && this.activeCandidate.isValid) {
      // Snap commit!
      const result = assemblySystem.commitSnapPlacement(
        instanceId,
        componentType,
        this.activeCandidate,
      );

      if (result.success && entity.object3D) {
        entity.object3D.position.copy(result.snappedPosition);
        entity.object3D.quaternion.copy(result.snappedRotation);
        entity.setValue(ConstructionBlock, 'isPlaced', true);
        isStacked = result.snappedPosition.y > 0.15;
        hasConnection = true;

        // Optimize physics body to STATIC for Quest 3 frame-rate safety
        constructionPhysicsManager.optimizePlacedComponent(instanceId);
        entity.setValue(ConstructionBlock, 'isStaticOptimized', true);
      }
    } else {
      // Free physics settlement
      constructionPhysicsManager.releaseComponentToPhysics(instanceId);
    }

    if (entity.object3D) {
      blueprintProgressionEngine.onComponentPlaced({
        instanceId,
        componentType,
        position: entity.object3D.position,
        rotation: entity.object3D.quaternion,
      });
    }

    constructionTutorialManager.onComponentPlaced({
      instanceId,
      componentType,
      isStacked,
      hasConnection,
    });
    challengeManager.evaluateProgress(assemblySystem.getGraph());

    this.preview.hide();
    this.activeCandidate = null;
    this.lastHeldEntity = null;
  }

  update(delta: number): void {
    const heldEntities = this.queries.heldBlocks.entities;
    if (heldEntities.size === 0) {
      if (this.activeCandidate) {
        this.preview.hide();
        this.activeCandidate = null;
      }
      return;
    }

    // Process currently held block (support single or dual-hand manipulation)
    for (const entity of heldEntities) {
      const instanceId = entity.getValue(ConstructionBlock, 'instanceId') as string;
      const componentType = entity.getValue(ConstructionBlock, 'componentType') as ComponentType;
      const object3D = entity.object3D;

      if (!instanceId || !object3D) continue;

      object3D.getWorldPosition(this.tempPos);
      object3D.getWorldQuaternion(this.tempQuat);
      constructionTutorialManager.onComponentMoved(this.tempPos);

      // Find nearest valid snap socket candidate
      this.activeCandidate = assemblySystem.findBestSnapCandidate(
        instanceId,
        componentType,
        this.tempPos,
        this.tempQuat,
      );

      // Update real-time ghost preview
      this.preview.updatePreview(
        componentType,
        this.activeCandidate,
        this.tempPos,
      );
      break;
    }
  }
}
