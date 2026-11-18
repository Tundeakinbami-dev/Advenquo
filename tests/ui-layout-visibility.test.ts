import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { constructionTutorialManager, TUTORIAL_STEPS } from '../src/construction/progression/construction-tutorial-manager.js';

describe('Advenquo: UI Layout & Gameplay Visibility', () => {
  const htmlPath = resolve(process.cwd(), 'index.html');
  const html = readFileSync(htmlPath, 'utf-8');

  const cssPath = resolve(process.cwd(), 'src/styles/responsive.css');
  const css = readFileSync(cssPath, 'utf-8');

  const vrTabletPath = resolve(process.cwd(), 'public/ui/vr-nav-tablet.uikitml');
  const vrTablet = readFileSync(vrTabletPath, 'utf-8');

  describe('1. Three-Zone Screen Layout Structure', () => {
    it('provides Left Zone with dedicated compact collapsible tutorial panel', () => {
      assert.ok(html.includes('id="tutorial-panel"'), 'Must have tutorial-panel container');
      assert.ok(html.includes('id="tutorial-step-indicator"'), 'Must have tutorial-step-indicator');
      assert.ok(html.includes('id="tutorial-step-title"'), 'Must have tutorial-step-title');
      assert.ok(html.includes('id="tutorial-text"'), 'Must have tutorial-text for explanation');
      assert.ok(html.includes('id="tutorial-hint-box"'), 'Must have tutorial-hint-box');
      assert.ok(html.includes('id="btn-tutorial-back"'), 'Must have Back navigation control');
      assert.ok(html.includes('id="btn-tutorial-next"'), 'Must have Next navigation control');
      assert.ok(html.includes('id="btn-tutorial-collapse"'), 'Must have Collapse control');
      assert.ok(html.includes('id="btn-tutorial-close"'), 'Must have Close control');
      assert.ok(html.includes('id="tutorial-collapsed-pill"'), 'Must have tutorial-collapsed-pill when minimized');
    });

    it('clears Center Zone: no giant centered overhead banners blocking building pad', () => {
      // Old overhead banners should not exist in active overlay
      assert.strictEqual(
        html.includes('class="progress-hud" id="progress-hud"'),
        false,
        'Old centered progress-hud must be replaced by compact left panel and header pill',
      );
      assert.strictEqual(
        html.includes('class="desktop-controls-banner" id="desktop-controls-banner"'),
        false,
        'Old centered desktop-controls-banner must be replaced by bottom toolbar and on-demand popover',
      );
      assert.ok(html.includes('id="web-counter"'), 'Stage title counter must remain accessible in header pill');
    });

    it('provides Right Zone with accessible scrollable materials panel and visible toggle', () => {
      assert.ok(html.includes('id="materials-side-panel"'), 'Materials side panel must exist');
      assert.ok(html.includes('id="btn-close-materials"'), 'Must have materials close button');
      assert.ok(html.includes('id="palette-cards-container"'), 'Must have scrollable cards container');
      assert.ok(html.includes('id="fab-materials-toggle"'), 'Floating materials button must remain available');
      assert.ok(html.includes('id="nav-materials"'), 'Navigation bar materials button must exist');
    });

    it('provides Bottom Zone with dedicated game controls toolbar', () => {
      assert.ok(html.includes('id="game-controls-toolbar"'), 'Must have game-controls-toolbar');
      assert.ok(html.includes('id="btn-toolbar-materials"'), 'Must have toolbar Materials button');
      assert.ok(html.includes('id="btn-toolbar-validate"'), 'Must have toolbar Validate button');
      assert.ok(html.includes('id="btn-toolbar-undo"'), 'Must have toolbar Undo button');
      assert.ok(html.includes('id="btn-toolbar-reset"'), 'Must have toolbar Reset button');
      assert.ok(html.includes('id="btn-toolbar-blueprint"'), 'Must have toolbar Blueprints button');
      assert.ok(html.includes('id="btn-toolbar-tutorial"'), 'Must have toolbar Tutorial button');
      assert.ok(html.includes('id="btn-toolbar-controls"'), 'Must have toolbar Controls button');
    });

    it('provides placement feedback banner and keyboard controls popover', () => {
      assert.ok(html.includes('id="placement-status-chip"'), 'Must have placement-status-chip');
      assert.ok(html.includes('id="btn-cancel-placement-chip"'), 'Must have cancel button on placement chip');
      assert.ok(html.includes('id="controls-popover"'), 'Must have controls-popover');
      assert.ok(html.includes('id="btn-close-controls-popover"'), 'Must have close button on controls popover');
    });
  });

  describe('2. CSS Positioning, Z-Index, and Pointer Event Pass-through', () => {
    it('ensures web overlay lets clicks pass through to 3D canvas', () => {
      assert.ok(css.includes('#web-overlay {'), 'Must style web-overlay');
      assert.ok(css.includes('pointer-events: none'), 'web-overlay must have pointer-events: none');
    });

    it('ensures tutorial panel is positioned on left and does not cover building center', () => {
      assert.ok(css.includes('.tutorial-panel {'), 'Must style tutorial-panel');
      assert.ok(css.includes('left: 20px') || css.includes('left: 10px'), 'Must position on left');
      assert.ok(css.includes('max-height: calc(100vh - 160px)'), 'Must constrain max-height to avoid overflow');
    });

    it('ensures game controls toolbar is positioned at the bottom', () => {
      assert.ok(css.includes('.game-controls-toolbar {'), 'Must style game-controls-toolbar');
      assert.ok(css.includes('left: 50%') && css.includes('transform: translateX(-50%)'), 'Must center toolbar at bottom');
      assert.ok(css.includes('min-height: 44px') || css.includes('min-height: 40px'), 'Buttons must be comfortably touch-accessible');
    });

    it('ensures responsive media queries adapt cleanly without layout overlap', () => {
      assert.ok(css.includes('@media screen and (max-width: 768px)'), 'Must have tablet/mobile media query');
      assert.ok(css.includes('@media screen and (max-width: 420px)'), 'Must have small mobile media query');
    });
  });

  describe('3. Tutorial Manager Step Navigation', () => {
    it('manages 8 progressive tutorial steps with nextStep and previousStep', () => {
      constructionTutorialManager.reset();
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 1);
      assert.strictEqual(constructionTutorialManager.getTotalSteps(), 8);

      const step1 = constructionTutorialManager.getCurrentStep();
      assert.strictEqual(step1.index, 1);
      assert.ok(step1.title.length > 0);
      assert.ok(step1.instruction.length > 0);

      // Advance
      constructionTutorialManager.nextStep();
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 2);

      // Previous
      constructionTutorialManager.previousStep();
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 1);

      // Previous at step 1 clamps to 1
      constructionTutorialManager.previousStep();
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 1);

      // Jump to step
      constructionTutorialManager.goToStep(5);
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 5);

      // Jump beyond bounds is ignored
      constructionTutorialManager.goToStep(99);
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 5);

      constructionTutorialManager.reset();
      assert.strictEqual(constructionTutorialManager.getCurrentStepIndex(), 1);
    });
  });

  describe('4. VR Spatial Layout & Obstructive Panel Mitigation', () => {
    it('adds Hide Tablet control in vr-nav-tablet.uikitml to clear building view', () => {
      assert.ok(vrTablet.includes('id="btn-tablet-minimize"'), 'vr-nav-tablet must have minimize/hide control');
      assert.ok(vrTablet.includes('Hide Tablet'), 'Must have readable label for hiding tablet');
    });

    it('preserves complete WebXR overlay concealment in VR', () => {
      assert.ok(css.includes('#web-overlay.in-vr'), 'Must have in-vr rules');
      assert.ok(css.includes('display: none !important'), '2D overlay must be hidden in VR');
    });
  });
});
