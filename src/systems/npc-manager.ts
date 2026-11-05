/**
 * Advenquo — NPCManager.
 *
 * Coordinates living world non-player characters across all environments:
 * - Roles: Traders, Residents, Guides, Artisans, Drivers, Students, Visitors
 * - Idle breathing oscillations and dynamic spatial attention
 * - Pedestrian walking waypoints and movement routines
 * - Location-specific cultural greetings and knowledge responses
 */

import { locationManager, LocationManager } from './location-manager.js';
import type { LocationNPCDef } from '../world/location-types.js';

export interface LivingNPCState {
  characterId: string;
  name: string;
  role: string;
  locationId: string;
  position: [number, number, number];
  rotationY: number;
  greetingYoruba: string;
  greetingEnglish: string;
  isAttentionActive: boolean;
  currentActivity: string;
}

export class NPCManager {
  private static instance: NPCManager | null = null;
  private locManager: LocationManager;
  private npcStates: Map<string, LivingNPCState> = new Map();

  // Pedestrian waypoint walk routine state
  private pedestrianWalkProgress = 0;
  private pedestrianDirection = 1;

  public static getInstance(): NPCManager {
    if (!NPCManager.instance) {
      NPCManager.instance = new NPCManager();
    }
    return NPCManager.instance;
  }

  constructor() {
    this.locManager = locationManager;
    this._initializeNPCStates();
  }

  private _initializeNPCStates(): void {
    const allLocations = this.locManager.getAllPlayableLocations();
    for (const loc of allLocations) {
      for (const npc of loc.npcs) {
        this.npcStates.set(npc.characterId, {
          characterId: npc.characterId,
          name: npc.name,
          role: npc.role,
          locationId: loc.id,
          position: npc.position,
          rotationY: npc.rotationY,
          greetingYoruba: npc.greetingYoruba,
          greetingEnglish: npc.greetingEnglish,
          isAttentionActive: false,
          currentActivity: this._getDefaultActivityForRole(npc.role),
        });
      }
    }
  }

  private _getDefaultActivityForRole(role: string): string {
    if (role.includes('Trader') || role.includes('Artisan')) {
      return 'Arranging handcrafted textiles and greeting market visitors.';
    } else if (role.includes('Elder')) {
      return 'Observing courtyard arrivals and counseling youth.';
    } else if (role.includes('Driver')) {
      return 'Checking engine fluids and announcing CMS Danfo transit stops.';
    } else if (role.includes('Software') || role.includes('Tech')) {
      return 'Reviewing sensor telemetry logs on digital tablet.';
    } else if (role.includes('Historian') || role.includes('Prime Minister')) {
      return 'Maintaining oral genealogies and royal council records.';
    } else if (role.includes('Fisherman')) {
      return 'Mending cast-nets and checking lagoon tide tables.';
    } else if (role.includes('Ecologist')) {
      return 'Surveying sea turtle nest markers along coastal beach dunes.';
    }
    return 'Going about daily activities in the community.';
  }

  public getNPCsForActiveLocation(): LivingNPCState[] {
    const activeLocId = this.locManager.getActiveLocationId();
    const result: LivingNPCState[] = [];
    for (const npc of this.npcStates.values()) {
      if (npc.locationId === activeLocId) {
        result.push(npc);
      }
    }
    return result;
  }

  public getNPCById(characterId: string): LivingNPCState | undefined {
    return this.npcStates.get(characterId);
  }

  public setAttention(characterId: string, active: boolean): void {
    const npc = this.npcStates.get(characterId);
    if (npc) {
      npc.isAttentionActive = active;
    }
  }

  /**
   * Updates walking pedestrian routines (delta elapsed).
   */
  public updateRoutines(delta: number): { x: number; z: number } {
    this.pedestrianWalkProgress += delta * 0.4 * this.pedestrianDirection;
    if (this.pedestrianWalkProgress >= 1.0) {
      this.pedestrianWalkProgress = 1.0;
      this.pedestrianDirection = -1;
    } else if (this.pedestrianWalkProgress <= 0.0) {
      this.pedestrianWalkProgress = 0.0;
      this.pedestrianDirection = 1;
    }

    // Ping-pong along sidewalk corridor: x from 2.0 to 4.5, z = 1.5
    const posX = 2.0 + this.pedestrianWalkProgress * 2.5;
    return { x: posX, z: 1.5 };
  }
}

export const npcManager = NPCManager.getInstance();
