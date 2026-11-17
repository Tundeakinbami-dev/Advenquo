/**
 * Advenquo: Small-House Building Challenge End-to-End Regression Suite
 *
 * Verifies the complete 6-stage construction challenge:
 * Stage 1: Foundation Inspection
 * Stage 2: Place First Row of Blocks (Foundation Course)
 * Stage 3: Construct Walls
 * Stage 4: Leave Openings for Doors & Windows
 * Stage 5: Install Supporting Components (Columns & Lintel Beam)
 * Stage 6: Add Roof Panels & Certification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SMALL_HOUSE_BLUEPRINT,
  challengeManager,
  ConnectionGraph,
  AssessmentEngine,
  StructuralValidator,
} from '../src/construction/index.js';

describe('Advenquo: Small-House Building Challenge End-to-End', () => {
  it('initializes challenge at Stage 1: Foundation Inspection', () => {
    challengeManager.setActiveChallenge('small_house_challenge');
    challengeManager.reset();

    assert.strictEqual(challengeManager.getCurrentStageIndex(), 1);
    const stage = challengeManager.getCurrentStageInfo();
    assert.strictEqual(stage.stageIndex, 1);
    assert.ok(stage.title.includes('Foundation'));
    assert.ok(stage.instruction.includes('foundation'));
  });

  it('advances through all 6 stages sequentially as assembly progresses', () => {
    challengeManager.setActiveChallenge('small_house_challenge');
    challengeManager.reset();

    for (let s = 1; s <= 6; s++) {
      assert.strictEqual(challengeManager.getCurrentStageIndex(), s);
      const stage = challengeManager.getCurrentStageInfo();
      assert.strictEqual(stage.stageIndex, s);
      if (s < 6) {
        challengeManager.advanceStage();
      }
    }
  });

  it('evaluates fully assembled Small House as certified passing Master Builder with full score', () => {
    const graph = new ConnectionGraph();

    // 1. Foundation Slab
    graph.addNode('foundation_slab', 'floor_component', 'foundation', [0, 0, -2.5], [0, 0, 0, 1], true);

    // 2. Corner Base Blocks (Stage 2)
    graph.addNode('target_base_block_fl', 'concrete_block', 'compressive_masonry', [-1.0, 0.1, -1.5], [0, 0, 0, 1]);
    graph.connect('target_base_block_fl', 'block_bottom_socket', 'foundation_slab', 'floor_top_deck');

    graph.addNode('target_base_block_fr', 'concrete_block', 'compressive_masonry', [1.0, 0.1, -1.5], [0, 0, 0, 1]);
    graph.connect('target_base_block_fr', 'block_bottom_socket', 'foundation_slab', 'floor_top_deck');

    graph.addNode('target_base_block_bl', 'concrete_block', 'compressive_masonry', [-1.0, 0.1, -3.5], [0, 0, 0, 1]);
    graph.connect('target_base_block_bl', 'block_bottom_socket', 'foundation_slab', 'floor_top_deck');

    graph.addNode('target_base_block_br', 'concrete_block', 'compressive_masonry', [1.0, 0.1, -3.5], [0, 0, 0, 1]);
    graph.connect('target_base_block_br', 'block_bottom_socket', 'foundation_slab', 'floor_top_deck');

    // 3. Walls (Stage 3)
    graph.addNode('target_wall_back', 'wall_panel', 'wall_partition', [0, 1.4, -3.5], [0, 0, 0, 1]);
    graph.connect('target_wall_back', 'wall_bottom_sill', 'target_base_block_bl', 'block_top_stud');
    graph.connect('target_wall_back', 'wall_bottom_sill_r', 'target_base_block_br', 'block_top_stud');

    graph.addNode('target_wall_side_left', 'wall_panel', 'wall_partition', [-1.0, 1.4, -2.5], [0, 0.7071, 0, 0.7071]);
    graph.connect('target_wall_side_left', 'wall_bottom_sill', 'target_base_block_fl', 'block_top_stud');
    graph.connect('target_wall_side_left', 'wall_bottom_sill_b', 'target_base_block_bl', 'block_top_stud');

    // 4. Sill & Opening Bricks (Stage 4)
    graph.addNode('target_sill_brick_1', 'clay_brick', 'compressive_masonry', [-1.0, 0.25, -2.2], [0, 0, 0, 1]);
    graph.connect('target_sill_brick_1', 'brick_bottom_socket', 'target_base_block_fl', 'block_top_stud');

    graph.addNode('target_sill_brick_2', 'clay_brick', 'compressive_masonry', [-1.0, 0.25, -2.8], [0, 0, 0, 1]);
    graph.connect('target_sill_brick_2', 'brick_bottom_socket', 'target_base_block_bl', 'block_top_stud');

    graph.addNode('target_door_jamb_brick_1', 'clay_brick', 'compressive_masonry', [-0.65, 0.25, -1.5], [0, 0, 0, 1]);
    graph.connect('target_door_jamb_brick_1', 'brick_bottom_socket', 'target_base_block_fl', 'block_top_stud');

    graph.addNode('target_door_jamb_brick_2', 'clay_brick', 'compressive_masonry', [0.65, 0.25, -1.5], [0, 0, 0, 1]);
    graph.connect('target_door_jamb_brick_2', 'brick_bottom_socket', 'target_base_block_fr', 'block_top_stud');

    // 5. Columns & Lintel Beam (Stage 5)
    graph.addNode('target_column_left', 'reinforced_column', 'load_bearing_column', [-0.65, 1.4, -1.5], [0, 0, 0, 1]);
    graph.connect('target_column_left', 'column_base_socket', 'target_base_block_fl', 'block_top_stud');

    graph.addNode('target_column_right', 'reinforced_column', 'load_bearing_column', [0.65, 1.4, -1.5], [0, 0, 0, 1]);
    graph.connect('target_column_right', 'column_base_socket', 'target_base_block_fr', 'block_top_stud');

    graph.addNode('target_lintel_beam', 'horizontal_beam', 'load_transfer_beam', [0, 2.75, -1.5], [0, 0, 0, 1]);
    graph.connect('target_lintel_beam', 'beam_seat_left', 'target_column_left', 'column_top_saddle');
    graph.connect('target_lintel_beam', 'beam_seat_right', 'target_column_right', 'column_top_saddle');

    // 6. Roof Panels (Stage 6)
    graph.addNode('target_roof_panel_left', 'roof_panel', 'weather_enclosure', [-0.6, 2.95, -2.5], [0, 0, 0, 1]);
    graph.connect('target_roof_panel_left', 'roof_seat_left', 'target_lintel_beam', 'beam_top_deck_left');
    graph.connect('target_roof_panel_left', 'roof_rear_seat', 'target_wall_back', 'wall_top_plate');

    graph.addNode('target_roof_panel_right', 'roof_panel', 'weather_enclosure', [0.6, 2.95, -2.5], [0, 0, 0, 1]);
    graph.connect('target_roof_panel_right', 'roof_seat_right', 'target_lintel_beam', 'beam_top_deck_right');
    graph.connect('target_roof_panel_right', 'roof_rear_seat', 'target_wall_back', 'wall_top_plate');

    // Structural Statics Check
    const statics = StructuralValidator.validateStructure(graph);
    assert.strictEqual(statics.isStable, true);
    assert.strictEqual(statics.ungroundedComponents.length, 0);

    // Full Blueprint Assessment Check
    const assessment = AssessmentEngine.assessBlueprint(SMALL_HOUSE_BLUEPRINT, graph);
    assert.strictEqual(assessment.passed, true);
    assert.strictEqual(assessment.missingComponents.length, 0);
    assert.strictEqual(assessment.placementErrors.length, 0);
    assert.ok(assessment.score >= 90);
  });
});
