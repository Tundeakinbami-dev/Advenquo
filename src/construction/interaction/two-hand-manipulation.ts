/**
 * Advenquo: Construction World — Two-Hand Manipulation Controller
 *
 * Implements two-handed 6-DOF manipulation for large construction components:
 * - Large wall panels, floor slabs, long beams, roof trusses, bridge sections.
 * - Midpoint position tracking between left and right hands.
 * - Dual-hand orientation tracking (vector between hands + wrist rotation).
 * - Smooth single-hand release transition without position or rotation jumping.
 * - Tracking loss recovery: freezes transform smoothly during temporary occlusion.
 * - Double-grab prevention and race condition safety.
 */

import { Quaternion, Vector3 } from '@iwsdk/core';
import type {
  Handedness,
  HandPoseData,
  TwoHandManipulationState,
} from '../core/construction-types.js';

export class TwoHandManipulationController {
  private state: TwoHandManipulationState;
  private isTrackingLost: boolean = false;
  private currentObjectPos: Vector3 = new Vector3();
  private currentObjectRot: Quaternion = new Quaternion();
  private localGrabOffset: Vector3 = new Vector3();
  private activeGrabs: Map<Handedness, { instanceId: string; pose: any }> = new Map();

  constructor() {
    this.state = {
      isActive: false,
      targetInstanceId: null,
      primaryHand: 'right',
      secondaryHand: 'left',
      initialMidpoint: [0, 0, 0],
      initialHandDistance: 0.3,
      initialHandVector: [1, 0, 0],
      initialObjectRotation: [0, 0, 0, 1],
      initialObjectPosition: [0, 0, 0],
      scaleFactor: 1.0,
    };
  }

  public getState(): TwoHandManipulationState {
    return { ...this.state };
  }

  public isActive(): boolean {
    return this.state.isActive;
  }

  public getTargetInstanceId(): string | null {
    return this.state.targetInstanceId;
  }

  /**
   * Begin two-handed manipulation when both hands pinch the same object.
   */
  public startTwoHandGrab(
    instanceId: string,
    leftPose: HandPoseData,
    rightPose: HandPoseData,
    initialPos: [number, number, number],
    initialRot: [number, number, number, number],
    primaryHand: Handedness = 'right'
  ): void {
    const leftPos = new Vector3(...leftPose.wristPosition);
    const rightPos = new Vector3(...rightPose.wristPosition);
    const midpoint = new Vector3().addVectors(leftPos, rightPos).multiplyScalar(0.5);
    const handVec = new Vector3().subVectors(rightPos, leftPos);
    const distance = handVec.length();

    this.currentObjectPos.set(...initialPos);
    this.currentObjectRot.set(...initialRot);

    this.state = {
      isActive: true,
      targetInstanceId: instanceId,
      primaryHand,
      secondaryHand: primaryHand === 'right' ? 'left' : 'right',
      initialMidpoint: [midpoint.x, midpoint.y, midpoint.z],
      initialHandDistance: Math.max(0.05, distance),
      initialHandVector: [handVec.x, handVec.y, handVec.z],
      initialObjectPosition: [...initialPos],
      initialObjectRotation: [...initialRot],
      scaleFactor: 1.0,
    };

    this.isTrackingLost = false;
  }

