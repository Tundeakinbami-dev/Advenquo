/**
 * Advenquo: Mission Engine Unit Tests
 *
 * Verifies deterministic evaluation, choice scoring, hint requests,
 * step advancement, completion verification, and anti-tamper reward idempotency.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { missionEngine } from '../src/game/mission-engine.js';
import { storage } from '../src/game/storage.js';
import { MISSIONS } from '../src/game/missions-data.js';

describe('Mission Engine', () => {
  beforeEach(() => {
    storage.reset();
  });

  it('contains all required MVP missions', () => {
    const missions = missionEngine.getAllMissions();
    assert.ok(missions.length >= 5, 'Must contain all required MVP missions');

    const types = missions.map((m) => m.type);
    assert.ok(types.includes('language'), 'Contextual language mission must exist');
    assert.ok(types.includes('investigation'), 'Cultural investigation mission must exist');
    assert.ok(types.includes('geography_navigation'), 'Geography navigation mission must exist');
    assert.ok(types.includes('contemporary_world_now'), 'World Now linked mission must exist');
    assert.ok(missions.some((m) => m.id === 'mission_adire_purchase'), 'Market purchase conversation mission must exist');
  });

  it('starts a mission and initializes clean active state', () => {
    const startResult = missionEngine.startMission('mission_yoruba_greetings');
    assert.strictEqual(startResult.success, true);
    assert.ok(startResult.mission);
    assert.ok(startResult.state);
    assert.strictEqual(startResult.state.currentStepIndex, 0);
    assert.strictEqual(startResult.state.completedStepIds.length, 0);
    assert.strictEqual(startResult.state.isCompleted, false);

    const activeState = missionEngine.getActiveMissionState();
    assert.ok(activeState);
    assert.strictEqual(activeState.missionId, 'mission_yoruba_greetings');
  });

  it('evaluates choices deterministically and tracks attempts', () => {
    missionEngine.startMission('mission_yoruba_greetings');

    // 1. Submit incorrect choice
    const wrongResult = missionEngine.submitChoice(
      'mission_yoruba_greetings',
      'step_greeting_elder',
      'choice_peer',
    );
    assert.ok(wrongResult);
    assert.strictEqual(wrongResult.isCorrect, false);
    assert.strictEqual(wrongResult.canAdvance, false);
    assert.strictEqual(wrongResult.attemptsCount, 1);
    assert.ok(wrongResult.feedback.length > 0);

    // 2. Request hint
    const hint = missionEngine.requestHint('mission_yoruba_greetings', 'step_greeting_elder');
    assert.ok(hint);
    assert.ok(hint.hint.includes('Ẹ'));

    // 3. Submit correct choice
    const correctResult = missionEngine.submitChoice(
      'mission_yoruba_greetings',
      'step_greeting_elder',
      'choice_elder',
    );
    assert.ok(correctResult);
    assert.strictEqual(correctResult.isCorrect, true);
    assert.strictEqual(correctResult.canAdvance, true);
    assert.strictEqual(correctResult.attemptsCount, 2);
  });

  it('advances through steps and completes mission idempotently', () => {
    missionEngine.startMission('mission_yoruba_greetings');

    // Complete Step 1
    missionEngine.submitChoice('mission_yoruba_greetings', 'step_greeting_elder', 'choice_elder');
    const advance1 = missionEngine.advanceToNextStep('mission_yoruba_greetings');
    assert.strictEqual(advance1.hasNextStep, true);
    assert.strictEqual(advance1.nextStepIndex, 1);

    // Complete Step 2
    missionEngine.submitChoice('mission_yoruba_greetings', 'step_inquire_adire', 'choice_adire_where');
    const advance2 = missionEngine.advanceToNextStep('mission_yoruba_greetings');
    assert.strictEqual(advance2.hasNextStep, false);
    assert.strictEqual(advance2.isCompleted, true);

    // Complete mission
    const completion = missionEngine.completeMission('mission_yoruba_greetings');
    assert.ok(completion);
    assert.strictEqual(completion.success, true);
    assert.strictEqual(completion.xpEarned, 200);
    assert.ok(completion.unlockedStamp);
    assert.strictEqual(completion.unlockedStamp.id, 'stamp_yoruba_greetings');
    assert.ok(completion.addedVocabulary);
    assert.strictEqual(completion.addedVocabulary.length, 3);
    assert.ok(completion.addedJournal);

    // Verify passport recorded completion
    assert.strictEqual(storage.isMissionCompleted('mission_yoruba_greetings'), true);

    // Verify duplicate completion does not re-add rewards
    const secondCompletion = storage.recordMissionCompletion('mission_yoruba_greetings');
    assert.strictEqual(secondCompletion, false, 'Duplicate completion must be rejected');
  });

  it('refuses completion if all steps have not been completed', () => {
    missionEngine.startMission('mission_yoruba_greetings');
    // Only answer step 1
    missionEngine.submitChoice('mission_yoruba_greetings', 'step_greeting_elder', 'choice_elder');

    const completion = missionEngine.completeMission('mission_yoruba_greetings');
    assert.strictEqual(completion, null, 'Premature completion must be rejected');
  });
});
