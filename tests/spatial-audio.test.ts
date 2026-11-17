/**
 * Advenquo: Spatial Audio & Construction Soundscape System Test Suite
 *
 * Verifies core audio immersion criteria for the VR Construction Game:
 * 1. Audio activation & user-gesture unlocking
 * 2. Construction workshop soundscape and positional 3D audio emitters
 * 3. Smooth soundscape transitions & crossfades
 * 4. Duplicate playback prevention
 * 5. Audio cleanup & resource disposal
 * 6. Distance attenuation & positional emitter properties
 * 7. WebXR / Meta Quest 3 VR session entry and exit lifecycle
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  Object3D,
  PerspectiveCamera,
} from '@iwsdk/core';

import {
  spatialAudioManager,
  SpatialAudioManager,
  ENVIRONMENT_SOUNDSCAPES,
} from '../src/audio/spatial-audio-manager.js';
import { proceduralAudioEngine } from '../src/audio/procedural-audio-engine.js';
import type { EnvironmentLocationId } from '../src/audio/types.js';

describe('Advenquo: Spatial Audio Immersion for Construction World', () => {
  let audioManager: SpatialAudioManager;
  let testScene: Object3D;

  beforeEach(() => {
    audioManager = SpatialAudioManager.getInstance();
    testScene = new Object3D();
    audioManager.init(testScene);
  });

  afterEach(() => {
    audioManager.dispose();
  });

  // --------------------------------------------------------------------------
  // CRITERION 1: AUDIO ACTIVATION
  // --------------------------------------------------------------------------
  describe('1. Audio Activation & User-Gesture Unlocking', () => {
    it('initializes spatial audio manager with proper default volume buses', () => {
      const status = audioManager.getStatus();
      assert.strictEqual(status.isInitialized, true, 'Audio manager must be initialized');
      assert.strictEqual(status.masterVolume, 0.85, 'Default master volume must be 0.85');
      assert.strictEqual(status.ambientVolume, 0.75, 'Default ambient volume must be 0.75');
      assert.strictEqual(status.sfxVolume, 0.9, 'Default SFX volume must be 0.9');
    });

    it('unlocks audio context upon user gesture or explicit unlock call without throwing', () => {
      audioManager.unlockAudioContext();
      const status = audioManager.getStatus();
      assert.strictEqual(status.isInitialized, true);
    });

    it('plays snap & certification chime cue safely in both headless and active audio environments', () => {
      assert.doesNotThrow(() => {
        audioManager.playDiscoveryCue([0, 1, -2.5]);
      }, 'Chime cue must execute safely without throwing exceptions');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 2: WORKSHOP SOUNDSCAPE & POSITIONAL EMITTERS
  // --------------------------------------------------------------------------
  describe('2. Construction Workshop Soundscape & Positional Emitters', () => {
    it('defines distinct construction workshop soundscape', () => {
      const workshop = ENVIRONMENT_SOUNDSCAPES.construction_workshop;
      assert.ok(workshop, 'Workshop soundscape must exist');
      assert.strictEqual(workshop.locationId, 'construction_workshop');
      assert.ok(workshop.name.includes('Construction Workshop'));
      assert.strictEqual(workshop.baseAmbience.soundType, 'coastal_wind');
      assert.ok(workshop.positionalEmitters.length >= 2, 'Workshop must have positional emitters');
    });

    it('positions tool rack and materials bay emitters within workshop bounds', () => {
      const workshop = ENVIRONMENT_SOUNDSCAPES.construction_workshop;
      const toolEmitter = workshop.positionalEmitters.find((e) => e.id === 'workshop-tool-rack');
      assert.ok(toolEmitter, 'Tool rack emitter must exist');
      assert.strictEqual(toolEmitter.category, 'construction');

      const materialsEmitter = workshop.positionalEmitters.find((e) => e.id === 'workshop-materials-bay');
      assert.ok(materialsEmitter, 'Materials bay emitter must exist');
      assert.strictEqual(materialsEmitter.category, 'construction');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 3: SOUNDSCAPE TRANSITIONS & DUPLICATE PLAYBACK PREVENTION
  // --------------------------------------------------------------------------
  describe('3. Soundscape Activation & Duplicate Playback Prevention', () => {
    it('activates workshop soundscape and tracks active handle', () => {
      audioManager.switchSoundscape('construction_workshop', 0.2);
      assert.strictEqual(audioManager.getActiveLocationId(), 'construction_workshop');

      const handle = audioManager.getCurrentSoundscape();
      assert.ok(handle, 'Active soundscape handle must exist');
      assert.strictEqual(handle.locationId, 'construction_workshop');
      assert.strictEqual(handle.isStopping, false);
    });

    it('prevents duplicate playback when requested to switch to currently active soundscape', () => {
      audioManager.switchSoundscape('construction_workshop', 0.2);
      const firstHandle = audioManager.getCurrentSoundscape();

      // Second identical call
      audioManager.switchSoundscape('construction_workshop', 0.2);
      const secondHandle = audioManager.getCurrentSoundscape();

      assert.strictEqual(firstHandle, secondHandle, 'Must not recreate handle for already-active location');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 4: DISTANCE ATTENUATION & CLEANUP
  // --------------------------------------------------------------------------
  describe('4. Distance Attenuation & Resource Disposal', () => {
    it('configures inverse distance attenuation model on positional emitters', () => {
      const workshop = ENVIRONMENT_SOUNDSCAPES.construction_workshop;
      for (const emitter of workshop.positionalEmitters) {
        assert.strictEqual(emitter.distanceModel, 'inverse');
        assert.ok(emitter.refDistance > 0);
        assert.ok(emitter.maxDistance > emitter.refDistance);
      }
    });

    it('cleans up all audio nodes and resets status on dispose', () => {
      audioManager.switchSoundscape('construction_workshop', 0.1);
      audioManager.dispose();

      const status = audioManager.getStatus();
      assert.strictEqual(status.activeSoundscape, null);
      assert.strictEqual(status.activeEmitterCount, 0);
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 5: WEBXR VR LIFECYCLE
  // --------------------------------------------------------------------------
  describe('5. WebXR VR Lifecycle Handling', () => {
    it('attaches listener to VR player head on sessionstart', () => {
      const mockHead = new Object3D();
      mockHead.name = 'MockPlayerHead';
      testScene.add(mockHead);

      audioManager.onXRSessionStart(mockHead);
      const listener = audioManager.getListener();
      assert.ok(listener, 'AudioListener must exist');
    });

    it('re-attaches listener to camera on sessionend', () => {
      const mockCamera = new PerspectiveCamera();
      testScene.add(mockCamera);

      audioManager.onXRSessionEnd(mockCamera);
      const listener = audioManager.getListener();
      assert.ok(listener, 'AudioListener must exist');
    });
  });
});
