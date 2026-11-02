/**
 * Advenquo — Component registry.
 *
 * All components must be listed here so the IWSDK editor can inspect them
 * and scene JSON can author their fields.
 */

import { defineComponents } from '@iwsdk/core';
import { CulturalObject } from './cultural-object-component.js';
import { NPCCharacter } from './npc-component.js';

export default defineComponents([CulturalObject, NPCCharacter]);
