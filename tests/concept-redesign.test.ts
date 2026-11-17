/**
 * Advenquo: Complete Game Concept Redesign Test Suite
 *
 * Validates the full transformation from former language-learning concept
 * to the new primary identity: Advenquo Construction and Building Game.
 *
 * Verifies:
 * 1. Landing page (index.html) displays construction identity with no legacy cultural journey menus
 * 2. Spatial UIKitML intro and completion panels display construction branding
 * 3. Scene composition includes the construction workshop and interactive materials
 * 4. Multi-tier project library (Small House, Duplex, Bridge, Castle, Sandbox)
 * 5. Seated two-handed VR construction mechanics
 * 6. Technology preservation (Three.js, IWSDK, WebXR, Havok)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  BLUEPRINT_LIBRARY,
  getBlueprintById,
  challengeManager,
  assemblySystem,
  getComponentSpec,
} from '../src/construction/index.js';

describe('Advenquo: Complete Game Concept Redesign', () => {
  describe('1. Landing Page & Primary UI Identity (index.html)', () => {
    const htmlPath = resolve(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');

    it('displays the construction game title and branding on first screen', () => {
      assert.ok(html.includes('Advenquo: VR Construction & Building Game'), 'Title must be Construction Game');
      assert.ok(html.includes('VR Construction & Building World'), 'Subtitle must be Construction World');
      assert.ok(html.includes('Enter VR Workshop'), 'Primary VR button must target Workshop');
      assert.ok(html.includes('Materials Supply Bay'), 'Dock must present construction materials');
    });

    it('does not display former language-learning or cultural journey menus on the main screen', () => {
      assert.strictEqual(html.includes('Yoruba Cultural Journey'), false, 'Old Yoruba Cultural Journey title must be removed');
      assert.strictEqual(html.includes('Sacred Artefacts'), false, 'Old Sacred Artefacts tray must be removed');
      assert.strictEqual(html.includes('E ku oriire'), false, 'Old language greeting must be removed from landing page');
      assert.strictEqual(html.includes('Carved Igba Gourd'), false, 'Old gourd cultural text must be removed');
      assert.strictEqual(html.includes('Gangan of Kings'), false, 'Old drum cultural text must be removed');
    });

    it('provides multi-project selection in the blueprint library modal', () => {
      assert.ok(html.includes('Eco-Pavilion Small House'));
      assert.ok(html.includes('Two-Story Duplex Villa'));
      assert.ok(html.includes('Engineered Viaduct Bridge'));
      assert.ok(html.includes('Fortified Stone Manor & Towers'));
      assert.ok(html.includes('Creative Construction Sandbox'));
    });
  });

  describe('2. In-Headset Spatial UI Panels (intro.uikitml & completion.uikitml)', () => {
    const introPath = resolve(process.cwd(), 'public/ui/intro.uikitml');
    const intro = readFileSync(introPath, 'utf-8');

    const completionPath = resolve(process.cwd(), 'public/ui/completion.uikitml');
    const completion = readFileSync(completionPath, 'utf-8');

    it('intro panel immediately communicates seated two-handed VR construction', () => {
      assert.ok(intro.includes('VR Construction World'));
      assert.ok(intro.includes('Sit comfortably and use both hands'));
      assert.ok(intro.includes('Enter VR Workshop'));
      assert.strictEqual(intro.includes('Yoruba Cultural Journey'), false);
    });

    it('completion panel celebrates engineering certification rather than language discovery', () => {
      assert.ok(completion.includes('STRUCTURE CERTIFIED!'));
      assert.ok(completion.includes('Validation Passed'));
      assert.ok(completion.includes('load-path continuity to the foundation pad'));
      assert.strictEqual(completion.includes('E ku oriire!'), false);
    });
  });

  describe('3. Scene Composition & Workshop Integration', () => {
    const scenePath = resolve(process.cwd(), 'public/scenes/main.iwsdk.scene.json');
    const scene = JSON.parse(readFileSync(scenePath, 'utf-8'));
    const nodeIds = scene.nodes.map((n: any) => n.id);

    it('authors the construction workshop as a primary scene environment node', () => {
      assert.ok(nodeIds.includes('construction-workshop'), 'construction-workshop node must exist');
      const workshopNode = scene.nodes.find((n: any) => n.id === 'construction-workshop');
      assert.strictEqual(workshopNode.content.asset, 'construction-workshop');
      assert.ok(workshopNode.components.ConstructionWorkshopState);
    });

    it('authors interactive modular starter blocks with proper grab components', () => {
      assert.ok(nodeIds.includes('starter-clay-brick-1'));
      assert.ok(nodeIds.includes('starter-concrete-block-1'));
      assert.ok(nodeIds.includes('starter-column-1'));
      assert.ok(nodeIds.includes('starter-beam-1'));

      const colNode = scene.nodes.find((n: any) => n.id === 'starter-column-1');
      assert.ok(colNode.components.TwoHandsGrabbable, 'Heavy columns must use TwoHandsGrabbable');

      const brickNode = scene.nodes.find((n: any) => n.id === 'starter-clay-brick-1');
      assert.ok(brickNode.components.OneHandGrabbable, 'Bricks must use OneHandGrabbable');
    });
  });

  describe('4. Blueprint Library & Multi-Tier Challenges', () => {
    it('provides all 5 construction challenges across bungalows, duplexes, bridges, castles, and sandbox', () => {
      const projects = ['small_house_challenge', 'duplex_villa', 'arched_bridge', 'castle_manor', 'creative_sandbox'];

      for (const p of projects) {
        const bp = getBlueprintById(p);
        assert.ok(bp, `Missing blueprint: ${p}`);
        assert.strictEqual(bp.id, p);
        assert.ok(bp.title.length > 0);
        assert.ok(bp.stages.length > 0);
      }
    });

    it('allows dynamic blueprint switching in ChallengeManager', () => {
      challengeManager.selectBlueprint('duplex_villa');
      assert.strictEqual(challengeManager.getBlueprint().id, 'duplex_villa');
      assert.strictEqual(challengeManager.getCurrentStageIndex(), 1);

      challengeManager.selectBlueprint('creative_sandbox');
      assert.strictEqual(challengeManager.getBlueprint().id, 'creative_sandbox');

      // Return to small house
      challengeManager.selectBlueprint('small_house_challenge');
      assert.strictEqual(challengeManager.getBlueprint().id, 'small_house_challenge');
    });
  });

  describe('5. Technology & Comfort Standards Preservation', () => {
    it('preserves Meta Quest hand tracking and snap turning in project configuration', () => {
      const configPath = resolve(process.cwd(), 'iwsdk.config.json');
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));

      assert.strictEqual(config.world.xr.mode, 'vr');
      assert.strictEqual(config.world.xr.features.handTracking, true);
      assert.strictEqual(config.world.features.grabbing.useHandPinchForGrab, true);
      assert.strictEqual(config.world.features.physics, true);
      assert.strictEqual(config.world.features.locomotion.turningMethod, 'snap');
    });

    it('preserves component catalog specifications for all 7 modular building materials', () => {
      const catalog = ['clay_brick', 'concrete_block', 'reinforced_column', 'horizontal_beam', 'floor_component', 'wall_panel', 'roof_panel'];
      for (const type of catalog) {
        const spec = getComponentSpec(type as any);
        assert.ok(spec.massKg > 0);
        assert.ok(spec.dimensions.length === 3);
        assert.ok(spec.snapPoints.length > 0);
      }
    });
  });
});
