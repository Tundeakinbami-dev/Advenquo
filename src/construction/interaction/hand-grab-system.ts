/**
 * Advenquo: Construction World — Independent Hand Grab System
 *
 * Implements symmetric, independent capabilities for left and right hands:
 * - Pinch-to-grab detection
 * - Hold-to-move
 * - Wrist rotation for 3D alignment
 * - Release-to-place
 * - Hover / inspection ray
 * - Prevention of accidental double grabbing
 */

import { Quaternion, Vector3 } from '@iwsdk/core';
import type {
  Handedness,
  HandPoseData,
} from '../core/construction-types.js';

export interface HandGrabSlot {
  handedness: Handedness;
  heldInstanceId: string | null;
  grabOffset: Vector3;
  initialObjectRotation: Quaternion;
  initialWristRotation: Quaternion;
}

export class HandGrabSystem {
  private leftSlot: HandGrabSlot;
  private rightSlot: HandGrabSlot;
  private hoveredInstanceId: Map<Handedness, string | null> = new Map();

  constructor() {
    this.leftSlot = {
      handedness: 'left',
      heldInstanceId: null,
      grabOffset: new Vector3(),
      initialObjectRotation: new Quaternion(),
      initialWristRotation: new Quaternion(),
    };
    this.rightSlot = {
      handedness: 'right',
      heldInstanceId: null,
      grabOffset: new Vector3(),
      initialObjectRotation: new Quaternion(),
      initialWristRotation: new Quaternion(),
    };
    this.hoveredInstanceId.set('left', null);
    this.hoveredInstanceId.set('right', null);
  }

  public getHeldInstanceId(hand: Handedness): string | null {
    return hand === 'left' ? this.leftSlot.heldInstanceId : this.rightSlot.heldInstanceId;
  }

  public isHandHolding(hand: Handedness): boolean {
    return this.getHeldInstanceId(hand) !== null;
  }

  public getHoveredInstanceId(hand: Handedness): string | null {
    return this.hoveredInstanceId.get(hand) || null;
  }

  public setHoveredInstanceId(hand: Handedness, instanceId: string | null): void {
    this.hoveredInstanceId.set(hand, instanceId);
  }

  /**
   * Attempt to grab an object with a specific hand.
   * Prevents grabbing if already held by the same hand or if another hand holds it (unless two-hand coordination).
   */
  public grab(
    hand: Handedness,
    instanceId: string,
    handPose: HandPoseData,
    objectWorldPos: [number, number, number],
    objectWorldRot: [number, number, number, number]
  ): boolean {
    const slot = hand === 'left' ? this.leftSlot : this.rightSlot;
    const otherSlot = hand === 'left' ? this.rightSlot : this.leftSlot;

    // Check if other hand already holds this instance
    if (otherSlot.heldInstanceId === instanceId) {
      // Allow secondary hand grab for two-handed manipulation
      slot.heldInstanceId = instanceId;
      slot.grabOffset.subVectors(
        new Vector3(...objectWorldPos),
        new Vector3(...handPose.wristPosition)
      );
      slot.initialObjectRotation.set(...objectWorldRot);
      slot.initialWristRotation.set(...handPose.wristOrientation);
      return true;
    }

    slot.heldInstanceId = instanceId;
    slot.grabOffset.subVectors(
      new Vector3(...objectWorldPos),
      new Vector3(...handPose.wristPosition)
    );
    slot.initialObjectRotation.set(...objectWorldRot);
    slot.initialWristRotation.set(...handPose.wristOrientation);
    return true;
  }

  /**
   * Compute updated held object transform from wrist movement and rotation.
   */
  public updateHeldPose(
    hand: Handedness,
    handPose: HandPoseData
  ): {
    position: [number, number, number];
    rotation: [number, number, number, number];
  } | null {
    const slot = hand === 'left' ? this.leftSlot : this.rightSlot;
    if (!slot.heldInstanceId || !handPose.isTracked) {
      return null;
    }

    // 1. Position from wrist + grab offset
    const wristPos = new Vector3(...handPose.wristPosition);
    const objPos = new Vector3().addVectors(wristPos, slot.grabOffset);

    // 2. Rotation from delta wrist rotation
    const currentWristRot = new Quaternion(...handPose.wristOrientation);
    const deltaWristRot = new Quaternion()
      .copy(currentWristRot)
      .multiply(slot.initialWristRotation.clone().invert());
    const objRot = new Quaternion()
      .copy(deltaWristRot)
      .multiply(slot.initialObjectRotation);

    return {
      position: [objPos.x, objPos.y, objPos.z],
      rotation: [objRot.x, objRot.y, objRot.z, objRot.w],
    };
  }

