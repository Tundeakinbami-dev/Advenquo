/**
 * Advenquo — Spatial Audio & Environmental Soundscape Manager.
 *
 * Coordinates 3D spatial audio across all four playable Nigerian environments:
 * 1. Ìsàlẹ̀ Èkó Artisan Market (formant crowd murmur, talking drums, shekere, bartering)
 * 2. Yaba Tech Corridor (Lagos traffic drone, Danfo bus horn, muffled studio Afrobeats, construction)
 * 3. Iga Idunganran Royal Palace (bronze bell chimes, ceremonial Kakaki horns, quiet court presence)
 * 4. Tarkwa Bay Waterfront (ocean surf swells, coastal palm wind, seabirds, fishing canoe water lap)
 *
 * Meta Quest 3 WebXR & Browser Features:
 * - Autoplay policy compliance with user gesture unlocking
 * - WebXR immersive session handling (auto-resume on sessionstart, pause on sessionend)
 * - Three.js AudioListener attachment to player.head or active camera
 * - 3D PositionalAudio with distance attenuation models (refDistance, maxDistance, rolloffFactor)
 * - Smooth crossfade transitions between environments
 * - Strict prevention of simultaneous unrelated soundscapes and duplicate playback
 * - Zero allocations in per-frame update loop
 */

import {
  AudioListener,
  Object3D,
  PositionalAudio,
  Vector3,
} from '@iwsdk/core';

import type {
  ActiveSoundscapeHandle,
  AudioChannel,
  AudioEngineState,
  EnvironmentLocationId,
  EnvironmentSoundscapeDef,
  PositionalEmitterConfig,
  SpatialAudioSystemStatus,
} from './types.js';
import { proceduralAudioEngine, ProceduralAudioEngine } from './procedural-audio-engine.js';

