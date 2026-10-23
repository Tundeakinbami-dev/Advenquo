/**
 * Advenquo — Cultural Object component declaration.
 *
 * Marks an entity as an interactive cultural artefact in the scene.
 * - factId: string key that maps to the fact panel to reveal (matches scene node id prefix)
 * - discovered: tracks whether this object has already been activated
 *
 * System-free module — no DOM, World, or renderer imports allowed here.
 */

import { createComponent, Types } from '@iwsdk/core';

export const CulturalObject = createComponent('CulturalObject', {
  /** Stable ID that identifies which fact panel to reveal, e.g. "adire-cloth" */
  factId: { type: Types.String, default: '' },
  /** Set to true by the system once the player has discovered this object */
  discovered: { type: Types.Boolean, default: false },
});
