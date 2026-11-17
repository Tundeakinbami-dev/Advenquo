/**
 * Advenquo: Construction Scoring & Level Progression Regression Suite
 *
 * Verifies:
 * 1. Score calculation from accuracy, connection completeness, and structural stability.
 * 2. Star ratings (0 to 3 stars based on thresholds).
 * 3. Level unlocking progression (Levels 1 to 7: Small House, Duplex, Bungalow, Castle, Mansion, Bridge, Sandbox).
 * 4. Sequential progression enforcement (level N+1 requires level N).
 * 5. Builder achievements unlocking upon milestones.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ConstructionScore,
  UnlockManager,
  LevelManager,
  AchievementManager,
  type ConstructionLevelId,
} from '../src/construction/index.js';

describe('Advenquo: Construction Scoring & Level Progression', () => {
  describe('1. Construction Scoring & Star Ratings', () => {
    it('awards 3 stars for near-perfect construction (>= 90 score)', () => {
      const result = ConstructionScore.calculate({
        accuracyScore: 95,
        connectionScore: 100,
        stabilityScore: 100,
        bonusPoints: 10,
      });

      assert.strictEqual(result.starRating, 3);
      assert.strictEqual(result.grade, 'Master Builder');
      assert.ok(result.totalScore >= 90);
    });

    it('awards 2 stars for solid structural assembly (>= 75 score)', () => {
      const result = ConstructionScore.calculate({
        accuracyScore: 75,
        connectionScore: 80,
        stabilityScore: 80,
      });

      assert.strictEqual(result.starRating, 2);
      assert.strictEqual(result.grade, 'Journeyman Builder');
    });

    it('awards 1 star for basic passable assembly (>= 50 score)', () => {
      const result = ConstructionScore.calculate({
        accuracyScore: 50,
        connectionScore: 60,
        stabilityScore: 60,
      });

      assert.strictEqual(result.starRating, 1);
      assert.strictEqual(result.grade, 'Apprentice Builder');
    });

    it('awards 0 stars for unstable failure (< 50 score)', () => {
      const result = ConstructionScore.calculate({
        accuracyScore: 20,
        connectionScore: 30,
        stabilityScore: 10,
      });

      assert.strictEqual(result.starRating, 0);
      assert.strictEqual(result.grade, 'Uncertified');
    });
  });

  describe('2. Level Unlocking Progression', () => {
    it('starts with Level 1 (Small House) unlocked by default', () => {
      const unlockManager = new UnlockManager();
      assert.strictEqual(unlockManager.isLevelUnlocked('small_house'), true);
      assert.strictEqual(unlockManager.isLevelUnlocked('duplex'), false);
    });

    it('unlocks subsequent levels sequentially upon passing previous levels', () => {
      const unlockManager = new UnlockManager();

      // Complete Small House
      unlockManager.recordLevelCompletion('small_house', 3);
      assert.strictEqual(unlockManager.isLevelUnlocked('duplex'), true);

      // Complete Duplex
      unlockManager.recordLevelCompletion('duplex', 2);
      assert.strictEqual(unlockManager.isLevelUnlocked('bungalow'), true);

      // Complete Bungalow
      unlockManager.recordLevelCompletion('bungalow', 3);
      assert.strictEqual(unlockManager.isLevelUnlocked('castle'), true);
    });

    it('tracks progressive levels through LevelManager', () => {
      const levelManager = new LevelManager();
      const levels = levelManager.getAllLevels();

      assert.strictEqual(levels.length, 7);
      assert.strictEqual(levels[0].id, 'small_house');
      assert.strictEqual(levels[1].id, 'duplex');
      assert.strictEqual(levels[2].id, 'bungalow');
      assert.strictEqual(levels[3].id, 'castle');
      assert.strictEqual(levels[4].id, 'mansion');
      assert.strictEqual(levels[5].id, 'bridge');
      assert.strictEqual(levels[6].id, 'sandbox');
    });
  });

  describe('3. Builder Achievements', () => {
    it('unlocks Foundation Master upon first level completion', () => {
      const achievementManager = new AchievementManager();
      const unlocked = achievementManager.checkMilestone('first_structure_certified');

      assert.ok(unlocked);
      assert.strictEqual(unlocked.id, 'first_structure_certified');
      assert.ok(unlocked.title.includes('Foundation'));
    });
  });
});
