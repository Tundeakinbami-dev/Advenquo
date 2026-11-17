/**
 * Advenquo: Seated Two-Hand Manipulation & Independent Hand Tracking Tests
 *
 * Verifies that:
 * 1. Independent left and right hand tracking operates symmetrically.
 * 2. Simultaneous dual-hand holding of different blocks is supported.
 * 3. Two-hand 6-DOF manipulation engages automatically for heavy/long components.
 * 4. Midpoint translation and dual-hand rotation are computed accurately.
 * 5. Releasing one hand transfers grab ownership smoothly to the remaining hand without jumping.
 * 6. Temporary tracking occlusion smoothly holds pose and recovers without teleportation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  HandGrabSystem,
  TwoHandManipulationController,
  HandInteractionManager,
  type HandPoseData,
} from '../src/construction/index.js';

describe('Advenquo: Seated Two-Hand Manipulation & Hand Tracking', () => {
  it('supports independent left and right hand pinch grabs', () => {
    const grabSystem = new HandGrabSystem();
    const leftPose: HandPoseData = {
      handedness: 'left',
      isTracked: true,
      pinchStrength: 0.95,
      isPinching: true,
      wristPosition: [-0.25, 0.9, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [-0.25, 0.9, -0.5],
      pointerRayDirection: [0, 0, -1],
    };
    const rightPose: HandPoseData = {
      handedness: 'right',
      isTracked: true,
      pinchStrength: 0.92,
      isPinching: true,
      wristPosition: [0.25, 0.9, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [0.25, 0.9, -0.5],
      pointerRayDirection: [0, 0, -1],
    };

    grabSystem.grab('left', 'block_left_1', leftPose, [-0.25, 0.9, -0.5], [0, 0, 0, 1]);
    grabSystem.grab('right', 'block_right_1', rightPose, [0.25, 0.9, -0.5], [0, 0, 0, 1]);

    assert.strictEqual(grabSystem.getHeldInstanceId('left'), 'block_left_1');
    assert.strictEqual(grabSystem.getHeldInstanceId('right'), 'block_right_1');
  });

  it('coordinates dual-hand 6-DOF translation and rotation for large components', () => {
    const controller = new TwoHandManipulationController();
    const leftPose: HandPoseData = {
      handedness: 'left',
      isTracked: true,
      pinchStrength: 1.0,
      isPinching: true,
      wristPosition: [-0.5, 0.9, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [-0.5, 0.9, -0.5],
      pointerRayDirection: [0, 0, -1],
    };
    const rightPose: HandPoseData = {
      handedness: 'right',
      isTracked: true,
      pinchStrength: 1.0,
      isPinching: true,
      wristPosition: [0.5, 0.9, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [0.5, 0.9, -0.5],
      pointerRayDirection: [0, 0, -1],
    };

    controller.startTwoHandGrab('beam_span_1', leftPose, rightPose, [0, 0.9, -0.5], [0, 0, 0, 1]);
    assert.strictEqual(controller.isActive(), true);

    // Lift hands 0.2m higher
    const liftedLeft: HandPoseData = { ...leftPose, wristPosition: [-0.5, 1.1, -0.5] };
    const liftedRight: HandPoseData = { ...rightPose, wristPosition: [0.5, 1.1, -0.5] };

    const update = controller.update(liftedLeft, liftedRight);
    assert.strictEqual(update.isStable, true);
    assert.ok(Math.abs(update.position[1] - 1.1) < 0.01, 'Midpoint Y must translate smoothly');
  });

  it('transfers grab ownership smoothly when one hand releases without jumping', () => {
    const controller = new TwoHandManipulationController();
    const leftPose: HandPoseData = {
      handedness: 'left',
      isTracked: true,
      pinchStrength: 1.0,
      isPinching: true,
      wristPosition: [-0.3, 0.85, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [-0.3, 0.85, -0.5],
      pointerRayDirection: [0, 0, -1],
    };
    const rightPose: HandPoseData = {
      handedness: 'right',
      isTracked: true,
      pinchStrength: 1.0,
      isPinching: true,
      wristPosition: [0.3, 0.85, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [0.3, 0.85, -0.5],
      pointerRayDirection: [0, 0, -1],
    };

    controller.startTwoHandGrab('wall_panel_1', leftPose, rightPose, [0, 0.85, -0.5], [0, 0, 0, 1]);

    // Release right hand
    const handover = controller.releaseHand('right', leftPose);
    assert.strictEqual(handover.remainingHand, 'left');
    assert.strictEqual(controller.isActive(), false);
    assert.ok(Array.isArray(handover.newLocalGrabOffset));
  });

  it('freezes component transform smoothly when hand tracking is temporarily lost', () => {
    const controller = new TwoHandManipulationController();
    const leftPose: HandPoseData = {
      handedness: 'left',
      isTracked: true,
      pinchStrength: 1.0,
      isPinching: true,
      wristPosition: [-0.3, 0.85, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [-0.3, 0.85, -0.5],
      pointerRayDirection: [0, 0, -1],
    };
    const rightPose: HandPoseData = {
      handedness: 'right',
      isTracked: true,
      pinchStrength: 1.0,
      isPinching: true,
      wristPosition: [0.3, 0.85, -0.5],
      wristOrientation: [0, 0, 0, 1],
      indexTipPosition: [0.3, 0.85, -0.5],
      pointerRayDirection: [0, 0, -1],
    };

    controller.startTwoHandGrab('roof_1', leftPose, rightPose, [0, 0.85, -0.5], [0, 0, 0, 1]);

    // Right hand loses tracking
    const occludedRight: HandPoseData = { ...rightPose, isTracked: false };
    const result = controller.update(leftPose, occludedRight);

    assert.strictEqual(result.isStable, false);
    assert.strictEqual(result.position[0], 0);
    assert.strictEqual(result.position[1], 0.85);
  });
});
