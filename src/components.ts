/**
 * Advenquo: VR Construction & Building Game — Component Registry
 *
 * All authored components must be registered here for IWSDK runtime
 * and editor scene inspection.
 */

import { defineComponents } from '@iwsdk/core';
import { CharacterAnimation } from './character-animation-component.js';
import {
  ConstructionBlock,
  ConstructionSnapHost,
  ConstructionWorkshopState,
} from './construction/core/construction-components.js';

export default defineComponents([
  CharacterAnimation,
  ConstructionBlock,
  ConstructionSnapHost,
  ConstructionWorkshopState,
]);
