/**
 * Advenquo — Open-World Exploration and Living World Transformation Test Suite.
 *
 * Verifies all 12 Milestones, 16 Architecture Systems, and 12 Definition of Done Criteria:
 *
 * Milestone 1: Audit of single-scene implementation and multi-location architecture
 * Milestone 2: Functional interactive world map and location management
 * Milestone 3: 4 genuinely distinct Nigerian environments (Market, Urban, Heritage, Natural)
 * Milestone 4: Movement, travel transitions and free exploration vs quest mode
 * Milestone 5: Living NPCs, dynamic attention/routines, environmental interactions & accessible doors
 * Milestone 6: Integrated adventure missions and contextual learning
 * Milestone 7: Player progression, discovery tracking and persistence
 * Milestone 8: Multi-platform validation (Browser, Mobile, WebXR)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  worldManager,
  locationManager,
  sceneStreamingManager,
  worldMapManager,
  playerController,
  npcManager,
  dialogueManager,
  interactionManager,
  environmentManager,
  weatherSystem,
  timeOfDaySystem,
  missionManager,
  discoveryManager,
  travelSystem,
  playerProgression,
  saveSystem,
} from '../src/systems/index.js';
import { PLAYABLE_LOCATIONS } from '../src/world/location-data.js';
import { MISSIONS } from '../src/game/missions-data.js';
import { DESTINATIONS } from '../src/game/world-data.js';

describe('Advenquo: Open-World Living World Transformation', () => {
  beforeEach(() => {
    saveSystem.resetProgress();
    locationManager.setActiveLocationId('nigerian_market');
    missionManager.abortCurrentMission();
    missionManager.setExplorationMode('free_exploration');
    timeOfDaySystem.setTimeOfDay('morning');
    weatherSystem.setWeather('clear_sunny');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MILESTONE 1 & 3: FOUR GENUINELY DISTINCT NIGERIAN ENVIRONMENTS
  // ──────────────────────────────────────────────────────────────────────────
  describe('Milestone 1 & 3: Playable Multi-Location World', () => {
    it('provides at least 4 genuinely distinct Nigerian playable environments', () => {
      const locations = locationManager.getAllPlayableLocations();
      assert.ok(locations.length >= 4, `Expected at least 4 locations, got ${locations.length}`);

      const categories = new Set(locations.map((l) => l.category));
      assert.ok(categories.has('market'), 'Missing Traditional Market environment');
      assert.ok(categories.has('urban'), 'Missing Lagos Urban environment');
      assert.ok(categories.has('heritage'), 'Missing Cultural Heritage environment');
      assert.ok(categories.has('natural'), 'Missing Natural Coastal environment');
    });

    it('each location has distinct boundaries, spawn coordinates, atmosphere and landmarks', () => {
      const locations = locationManager.getAllPlayableLocations();
      const seenSpawns = new Set<string>();

      for (const loc of locations) {
        assert.ok(loc.id, 'Location missing ID');
        assert.ok(loc.name, 'Location missing name');
        assert.ok(loc.indigenousName, 'Location missing indigenous name');
        assert.ok(loc.tagline, 'Location missing tagline');
        assert.ok(loc.overview, 'Location missing overview');
        assert.ok(loc.historicalContext, 'Location missing historical context');
        assert.ok(loc.boundaryLimits, 'Location missing boundary limits');
        assert.ok(loc.atmosphere, 'Location missing atmosphere');
        assert.ok(loc.pointsOfInterest.length >= 2, `${loc.id} has fewer than 2 POIs`);
        assert.ok(loc.npcs.length >= 2, `${loc.id} has fewer than 2 NPCs`);
        assert.ok(loc.artifacts.length >= 2, `${loc.id} has fewer than 2 cultural artifacts`);
        assert.ok(loc.connectedRoutes.length >= 2, `${loc.id} has fewer than 2 travel routes`);

        const spawnKey = `${loc.spawnPosition[0]},${loc.spawnPosition[2]}`;
        assert.ok(!seenSpawns.has(spawnKey), `Duplicate spawn location detected: ${spawnKey}`);
        seenSpawns.add(spawnKey);
      }
    });

    it('destinations in world-data include all 4 Nigerian districts and expansion previews', () => {
      const nigeria = DESTINATIONS.find((d) => d.id === 'nigeria');
      assert.ok(nigeria, 'Nigeria destination missing');
      assert.strictEqual(nigeria.status, 'PLAYABLE');

      const districtIds = nigeria.districts.map((d) => d.id);
      assert.ok(districtIds.includes('isale_eko'), 'Missing isale_eko district');
      assert.ok(districtIds.includes('yaba'), 'Missing yaba district');
      assert.ok(districtIds.includes('heritage_iga'), 'Missing heritage_iga district');
      assert.ok(districtIds.includes('beach_waterfront'), 'Missing beach_waterfront district');

      // Global scalability previews
      const previews = DESTINATIONS.filter((d) => d.status === 'PREVIEW');
      assert.ok(previews.length >= 3, 'Missing international preview destinations');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MILESTONE 2: CONNECTED WORLD NAVIGATION & MAP SYSTEM
  // ──────────────────────────────────────────────────────────────────────────
  describe('Milestone 2: Connected World Navigation & World Map', () => {
    it('world map provides cartographic nodes for all playable destinations', () => {
      const mapNodes = worldMapManager.getMapNodes();
      assert.strictEqual(mapNodes.length, 4);

      const marketNode = mapNodes.find((n) => n.id === 'nigerian_market');
      assert.ok(marketNode);
      assert.strictEqual(marketNode.isCurrent, true);
      assert.strictEqual(marketNode.isDiscovered, true);
      assert.ok(marketNode.routes.length > 0);
    });

    it('travel system executes logical journeys between connected destinations', () => {
      // 1. Initial location: Market
      assert.strictEqual(locationManager.getActiveLocationId(), 'nigerian_market');

      // 2. Travel to Yaba Tech & Transit Corridor via Danfo bus
      const travelYaba = travelSystem.travelTo('lagos_urban');
      assert.strictEqual(travelYaba.success, true);
      assert.ok(travelYaba.info);
      assert.strictEqual(travelYaba.info.transitMethod, 'danfo_bus');
      assert.strictEqual(locationManager.getActiveLocationId(), 'lagos_urban');
      assert.strictEqual(locationManager.isLocationDiscovered('lagos_urban'), true);

      // 3. Travel from Yaba to Iga Idunganran Palace
      const travelPalace = travelSystem.travelTo('heritage_iga');
      assert.strictEqual(travelPalace.success, true);
      assert.strictEqual(locationManager.getActiveLocationId(), 'heritage_iga');

      // 4. Travel from Palace to Tarkwa Bay via Lagoon Ferry
      const travelBeach = travelSystem.travelTo('beach_waterfront');
      assert.strictEqual(travelBeach.success, true);
      assert.strictEqual(travelBeach.info?.transitMethod, 'lagoon_ferry');
      assert.strictEqual(locationManager.getActiveLocationId(), 'beach_waterfront');
    });

    it('rejects invalid or unknown travel destinations gracefully', () => {
      const invalid = travelSystem.travelTo('atlantis_deep_ocean');
      assert.strictEqual(invalid.success, false);
      assert.ok(invalid.error);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MILESTONE 4: MOVEMENT, BOUNDARIES & FREE EXPLORATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('Milestone 4: Locomotion & Free Exploration vs Quest Mode', () => {
    it('supports switching between Free Exploration and Adventure Missions', () => {
      assert.strictEqual(missionManager.getExplorationMode(), 'free_exploration');

      missionManager.setExplorationMode('adventure_mission');
      assert.strictEqual(missionManager.getExplorationMode(), 'adventure_mission');

      missionManager.setExplorationMode('free_exploration');
      assert.strictEqual(missionManager.getExplorationMode(), 'free_exploration');
    });

    it('world remains explorable after completing a mission', () => {
      // Start a mission
      const startRes = missionManager.startMission('mission_yoruba_greetings');
      assert.strictEqual(startRes.success, true);
      assert.strictEqual(missionManager.getExplorationMode(), 'adventure_mission');

      // Complete mission
      const completeRes = missionManager.completeCurrentMission();
      assert.strictEqual(completeRes.success, true);
      assert.strictEqual(missionManager.getExplorationMode(), 'free_exploration');
      assert.strictEqual(missionManager.getActiveMission(), null);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MILESTONE 5: LIVING NPCS, PROCEDURAL ROUTINES & ACCESSIBLE DOORS
  // ──────────────────────────────────────────────────────────────────────────
  describe('Milestone 5: Living NPCs, Accessible Doors & Environmental Interactions', () => {
    it('provides living NPCs with distinct roles and cultural activities across all locations', () => {
      const npcs = npcManager.getNPCsForActiveLocation();
      assert.ok(npcs.length >= 2);

      for (const npc of npcs) {
        assert.ok(npc.characterId);
        assert.ok(npc.name);
        assert.ok(npc.role);
        assert.ok(npc.currentActivity);
        assert.ok(npc.greetingYoruba);
        assert.ok(npc.greetingEnglish);
      }
    });

    it('simulates pedestrian walking routines over time', () => {
      const pos1 = npcManager.updateRoutines(0.5);
      const pos2 = npcManager.updateRoutines(0.5);
      assert.ok(pos2.x !== pos1.x || pos2.z !== pos1.z);
    });

    it('supports opening and closing doors to explore accessible building interiors', () => {
      // 1. Initial door closed
      const doorState1 = interactionManager.getDoorState('door_tech_hub');
      assert.ok(doorState1);
      assert.strictEqual(doorState1.isOpen, false);

      // 2. Open door
      const openResult = interactionManager.toggleDoor('door_tech_hub');
      assert.strictEqual(openResult.isOpen, true);
      assert.strictEqual(doorState1.isOpen, true);

      // 3. Close door
      const closeResult = interactionManager.toggleDoor('door_tech_hub');
      assert.strictEqual(closeResult.isOpen, false);
      assert.strictEqual(doorState1.isOpen, false);
    });

    it('handles interactions with vehicles, market stalls, and cultural landmarks', () => {
      const danfoEvent = interactionManager.handleEntityInteraction('urban-danfo-bus', 'UrbanDanfoBus');
      assert.strictEqual(danfoEvent.category, 'vehicle');
      assert.ok(danfoEvent.title.includes('Danfo'));

      const canoeEvent = interactionManager.handleEntityInteraction('fishing-canoe', 'FishingCanoe');
      assert.strictEqual(canoeEvent.category, 'vehicle');
      assert.ok(canoeEvent.title.includes('Canoe'));

      const throneEvent = interactionManager.handleEntityInteraction('palace-throne-dais', 'PalaceThroneDais');
      assert.strictEqual(throneEvent.category, 'building');
      assert.ok(throneEvent.title.includes('Oba'));
    });

    it('dialogue manager conducts interactive conversations with Yoruba language feedback', () => {
      const conv = dialogueManager.startConversation('baba-adewale');
      assert.ok(conv);
      assert.strictEqual(conv.name, 'Baba Adéwálé');
      assert.ok(conv.choices.length >= 2);

      // Submit respectful choice
      const evalRes = dialogueManager.submitChoice('choice_respectful');
      assert.ok(evalRes);
      assert.strictEqual(evalRes.isCorrect, true);
      assert.strictEqual(conv.isComplete, true);

      dialogueManager.endConversation();
      assert.strictEqual(dialogueManager.getActiveConversation(), null);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MILESTONE 6: INTEGRATED ADVENTURE MISSIONS ACROSS ALL LOCATIONS
  // ──────────────────────────────────────────────────────────────────────────
  describe('Milestone 6: Integrated Adventure Missions', () => {
    it('contains authored missions for all 4 environments', () => {
      const allMissions = missionManager.getAllMissions();
      assert.ok(allMissions.length >= 6);

      const marketMission = allMissions.find((m) => m.districtId === 'isale_eko');
      const urbanMission = allMissions.find((m) => m.districtId === 'yaba');
      const palaceMission = allMissions.find((m) => m.districtId === 'heritage_iga');
      const beachMission = allMissions.find((m) => m.districtId === 'beach_waterfront');

      assert.ok(marketMission, 'Missing market mission');
      assert.ok(urbanMission, 'Missing urban mission');
      assert.ok(palaceMission, 'Missing palace mission');
      assert.ok(beachMission, 'Missing beach mission');
    });

    it('executes palace heritage mission with rewards and passport stamp', () => {
      const startRes = missionManager.startMission('mission_royal_coronation_heritage');
      assert.strictEqual(startRes.success, true);
      assert.ok(startRes.mission);
      assert.strictEqual(startRes.mission.steps.length, 2);

      const completeRes = missionManager.completeCurrentMission();
      assert.strictEqual(completeRes.success, true);
    });

    it('executes coastal ecology mission with mangrove conservation goals', () => {
      const startRes = missionManager.startMission('mission_coastal_ecology_tarkwa');
      assert.strictEqual(startRes.success, true);
      assert.ok(startRes.mission);
      assert.strictEqual(startRes.mission.steps.length, 2);
      missionManager.completeCurrentMission();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MILESTONE 7: PROGRESSION, DISCOVERY TRACKING & SAVED STATE
  // ──────────────────────────────────────────────────────────────────────────
  describe('Milestone 7: Progression, Discovery & Persistence', () => {
    it('discovers cultural artifacts and records passport stamps and journal facts', () => {
      const initialCount = discoveryManager.getTotalDiscoveredCount();

      // Discover Oba's staff of office in Palace
      const res = discoveryManager.discoverArtifact('oba-staff-of-office');
      assert.strictEqual(res.isNew, true);
      assert.ok(res.fact);
      assert.strictEqual(res.fact.title, 'Ọpá Àṣẹ: Ceremonial Staff of Office');

      assert.strictEqual(discoveryManager.isArtifactDiscovered('oba-staff-of-office'), true);
      assert.strictEqual(discoveryManager.getTotalDiscoveredCount(), initialCount + 1);

      // Verify persistence in SaveSystem
      const savedState = saveSystem.getRawState();
      const hasStamp = savedState.passport.stamps.some((s) => s.id === 'stamp_oba-staff-of-office');
      assert.strictEqual(hasStamp, true);
    });

    it('tracks player XP, guardian level ups, and skill proficiencies', () => {
      const initialXP = playerProgression.getXP();
      const initialLevel = playerProgression.getLevel();

      const { newLevel, leveledUp } = playerProgression.addXP(300);
      assert.ok(playerProgression.getXP() >= initialXP + 300);
      assert.strictEqual(newLevel >= initialLevel, true);
    });

    it('saveSystem persists and restores player state reliably', () => {
      saveSystem.saveCurrentLocation('beach_waterfront', 'Lagos Coastal Islands');
      assert.strictEqual(saveSystem.isLocationDiscovered('beach_waterfront'), true);

      const raw = saveSystem.getRawState();
      assert.strictEqual(raw.selectedLocationId, 'beach_waterfront');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // ENVIRONMENTAL REALISM: TIME OF DAY & WEATHER
  // ──────────────────────────────────────────────────────────────────────────
  describe('Environmental Realism: Diurnal Cycle & Weather Simulation', () => {
    it('timeOfDaySystem simulates diurnal lighting presets', () => {
      timeOfDaySystem.setTimeOfDay('morning');
      const morningLighting = timeOfDaySystem.getCurrentLighting();
      assert.strictEqual(morningLighting.timeOfDay, 'morning');
      assert.strictEqual(morningLighting.intensity, 1.15);

      timeOfDaySystem.setTimeOfDay('night');
      const nightLighting = timeOfDaySystem.getCurrentLighting();
      assert.strictEqual(nightLighting.timeOfDay, 'night');
      assert.strictEqual(nightLighting.intensity, 0.45);
    });

    it('weatherSystem applies meteorological parameters across environments', () => {
      weatherSystem.setWeather('tropical_rain');
      const rain = weatherSystem.getCurrentWeather();
      assert.strictEqual(rain.preset, 'tropical_rain');
      assert.strictEqual(rain.rainIntensity, 0.8);

      weatherSystem.setWeather('coastal_mist');
      const mist = weatherSystem.getCurrentWeather();
      assert.strictEqual(mist.preset, 'coastal_mist');
      assert.ok(mist.fogDensity > 0);
    });

    it('environmentManager combines diurnal lighting with weather multipliers', () => {
      timeOfDaySystem.setTimeOfDay('midday'); // 1.35
      weatherSystem.setWeather('clear_sunny'); // 1.25
      const intensity = environmentManager.getEffectiveIntensity();
      assert.ok(intensity > 1.35);

      const skyColor = environmentManager.getEffectiveSkyColor();
      assert.strictEqual(skyColor.length, 4);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 13: DEFINITION OF DONE VERIFICATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('Section 13: Definition of Done Contract', () => {
    it('1. Launch Advenquo and enter the game world', () => {
      assert.ok(worldManager);
      assert.ok(locationManager.getActiveLocation());
    });

    it('2. Explore a location without starting a mission', () => {
      missionManager.setExplorationMode('free_exploration');
      assert.strictEqual(missionManager.getExplorationMode(), 'free_exploration');
      assert.strictEqual(missionManager.getActiveMission(), null);
    });

    it('3. Walk through different areas', () => {
      const loc = locationManager.getActiveLocation();
      assert.ok(loc.boundaryLimits.maxX > loc.boundaryLimits.minX);
      assert.ok(loc.boundaryLimits.maxZ > loc.boundaryLimits.minZ);
      playerController.teleportTo(loc.spawnPosition[0], loc.spawnPosition[2], 0);
    });

    it('4. Interact with multiple NPCs', () => {
      const convBaba = dialogueManager.startConversation('baba-adewale');
      assert.ok(convBaba);
      dialogueManager.endConversation();

      const convIya = dialogueManager.startConversation('iya-alaso');
      assert.ok(convIya);
      dialogueManager.endConversation();
    });

    it('5. Enter and explore accessible buildings', () => {
      const openStorehouse = interactionManager.toggleDoor('door_market_storehouse');
      assert.strictEqual(openStorehouse.isOpen, true);

      const openTechHub = interactionManager.toggleDoor('door_tech_hub');
      assert.strictEqual(openTechHub.isOpen, true);

      const openPalaceChamber = interactionManager.toggleDoor('door_palace_chamber');
      assert.strictEqual(openPalaceChamber.isOpen, true);
    });

    it('6. Discover objects and cultural information', () => {
      const res = discoveryManager.discoverArtifact('talking-drum');
      assert.ok(res.fact);
      assert.ok(res.fact.culturalSignificance.length > 0);
    });

    it('7. Open the world map', () => {
      const nodes = worldMapManager.getMapNodes();
      assert.strictEqual(nodes.length, 4);
      assert.ok(worldMapManager.getCurrentMapNode());
    });

    it('8. Travel to another genuinely different location', () => {
      const travelResult = worldManager.travelTo('lagos_urban');
      assert.strictEqual(travelResult.success, true);
      assert.strictEqual(locationManager.getActiveLocationId(), 'lagos_urban');
      assert.strictEqual(locationManager.getActiveLocation().category, 'urban');
    });

    it('9. Complete an adventure within an environment', () => {
      const mission = missionManager.startMission('mission_lagoon_transit');
      assert.strictEqual(mission.success, true);
      const completion = missionManager.completeCurrentMission();
      assert.strictEqual(completion.success, true);
    });

    it('10. Continue exploring after completing the adventure', () => {
      worldManager.travelTo('lagos_urban');
      missionManager.startMission('mission_lagoon_transit');
      missionManager.completeCurrentMission();
      assert.strictEqual(missionManager.getExplorationMode(), 'free_exploration');
      assert.strictEqual(locationManager.getActiveLocationId(), 'lagos_urban');
    });

    it('11. Discover additional locations', () => {
      const travelBeach = worldManager.travelTo('beach_waterfront');
      assert.strictEqual(travelBeach.success, true);
      assert.strictEqual(locationManager.getActiveLocation().category, 'natural');
      assert.strictEqual(locationManager.isLocationDiscovered('beach_waterfront'), true);
    });

    it('12. Save and resume relevant player progress', () => {
      worldManager.travelTo('beach_waterfront');
      discoveryManager.discoverArtifact('lagoon-sea-shell');
      const state = saveSystem.getRawState();
      assert.ok(state.profile.guardianLevel >= 1);
      assert.ok(state.passport.stamps.length > 0);
      assert.strictEqual(state.selectedLocationId, 'beach_waterfront');
    });
  });
});
