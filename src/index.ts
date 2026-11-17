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

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(LocomotionComfortSystem);
  world.registerSystem(CinematicCameraSystem);
  world.registerSystem(PlayerControllerSystem);
  world.registerSystem(SpatialAudioSystem);
  world.registerSystem(CinematicLightingSystem);
  world.registerSystem(SceneUISystem);
  world.registerSystem(ResponsiveUISystem);
  world.registerSystem(VRTabletSystem);
  world.registerSystem(ConstructionInteractionSystem);
});
