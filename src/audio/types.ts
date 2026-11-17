/**
 * Advenquo — Spatial Audio & Environmental Soundscape Architecture Types.
 *
 * Defines contracts for:
 * - Four-environment ambient soundscapes (Market, Yaba, Palace, Tarkwa Bay)
 * - Positional 3D spatial emitters with distance attenuation
 * - Web Audio procedural synthesis and asset loading bridge
 * - WebXR / Meta Quest 3 audio lifecycle management
 */

export type EnvironmentLocationId =
  | 'construction_workshop'
  | 'nigerian_market'
  | 'lagos_urban'
  | 'heritage_iga'
  | 'beach_waterfront';

export type AudioChannel = 'master' | 'ambient' | 'sfx' | 'music';

export type AudioEngineState = 'uninitialized' | 'suspended' | 'running' | 'interrupted';

export type PositionalSoundCategory =
  | 'percussion'
  | 'conversations'
  | 'afrobeats'
  | 'vehicle_horns'
  | 'construction'
  | 'ceremonial_chimes'
  | 'royal_horns'
  | 'court_murmur'
  | 'ocean_surf'
  | 'coastal_wind'
  | 'seabirds'
  | 'waterfront_creak'
  | 'discovery_chime';

export interface PositionalEmitterConfig {
  id: string;
  name: string;
  category: PositionalSoundCategory;
  position: [number, number, number];
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  distanceModel: 'inverse' | 'linear' | 'exponential';
  volume: number;
  loop: boolean;
  soundType: string;
}

export interface EnvironmentSoundscapeDef {
  locationId: EnvironmentLocationId;
  name: string;
  description: string;
  baseAmbience: {
    soundType: string;
    volume: number;
  };
  positionalEmitters: PositionalEmitterConfig[];
}

export interface ActiveSoundscapeHandle {
  locationId: EnvironmentLocationId;
  masterGain: any; // GainNode or mock
  ambientGain: any; // GainNode or mock
  positionalGain: any; // GainNode or mock
  nodes: Array<{ stop?: () => void; disconnect?: () => void }>;
  intervals: Array<ReturnType<typeof setInterval> | number>;
  emitters: Map<string, any>;
  isStopping: boolean;
  stop: (fadeDuration?: number) => void;
  setVolume: (channel: AudioChannel, volume: number, rampDuration?: number) => void;
}

export interface SpatialAudioSystemStatus {
  isInitialized: boolean;
  engineState: AudioEngineState;
  unlockedByUser: boolean;
  isXR: boolean;
  activeLocationId: EnvironmentLocationId | null;
  activeSoundscape?: EnvironmentLocationId | null;
  activeEmittersCount: number;
  activeEmitterCount?: number;
  masterVolume: number;
  ambientVolume: number;
  sfxVolume: number;
}
