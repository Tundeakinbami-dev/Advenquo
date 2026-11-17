/**
 * Advenquo: VR Construction World — Asset Manifest
 *
 * Evaluated independently in two JS realms (app runtime + editor).
 * Deterministic and completely side-effect free: parentless Object3D trees only.
 */

import { AssetType, defineAssets } from '@iwsdk/core';

// Workshop Architectural & Scenery Assets
import { buildConstructionWorkshop } from './construction/workshop/construction-workshop.js';
import { createComponentMesh } from './construction/materials/component-factory.js';
import { buildInteractiveDoor } from './scene-assets/interactive-door.scene-asset.js';
import { buildMovingPedestrian } from './scene-assets/moving-pedestrian.scene-asset.js';
import { buildNpcTobi } from './scene-assets/npc-tobi.scene-asset.js';

const publicAssetUrl = (filePath: string): string =>
  `${import.meta.env.BASE_URL}${filePath.replace(/^\/+/u, '')}`;

export default defineAssets({
  // ── Workshop Compound & Site Crew ─────────────────────────────────────────
  'construction-workshop': buildConstructionWorkshop(),
  'interactive-door': buildInteractiveDoor(),
  'moving-pedestrian': buildMovingPedestrian(),
  'npc-tobi': buildNpcTobi(),

  // ── Modular Construction Components ───────────────────────────────────────
  'construction-clay-brick': createComponentMesh('clay_brick'),
  'construction-concrete-block': createComponentMesh('concrete_block'),
  'construction-sandcrete-block': createComponentMesh('sandcrete_block'),
  'construction-foundation-block': createComponentMesh('foundation_block'),
  'construction-timber-piece': createComponentMesh('timber_piece'),
  'construction-rebar': createComponentMesh('rebar'),
  'construction-steel-connector': createComponentMesh('steel_connector'),
  'construction-reinforced-column': createComponentMesh('reinforced_column'),
  'construction-horizontal-beam': createComponentMesh('horizontal_beam'),
  'construction-floor-component': createComponentMesh('floor_component'),
  'construction-wall-panel': createComponentMesh('wall_panel'),
  'construction-staircase': createComponentMesh('staircase'),
  'construction-door-frame': createComponentMesh('door_frame'),
  'construction-window-frame': createComponentMesh('window_frame'),
  'construction-roof-truss': createComponentMesh('roof_truss'),
  'construction-roof-panel': createComponentMesh('roof_panel'),
  'construction-bridge-section': createComponentMesh('bridge_section'),

  // ── Workshop Perimeter Scenery (Kenney CC0) ───────────────────────────────
  'scenery-palm-tall': {
    url: publicAssetUrl('assets/third-party/kenney-nature/tree_palmDetailedTall.glb'),
    type: AssetType.GLTF,
    name: 'Workshop Perimeter Palm — Tall',
  },
  'scenery-palm-short': {
    url: publicAssetUrl('assets/third-party/kenney-nature/tree_palmDetailedShort.glb'),
    type: AssetType.GLTF,
    name: 'Workshop Perimeter Palm — Short',
  },
  'scenery-bush': {
    url: publicAssetUrl('assets/third-party/kenney-nature/plant_bushDetailed.glb'),
    type: AssetType.GLTF,
    name: 'Workshop Shrub',
  },
  'scenery-grass': {
    url: publicAssetUrl('assets/third-party/kenney-nature/grass_large.glb'),
    type: AssetType.GLTF,
    name: 'Workshop Turf Grass',
  },
  'scenery-rock': {
    url: publicAssetUrl('assets/third-party/kenney-nature/rock_smallA.glb'),
    type: AssetType.GLTF,
    name: 'Workshop Yard Rock',
  },
  'scenery-flat-rock': {
    url: publicAssetUrl('assets/third-party/kenney-nature/rock_smallFlatA.glb'),
    type: AssetType.GLTF,
    name: 'Workshop Yard Flat Rock',
  },
  'scenery-bench': {
    url: publicAssetUrl('assets/third-party/kenney-furniture/bench.glb'),
    type: AssetType.GLTF,
    name: 'Surveyor Workbench',
  },
  'scenery-potted-plant': {
    url: publicAssetUrl('assets/third-party/kenney-furniture/pottedPlant.glb'),
    type: AssetType.GLTF,
    name: 'Site Office Planter',
  },

  // ── Spatial UI Panels (UIKitML) ───────────────────────────────────────────
  'intro-panel': {
    url: publicAssetUrl('ui/intro.uikitml'),
    type: AssetType.UIKitML,
    name: 'Construction Intro Panel',
  },
  'vr-nav-tablet': {
    url: publicAssetUrl('ui/vr-nav-tablet.uikitml'),
    type: AssetType.UIKitML,
    name: 'Builder Tablet HUD',
  },
  'completion-panel': {
    url: publicAssetUrl('ui/completion.uikitml'),
    type: AssetType.UIKitML,
    name: 'Structural Certification Celebration Panel',
  },

  // ── Audio Cues ────────────────────────────────────────────────────────────
  'discover-chime': {
    url: publicAssetUrl('audio/chime.mp3'),
    type: AssetType.Audio,
    name: 'Snap & Certification Chime',
  },
});
