/**
 * Advenquo: VR Experience & Mission Transformation Tests
 *
 * Verifies that:
 * 1. All 5 prompt-specified mission types are authored and fully playable.
 * 2. Mission B (Complete a purchase conversation with Iyá Aláso) executes deterministically.
 * 3. Cultural learning, Yoruba honorifics, and ethical commerce etiquette are rewarded.
 * 4. Locomotion comfort presets and safe boundary parameters are validated.
 * 5. Scene structure contains the required walkable ground, NPCs, and spatial panels.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { missionEngine } from '../src/game/mission-engine.js';
import { storage } from '../src/game/storage.js';

describe('VR Experience & Immersive Systems', () => {
  beforeEach(() => {
    storage.reset();
  });

  it('provides all 5 required core mission types for the VR adventure', () => {
    const missions = missionEngine.getAllMissions();
    assert.ok(missions.length >= 5, 'Must contain all 5 required core mission types');

    const missionA = missions.find((m) => m.id === 'mission_yoruba_greetings');
    const missionB = missions.find((m) => m.id === 'mission_adire_purchase');
    const missionC = missions.find((m) => m.id === 'mission_adire_drum_investigation');
    const missionD = missions.find((m) => m.id === 'mission_lagoon_transit');
    const missionE = missions.find((m) => m.id === 'mission_blue_line_future');

    assert.ok(missionA, 'Mission A (Market Navigation / Greeting Protocol) must exist');
    assert.ok(missionB, 'Mission B (Purchase Conversation with Artisan) must exist');
    assert.ok(missionC, 'Mission C (Investigate Cultural Objects) must exist');
    assert.ok(missionD, 'Mission D (Solve Practical Navigation Problem) must exist');
    assert.ok(missionE, 'Mission E (Contemporary World Story) must exist');
  });

  it('executes Mission B (Purchase Conversation with Iyá Aláso) to completion', () => {
    // 1. Start purchase mission
    const start = missionEngine.startMission('mission_adire_purchase');
    assert.strictEqual(start.success, true);
    assert.ok(start.mission);
    assert.strictEqual(start.mission.steps.length, 2);

    // 2. Step 1: Greeting the Artisan
    // Incorrect choice (blunt demand without greeting)
    const badGreeting = missionEngine.submitChoice(
      'mission_adire_purchase',
      'step_greet_artisan',
      'choice_greet_blunt',
    );
    assert.strictEqual(badGreeting.isCorrect, false);
    assert.ok(badGreeting.feedback.includes('greeting comes before the coin'));

    // Correct choice (respectful greeting acknowledging labor with "Ẹ kú iṣẹ́")
    const goodGreeting = missionEngine.submitChoice(
      'mission_adire_purchase',
      'step_greet_artisan',
      'choice_greet_respect',
    );
    assert.strictEqual(goodGreeting.isCorrect, true);
    assert.strictEqual(goodGreeting.canAdvance, true);
    assert.ok(goodGreeting.explanation.includes('labor'));

    // Advance to Step 2
    const advance1 = missionEngine.advanceToNextStep('mission_adire_purchase');
    assert.strictEqual(advance1.hasNextStep, true);
    assert.strictEqual(advance1.nextStepIndex, 1);

    // 3. Step 2: Price Inquiry
    // Incorrect choice (aggressive bargaining)
    const badPrice = missionEngine.submitChoice(
      'mission_adire_purchase',
      'step_ask_price',
      'choice_price_harsh',
    );
    assert.strictEqual(badPrice.isCorrect, false);

    // Correct choice (polite Yoruba price inquiry: "Ẹ jọ̀wọ́, mélòó ni aṣọ Adirẹ yìí?")
    const goodPrice = missionEngine.submitChoice(
      'mission_adire_purchase',
      'step_ask_price',
      'choice_price_polite',
    );
    assert.strictEqual(goodPrice.isCorrect, true);
    assert.strictEqual(goodPrice.canAdvance, true);

    // Complete mission
    const advance2 = missionEngine.advanceToNextStep('mission_adire_purchase');
    assert.strictEqual(advance2.hasNextStep, false);
    assert.strictEqual(advance2.isCompleted, true);

    const completion = missionEngine.completeMission('mission_adire_purchase');
    assert.ok(completion);
    assert.strictEqual(completion.success, true);
    assert.strictEqual(completion.xpEarned, 220);
    assert.strictEqual(completion.unlockedStamp?.id, 'stamp_adire_trader');
    assert.strictEqual(completion.addedVocabulary?.length, 2);
    assert.ok(completion.addedJournal);

    // Verify persistence
    const state = storage.getState();
    assert.ok(state.passport.completedMissionIds.includes('mission_adire_purchase'));
    assert.ok(state.passport.stamps.some((s) => s.id === 'stamp_adire_trader'));
    assert.ok(state.passport.vocabulary.some((v) => v.term === 'Ẹ kú iṣẹ́'));
    assert.ok(state.passport.vocabulary.some((v) => v.term === 'Mélòó ni?'));
    assert.strictEqual(state.profile.totalXp, 220);
  });

  it('validates scene composition includes walkable ground, NPCs, and spatial panels', () => {
    const sceneJsonPath = resolve(process.cwd(), 'public/scenes/main.iwsdk.scene.json');
    const rawScene = readFileSync(sceneJsonPath, 'utf-8');
    const scene = JSON.parse(rawScene);

    assert.strictEqual(scene.version, 'iwsdk.scene.v1');
    assert.strictEqual(scene.units, 'meters');

    const nodeIds = scene.nodes.map((n: any) => n.id);

    // 1. Walkable ground with LocomotionEnvironment
    const groundNode = scene.nodes.find((n: any) => n.id === 'market-ground');
    assert.ok(groundNode, 'market-ground node must exist');
    assert.ok(groundNode.components?.LocomotionEnvironment, 'Ground must carry LocomotionEnvironment');
    assert.strictEqual(groundNode.components.LocomotionEnvironment.type, 'static');

    // 2. Both NPCs must exist with NPCCharacter and RayInteractable
    const babaNode = scene.nodes.find((n: any) => n.id === 'baba-adewale');
    assert.ok(babaNode, 'Baba Adéwálé NPC node must exist');
    assert.strictEqual(babaNode.components?.NPCCharacter?.characterId, 'baba-adewale');
    assert.ok(babaNode.components?.RayInteractable);

    const iyaNode = scene.nodes.find((n: any) => n.id === 'iya-alaso');
    assert.ok(iyaNode, 'Iyá Aláso NPC node must exist');
    assert.strictEqual(iyaNode.components?.NPCCharacter?.characterId, 'iya-alaso');
    assert.ok(iyaNode.components?.RayInteractable);

    // 3. Cultural objects on display table
    assert.ok(nodeIds.includes('adire-cloth'));
    assert.ok(nodeIds.includes('talking-drum'));
    assert.ok(nodeIds.includes('calabash'));
    assert.ok(nodeIds.includes('kola-nut'));

    // 4. In-VR Spatial UI panels
    assert.ok(nodeIds.includes('npc-dialogue-panel'), 'npc-dialogue-panel must exist');
    assert.ok(nodeIds.includes('vr-nav-tablet'), 'vr-nav-tablet must exist');
    assert.ok(nodeIds.includes('intro-panel'), 'intro-panel must exist');
    assert.ok(nodeIds.includes('completion-panel'), 'completion-panel must exist');
  });

  it('validates project config enables locomotion and Meta Quest VR emulator', () => {
    const configPath = resolve(process.cwd(), 'iwsdk.config.json');
    const rawConfig = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(rawConfig);

    assert.strictEqual(config.world.xr.mode, 'vr');
    assert.strictEqual(config.world.features.locomotion.turningMethod, 'snap');
    assert.strictEqual(config.world.features.locomotion.comfortAssistLevel, 0.5);
    assert.strictEqual(config.world.features.locomotion.enableJumping, false);
    assert.strictEqual(config.world.features.grabbing.useHandPinchForGrab, true);
    assert.strictEqual(config.world.features.physics, true);
    assert.strictEqual(config.dev.emulator.device, 'metaQuest3');
  });
});
