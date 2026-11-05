/**
 * Advenquo — WorldMapManager.
 *
 * Powers the Interactive Open-World Atlas & Navigation System:
 * - Cartographic positions of all playable Nigerian environments
 * - Discovered vs undiscovered destination states
 * - Connected transit routes with method icons (Walk, Danfo Minibus, Ferry, Motorcade)
 * - Nearby Points of Interest & landmarks per destination
 * - Current player location indicator
 * - Dispatches travel journeys directly from the map
 */

import { locationManager, LocationManager } from './location-manager.js';
import { travelSystem, TravelSystem } from './travel-system.js';
import type { LocationDefinition, TravelRoute, LocationPOI } from '../world/location-types.js';

export interface MapDestinationNode {
  id: string;
  name: string;
  indigenousName: string;
  city: string;
  category: 'market' | 'urban' | 'heritage' | 'natural';
  mapX: number; // Percent (0-100) on regional map
  mapY: number; // Percent (0-100) on regional map
  isCurrent: boolean;
  isDiscovered: boolean;
  tagline: string;
  poisCount: number;
  routes: TravelRoute[];
}

export class WorldMapManager {
  private static instance: WorldMapManager | null = null;
  private locManager: LocationManager;
  private travelSys: TravelSystem;

  // Cartographic coordinate anchors across Lagos region map (0..100)
  private readonly MAP_COORDINATES: Record<string, { x: number; y: number }> = {
    nigerian_market: { x: 42, y: 55 }, // Lagos Island commercial quarter
    lagos_urban: { x: 38, y: 28 }, // Yaba mainland
    heritage_iga: { x: 52, y: 50 }, // Palace on Lagos Island
    beach_waterfront: { x: 58, y: 78 }, // Tarkwa Bay coastal barrier island
  };

  public static getInstance(): WorldMapManager {
    if (!WorldMapManager.instance) {
      WorldMapManager.instance = new WorldMapManager();
    }
    return WorldMapManager.instance;
  }

  constructor() {
    this.locManager = locationManager;
    this.travelSys = travelSystem;
  }

  public getMapNodes(): MapDestinationNode[] {
    const allLocations = this.locManager.getAllPlayableLocations();
    const currentLocId = this.locManager.getActiveLocationId();

    return allLocations.map((loc) => {
      const coords = this.MAP_COORDINATES[loc.id] || { x: 50, y: 50 };
      const isCurrent = loc.id === currentLocId;
      const isDiscovered = this.locManager.isLocationDiscovered(loc.id);

      return {
        id: loc.id,
        name: loc.name,
        indigenousName: loc.indigenousName,
        city: loc.city,
        category: loc.category,
        mapX: coords.x,
        mapY: coords.y,
        isCurrent,
        isDiscovered,
        tagline: loc.tagline,
        poisCount: loc.pointsOfInterest.length,
        routes: loc.connectedRoutes,
      };
    });
  }

  public getCurrentMapNode(): MapDestinationNode | undefined {
    return this.getMapNodes().find((n) => n.isCurrent);
  }

  public travelFromMap(targetLocationId: string) {
    return this.travelSys.travelTo(targetLocationId);
  }

  public getNearbyPOIs(locationId?: string): LocationPOI[] {
    return this.locManager.getPOIs(locationId);
  }
}

export const worldMapManager = WorldMapManager.getInstance();
