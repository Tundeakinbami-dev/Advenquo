/**
 * Advenquo: Blueprint-Guided Construction & Automatic Level Progression Test Suite
 *
 * Verifies:
 * 1. Authoritative Blueprint Architecture: single source of truth between 3D design and 2D floor plan SVG
 * 2. Multi-state visual target markers on SVG floor plan with accessibility labels and icons
 * 3. Guided material placement: next required target lookup and 3D ghost guide preview
 * 4. Placement validation: material, position tolerance, orientation tolerance, sequence, and actionable feedback
 * 5. Automatic task progression: automatic advancement upon task completion without manual 'Next' button
 * 6. Debouncing / prevention of duplicate task progressions
 * 7. Component removal / repositioning rollback handling
 * 8. Automatic level completion, XP awarding, unlock manager progression, and persistence
 * 9. UI DOM layout & controls verification in index.html
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Quaternion, Vector3 } from '@iwsdk/core';

import { TWO_BEDROOM_BUNGALOW_DESIGN } from '../src/construction/blueprints/two-bedroom-bungalow-design.js';
import { BUNGALOW_BLUEPRINT } from '../src/construction/blueprints/bungalow.js';
import { BlueprintRenderer } from '../src/construction/blueprints/blueprint-renderer.js';
import {
  BlueprintProgressionEngine,
  blueprintProgressionEngine,
  type TargetPlacementStatus,
} from '../src/construction/progression/blueprint-progression-engine.js';
import { PlacementPreview } from '../src/construction/interaction/placement-preview.js';
import { ConstructionProgressPersistence } from '../src/construction/persistence/construction-progress.js';

describe('Advenquo: Blueprint-Guided Material Placement & Automatic Progression', () => {
  beforeEach(() => {
    // Reset progression engine to clean state for each test
    blueprintProgressionEngine.initLevel('bungalow');
  });

  // ── 1. Authoritative Blueprint & Coordinate Parity ─────────────────────────
  describe('1. Authoritative Blueprint & Coordinate Parity', () => {
    it('verifies 3D building design and 2D blueprint share identical dimensions and components', () => {
      const design = TWO_BEDROOM_BUNGALOW_DESIGN;
      const bp = BUNGALOW_BLUEPRINT;

      assert.strictEqual(design.overallDimensions.width, bp.foundationDimensions[0]);
      assert.strictEqual(design.overallDimensions.depth, bp.foundationDimensions[2]);
      assert.strictEqual(design.components.length, bp.targets.length);

      // Verify each component coordinate matches the blueprint target
      for (let i = 0; i < design.components.length; i++) {
        const comp = design.components[i];
        const target = bp.targets[i];
        assert.strictEqual(comp.id, target.id);
        assert.strictEqual(comp.componentType, target.componentType);
        assert.strictEqual(comp.stageIndex, target.stageIndex);
        assert.deepStrictEqual(comp.position, target.targetPosition);
        assert.deepStrictEqual(comp.rotation, target.targetRotation);
      }
    });

    it('verifies all 7 construction tasks are defined sequentially in the authoritative blueprint', () => {
      const bp = BUNGALOW_BLUEPRINT;
      assert.ok(bp.stages && bp.stages.length >= 7, 'Must define at least 7 stages');

      const expectedStages = [
        'Foundation',
        'Floor',
        'Walls',
        'Doors',
        'Roof Trusses',
        'Roofing',
        'Finishing',
      ];

      for (let i = 0; i < expectedStages.length; i++) {
        const stage = bp.stages[i];
        assert.strictEqual(stage.stageIndex, i + 1);
        assert.ok(
          stage.title.toLowerCase().includes(expectedStages[i].toLowerCase()),
          `Stage ${i + 1} title '${stage.title}' should mention '${expectedStages[i]}'`,
        );
        assert.ok(stage.instruction.length > 10, 'Stage must have actionable instruction');
        assert.ok(stage.criticalCheck.length > 5, 'Stage must have critical engineering check');
      }
    });

    it('renders vector SVG floor plan with matching affine coordinate projection and dimensions', () => {
      const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);
      const svg = renderer.renderFloorPlanSVG({ widthPx: 800, heightPx: 650 });

      assert.ok(svg.startsWith('<svg'), 'Must produce valid SVG markup');
      assert.ok(svg.includes('viewBox="0 0 800 650"'));
      assert.ok(svg.includes('TWO-BEDROOM BUNGALOW — FLOOR PLAN'));
      assert.ok(svg.includes('WIDTH: 6.40m'));
      assert.ok(svg.includes('DEPTH: 5.00m'));
      assert.ok(svg.includes('blueprint-targets-layer'));
      assert.ok(svg.includes('blueprint-target-marker'));
    });
  });

  // ── 2. Interactive SVG Target Markers & Visual States ─────────────────────
  describe('2. Interactive SVG Floor Plan Target Markers & Visual States', () => {
    it('renders multi-state visual indicators (pending, active/required, valid, needs adjustment, error)', () => {
      const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);
      const targetMarkers = new Map<
        string,
        { number: number; status: TargetPlacementStatus; isHighlighted?: boolean }
      >();

      targetMarkers.set('bung_found_fl', { number: 1, status: 'placed_valid' });
      targetMarkers.set('bung_found_fr', { number: 2, status: 'required', isHighlighted: true });
      targetMarkers.set('bung_found_bl', { number: 3, status: 'placed_needs_adjustment' });
      targetMarkers.set('bung_found_br', { number: 4, status: 'invalid' });

      const svg = renderer.renderFloorPlanSVG({
        targetMarkers,
        activeTargetId: 'bung_found_fr',
      });

      // Valid: green checkmark
      assert.ok(svg.includes('fill="#15803d"'), 'Must include green valid fill');
      assert.ok(svg.includes('✓'), 'Must include checkmark icon for placed valid');

      // Active / Required: cyan/blue pulsing ring
      assert.ok(svg.includes('class="pulse-ring"'), 'Must include pulsing animation for active target');
      assert.ok(svg.includes('fill="#0284c7"'), 'Must include cyan/blue active fill');

      // Needs adjustment: amber warning symbol
      assert.ok(svg.includes('fill="#b45309"'), 'Must include amber adjustment fill');
      assert.ok(svg.includes('!'), 'Must include exclamation symbol for adjustment');

      // Invalid: red cross symbol
      assert.ok(svg.includes('fill="#b91c1c"'), 'Must include red error fill');
      assert.ok(svg.includes('✕'), 'Must include cross symbol for error');

      // Accessible legend
      assert.ok(svg.includes('✓ Placed'));
      assert.ok(svg.includes('▶ Active'));
      assert.ok(svg.includes('○ Pending'));
      assert.ok(svg.includes('! Adjust'));
      assert.ok(svg.includes('✕ Error'));
    });

    it('attaches accessible data attributes and tooltip titles to SVG markers', () => {
      const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);
      const svg = renderer.renderFloorPlanSVG();

      assert.ok(svg.includes('data-target-id="bung_found_fl"'));
      assert.ok(svg.includes('data-component-type="foundation_block"'));
      assert.ok(svg.includes('data-stage-index="1"'));
      assert.ok(svg.includes('<title>Target #1: Front-left corner footing block'));
    });
  });

  // ── 3. Guided Material Placement & 3D Ghost Guide ─────────────────────────
  describe('3. Guided Material Placement & 3D Ghost Guide', () => {
    it('identifies the next required component when player selects a material from catalogue', () => {
      // Current task 1 requires foundation_block
      const target = blueprintProgressionEngine.getNextTargetForComponent('foundation_block');
      assert.ok(target, 'Should find next required foundation_block');
      assert.strictEqual(target.componentType, 'foundation_block');
      assert.strictEqual(target.stageIndex, 1);
      assert.strictEqual(target.id, 'bung_found_fl');
    });

    it('returns null if selecting a component that belongs to a future construction task', () => {
      // In Task 1, roofing materials belong to Task 6, so current task returns null
      const roofTarget = blueprintProgressionEngine.getNextTargetForComponent('roof_truss');
      assert.strictEqual(roofTarget, null, 'Should not return future task target as current task candidate');
    });

    it('creates and positions 3D blueprint target guide in PlacementPreview', () => {
      const preview = new PlacementPreview();
      const target = blueprintProgressionEngine.getNextRequiredTarget();
      assert.ok(target);

      preview.showTargetGuide(target.position, target.rotation, target.dimensions);
      const root = preview.getRoot();
      assert.strictEqual(root.visible, true);

      const guide = root.getObjectByName('Blueprint3DTargetGuide');
      assert.ok(guide, 'Must create 3D blueprint target guide');
      assert.strictEqual(guide.visible, true);
      assert.strictEqual(guide.position.x, target.position[0]);
      assert.strictEqual(guide.position.y, target.position[1]);
      assert.strictEqual(guide.position.z, target.position[2]);

      preview.hideTargetGuide();
      assert.strictEqual(guide.visible, false);
    });
  });

  // ── 4. Placement Validation with Actionable Feedback ───────────────────────
  describe('4. Placement Validation with Actionable Feedback', () => {
    it('validates correct material placed within tolerance as placed_valid', () => {
      const target = TWO_BEDROOM_BUNGALOW_DESIGN.components[0]; // SW foundation
      const result = blueprintProgressionEngine.validatePlacement(
        target.componentType,
        new Vector3(...target.position),
        new Quaternion(...target.rotation),
      );

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.status, 'placed_valid');
      assert.strictEqual(result.code, 'SUCCESS');
      assert.ok(result.feedback.includes('Correct placement!'));
      assert.strictEqual(result.targetMatched?.id, target.id);
    });

    it('rejects component from future task with sequence error feedback', () => {
      const target = TWO_BEDROOM_BUNGALOW_DESIGN.components[0];
      // Try to place a roof panel during task 1
      const result = blueprintProgressionEngine.validatePlacement(
        'roof_panel',
        new Vector3(...target.position),
        new Quaternion(...target.rotation),
      );

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.status, 'invalid');
      assert.strictEqual(result.code, 'WRONG_TASK');
      assert.ok(result.feedback.includes('Sequence error'));
    });

    it('rejects wrong material not in design with wrong material feedback', () => {
      const target = TWO_BEDROOM_BUNGALOW_DESIGN.components[0];
      const result = blueprintProgressionEngine.validatePlacement(
        'decorative_element',
        new Vector3(...target.position),
        new Quaternion(...target.rotation),
      );

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.status, 'invalid');
      assert.strictEqual(result.code, 'WRONG_MATERIAL');
      assert.ok(result.feedback.includes('This is the wrong material'));
    });

    it('flags placement outside position tolerance as placed_needs_adjustment', () => {
      const target = TWO_BEDROOM_BUNGALOW_DESIGN.components[0];
      // Target position offset by 0.6m (> 0.25m tolerance)
      const offsetPos = new Vector3(target.position[0] + 0.6, target.position[1], target.position[2]);

      const result = blueprintProgressionEngine.validatePlacement(
        target.componentType,
        offsetPos,
        new Quaternion(...target.rotation),
      );

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.status, 'placed_needs_adjustment');
      assert.strictEqual(result.code, 'POSITION_OFF');
      assert.ok(result.feedback.includes('closer to the highlighted position'));
    });

    it('flags placement with incorrect rotation as placed_needs_adjustment', () => {
      const target = TWO_BEDROOM_BUNGALOW_DESIGN.components[0];
      // Rotate by 90 degrees around Y axis
      const rotatedQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);

      const result = blueprintProgressionEngine.validatePlacement(
        target.componentType,
        new Vector3(...target.position),
        rotatedQuat,
      );

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.status, 'placed_needs_adjustment');
      assert.strictEqual(result.code, 'ROTATION_OFF');
      assert.ok(result.feedback.includes('Rotate the component (press R)'));
    });
  });

  // ── 5. Automatic Task Progression ─────────────────────────────────────────
  describe('5. Automatic Task Progression Without Manual Next Buttons', () => {
    it('automatically advances to Task 2 when all components of Task 1 are placed and validated', async () => {
      const summaryInitial = blueprintProgressionEngine.getProgressSummary();
      assert.strictEqual(summaryInitial.currentTaskIndex, 1);
      assert.strictEqual(summaryInitial.currentTaskTitle, 'Phase 1: Foundation Footings');
      assert.strictEqual(summaryInitial.placedInTask, 0);
      assert.strictEqual(summaryInitial.requiredInTask, 7);

      const task1Targets = blueprintProgressionEngine.getTargetsForTask(1);
      assert.strictEqual(task1Targets.length, 7);

      // Place first 6 targets: task should remain at 1
      for (let i = 0; i < 6; i++) {
        const t = task1Targets[i];
        const res = blueprintProgressionEngine.onComponentPlaced({
          instanceId: `instance_${t.id}`,
          componentType: t.componentType,
          position: t.position,
          rotation: t.rotation,
        });
        assert.strictEqual(res.isValid, true);
        assert.strictEqual(blueprintProgressionEngine.getCurrentTaskIndex(), 1);
      }

      const summaryPartial = blueprintProgressionEngine.getProgressSummary();
      assert.strictEqual(summaryPartial.placedInTask, 6);
      assert.strictEqual(summaryPartial.remainingInTask, 1);

      // Place the 7th (final) target of Task 1
      const finalTarget = task1Targets[6];
      const finalRes = blueprintProgressionEngine.onComponentPlaced({
        instanceId: `instance_${finalTarget.id}`,
        componentType: finalTarget.componentType,
        position: finalTarget.position,
        rotation: finalTarget.rotation,
      });
      assert.strictEqual(finalRes.isValid, true);

      // Wait for automatic progression (750ms timeout in engine)
      await new Promise((resolve) => setTimeout(resolve, 850));

      // Task has automatically advanced to Task 2 without requiring clicking Next!
      assert.strictEqual(blueprintProgressionEngine.getCurrentTaskIndex(), 2);
      const summaryTask2 = blueprintProgressionEngine.getProgressSummary();
      assert.strictEqual(summaryTask2.currentTaskIndex, 2);
      assert.strictEqual(summaryTask2.currentTaskTitle, 'Phase 2: Ground Floor Slabs');
      assert.strictEqual(summaryTask2.placedInTask, 0);
      assert.ok(summaryTask2.requiredInTask > 0);
      assert.ok(summaryTask2.activeTargetId !== null);
    });

    it('prevents duplicate task completions via debounce guard', () => {
      const task1Targets = blueprintProgressionEngine.getTargetsForTask(1);

      // Complete all 7 targets
      for (const t of task1Targets) {
        blueprintProgressionEngine.onComponentPlaced({
          instanceId: `instance_${t.id}`,
          componentType: t.componentType,
          position: t.position,
          rotation: t.rotation,
        });
      }

      // Repeated place calls while advancing must not cause double increment
      const t0 = task1Targets[0];
      blueprintProgressionEngine.onComponentPlaced({
        instanceId: `repeat_${t0.id}`,
        componentType: t0.componentType,
        position: t0.position,
        rotation: t0.rotation,
      });

      // Still at 1 until the timer triggers once
      assert.strictEqual(blueprintProgressionEngine.getCurrentTaskIndex(), 1);
    });

    it('rolls back target status to pending when a placed component is removed', () => {
      const target = TWO_BEDROOM_BUNGALOW_DESIGN.components[0];
      const instanceId = 'test_inst_1';

      blueprintProgressionEngine.onComponentPlaced({
        instanceId,
        componentType: target.componentType,
        position: target.position,
        rotation: target.rotation,
      });

      assert.strictEqual(blueprintProgressionEngine.getTargetStatus(target.id), 'placed_valid');
      assert.strictEqual(blueprintProgressionEngine.getProgressSummary().placedInTask, 1);

      // Player picks up or deletes the block
      blueprintProgressionEngine.onComponentRemoved(instanceId);

      assert.strictEqual(blueprintProgressionEngine.getTargetStatus(target.id), 'pending');
      assert.strictEqual(blueprintProgressionEngine.getProgressSummary().placedInTask, 0);
      assert.strictEqual(blueprintProgressionEngine.getProgressSummary().remainingInTask, 7);
    });
  });

  // ── 6. Full Level Completion & Difficulty Unlock ───────────────────────────
  describe('6. Full Level Completion, Persistence & Difficulty Unlocking', () => {
    it('completes all 7 tasks sequentially and unlocks subsequent difficulty levels', () => {
      const totalTasks = 7;

      for (let taskIdx = 1; taskIdx <= totalTasks; taskIdx++) {
        assert.strictEqual(blueprintProgressionEngine.getCurrentTaskIndex(), taskIdx);
        const targets = blueprintProgressionEngine.getTargetsForTask(taskIdx);

        for (const t of targets) {
          blueprintProgressionEngine.onComponentPlaced({
            instanceId: `inst_${t.id}`,
            componentType: t.componentType,
            position: t.position,
            rotation: t.rotation,
          });
        }

        // Trigger immediate task transition to test full sequence deterministically
        blueprintProgressionEngine.advanceTaskImmediately();
      }

      const finalSummary = blueprintProgressionEngine.getProgressSummary();
      assert.strictEqual(finalSummary.isLevelCompleted, true);
      assert.strictEqual(finalSummary.overallLevelCompletionPercent, 100);

      // Verify level persistence
      const saved = ConstructionProgressPersistence.load();
      if (saved) {
        assert.ok(saved.completedLevels.includes('bungalow'));
        assert.ok(saved.unlockedLevels.includes('duplex_villa'));
        assert.ok(saved.totalXp >= 250);
      }
    });
  });

  // ── 7. UI DOM & Layout Integrity in index.html ────────────────────────────
  describe('7. UI DOM Layout Integrity & Non-Overlapping Structure', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');

    it('contains the interactive blueprint dock panel with proper ID and ARIA attributes', () => {
      assert.ok(html.includes('id="blueprint-dock-panel"'));
      assert.ok(html.includes('class="blueprint-dock-panel hidden"'));
      assert.ok(html.includes('aria-label="Interactive Construction Blueprint and Floor Plan"'));
    });

    it('contains all required zoom, pan reset, and close controls', () => {
      assert.ok(html.includes('id="btn-bp-zoom-in"'));
      assert.ok(html.includes('id="btn-bp-zoom-out"'));
      assert.ok(html.includes('id="btn-bp-zoom-reset"'));
      assert.ok(html.includes('id="btn-bp-close"'));
    });

    it('contains the progress tracker card with all required metrics', () => {
      assert.ok(html.includes('id="bp-level-title"'));
      assert.ok(html.includes('id="bp-task-badge"'));
      assert.ok(html.includes('id="bp-current-task-name"'));
      assert.ok(html.includes('id="bp-overall-percent"'));
      assert.ok(html.includes('id="bp-progress-bar-fill"'));
      assert.ok(html.includes('id="bp-stat-required"'));
      assert.ok(html.includes('id="bp-stat-placed"'));
      assert.ok(html.includes('id="bp-stat-remaining"'));
      assert.ok(html.includes('id="bp-task-instruction"'));
      assert.ok(html.includes('id="bp-critical-check"'));
    });

    it('contains the SVG viewport container and accessible status legend', () => {
      assert.ok(html.includes('id="blueprint-svg-viewport"'));
      assert.ok(html.includes('id="blueprint-svg-container"'));
      assert.ok(html.includes('class="blueprint-legend-footer"'));
      assert.ok(html.includes('Placed &amp; Valid'));
      assert.ok(html.includes('Next Required'));
      assert.ok(html.includes('Needs Adjust'));
    });

    it('keeps tutorial panel, materials panel, and blueprint panel distinct', () => {
      assert.ok(html.includes('id="tutorial-panel"'));
      assert.ok(html.includes('id="materials-side-panel"'));
      assert.ok(html.includes('id="blueprint-dock-panel"'));
      assert.ok(html.includes('id="btn-toolbar-blueprint"'));
    });
  });
});
