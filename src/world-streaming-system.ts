/**
 * Advenquo — Open-World Multi-Location Streaming & Travel System.
 *
 * Coordinates dynamic 3D world streaming across all 4 playable Nigerian environments:
 * 1. Traditional Nigerian Market (Ìsàlẹ̀ Èkó Artisan Market Courtyard)
 * 2. Lagos Urban Neighbourhood (Yaba Creative & Transit Corridor)
 * 3. Historical Cultural Heritage (Iga Idunganran Royal Palace Grounds)
 * 4. Natural Coastal Environment (Tarkwa Bay Coastal Beach & Palms)
 *
 * Responsibilities:
 * - Dynamic 3D Scene Streaming: Activates / deactivates environment entity groups
 * - Atmospheric Transitions: Dynamically updates DomeGradient and IBLGradient lighting
 * - Navigation & Boundaries: Resets player spawn point and boundary limits per destination
 * - Transit Routes & Transitions: Coordinates travel between connected locations
 * - Interactive Doors & Accessible Buildings: Pivots door leaves open/closed to enter interiors
 * - Landmark, Vehicle & Artifact Interactions: Danfo bus, Royal Throne, Canoe, Staff, Shells, etc.
 * - State Synchronization: Keeps 2D Web Overlay, Mobile Touch HUD, and WebXR VR Tablet aligned
 */

import {
  AudioUtils,
  createSystem,
  DomeGradient,
  IBLGradient,
  LevelRoot,
  LocomotionSystem,
  Pressed,
  RayInteractable,
  Vector3,
} from '@iwsdk/core';

import { LocationAnchor, InteractiveDoor } from './location-component.js';
import { CulturalObject } from './cultural-object-component.js';
import { PlayerControllerSystem } from './player-controller-system.js';
import { PLAYABLE_LOCATIONS } from './world/location-data.js';
import type { LocationDefinition } from './world/location-types.js';
import { storage } from './game/storage.js';
import { environmentManager } from './systems/environment-manager.js';
import { interactionManager } from './systems/interaction-manager.js';
import { discoveryManager } from './systems/discovery-manager.js';
import { npcManager } from './systems/npc-manager.js';

export interface TravelTransitionEvent {
  fromLocationId: string;
  toLocationId: string;
  routeName: string;
  transitMethod: string;
  travelTimeDesc: string;
  scenicNote: string;
}

