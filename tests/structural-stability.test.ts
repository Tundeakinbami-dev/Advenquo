/**
 * Advenquo: Structural Stability & Engineering Statics Regression Suite
 *
 * Verifies:
 * 1. Load-path continuity from upper components down to foundation pad.
 * 2. Ungrounded and floating component detection.
 * 3. Bearing support rules for roofs (must rest on beams, walls, or columns).
 * 4. Lintel beam support requirements (must span at least two supports).
 * 5. Educational disclaimer inclusion on every structural report.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ConnectionGraph,
  StructuralValidator,
} from '../src/construction/index.js';

describe('Advenquo: Structural Stability & Statics', () => {
  it('detects ungrounded and floating components with severed load paths', () => {
    const graph = new ConnectionGraph();
    graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
    // Floating column not connected to ground
    graph.addNode('floating_col', 'reinforced_column', 'load_bearing_column', [0, 2.0, 0], [0, 0, 0, 1]);

    const report = StructuralValidator.validateStructure(graph);
    assert.strictEqual(report.isStable, false);
    assert.ok(report.ungroundedComponents.includes('floating_col'));
    assert.ok(report.stabilityErrors.length > 0);
  });

  it('detects unanchored roof components lacking load transfer beams or walls', () => {
    const graph = new ConnectionGraph();
    graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
    graph.addNode('brick_1', 'clay_brick', 'compressive_masonry', [0, 0.08, 0], [0, 0, 0, 1]);
    graph.connect('brick_1', 'brick_bottom_socket', 'ground', 'floor_top_deck');

    // Roof panel hovering with no bearing support
    graph.addNode('roof_1', 'roof_panel', 'weather_enclosure', [2, 2.5, 0], [0, 0, 0, 1]);

    const report = StructuralValidator.validateStructure(graph);
    assert.strictEqual(report.isStable, false);
    assert.ok(report.missingLoadPaths.includes('roof_1'));
  });

  it('passes stability when columns, lintel, and roof form continuous bearing load path', () => {
    const graph = new ConnectionGraph();
    graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);

    // Left and right columns connected to ground
    graph.addNode('col_l', 'reinforced_column', 'load_bearing_column', [-1.0, 1.2, 0], [0, 0, 0, 1]);
    graph.addNode('col_r', 'reinforced_column', 'load_bearing_column', [1.0, 1.2, 0], [0, 0, 0, 1]);
    graph.connect('col_l', 'base', 'ground', 'deck');
    graph.connect('col_r', 'base', 'ground', 'deck');

    // Lintel beam spanning across both columns
    graph.addNode('lintel', 'horizontal_beam', 'load_transfer_beam', [0, 2.4, 0], [0, 0, 0, 1]);
    graph.connect('lintel', 'left_seat', 'col_l', 'top');
    graph.connect('lintel', 'right_seat', 'col_r', 'top');

    // Roof panel resting on the lintel beam
    graph.addNode('roof', 'roof_panel', 'weather_enclosure', [0, 2.7, 0], [0, 0, 0, 1]);
    graph.connect('roof', 'seat', 'lintel', 'top');

    const report = StructuralValidator.validateStructure(graph);
    assert.strictEqual(report.isStable, true);
    assert.strictEqual(report.ungroundedComponents.length, 0);
    assert.strictEqual(report.missingLoadPaths.length, 0);
    assert.strictEqual(report.stabilityErrors.length, 0);
  });

  it('fails lintel beam if it only has a single bearing support (cantilever over limit)', () => {
    const graph = new ConnectionGraph();
    graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);

    // Only one column
    graph.addNode('col_l', 'reinforced_column', 'load_bearing_column', [-1.0, 1.2, 0], [0, 0, 0, 1]);
    graph.connect('col_l', 'base', 'ground', 'deck');

    // Beam connected only to col_l (no right support)
    graph.addNode('lintel', 'horizontal_beam', 'load_transfer_beam', [0, 2.4, 0], [0, 0, 0, 1]);
    graph.connect('lintel', 'left_seat', 'col_l', 'top');

    const report = StructuralValidator.validateStructure(graph);
    assert.strictEqual(report.isStable, false);
    assert.ok(report.stabilityErrors.some((e) => e.includes('requires support at both ends')));
  });

  it('includes educational engineering disclaimer on every structural report', () => {
    const report = StructuralValidator.validateStructure(new ConnectionGraph());
    assert.ok(report.disclaimer.includes('Educational engineering simulation only'));
  });
});
