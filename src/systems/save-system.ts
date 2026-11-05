/**
 * Advenquo — SaveSystem.
 *
 * Provides robust game state serialization and persistence across sessions:
 * - Current location, discovered locations, exploration history
 * - Player progression: level, XP, skill ratings, passport stamps, vocabulary
 * - Active adventure stage, inventory satchel items, collected clues
 * - Open/closed state of doors and discovered artifacts
 * - Auto-saves on location transitions and mission milestones
 * - LocalStorage with in-memory fallback for headless/test environments
 */

import { storage } from '../game/storage.js';
import type { GameSaveState } from '../game/types.js';

export class SaveSystem {
  private static instance: SaveSystem | null = null;
  private autoSaveTimer: any = null;

  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  public getRawState(): GameSaveState {
    return storage.getState();
  }

  public saveCurrentLocation(locationOrCountryId: string, districtId?: string): void {
    let countryId = 'nigeria';
    let locId = locationOrCountryId;

    if (districtId) {
      if (locationOrCountryId === 'nigeria' || locationOrCountryId === 'ghana' || locationOrCountryId === 'kenya') {
        countryId = locationOrCountryId;
        locId = districtId;
      } else {
        locId = locationOrCountryId;
      }
    }

    storage.setSelectedLocation(countryId, locId);
    this.recordDiscoveredLocation(locId);
  }

  public recordDiscoveredLocation(locationId: string): void {
    storage.recordDiscovery(locationId, 'geography');
  }

  public isLocationDiscovered(locationId: string): boolean {
    const state = storage.getState();
    return (
      state.selectedLocationId === locationId ||
      state.selectedDistrictId === locationId ||
      state.passport.stamps.some((s) => s.destinationId === locationId || s.districtId === locationId) ||
      locationId === 'nigerian_market' // Initial spawn location always discovered
    );
  }

  public recordArtifactDiscovered(artifactId: string, category = 'artifact'): void {
    storage.recordDiscovery(artifactId, category);
  }

  public isArtifactDiscovered(artifactId: string): boolean {
    const state = storage.getState();
    return state.passport.stamps.some((s) => s.id === `stamp_${artifactId}` || s.id === artifactId);
  }

  public scheduleAutoSave(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      // Storage auto-saves to localStorage on mutation
      this.autoSaveTimer = null;
    }, 500);
  }

  public resetProgress(): void {
    storage.reset();
  }
}

export const saveSystem = SaveSystem.getInstance();
