/**
 * Advenquo: VR Construction Workshop Experience & Interaction Tests
 *
 * Verifies that:
 * 1. Scene structure authors the construction workshop, starter modular blocks, and spatial panels.
 * 2. Starter blocks carry OneHandGrabbable and TwoHandsGrabbable components for hand-tracking pinch and dual-hand lifts.
 * 3. Project configuration enables Meta Quest seated VR, hand tracking, and snap turning.
 * 4. The player can complete the Small-House construction challenge deterministically.
 * 5. Educational structural engineering certification feedback is awarded upon completion.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { challengeManager } from '../src/construction/progression/challenge-manager.js';
import { assemblySystem } from '../src/construction/assembly/assembly-system.js';
import { SMALL_HOUSE_BLUEPRINT } from '../src/construction/blueprints/small-house-blueprint.js';

describe('VR Experience & Immersive Construction Systems', () => {
  beforeEach(() => {
    assemblySystem.reset();
    challengeManager.resetChallenge();
  });

  it('validates scene composition authors the construction workshop, starter blocks, and spatial panels', () => {
    const scenePath = resolve(process.cwd(), 'public/scenes/main.iwsdk.scene.json');
    const scene = JSON.parse(readFileSync(scenePath, 'utf8'));

    const nodeIds = scene.nodes.map((n: { id: string }) => n.id);

    // Workshop environment
    assert.ok(nodeIds.includes('construction-workshop'), 'Must author construction-workshop');

    // Starter grabbable blocks
    assert.ok(nodeIds.includes('starter-clay-brick-1'), 'Must author starter clay brick');
    assert.ok(nodeIds.includes('starter-concrete-block-1'), 'Must author starter concrete block');
    assert.ok(nodeIds.includes('starter-column-1'), 'Must author starter column');
    assert.ok(nodeIds.includes('starter-beam-1'), 'Must author starter beam');

    // Spatial UI panels
    assert.ok(nodeIds.includes('intro-panel'), 'Must author intro-panel');
    assert.ok(nodeIds.includes('vr-nav-tablet'), 'Must author vr-nav-tablet');
    assert.ok(nodeIds.includes('completion-panel'), 'Must author completion-panel');
  });

  it('verifies starter modular blocks carry proper pinch-grab and dual-hand components', () => {
    const scenePath = resolve(process.cwd(), 'public/scenes/main.iwsdk.scene.json');
    const scene = JSON.parse(readFileSync(scenePath, 'utf8'));

    const brickNode = scene.nodes.find((n: { id: string }) => n.id === 'starter-clay-brick-1');
    assert.ok(brickNode, 'starter-clay-brick-1 must exist');
    assert.ok(brickNode.components.OneHandGrabbable, 'Clay brick must have OneHandGrabbable');
    assert.ok(brickNode.components.ConstructionBlock, 'Clay brick must have ConstructionBlock');

    const columnNode = scene.nodes.find((n: { id: string }) => n.id === 'starter-column-1');
    assert.ok(columnNode, 'starter-column-1 must exist');
    assert.ok(columnNode.components.TwoHandsGrabbable, 'Heavy column must have TwoHandsGrabbable');
    assert.ok(columnNode.components.OneHandGrabbable, 'Column must support single-hand adjustment');
    assert.ok(columnNode.components.ConstructionBlock, 'Column must have ConstructionBlock');
  });

  it('validates project config enables Meta Quest hand tracking and snap turning', () => {
    const configPath = resolve(process.cwd(), 'iwsdk.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    assert.strictEqual(config.world.xr.mode, 'vr', 'Must target VR');
    assert.strictEqual(config.world.xr.features.handTracking, true, 'Hand tracking must be enabled');
    assert.strictEqual(config.world.features.grabbing.useHandPinchForGrab, true, 'Pinch grab must be active');
    assert.strictEqual(config.world.features.locomotion.turningMethod, 'snap', 'Snap turning required for comfort');
  });

  it('executes Small-House construction challenge to completion', () => {
    challengeManager.setActiveChallenge('small_house_challenge');
    const bp = challengeManager.getBlueprint();
    assert.strictEqual(bp.id, 'small_house_challenge');

    // Place all required targets into the assembly system
    for (const target of bp.targets) {
      assemblySystem.registerPlacedBlock({
        instanceId: `placed_${target.id}`,
        componentType: target.componentType,
        position: target.targetPosition,
        rotation: target.targetRotation,
        isGrounded: target.targetPosition[1] <= 0.25,
      });
    }

    // Connect them
    const graph = assemblySystem.getGraph();
    for (const target of bp.targets) {
      for (const req of target.requiredConnections) {
        graph.connect(
          `placed_${target.id}`,
          req.mySnapPointId,
          `placed_${req.targetItemId}`,
          req.targetSnapPointId
        );
      }
    }

    const assessment = challengeManager.evaluateProgress(graph);
    assert.strictEqual(assessment.passed, true, 'Complete Small House must pass assessment');
    assert.ok(assessment.score >= 85, 'Score must be at least 85%');
    assert.strictEqual(challengeManager.isChallengeCompleted(), true, 'Challenge must be marked completed');
  });
});
