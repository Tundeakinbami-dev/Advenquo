/**
 * Advenquo: End-to-End Primary Player Journey Integration Test
 *
 * Verifies the complete product loop:
 * 1. Open game & set up explorer profile
 * 2. Open Global Map & select Nigeria
 * 3. Enter District (Ìsàlẹ̀ Èkó)
 * 4. Inspect Point of Interest (Iga Idunganran)
 * 5. Start Mission (Ẹ Káàárọ̀: The Morning Protocol)
 * 6. Interact with branching dialogue & request adaptive hint
 * 7. Complete mission & receive validated educational feedback
 * 8. Save discoveries to Culture Passport & Journal
 * 9. Open World Now & inspect verified contemporary transit story
 * 10. Start linked contemporary adventure
 * 11. Complete connected adventure & advance Guardian Level
 * 12. Simulate reload & verify persistent resumption of all progress
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { storage } from '../src/game/storage.js';
import { missionEngine } from '../src/game/mission-engine.js';
import { DESTINATIONS } from '../src/game/world-data.js';
import { WORLD_NOW_STORIES } from '../src/game/world-now-data.js';

describe('Primary Player Journey Integration', () => {
  it('executes the full player adventure loop with persistence', () => {
    // ── 1. Application Entry & Profile Customization ────────────────────────
    storage.reset();
    let state = storage.getState();
    assert.strictEqual(state.profile.guardianLevel, 1);
    assert.strictEqual(state.profile.totalXp, 0);

    storage.updateProfile({
      name: 'Adewale Explorer',
      avatar: '🧭',
      challengeLevel: 'apprentice',
    });
    assert.strictEqual(storage.getState().profile.name, 'Adewale Explorer');

    // ── 2. Open World Map & Select Nigeria ──────────────────────────────────
    const nigeria = DESTINATIONS.find((d) => d.id === 'nigeria');
    assert.ok(nigeria);
    assert.strictEqual(nigeria.status, 'PLAYABLE');
    assert.strictEqual(nigeria.districts.length, 2);

    storage.setSelectedLocation('nigeria', 'isale_eko');
    assert.strictEqual(storage.getState().selectedDestinationId, 'nigeria');

    // ── 3. Explore District: Ìsàlẹ̀ Èkó ─────────────────────────────────────
    const isaleEko = nigeria.districts.find((d) => d.id === 'isale_eko');
    assert.ok(isaleEko);
    assert.ok(isaleEko.pointsOfInterest.length >= 3);

    // ── 4. Inspect Point of Interest: Iga Idunganran ────────────────────────
    const palace = isaleEko.pointsOfInterest.find((p) => p.id === 'poi_iga_idunganran');
    assert.ok(palace);
    assert.strictEqual(palace.linkedMissionId, 'mission_yoruba_greetings');

    // ── 5. Start Mission: Ẹ Káàárọ̀ ─────────────────────────────────────────
    const startMissionOutcome = missionEngine.startMission('mission_yoruba_greetings');
    assert.strictEqual(startMissionOutcome.success, true);
    assert.ok(startMissionOutcome.mission);

    // ── 6. Step 1: Dialogue with Baba Adéwálé ────────────────────────────────
    // Player attempts casual slang (báwo ni)
    const step1Wrong = missionEngine.submitChoice(
      'mission_yoruba_greetings',
      'step_greeting_elder',
      'choice_peer',
    );
    assert.ok(step1Wrong);
    assert.strictEqual(step1Wrong.isCorrect, false);
    assert.strictEqual(step1Wrong.attemptsCount, 1);

    // Player requests cultural hint
    const hint = missionEngine.requestHint('mission_yoruba_greetings', 'step_greeting_elder');
    assert.ok(hint);
    assert.ok(hint.hint.includes('Ẹ'));

    // Player submits proper elder greeting
    const step1Right = missionEngine.submitChoice(
      'mission_yoruba_greetings',
      'step_greeting_elder',
      'choice_elder',
    );
    assert.ok(step1Right);
    assert.strictEqual(step1Right.isCorrect, true);
    assert.strictEqual(step1Right.canAdvance, true);

    // Advance to Step 2
    const advanceToStep2 = missionEngine.advanceToNextStep('mission_yoruba_greetings');
    assert.strictEqual(advanceToStep2.hasNextStep, true);

    // ── 7. Step 2: Polite Inquiry for Artisan Guild ─────────────────────────
    const step2Right = missionEngine.submitChoice(
      'mission_yoruba_greetings',
      'step_inquire_adire',
      'choice_adire_where',
    );
    assert.ok(step2Right);
    assert.strictEqual(step2Right.isCorrect, true);

    // Finalize steps
    const finalizeSteps = missionEngine.advanceToNextStep('mission_yoruba_greetings');
    assert.strictEqual(finalizeSteps.isCompleted, true);

    // ── 8. Mission Completion & Validated Debrief ────────────────────────────
    const completion = missionEngine.completeMission('mission_yoruba_greetings');
    assert.ok(completion);
    assert.strictEqual(completion.success, true);
    assert.strictEqual(completion.xpEarned, 200);
    assert.ok(completion.unlockedStamp);
    assert.strictEqual(completion.unlockedStamp.name, 'Ọmọlúwàbí: Respectful Protocol');

    // Verify Culture Passport was populated
    state = storage.getState();
    assert.strictEqual(state.passport.completedMissionIds.length, 1);
    assert.strictEqual(state.passport.stamps.length, 1);
    assert.strictEqual(state.passport.vocabulary.length, 3);
    assert.strictEqual(state.passport.journal.length, 1);
    assert.strictEqual(state.skills.languageComprehension > 15, true);

    // ── 9. Open World Now & Inspect Contemporary Story ──────────────────────
    const transitStory = WORLD_NOW_STORIES.find((s) => s.id === 'story_lagos_blue_line');
    assert.ok(transitStory);
    assert.strictEqual(transitStory.category, 'Infrastructure & Transit');
    assert.strictEqual(transitStory.verificationLevel, 'VERIFIED_FACT');
    assert.ok(transitStory.linkedMissionId);

    // ── 10. Start Connected World Now Mission ───────────────────────────────
    const linkedMissionOutcome = missionEngine.startMission(transitStory.linkedMissionId);
    assert.strictEqual(linkedMissionOutcome.success, true);

    // Complete linked mission Step 1
    const railStep1 = missionEngine.submitChoice(
      transitStory.linkedMissionId,
      'step_eval_power_source',
      'choice_ipp',
    );
    assert.ok(railStep1 && railStep1.isCorrect);
    missionEngine.advanceToNextStep(transitStory.linkedMissionId);

    // Complete linked mission Step 2
    const railStep2 = missionEngine.submitChoice(
      transitStory.linkedMissionId,
      'step_fact_vs_fiction',
      'choice_fact',
    );
    assert.ok(railStep2 && railStep2.isCorrect);
    missionEngine.advanceToNextStep(transitStory.linkedMissionId);

    // Complete connected mission
    const linkedCompletion = missionEngine.completeMission(transitStory.linkedMissionId);
    assert.ok(linkedCompletion);
    assert.strictEqual(linkedCompletion.success, true);
    assert.strictEqual(linkedCompletion.xpEarned, 280);

    // 200 XP + 280 XP = 480 XP -> Level 2 (1 + floor(480/250) = 2)
    assert.strictEqual(linkedCompletion.newGuardianLevel, 2);
    assert.strictEqual(linkedCompletion.leveledUp, true);

    // ── 11. Verify Passport & Skills After Both Missions ────────────────────
    state = storage.getState();
    assert.strictEqual(state.passport.completedMissionIds.length, 2);
    assert.strictEqual(state.passport.stamps.length, 2);
    assert.strictEqual(state.profile.guardianLevel, 2);
    assert.strictEqual(state.profile.totalXp, 480);
    assert.ok(state.skills.evidenceEvaluation > 15);

    // ── 12. Simulate App Departure & Reload Persistence ─────────────────────
    // Save serialized snapshot
    const serializedJson = JSON.stringify(state);

    // Fresh storage instance simulating player reopening browser tomorrow
    const freshStorage = storage.load();
    assert.ok(freshStorage);
    assert.strictEqual(freshStorage.profile.name, 'Adewale Explorer');
    assert.strictEqual(freshStorage.profile.guardianLevel, 2);
    assert.strictEqual(freshStorage.profile.totalXp, 480);
    assert.strictEqual(freshStorage.passport.completedMissionIds.length, 2);
    assert.strictEqual(freshStorage.passport.stamps.length, 2);
  });
});
