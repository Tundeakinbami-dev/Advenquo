/**
 * Authorable state for deterministic, waypoint-driven world actors.
 * Kept separate from NPCCharacter so non-dialogue pedestrians can move without
 * entering the mission/dialogue pipeline.
 */
import { createComponent, Types } from '@iwsdk/core';

export const NPCMovement = createComponent('NPCMovement', {
  actorId: { type: Types.String, default: '' },
  role: { type: Types.String, default: 'pedestrian' },
  state: { type: Types.String, default: 'walking' },
  activity: { type: Types.String, default: 'travelling' },
  enabled: { type: Types.Boolean, default: true },
  speed: { type: Types.Float32, default: 0.8 },
  startX: { type: Types.Float32, default: 0 },
  startZ: { type: Types.Float32, default: 0 },
  endX: { type: Types.Float32, default: 0 },
  endZ: { type: Types.Float32, default: 0 },
  progress: { type: Types.Float32, default: 0 },
  movingForward: { type: Types.Boolean, default: true },
  destinationX: { type: Types.Float32, default: 0 },
  destinationZ: { type: Types.Float32, default: 0 },
});
