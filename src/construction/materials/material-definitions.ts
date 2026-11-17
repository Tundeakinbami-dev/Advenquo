/**
 * Advenquo: Construction World — Material Definitions
 */

export { MATERIAL_SPECS } from './material-specs.js';
import { MATERIAL_SPECS } from './material-specs.js';
import type { MaterialPhysicalProperties } from '../core/construction-types.js';

export function getMaterialSpec(key: string): MaterialPhysicalProperties {
  const spec = MATERIAL_SPECS[key];
  if (!spec) {
    // Fallback to aggregate concrete block
    return MATERIAL_SPECS.aggregate_concrete_block;
  }
  return spec;
}
