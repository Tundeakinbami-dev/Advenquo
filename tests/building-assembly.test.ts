/**
 * Advenquo: Building Assembly & Connection Graph Regression Suite
 *
 * Verifies:
 * 1. ConnectionGraph maintains nodes, structural roles, and transforms.
 * 2. Bidirectional connections between assembled blocks.
 * 3. Grounding propagation from foundation slab through stacked courses.
 * 4. Disassembly and undo (removing a node cleanly breaks its connections).
 * 5. Assembly commit through AssemblySystem.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  ConnectionGraph,
  assemblySystem,
} from '../src/construction/index.js';

describe('Advenquo: Building Assembly & Connection Graph', () => {
  it('adds and queries nodes in the connection graph', () => {
    const graph = new ConnectionGraph();
    graph.addNode('foundation_1', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
    graph.addNode('block_1', 'concrete_block', 'compressive_masonry', [0, 0.2, 0], [0, 0, 0, 1]);

    assert.strictEqual(graph.getNodeCount(), 2);
    assert.strictEqual(graph.hasNode('foundation_1'), true);
    assert.strictEqual(graph.hasNode('block_1'), true);
    assert.strictEqual(graph.getNode('foundation_1')?.isGrounded, true);
    assert.strictEqual(graph.getNode('block_1')?.isGrounded, false);
  });

  it('connects blocks bidirectionally and propagates grounding', () => {
    const graph = new ConnectionGraph();
    graph.addNode('foundation', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
    graph.addNode('col_1', 'reinforced_column', 'load_bearing_column', [0, 1.2, 0], [0, 0, 0, 1]);

    assert.strictEqual(graph.isConnectedToGround('col_1'), false);

    const connected = graph.connect('col_1', 'column_base_socket', 'foundation', 'floor_top_deck');
    assert.strictEqual(connected, true);
    assert.strictEqual(graph.hasConnection('col_1', 'foundation'), true);
    assert.strictEqual(graph.hasConnection('foundation', 'col_1'), true);
    assert.strictEqual(graph.isConnectedToGround('col_1'), true, 'Column must be grounded when connected to foundation');
  });

  it('supports multi-tier stack and transitive grounding propagation', () => {
    const graph = new ConnectionGraph();
    graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
    graph.addNode('col', 'reinforced_column', 'load_bearing_column', [0, 1.2, 0], [0, 0, 0, 1]);
    graph.addNode('beam', 'horizontal_beam', 'load_transfer_beam', [0, 2.4, 0], [0, 0, 0, 1]);
    graph.addNode('roof', 'roof_panel', 'weather_enclosure', [0, 2.8, 0], [0, 0, 0, 1]);

    graph.connect('col', 'base', 'ground', 'deck');
    graph.connect('beam', 'bearing', 'col', 'top');
    graph.connect('roof', 'seat', 'beam', 'top');

    assert.strictEqual(graph.isConnectedToGround('col'), true);
    assert.strictEqual(graph.isConnectedToGround('beam'), true);
    assert.strictEqual(graph.isConnectedToGround('roof'), true);
  });

  it('disassembles nodes cleanly and severs load path', () => {
    const graph = new ConnectionGraph();
    graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
    graph.addNode('col', 'reinforced_column', 'load_bearing_column', [0, 1.2, 0], [0, 0, 0, 1]);
    graph.connect('col', 'base', 'ground', 'deck');

    // Remove column (undo action)
    graph.removeNode('col');
    assert.strictEqual(graph.getNodeCount(), 1);
    assert.strictEqual(graph.hasNode('col'), false);
    assert.strictEqual(graph.hasConnection('ground', 'col'), false);
  });

  it('commits snap placement via AssemblySystem', () => {
    assemblySystem.registerPlacedBlock({
      instanceId: 'test_foundation_pad',
      componentType: 'floor_component',
      position: new Vector3(0, 0.05, -2.5),
      rotation: new Quaternion(),
      isGrounded: true,
    });

    const candidate = assemblySystem.findBestSnapCandidate(
      'test_base_block',
      'concrete_block',
      new Vector3(0, 0.25, -2.5),
      new Quaternion(),
    );

    assert.ok(candidate);
    assert.strictEqual(candidate.isValid, true);

    const commit = assemblySystem.commitSnapPlacement('test_base_block', 'concrete_block', candidate);
    assert.strictEqual(commit.success, true);
    assert.strictEqual(assemblySystem.getGraph().hasConnection('test_base_block', 'test_foundation_pad'), true);
  });
});
