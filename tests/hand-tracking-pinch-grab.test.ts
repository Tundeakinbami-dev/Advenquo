/**
 * Advenquo: Hand Tracking & Pinch-to-Grab Interaction Regression Suite
 *
 * Verifies:
 * 1. Independent left- and right-hand tracking (neither hand locked to a fixed role).
 * 2. Pinch gesture detection (thumb and index finger proximity).
 * 3. 6-DOF translation and rotation while held.
 * 4. Physics state transitions:
 *    • DYNAMIC to KINEMATIC when grabbed.
 *    • KINEMATIC to STATIC freeze upon snap placement to maintain Quest 3 frame rate.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  HandGrabSystem,
  HandInteractionManager,
  CollisionManager,
  type HandPoseData,
} from '../src/construction/index.js';

describe('Advenquo: Hand Tracking & Pinch-to-Grab Interaction', () => {
  it('detects pinch grab independently on both left and right hands', () => {
    const grabSystem = new HandGrabSystem();

    const leftHand: HandPoseData = {
      handedness: 'left',
      position: new Vector3(-0.3, 1.1, -0.5),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 0.95,
      confidence: 1.0,
    };

    const rightHand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0.3, 1.1, -0.5),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 0.95,
      confidence: 1.0,
    };

    const leftGrabbed = grabSystem.evaluateGrab('starter_brick_1', leftHand, [0, 0, 0]);
    assert.strictEqual(leftGrabbed, true, 'Left hand pinch must grab brick');

    const rightGrabbed = grabSystem.evaluateGrab('starter_brick_2', rightHand, [0, 0, 0]);
    assert.strictEqual(rightGrabbed, true, 'Right hand pinch must grab brick');
  });

  it('allows both hands to hold different blocks simultaneously', () => {
    const manager = new HandInteractionManager();

    const leftHand: HandPoseData = {
      handedness: 'left',
      position: new Vector3(-0.35, 1.1, -0.5),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    const rightHand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0.35, 1.1, -0.5),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    manager.updateHand('left', leftHand);
    manager.updateHand('right', rightHand);

    manager.grabComponent('left', 'brick_left');
    manager.grabComponent('right', 'brick_right');

    assert.strictEqual(manager.getHeldComponentId('left'), 'brick_left');
    assert.strictEqual(manager.getHeldComponentId('right'), 'brick_right');
  });

  it('translates and rotates held component following hand wrist pose', () => {
    const grabSystem = new HandGrabSystem();

    const initialHand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0.2, 1.0, -0.5),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    grabSystem.startGrab('brick_1', initialHand, [0.2, 1.0, -0.5]);

    // Rotate wrist by 45 degrees around Y (yaw) and translate forward by 0.2m
    const rot45 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
    const movedHand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0.2, 1.0, -0.7),
      rotation: rot45,
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    const updatedTransform = grabSystem.updateHeldTransform('brick_1', movedHand);
    assert.ok(updatedTransform);
    assert.strictEqual(updatedTransform.position.z, -0.7);
    assert.ok(Math.abs(updatedTransform.rotation.y - rot45.y) < 0.001);
  });

  it('manages physics dynamic-to-kinematic-to-static state transitions', () => {
    const colMgr = new CollisionManager();

    // 1. Initial supply shelf state: DYNAMIC
    colMgr.registerBody('block_alpha', 'dynamic', [0.4, 0.2, 0.2]);
    assert.strictEqual(colMgr.getBodyState('block_alpha'), 'dynamic');

    // 2. Player pinches and grabs block: transitions to KINEMATIC
    colMgr.setKinematic('block_alpha', true);
    assert.strictEqual(colMgr.getBodyState('block_alpha'), 'kinematic');

    // 3. Block snaps into assembly: freezes to STATIC
    colMgr.freezeStatic('block_alpha');
    assert.strictEqual(colMgr.getBodyState('block_alpha'), 'static', 'Must freeze static to protect Quest 3 frame budget');
  });
});
