/**
 * Advenquo: The World Begins at Home
 *
 * Application entry point. Creates the IWSDK World from the virtual project
 * options (declared in iwsdk.config.json) and registers all game systems.
 *
 * System order:
 * LocomotionComfortSystem → DiscoverySystem → SceneUISystem → NpcDialogueSystem → VRTabletSystem
 */

import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';

import { LocomotionComfortSystem } from './locomotion-comfort-system.js';
import { DiscoverySystem } from './discovery-system.js';
import { SceneUISystem } from './scene-ui-system.js';
import { NpcDialogueSystem } from './npc-dialogue-system.js';
import { VRTabletSystem } from './vr-tablet-system.js';
import { gameShell } from './game/game-shell.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(LocomotionComfortSystem);
  world.registerSystem(DiscoverySystem);
  world.registerSystem(SceneUISystem);
  world.registerSystem(NpcDialogueSystem);
  world.registerSystem(VRTabletSystem);
  gameShell.init();
});