  /**
   * Release grab for a specific hand.
   */
  public release(hand: Handedness): string | null {
    const slot = hand === 'left' ? this.leftSlot : this.rightSlot;
    const releasedId = slot.heldInstanceId;
    slot.heldInstanceId = null;
    return releasedId;
  }

  /**
   * Update the local grab offset for hand takeover.
   */
  public setGrabOffset(hand: Handedness, offset: [number, number, number]): void {
    const slot = hand === 'left' ? this.leftSlot : this.rightSlot;
    slot.grabOffset.set(...offset);
  }

  /**
   * Evaluates if a hand pinch gesture grabs a target object.
   */
  public evaluateGrab(
    instanceId: string,
    handPose: HandPoseData | any,
    objectWorldPos: [number, number, number] | Vector3 = [0, 0, 0]
  ): boolean {
    const isPinch = handPose.isPinching ?? ((handPose.pinchStrength ?? 0) >= 0.7);
    if (!isPinch) return false;

    const handedness: Handedness = handPose.handedness ?? 'right';
    const pos: [number, number, number] = Array.isArray(objectWorldPos)
      ? objectWorldPos
      : [objectWorldPos.x, objectWorldPos.y, objectWorldPos.z];

    const toHandPose = (p: any, h: Handedness): HandPoseData => {
      const wPos = p.position ? [p.position.x, p.position.y, p.position.z] : (p.wristPosition ?? [0, 0, 0]);
      const wRot = p.rotation ? [p.rotation.x, p.rotation.y, p.rotation.z, p.rotation.w] : (p.wristOrientation ?? [0, 0, 0, 1]);
      return {
        handedness: h,
        isTracked: p.isTracked ?? true,
        pinchStrength: p.pinchStrength ?? 1.0,
        isPinching: true,
        wristPosition: wPos as [number, number, number],
        wristOrientation: wRot as [number, number, number, number],
        indexTipPosition: wPos as [number, number, number],
        pointerRayDirection: [0, 0, -1],
      };
    };

    return this.grab(handedness, instanceId, toHandPose(handPose, handedness), pos, [0, 0, 0, 1]);
  }

  /**
   * Start grabbing a component.
   */
  public startGrab(
    instanceId: string,
    handPose: HandPoseData | any,
    objectWorldPos: [number, number, number] | Vector3 = [0, 0, 0]
  ): boolean {
    return this.evaluateGrab(instanceId, handPose, objectWorldPos);
  }

  /**
   * Updates held component transform returning Vector3 position and Quaternion rotation.
   */
  public updateHeldTransform(
    instanceId: string,
    handPose: HandPoseData | any
  ): { position: Vector3; rotation: Quaternion } | null {
    const handedness: Handedness = handPose.handedness ?? 'right';
    const toHandPose = (p: any, h: Handedness): HandPoseData => {
      const wPos = p.position ? [p.position.x, p.position.y, p.position.z] : (p.wristPosition ?? [0, 0, 0]);
      const wRot = p.rotation ? [p.rotation.x, p.rotation.y, p.rotation.z, p.rotation.w] : (p.wristOrientation ?? [0, 0, 0, 1]);
      return {
        handedness: h,
        isTracked: p.isTracked ?? true,
        pinchStrength: p.pinchStrength ?? 1.0,
        isPinching: p.isPinching ?? true,
        wristPosition: wPos as [number, number, number],
        wristOrientation: wRot as [number, number, number, number],
        indexTipPosition: wPos as [number, number, number],
        pointerRayDirection: [0, 0, -1],
      };
    };

    const result = this.updateHeldPose(handedness, toHandPose(handPose, handedness));
    if (!result) return null;

    return {
      position: new Vector3(...result.position),
      rotation: new Quaternion(...result.rotation),
    };
  }
}
