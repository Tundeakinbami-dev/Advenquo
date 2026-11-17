/**
 * Advenquo: Construction World — Blueprint Schema
 */

export type {
  BlueprintTarget,
  BlueprintStage,
  BlueprintDefinition,
} from './blueprint-types.js';

import type { BlueprintDefinition } from './blueprint-types.js';

export function validateBlueprintSchema(bp: unknown): bp is BlueprintDefinition {
  if (!bp || typeof bp !== 'object') return false;
  const b = bp as Record<string, any>;
  return (
    typeof b.id === 'string' &&
    typeof b.title === 'string' &&
    Array.isArray(b.stages) &&
    Array.isArray(b.targets) &&
    typeof b.requiredQuantities === 'object'
  );
}
