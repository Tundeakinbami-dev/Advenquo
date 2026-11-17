/**
 * Advenquo: Construction World — ECS Component Declarations
 *
 * System-free module: no DOM, no World, no renderer imports allowed.
 * Used by both runtime and IWSDK editor.
 */

import { createComponent, Types } from '@iwsdk/core';

/**
 * Marks an entity as a modular construction component in the world.
 */
export const ConstructionBlock = createComponent(
  'ConstructionBlock',
  {
    /** Unique persistent instance identifier (e.g. "brick_42", "column_1") */
    instanceId: { type: Types.String, default: '' },
    /** Component type matching ComponentType e.g. "clay_brick", "reinforced_column" */
    componentType: { type: Types.String, default: 'clay_brick' },
    /** Engineering structural role e.g. "load_bearing_column", "compressive_masonry" */
    structuralRole: { type: Types.String, default: 'compressive_masonry' },
    /** True if this block has been placed into the assembled structure */
    isPlaced: { type: Types.Boolean, default: false },
    /** True if currently held by player hand or cursor */
    isHeld: { type: Types.Boolean, default: false },
    /** True if physics has been optimized to STATIC to preserve Quest 3 frame rates */
    isStaticOptimized: { type: Types.Boolean, default: false },
  },
  'Modular construction component tag with structural state',
);

/**
 * Tracks snap points and connection capacity on an entity.
 */
export const ConstructionSnapHost = createComponent(
  'ConstructionSnapHost',
  {
    /** Number of defined snap points on this component */
    snapPointCount: { type: Types.Int32, default: 0 },
    /** Number of snap points currently engaged in valid structural connections */
    connectedCount: { type: Types.Int32, default: 0 },
  },
  'Snap socket host and connection counter',
);

/**
 * Tracks overall construction workshop and challenge state.
 */
export const ConstructionWorkshopState = createComponent(
  'ConstructionWorkshopState',
  {
    /** Identifier of active blueprint challenge (e.g. "small_house_challenge") */
    activeChallengeId: { type: Types.String, default: 'small_house_challenge' },
    /** Progress percentage from 0 to 100 */
    completionPercentage: { type: Types.Float32, default: 0 },
    /** Whether current assembly passes all structural engineering tests */
    validationPassed: { type: Types.Boolean, default: false },
    /** Whether challenge is officially completed */
    isCompleted: { type: Types.Boolean, default: false },
  },
  'Workshop challenge and blueprint validation state',
);
