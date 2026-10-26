/**
 * Advenquo: The World Begins at Home
 *
 * Application entry point. Creates the IWSDK World from the virtual project
 * options (declared in iwsdk.config.json) and registers all game systems.
 *
 * System order matters: DiscoverySystem writes state → SceneUISystem reads it.
 */

import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';

import { DiscoverySystem } from './discovery-system.js';
import { SceneUISystem } from './scene-ui-system.js';
import { gameShell } from './game/game-shell.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(DiscoverySystem);
  world.registerSystem(SceneUISystem);
  gameShell.init();
});