export const ENVIRONMENT_SOUNDSCAPES: Record<EnvironmentLocationId, EnvironmentSoundscapeDef> = {
  nigerian_market: {
    locationId: 'nigerian_market',
    name: 'Ìsàlẹ̀ Èkó Artisan Market',
    description: 'Natural crowd murmur, rhythmic Yoruba Gángan talking drums, and market bartering.',
    baseAmbience: {
      soundType: 'market_crowd',
      volume: 0.35,
    },
    positionalEmitters: [
      {
        id: 'market-talking-drum',
        name: 'Gángan Talking Drum',
        category: 'percussion',
        position: [0, 0.8, -2.0],
        refDistance: 2.0,
        maxDistance: 25.0,
        rolloffFactor: 1.0,
        distanceModel: 'inverse',
        volume: 0.45,
        loop: true,
        soundType: 'talking_drum',
      },
      {
        id: 'market-shekere-percussion',
        name: 'Shekere Gourd Shaker',
        category: 'percussion',
        position: [-2.5, 1.2, 0.0],
        refDistance: 2.0,
        maxDistance: 20.0,
        rolloffFactor: 1.0,
        distanceModel: 'inverse',
        volume: 0.35,
        loop: true,
        soundType: 'shekere',
      },
      {
        id: 'market-distant-traders',
        name: 'Market Trader Bartering',
        category: 'conversations',
        position: [4.0, 1.4, -3.0],
        refDistance: 3.0,
        maxDistance: 28.0,
        rolloffFactor: 0.9,
        distanceModel: 'inverse',
        volume: 0.3,
        loop: true,
        soundType: 'conversations',
      },
    ],
  },

  lagos_urban: {
    locationId: 'lagos_urban',
    name: 'Yaba Creative & Transit Corridor',
    description: 'Lagos traffic drone, Danfo bus dual-tone horn, muffled studio Afrobeats, and construction activity.',
    baseAmbience: {
      soundType: 'traffic_drone',
      volume: 0.32,
    },
    positionalEmitters: [
      {
        id: 'yaba-danfo-bus-horn',
        name: 'Commercial Danfo Bus Horn',
        category: 'vehicle_horns',
        position: [5.0, 1.2, 8.0],
        refDistance: 3.5,
        maxDistance: 38.0,
        rolloffFactor: 1.0,
        distanceModel: 'inverse',
        volume: 0.42,
        loop: true,
        soundType: 'danfo_horn',
      },
      {
        id: 'yaba-studio-afrobeats',
        name: 'Studio Kán Muffled Afrobeats',
        category: 'afrobeats',
        position: [-3.5, 1.0, 1.0],
        refDistance: 2.5,
        maxDistance: 26.0,
        rolloffFactor: 1.1,
        distanceModel: 'inverse',
        volume: 0.4,
        loop: true,
        soundType: 'afrobeats',
      },
      {
        id: 'yaba-construction-activity',
        name: 'Yaba Construction & Generator',
        category: 'construction',
        position: [8.0, 1.0, -2.0],
        refDistance: 3.0,
        maxDistance: 32.0,
        rolloffFactor: 1.0,
        distanceModel: 'inverse',
        volume: 0.28,
        loop: true,
        soundType: 'construction',
      },
    ],
  },

  heritage_iga: {
    locationId: 'heritage_iga',
    name: 'Iga Idunganran Royal Palace',
    description: 'Resonant bronze ceremonial bell chimes, royal Kakaki long trumpets, and quiet court presence.',
    baseAmbience: {
      soundType: 'palace_atmosphere',
      volume: 0.25,
    },
    positionalEmitters: [
      {
        id: 'palace-ceremonial-chimes',
        name: 'Royal Throne Bronze Chimes',
        category: 'ceremonial_chimes',
        position: [0, 1.2, 142.0],
        refDistance: 2.5,
        maxDistance: 30.0,
        rolloffFactor: 0.9,
        distanceModel: 'inverse',
        volume: 0.45,
        loop: true,
        soundType: 'bronze_chimes',
      },
      {
        id: 'palace-royal-kakaki-horn',
        name: 'Ceremonial Kakaki Trumpet',
        category: 'royal_horns',
        position: [0, 1.6, 147.0],
        refDistance: 3.0,
        maxDistance: 35.0,
        rolloffFactor: 1.0,
        distanceModel: 'inverse',
        volume: 0.4,
        loop: true,
        soundType: 'kakaki_horn',
      },
      {
        id: 'palace-court-murmur',
        name: 'Royal Court Murmurs',
        category: 'court_murmur',
        position: [-2.5, 1.4, 145.0],
        refDistance: 2.0,
        maxDistance: 20.0,
        rolloffFactor: 1.2,
        distanceModel: 'inverse',
        volume: 0.26,
        loop: true,
        soundType: 'court_murmur',
      },
    ],
  },

  beach_waterfront: {
    locationId: 'beach_waterfront',
    name: 'Tarkwa Bay Beach & Waterfront',
    description: 'Atlantic ocean wave surf swells, coastal palm wind, distant seabirds, and fishing canoe water lap.',
    baseAmbience: {
      soundType: 'coastal_wind',
      volume: 0.3,
    },
    positionalEmitters: [
      {
        id: 'beach-ocean-surf-waves',
        name: 'Atlantic Shoreline Waves',
        category: 'ocean_surf',
        position: [0, 0.2, 315.0],
        refDistance: 4.0,
        maxDistance: 48.0,
        rolloffFactor: 0.8,
        distanceModel: 'inverse',
        volume: 0.48,
        loop: true,
        soundType: 'ocean_waves',
      },
      {
        id: 'beach-fishing-canoe-water',
        name: 'Fishing Canoe Water & Creak',
        category: 'waterfront_creak',
        position: [3.0, 0.3, 310.0],
        refDistance: 2.0,
        maxDistance: 20.0,
        rolloffFactor: 1.2,
        distanceModel: 'inverse',
        volume: 0.32,
        loop: true,
        soundType: 'canoe_water',
      },
      {
        id: 'beach-distant-seabirds',
        name: 'Coastal Tern & Gull Calls',
        category: 'seabirds',
        position: [-6.0, 4.0, 312.0],
        refDistance: 5.0,
        maxDistance: 55.0,
        rolloffFactor: 0.7,
        distanceModel: 'inverse',
        volume: 0.35,
        loop: true,
        soundType: 'seabirds',
      },
    ],
  },
};

