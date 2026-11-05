/**
 * Advenquo — LocationManager.
 *
 * Manages the multi-location open world:
 * - Authoritative catalog of all 4 distinct playable Nigerian environments:
 *   1. Ìsàlẹ̀ Èkó Artisan Market (Market)
 *   2. Yaba Tech & Transit Corridor (Urban)
 *   3. Iga Idunganran Royal Palace (Heritage)
 *   4. Tarkwa Bay Coastal Haven (Natural)
 * - Tracks active location, boundaries, spawn coordinates, and yaw
 * - Manages location discovery state, unlocking logic, and route queries
 */

import { PLAYABLE_LOCATIONS } from '../world/location-data.js';
import type { LocationDefinition, TravelRoute, LocationPOI, LocationNPCDef, LocationArtifactDef } from '../world/location-types.js';
import { saveSystem } from './save-system.js';

export class LocationManager {
  private static instance: LocationManager | null = null;
  private activeLocationId: string = 'nigerian_market';
  private discoveredLocationIds: Set<string> = new Set(['nigerian_market']);
  private onLocationChangeCallbacks: Array<(location: LocationDefinition) => void> = [];

  public static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  constructor() {
    // Restore discovered state
    for (const loc of PLAYABLE_LOCATIONS) {
      if (saveSystem.isLocationDiscovered(loc.id)) {
        this.discoveredLocationIds.add(loc.id);
      }
    }
  }

  public getAllPlayableLocations(): LocationDefinition[] {
    return PLAYABLE_LOCATIONS;
  }

  public getLocationById(id: string): LocationDefinition | undefined {
    return PLAYABLE_LOCATIONS.find((loc) => loc.id === id);
  }

  public getActiveLocation(): LocationDefinition {
    return this.getLocationById(this.activeLocationId) || PLAYABLE_LOCATIONS[0];
  }

  public getActiveLocationId(): string {
    return this.activeLocationId;
  }

  public setActiveLocationId(id: string): boolean {
    const loc = this.getLocationById(id);
    if (!loc) return false;

    this.activeLocationId = id;
    this.discoveredLocationIds.add(id);
    saveSystem.saveCurrentLocation('nigeria', id);
    saveSystem.recordDiscoveredLocation(id);

    for (const cb of this.onLocationChangeCallbacks) {
      cb(loc);
    }
    return true;
  }

  public isLocationDiscovered(id: string): boolean {
    return this.discoveredLocationIds.has(id);
  }

  public unlockLocation(id: string): boolean {
    const loc = this.getLocationById(id);
    if (!loc) return false;
    this.discoveredLocationIds.add(id);
    saveSystem.recordDiscoveredLocation(id);
    return true;
  }

  public getDiscoveredLocations(): LocationDefinition[] {
    return PLAYABLE_LOCATIONS.filter((loc) => this.isLocationDiscovered(loc.id));
  }

  public getConnectedRoutes(fromLocationId?: string): TravelRoute[] {
    const sourceId = fromLocationId || this.activeLocationId;
    const loc = this.getLocationById(sourceId);
    return loc ? loc.connectedRoutes : [];
  }

  public getPOIs(locationId?: string): LocationPOI[] {
    const loc = this.getLocationById(locationId || this.activeLocationId);
    return loc ? loc.pointsOfInterest : [];
  }

  public getNPCs(locationId?: string): LocationNPCDef[] {
    const loc = this.getLocationById(locationId || this.activeLocationId);
    return loc ? loc.npcs : [];
  }

  public getArtifacts(locationId?: string): LocationArtifactDef[] {
    const loc = this.getLocationById(locationId || this.activeLocationId);
    return loc ? loc.artifacts : [];
  }

  public onLocationChange(callback: (loc: LocationDefinition) => void): () => void {
    this.onLocationChangeCallbacks.push(callback);
    return () => {
      const idx = this.onLocationChangeCallbacks.indexOf(callback);
      if (idx !== -1) this.onLocationChangeCallbacks.splice(idx, 1);
    };
  }
}

export const locationManager = LocationManager.getInstance();
