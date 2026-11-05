/**
 * Advenquo — Location & Environment Component declarations.
 *
 * Defines ECS components for tracking multi-location world streaming,
 * location anchors, environmental atmospheres, accessible doors/buildings,
 * and connected transitions.
 *
 * System-free module — no DOM, World, or renderer imports allowed here.
 */

import { createComponent, Types } from '@iwsdk/core';

export const LocationAnchor = createComponent('LocationAnchor', {
  /** Unique location identifier e.g. "lagos_urban", "nigerian_market", "heritage_iga", "beach_waterfront" */
  locationId: { type: Types.String, default: '' },
  /** Human-readable location title */
  name: { type: Types.String, default: '' },
  /** Category of environment: urban | market | heritage | natural */
  environmentCategory: { type: Types.String, default: 'market' },
  /** Whether the location is currently active and rendered in the 3D world */
  isActive: { type: Types.Boolean, default: false },
  /** Whether the player has discovered this location in open-world exploration */
  isDiscovered: { type: Types.Boolean, default: false },
});

export const EnvironmentAtmosphere = createComponent('EnvironmentAtmosphere', {
  /** Time of day preset: morning | midday | golden_hour | coastal_sunset | night */
  timeOfDay: { type: Types.String, default: 'morning' },
  /** Weather preset: clear_sunny | tropical_breeze | market_haze | coastal_mist | tropical_rain */
  weather: { type: Types.String, default: 'clear_sunny' },
  /** Ambient soundscape asset ID */
  soundscapeId: { type: Types.String, default: '' },
  /** Ambient light intensity multiplier */
  ambientIntensity: { type: Types.Float32, default: 1.0 },
});

export const WorldTravelState = createComponent('WorldTravelState', {
  /** Source location ID */
  fromLocationId: { type: Types.String, default: '' },
  /** Target location ID */
  toLocationId: { type: Types.String, default: '' },
  /** Whether travel animation / transition is currently in progress */
  isTraveling: { type: Types.Boolean, default: false },
  /** Normalized transition progress 0.0 to 1.0 */
  progress: { type: Types.Float32, default: 0.0 },
});

export const InteractiveDoor = createComponent('InteractiveDoor', {
  /** Unique door identifier e.g. "door_tech_hub", "door_palace_chamber", "door_dye_shed" */
  doorId: { type: Types.String, default: '' },
  /** Target accessible building or room title */
  buildingName: { type: Types.String, default: '' },
  /** Whether the door is currently open */
  isOpen: { type: Types.Boolean, default: false },
  /** Open angle in degrees */
  openAngleDeg: { type: Types.Float32, default: 95.0 },
  /** Whether interaction requires unlocking */
  isLocked: { type: Types.Boolean, default: false },
});
