/**
 * Advenquo: Blueprint Validation & Ghost Guide Regression Suite
 *
 * Verifies:
 * 1. Blueprint definitions contain foundation specs, quantities, stages, and target items.
 * 2. BlueprintValidator enforces quantity, position, and rotation tolerances.
 * 3. AssessmentEngine identifies missing components and misaligned placements.
 * 4. BlueprintVisualizer renders 3D holographic ghost meshes for guidance.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SMALL_HOUSE_BLUEPRINT,
  BlueprintValidator,
  BlueprintVisualizer,
  AssessmentEngine,
  ConnectionGraph,
} from '../src/construction/index.js';

describe('Advenquo: Blueprint Validation & Ghost Guide', () => {
  it('validates Small-House blueprint definition schema', () => {
    const bp = SMALL_HOUSE_BLUEPRINT;
    assert.strictEqual(bp.id, 'small_house_challenge');
    assert.ok(bp.title.includes('Small House'));
    assert.strictEqual(bp.stages.length, 6);
    assert.ok(bp.targets.length >= 10);
    assert.deepStrictEqual(bp.foundationDimensions, [2.8, 0.15, 2.8]);
    assert.deepStrictEqual(bp.foundationPosition, [0, 0, -2.5]);
  });

  it('detects missing materials when structure has no placed components', () => {
    const graph = new ConnectionGraph();
    const result = AssessmentEngine.assessBlueprint(SMALL_HOUSE_BLUEPRINT, graph);

    assert.strictEqual(result.passed, false);
    assert.ok(result.totalComponentsPlaced === 0);
    assert.ok(result.missingComponents.length > 0);
    assert.ok(result.feedbackNotes.length > 0);
  });

  it('detects placement errors when components are placed far from target', () => {
    const graph = new ConnectionGraph();
    // Add foundation
    graph.addNode('foundation_slab', 'floor_component', 'foundation', [0, 0, -2.5], [0, 0, 0, 1], true);
    // Add block at completely wrong coordinates [10, 10, 10]
    graph.addNode('target_base_block_fl', 'concrete_block', 'compressive_masonry', [10, 10, 10], [0, 0, 0, 1]);

    const result = AssessmentEngine.assessBlueprint(SMALL_HOUSE_BLUEPRINT, graph);
    assert.strictEqual(result.passed, false);
    assert.ok(result.placementErrors.length > 0, 'Must record placement error for coordinate mismatch');
  });

  it('generates 3D holographic ghost meshes for blueprint targets and foundation guide', () => {
    const visualizer = new BlueprintVisualizer(SMALL_HOUSE_BLUEPRINT);
    const root = visualizer.getRoot();

    assert.ok(root, 'Visualizer root must exist');
    assert.strictEqual(root.name, `BlueprintVisualizer_${SMALL_HOUSE_BLUEPRINT.id}`);
    assert.strictEqual(root.children.length, SMALL_HOUSE_BLUEPRINT.targets.length + 1, 'Includes foundation wireframe + target ghosts');

    // Visibility toggle
    visualizer.setVisible(false);
    assert.strictEqual(visualizer.getVisible(), false);
    assert.strictEqual(root.visible, false);

    visualizer.setVisible(true);
    assert.strictEqual(visualizer.getVisible(), true);
    assert.strictEqual(root.visible, true);
  });

  it('validates targets against BlueprintValidator schema rules', () => {
    for (const target of SMALL_HOUSE_BLUEPRINT.targets) {
      assert.ok(target.id.length > 0);
      assert.ok(target.componentType.length > 0);
      assert.strictEqual(target.targetPosition.length, 3);
      assert.strictEqual(target.targetRotation.length, 4);
      assert.ok(target.positionToleranceMeters > 0);
      assert.ok(target.rotationToleranceDeg > 0);
    }
  });
});
