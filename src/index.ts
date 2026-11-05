/**
 * Advenquo: The World Begins at Home
 *
 * Application entry point. Creates the IWSDK World from the virtual project
 * options (declared in iwsdk.config.json) and registers all game systems.
 *
 * System order:
 * LocomotionComfortSystem → DiscoverySystem → SceneUISystem → ResponsiveUISystem → NpcDialogueSystem → VRTabletSystem
 */

import './styles/responsive.css';

import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';

import { LocomotionComfortSystem } from './locomotion-comfort-system.js';
import { CinematicCameraSystem } from './systems/cinematic-camera-system.js';
import { PlayerControllerSystem } from './player-controller-system.js';
import { WorldStreamingSystem } from './world-streaming-system.js';
import { NpcAnimationSystem } from './npc-animation-system.js';
import { NPCMovementSystem } from './npc-movement-system.js';
import { DiscoverySystem } from './discovery-system.js';
import { AdventureMissionSystem } from './adventure-mission-system.js';
import { ResponsiveUISystem } from './responsive-ui-system.js';
import { SceneUISystem } from './scene-ui-system.js';
import { NpcDialogueSystem } from './npc-dialogue-system.js';
import { VRTabletSystem } from './vr-tablet-system.js';
import { worldManager } from './systems/world-manager.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(LocomotionComfortSystem);
  world.registerSystem(CinematicCameraSystem);
  world.registerSystem(PlayerControllerSystem);
  world.registerSystem(WorldStreamingSystem);
  world.registerSystem(NPCMovementSystem);
  world.registerSystem(NpcAnimationSystem);
  world.registerSystem(DiscoverySystem);
  world.registerSystem(AdventureMissionSystem);
  world.registerSystem(SceneUISystem);
  world.registerSystem(ResponsiveUISystem);
  world.registerSystem(NpcDialogueSystem);
  world.registerSystem(VRTabletSystem);
  // Keep the non-immersive map, news and passport shell out of the initial
  // Quest startup chunk. The spatial experience is available before this UI
  // module and its supporting data are requested.
  void import('./game/game-shell.js').then(({ gameShell }) => gameShell.init());
  (window as any).__worldManager = worldManager;
});

