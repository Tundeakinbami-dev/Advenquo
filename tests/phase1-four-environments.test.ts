/**
 * Advenquo: Construction Environments & Seated Workspace Calibration Tests
 *
 * Verifies that:
 * 1. Dedicated Construction Workshop yard and foundation pad provide clean building bounds.
 * 2. Seated workspace calibrates within comfortable arm reach (0.35m to 0.75m radius).
 * 3. Virtual table height and depth can be adjusted for players of different seated heights.
 * 4. Virtual turntable rotates the construction platform so all 4 sides are reachable.
 * 5. Seated anchor recalibrates without artificial camera movement.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SeatedWorkspace,
  ConstructionManager,
  buildConstructionWorkshop,
} from '../src/construction/index.js';

describe('Advenquo: Construction Environments & Seated Calibration', () => {
  it('constructs dedicated workshop compound with foundation pad', () => {
    const workshop = buildConstructionWorkshop();
    assert.ok(workshop);
    assert.strictEqual(workshop.name, 'ConstructionWorkshopCompound');

    const pad = workshop.getObjectByName('FoundationBuildingPad');
    assert.ok(pad, 'Foundation pad must be present in workshop');
  });

  it('keeps the active building surface within comfortable seated arm reach', () => {
    const workspace = new SeatedWorkspace();
    const center = workspace.getTableCenter();

    // Default seated eye height is Y=1.2; table height offset is -0.35m -> Y=0.85m
    assert.strictEqual(center[1], 1.2 - 0.35);
    // Table depth offset is -0.55m in front of chest
    assert.strictEqual(center[2], -0.55);

    // Verify reach bounds
    assert.strictEqual(workspace.isPointWithinReach([0, 0.85, -0.55]), true);
    assert.strictEqual(workspace.isPointWithinReach([0, 0.85, -1.8]), false); // Too far
    assert.strictEqual(workspace.isPointWithinReach([0, 2.5, -0.55]), false); // Too high
  });

  it('adjusts virtual table height and depth smoothly', () => {
    const workspace = new SeatedWorkspace();
    const h = workspace.adjustHeight(0.15);
    assert.strictEqual(h, -0.2);

    const d = workspace.adjustDepth(-0.1);
    assert.strictEqual(d, -0.65);

    const newCenter = workspace.getTableCenter();
    assert.strictEqual(newCenter[1], 1.0);
    assert.strictEqual(newCenter[2], -0.65);
  });

  it('rotates turntable platform so player can reach all facades without twisting', () => {
    const workspace = new SeatedWorkspace();
    workspace.rotateTurntable(Math.PI); // 180 deg
    const transformed = workspace.applyTurntableTransform([0, 0, 0.4]);
    const center = workspace.getTableCenter();
    // Front point [0, 0, 0.4] rotated 180 deg becomes rear point [0, 0, -0.4]
    assert.ok(Math.abs(transformed[2] - (center[2] - 0.4)) < 0.001);
  });

  it('recalibrates seated anchor without camera translation', () => {
    const manager = ConstructionManager.getInstance();
    manager.recalibrateSeatedWorkspace([0.2, 1.1, -0.1]);

    const state = manager.getState();
    assert.deepStrictEqual(state.seatedWorkspace.playerSeatedAnchor, [0.2, 1.1, -0.1]);
    assert.strictEqual(state.isCalibrated, true);
  });
});
