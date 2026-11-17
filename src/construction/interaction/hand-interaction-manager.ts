/**
 * Advenquo: Construction World — Hand Interaction Manager
 *
 * Coordinates:
 * - Independent Left and Right hand interaction loops
 * - Automatic engagement of Two-Hand manipulation for heavy/large components
 * - Seated workspace reach bounds checking
 * - Smooth handoff on single hand release
 * - Snap preview updates during manipulation
 */

import type {
  ComponentType,
  Handedness,
  HandPoseData,
} from '../core/construction-types.js';
import { HandGrabSystem } from './hand-grab-system.js';
import { TwoHandManipulationController } from './two-hand-manipulation.js';
import { SeatedWorkspace } from './seated-workspace.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export class HandInteractionManager {
  private grabSystem: HandGrabSystem;
  private twoHandController: TwoHandManipulationController;
  private seatedWorkspace: SeatedWorkspace;
  private handPoses: Map<Handedness, HandPoseData | any> = new Map();

  constructor(seatedWorkspace?: SeatedWorkspace) {
    this.grabSystem = new HandGrabSystem();
    this.twoHandController = new TwoHandManipulationController();
    this.seatedWorkspace = seatedWorkspace || new SeatedWorkspace();
  }

  public updateHand(hand: Handedness, handPose: HandPoseData | any): void {
    this.handPoses.set(hand, handPose);
  }

  public grabComponent(hand: Handedness, instanceId: string): boolean {
    const pose = this.handPoses.get(hand);
    return this.grabSystem.evaluateGrab(instanceId, pose ?? { handedness: hand, isPinching: true, pinchStrength: 1.0 });
  }

  public getHeldComponentId(hand: Handedness): string | null {
    return this.grabSystem.getHeldInstanceId(hand);
  }

  public getGrabSystem(): HandGrabSystem {
    return this.grabSystem;
  }

  public getTwoHandController(): TwoHandManipulationController {
    return this.twoHandController;
  }

  public getSeatedWorkspace(): SeatedWorkspace {
    return this.seatedWorkspace;
  }

  /**
   * Process a pinch grab action from either hand.
   */
  public handleGrab(
    hand: Handedness,
    instanceId: string,
    componentType: ComponentType,
    handPose: HandPoseData,
    objectPos: [number, number, number],
    objectRot: [number, number, number, number],
    otherHandPose?: HandPoseData
  ): { isTwoHanded: boolean; success: boolean } {
    const otherHand = hand === 'left' ? 'right' : 'left';
    const isOtherHoldingSame = this.grabSystem.getHeldInstanceId(otherHand) === instanceId;
    const spec = CONSTRUCTION_CATALOG[componentType];
    const requiresTwoHands = spec ? spec.requiresTwoHands : false;

    // First register hand grab
    const grabbed = this.grabSystem.grab(hand, instanceId, handPose, objectPos, objectRot);
    if (!grabbed) {
      return { isTwoHanded: false, success: false };
    }

    // Check if both hands are now holding the same component
    if (isOtherHoldingSame && otherHandPose) {
      const leftPose = hand === 'left' ? handPose : otherHandPose;
      const rightPose = hand === 'right' ? handPose : otherHandPose;
      this.twoHandController.startTwoHandGrab(
        instanceId,
        leftPose,
        rightPose,
        objectPos,
        objectRot,
        hand
      );
      return { isTwoHanded: true, success: true };
    }

    return { isTwoHanded: requiresTwoHands, success: true };
  }

  /**
   * Process release of either hand.
   * If two-handed, performs a smooth transfer to the remaining hand without jumping.
   */
  public handleRelease(
    hand: Handedness,
    otherHandPose?: HandPoseData
  ): {
    releasedInstanceId: string | null;
    isStillHeldByOtherHand: boolean;
  } {
    const releasedId = this.grabSystem.release(hand);
    if (!releasedId) {
      return { releasedInstanceId: null, isStillHeldByOtherHand: false };
    }

    const otherHand = hand === 'left' ? 'right' : 'left';
    const otherHoldsSame = this.grabSystem.getHeldInstanceId(otherHand) === releasedId;

    if (this.twoHandController.isActive() && this.twoHandController.getTargetInstanceId() === releasedId) {
      if (otherHoldsSame && otherHandPose) {
        // Smoothly transfer grab to the remaining hand
        const { remainingHand, newLocalGrabOffset } = this.twoHandController.releaseHand(
          hand,
          otherHandPose
        );
        this.grabSystem.setGrabOffset(remainingHand, newLocalGrabOffset);
        return { releasedInstanceId: releasedId, isStillHeldByOtherHand: true };
      } else {
        this.twoHandController.endTwoHandGrab();
        return { releasedInstanceId: releasedId, isStillHeldByOtherHand: false };
      }
    }

    return { releasedInstanceId: releasedId, isStillHeldByOtherHand: otherHoldsSame };
  }

  /**
   * Update interaction frames for both hands.
   */
  public update(
    leftPose: HandPoseData,
    rightPose: HandPoseData
  ): {
    twoHandTransform?: {
      instanceId: string;
      position: [number, number, number];
      rotation: [number, number, number, number];
    };
    leftHandTransform?: {
      instanceId: string;
      position: [number, number, number];
      rotation: [number, number, number, number];
    };
    rightHandTransform?: {
      instanceId: string;
      position: [number, number, number];
      rotation: [number, number, number, number];
    };
  } {
    const result: any = {};

    // 1. Two-hand update
    if (this.twoHandController.isActive()) {
      const targetId = this.twoHandController.getTargetInstanceId()!;
      const updateResult = this.twoHandController.update(leftPose, rightPose);
      result.twoHandTransform = {
        instanceId: targetId,
        position: updateResult.position,
        rotation: updateResult.rotation,
      };
      return result;
    }

    // 2. Individual hand updates
    const leftHeldId = this.grabSystem.getHeldInstanceId('left');
    if (leftHeldId) {
      const t = this.grabSystem.updateHeldPose('left', leftPose);
      if (t) {
        result.leftHandTransform = {
          instanceId: leftHeldId,
          position: t.position,
          rotation: t.rotation,
        };
      }
    }

    const rightHeldId = this.grabSystem.getHeldInstanceId('right');
    if (rightHeldId) {
      const t = this.grabSystem.updateHeldPose('right', rightPose);
      if (t) {
        result.rightHandTransform = {
          instanceId: rightHeldId,
          position: t.position,
          rotation: t.rotation,
        };
      }
    }

    return result;
  }
}
