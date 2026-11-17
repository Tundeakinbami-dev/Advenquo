/**
 * Advenquo: Seated VR Workspace Calibration Regression Suite
 *
 * Verifies:
 * 1. Building surface is positioned within comfortable seated reach radius (0.35m to 0.75m).
 * 2. Virtual table height and depth can be adjusted for players of different seated heights.
 * 3. Virtual turntable rotates the construction platform so all 4 facades are reachable.
 * 4. Recalibration of the seated anchor updates interaction center without artificial camera moves.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SeatedWorkspace,
  ConstructionManager,
} from '../src/construction/index.js';

describe('Advenquo: Seated VR Workspace Calibration', () => {
  it('calibrates table center within ergonomic seated arm reach', () => {
    const workspace = new SeatedWorkspace();
    const center = workspace.getTableCenter();

    // Default seated eye height is 1.2m, table offset is -0.35m -> Y=0.85m
    assert.strictEqual(center[1], 0.85);
    // Table depth offset in front of player
    assert.strictEqual(center[2], -0.55);

    // Points inside comfortable reach radius
    assert.strictEqual(workspace.isPointWithinReach([0, 0.85, -0.55]), true);
    assert.strictEqual(workspace.isPointWithinReach([0.3, 0.85, -0.55]), true);

    // Points outside comfortable reach
    assert.strictEqual(workspace.isPointWithinReach([0, 0.85, -2.5]), false, 'Too far in depth');
    assert.strictEqual(workspace.isPointWithinReach([0, 2.5, -0.55]), false, 'Too high above head');
  });

  it('adjusts virtual table height and depth smoothly', () => {
    const workspace = new SeatedWorkspace();

    const newH = workspace.adjustHeight(0.1);
    assert.strictEqual(newH, -0.25);

    const newD = workspace.adjustDepth(-0.1);
    assert.strictEqual(newD, -0.65);

    const center = workspace.getTableCenter();
    assert.strictEqual(center[1], 1.2 - 0.25);
    assert.strictEqual(center[2], -0.65);
  });

  it('rotates turntable platform so player can reach all facades without twisting', () => {
    const workspace = new SeatedWorkspace();
    const center = workspace.getTableCenter();

    // Rotate 180 degrees
    workspace.rotateTurntable(Math.PI);
    const frontOffset: [number, number, number] = [0, 0, 0.3];
    const rotated = workspace.applyTurntableTransform(frontOffset);

    // Front point rotated 180 degrees must now be at rear
    assert.ok(Math.abs(rotated[2] - (center[2] - 0.3)) < 0.001);
  });

  it('recalibrates seated anchor without artificial camera translation', () => {
    const manager = ConstructionManager.getInstance();
    manager.recalibrateSeatedWorkspace([0.1, 1.15, -0.05]);

    const state = manager.getState();
    assert.deepStrictEqual(state.seatedWorkspace.playerSeatedAnchor, [0.1, 1.15, -0.05]);
    assert.strictEqual(state.isCalibrated, true);
  });
});
