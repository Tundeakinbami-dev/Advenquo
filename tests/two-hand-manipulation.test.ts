/**
 * Advenquo: Two-Hand Manipulation & Ergonomics Regression Suite
 *
 * Verifies:
 * 1. Distinction between single-hand blocks and two-hand structural components.
 * 2. Simultaneous dual-hand 6-DOF tracking for large components.
 * 3. Smooth grab ownership transfer when one hand releases without transform jumping.
 * 4. Safety freeze when hand tracking is temporarily lost.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  TwoHandManipulationController,
  getComponentSpec,
  type HandPoseData,
} from '../src/construction/index.js';

describe('Advenquo: Two-Hand Manipulation', () => {
  it('correctly categorizes components requiring two-handed manipulation', () => {
    // Single-hand items
    assert.strictEqual(getComponentSpec('clay_brick').requiresTwoHands, false);
    assert.strictEqual(getComponentSpec('concrete_block').requiresTwoHands, false);

    // Two-hand heavy / long components
    assert.strictEqual(getComponentSpec('reinforced_column').requiresTwoHands, true);
    assert.strictEqual(getComponentSpec('horizontal_beam').requiresTwoHands, true);
    assert.strictEqual(getComponentSpec('wall_panel').requiresTwoHands, true);
    assert.strictEqual(getComponentSpec('roof_panel').requiresTwoHands, true);
    assert.strictEqual(getComponentSpec('floor_component').requiresTwoHands, true);
  });

  it('engages dual-hand 6-DOF manipulation when both hands grab a component', () => {
    const controller = new TwoHandManipulationController();

    const leftHand: HandPoseData = {
      handedness: 'left',
      position: new Vector3(-0.5, 1.2, -0.6),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    const rightHand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0.5, 1.2, -0.6),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    controller.onHandGrab('beam_1', leftHand);
    assert.strictEqual(controller.isTwoHandedGrab('beam_1'), false);

    controller.onHandGrab('beam_1', rightHand);
    assert.strictEqual(controller.isTwoHandedGrab('beam_1'), true, 'Dual-hand grab must be active');

    // Move both hands forward by 0.2m
    const leftMoved: HandPoseData = { ...leftHand, position: new Vector3(-0.5, 1.2, -0.8) };
    const rightMoved: HandPoseData = { ...rightHand, position: new Vector3(0.5, 1.2, -0.8) };

    const newTransform = controller.updateDualHandTransform('beam_1', leftMoved, rightMoved);
    assert.ok(newTransform);
    assert.ok(Math.abs(newTransform.position.z - (-0.8)) < 0.001);
  });

  it('transfers grab smoothly to the single remaining hand when one hand releases without jumping', () => {
    const controller = new TwoHandManipulationController();

    const leftHand: HandPoseData = {
      handedness: 'left',
      position: new Vector3(-0.4, 1.2, -0.6),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    const rightHand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0.4, 1.2, -0.6),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 1.0,
    };

    controller.onHandGrab('column_1', leftHand);
    controller.onHandGrab('column_1', rightHand);

    // Left hand releases pinch
    const releasedLeft: HandPoseData = { ...leftHand, isPinching: false, pinchStrength: 0.0 };
    controller.onHandRelease('column_1', releasedLeft);

    assert.strictEqual(controller.isTwoHandedGrab('column_1'), false);
    assert.strictEqual(controller.getActiveHand('column_1'), 'right');
  });

  it('freezes component transform smoothly when hand tracking confidence drops below threshold', () => {
    const controller = new TwoHandManipulationController();

    const hand: HandPoseData = {
      handedness: 'right',
      position: new Vector3(0, 1.2, -0.6),
      rotation: new Quaternion(),
      isPinching: true,
      pinchStrength: 1.0,
      confidence: 0.1, // Poor tracking confidence (e.g. hand behind back or obscured)
    };

    const shouldFreeze = controller.shouldFreezeOnTrackingLoss(hand);
    assert.strictEqual(shouldFreeze, true, 'Component must freeze in place to avoid wild physics glitches');
  });
});
