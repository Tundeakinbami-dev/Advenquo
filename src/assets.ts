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

// Common Interactive & Architectural Assets
import { buildInteractiveDoor } from './scene-assets/interactive-door.scene-asset.js';
import { buildMovingPedestrian } from './scene-assets/moving-pedestrian.scene-asset.js';

// 1. Traditional Nigerian Market Assets
import { buildAdireCloth } from './scene-assets/adire-cloth.scene-asset.js';
import { buildCalabash } from './scene-assets/calabash.scene-asset.js';
import { buildCourtyardVeranda } from './scene-assets/courtyard-veranda.scene-asset.js';
import { buildDeliveryClueScroll } from './scene-assets/delivery-clue-scroll.scene-asset.js';
import { buildDisplayTable } from './scene-assets/display-table.scene-asset.js';
import { buildDistrictSign } from './scene-assets/district-sign.scene-asset.js';
import { buildKolaNut } from './scene-assets/kola-nut.scene-asset.js';
import { buildMarketGround } from './scene-assets/market-ground.scene-asset.js';
import { buildMarketProps } from './scene-assets/market-props.scene-asset.js';
import { buildMarketStall } from './scene-assets/market-stall.scene-asset.js';
import { buildMarketStorehouse } from './scene-assets/market-storehouse.scene-asset.js';
import { buildMissingGoodsCrate } from './scene-assets/missing-goods-crate.scene-asset.js';
import { buildNpcBabaAdewale } from './scene-assets/npc-baba-adewale.scene-asset.js';
import { buildNpcIyaAlaso } from './scene-assets/npc-iya-alaso.scene-asset.js';
import { buildTalkingDrum } from './scene-assets/talking-drum.scene-asset.js';

// 2. Lagos Urban Transit & Tech Assets
import { buildDanfoFareBox } from './scene-assets/danfo-fare-box.scene-asset.js';
import { buildNpcTundeBakare } from './scene-assets/npc-tunde-bakare.scene-asset.js';
import { buildNpcUrbanDriver } from './scene-assets/npc-urban-driver.scene-asset.js';
import { buildSmartIotBeacon } from './scene-assets/smart-iot-beacon.scene-asset.js';
import { buildTechHubInterior } from './scene-assets/tech-hub-interior.scene-asset.js';
import { buildUrbanDanfoBus } from './scene-assets/urban-danfo-bus.scene-asset.js';
import { buildUrbanGround } from './scene-assets/urban-ground.scene-asset.js';
import { buildUrbanTechHub } from './scene-assets/urban-tech-hub.scene-asset.js';

// 2b. Tobi's Story & Architectural World Assets
import { buildArchitectStudio } from './scene-assets/architect-studio.scene-asset.js';
import { buildConstructionSite } from './scene-assets/construction-site.scene-asset.js';
import { buildBukaRestaurant } from './scene-assets/buka-restaurant.scene-asset.js';
import { buildLagosStreetInfrastructure } from './scene-assets/lagos-street-infrastructure.scene-asset.js';
import { buildNpcTobi } from './scene-assets/npc-tobi.scene-asset.js';
import { buildNpcKunleContractor } from './scene-assets/npc-kunle-contractor.scene-asset.js';
import { buildNpcFolakeMentor } from './scene-assets/npc-folake-mentor.scene-asset.js';

// 3. Cultural Heritage Palace Assets
import { buildNpcOloriMorenike } from './scene-assets/npc-olori-morenike.scene-asset.js';
import { buildNpcPalaceChief } from './scene-assets/npc-palace-chief.scene-asset.js';
import { buildObaStaff } from './scene-assets/oba-staff.scene-asset.js';
import { buildPalaceChamberInterior } from './scene-assets/palace-chamber-interior.scene-asset.js';
import { buildPalaceGround } from './scene-assets/palace-ground.scene-asset.js';
import { buildPalacePillars } from './scene-assets/palace-pillars.scene-asset.js';
import { buildPalaceThroneDais } from './scene-assets/palace-throne-dais.scene-asset.js';
import { buildRoyalCoralNecklace } from './scene-assets/royal-coral-necklace.scene-asset.js';

// 4. Natural Coastal Environment Assets
import { buildBeachCabana } from './scene-assets/beach-cabana.scene-asset.js';
import { buildCoastalGround } from './scene-assets/coastal-ground.scene-asset.js';
import { buildCoastalHut } from './scene-assets/coastal-hut.scene-asset.js';
import { buildCoconutPalm } from './scene-assets/coconut-palm.scene-asset.js';
import { buildFishingCanoe } from './scene-assets/fishing-canoe.scene-asset.js';
import { buildFreshCoconut } from './scene-assets/fresh-coconut.scene-asset.js';
import { buildNpcAmaraMarine } from './scene-assets/npc-amara-marine.scene-asset.js';
import { buildNpcFisherman } from './scene-assets/npc-fisherman.scene-asset.js';
import { buildSeaShell } from './scene-assets/sea-shell.scene-asset.js';

