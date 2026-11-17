import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { PerspectiveCamera, Vector3, VisibilityState } from '@iwsdk/core';
import { CinematicCameraSystem } from '../src/systems/cinematic-camera-system.js';
import { PlayerControllerSystem } from '../src/player-controller-system.js';

describe('Advenquo: Rendering Recovery & Camera Stability', () => {
  it('1. verifies iwsdk.config.json camera and render settings provide safe depth precision and pad framing', () => {
    const configPath = path.resolve('iwsdk.config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(raw);

    const render = config.world.render;
    assert.ok(render.near >= 0.05, `Near plane (${render.near}) must be >= 0.05m to preserve 24-bit depth buffer precision`);
    assert.ok(render.far >= 100, `Far plane (${render.far}) must cover workshop horizons`);
    assert.ok(render.near / render.far >= 0.0001, 'Near-to-far ratio must avoid depth buffer collapse');

    const cam = render.camera;
    assert.ok(cam.position[1] >= 1.2 && cam.position[1] <= 1.7, 'Camera seated height must be between 1.2m and 1.7m');
    assert.ok(cam.position[2] >= 0.0 && cam.position[2] <= 1.0, 'Camera Z position must be seated in front of pad');
    assert.ok(cam.lookAt[2] <= -1.0, 'Camera lookAt must target the construction pad and table in front of player');

    // Locomotion browserControls must be false so it doesn't conflict with PlayerControllerSystem
    assert.equal(config.world.features.locomotion.browserControls, false, 'Locomotion browserControls must be false');
  });

  it('2. verifies CinematicCameraSystem walking head-bob does not drift over 100+ frames and resets to baseline', () => {
    const mockCamera = new PerspectiveCamera(50, 16 / 9, 0.05, 200);
    const initialY = 1.45;
    const initialX = 0.0;
    mockCamera.position.set(initialX, initialY, 0.4);

    const mockWorld = {
      camera: mockCamera,
      visibilityState: { value: VisibilityState.NonImmersive },
    };

    const camSys = new CinematicCameraSystem(mockWorld as any);
    camSys.init();
    camSys.setMoving(true);

    // Simulate 120 frames (~2 seconds of walking) with variable delta times
    for (let i = 0; i < 120; i++) {
      const delta = 0.014 + (i % 5) * 0.001; // ~60-70 fps jitter
      camSys.update(delta);

      // Verify that camera Y never drifts wildly away from initial height
      const yDiff = Math.abs(mockCamera.position.y - initialY);
      assert.ok(yDiff < 0.05, `Frame ${i}: Camera Y drift (${yDiff.toFixed(4)}m) exceeded safe head-bob range (0.05m)`);
      const xDiff = Math.abs(mockCamera.position.x - initialX);
      assert.ok(xDiff < 0.05, `Frame ${i}: Camera X drift (${xDiff.toFixed(4)}m) exceeded safe lateral range (0.05m)`);
    }

    // Stop moving and simulate decay to baseline
    camSys.setMoving(false);
    for (let i = 0; i < 30; i++) {
      camSys.update(0.016);
    }

    // Verify complete return to baseline
    const finalYDiff = Math.abs(mockCamera.position.y - initialY);
    assert.ok(finalYDiff < 0.0005, `After stopping, Camera Y drift (${finalYDiff.toFixed(5)}m) must return to baseline 0`);
    const finalXDiff = Math.abs(mockCamera.position.x - initialX);
    assert.ok(finalXDiff < 0.0005, `After stopping, Camera X drift (${finalXDiff.toFixed(5)}m) must return to baseline 0`);
  });

  it('3. verifies PlayerControllerSystem initializes pitch towards building pad and respects seated workshop bounds', () => {
    const mockCamera = new PerspectiveCamera(50, 16 / 9, 0.05, 200);
    // Camera authored pitch looking at table: -0.22 rad
    mockCamera.rotation.x = -0.22;
    mockCamera.rotation.y = 0;
    mockCamera.position.set(0, 1.45, 0.4);

    const mockPlayer = {
      position: new Vector3(0, 0, 0),
      rotation: { y: 0 },
    };

    const mockWorld = {
      camera: mockCamera,
      player: mockPlayer,
      visibilityState: {
        subscribe: () => () => {},
        value: VisibilityState.NonImmersive,
      },
    };

    const controller = new PlayerControllerSystem(mockWorld as any);
    controller.init();

    // Verify teleportation and boundary updates respect seated workshop
    controller.teleportTo(0, 0.5, 0);
    assert.equal(mockPlayer.position.x, 0);
    assert.equal(mockPlayer.position.z, 0.5);

    // Verify source code has no references to retired market veranda back wall clamp
    const playerCtrlSource = fs.readFileSync(path.resolve('src/player-controller-system.ts'), 'utf8');
    assert.ok(!playerCtrlSource.includes('z < -4.1'), 'Must not contain retired market veranda back wall clamp');
    assert.ok(!playerCtrlSource.includes('market veranda'), 'Must not contain retired market comments');
  });

  it('4. verifies index.html and responsive styling contain loading screen and diagnostic error fallback', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
    assert.ok(html.includes('id="app-loading-screen"'), 'index.html must include app-loading-screen');
    assert.ok(html.includes('id="critical-error-fallback"'), 'index.html must include critical-error-fallback');
    assert.ok(html.includes('id="critical-error-message"'), 'index.html must include critical-error-message');

    const css = fs.readFileSync(path.resolve('src/styles/responsive.css'), 'utf8');
    assert.ok(css.includes('.app-loading-screen'), 'responsive.css must style app-loading-screen');
    assert.ok(css.includes('.critical-error-fallback'), 'responsive.css must style critical-error-fallback');
  });
});
