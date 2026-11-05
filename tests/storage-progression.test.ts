/**
 * Advenquo: Storage & Progression Unit Tests
 *
 * Verifies profile updates, XP progression curve, level-up calculations,
 * skill advancement limits, and anti-duplication persistence.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { storage, createInitialState } from '../src/game/storage.js';

describe('Storage & Progression Engine', () => {
  beforeEach(() => {
    storage.reset();
  });

  it('initializes with valid default state', () => {
    const state = storage.getState();
    assert.strictEqual(state.version, 1);
    assert.strictEqual(state.profile.guardianLevel, 1);
    assert.strictEqual(state.profile.totalXp, 0);
    assert.strictEqual(state.skills.languageComprehension, 15);
    assert.strictEqual(state.passport.stamps.length, 0);
    assert.strictEqual(state.passport.vocabulary.length, 0);
    assert.strictEqual(state.passport.journal.length, 0);
    assert.strictEqual(state.selectedDestinationId, 'nigeria');
    assert.strictEqual(state.selectedDistrictId, 'isale_eko');
    assert.strictEqual(state.explorationMode, 'free_exploration');
  });

  it('persists the player-selected exploration mode', () => {
    storage.setExplorationMode('adventure_mission');
    assert.strictEqual(storage.getState().explorationMode, 'adventure_mission');

    storage.setExplorationMode('free_exploration');
    assert.strictEqual(storage.getState().explorationMode, 'free_exploration');
  });

  it('updates player profile cleanly', () => {
    const updated = storage.updateProfile({
      name: 'Akin Culturalist',
      avatar: '👑',
      challengeLevel: 'scholar',
    });

    assert.strictEqual(updated.name, 'Akin Culturalist');
    assert.strictEqual(updated.avatar, '👑');
    assert.strictEqual(updated.challengeLevel, 'scholar');

    const state = storage.getState();
    assert.strictEqual(state.profile.name, 'Akin Culturalist');
  });

  it('calculates XP progression and level ups correctly', () => {
    // 0 XP -> Level 1
    assert.strictEqual(storage.getState().profile.guardianLevel, 1);

    // +200 XP -> still Level 1 (200 / 250 = 0 -> 1 + 0 = 1)
    const res1 = storage.addXp(200);
    assert.strictEqual(res1.totalXp, 200);
    assert.strictEqual(res1.guardianLevel, 1);
    assert.strictEqual(res1.leveledUp, false);

    // +100 XP -> 300 XP -> Level 2 (300 / 250 = 1 -> 1 + 1 = 2)
    const res2 = storage.addXp(100);
    assert.strictEqual(res2.totalXp, 300);
    assert.strictEqual(res2.guardianLevel, 2);
    assert.strictEqual(res2.leveledUp, true);

    // +500 XP -> 800 XP -> Level 4 (800 / 250 = 3 -> 1 + 3 = 4)
    const res3 = storage.addXp(500);
    assert.strictEqual(res3.totalXp, 800);
    assert.strictEqual(res3.guardianLevel, 4);
    assert.strictEqual(res3.leveledUp, true);
  });

  it('advances skills without exceeding the 100% cap', () => {
    storage.advanceSkills({
      languageComprehension: 20,
      culturalInterpretation: 90,
    });

    const state = storage.getState();
    assert.strictEqual(state.skills.languageComprehension, 35); // 15 + 20
    assert.strictEqual(state.skills.culturalInterpretation, 100); // 15 + 90 clamped to 100
  });

  it('records stamps, vocabulary, and journal entries idempotently', () => {
    const stamp = {
      id: 'stamp_test',
      name: 'Test Stamp',
      category: 'artifact' as const,
      destinationId: 'nigeria',
      districtId: 'isale_eko',
      icon: '🏺',
      unlockedAt: new Date().toISOString(),
      description: 'Test stamp description',
    };

    const vocab = [
      {
        term: 'Ẹ káàárọ̀',
        phonetic: 'Eh-kah-ah-raw',
        englishGloss: 'Good morning',
        language: 'Yoruba',
        context: 'Respectful greeting',
        masteryScore: 50,
        learnedAt: new Date().toISOString(),
      },
    ];

    const journal = {
      id: 'journal_test',
      title: 'Test Journal',
      category: 'History',
      summary: 'Test summary',
      verifiedFact: 'Verified fact test',
      sourceAttribution: 'Test source',
      discoveredAt: new Date().toISOString(),
    };

    // First completion
    const firstAttempt = storage.recordMissionCompletion('test_mission', stamp, vocab, journal);
    assert.strictEqual(firstAttempt, true);

    let state = storage.getState();
    assert.strictEqual(state.passport.completedMissionIds.length, 1);
    assert.strictEqual(state.passport.stamps.length, 1);
    assert.strictEqual(state.passport.vocabulary.length, 1);
    assert.strictEqual(state.passport.journal.length, 1);

    // Duplicate attempt
    const duplicateAttempt = storage.recordMissionCompletion('test_mission', stamp, vocab, journal);
    assert.strictEqual(duplicateAttempt, false);

    state = storage.getState();
    assert.strictEqual(state.passport.completedMissionIds.length, 1, 'Should not duplicate completed IDs');
    assert.strictEqual(state.passport.stamps.length, 1, 'Should not duplicate stamps');
  });
});
