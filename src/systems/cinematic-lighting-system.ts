/**
 * Advenquo — Cinematic Lighting & Atmospheric Shadow System.
 *
 * Implements high-fidelity, environment-specific lighting and contact shadows across
 * all four playable Nigerian destinations:
 * 1. Ìsàlẹ̀ Èkó Artisan Market: Warm Lagos morning sunlight (soft gold angles, deep rich shadows)
 * 2. Yaba Tech Corridor: Bright urban midday sun (neutral white intensity, crisp structural shadows)
 * 3. Iga Idunganran Royal Palace: Regal golden courtyard lighting (warm terracotta bounce, majestic pillar shadows)
 * 4. Tarkwa Bay Waterfront: Natural coastal sunlight (Atlantic sky reflection, soft maritime ambient fill)
 *
 * Performance guarantees for Meta Quest 3:
 * - Shadow frustum tightly bounded to playable destination coordinates
 * - Shadow map dimensions scaled with QualityProfileSystem (1024x1024 on Quest VR)
 * - Zero allocations in per-frame update loop
 */

import {
  AmbientLight,
  Color,
  createSystem,
  DirectionalLight,
  LevelRoot,
  Object3D,
  Vector3,
} from '@iwsdk/core';

import { WorldStreamingSystem } from '../world-streaming-system.js';
import { qualityProfileSystem } from './quality-profile-system.js';

export interface LocationLightingPreset {
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  targetPosition: [number, number, number];
  ambientColor: number;
  ambientIntensity: number;
}

export const LIGHTING_PRESETS: Record<string, LocationLightingPreset> = {
  nigerian_market: {
    sunColor: 0xffeedb, // Warm Lagos morning golden sunlight
    sunIntensity: 1.35,
    sunPosition: [14, 22, 12],
    targetPosition: [0, 0, 0],
    ambientColor: 0x3a3028, // Warm terracotta courtyard bounce
    ambientIntensity: 0.52,
  },
  lagos_urban: {
    sunColor: 0xffffff, // Bright midday sun
    sunIntensity: 1.55,
    sunPosition: [5, 32, 8],
    targetPosition: [0, 0, 0],
    ambientColor: 0x424650, // Urban asphalt and concrete ambient fill
    ambientIntensity: 0.58,
  },
  heritage_iga: {
    sunColor: 0xffd48a, // Regal golden court sunlight
    sunIntensity: 1.3,
    sunPosition: [16, 20, 155],
    targetPosition: [0, 0, 145],
    ambientColor: 0x4a3220, // Rich palace terracotta ambient bounce
    ambientIntensity: 0.48,
  },
  beach_waterfront: {
    sunColor: 0xfff2e5, // Atlantic coastal sunlight
    sunIntensity: 1.45,
    sunPosition: [12, 22, 320],
    targetPosition: [0, 0, 305],
    ambientColor: 0x2c3b4d, // Maritime coastal sky ambient fill
    ambientIntensity: 0.54,
  },
};

export class CinematicLightingSystem extends createSystem({
  levelRoot: { required: [LevelRoot] },
}) {
  private static instance: CinematicLightingSystem | null = null;
  public static getInstance(): CinematicLightingSystem | null {
    return CinematicLightingSystem.instance;
  }

  private sunLight: DirectionalLight | null = null;
  private ambientLight: AmbientLight | null = null;
  private sunTarget: Object3D | null = null;
  private currentLocationId = 'nigerian_market';

  init(): void {
    CinematicLightingSystem.instance = this;

    const scene = this.scene as Object3D | undefined;
    if (!scene) return;

    const profile = qualityProfileSystem.getActiveProfile();
    const isQuest = profile.profileName === 'quest_vr_performance';

    // 1. Primary Directional Sunlight
    const preset = LIGHTING_PRESETS[this.currentLocationId] || LIGHTING_PRESETS.nigerian_market;
    this.sunLight = new DirectionalLight(preset.sunColor, preset.sunIntensity);
    this.sunLight.name = 'CinematicSunLight';
    this.sunLight.position.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]);

    this.sunTarget = new Object3D();
    this.sunTarget.name = 'CinematicSunTarget';
    this.sunTarget.position.set(preset.targetPosition[0], preset.targetPosition[1], preset.targetPosition[2]);
    scene.add(this.sunTarget);
    this.sunLight.target = this.sunTarget;

    // Contact Shadows Configuration
    this.sunLight.castShadow = true;
    const shadowRes = isQuest ? 1024 : 2048;
    this.sunLight.shadow.mapSize.width = shadowRes;
    this.sunLight.shadow.mapSize.height = shadowRes;
    this.sunLight.shadow.bias = -0.0004;

    // Tightly bounded shadow frustum for maximum texel density in playable areas
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -25;
    this.sunLight.shadow.camera.right = 25;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;

    scene.add(this.sunLight);

    // 2. Ambient Fill Light
    this.ambientLight = new AmbientLight(preset.ambientColor, preset.ambientIntensity);
    this.ambientLight.name = 'CinematicAmbientLight';
    scene.add(this.ambientLight);

    // 3. Connect to WorldStreamingSystem destination transitions
    const streamingSys = WorldStreamingSystem.getInstance();
    if (streamingSys) {
      this.currentLocationId = streamingSys.getCurrentLocationId() || 'nigerian_market';
      this.applyLocationLighting(this.currentLocationId);

      const unsubscribe = streamingSys.onLocationChanged((locDef) => {
        this.applyLocationLighting(locDef.id);
      });
      this.cleanupFuncs.push(unsubscribe);
    }

    this.cleanupFuncs.push(() => {
      if (this.sunLight && scene) scene.remove(this.sunLight);
      if (this.ambientLight && scene) scene.remove(this.ambientLight);
      if (this.sunTarget && scene) scene.remove(this.sunTarget);
      CinematicLightingSystem.instance = null;
    });
  }

  public applyLocationLighting(locationId: string): void {
    this.currentLocationId = locationId;
    const preset = LIGHTING_PRESETS[locationId] || LIGHTING_PRESETS.nigerian_market;

    if (this.sunLight && this.sunTarget) {
      this.sunLight.color.setHex(preset.sunColor);
      this.sunLight.intensity = preset.sunIntensity;
      this.sunLight.position.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]);

      this.sunTarget.position.set(preset.targetPosition[0], preset.targetPosition[1], preset.targetPosition[2]);
      this.sunLight.target.updateMatrixWorld();
    }

    if (this.ambientLight) {
      this.ambientLight.color.setHex(preset.ambientColor);
      this.ambientLight.intensity = preset.ambientIntensity;
    }
  }

  public getCurrentLightingPreset(): LocationLightingPreset {
    return LIGHTING_PRESETS[this.currentLocationId] || LIGHTING_PRESETS.nigerian_market;
  }
}
