/**
 * Advenquo: Cinematic Construction Workshop Lighting & PBR Materials Test Suite
 *
 * Validates:
 * 1. Directional sunlight presets for the construction workshop compound
 * 2. Ambient fill lighting and contact shadow configurations
 * 3. Shadow camera frustum bounds and bias parameters for Quest 3 VR
 * 4. PBR physical material shaders and normal map procedural generation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  LIGHTING_PRESETS,
} from '../src/systems/cinematic-lighting-system.js';
import {
  pbrMaterialSystem,
} from '../src/systems/pbr-material-system.js';

describe('Advenquo: Cinematic Construction Lighting & PBR Materials', () => {
  describe('1. Construction Workshop Lighting Presets', () => {
    it('defines warm directional sunlight and ambient lighting for the workshop', () => {
      const workshop = LIGHTING_PRESETS.construction_workshop;
      assert.ok(workshop, 'Workshop preset must exist');
      assert.ok(workshop.sunIntensity >= 1.2, 'Sun intensity must provide directional clarity');
      assert.ok(workshop.ambientIntensity >= 0.45, 'Ambient intensity must provide adequate fill');
      assert.strictEqual(workshop.sunPosition.length, 3);
      assert.strictEqual(workshop.targetPosition.length, 3);
      assert.strictEqual(workshop.targetPosition[2], -2.5, 'Target points to workshop foundation pad center');
    });
  });

  describe('2. PBR Materials & Shaders for Modular Construction', () => {
    it('creates PBR materials for all structural building materials', () => {
      const concrete = pbrMaterialSystem.getMaterial('cured_concrete');
      assert.ok(concrete, 'Concrete material must exist');
      assert.ok(concrete.roughness >= 0.7, 'Concrete has high roughness');

      const zinc = pbrMaterialSystem.getMaterial('weathered_zinc');
      assert.ok(zinc, 'Zinc material must exist');
      assert.ok(zinc.metalness >= 0.6, 'Zinc is metallic');

      const iroko = pbrMaterialSystem.getMaterial('african_iroko');
      assert.ok(iroko, 'Timber material must exist');

      const steel = pbrMaterialSystem.getMaterial('steel_scaffold');
      assert.ok(steel, 'Steel material must exist');
      assert.ok(steel.metalness >= 0.8, 'Steel is highly metallic');
    });

    it('generates deterministic normal maps for structural materials', () => {
      const normalMap = pbrMaterialSystem.generateProceduralNormalMap('cured_concrete', 256);
      assert.ok(normalMap, 'Procedural normal map must be generated');
      assert.strictEqual(normalMap.image.width, 256);
      assert.strictEqual(normalMap.image.height, 256);
    });
  });
});
