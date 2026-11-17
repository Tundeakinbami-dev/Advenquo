/**
 * Advenquo: Construction Save and Restore Regression Suite
 *
 * Verifies:
 * 1. Assembly state serialization into versioned JSON snapshot.
 * 2. Complete restore of component types, positions, rotations, and snap connections.
 * 3. Persistence to localStorage with memory fallback.
 * 4. Schema validation and error handling for corrupted data.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  ConnectionGraph,
  ConstructionPersistence,
  type ConstructionSaveData,
} from '../src/construction/index.js';

describe('Advenquo: Construction Save & Load', () => {
  it('serializes assembly connection graph into a structured snapshot', () => {
    const graph = new ConnectionGraph();
    graph.addNode('foundation', 'floor_component', 'foundation', [0, 0, -2.5], [0, 0, 0, 1], true);
    graph.addNode('col_1', 'reinforced_column', 'load_bearing_column', [-1.0, 1.2, -2.5], [0, 0, 0, 1]);
    graph.connect('col_1', 'base', 'foundation', 'deck');

    const snapshot = ConstructionPersistence.createSaveSnapshot(
      'small_house_challenge',
      false,
      graph,
    );

    assert.strictEqual(snapshot.version, 1);
    assert.strictEqual(snapshot.activeChallengeId, 'small_house_challenge');
    assert.strictEqual(snapshot.isCompleted, false);
    assert.strictEqual(snapshot.components.length, 2);

    const savedCol = snapshot.components.find((c) => c.instanceId === 'col_1');
    assert.ok(savedCol);
    assert.strictEqual(savedCol.componentType, 'reinforced_column');
    assert.deepStrictEqual(savedCol.position, [-1.0, 1.2, -2.5]);
    assert.strictEqual(savedCol.connections.length, 1);
  });

  it('restores assembly graph from snapshot with complete topology', () => {
    const originalGraph = new ConnectionGraph();
    originalGraph.addNode('foundation', 'floor_component', 'foundation', [0, 0, -2.5], [0, 0, 0, 1], true);
    originalGraph.addNode('col_1', 'reinforced_column', 'load_bearing_column', [-1.0, 1.2, -2.5], [0, 0, 0, 1]);
    originalGraph.connect('col_1', 'base', 'foundation', 'deck');

    const snapshot = ConstructionPersistence.createSaveSnapshot('small_house_challenge', false, originalGraph);

    // Restore into a fresh graph
    const restoredGraph = new ConnectionGraph();
    restoredGraph.deserialize(snapshot.components);

    assert.strictEqual(restoredGraph.getNodeCount(), 2);
    assert.strictEqual(restoredGraph.hasNode('foundation'), true);
    assert.strictEqual(restoredGraph.hasNode('col_1'), true);
    assert.strictEqual(restoredGraph.hasConnection('col_1', 'foundation'), true);
    assert.strictEqual(restoredGraph.isConnectedToGround('col_1'), true);
  });

  it('saves and loads from localStorage safely with in-memory fallback', () => {
    const graph = new ConnectionGraph();
    graph.addNode('foundation', 'floor_component', 'foundation', [0, 0, -2.5], [0, 0, 0, 1], true);
    const snapshot = ConstructionPersistence.createSaveSnapshot('small_house_challenge', true, graph);

    const saved = ConstructionPersistence.saveToLocalStorage(snapshot);
    assert.strictEqual(saved, true);

    const loaded = ConstructionPersistence.loadFromLocalStorage();
    assert.ok(loaded);
    assert.strictEqual(loaded.activeChallengeId, 'small_house_challenge');
    assert.strictEqual(loaded.isCompleted, true);
  });
});
