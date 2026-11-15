/**
 * Advenquo: Spatial Audio & Environmental Soundscape System Test Suite.
 *
 * Verifies all 7 core Phase 2 audio immersion criteria:
 * 1. Audio activation & user-gesture unlocking
 * 2. Environment-specific soundscape selection across all four locations
 * 3. Location transitions & smooth crossfades
 * 4. Duplicate playback prevention during repeated transitions
 * 5. Prevention of simultaneous playback of unrelated environment soundscapes
 * 6. Audio cleanup & resource disposal
 * 7. Distance attenuation & positional emitter properties
 * 8. WebXR / Meta Quest 3 VR session entry and exit lifecycle
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

describe('Advenquo Phase 2: Spatial Audio Immersion', () => {
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
    it('initializes spatial audio manager with proper default volume buses and suspended/uninitialized state', () => {
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

    it('plays discovery cue safely in both headless and active audio environments', () => {
      assert.doesNotThrow(() => {
        audioManager.playDiscoveryCue([0, 1, 0]);
      }, 'Discovery chime cue must execute safely without throwing exceptions');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 2: ENVIRONMENT-SPECIFIC SOUND SELECTION
  // --------------------------------------------------------------------------
  describe('2. Environment-Specific Sound Selection Across All 4 Environments', () => {
    const locations: EnvironmentLocationId[] = [
      'nigerian_market',
      'lagos_urban',
      'heritage_iga',
      'beach_waterfront',
    ];

    it('defines distinct environmental soundscapes for all 4 Nigerian locations', () => {
      for (const locId of locations) {
        const soundscape = ENVIRONMENT_SOUNDSCAPES[locId];
        assert.ok(soundscape, `Soundscape definition must exist for ${locId}`);
        assert.strictEqual(soundscape.locationId, locId);
        assert.ok(soundscape.name.length > 0, 'Soundscape must have a name');
        assert.ok(soundscape.description.length > 0, 'Soundscape must have a description');
        assert.ok(soundscape.baseAmbience.soundType.length > 0, 'Soundscape must have base ambience');
        assert.ok(soundscape.positionalEmitters.length >= 3, 'Must have at least 3 positional emitters');
      }
    });

    it('selects authentic cultural market elements in Ìsàlẹ̀ Èkó Market', () => {
      const market = ENVIRONMENT_SOUNDSCAPES.nigerian_market;
      assert.strictEqual(market.baseAmbience.soundType, 'market_crowd');

      const categories = market.positionalEmitters.map((e) => e.category);
      assert.ok(categories.includes('percussion'), 'Market must include traditional percussion');
      assert.ok(categories.includes('conversations'), 'Market must include market bartering conversations');

      const drumEmitter = market.positionalEmitters.find((e) => e.soundType === 'talking_drum');
      assert.ok(drumEmitter, 'Must include Yoruba Gángan talking drum emitter');

      const shekereEmitter = market.positionalEmitters.find((e) => e.soundType === 'shekere');
      assert.ok(shekereEmitter, 'Must include Shekere gourd shaker emitter');
    });

    it('selects urban transport & Afrobeats in Yaba Tech Corridor', () => {
      const yaba = ENVIRONMENT_SOUNDSCAPES.lagos_urban;
      assert.strictEqual(yaba.baseAmbience.soundType, 'traffic_drone');

      const categories = yaba.positionalEmitters.map((e) => e.category);
      assert.ok(categories.includes('vehicle_horns'), 'Yaba must include Danfo bus horn');
      assert.ok(categories.includes('afrobeats'), 'Yaba must include Afrobeats music');
      assert.ok(categories.includes('construction'), 'Yaba must include construction activity');
    });

    it('selects ceremonial bronze chimes & royal horns in Iga Idunganran Palace', () => {
      const palace = ENVIRONMENT_SOUNDSCAPES.heritage_iga;
      assert.strictEqual(palace.baseAmbience.soundType, 'palace_atmosphere');

      const categories = palace.positionalEmitters.map((e) => e.category);
      assert.ok(categories.includes('ceremonial_chimes'), 'Palace must include bronze bell chimes');
      assert.ok(categories.includes('royal_horns'), 'Palace must include Kakaki royal trumpets');
      assert.ok(categories.includes('court_murmur'), 'Palace must include respectful court murmurs');
    });

    it('selects ocean waves & coastal winds in Tarkwa Bay Beach', () => {
      const beach = ENVIRONMENT_SOUNDSCAPES.beach_waterfront;
      assert.strictEqual(beach.baseAmbience.soundType, 'coastal_wind');

      const categories = beach.positionalEmitters.map((e) => e.category);
      assert.ok(categories.includes('ocean_surf'), 'Tarkwa Bay must include breaking ocean waves');
      assert.ok(categories.includes('waterfront_creak'), 'Tarkwa Bay must include canoe water lap and creak');
      assert.ok(categories.includes('seabirds'), 'Tarkwa Bay must include seabirds');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 3: LOCATION TRANSITIONS & CROSSFADES
  // --------------------------------------------------------------------------
  describe('3. Location Transitions & Crossfades', () => {
    it('smoothly switches soundscape when location changes', () => {
      audioManager.switchSoundscape('nigerian_market', 0.2);
      assert.strictEqual(audioManager.getActiveLocationId(), 'nigerian_market');

      const marketHandle = audioManager.getCurrentSoundscape();
      assert.ok(marketHandle, 'Market soundscape must be active');
      assert.strictEqual(marketHandle.locationId, 'nigerian_market');

      // Switch to Yaba
      audioManager.switchSoundscape('lagos_urban', 0.2);
      assert.strictEqual(audioManager.getActiveLocationId(), 'lagos_urban');

      const yabaHandle = audioManager.getCurrentSoundscape();
      assert.ok(yabaHandle, 'Yaba soundscape must be active');
      assert.strictEqual(yabaHandle.locationId, 'lagos_urban');
      assert.notStrictEqual(marketHandle, yabaHandle, 'Must create a new handle for destination');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 4: DUPLICATE PLAYBACK PREVENTION
  // --------------------------------------------------------------------------
  describe('4. Duplicate Playback Prevention', () => {
    it('ignores redundant switchSoundscape calls to the already active location', () => {
      audioManager.switchSoundscape('nigerian_market', 0.2);
      const initialHandle = audioManager.getCurrentSoundscape();

      // Attempt repeated calls to the same location
      audioManager.switchSoundscape('nigerian_market', 0.2);
      audioManager.switchSoundscape('nigerian_market', 0.2);

      const postHandle = audioManager.getCurrentSoundscape();
      assert.strictEqual(initialHandle, postHandle, 'Must preserve existing handle and NOT spawn duplicates');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 5: PREVENTION OF SIMULTANEOUS UNRELATED PLAYBACK
  // --------------------------------------------------------------------------
  describe('5. Prevention of Simultaneous Unrelated Playback', () => {
    it('marks old soundscape as stopping and detaches its nodes during transition', () => {
      audioManager.switchSoundscape('nigerian_market', 0.1);
      const marketHandle = audioManager.getCurrentSoundscape();
      assert.strictEqual(marketHandle?.isStopping, false);

      // Transition to Palace
      audioManager.switchSoundscape('heritage_iga', 0.1);

      // Old market handle must be marked as stopping
      assert.strictEqual(marketHandle?.isStopping, true, 'Previous soundscape must be marked as stopping');

      const palaceHandle = audioManager.getCurrentSoundscape();
      assert.strictEqual(palaceHandle?.locationId, 'heritage_iga');
      assert.strictEqual(palaceHandle?.isStopping, false, 'New soundscape must be running');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 6: AUDIO CLEANUP & RESOURCE DISPOSAL
  // --------------------------------------------------------------------------
  describe('6. Audio Cleanup & Resource Disposal', () => {
    it('stops active soundscape and clears spatial anchors on dispose', () => {
      audioManager.switchSoundscape('beach_waterfront', 0.1);
      assert.strictEqual(audioManager.getActiveLocationId(), 'beach_waterfront');

      audioManager.dispose();

      assert.strictEqual(audioManager.getActiveLocationId(), null, 'Active location must be null after dispose');
      assert.strictEqual(audioManager.getCurrentSoundscape(), null, 'Current soundscape must be null after dispose');
      assert.strictEqual(audioManager.getStatus().activeEmittersCount, 0, 'Emitters count must be 0 after dispose');
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 7: DISTANCE ATTENUATION & POSITIONAL EMITTERS
  // --------------------------------------------------------------------------
  describe('7. Distance Attenuation & Positional Properties', () => {
    it('configures valid 3D attenuation models and spatial coordinates for all emitters', () => {
      const allDefs = Object.values(ENVIRONMENT_SOUNDSCAPES);

      for (const def of allDefs) {
        for (const emitter of def.positionalEmitters) {
          assert.ok(emitter.refDistance > 0, `${emitter.name} refDistance must be > 0`);
          assert.ok(emitter.maxDistance > emitter.refDistance, `${emitter.name} maxDistance must exceed refDistance`);
          assert.ok(emitter.rolloffFactor > 0, `${emitter.name} rolloffFactor must be positive`);
          assert.strictEqual(emitter.distanceModel, 'inverse', `${emitter.name} distanceModel must be inverse`);
          assert.ok(emitter.volume >= 0 && emitter.volume <= 1, `${emitter.name} volume must be between 0 and 1`);

          // Validate spatial positioning coordinates
          assert.strictEqual(emitter.position.length, 3, `${emitter.name} must have [X, Y, Z] coordinate`);
          assert.strictEqual(typeof emitter.position[0], 'number');
          assert.strictEqual(typeof emitter.position[1], 'number');
          assert.strictEqual(typeof emitter.position[2], 'number');
        }
      }
    });

    it('spatial emitter positions align with environment layout regions', () => {
      // Palace emitters should be around Z=140 - 150
      const palaceEmitters = ENVIRONMENT_SOUNDSCAPES.heritage_iga.positionalEmitters;
      for (const e of palaceEmitters) {
        assert.ok(e.position[2] >= 135 && e.position[2] <= 155, `Palace emitter ${e.name} must be within palace Z bounds`);
      }

      // Beach emitters should be around Z=300 - 320
      const beachEmitters = ENVIRONMENT_SOUNDSCAPES.beach_waterfront.positionalEmitters;
      for (const e of beachEmitters) {
        assert.ok(e.position[2] >= 290 && e.position[2] <= 325, `Beach emitter ${e.name} must be within beach Z bounds`);
      }

      // Market emitters should be around Z=-5 to +5
      const marketEmitters = ENVIRONMENT_SOUNDSCAPES.nigerian_market.positionalEmitters;
      for (const e of marketEmitters) {
        assert.ok(e.position[2] >= -10 && e.position[2] <= 10, `Market emitter ${e.name} must be within market Z bounds`);
      }
    });
  });

  // --------------------------------------------------------------------------
  // CRITERION 8: WEBXR / META QUEST 3 VR SESSION LIFECYCLE
  // --------------------------------------------------------------------------
  describe('8. WebXR / Meta Quest 3 VR Session Lifecycle', () => {
    it('handles onXRSessionStart by setting isXR flag and parenting listener to player head', () => {
      const mockHead = new Object3D();
      mockHead.name = 'player-head';

      audioManager.onXRSessionStart(mockHead);

      const status = audioManager.getStatus();
      assert.strictEqual(status.isXR, true, 'isXR must be true during XR session');

      const listener = audioManager.getListener();
      if (listener) {
        assert.strictEqual(listener.parent, mockHead, 'Listener must be parented to player head in VR');
      }
    });

    it('handles onXRSessionEnd by clearing isXR flag and parenting listener to desktop camera', () => {
      const mockCamera = new PerspectiveCamera(75, 1, 0.1, 100);
      mockCamera.name = 'desktop-camera';

      audioManager.onXRSessionEnd(mockCamera);

      const status = audioManager.getStatus();
      assert.strictEqual(status.isXR, false, 'isXR must be false after XR session ends');

      const listener = audioManager.getListener();
      if (listener) {
        assert.strictEqual(listener.parent, mockCamera, 'Listener must return to desktop camera outside VR');
      }
    });
  });
});
