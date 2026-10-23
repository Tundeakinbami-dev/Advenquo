/**
 * Advenquo — Discovery system.
 *
 * Detects when the player interacts with (presses / activates) a CulturalObject
 * entity and marks it as discovered by setting `discovered: true`.
 *
 * Uses RayInteractable + Pressed (which responds to both hand-ray pinch and
 * controller trigger) so the experience is hands-first without requiring
 * controllers.
 *
 * Audio feedback: plays the attached AudioSource on first discovery.
 */

import {
  AudioUtils,
  createSystem,
  Pressed,
} from '@iwsdk/core';

import { CulturalObject } from './cultural-object-component.js';

export class DiscoverySystem extends createSystem({
  /** All cultural objects (used for any read) */
  cultural: { required: [CulturalObject] },
  /** Cultural objects currently pressed by hand-ray or controller ray */
  pressed: { required: [CulturalObject, Pressed] },
}) {
  init(): void {
    // When a cultural object is pressed for the first time, mark it discovered
    this.cleanupFuncs.push(
      this.queries.pressed.subscribe('qualify', (entity) => {
        const alreadyFound = entity.getValue(CulturalObject, 'discovered');
        if (!alreadyFound) {
          entity.setValue(CulturalObject, 'discovered', true);
          // Play audio if one is attached
          AudioUtils.play(entity);
        }
      }),
    );
  }
}
