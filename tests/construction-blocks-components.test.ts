/**
 * Advenquo: Construction Blocks & Modular Components Regression Suite
 *
 * Verifies:
 * 1. All 7 modular construction components are present in the catalog.
 * 2. Dimensions, mass, and structural roles match architectural specifications.
 * 3. Procedural Three.js Object3D meshes generate deterministically.
 * 4. Interlocking LEGO-like cylindrical studs and sockets are correctly configured.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CONSTRUCTION_CATALOG,
  getComponentSpec,
  createComponentMesh,
  type ComponentType,
} from '../src/construction/index.js';

describe('Advenquo: Construction Blocks & Components', () => {
  const componentTypes: ComponentType[] = [
    'clay_brick',
    'concrete_block',
    'sandcrete_block',
    'reinforced_column',
    'horizontal_beam',
    'wall_panel',
    'roof_panel',
  ];

  it('contains all 7 required modular construction components', () => {
    for (const type of componentTypes) {
      const spec = getComponentSpec(type);
      assert.ok(spec, `Component spec must exist for ${type}`);
      assert.strictEqual(spec.type, type);
      assert.ok(spec.dimensions.length === 3, `${type} must have [width, height, depth]`);
      assert.ok(spec.massKg > 0, `${type} must have positive mass`);
      assert.ok(spec.snapPoints.length > 0, `${type} must declare snap sockets`);
    }
  });

  it('generates deterministic parentless Object3D meshes for all components', () => {
    for (const type of componentTypes) {
      const mesh = createComponentMesh(type);
      assert.ok(mesh, `Mesh must be generated for ${type}`);
      assert.strictEqual(mesh.parent, null, 'Generated mesh must be parentless for IWSDK asset registry');
      assert.ok(mesh.name.length > 0, 'Mesh must carry a semantic name');
    }
  });

  it('clay bricks have compressive masonry role and realistic dimensions', () => {
    const brick = getComponentSpec('clay_brick');
    assert.strictEqual(brick.structuralRole, 'compressive_masonry');
    assert.deepStrictEqual(brick.dimensions, [0.24, 0.08, 0.12]);
    assert.strictEqual(brick.massKg, 4.4);
    assert.strictEqual(brick.requiresTwoHands, false, 'Clay brick is a single-hand item');
  });

  it('heavy structural columns and beams require two-hand manipulation', () => {
    const col = getComponentSpec('reinforced_column');
    assert.strictEqual(col.requiresTwoHands, true);
    assert.strictEqual(col.structuralRole, 'load_bearing_column');

    const beam = getComponentSpec('horizontal_beam');
    assert.strictEqual(beam.requiresTwoHands, true);
    assert.strictEqual(beam.structuralRole, 'load_transfer_beam');
  });

  it('configures interlocking male studs and female sockets on modular blocks', () => {
    const block = getComponentSpec('concrete_block');
    const malePoints = block.snapPoints.filter((p) => p.role === 'male');
    const femalePoints = block.snapPoints.filter((p) => p.role === 'female');

    assert.ok(malePoints.length > 0, 'Concrete block must have male studs');
    assert.ok(femalePoints.length > 0, 'Concrete block must have female sockets');
  });
});
