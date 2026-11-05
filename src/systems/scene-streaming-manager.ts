/**
 * Advenquo — SceneStreamingManager.
 *
 * Manages 3D asset activation, entity visibility toggling, and memory
 * footprint optimizations during open-world travel:
 * - Activates entity groups for the destination environment
 * - Deactivates/hides entity groups for inactive locations
 * - Synchronizes with LocationAnchor ECS components and Three.js hierarchy
 */

import { WorldStreamingSystem } from '../world-streaming-system.js';
import { locationManager } from './location-manager.js';

export class SceneStreamingManager {
  private static instance: SceneStreamingManager | null = null;

  public static getInstance(): SceneStreamingManager {
    if (!SceneStreamingManager.instance) {
      SceneStreamingManager.instance = new SceneStreamingManager();
    }
    return SceneStreamingManager.instance;
  }

  private getStreamingSys(): WorldStreamingSystem | null {
    return WorldStreamingSystem.getInstance();
  }

  public streamToLocation(locationId: string, customRouteName?: string): boolean {
    const streamingSys = this.getStreamingSys();
    if (streamingSys) {
      return streamingSys.travelTo(locationId, customRouteName);
    } else {
      return locationManager.setActiveLocationId(locationId);
    }
  }

  public getActiveLocationId(): string {
    const streamingSys = this.getStreamingSys();
    return streamingSys ? streamingSys.getCurrentLocationId() : locationManager.getActiveLocationId();
  }
}

export const sceneStreamingManager = SceneStreamingManager.getInstance();
