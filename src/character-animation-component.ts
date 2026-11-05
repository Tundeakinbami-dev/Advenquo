/**
 * Advenquo — Character Animation Component declaration.
 *
 * Provides authorable and runtime-evaluated animation state for characters
 * in the living world (Tobi Adeleke, market pedestrians, and interactive NPCs).
 *
 * Supports native skeletal AnimationMixer actions (Standing Jump, Pain Gesture)
 * and retargeted procedural bone hierarchies.
 *
 * System-free module — no DOM, World, or renderer imports allowed here.
 */

import { createComponent, Types } from '@iwsdk/core';

export const CharacterAnimation = createComponent('CharacterAnimation', {
  /** Stable character identifier, e.g. "npc_tobi" or "moving-pedestrian-urban" */
  characterId: { type: Types.String, default: '' },
  /** Current active animation state: 'idle' | 'walking' | 'running' | 'jumping' | 'pain' | 'talking' | 'interaction' */
  state: { type: Types.String, default: 'idle' },
  /** Previous state to smoothly recover to after a one-shot action finishes */
  previousState: { type: Types.String, default: 'idle' },
  /** Explicit one-shot animation trigger requested by gameplay: '' | 'jump' | 'pain' */
  trigger: { type: Types.String, default: '' },
  /** Playback speed multiplier (1.0 = normal 30fps) */
  speed: { type: Types.Float32, default: 1.0 },
  /** Rig type: 'auto' | 'native' | 'retargeted' */
  rigType: { type: Types.String, default: 'auto' },
  /** Whether a one-shot action is currently active */
  isOneShotPlaying: { type: Types.Boolean, default: false },
  /** Name of the last played action */
  lastAction: { type: Types.String, default: '' },
});
