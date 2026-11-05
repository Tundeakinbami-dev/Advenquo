/**
 * Advenquo — TravelSystem.
 *
 * Coordinates logical open-world travel between destinations:
 * - Walking through connecting streets & archways
 * - Yellow Danfo commuter minibus journeys across Eko & Carter Bridges
 * - Artisanal lagoon ferry & motorized boat crossings to Tarkwa Bay
 * - Royal processional causeways to Iga Idunganran Palace
 * - Manages travel transition sequences, scenic narratives, and audio cues
 */

import { locationManager, LocationManager } from './location-manager.js';
import type { TravelRoute, LocationDefinition } from '../world/location-types.js';
import type { TravelTransitionInfo } from './types.js';

export class TravelSystem {
  private static instance: TravelSystem | null = null;
  private locManager: LocationManager;
  private isTraveling = false;
  private onTravelEventCallbacks: Array<(info: TravelTransitionInfo) => void> = [];

  public static getInstance(): TravelSystem {
    if (!TravelSystem.instance) {
      TravelSystem.instance = new TravelSystem();
    }
    return TravelSystem.instance;
  }

  constructor() {
    this.locManager = locationManager;
  }

  public getAvailableRoutes(fromLocationId?: string): TravelRoute[] {
    return this.locManager.getConnectedRoutes(fromLocationId);
  }

  public travelTo(
    targetLocationId: string,
    customRouteName?: string,
  ): { success: boolean; info?: TravelTransitionInfo; error?: string } {
    const currentLoc = this.locManager.getActiveLocation();
    const targetLoc = this.locManager.getLocationById(targetLocationId);

    if (!targetLoc) {
      return { success: false, error: `Unknown destination: ${targetLocationId}` };
    }

    if (targetLocationId === currentLoc.id) {
      return { success: true }; // Already there
    }

    const route = currentLoc.connectedRoutes.find((r) => r.targetLocationId === targetLocationId);

    const transitMethod = route?.transitMethod || 'walk';
    const routeName = customRouteName || route?.routeName || `Journey to ${targetLoc.name}`;
    const travelTimeDesc = route?.travelTimeDesc || 'Arriving shortly';
    const scenicNote = route?.scenicNote || `Travelling to ${targetLoc.name}`;

    const info: TravelTransitionInfo = {
      fromLocationId: currentLoc.id,
      toLocationId: targetLoc.id,
      routeName,
      transitMethod,
      travelTimeDesc,
      scenicNote,
      timestamp: new Date().toISOString(),
    };

    this.isTraveling = true;
    this.locManager.setActiveLocationId(targetLocationId);

    for (const cb of this.onTravelEventCallbacks) {
      cb(info);
    }

    this.isTraveling = false;
    return { success: true, info };
  }

  public isTravelInProgress(): boolean {
    return this.isTraveling;
  }

  public onTravel(callback: (info: TravelTransitionInfo) => void): () => void {
    this.onTravelEventCallbacks.push(callback);
    return () => {
      const idx = this.onTravelEventCallbacks.indexOf(callback);
      if (idx !== -1) this.onTravelEventCallbacks.splice(idx, 1);
    };
  }
}

export const travelSystem = TravelSystem.getInstance();
