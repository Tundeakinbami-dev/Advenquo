/**
 * Advenquo — WorldManager.
 *
 * Master Open-World Orchestrator fulfilling the complete Advenquo living world architecture.
 * Unifies and coordinates all 15 domain managers:
 * - LocationManager
 * - SceneStreamingManager
 * - WorldMapManager
 * - PlayerController
 * - NPCManager
 * - DialogueManager
 * - InteractionManager
 * - EnvironmentManager
 * - WeatherSystem
 * - TimeOfDaySystem
 * - MissionManager
 * - DiscoveryManager
 * - TravelSystem
 * - PlayerProgression
 * - SaveSystem
 */

import { locationManager, LocationManager } from './location-manager.js';
import { sceneStreamingManager, SceneStreamingManager } from './scene-streaming-manager.js';
import { worldMapManager, WorldMapManager } from './world-map-manager.js';
import { playerController, PlayerController } from './player-controller.js';
import { npcManager, NPCManager } from './npc-manager.js';
import { dialogueManager, DialogueManager } from './dialogue-manager.js';
import { interactionManager, InteractionManager } from './interaction-manager.js';
import { environmentManager, EnvironmentManager } from './environment-manager.js';
import { weatherSystem, WeatherSystem } from './weather-system.js';
import { timeOfDaySystem, TimeOfDaySystem } from './time-of-day-system.js';
import { missionManager, MissionManager } from './mission-manager.js';
import { discoveryManager, DiscoveryManager } from './discovery-manager.js';
import { travelSystem, TravelSystem } from './travel-system.js';
import { playerProgression, PlayerProgression } from './player-progression.js';
import { saveSystem, SaveSystem } from './save-system.js';

import { characterMemorySystem, CharacterMemorySystem } from './character-memory-system.js';
import { characterSimulationSystem, CharacterSimulationSystem } from './character-simulation-system.js';
import { storyEngine, StoryEngine } from './story-engine.js';
import { conversationalAISystem, ConversationalAISystem } from './conversational-ai-system.js';
import { playerJournalSystem, PlayerJournalSystem } from './player-journal-system.js';

export class WorldManager {
  private static instance: WorldManager | null = null;

  public readonly locations: LocationManager;
  public readonly streaming: SceneStreamingManager;
  public readonly map: WorldMapManager;
  public readonly player: PlayerController;
  public readonly npcs: NPCManager;
  public readonly dialogue: DialogueManager;
  public readonly interactions: InteractionManager;
  public readonly environment: EnvironmentManager;
  public readonly weather: WeatherSystem;
  public readonly time: TimeOfDaySystem;
  public readonly missions: MissionManager;
  public readonly discoveries: DiscoveryManager;
  public readonly travel: TravelSystem;
  public readonly progression: PlayerProgression;
  public readonly save: SaveSystem;

  // Living World, Persistent Character Simulation & Story Systems
  public readonly characterMemory: CharacterMemorySystem;
  public readonly characterSim: CharacterSimulationSystem;
  public readonly stories: StoryEngine;
  public readonly conversationalAI: ConversationalAISystem;
  public readonly journal: PlayerJournalSystem;

  public static getInstance(): WorldManager {
    if (!WorldManager.instance) {
      WorldManager.instance = new WorldManager();
    }
    return WorldManager.instance;
  }

  constructor() {
    this.locations = locationManager;
    this.streaming = sceneStreamingManager;
    this.map = worldMapManager;
    this.player = playerController;
    this.npcs = npcManager;
    this.dialogue = dialogueManager;
    this.interactions = interactionManager;
    this.environment = environmentManager;
    this.weather = weatherSystem;
    this.time = timeOfDaySystem;
    this.missions = missionManager;
    this.discoveries = discoveryManager;
    this.travel = travelSystem;
    this.progression = playerProgression;
    this.save = saveSystem;

    this.characterMemory = characterMemorySystem;
    this.characterSim = characterSimulationSystem;
    this.stories = storyEngine;
    this.conversationalAI = conversationalAISystem;
    this.journal = playerJournalSystem;

    // Connect location change with environment atmosphere setup
    this.locations.onLocationChange((loc) => {
      this.environment.setLocationAtmosphere(loc);
    });

    if (typeof window !== 'undefined') {
      (window as any).__advenquoWorldManager = this;
    }
  }

  /**
   * High-level open-world travel across any of the 4 playable environments.
   */
  public travelTo(targetLocationId: string, customRouteName?: string) {
    const outcome = this.travel.travelTo(targetLocationId, customRouteName);
    if (outcome.success) {
      this.streaming.streamToLocation(targetLocationId, customRouteName);
    }
    return outcome;
  }
}

export const worldManager = WorldManager.getInstance();
