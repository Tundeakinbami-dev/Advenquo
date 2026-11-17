/**
 * Advenquo: VR Construction & Building Game
 *
 * Application entry point. Creates the IWSDK World from the virtual project
 * options (declared in iwsdk.config.json) and registers all construction and VR systems.
 *
 * System registration order:
 * LocomotionComfortSystem → CinematicCameraSystem → PlayerControllerSystem →
 * SpatialAudioSystem → CinematicLightingSystem → SceneUISystem →
 * ResponsiveUISystem → VRTabletSystem → ConstructionInteractionSystem
 */

import './styles/responsive.css';

import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';

import { LocomotionComfortSystem } from './locomotion-comfort-system.js';
import { CinematicCameraSystem } from './systems/cinematic-camera-system.js';
import { PlayerControllerSystem } from './player-controller-system.js';
import { SpatialAudioSystem } from './systems/spatial-audio-system.js';
import { CinematicLightingSystem } from './systems/cinematic-lighting-system.js';
import { ResponsiveUISystem } from './responsive-ui-system.js';
import { SceneUISystem } from './scene-ui-system.js';
import { VRTabletSystem } from './vr-tablet-system.js';
import { ConstructionInteractionSystem } from './construction/interaction/construction-interaction-system.js';
import { desktopConstructionController } from './construction/interaction/desktop-interaction.js';

const hideLoadingScreen = (): void => {
  const loadingScreen = document.getElementById('app-loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('loaded');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 450);
  }
};

const showCriticalError = (err: unknown): void => {
  const loadingScreen = document.getElementById('app-loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';

  const errorOverlay = document.getElementById('critical-error-fallback');
  const errorMsg = document.getElementById('critical-error-message');
  if (errorOverlay) errorOverlay.style.display = 'flex';
  if (errorMsg) {
    const detail = err instanceof Error ? err.message : String(err);
    errorMsg.textContent = `A subsystem error occurred during initialization: ${detail}. Please ensure WebGL 2.0 is supported and try refreshing.`;
  }
  console.error('[Advenquo] Critical initialization failure:', err);
};

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
)
  .then((world) => {
    world.registerSystem(LocomotionComfortSystem);
    world.registerSystem(CinematicCameraSystem);
    world.registerSystem(PlayerControllerSystem);
    world.registerSystem(SpatialAudioSystem);
    world.registerSystem(CinematicLightingSystem);
    world.registerSystem(SceneUISystem);
    world.registerSystem(ResponsiveUISystem);
    world.registerSystem(VRTabletSystem);
    world.registerSystem(ConstructionInteractionSystem);

    desktopConstructionController.init(world);

    hideLoadingScreen();
    return world;
  })
  .catch((err) => {
    showCriticalError(err);
  });
