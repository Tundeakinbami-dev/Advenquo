/**
 * Advenquo — Adventure Mission Component declarations.
 *
 * Defines ECS components for tracking exploration-driven adventure missions,
 * active objectives, inventory clues, and interactive world items.
 *
 * System-free module — no DOM, World, or renderer imports allowed here.
 */

import { createComponent, Types } from '@iwsdk/core';

export const AdventureState = createComponent('AdventureState', {
  /** Identifier of the currently active adventure mission */
  activeMissionId: { type: Types.String, default: '' },
  /** Identifier of the current primary objective */
  currentObjectiveId: { type: Types.String, default: '' },
  /** High-level stage index (0 = not started, 1..n = steps, 99 = complete) */
  stage: { type: Types.Int32, default: 0 },
  /** Whether the adventure mission is currently completed */
  isCompleted: { type: Types.Boolean, default: false },
});

export const AdventureItem = createComponent('AdventureItem', {
  /** Stable item/clue ID e.g. "missing_goods_crate", "dyer_note" */
  itemId: { type: Types.String, default: '' },
  /** Display title e.g. "Missing Indigo Dye Package" */
  title: { type: Types.String, default: '' },
  /** Whether the player has discovered / collected this item in the adventure */
  collected: { type: Types.Boolean, default: false },
  /** Whether inspecting this item is required for the active objective */
  isObjectiveTarget: { type: Types.Boolean, default: false },
});
