/**
 * Advenquo: Construction World — Desktop Keyboard & Mouse Interaction Fallback
 *
 * Implements desktop controls for players outside VR:
 * - Click to pick up / select construction components
 * - Mouse drag to position in 3D construction space
 * - Q / E keys for yaw rotation (wrist rotation equivalent)
 * - R key for pitch rotation
 * - Click to release & snap
 * - U key to undo last placed component
 */

import { Quaternion, Vector3 } from '@iwsdk/core';

import { assemblySystem } from '../assembly/assembly-system.js';
import type { SnapCandidate } from '../assembly/snap-point.js';
import type { ComponentType } from '../core/construction-types.js';
import { constructionPhysicsManager } from '../physics/construction-physics-manager.js';
import { PlacementPreview } from './placement-preview.js';

export interface DesktopHeldItem {
  instanceId: string;
  componentType: ComponentType;
  position: Vector3;
  rotation: Quaternion;
}

export class DesktopConstructionController {
  private static instance: DesktopConstructionController | null = null;
  private preview: PlacementPreview = new PlacementPreview();
  private heldItem: DesktopHeldItem | null = null;
  private activeCandidate: SnapCandidate | null = null;
  private placementHistory: string[] = [];

  // Scratch objects
  private tempVec = new Vector3();
  private tempQuat = new Quaternion();

  public static getInstance(): DesktopConstructionController {
    if (!DesktopConstructionController.instance) {
      DesktopConstructionController.instance = new DesktopConstructionController();
    }
    return DesktopConstructionController.instance;
  }

  public getPreview(): PlacementPreview {
    return this.preview;
  }

  public getHeldItem(): DesktopHeldItem | null {
    return this.heldItem;
  }

  public isHoldingBlock(): boolean {
    return this.heldItem !== null;
  }

  public getHeldRotation(): [number, number, number, number] {
    if (!this.heldItem) return [0, 0, 0, 1];
    const q = this.heldItem.rotation;
    return [q.x, q.y, q.z, q.w];
  }

  public rotateYaw(angleDeltaRadians: number): void {
    this.rotateHeldComponentYaw(angleDeltaRadians);
  }

  public rotatePitch(angleDeltaRadians: number): void {
    this.rotateHeldComponentPitch(angleDeltaRadians);
  }

  public place(): { success: boolean; instanceId?: string } {
    return this.releaseAndPlace();
  }

  public selectComponent(
    instanceId: string,
    componentType: ComponentType,
    initialPos: Vector3,
    initialRot: Quaternion = new Quaternion(),
  ): void {
    this.heldItem = {
      instanceId,
      componentType,
      position: initialPos.clone(),
      rotation: initialRot.clone(),
    };

    constructionPhysicsManager.activateComponentForGrab(instanceId);
    assemblySystem.unregisterBlock(instanceId);
  }

  public moveHeldComponent(targetPosition: Vector3): void {
    if (!this.heldItem) return;

    this.heldItem.position.copy(targetPosition);

    // Evaluate snap candidate
    this.activeCandidate = assemblySystem.findBestSnapCandidate(
      this.heldItem.instanceId,
      this.heldItem.componentType,
      this.heldItem.position,
      this.heldItem.rotation,
    );

    this.preview.updatePreview(
      this.heldItem.componentType,
      this.activeCandidate,
      this.heldItem.position,
    );
  }

  public rotateHeldComponentYaw(angleDeltaRadians: number): void {
    if (!this.heldItem) return;

    this.tempQuat.setFromAxisAngle(new Vector3(0, 1, 0), angleDeltaRadians);
    this.heldItem.rotation.multiply(this.tempQuat).normalize();

    this.moveHeldComponent(this.heldItem.position);
  }

  public rotateHeldComponentPitch(angleDeltaRadians: number): void {
    if (!this.heldItem) return;

    this.tempQuat.setFromAxisAngle(new Vector3(1, 0, 0), angleDeltaRadians);
    this.heldItem.rotation.multiply(this.tempQuat).normalize();

    this.moveHeldComponent(this.heldItem.position);
  }

  public releaseAndPlace(): { success: boolean; instanceId?: string } {
    if (!this.heldItem) return { success: false };

    const instanceId = this.heldItem.instanceId;

    if (this.activeCandidate && this.activeCandidate.isValid) {
      const commit = assemblySystem.commitSnapPlacement(
        this.heldItem.instanceId,
        this.heldItem.componentType,
        this.activeCandidate,
      );

      if (commit.success) {
        this.heldItem.position.copy(commit.snappedPosition);
        this.heldItem.rotation.copy(commit.snappedRotation);
        constructionPhysicsManager.optimizePlacedComponent(instanceId);
        this.placementHistory.push(instanceId);
      }
    } else {
      // Settle at current location
      assemblySystem.registerPlacedBlock({
        instanceId: this.heldItem.instanceId,
        componentType: this.heldItem.componentType,
        position: this.heldItem.position.clone(),
        rotation: this.heldItem.rotation.clone(),
        isGrounded: this.heldItem.position.y <= 0.2,
      });
      constructionPhysicsManager.optimizePlacedComponent(instanceId);
      this.placementHistory.push(instanceId);
    }

    this.heldItem = null;
    this.activeCandidate = null;
    this.preview.hide();

    return { success: true, instanceId };
  }

  public undoLastPlacement(): string | null {
    const lastId = this.placementHistory.pop();
    if (!lastId) return null;

    assemblySystem.unregisterBlock(lastId);
    constructionPhysicsManager.activateComponentForGrab(lastId);
    return lastId;
  }

  public reset(): void {
    this.heldItem = null;
    this.activeCandidate = null;
    this.placementHistory = [];
    this.preview.hide();
  }
}

export const desktopConstructionController = DesktopConstructionController.getInstance();
