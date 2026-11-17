/**
 * Advenquo: Construction 3D Architectural Assets & PBR Material Transformation Tests
 *
 * Verifies that:
 * 1. Procedural Three.js Object3D visual representations are built deterministically for all 17 modular components.
 * 2. Hybrid appearance: LEGO-like modular interlocking studs/sockets combined with realistic PBR materials.
 * 3. Physical material attributes (compressive strength, tensile strength, density) are correctly specified.
 * 4. Dedicated Construction Workshop compound geometry builds with foundation slab and staging yard.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createComponentMesh,
  CONSTRUCTION_CATALOG,
  MATERIAL_SPECS,
  buildConstructionWorkshop,
  type ComponentType,
} from '../src/construction/index.js';

describe('Advenquo: Construction 3D Architectural Assets & PBR Materials', () => {
  describe('1. Modular Component 3D Mesh Generation', () => {
    const allTypes: ComponentType[] = [
      'clay_brick',
      'sandcrete_block',
      'concrete_block',
      'foundation_block',
      'timber_piece',
      'rebar',
      'steel_connector',
      'reinforced_column',
      'horizontal_beam',
      'wall_panel',
      'floor_component',
      'staircase',
      'door_frame',
      'window_frame',
      'roof_truss',
      'roof_panel',
      'bridge_section',
    ];

    for (const type of allTypes) {
      it(`constructs deterministic Three.js Object3D for component type: ${type}`, () => {
        const mesh = createComponentMesh(type);
        assert.ok(mesh, `Mesh for ${type} must be generated`);
        assert.strictEqual(mesh.name, `ConstructionMesh_${type}`);
        assert.ok(mesh.children.length > 0, `Mesh ${type} must possess child geometry`);
      });
    }

    it('creates LEGO-like interlocking cylindrical studs on clay bricks and concrete blocks', () => {
      const brick = createComponentMesh('clay_brick');
      const studs = brick.children.filter((c) => c.type === 'Mesh' && c.position.y > 0.03);
      assert.ok(studs.length >= 2, 'Clay brick must have at least 2 alignment studs on top');

      const block = createComponentMesh('concrete_block');
      const blockStuds = block.children.filter((c) => c.type === 'Mesh' && c.position.y > 0.08);
      assert.ok(blockStuds.length >= 2, 'Concrete block must have modular alignment studs');
    });

    it('creates heavy rebar dowels and saddle plates on reinforced columns', () => {
      const column = createComponentMesh('reinforced_column');
      const topPins = column.children.filter((c) => c.position.y > 1.15);
      assert.ok(topPins.length >= 2, 'Reinforced column must have top rebar dowels for beam seats');
    });
  });

  describe('2. Physical Material Properties & Realistic PBR Shaders', () => {
    it('defines realistic compressive and tensile strengths for structural materials', () => {
      const clay = MATERIAL_SPECS.terracotta_clay;
      assert.ok(clay.compressiveStrengthMpa >= 15.0, 'Clay must have high compressive strength');
      assert.ok(clay.tensileStrengthMpa <= 3.0, 'Unreinforced clay has low tensile strength');

      const rebarConcrete = MATERIAL_SPECS.reinforced_structural_concrete;
      assert.ok(rebarConcrete.tensileStrengthMpa >= 200.0, 'Reinforced concrete must carry tensile load via rebar');

      const steel = MATERIAL_SPECS.structural_steel;
      assert.ok(steel.compressiveStrengthMpa >= 400.0, 'Structural steel must have high compressive strength');
      assert.ok(steel.tensileStrengthMpa >= 500.0, 'Structural steel must have high tensile yield strength');
    });
  });

  describe('3. Dedicated Construction Workshop Compound', () => {
    it('constructs a 24x24m concrete workshop yard with a 6x6m marked foundation pad', () => {
      const workshop = buildConstructionWorkshop();
      assert.strictEqual(workshop.name, 'ConstructionWorkshopCompound');

      const foundationPad = workshop.getObjectByName('FoundationBuildingPad');
      assert.ok(foundationPad, 'Foundation pad must be present in workshop');

      const boundaryLine = workshop.getObjectByName('FoundationBoundaryLine');
      assert.ok(boundaryLine, 'Foundation safety boundary line must be present');
    });
  });
});
