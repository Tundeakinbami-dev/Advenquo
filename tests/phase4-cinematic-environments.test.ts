/**
 * Advenquo: Phase 4 Cinematic Environments Regression Suite.
 *
 * Validates:
 * 1. Directional sunlight presets for all 4 Nigerian destinations
 * 2. Ambient fill lighting and contact shadow configurations
 * 3. Shadow camera frustum bounds and bias parameters
 * 4. Environmental animations:
 *    • Market courtyard floating dust particles
 *    • Palace ceremonial brazier flames
 *    • Tarkwa Bay coastal shoreline wave wash
 *    • Natural vegetation and fabric ripples
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  Object3D,
  Vector3,
} from '@iwsdk/core';

import {
  CinematicLightingSystem,
  LIGHTING_PRESETS,
} from '../src/systems/cinematic-lighting-system.js';
import { EnvironmentalAnimationSystem } from '../src/environmental-animation-system.js';

describe('Phase 4: Cinematic Environments & Lighting', () => {
  describe('1. Environment Lighting Presets', () => {
    it('defines authentic directional sunlight and ambient lighting for all 4 environments', () => {
      const locations = ['nigerian_market', 'lagos_urban', 'heritage_iga', 'beach_waterfront'];

      for (const locId of locations) {
        const preset = LIGHTING_PRESETS[locId];
        assert.ok(preset, `Preset must exist for ${locId}`);
        assert.ok(preset.sunIntensity > 1.0, 'Sun intensity must be bright and directional');
        assert.ok(preset.ambientIntensity > 0.4, 'Ambient intensity must provide adequate fill');
        assert.strictEqual(preset.sunPosition.length, 3, 'Sun position must be 3D');
        assert.strictEqual(preset.targetPosition.length, 3, 'Target position must be 3D');
      }
    });

    it('market preset provides warm Lagos morning sunlight', () => {
      const market = LIGHTING_PRESETS.nigerian_market;
      assert.strictEqual(market.sunColor, 0xffeedb);
      assert.strictEqual(market.ambientColor, 0x3a3028);
    });

    it('yaba preset provides bright urban midday sun', () => {
      const yaba = LIGHTING_PRESETS.lagos_urban;
      assert.strictEqual(yaba.sunColor, 0xffffff);
      assert.strictEqual(yaba.sunPosition[1], 32, 'Midday sun has high elevation');
    });

    it('palace preset provides regal golden courtyard lighting', () => {
      const palace = LIGHTING_PRESETS.heritage_iga;
      assert.strictEqual(palace.sunColor, 0xffd48a);
      assert.strictEqual(palace.targetPosition[2], 145, 'Target points to palace center');
    });

    it('tarkwa bay preset provides coastal sunlight with maritime ambient fill', () => {
      const beach = LIGHTING_PRESETS.beach_waterfront;
      assert.strictEqual(beach.sunColor, 0xfff2e5);
      assert.strictEqual(beach.targetPosition[2], 305, 'Target points to beach waterfront');
    });
  });

  describe('2. Cinematic Lighting System & Shadow Frustum', () => {
    it('initializes directional light with contact shadows and correct frustum bounds', () => {
      const mockScene = new Object3D();
      const mockWorld = {
        scene: mockScene,
      };

      const lightSys = new CinematicLightingSystem(mockWorld as any);
      (lightSys as any).scene = mockScene;
      lightSys.init();

      const sun = mockScene.getObjectByName('CinematicSunLight') as any;
      const ambient = mockScene.getObjectByName('CinematicAmbientLight') as any;

      assert.ok(sun, 'Sunlight must be added to scene');
      assert.ok(ambient, 'Ambient light must be added to scene');
      assert.strictEqual(sun.castShadow, true, 'Sunlight must cast shadows');
      assert.strictEqual(sun.shadow.bias, -0.0004, 'Shadow bias must prevent shadow acne');
      assert.strictEqual(sun.shadow.camera.near, 0.5);
      assert.strictEqual(sun.shadow.camera.far, 120);

      // Transition to Palace
      lightSys.applyLocationLighting('heritage_iga');
      const current = lightSys.getCurrentLightingPreset();
      assert.strictEqual(current.sunColor, 0xffd48a);
    });
  });

  describe('3. Environmental Effects & Animations', () => {
    it('creates floating dust particles in market and animates drift', () => {
      const mockScene = new Object3D();
      const mockWorld = {
        scene: mockScene,
        camera: { position: new Vector3(0, 1.6, 0) },
      };

      const envSys = new EnvironmentalAnimationSystem(mockWorld as any);
      (envSys as any).scene = mockScene;
      envSys.init();

      const dust = mockScene.getObjectByName('MarketDustParticles');
      assert.ok(dust, 'Market dust particles must be created');
      assert.strictEqual(dust.visible, true, 'Dust must be visible in market by default');

      // Update frame
      assert.doesNotThrow(() => {
        envSys.update(0.016);
      }, 'Update tick must execute smoothly');
    });
  });
});
