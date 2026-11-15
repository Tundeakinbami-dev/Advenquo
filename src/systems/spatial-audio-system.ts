/**
 * Advenquo — Spatial Audio ECS System.
 *
 * Integrates SpatialAudioManager with IWSDK World, WebXR lifecycle, and WorldStreamingSystem:
 * - Automatically initializes 3D spatial listener on player head (VR) and camera (Desktop)
 * - Synchronizes environmental soundscape transitions with WorldStreamingSystem location changes
 * - Handles WebXR sessionstart / sessionend events to pause/resume audio
 * - Zero allocations in per-frame update loop
 */

import {
  createSystem,
  LevelRoot,
  Object3D,
} from '@iwsdk/core';

import {
  spatialAudioManager,
  SpatialAudioManager,
} from '../audio/spatial-audio-manager.js';
import { WorldStreamingSystem } from '../world-streaming-system.js';
import type { EnvironmentLocationId } from '../audio/types.js';

export class SpatialAudioSystem extends createSystem({
  levelRoot: { required: [LevelRoot] },
}) {
  private static instance: SpatialAudioSystem | null = null;
  public static getInstance(): SpatialAudioSystem | null {
    return SpatialAudioSystem.instance;
  }

  private audioManager: SpatialAudioManager = spatialAudioManager;

  private onXRSessionStartBound = () => {
    const headObj = (this.player as any)?.head as Object3D | undefined;
    this.audioManager.onXRSessionStart(headObj);
  };

  private onXRSessionEndBound = () => {
    this.audioManager.onXRSessionEnd(this.camera as Object3D);
  };

  init(): void {
    SpatialAudioSystem.instance = this;

    // Initialize spatial audio manager with scene root
    this.audioManager.init(this.scene as Object3D);

    // Register WebXR session lifecycle listeners
    if (this.renderer?.xr) {
      this.renderer.xr.addEventListener('sessionstart', this.onXRSessionStartBound);
      this.renderer.xr.addEventListener('sessionend', this.onXRSessionEndBound);

      this.cleanupFuncs.push(() => {
        this.renderer.xr.removeEventListener('sessionstart', this.onXRSessionStartBound);
        this.renderer.xr.removeEventListener('sessionend', this.onXRSessionEndBound);
      });
    }

    // Connect with WorldStreamingSystem for continuous location transitions
    const streamingSys = WorldStreamingSystem.getInstance();
    if (streamingSys) {
      const initialLoc = streamingSys.getCurrentLocationId() as EnvironmentLocationId;
      if (initialLoc) {
        this.audioManager.switchSoundscape(initialLoc, 0.8);
      }

      const unsubscribe = streamingSys.onLocationChanged((locDef) => {
        this.audioManager.switchSoundscape(locDef.id as EnvironmentLocationId, 1.2);
      });
      this.cleanupFuncs.push(unsubscribe);
    } else {
      // Default to market courtyard if streaming system not yet bound
      this.audioManager.switchSoundscape('nigerian_market', 0.8);
    }

    this.cleanupFuncs.push(() => {
      this.audioManager.dispose();
    });
  }

  update(): void {
    // If not in immersive VR, ensure listener follows desktop camera
    const listener = this.audioManager.getListener();
    if (listener && !this.renderer?.xr?.isPresenting && this.camera) {
      if (listener.parent !== this.camera) {
        this.camera.add(listener);
      }
    }
  }

  public getAudioManager(): SpatialAudioManager {
    return this.audioManager;
  }
}
