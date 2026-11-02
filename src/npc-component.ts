/**
 * Advenquo — NPC Character Component declaration.
 *
 * Marks an entity as an interactive Non-Player Character in the 3D scene.
 * Used by NpcDialogueSystem to coordinate spatial dialogue, proximity triggers,
 * and mission evaluation.
 *
 * System-free module — no DOM, World, or renderer imports allowed here.
 */

import { createComponent, Types } from '@iwsdk/core';

export const NPCCharacter = createComponent('NPCCharacter', {
  /** Stable identifier matching mission character requirements, e.g. "baba-adewale" */
  characterId: { type: Types.String, default: '' },
  /** Display name shown on spatial dialogue panel */
  name: { type: Types.String, default: '' },
  /** Role description, e.g. "Elder of the Courtyard" */
  role: { type: Types.String, default: '' },
  /** Proximity distance in meters within which dialogue prompt becomes active */
  interactionRadius: { type: Types.Float32, default: 3.5 },
  /** True when player is actively conversing with this NPC */
  inDialogue: { type: Types.Boolean, default: false },
});
