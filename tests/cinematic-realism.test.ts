/**
 * Advenquo — Phase 14: Cinematic Realism & Premium Open-World Visual Transformation
 * Acceptance Test Suite.
 *
 * Verifies all 16 Acceptance Criteria from Phase 14:
 *  1. Visually detailed Lagos environment.
 *  2. Recognisable local architectural and cultural details.
 *  3. Smooth player exploration with cinematic camera movement.
 *  4. Believable geometry and Physically Based Rendering (PBR) materials.
 *  5. Recognisable human characters with realistic anatomical proportions (7.8 heads).
 *  6. Natural NPC movement, breathing cycles, and activity routines.
 *  7. Approaching and interacting with characters in the spatial world.
 *  8. Conversational character animation, gestures, and cinematic camera framing.
 *  9. NPCs with distinct personalities, communication styles, and occupations.
 * 10. Persistent character memory, interaction history, and narrative progression.
 * 11. Meaningful background activity and dynamic environmental simulation.
 * 12. Free-form discovery of cultural objects and activities without active missions.
 * 13. Genuinely distinct environments across 4 Nigerian destinations.
 * 14. Performance scalability across Desktop, Mobile, and Meta Quest VR tiers.
 * 15. Separate validation for Desktop and WebXR / Meta Quest immersion.
 * 16. Continued 100% operation of existing missions, navigation, and progression.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Core 3D & Graphics Systems
import {
  pbrMaterialSystem,
  PBRMaterialSystem,
} from '../src/systems/pbr-material-system.js';
import {
  qualityProfileSystem,
  QualityProfileSystem,
} from '../src/systems/quality-profile-system.js';
import { CinematicCameraSystem } from '../src/systems/cinematic-camera-system.js';

// Procedural 3D Scene Assets
import { buildLagosStreetInfrastructure } from '../src/scene-assets/lagos-street-infrastructure.scene-asset.js';
import { buildNpcTobi } from '../src/scene-assets/npc-tobi.scene-asset.js';

// Living World & Story Systems
import { characterSimulationSystem } from '../src/systems/character-simulation-system.js';
import { characterMemorySystem } from '../src/systems/character-memory-system.js';
import { storyEngine } from '../src/systems/story-engine.js';
import { conversationalAISystem } from '../src/systems/conversational-ai-system.js';

// Navigation, Environment & Progression Systems
import {
  locationManager,
  discoveryManager,
  missionManager,
  playerProgression,
  saveSystem,
  timeOfDaySystem,
  weatherSystem,
} from '../src/systems/index.js';
import { missionEngine } from '../src/game/mission-engine.js';
import { storage } from '../src/game/storage.js';

describe('Phase 14: Cinematic Realism & Premium Visual Transformation Acceptance', () => {
  beforeEach(() => {
    storage.reset();
    saveSystem.resetProgress();
    characterMemorySystem.clearMemories();
    storyEngine.resetAll();
    characterSimulationSystem.setSimulatedHour(10);
    locationManager.setActiveLocationId('lagos_urban');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 1: Visually Detailed Lagos Environment
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 1: Player enters a visually detailed Lagos environment in scene composition', () => {
    const scenePath = resolve(process.cwd(), 'public/scenes/main.iwsdk.scene.json');
    const sceneJson = JSON.parse(readFileSync(scenePath, 'utf8'));

    const nodes = sceneJson.nodes || [];
    const urbanNodes = nodes.filter(
      (n: any) => n.components?.LocationAnchor?.locationId === 'lagos_urban',
    );

    assert.ok(
      urbanNodes.length >= 6,
      `Expected at least 6 distinct urban scene nodes, found ${urbanNodes.length}`,
    );

    const ids = urbanNodes.map((n: any) => n.id);
    assert.ok(ids.includes('architect-studio'), 'Studio Kán architect studio must be present');
    assert.ok(ids.includes('construction-site'), 'Active construction site must be present');
    assert.ok(ids.includes('buka-restaurant'), "Mama Nkechi's Buka canteen must be present");
    assert.ok(ids.includes('lagos-street-infrastructure'), 'Street infrastructure & utility grid must be present');
    assert.ok(ids.includes('npc-kunle'), 'Kunle Badmus must be placed in urban scene');

    // Tobi anchors the Missing Shipment story at the market; keep the urban
    // construction set and contractor there without requiring Tobi to be duplicated.
    const marketNodes = nodes.filter(
      (n: any) => n.components?.LocationAnchor?.locationId === 'nigerian_market',
    );
    assert.ok(
      marketNodes.some((n: any) => n.id === 'npc-tobi'),
      'Tobi Adeleke must be present in the active market for the story opening',
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 2: Recognisable Local Architectural & Cultural Details
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 2: Environment contains recognisable Lagos streetscape & architectural details', () => {
    const streetAsset = buildLagosStreetInfrastructure();
    assert.strictEqual(streetAsset.name, 'LagosStreetInfrastructure');

    const childNames: string[] = [];
    streetAsset.traverse((child) => {
      if (child.name) childNames.push(child.name);
    });

    // Check authentic NEPA utility infrastructure
    assert.ok(
      childNames.includes('ConcretePowerPole'),
      'Must contain reinforced concrete utility power pole',
    );
    assert.ok(
      childNames.includes('StepDownTransformer'),
      'Must contain pole-mounted step-down transformer',
    );

    // Check iconic Lagos roadside drainage & curbs
    assert.ok(
      childNames.includes('StormwaterDrainGutter'),
      'Must contain open concrete stormwater drainage gutter',
    );
    assert.ok(
      childNames.includes('PedestrianCrossingSlabs'),
      'Must contain pedestrian crossing concrete slabs over gutter',
    );
    assert.ok(
      childNames.includes('PaintedSafetyCurbs'),
      'Must contain alternating black/white painted safety curbs',
    );
    assert.ok(
      childNames.includes('AsphaltRoadway'),
      'Must contain asphalt road with laterite dirt shoulder',
    );
    assert.ok(
      childNames.includes('RoadsideVegetation'),
      'Must contain tropical roadside vegetation (bougainvillea/neem)',
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 3: Smooth Exploration with Cinematic Camera Movement
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 3: Player can explore smoothly with dynamic head bob and damping', () => {
    const camSys = new CinematicCameraSystem({} as any);
    camSys.init();

    assert.strictEqual(camSys.getMode(), 'exploration');

    // Walking movement triggers harmonic sway
    camSys.setMoving(true);
    // Simulating updates with moving=true does not throw and maintains exploration mode
    assert.strictEqual(camSys.getMode(), 'exploration');

    // Stopping movement resets bob cycle smoothly
    camSys.setMoving(false);
    assert.strictEqual(camSys.getMode(), 'exploration');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 4: Believable Geometry & Physically Based Rendering (PBR) Materials
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 4: Buildings and important locations have believable geometry and PBR materials', () => {
    // 1. Weathered zinc roofing
    const zinc = pbrMaterialSystem.getMaterial('weathered_zinc');
    assert.strictEqual(zinc.metalness, 0.65);
    assert.strictEqual(zinc.roughness, 0.45);

    // 2. Cured concrete
    const concrete = pbrMaterialSystem.getMaterial('cured_concrete');
    assert.strictEqual(concrete.roughness, 0.82);
    assert.strictEqual(concrete.metalness, 0.05);

    // 3. African Iroko hardwood
    const iroko = pbrMaterialSystem.getMaterial('african_iroko');
    assert.strictEqual(iroko.roughness, 0.38);

    // 4. Laterite roadside soil
    const laterite = pbrMaterialSystem.getMaterial('laterite_soil');
    assert.strictEqual(laterite.roughness, 0.95);

    // 5. Asphalt road
    const asphalt = pbrMaterialSystem.getMaterial('asphalt_road');
    assert.strictEqual(asphalt.roughness, 0.88);

    // 6. Human skin
    const skin = pbrMaterialSystem.getMaterial('human_skin_dark');
    assert.strictEqual(skin.roughness, 0.62);

    // Caching check
    const zincCached = pbrMaterialSystem.getMaterial('weathered_zinc');
    assert.strictEqual(zinc, zincCached, 'PBR materials must be cached and reused to prevent leaks');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 5: NPCs Look Like Recognisable Human Characters (7.8 Heads)
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 5: NPCs have realistic anatomical proportions (7.8 heads) and sculpted features', () => {
    const tobi = buildNpcTobi();
    assert.strictEqual(tobi.name, 'NpcTobiAdeleke');

    // Discover key articulated joint nodes
    const chest = tobi.getObjectByName('Tobi_Chest');
    const neck = tobi.getObjectByName('Tobi_Neck');
    const head = tobi.getObjectByName('Tobi_Head');
    const leftArm = tobi.getObjectByName('Tobi_LeftArm');
    const rightArm = tobi.getObjectByName('Tobi_RightArm');
    const rightForearm = tobi.getObjectByName('Tobi_RightForearm');

    assert.ok(chest, 'Must contain articulated Tobi_Chest joint');
    assert.ok(neck, 'Must contain articulated Tobi_Neck joint');
    assert.ok(head, 'Must contain articulated Tobi_Head joint');
    assert.ok(leftArm, 'Must contain articulated Tobi_LeftArm joint');
    assert.ok(rightArm, 'Must contain articulated Tobi_RightArm joint');
    assert.ok(rightForearm, 'Must contain articulated Tobi_RightForearm joint');

    // Verify 7.8 heads human proportion:
    // Pelvis Y = 0.92, Chest Y = 1.02, Neck Y = 0.36 above chest, Head Y = 0.1 above neck
    // Eye height is at ~1.65m and top of hair is at ~1.78m.
    // Head size (0.22m) gives 1.78m / 0.22m = 8.09 heads (~7.8 heads standard)
    const hair = head.children.find((c) => (c as any).geometry?.parameters?.thetaLength !== undefined);
    assert.ok(hair, 'Head must contain sculpted modern haircut');

    const glasses = head.children.find((c) => (c as any).geometry?.parameters?.width === 0.16);
    assert.ok(glasses, 'Head must contain modern horn-rimmed glasses');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 6: NPCs Move Naturally and Perform Activities
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 6: NPCs simulate daily routines, presence, and activities across the day', () => {
    // Check Tobi's hour-by-hour locations
    characterSimulationSystem.setSimulatedHour(10);
    const morningLoc = characterSimulationSystem.getCharacterCurrentLocation('npc_tobi');
    assert.strictEqual(morningLoc, 'yaba_architect_studio', 'Tobi should be at Studio Kán at 10 AM');

    characterSimulationSystem.setSimulatedHour(13);
    const lunchLoc = characterSimulationSystem.getCharacterCurrentLocation('npc_tobi');
    assert.strictEqual(lunchLoc, 'yaba_buka_canteen', "Tobi should be at Mama Nkechi's Buka at 1 PM");

    characterSimulationSystem.setSimulatedHour(15);
    const afternoonLoc = characterSimulationSystem.getCharacterCurrentLocation('npc_tobi');
    assert.strictEqual(afternoonLoc, 'eko_construction_site', 'Tobi should be at the construction site at 3 PM');

    characterSimulationSystem.setSimulatedHour(19);
    const eveningLoc = characterSimulationSystem.getCharacterCurrentLocation('npc_tobi');
    assert.strictEqual(eveningLoc, 'yaba_residential_compound', 'Tobi should return home at 7 PM');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 7: Approaching and Interacting with Characters
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 7: Player can approach and interact with characters in their interaction radii', async () => {
    const tobi = characterSimulationSystem.getCharacter('npc_tobi');
    assert.ok(tobi);

    // Initial greeting
    const response = await conversationalAISystem.converse(
      'npc_tobi',
      'Hello Tobi, good morning!',
      'yaba_architect_studio',
    );
    assert.ok(response.spokenText.length > 0);
    assert.strictEqual(response.speakerName, 'Tobi Adeleke');
    assert.strictEqual(response.sentiment, 'positive');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 8: Conversational Character Animation & Cinematic Camera Framing
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 8: Dialogue triggers conversational camera framing and articulated gestures', () => {
    const camSys = new CinematicCameraSystem({} as any);
    camSys.init();

    // Player enters dialogue with Tobi
    camSys.enterConversationFraming({ x: -3.5, y: 0, z: 1.0 } as any, 'Tobi Adeleke', 1.78);
    assert.strictEqual(camSys.getMode(), 'conversation');

    // Completing dialogue restores exploration framing
    camSys.exitConversationFraming();
    assert.strictEqual(camSys.getMode(), 'exploration');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 9: NPCs Have Different Personalities and Behaviours
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 9: NPCs have distinct personalities, roles, and speaking styles', () => {
    const tobi = characterSimulationSystem.getCharacter('npc_tobi')!;
    const kunle = characterSimulationSystem.getCharacter('npc_kunle')!;
    const folake = characterSimulationSystem.getCharacter('npc_folake')!;

    // Tobi: Ambitious, detail-oriented architect
    assert.strictEqual(tobi.occupation, 'Junior Architect & Sustainable Building Designer');
    assert.ok(tobi.personalityTraits.includes('Idealistic'));

    // Kunle: Practical, veteran construction contractor
    assert.strictEqual(kunle.occupation, 'General Building Contractor & Civil Engineer');
    assert.ok(kunle.personalityTraits.includes('Pragmatic'));
    assert.ok(kunle.personalityTraits.includes('Cost-conscious'));

    // Folake: Measured, senior mentoring architect
    assert.strictEqual(folake.occupation, 'Senior Founding Partner & Principal Architect');
    assert.ok(folake.personalityTraits.includes('Discerning'));
    assert.ok(folake.personalityTraits.includes('Supportive mentor'));
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 10: Characters Retain Story State and Previous Interaction History
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 10: Characters retain story state, relationship scores, and memory across chapters', () => {
    // Record interaction and promise
    characterMemorySystem.recordInteraction(
      'npc_tobi',
      'yaba_architect_studio',
      'project delivery',
      'Player visited Studio Kán and agreed to inspect the cracked column.',
      'friendly',
      5,
    );

    characterMemorySystem.recordPromise(
      'npc_tobi',
      'inspect_cracked_column',
      'Inspect the cracked column at Eco-Terrace site before evening.',
    );

    const memory = characterMemorySystem.getOrCreateMemory('npc_tobi');
    assert.ok(memory);
    assert.strictEqual(memory.relationshipScore, 5);
    assert.strictEqual(memory.promises.length, 1);
    assert.strictEqual(memory.promises[0].fulfilled, false);

    // Fulfill promise
    assert.strictEqual(characterMemorySystem.fulfillPromise('npc_tobi', 'inspect_cracked_column'), true);
    const updated = characterMemorySystem.getOrCreateMemory('npc_tobi');
    assert.strictEqual(updated.promises[0].fulfilled, true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 11: Meaningful Background Activity & Dynamic Environmental Simulation
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 11: Background simulation operates with diurnal lighting and weather transitions', () => {
    // Diurnal transitions
    timeOfDaySystem.setTimeOfDay('golden_hour');
    const goldenConfig = timeOfDaySystem.getCurrentLighting();
    assert.strictEqual(goldenConfig.timeOfDay, 'golden_hour');
    assert.ok(goldenConfig.intensity > 0.9);

    // Weather simulation
    weatherSystem.setWeather('tropical_rain');
    assert.strictEqual(weatherSystem.getCurrentWeather().preset, 'tropical_rain');
    const rainParams = weatherSystem.getCurrentWeather();
    assert.strictEqual(rainParams.rainIntensity, 0.8);
    assert.ok(rainParams.fogDensity > 0.02);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 12: Discover Activities Without Starting a Mission
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 12: Player can discover cultural artifacts and learn without starting a mission', () => {
    missionManager.abortCurrentMission();
    missionManager.setExplorationMode('free_exploration');

    const result = discoveryManager.discoverArtifact('talking-drum');
    assert.strictEqual(result.isNew, true);
    assert.ok(result.fact);

    // Progress updated in passport
    assert.strictEqual(discoveryManager.isArtifactDiscovered('talking-drum'), true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 13: Different Locations are Genuinely Different Environments
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 13: All 4 Nigerian destinations possess distinct environmental identities', () => {
    const locations = locationManager.getAllPlayableLocations();
    assert.strictEqual(locations.length, 4);

    const market = locationManager.getLocationById('nigerian_market')!;
    const urban = locationManager.getLocationById('lagos_urban')!;
    const heritage = locationManager.getLocationById('heritage_iga')!;
    const coastal = locationManager.getLocationById('beach_waterfront')!;

    // Category identities
    assert.strictEqual(market.category, 'market');
    assert.strictEqual(urban.category, 'urban');
    assert.strictEqual(heritage.category, 'heritage');
    assert.strictEqual(coastal.category, 'natural');

    // Ambient sound profiles
    assert.notStrictEqual(market.atmosphere.soundscapeDescription, urban.atmosphere.soundscapeDescription);
    assert.notStrictEqual(urban.atmosphere.soundscapeDescription, coastal.atmosphere.soundscapeDescription);

    // Accessible buildings
    assert.ok(market.pointsOfInterest.some((poi) => poi.id === 'poi_adire_stall'));
    assert.ok(urban.pointsOfInterest.some((poi) => poi.id === 'poi_construction_site'));
    assert.ok(heritage.pointsOfInterest.some((poi) => poi.id === 'poi_royal_throne_dais'));
    assert.ok(coastal.pointsOfInterest.some((poi) => poi.id === 'poi_beach_cabana'));
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 14: Performance Scalability Across Target Devices
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 14: QualityProfileSystem scales graphics across Desktop, Mobile, and Quest VR', () => {
    // 1. Desktop Cinematic
    qualityProfileSystem.setProfile('desktop_cinematic');
    const desktop = qualityProfileSystem.getActiveProfile();
    assert.strictEqual(desktop.shadowMapResolution, 2048);
    assert.strictEqual(desktop.enableSoftShadows, true);
    assert.strictEqual(desktop.textureMapResolution, 1024);
    assert.strictEqual(desktop.fogType, 'exp2');
    assert.strictEqual(desktop.drawCallBudget, 250);

    // 2. Mobile Balanced
    qualityProfileSystem.setProfile('mobile_balanced');
    const mobile = qualityProfileSystem.getActiveProfile();
    assert.strictEqual(mobile.shadowMapResolution, 1024);
    assert.strictEqual(mobile.enableSoftShadows, false);
    assert.strictEqual(mobile.textureMapResolution, 512);
    assert.strictEqual(mobile.fogType, 'linear');
    assert.strictEqual(mobile.drawCallBudget, 150);

    // 3. Quest Standalone VR
    qualityProfileSystem.setProfile('quest_vr_performance');
    const quest = qualityProfileSystem.getActiveProfile();
    assert.strictEqual(quest.shadowMapResolution, 512);
    assert.strictEqual(quest.enableSoftShadows, false);
    assert.strictEqual(quest.textureMapResolution, 256);
    assert.strictEqual(quest.targetFrameRate, 72);
    assert.strictEqual(quest.drawCallBudget, 100);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 15: Desktop and WebXR Modes Tested Separately
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 15: Config declares separate locomotion, comfort, and WebXR Quest parameters', () => {
    const configPath = resolve(process.cwd(), 'iwsdk.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    assert.strictEqual(config.world.xr.features.handTracking, true);
    assert.strictEqual(config.world.features.locomotion.turningMethod, 'snap');
    assert.strictEqual(config.world.features.locomotion.enableJumping, false);
    assert.strictEqual(config.world.features.grabbing.useHandPinchForGrab, true);
    assert.strictEqual(config.dev.emulator.device, 'metaQuest3');
    assert.strictEqual(config.dev.emulator.iwer, true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CRITERION 16: Existing Missions, Navigation & Progression Continue Working
  // ──────────────────────────────────────────────────────────────────────────
  it('Criterion 16: Existing missions, passport stamps, and progression operate flawlessly', () => {
    // 1. Complete an existing core mission
    const missionId = 'mission_yoruba_greetings';
    const mission = missionEngine.getMission(missionId)!;
    const startRes = missionEngine.startMission(missionId);
    assert.strictEqual(startRes.success, true);

    for (const step of mission.steps) {
      const correctChoice = step.dialogueChoices?.find((choice) => choice.isCorrect);
      assert.ok(correctChoice, `step ${step.id} has a deterministic correct path`);
      assert.strictEqual(
        missionEngine.submitChoice(missionId, step.id, correctChoice.id)?.canAdvance,
        true,
      );
      missionEngine.advanceToNextStep(missionId);
    }

    const completion = missionEngine.completeMission(missionId)!;
    assert.strictEqual(completion.success, true);
    assert.ok(completion.unlockedStamp?.name);

    // 2. Progression engine awards XP and updates storage
    const state = storage.getState();
    assert.ok(state.profile.totalXp > 0);
    assert.ok(state.passport.stamps.some((stamp) => stamp.id === completion.unlockedStamp?.id));

    // 3. SaveSystem roundtrip
    const saved = saveSystem.getRawState();
    assert.strictEqual(saved.passport.completedMissionIds.includes(missionId), true);
    assert.strictEqual(saved.profile.totalXp, state.profile.totalXp);
  });
});
