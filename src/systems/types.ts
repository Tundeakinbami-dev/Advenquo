/**
 * Advenquo — Open-World Transformation Architecture Types.
 *
 * Defines contracts for all 16 core systems:
 * WorldManager, LocationManager, SceneStreamingManager, WorldMapManager,
 * PlayerController, NPCManager, DialogueManager, InteractionManager,
 * EnvironmentManager, WeatherSystem, TimeOfDaySystem, MissionManager,
 * DiscoveryManager, TravelSystem, PlayerProgression, SaveSystem.
 */

import type { Vector3 } from '@iwsdk/core';
import type { LocationDefinition, TravelRoute, LocationPOI, LocationNPCDef, LocationArtifactDef } from '../world/location-types.js';

export type TimeOfDayPreset = 'morning' | 'midday' | 'golden_hour' | 'coastal_sunset' | 'night';

export type WeatherPreset = 'clear_sunny' | 'tropical_breeze' | 'market_haze' | 'coastal_mist' | 'tropical_rain';

export type ExplorationMode = 'free_exploration' | 'adventure_mission';

export interface WeatherState {
  preset: WeatherPreset;
  name: string;
  description: string;
  fogDensity: number;
  lightMultiplier: number;
  windSpeed: number; // m/s
  rainIntensity: number; // 0.0 to 1.0
}

export interface DiurnalLighting {
  timeOfDay: TimeOfDayPreset;
  sunElevation: number; // Degrees
  skyColor: [number, number, number, number];
  equatorColor: [number, number, number, number];
  groundColor: [number, number, number, number];
  intensity: number;
}

export interface DoorState {
  doorId: string;
  buildingName: string;
  isOpen: boolean;
  openAngleDeg: number;
  isLocked: boolean;
  locationId: string;
}

export interface TravelTransitionInfo {
  fromLocationId: string;
  toLocationId: string;
  routeName: string;
  transitMethod: 'walk' | 'danfo_bus' | 'lagoon_ferry' | 'royal_procession';
  travelTimeDesc: string;
  scenicNote: string;
  timestamp: string;
}

export interface InteractionEvent {
  entityId: string;
  name: string;
  category: 'door' | 'building' | 'market_stall' | 'food_produce' | 'artifact' | 'signboard' | 'vehicle' | 'clue';
  title: string;
  description: string;
  culturalInsight?: string;
  actionTaken?: string;
}