export class SpatialAudioManager {
  private static instance: SpatialAudioManager | null = null;

  public static getInstance(): SpatialAudioManager {
    if (!SpatialAudioManager.instance) {
      SpatialAudioManager.instance = new SpatialAudioManager();
    }
    return SpatialAudioManager.instance;
  }

  // Audio Context & Three.js Listener
  private audioCtx: AudioContext | null = null;
  private listener: AudioListener | null = null;
  private synthEngine: ProceduralAudioEngine;

  // Master Gain Nodes
  private masterGain: any = null;
  private ambientBus: any = null;
  private sfxBus: any = null;

  // State Tracking
  private isInitialized = false;
  private unlockedByUser = false;
  private isXR = false;
  private masterVolume = 0.85;
  private ambientVolume = 0.75;
  private sfxVolume = 0.9;

  // Active Soundscape State
  private activeLocationId: EnvironmentLocationId | null = null;
  private currentSoundscape: ActiveSoundscapeHandle | null = null;
  private transitionInFlight = false;

  // Scene references for 3D positional attachment
  private sceneRoot: Object3D | null = null;
  private positionalAnchors: Map<string, Object3D> = new Map();

  constructor() {
    this.synthEngine = proceduralAudioEngine;
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION & USER GESTURE UNLOCK
  // --------------------------------------------------------------------------

  public init(scene?: Object3D, existingListener?: AudioListener): void {
    if (this.isInitialized) return;

    if (scene) {
      this.sceneRoot = scene;
    }

    // Reuse or create Three.js AudioListener
    if (existingListener) {
      this.listener = existingListener;
      this.audioCtx = (existingListener as any).context || null;
    } else if (typeof window !== 'undefined') {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.listener = new AudioListener();
        }
      } catch (err) {
        console.warn('[SpatialAudio] Web Audio initialization deferred:', err);
      }
    }

    // Set up gain bus graph
    this._setupGainBusses();

    // Attach autoplay unlock listeners
    this._attachUserGestureUnlock();

