/**
 * Advenquo — Asset manifest.
 *
 * Evaluated independently in two JS realms (app runtime + editor). Must be
 * deterministic and completely side-effect free: no World, DOM, timers, or
 * ambient state reads.
 *
 * Procedural 3D assets: registered as bare parentless Object3D instances
 * (the return value of each build function). The registry rejects parented
 * prototypes, so build functions must never call parent.add(result).
 *
 * URL assets (UIKitML, audio): use publicAssetUrl() so paths resolve
 * identically at runtime, in the editor, and in subpath deployments.
 */

import { AssetType, defineAssets } from '@iwsdk/core';

import { buildAdireCloth } from './scene-assets/adire-cloth.scene-asset.js';
import { buildCalabash } from './scene-assets/calabash.scene-asset.js';
import { buildDisplayTable } from './scene-assets/display-table.scene-asset.js';
import { buildKolaNut } from './scene-assets/kola-nut.scene-asset.js';
import { buildTalkingDrum } from './scene-assets/talking-drum.scene-asset.js';

const publicAssetUrl = (filePath: string): string =>
  `${import.meta.env.BASE_URL}${filePath.replace(/^\/+/u, '')}`;

export default defineAssets({
  // ── Procedural 3D models (bare Object3D — no wrapper object) ───────────
  'display-table': buildDisplayTable(),
  'adire-cloth': buildAdireCloth(),
  'talking-drum': buildTalkingDrum(),
  calabash: buildCalabash(),
  'kola-nut': buildKolaNut(),

  // ── Spatial UI panels (UIKitML) ─────────────────────────────────────────
  'intro-panel': {
    url: publicAssetUrl('ui/intro.uikitml'),
    type: AssetType.UIKitML,
    name: 'Intro Panel',
  },
  'fact-panel-adire': {
    url: publicAssetUrl('ui/fact-adire.uikitml'),
    type: AssetType.UIKitML,
    name: 'Fact: Adire Cloth',
  },
  'fact-panel-drum': {
    url: publicAssetUrl('ui/fact-drum.uikitml'),
    type: AssetType.UIKitML,
    name: 'Fact: Talking Drum',
  },
  'fact-panel-calabash': {
    url: publicAssetUrl('ui/fact-calabash.uikitml'),
    type: AssetType.UIKitML,
    name: 'Fact: Calabash Bowl',
  },
  'fact-panel-kola': {
    url: publicAssetUrl('ui/fact-kola.uikitml'),
    type: AssetType.UIKitML,
    name: 'Fact: Kola Nut',
  },
  'completion-panel': {
    url: publicAssetUrl('ui/completion.uikitml'),
    type: AssetType.UIKitML,
    name: 'Completion Panel',
  },

  // ── Audio ───────────────────────────────────────────────────────────────
  'discover-chime': {
    url: publicAssetUrl('audio/chime.mp3'),
    type: AssetType.Audio,
    name: 'Discovery Chime',
  },
});
