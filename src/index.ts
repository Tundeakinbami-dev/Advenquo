/**
 * Advenquo: The World Begins at Home
 *
 * Application entry point. Creates the IWSDK World from the virtual project
 * options (declared in iwsdk.config.json) and registers all game systems.
 *
 * System order matters:
 * 1. DiscoverySystem: reacts to hand/controller ray interactions
 * 2. SceneUISystem: manages in-world 3D spatial UIKitML panels
 * 3. ResponsiveUISystem: manages responsive 2D presentation, camera framing, and mobile touch
 */

import './styles/responsive.css';

import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';

import { DiscoverySystem } from './discovery-system.js';
import { ResponsiveUISystem } from './responsive-ui-system.js';
import { SceneUISystem } from './scene-ui-system.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(DiscoverySystem);
  world.registerSystem(SceneUISystem);
  world.registerSystem(ResponsiveUISystem);
});
