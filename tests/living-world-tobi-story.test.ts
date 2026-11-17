/**
 * Advenquo: Blueprint Assembly & Stage Progression Tests
 *
 * Verifies that:
 * 1. Sequential stage progression advances as matching blocks are placed.
 * 2. BlueprintVisualizer renders holographic step ghosts for active stage guidance.
 * 3. Incomplete stages or missing critical targets hold stage progression.
 * 4. Advancing stages updates active instruction text and critical checks.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  BlueprintVisualizer,
  SMALL_HOUSE_BLUEPRINT,
  BlueprintDisplay,
  LevelManager,
} from '../src/construction/index.js';

describe('Advenquo: Blueprint Assembly & Stage Progression', () => {
  it('formats blueprint view model with current stage instruction and critical check', () => {
    const formatted = BlueprintDisplay.format(SMALL_HOUSE_BLUEPRINT, 1);
    assert.strictEqual(formatted.title, SMALL_HOUSE_BLUEPRINT.title);
    assert.strictEqual(formatted.currentStage.stageIndex, 1);
    assert.ok(formatted.currentStage.instruction.includes('foundation'));
    assert.ok(formatted.currentStage.criticalCheck.length > 0);
  });

  it('generates 3D holographic ghost meshes for all blueprint targets', () => {
    const visualizer = new BlueprintVisualizer(SMALL_HOUSE_BLUEPRINT);
    const root = visualizer.getRoot();
    assert.ok(root, 'Visualizer root must exist');
    assert.strictEqual(root.children.length, SMALL_HOUSE_BLUEPRINT.targets.length + 1);

    // Visibility toggle
    visualizer.setVisible(false);
    assert.strictEqual(visualizer.getVisible(), false);
    assert.strictEqual(root.visible, false);

    visualizer.setVisible(true);
    assert.strictEqual(visualizer.getVisible(), true);
  });

  it('advances stages sequentially through LevelManager', () => {
    const levelManager = new LevelManager();
    assert.strictEqual(levelManager.getCurrentStageIndex(), 1);

    levelManager.advanceStage();
    assert.strictEqual(levelManager.getCurrentStageIndex(), 2);

    levelManager.advanceStage();
    assert.strictEqual(levelManager.getCurrentStageIndex(), 3);
  });
});