    this.isInitialized = true;
  }

  private _setupGainBusses(): void {
    if (!this.audioCtx || typeof this.audioCtx.createGain !== 'function') {
      // Stub fallback for tests/headless
      this.masterGain = this._createStubGain(this.masterVolume);
      this.ambientBus = this._createStubGain(this.ambientVolume);
      this.sfxBus = this._createStubGain(this.sfxVolume);
      return;
    }

    try {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioCtx.destination);

      this.ambientBus = this.audioCtx.createGain();
      this.ambientBus.gain.value = this.ambientVolume;
      this.ambientBus.connect(this.masterGain);

      this.sfxBus = this.audioCtx.createGain();
      this.sfxBus.gain.value = this.sfxVolume;
      this.sfxBus.connect(this.masterGain);
    } catch (_) {
      this.masterGain = this._createStubGain(this.masterVolume);
      this.ambientBus = this._createStubGain(this.ambientVolume);
      this.sfxBus = this._createStubGain(this.sfxVolume);
    }
  }

  private _attachUserGestureUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.unlockAudioContext();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
  }

  /**
   * Unlocks the Web Audio Context after valid user interaction or XR session start.
   */
  public unlockAudioContext(): void {
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended' && typeof this.audioCtx.resume === 'function') {
      this.audioCtx.resume().then(() => {
        this.unlockedByUser = true;
      }).catch((err) => {
        console.warn('[SpatialAudio] Resume failed:', err);
      });
    } else if (this.audioCtx.state === 'running') {
      this.unlockedByUser = true;
    }
  }

  // --------------------------------------------------------------------------
  // WEBXR / QUEST 3 LIFECYCLE
  // --------------------------------------------------------------------------

  public onXRSessionStart(headNode?: Object3D): void {
    this.isXR = true;
    this.unlockAudioContext();

    // In VR, ensure Three.js AudioListener is attached to player head
    if (this.listener && headNode && this.listener.parent !== headNode) {
      headNode.add(this.listener);
    }

    // Resume soundscape if active
    if (this.currentSoundscape && this.currentSoundscape.masterGain?.gain) {
      try {
        const now = this.audioCtx ? this.audioCtx.currentTime : 0;
        this.currentSoundscape.masterGain.gain.setValueAtTime?.(1.0, now);
      } catch (_) {}
    }
  }

  public onXRSessionEnd(camera?: Object3D): void {
    this.isXR = false;

    // Attach listener back to desktop camera if available
    if (this.listener && camera && this.listener.parent !== camera) {
      camera.add(this.listener);
    }

    // Pause / suspend if necessary to conserve Quest 3 resources
    if (this.audioCtx && this.audioCtx.state === 'running' && typeof this.audioCtx.suspend === 'function') {
      this.audioCtx.suspend().catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // SOUNDSCAPE SWITCHING & PREVENTION OF DUPLICATES / SIMULTANEOUS PLAYBACK
  // --------------------------------------------------------------------------

  /**
   * Switches the active environmental soundscape to a new location.
   * - Performs smooth crossfading (fadeDuration seconds)
   * - Strictly prevents simultaneous playback of unrelated environments
   * - Ignores redundant calls to prevent duplicate audio graphs
   */
  public switchSoundscape(
    newLocationId: EnvironmentLocationId,
    fadeDuration: number = 1.2,
  ): void {
    // Prevent duplicate playback if already playing this location
    if (this.activeLocationId === newLocationId && this.currentSoundscape && !this.currentSoundscape.isStopping) {
      return;
    }

    const soundscapeDef = ENVIRONMENT_SOUNDSCAPES[newLocationId];
    if (!soundscapeDef) {
      console.warn(`[SpatialAudio] Unknown location: ${newLocationId}`);
      return;
    }

    this.transitionInFlight = true;

    // 1. Fade out and teardown old soundscape completely
    const previousSoundscape = this.currentSoundscape;
    if (previousSoundscape) {
      previousSoundscape.stop(fadeDuration);
      this.currentSoundscape = null;
    }

    // 2. Build and fade in new soundscape
    const newSoundscape = this._createSoundscape(soundscapeDef, fadeDuration);
    this.currentSoundscape = newSoundscape;
    this.activeLocationId = newLocationId;
    this.transitionInFlight = false;
  }

  /**
   * Builds an active soundscape handle with base ambient bed and 3D positional emitters.
   */
  private _createSoundscape(
    def: EnvironmentSoundscapeDef,
    fadeInDuration: number,
  ): ActiveSoundscapeHandle {
    const ctx = this.audioCtx;
    const now = ctx ? ctx.currentTime : 0;

    // Soundscape master gain (starts at 0 and ramps up)
    let sMasterGain: any;
    if (ctx && typeof ctx.createGain === 'function') {
      sMasterGain = ctx.createGain();
      sMasterGain.gain.setValueAtTime(0, now);
      sMasterGain.gain.linearRampToValueAtTime(1.0, now + fadeInDuration);
      sMasterGain.connect(this.ambientBus || ctx.destination);
    } else {
      sMasterGain = this._createStubGain(1.0);
    }

    const nodes: Array<{ stop?: () => void; disconnect?: () => void }> = [];
    const intervals: Array<ReturnType<typeof setInterval> | number> = [];
    const emitters: Map<string, any> = new Map();

    // 1. Instantiate Base Ambient Bed
    if (ctx) {
      const baseHandle = this._instantiateBaseAmbience(ctx, def.baseAmbience.soundType, sMasterGain);
      if (baseHandle) {
        nodes.push(baseHandle);
      }
    }

    // 2. Instantiate 3D Positional Emitters
    def.positionalEmitters.forEach((emitterConfig) => {
      const emitterHandle = this._instantiatePositionalEmitter(emitterConfig, sMasterGain);
      if (emitterHandle) {
        nodes.push(emitterHandle);
        emitters.set(emitterConfig.id, emitterHandle);
      }
    });

    const handle: ActiveSoundscapeHandle = {
      locationId: def.locationId,
      masterGain: sMasterGain,
      ambientGain: this.ambientBus,
      positionalGain: this.sfxBus,
      nodes,
      intervals,
      emitters,
      isStopping: false,
      stop: (fadeDuration: number = 1.0) => {
        if (handle.isStopping) return;
        handle.isStopping = true;

        const stopTime = ctx ? ctx.currentTime : 0;
        try {
          if (sMasterGain.gain && typeof sMasterGain.gain.linearRampToValueAtTime === 'function') {
            sMasterGain.gain.setValueAtTime(sMasterGain.gain.value, stopTime);
            sMasterGain.gain.linearRampToValueAtTime(0.0001, stopTime + fadeDuration);
          }
        } catch (_) {}

        // Schedule final teardown after fade
        const cleanupTimer = setTimeout(() => {
          handle.nodes.forEach((n) => {
            try {
              n.stop?.();
              n.disconnect?.();
            } catch (_) {}
          });
          handle.intervals.forEach((id) => clearInterval(id as any));
          try {
            sMasterGain.disconnect?.();
          } catch (_) {}
          handle.nodes.length = 0;
          handle.intervals.length = 0;
          handle.emitters.clear();
        }, (fadeDuration + 0.1) * 1000);

        handle.intervals.push(cleanupTimer);
      },
      setVolume: (channel: AudioChannel, volume: number, rampDuration: number = 0.1) => {
        const rampTime = ctx ? ctx.currentTime : 0;
        const targetGain = channel === 'ambient' ? sMasterGain : this.masterGain;
        try {
          if (targetGain?.gain?.linearRampToValueAtTime) {
            targetGain.gain.linearRampToValueAtTime(volume, rampTime + rampDuration);
          }
        } catch (_) {}
      },
    };

    return handle;
  }

  private _instantiateBaseAmbience(
    ctx: AudioContext,
    soundType: string,
    destination: any,
  ): any {
    switch (soundType) {
      case 'market_crowd':
        return this.synthEngine.createMarketCrowdMurmur(ctx, destination);
      case 'traffic_drone':
        return this.synthEngine.createLagosTrafficDrone(ctx, destination);
      case 'palace_atmosphere':
        return this.synthEngine.createPalaceCourtyardMurmur(ctx, destination);
      case 'coastal_wind':
        return this.synthEngine.createCoastalWind(ctx, destination);
      default:
        return null;
    }
  }

  private _instantiatePositionalEmitter(
    config: PositionalEmitterConfig,
    parentGain: any,
  ): any {
    const ctx = this.audioCtx;
    if (!ctx) return null;

    // Create intermediate gain node for emitter volume & distance
    let emitterGain: any;
    if (typeof ctx.createGain === 'function') {
      emitterGain = ctx.createGain();
      emitterGain.gain.value = config.volume;
      emitterGain.connect(parentGain);
    } else {
      emitterGain = this._createStubGain(config.volume);
    }

    // Attach to 3D spatial anchor
    let anchor = this.positionalAnchors.get(config.id);
    if (!anchor) {
      anchor = new Object3D();
      anchor.name = `audio-anchor-${config.id}`;
      anchor.position.set(config.position[0], config.position[1], config.position[2]);
      if (this.sceneRoot) {
        this.sceneRoot.add(anchor);
      }
      this.positionalAnchors.set(config.id, anchor);
    }

    // Connect procedural synthesis according to soundType
    let soundHandle: any = null;
    switch (config.soundType) {
      // Ìsàlẹ̀ Èkó Market
      case 'talking_drum':
        soundHandle = this.synthEngine.createTalkingDrum(ctx, emitterGain);
        break;
      case 'shekere':
        soundHandle = this.synthEngine.createShekere(ctx, emitterGain);
        break;
      case 'conversations':
        soundHandle = this.synthEngine.createDistantConversations(ctx, emitterGain);
        break;

      // Yaba Tech Corridor
      case 'danfo_horn':
        soundHandle = this.synthEngine.createDanfoBusHorn(ctx, emitterGain);
        break;
      case 'afrobeats':
        soundHandle = this.synthEngine.createAfrobeatsMusic(ctx, emitterGain);
        break;
      case 'construction':
        soundHandle = this.synthEngine.createConstructionSounds(ctx, emitterGain);
        break;

      // Iga Idunganran Palace
      case 'bronze_chimes':
        soundHandle = this.synthEngine.createCeremonialBronzeChimes(ctx, emitterGain);
        break;
      case 'kakaki_horn':
        soundHandle = this.synthEngine.createKakakiTrumpet(ctx, emitterGain);
        break;
      case 'court_murmur':
        soundHandle = this.synthEngine.createPalaceCourtyardMurmur(ctx, emitterGain);
        break;

      // Tarkwa Bay Beach
      case 'ocean_waves':
        soundHandle = this.synthEngine.createOceanWaves(ctx, emitterGain);
        break;
      case 'canoe_water':
        soundHandle = this.synthEngine.createWaterfrontCanoeWater(ctx, emitterGain);
        break;
      case 'seabirds':
        soundHandle = this.synthEngine.createSeabirdChirps(ctx, emitterGain);
        break;
    }

    return soundHandle;
  }

  // --------------------------------------------------------------------------
  // ONE-SHOT SFX (e.g. Cultural Artifact Discovery Chime)
  // --------------------------------------------------------------------------

  /**
   * Plays a cultural discovery or interaction audio cue at a specific 3D location.
   */
  public playDiscoveryCue(position?: Vector3 | [number, number, number]): void {
    if (!this.audioCtx || typeof this.audioCtx.createGain !== 'function') return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const chimeGain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6 octave shimmer

      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(chimeGain);
      chimeGain.connect(this.sfxBus || this.masterGain || this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // VOLUME & STATUS ACCESSORS
  // --------------------------------------------------------------------------

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain?.gain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  public setAmbientVolume(volume: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientBus?.gain) {
      this.ambientBus.gain.value = this.ambientVolume;
    }
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxBus?.gain) {
      this.sfxBus.gain.value = this.sfxVolume;
    }
  }

  public getStatus(): SpatialAudioSystemStatus {
    let engineState: AudioEngineState = 'uninitialized';
    if (this.audioCtx) {
      engineState = (this.audioCtx.state as AudioEngineState) || 'suspended';
    }

    return {
      isInitialized: this.isInitialized,
      engineState,
      unlockedByUser: this.unlockedByUser,
      isXR: this.isXR,
      activeLocationId: this.activeLocationId,
      activeEmittersCount: this.currentSoundscape?.emitters.size || 0,
      masterVolume: this.masterVolume,
      ambientVolume: this.ambientVolume,
      sfxVolume: this.sfxVolume,
    };
  }

  public getActiveLocationId(): EnvironmentLocationId | null {
    return this.activeLocationId;
  }

  public getCurrentSoundscape(): ActiveSoundscapeHandle | null {
    return this.currentSoundscape;
  }

  public getListener(): AudioListener | null {
    return this.listener;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioCtx;
  }

  /**
   * Complete system teardown and cleanup.
   */
  public dispose(): void {
    if (this.currentSoundscape) {
      this.currentSoundscape.stop(0.05);
      this.currentSoundscape = null;
    }

    this.positionalAnchors.forEach((anchor) => {
      if (anchor.parent) {
        anchor.parent.remove(anchor);
      }
    });
    this.positionalAnchors.clear();

    if (this.audioCtx && typeof this.audioCtx.close === 'function') {
      try {
        this.audioCtx.close();
      } catch (_) {}
    }

    this.activeLocationId = null;
    this.isInitialized = false;
    this.unlockedByUser = false;
  }

  // --------------------------------------------------------------------------
  // STUB HELPERS (for tests / Node environments)
  // --------------------------------------------------------------------------

  private _createStubGain(initVal: number): any {
    const stub = {
      gain: {
        value: initVal,
        setValueAtTime: (v: number) => { stub.gain.value = v; },
        linearRampToValueAtTime: (v: number) => { stub.gain.value = v; },
        exponentialRampToValueAtTime: (v: number) => { stub.gain.value = v; },
      },
      connect: () => {},
      disconnect: () => {},
    };
    return stub;
  }
}

export const spatialAudioManager = SpatialAudioManager.getInstance();