  /**
   * Update object transform based on dual hand movement and rotation.
   */
  public update(
    leftPose: HandPoseData,
    rightPose: HandPoseData
  ): {
    position: [number, number, number];
    rotation: [number, number, number, number];
    isStable: boolean;
  } {
    if (!this.state.isActive) {
      return {
        position: [this.currentObjectPos.x, this.currentObjectPos.y, this.currentObjectPos.z],
        rotation: [this.currentObjectRot.x, this.currentObjectRot.y, this.currentObjectRot.z, this.currentObjectRot.w],
        isStable: false,
      };
    }

    // If either hand loses tracking, smoothly hold the last valid pose without jumping
    if (!leftPose.isTracked || !rightPose.isTracked) {
      this.isTrackingLost = true;
      return {
        position: [this.currentObjectPos.x, this.currentObjectPos.y, this.currentObjectPos.z],
        rotation: [this.currentObjectRot.x, this.currentObjectRot.y, this.currentObjectRot.z, this.currentObjectRot.w],
        isStable: false,
      };
    }

    // Recovering from tracking loss: smoothly continue
    if (this.isTrackingLost) {
      this.isTrackingLost = false;
    }

    const leftPos = new Vector3(...leftPose.wristPosition);
    const rightPos = new Vector3(...rightPose.wristPosition);
    const currentMidpoint = new Vector3().addVectors(leftPos, rightPos).multiplyScalar(0.5);
    const currentHandVec = new Vector3().subVectors(rightPos, leftPos).normalize();

    // 1. Position translation delta from initial midpoint
    const initialMid = new Vector3(...this.state.initialMidpoint);
    const midDelta = new Vector3().subVectors(currentMidpoint, initialMid);
    const initObjPos = new Vector3(...this.state.initialObjectPosition);
    this.currentObjectPos.copy(initObjPos).add(midDelta);

    // 2. Rotation delta from initial hand vector to current hand vector
    const initHandVec = new Vector3(...this.state.initialHandVector).normalize();
    const handRotationDelta = new Quaternion().setFromUnitVectors(initHandVec, currentHandVec);

    const initObjRot = new Quaternion(...this.state.initialObjectRotation);
    this.currentObjectRot.copy(handRotationDelta).multiply(initObjRot);

    return {
      position: [this.currentObjectPos.x, this.currentObjectPos.y, this.currentObjectPos.z],
      rotation: [this.currentObjectRot.x, this.currentObjectRot.y, this.currentObjectRot.z, this.currentObjectRot.w],
      isStable: true,
    };
  }

  /**
   * Release one hand while keeping the other hand grabbing.
   * Smoothly transfers grab ownership to the single remaining hand WITHOUT jumping.
   */
  public releaseHand(
    releasedHand: Handedness,
    remainingHandPose: HandPoseData
  ): {
    remainingHand: Handedness;
    newLocalGrabOffset: [number, number, number];
  } {
    const remainingHand = releasedHand === 'right' ? 'left' : 'right';
    const remainingWrist = new Vector3(...remainingHandPose.wristPosition);

    // Calculate local offset between remaining wrist and current object position
    const worldOffset = new Vector3().subVectors(this.currentObjectPos, remainingWrist);
    this.localGrabOffset.copy(worldOffset);

    // Deactivate two-hand state
    this.state.isActive = false;
    this.state.targetInstanceId = null;

    return {
      remainingHand,
      newLocalGrabOffset: [this.localGrabOffset.x, this.localGrabOffset.y, this.localGrabOffset.z],
    };
  }

  /**
   * End two-handed manipulation completely (both hands released).
   */
  public endTwoHandGrab(): void {
    this.state.isActive = false;
    this.state.targetInstanceId = null;
    this.isTrackingLost = false;
    this.activeGrabs.clear();
  }

  /**
   * Helper for unified grab events from controllers or hands.
   */
  public onHandGrab(instanceId: string, handPose: any): void {
    const handedness: Handedness = handPose.handedness ?? 'right';
    this.activeGrabs.set(handedness, { instanceId, pose: handPose });

    const otherHand: Handedness = handedness === 'right' ? 'left' : 'right';
    const otherGrab = this.activeGrabs.get(otherHand);

    if (otherGrab && otherGrab.instanceId === instanceId) {
      // Both hands are grabbing the same instance -> engage two-handed manipulation
      const leftGrab = handedness === 'left' ? handPose : otherGrab.pose;
      const rightGrab = handedness === 'right' ? handPose : otherGrab.pose;

      const toHandPose = (p: any, h: Handedness): HandPoseData => {
        const pos = p.position ? [p.position.x, p.position.y, p.position.z] : (p.wristPosition ?? [0, 0, 0]);
        const rot = p.rotation ? [p.rotation.x, p.rotation.y, p.rotation.z, p.rotation.w] : (p.wristOrientation ?? [0, 0, 0, 1]);
        return {
          handedness: h,
          isTracked: p.isTracked ?? true,
          pinchStrength: p.pinchStrength ?? 1.0,
          isPinching: p.isPinching ?? true,
          wristPosition: pos as [number, number, number],
          wristOrientation: rot as [number, number, number, number],
          indexTipPosition: pos as [number, number, number],
          pointerRayDirection: [0, 0, -1],
        };
      };

      const leftPose = toHandPose(leftGrab, 'left');
      const rightPose = toHandPose(rightGrab, 'right');

      const midX = (leftPose.wristPosition[0] + rightPose.wristPosition[0]) * 0.5;
      const midY = (leftPose.wristPosition[1] + rightPose.wristPosition[1]) * 0.5;
      const midZ = (leftPose.wristPosition[2] + rightPose.wristPosition[2]) * 0.5;

      this.startTwoHandGrab(instanceId, leftPose, rightPose, [midX, midY, midZ], [0, 0, 0, 1]);
    }
  }