export class WorldStreamingSystem extends createSystem({
  locationEntities: { required: [LocationAnchor] },
  levelRoot: { required: [LevelRoot] },
  interactedProps: { required: [RayInteractable, Pressed] },
}) {
  private static instance: WorldStreamingSystem | null = null;
  public static getInstance(): WorldStreamingSystem | null {
    return WorldStreamingSystem.instance;
  }

  // Active Location State
  private currentLocationId = 'nigerian_market';
  private activeToast: { title: string; message: string; timer: number } | null = null;

  // Cached scratch vectors (allocated once)
  private tempSpawnVec = new Vector3();

  // Listeners for UI notification
  private onLocationChangedCallbacks: Array<(location: LocationDefinition) => void> = [];

  init(): void {
    WorldStreamingSystem.instance = this;

    // Restore saved location if available in storage
    const savedState = storage.getState();
    if (savedState.selectedLocationId && this.getLocationDef(savedState.selectedLocationId)) {
      this.currentLocationId = savedState.selectedLocationId;
    } else {
      this.currentLocationId = 'nigerian_market';
      storage.setSelectedLocation(this.currentLocationId, 'isale_eko');
    }

    // React to world entity changes: initial visibility apply
    this.cleanupFuncs.push(
      this.queries.locationEntities.subscribe('qualify', (entity) => {
        const locId = entity.getValue(LocationAnchor, 'locationId');
        const shouldBeVisible = locId === this.currentLocationId;
        entity.setValue(LocationAnchor, 'isActive', shouldBeVisible);
        if (entity.object3D) {
          entity.object3D.visible = shouldBeVisible;
        }
      }),
    );

    // Subscribe to atmosphere updates (diurnal / weather changes)
    this.cleanupFuncs.push(
      environmentManager.onAtmosphereUpdated(() => {
        this.updateAtmosphericLighting();
      }),
    );

    // Initial environment setup after a frame to let scene graph finish mounting
    setTimeout(() => {
      this.applyActiveLocationState(this.currentLocationId, false);
    }, 100);

    // React to player interacting with doors, vehicles, landmarks, artifacts, and travel props
    this.cleanupFuncs.push(
      this.queries.interactedProps.subscribe('qualify', (entity) => {
        this.handlePropInteraction(entity);
      }),
    );

    if (typeof window !== 'undefined') {
      (window as any).__advenquoWorld = this;
      const travelHandler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.locationId) {
          this.travelTo(detail.locationId);
        }
      };
      window.addEventListener('advenquo:travel', travelHandler);
      this.cleanupFuncs.push(() => {
        window.removeEventListener('advenquo:travel', travelHandler);
      });
    }
  }

  public getCurrentLocationId(): string {
    return this.currentLocationId;
  }

  public getCurrentLocation(): LocationDefinition {
    return this.getLocationDef(this.currentLocationId) || PLAYABLE_LOCATIONS[0];
  }

  public getLocationDef(locationId: string): LocationDefinition | undefined {
    return PLAYABLE_LOCATIONS.find((loc) => loc.id === locationId);
  }

  public getAllLocations(): LocationDefinition[] {
    return PLAYABLE_LOCATIONS;
  }

  public onLocationChanged(callback: (location: LocationDefinition) => void): () => void {
    this.onLocationChangedCallbacks.push(callback);
    return () => {
      const idx = this.onLocationChangedCallbacks.indexOf(callback);
      if (idx !== -1) this.onLocationChangedCallbacks.splice(idx, 1);
    };
  }

  /**
   * Travel to a connected or discovered destination in the open world.
   */
  public travelTo(targetLocationId: string, customRouteName?: string): boolean {
    const targetDef = this.getLocationDef(targetLocationId);
    if (!targetDef) return false;
    if (targetLocationId === this.currentLocationId) return true;

    const currentDef = this.getCurrentLocation();
    const route = currentDef.connectedRoutes.find((r) => r.targetLocationId === targetLocationId);

    const routeName = customRouteName || route?.routeName || `Journey to ${targetDef.name}`;
    const transitMethod = route?.transitMethod || 'walk';
    const travelTime = route?.travelTimeDesc || 'Arriving shortly';
    const scenicNote = route?.scenicNote || `Travelling to ${targetDef.name}`;

    // Play chime sound cue
    for (const entity of this.queries.locationEntities.entities) {
      if (entity.getValue(LocationAnchor, 'locationId') === this.currentLocationId) {
        AudioUtils.play(entity);
        break;
      }
    }

    // Trigger travel transition toast
    let methodIcon = '🚶';
    if (transitMethod === 'danfo_bus') methodIcon = '🚌';
    else if (transitMethod === 'lagoon_ferry') methodIcon = '⛵';
    else if (transitMethod === 'royal_procession') methodIcon = '👑';

    this.showToast(
      `${methodIcon} ${routeName}`,
      `${travelTime} — ${scenicNote}`,
      4.5,
    );

    // Apply location state switch
    this.currentLocationId = targetLocationId;
    storage.setSelectedLocation(targetLocationId, targetDef.city);
    storage.recordDiscovery(targetDef.id, targetDef.category);

    this.applyActiveLocationState(targetLocationId, true);

    // Notify listeners
    for (const cb of this.onLocationChangedCallbacks) {
      cb(targetDef);
    }

    return true;
  }

  private applyActiveLocationState(locationId: string, isTravelTeleport = true): void {
    const locDef = this.getLocationDef(locationId);
    if (!locDef) return;

    // 1. Toggle 3D Entity Visibilities
    for (const entity of this.queries.locationEntities.entities) {
      const entityLocId = entity.getValue(LocationAnchor, 'locationId');
      const shouldBeVisible = entityLocId === locationId;
      entity.setValue(LocationAnchor, 'isActive', shouldBeVisible);
      if (entity.object3D) {
        entity.object3D.visible = shouldBeVisible;
      }
    }

    // 2. Update Atmosphere & Environment Manager
    environmentManager.setLocationAtmosphere(locDef);
    this.updateAtmosphericLighting();

    // 3. Teleport and orient player to destination spawn point
    if (isTravelTeleport) {
      const spawnX = locDef.spawnPosition[0];
      const spawnZ = locDef.spawnPosition[2];
      const spawnYawRad = (locDef.spawnYaw * Math.PI) / 180;

      // Update PlayerControllerSystem (Desktop / Mobile 2D)
      const playerController = PlayerControllerSystem.getInstance();
      if (playerController) {
        if (locDef.boundaryLimits) {
          playerController.setBoundaryLimits(
            locDef.boundaryLimits.minX,
            locDef.boundaryLimits.maxX,
            locDef.boundaryLimits.minZ,
            locDef.boundaryLimits.maxZ,
          );
        }
        playerController.teleportTo(spawnX, spawnZ, spawnYawRad);
      }

      // Update LocomotionSystem (WebXR / VR)
      this.tempSpawnVec.set(spawnX, 0, spawnZ);
      const locomotionSystem = this.world.getSystem(LocomotionSystem);
      if (locomotionSystem) {
        locomotionSystem.setPlayerPosition(this.tempSpawnVec);
      }
    }
  }

  public updateAtmosphericLighting(): void {
    const levelRoot = Array.from(this.queries.levelRoot.entities)[0];
    if (!levelRoot) return;

    const sky = environmentManager.getEffectiveSkyColor();
    const equator = environmentManager.getEffectiveEquatorColor();
    const ground = environmentManager.getEffectiveGroundColor();
    const intensity = environmentManager.getEffectiveIntensity();

    const skyView = levelRoot.getVectorView(DomeGradient, 'sky');
    if (skyView) {
      skyView[0] = sky[0];
      skyView[1] = sky[1];
      skyView[2] = sky[2];
      skyView[3] = sky[3];
    }
    const eqView = levelRoot.getVectorView(DomeGradient, 'equator');
    if (eqView) {
      eqView[0] = equator[0];
      eqView[1] = equator[1];
      eqView[2] = equator[2];
      eqView[3] = equator[3];
    }
    const grView = levelRoot.getVectorView(DomeGradient, 'ground');
    if (grView) {
      grView[0] = ground[0];
      grView[1] = ground[1];
      grView[2] = ground[2];
      grView[3] = ground[3];
    }
    levelRoot.setValue(DomeGradient, 'intensity', intensity);
    levelRoot.setValue(DomeGradient, '_needsUpdate', true);

    // Update IBL Gradient as well
    const iblSky = levelRoot.getVectorView(IBLGradient, 'sky');
    if (iblSky) {
      iblSky[0] = sky[0];
      iblSky[1] = sky[1];
      iblSky[2] = sky[2];
      iblSky[3] = sky[3];
    }
    levelRoot.setValue(IBLGradient, 'intensity', Math.max(0.7, intensity * 0.9));
    levelRoot.setValue(IBLGradient, '_needsUpdate', true);
  }

  private handlePropInteraction(entity: any): void {
    const obj = entity.object3D;
    const objName = obj?.name || '';

    // A. Check for Interactive Door
    const hasDoor = entity.hasComponent ? entity.hasComponent(InteractiveDoor) : Boolean(entity.getValue(InteractiveDoor, 'doorId'));
    if (hasDoor) {
      const doorId = entity.getValue(InteractiveDoor, 'doorId') || objName;
      const buildingName = entity.getValue(InteractiveDoor, 'buildingName') || 'Building';
      const isOpen = Boolean(entity.getValue(InteractiveDoor, 'isOpen'));
      const openAngleDeg = entity.getValue(InteractiveDoor, 'openAngleDeg') || 90;

      // Toggle door state
      const newOpenState = !isOpen;
      entity.setValue(InteractiveDoor, 'isOpen', newOpenState);

      // Find DoorPivot object in 3D hierarchy to pivot door leaf
      const doorPivot = obj.getObjectByName('DoorPivot');
      if (doorPivot) {
        doorPivot.rotation.y = newOpenState ? (openAngleDeg * Math.PI) / 180 : 0;
      }

      AudioUtils.play(entity);

      this.showToast(
        newOpenState ? `🚪 Entered ${buildingName}` : `🚪 Closed Door`,
        newOpenState
          ? `The door swings open! You can now step inside to explore the interior space.`
          : `The entrance door has been closed.`,
        4.0,
      );
      return;
    }

    // B. Check for Cultural Object
    const factId = entity.getValue(CulturalObject, 'factId');
    if (factId) {
      entity.setValue(CulturalObject, 'discovered', true);
      AudioUtils.play(entity);
      const res = discoveryManager.discoverArtifact(factId);
      if (res.fact) {
        this.showToast(
          `${res.fact.icon} ${res.fact.title}`,
          `${res.fact.description} Cultural Insight: ${res.fact.culturalSignificance}`,
          5.0,
        );
      }
      return;
    }

    // C. General Entity Interaction via InteractionManager
    const event = interactionManager.handleEntityInteraction(objName, objName);
    this.showToast(
      event.title,
      event.culturalInsight ? `${event.description} — ${event.culturalInsight}` : event.description,
      4.0,
    );

    // D. Check for Travel Signpost
    if (objName.includes('DistrictSign')) {
      const current = this.getCurrentLocation();
      const nextRoute = current.connectedRoutes[0];
      if (nextRoute) {
        this.travelTo(nextRoute.targetLocationId, nextRoute.routeName);
      }
    }
  }

  public showToast(title: string, message: string, durationSeconds = 3.5): void {
    this.activeToast = { title, message, timer: durationSeconds };

    // Update 2D DOM Toast in desktop/mobile UI
    let toastEl = document.getElementById('world-travel-toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'world-travel-toast';
      toastEl.className = 'world-travel-toast';
      document.body.appendChild(toastEl);
    }

    toastEl.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    `;
    toastEl.classList.add('visible');
  }

  update(delta: number): void {
    if (this.activeToast) {
      this.activeToast.timer -= delta;
      if (this.activeToast.timer <= 0) {
        this.activeToast = null;
        const toastEl = document.getElementById('world-travel-toast');
        if (toastEl) {
          toastEl.classList.remove('visible');
        }
      }
    }

    // Update walking pedestrian routines in urban corridor
    if (this.currentLocationId === 'lagos_urban') {
      const pedEntity = this.world.getSceneObject('moving-pedestrian-urban');
      if (pedEntity && pedEntity.visible) {
        const coords = npcManager.updateRoutines(delta);
        pedEntity.position.x = coords.x;
        pedEntity.position.z = coords.z;
      }
    }
  }
}