const publicAssetUrl = (filePath: string): string =>
  `${import.meta.env.BASE_URL}${filePath.replace(/^\/+/u, '')}`;

export default defineAssets({
  // ── Common Shared Assets ──────────────────────────────────────────────────
  'interactive-door': buildInteractiveDoor(),
  'moving-pedestrian': buildMovingPedestrian(),

  // ── 1. Traditional Nigerian Market (Ìsàlẹ̀ Èkó) ───────────────────────────
  'market-ground': buildMarketGround(),
  'courtyard-veranda': buildCourtyardVeranda(),
  'market-stall': buildMarketStall(),
  'market-props': buildMarketProps(),
  'market-storehouse': buildMarketStorehouse(),
  'district-sign': buildDistrictSign(),
  'display-table': buildDisplayTable(),
  'adire-cloth': buildAdireCloth(),
  'talking-drum': buildTalkingDrum(),
  calabash: buildCalabash(),
  'kola-nut': buildKolaNut(),
  'missing-goods-crate': buildMissingGoodsCrate(),
  'delivery-clue-scroll': buildDeliveryClueScroll(),
  'npc-baba-adewale': buildNpcBabaAdewale(),
  'npc-iya-alaso': buildNpcIyaAlaso(),

  // ── 2. Lagos Urban Transit & Tech Hub (Yaba) ─────────────────────────────
  'urban-ground': buildUrbanGround(),
  'urban-tech-hub': buildUrbanTechHub(),
  'tech-hub-interior': buildTechHubInterior(),
  'urban-danfo-bus': buildUrbanDanfoBus(),
  'danfo-fare-box': buildDanfoFareBox(),
  'smart-iot-beacon': buildSmartIotBeacon(),
  'npc-urban-driver': buildNpcUrbanDriver(),
  'npc-tunde-bakare': buildNpcTundeBakare(),

  // ── 2b. Tobi's World (Studio Kán, Eco-Terrace Build & Buka) ─────────────
  'architect-studio': buildArchitectStudio(),
  'construction-site': buildConstructionSite(),
  'buka-restaurant': buildBukaRestaurant(),
  'npc-tobi': buildNpcTobi(),
  'npc-kunle-contractor': buildNpcKunleContractor(),
  'npc-folake-mentor': buildNpcFolakeMentor(),
  'lagos-street-infrastructure': buildLagosStreetInfrastructure(),

  // ── 3. Historical Cultural Heritage (Iga Idunganran Palace) ───────────────
  'palace-ground': buildPalaceGround(),
  'palace-pillars': buildPalacePillars(),
  'palace-throne-dais': buildPalaceThroneDais(),
  'palace-chamber-interior': buildPalaceChamberInterior(),
  'oba-staff': buildObaStaff(),
  'royal-coral-necklace': buildRoyalCoralNecklace(),
  'npc-palace-chief': buildNpcPalaceChief(),
  'npc-olori-morenike': buildNpcOloriMorenike(),

  // ── 4. Natural Coastal Island (Tarkwa Bay) ────────────────────────────────
  'coastal-ground': buildCoastalGround(),
  'coconut-palm': buildCoconutPalm(),
  'fishing-canoe': buildFishingCanoe(),
  'beach-cabana': buildBeachCabana(),
  'coastal-hut': buildCoastalHut(),
  'sea-shell': buildSeaShell(),
  'fresh-coconut': buildFreshCoconut(),
  'npc-fisherman': buildNpcFisherman(),
  'npc-amara-marine': buildNpcAmaraMarine(),

  // ── Spatial UI panels (UIKitML) ─────────────────────────────────────────
  'intro-panel': {
    url: publicAssetUrl('ui/intro.uikitml'),
    type: AssetType.UIKitML,
    name: 'Intro Panel',
  },
  'npc-dialogue-panel': {
    url: publicAssetUrl('ui/npc-dialogue.uikitml'),
    type: AssetType.UIKitML,
    name: 'NPC Dialogue Panel',
  },
  'vr-nav-tablet': {
    url: publicAssetUrl('ui/vr-nav-tablet.uikitml'),
    type: AssetType.UIKitML,
    name: 'VR Navigation Tablet',
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