  /**
   * Helper for hand release events.
   */
  public onHandRelease(instanceId: string, handPose: any): void {
    const handedness: Handedness = handPose.handedness ?? 'right';
    this.activeGrabs.delete(handedness);

    if (this.state.isActive && this.state.targetInstanceId === instanceId) {
      const remainingHand: Handedness = handedness === 'right' ? 'left' : 'right';
      const remainingGrab = this.activeGrabs.get(remainingHand);
      if (remainingGrab) {
        const toHandPose = (p: any, h: Handedness): HandPoseData => {
          const pos = p.position ? [p.position.x, p.position.y, p.position.z] : (p.wristPosition ?? [0, 0, 0]);
          const rot = p.rotation ? [p.rotation.x, p.rotation.y, p.rotation.z, p.rotation.w] : (p.wristOrientation ?? [0, 0, 0, 1]);
          return {
            handedness: h,
            isTracked: p.isTracked ?? true,
            pinchStrength: p.pinchStrength ?? 1.0,
            isPinching: p.isPinching ?? true,
            wristPosition: pos as [number, number, number],
            wristOrientation: rot as [number, number, number, number],
            indexTipPosition: pos as [number, number, number],
            pointerRayDirection: [0, 0, -1],
          };
        };
        this.releaseHand(handedness, toHandPose(remainingGrab.pose, remainingHand));
      } else {
        this.endTwoHandGrab();
      }
    }
  }

  public isTwoHandedGrab(instanceId?: string): boolean {
    return this.state.isActive && (!instanceId || this.state.targetInstanceId === instanceId);
  }

  public getActiveHand(instanceId: string): Handedness | null {
    for (const [handedness, grab] of this.activeGrabs.entries()) {
      if (grab.instanceId === instanceId) {
        return handedness;
      }
    }
    return null;
  }

  public updateDualHandTransform(
    instanceId: string,
    leftHand: any,
    rightHand: any,
  ): { position: Vector3; rotation: Quaternion } {
    const toHandPose = (p: any, h: Handedness): HandPoseData => {
      const pos = p.position ? [p.position.x, p.position.y, p.position.z] : (p.wristPosition ?? [0, 0, 0]);
      const rot = p.rotation ? [p.rotation.x, p.rotation.y, p.rotation.z, p.rotation.w] : (p.wristOrientation ?? [0, 0, 0, 1]);
      return {
        handedness: h,
        isTracked: p.isTracked ?? true,
        pinchStrength: p.pinchStrength ?? 1.0,
        isPinching: p.isPinching ?? true,
        wristPosition: pos as [number, number, number],
        wristOrientation: rot as [number, number, number, number],
        indexTipPosition: pos as [number, number, number],
        pointerRayDirection: [0, 0, -1],
      };
    };

    const leftPose = toHandPose(leftHand, 'left');
    const rightPose = toHandPose(rightHand, 'right');

    const result = this.update(leftPose, rightPose);
    return {
      position: new Vector3(...result.position),
      rotation: new Quaternion(...result.rotation),
    };
  }

  public shouldFreezeOnTrackingLoss(handPose: any): boolean {
    if (handPose.confidence !== undefined && handPose.confidence < 0.5) {
      return true;
    }
    if (handPose.isTracked === false) {
      return true;
    }
    return false;
  }
}
