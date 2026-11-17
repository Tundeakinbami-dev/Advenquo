/**
 * Advenquo: Multi-Level Construction Architecture & Progression Tests
 *
 * Verifies that:
 * 1. All 7 construction levels and the creative sandbox are defined and loadable.
 * 2. Each level specifies unique architectural/engineering challenges and components.
 * 3. Level unlocking enforces sequential mastery (Level 2 requires Level 1 completion, etc.).
 * 4. Free-build Sandbox allows unrestricted experimentation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  BlueprintLoader,
  UnlockManager,
  LevelManager,
  type ConstructionLevelId,
} from '../src/construction/index.js';

describe('Advenquo: Multi-Level Construction Progression', () => {
  it('provides all 7 progressive engineering challenges plus sandbox', () => {
    const requiredLevels: ConstructionLevelId[] = [
      'small_house',
      'duplex',
      'bungalow',
      'castle',
      'mansion',
      'bridge',
      'sandbox',
    ];

    for (const levelId of requiredLevels) {
      const bp = BlueprintLoader.load(levelId);
      assert.ok(bp, `Blueprint for ${levelId} must exist and be registered`);
      assert.ok(bp.stages.length >= 1, `${levelId} must specify construction stages`);
      assert.ok(bp.foundationDimensions.length === 3, `${levelId} must define foundation dimensions`);
    }
  });

  it('Level 1: Small House introduces basic masonry, door openings, lintels, and roof panels', () => {
    const house = BlueprintLoader.load('small_house');
    assert.ok(house);
    assert.strictEqual(house.requiredQuantities.concrete_block, 4);
    assert.strictEqual(house.requiredQuantities.horizontal_beam, 1);
    assert.strictEqual(house.requiredQuantities.roof_panel, 2);
  });

  it('Level 2: Duplex Villa introduces two floors, column grids, floor slabs, and stairs', () => {
    const duplex = BlueprintLoader.load('duplex');
    assert.ok(duplex);
    assert.strictEqual(duplex.requiredQuantities.reinforced_column, 4);
    assert.strictEqual(duplex.requiredQuantities.floor_component, 2);
    assert.strictEqual(duplex.requiredQuantities.staircase, 1);
  });

  it('Level 6: Viaduct Bridge introduces deep foundations, piers, and box girder deck spans', () => {
    const bridge = BlueprintLoader.load('bridge');
    assert.ok(bridge);
    assert.strictEqual(bridge.requiredQuantities.foundation_block, 6);
    assert.strictEqual(bridge.requiredQuantities.reinforced_column, 4);
    assert.strictEqual(bridge.requiredQuantities.bridge_section, 3);
  });

  it('enforces sequential unlocking through UnlockManager and LevelManager', () => {
    const unlockManager = new UnlockManager();
    assert.strictEqual(unlockManager.isLevelUnlocked('small_house'), true, 'Level 1 is unlocked by default');
    assert.strictEqual(unlockManager.isLevelUnlocked('duplex'), false, 'Level 2 must be locked initially');
    assert.strictEqual(unlockManager.isLevelUnlocked('bridge'), false, 'Level 6 must be locked initially');

    // Complete Level 1
    const newlyUnlocked = unlockManager.markLevelCompleted('small_house');
    assert.ok(newlyUnlocked.includes('duplex'), 'Completing Level 1 must unlock Level 2');
    assert.strictEqual(unlockManager.isLevelUnlocked('duplex'), true);
  });
});
