/**
 * Advenquo: Structural Engineering Statics & Stability Validation Tests
 *
 * Verifies that:
 * 1. Structural validator detects floating blocks with no vertical load path to the ground.
 * 2. Unanchored roof panels without beam or bearing wall support are flagged.
 * 3. Dead load distribution accumulates vertical gravity loads down through columns and masonry.
 * 4. Center of mass projection must fall inside the foundation footprint to prevent toppling.
 * 5. Educational disclaimer is prominently included in every engineering assessment report.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  StructuralValidator,
  StabilityValidator,
  LoadDistribution,
  ConnectionGraph,
  CONSTRUCTION_CONSTANTS,
  type PlacedComponentRecord,
} from '../src/construction/index.js';

describe('Advenquo: Structural Engineering Statics & Stability', () => {
  it('detects ungrounded and floating components with broken load paths', () => {
    const graph = new ConnectionGraph();
    // Block placed in mid-air at Y=2.0m with no connections to ground
    graph.addNode('floating_block', 'concrete_block', 'compressive_masonry', [0, 2.0, -2.5], [0, 0, 0, 1], false);

    const report = StructuralValidator.validate(graph);
    assert.strictEqual(report.isStable, false, 'Floating structure must not pass stability check');
    assert.ok(report.ungroundedComponents.includes('floating_block'));
    assert.ok(report.stabilityErrors.length > 0);
  });

  it('detects unanchored roof components lacking load transfer beams or walls', () => {
    const graph = new ConnectionGraph();
    // Foundation block on ground
    graph.addNode('ground_block', 'concrete_block', 'compressive_masonry', [0, 0, -2.5], [0, 0, 0, 1], true);
    // Roof placed on ground block without lintel beam
    graph.addNode('free_roof', 'roof_panel', 'weather_enclosure', [0, 0.2, -2.5], [0, 0, 0, 1], false);
    graph.connect('free_roof', 'roof_bearing_left', 'ground_block', 'block_top_stud');

    const report = StructuralValidator.validate(graph);
    assert.ok(
      report.missingLoadPaths.some((e) => e.includes('Roof component')),
      'Roof must have bearing walls or lintel beams'
    );
  });

  it('calculates vertical dead load accumulation down columns', () => {
    const components = new Map<string, PlacedComponentRecord>();
    components.set('col_1', {
      instanceId: 'col_1',
      componentType: 'reinforced_column',
      position: [0, 1.2, -2.5],
      rotation: [0, 0, 0, 1],
      structuralRole: 'load_bearing_column',
      isGrounded: true,
      connections: [],
      isStaticOptimized: true,
    });
    components.set('beam_1', {
      instanceId: 'beam_1',
      componentType: 'horizontal_beam',
      position: [0, 2.45, -2.5],
      rotation: [0, 0, 0, 1],
      structuralRole: 'load_transfer_beam',
      isGrounded: false,
      connections: [{ mySnapPointId: 's1', targetInstanceId: 'col_1', targetSnapPointId: 't1' }],
      isStaticOptimized: true,
    });

    const loads = LoadDistribution.calculateLoads(components);
    const colLoad = loads.get('col_1');
    assert.ok(colLoad);
    assert.ok(colLoad.totalVerticalLoadKn > colLoad.selfWeightKn, 'Column must carry upper beam weight');
    assert.strictEqual(colLoad.isOverstressed, false);
  });

  it('fails stability check if center of mass falls outside foundation footprint', () => {
    const components = new Map<string, PlacedComponentRecord>();
    components.set('footing', {
      instanceId: 'footing',
      componentType: 'foundation_block',
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      structuralRole: 'foundation',
      isGrounded: true,
      connections: [],
      isStaticOptimized: true,
    });
    // Massive box girder bridge span cantilevered far off at X=6.0m
    components.set('extreme_cantilever', {
      instanceId: 'extreme_cantilever',
      componentType: 'bridge_section',
      position: [6.0, 1.5, 0],
      rotation: [0, 0, 0, 1],
      structuralRole: 'span_deck',
      isGrounded: false,
      connections: [],
      isStaticOptimized: true,
    });

    const result = StabilityValidator.validate(components);
    assert.strictEqual(result.isStable, false);
    assert.strictEqual(result.topplingRisk, true, 'Massive off-center load must trigger toppling risk');
  });

  it('includes educational engineering disclaimer on every structural report', () => {
    const graph = new ConnectionGraph();
    const report = StructuralValidator.validate(graph);
    assert.ok(report.disclaimer.includes(CONSTRUCTION_CONSTANTS.DISCLAIMER));
  });
});
