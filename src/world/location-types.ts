/**
 * Advenquo — Open-World Location & Travel Domain Types.
 *
 * Defines strict data contracts for multi-location world streaming,
 * connected destinations, travel transitions, environmental atmospheres,
 * and location-specific exploration activities.
 */

import type { Vector3 } from '@iwsdk/core';

export type EnvironmentCategory = 'market' | 'urban' | 'heritage' | 'natural';

export type TimeOfDayPreset = 'morning' | 'midday' | 'golden_hour' | 'coastal_sunset';

export interface LocationPOI {
  id: string;
  name: string;
  localName?: string;
  category: 'landmark' | 'artisan' | 'transit' | 'ecology' | 'civic';
  position: [number, number, number];
  description: string;
  culturalInsight: string;
  interactPrompt?: string;
}

export interface LocationNPCDef {
  characterId: string;
  name: string;
  role: string;
  position: [number, number, number];
  rotationY: number; // Degrees
  greetingYoruba: string;
  greetingEnglish: string;
  dialogueTopics: Array<{
    id: string;
    topicLabel: string;
    speech: string;
    culturalNote?: string;
    vocabularyReward?: {
      term: string;
      phonetic: string;
      englishGloss: string;
    };
  }>;
}

export interface LocationArtifactDef {
  id: string;
  name: string;
  localName?: string;
  position: [number, number, number];
  rotationY: number;
  description: string;
  culturalFact: string;
  icon: string;
}

export interface AtmosphereConfig {
  timeOfDay: TimeOfDayPreset;
  skyColor: [number, number, number, number];
  equatorColor: [number, number, number, number];
  groundColor: [number, number, number, number];
  lightIntensity: number;
  soundscapeDescription: string;
  weatherDescription: string;
}

export interface TravelRoute {
  targetLocationId: string;
  routeName: string;
  transitMethod: 'walk' | 'danfo_bus' | 'lagoon_ferry' | 'royal_procession';
  travelTimeDesc: string;
  scenicNote: string;
}

export interface LocationDefinition {
  id: string;
  name: string;
  indigenousName: string;
  city: string;
  country: string;
  category: EnvironmentCategory;
  tagline: string;
  overview: string;
  historicalContext: string;
  spawnPosition: [number, number, number];
  spawnYaw: number; // Degrees
  boundaryLimits: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  atmosphere: AtmosphereConfig;
  connectedRoutes: TravelRoute[];
  pointsOfInterest: LocationPOI[];
  npcs: LocationNPCDef[];
  artifacts: LocationArtifactDef[];
  ambientPropsCount: number;
}
