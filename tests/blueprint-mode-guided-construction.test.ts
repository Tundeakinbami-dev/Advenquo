/**
 * Advenquo: Blueprint Mode & Guided Construction System Test Suite
 *
 * Verifies:
 * 1. Authoritative Building Design (Two-Bedroom Bungalow) schema, metrics, and room schedule
 * 2. Metric consistency between 3D reference model, floor plan, and 4 elevations
 * 3. Exploded construction view (9 layers, smooth offset interpolation, isolation, toggling)
 * 4. Guided 7-phase construction engine sequence and instructions
 * 5. Blueprint-to-workspace component linking and highlighting
 * 6. Blueprint lifecycle states: study mode, workspace pinning (left/right), hide/reopen
 * 7. Blueprint-based construction validation across all categories (foundation, floor, walls, partitions, doors, windows, roof)
 * 8. Hand placement tolerances (±0.20m, ±25°) and educational scoring
 * 9. 3-tier assistance system (visual hints, guided architectural notes, assembly demonstrations)
 * 10. Seated VR ergonomics, desktop interaction fallback, and VR comfort protections
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  TWO_BEDROOM_BUNGALOW_DESIGN,
  CONSTRUCTION_LAYERS,
  ELEVATION_DATUMS,
  BlueprintRenderer,
  BlueprintViewer,
  BlueprintManager,
  ConstructionGuide,
  BlueprintValidator,
  BlueprintAssistance,
  BlueprintDisplay,
  BUNGALOW_BLUEPRINT,
  challengeManager,
  getBlueprintById,
  type PlacedComponentRecord,
} from '../src/construction/index.js';

describe('Advenquo: Blueprint Mode & Guided Construction System', () => {
  // ── 1. Authoritative Building Design & Dimensional Consistency ───────────
  it('1. verifies authoritative two-bedroom bungalow design dimensions and room zoning', () => {
    const design = TWO_BEDROOM_BUNGALOW_DESIGN;

    assert.strictEqual(design.id, 'two_bedroom_bungalow');
    assert.strictEqual(design.overallDimensions.width, 6.4); // 6.40m
    assert.strictEqual(design.overallDimensions.depth, 5.0); // 5.00m
    assert.strictEqual(design.overallDimensions.height, 3.8); // 3.80m
    assert.strictEqual(design.totalAreaM2, 32.0); // 32.0 m²

    // Verify all 6 functional rooms exist and have valid bounds
    const roomIds = design.rooms.map((r) => r.id);
    assert.ok(roomIds.includes('room_living'), 'Must have Living Room');
    assert.ok(roomIds.includes('room_kitchen'), 'Must have Kitchen');
    assert.ok(roomIds.includes('room_bed1'), 'Must have Bedroom 1 (Master)');
    assert.ok(roomIds.includes('room_bed2'), 'Must have Bedroom 2');
    assert.ok(roomIds.includes('room_bath'), 'Must have Bathroom');
    assert.ok(roomIds.includes('room_hallway'), 'Must have Hallway / Circulation');

    // Total room area check
    const totalRoomArea = design.rooms.reduce((acc, r) => acc + r.areaM2, 0);
    assert.ok(Math.abs(totalRoomArea - 32.0) < 0.1, `Room areas (${totalRoomArea}) must sum to 32.0 m²`);
  });

  it('2. verifies elevation datums and height hierarchy', () => {
    const datums = ELEVATION_DATUMS;
    assert.strictEqual(datums.length, 5);

    const ground = datums.find((d) => d.id === 'datum_ground');
    const slab = datums.find((d) => d.id === 'datum_slab');
    const sill = datums.find((d) => d.id === 'datum_sill');
    const lintel = datums.find((d) => d.id === 'datum_lintel');
    const ridge = datums.find((d) => d.id === 'datum_ridge');

    assert.strictEqual(ground?.elevationM, 0.0);
    assert.strictEqual(slab?.elevationM, 0.2);
    assert.strictEqual(sill?.elevationM, 1.0);
    assert.strictEqual(lintel?.elevationM, 2.6);
    assert.strictEqual(ridge?.elevationM, 3.8);
  });

  // ── 2. Vector Architectural Drawings (Floor Plan & 4 Elevations) ─────────
  it('3. renders architectural vector SVG floor plan with room labels and door swings', () => {
    const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);
    const svg = renderer.renderFloorPlanSVG({ widthPx: 800, heightPx: 600 });

    assert.ok(svg.includes('<svg'), 'Must produce SVG markup');
    assert.ok(svg.includes('TWO-BEDROOM BUNGALOW — FLOOR PLAN'), 'Must have title block');
    assert.ok(svg.includes('Living Room'), 'Must include Living Room label');
    assert.ok(svg.includes('Kitchen'), 'Must include Kitchen label');
    assert.ok(svg.includes('Bedroom 1 (Master)'), 'Must include Bedroom 1 label');
    assert.ok(svg.includes('Bedroom 2'), 'Must include Bedroom 2 label');
    assert.ok(svg.includes('Bathroom'), 'Must include Bathroom label');
    assert.ok(svg.includes('WIDTH: 6.40m'), 'Must render overall width dimension string');
    assert.ok(svg.includes('DEPTH: 5.00m'), 'Must render overall depth dimension string');
  });

  it('4. renders all 4 architectural elevations with height datums', () => {
    const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);

    const elevations: Array<'front' | 'rear' | 'left' | 'right'> = ['front', 'rear', 'left', 'right'];
    for (const elev of elevations) {
      const svg = renderer.renderElevationSVG(elev);
      assert.ok(svg.includes('<svg'), `${elev} elevation must produce valid SVG`);
      assert.ok(svg.includes(`${elev.toUpperCase()} ELEVATION`), `${elev} must include title block`);
      assert.ok(svg.includes('Ground Level ±0.00'), `${elev} must display ground level datum`);
      assert.ok(svg.includes('Roof Ridge Apex +3.80'), `${elev} must display ridge apex datum`);
    }
  });

  // ── 3. 3D Reference Model & Exploded Construction View ───────────────────
  it('5. builds realistic 3D reference model with all 9 construction layers', () => {
    const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);
    const model = renderer.build3DReferenceModel();

    assert.ok(model, '3D reference model must exist');
    assert.strictEqual(model.name, `Blueprint3D_${TWO_BEDROOM_BUNGALOW_DESIGN.id}`);
    assert.strictEqual(model.children.length, TWO_BEDROOM_BUNGALOW_DESIGN.components.length);

    // Verify all 9 layers are represented across the components
    const representedLayers = new Set<string>();
    model.traverse((child) => {
      if ((child as any).isMesh && child.userData.layerId) {
        representedLayers.add(child.userData.layerId);
      }
    });

    for (const layer of CONSTRUCTION_LAYERS) {
      assert.ok(representedLayers.has(layer.id), `Layer ${layer.id} must be represented in 3D model`);
    }
  });

  it('6. interpolates exploded view layers smoothly from 0.0 (assembled) to 1.0 (exploded)', () => {
    const renderer = new BlueprintRenderer(TWO_BEDROOM_BUNGALOW_DESIGN);
    const model = renderer.build3DReferenceModel();

    // Sample a roof truss component (moves upward when exploded)
    const roofTruss = model.children.find((c) => c.userData.componentId === 'bung_truss_mid')!;
    assert.ok(roofTruss, 'Mid roof truss must exist');

    const basePosY = roofTruss.userData.basePosition.y;
    const explodedOffsetY = roofTruss.userData.explodedOffset.y;

    // Assembled state (progress = 0)
    BlueprintRenderer.setExplodedProgress(model, 0.0);
    assert.strictEqual(roofTruss.position.y, basePosY, 'Position must equal base position at 0.0');

    // Half exploded state (progress = 0.5)
    BlueprintRenderer.setExplodedProgress(model, 0.5);
    const expectedHalfY = basePosY + explodedOffsetY * 0.5;
    assert.ok(Math.abs(roofTruss.position.y - expectedHalfY) < 1e-4, 'Position must interpolate at 0.5');

    // Fully exploded state (progress = 1.0)
    BlueprintRenderer.setExplodedProgress(model, 1.0);
    const expectedFullY = basePosY + explodedOffsetY;
    assert.ok(Math.abs(roofTruss.position.y - expectedFullY) < 1e-4, 'Position must reach full offset at 1.0');
  });

  it('7. supports layer toggling and single-component isolation', () => {
    const viewer = new BlueprintViewer(TWO_BEDROOM_BUNGALOW_DESIGN);
    const model = viewer.getModelRoot();

    // Toggle foundation layer off
    viewer.toggleLayer('foundation', false);
    model.traverse((child) => {
      if ((child as any).isMesh && child.userData.layerId === 'foundation') {
        assert.strictEqual(child.visible, false, 'Foundation meshes must be hidden when layer is off');
      }
    });

    // Toggle foundation layer back on
    viewer.toggleLayer('foundation', true);
    model.traverse((child) => {
      if ((child as any).isMesh && child.userData.layerId === 'foundation') {
        assert.strictEqual(child.visible, true, 'Foundation meshes must be visible when layer is on');
      }
    });

    // Isolate single component
    viewer.isolateComponent('bung_door_entrance');
    model.traverse((child) => {
      if ((child as any).isMesh) {
        if (child.userData.componentId === 'bung_door_entrance') {
          assert.strictEqual(child.visible, true, 'Target component must remain visible');
        } else {
          assert.strictEqual(child.visible, false, 'Non-target components must be hidden when isolated');
        }
      }
    });

    // Clear isolation
    viewer.isolateComponent(null);
    model.traverse((child) => {
      if ((child as any).isMesh) {
        assert.strictEqual(child.visible, true, 'All components must be visible when isolation cleared');
      }
    });
  });

  // ── 4. Guided Construction Phases Sequence ───────────────────────────────
  it('8. manages the 7-phase guided construction sequence', () => {
    const guide = new ConstructionGuide(TWO_BEDROOM_BUNGALOW_DESIGN);
    const phases = guide.getPhases();

    assert.strictEqual(phases.length, 7);
    assert.strictEqual(phases[0].title, 'Phase 1: Foundation');
    assert.strictEqual(phases[1].title, 'Phase 2: Floor');
    assert.strictEqual(phases[2].title, 'Phase 3: Walls & Partitions');
    assert.strictEqual(phases[3].title, 'Phase 4: Doors & Windows');
    assert.strictEqual(phases[4].title, 'Phase 5: Roof Structure & Cladding');
    assert.strictEqual(phases[5].title, 'Phase 6: Finishing Elements');
    assert.strictEqual(phases[6].title, 'Phase 7: Architectural Inspection');

    // Verify progression
    assert.strictEqual(guide.getCurrentPhaseIndex(), 1);
    guide.advancePhase();
    assert.strictEqual(guide.getCurrentPhaseIndex(), 2);
    guide.advancePhase();
    assert.strictEqual(guide.getCurrentPhaseIndex(), 3);
    guide.setPhase(7);
    assert.strictEqual(guide.getCurrentPhaseIndex(), 7);
    assert.strictEqual(guide.isLastPhase(), true);
  });

  // ── 5. Blueprint Manager & Seated VR Workspace Ergonomics ────────────────
  it('9. coordinates blueprint lifecycle (study -> pinned -> hidden) and seated reach', () => {
    const mgr = BlueprintManager.getInstance();

    // Enter study mode
    mgr.enterStudyMode();
    assert.strictEqual(mgr.getModeState(), 'study');
    assert.strictEqual(mgr.getWorkspaceAnchor().visible, true);
    // In study mode, positioned directly in front of seated player
    assert.deepStrictEqual(mgr.getWorkspaceAnchor().position.toArray(), [0, 1.35, -1.5]);

    // Start construction and pin beside workspace
    mgr.startConstruction();
    assert.strictEqual(mgr.getModeState(), 'construction_pinned');
    assert.strictEqual(mgr.getPinPlacement(), 'left');
    // Placed at comfortable seated arm reach on the left [-1.15, 1.2, -1.1]
    assert.deepStrictEqual(mgr.getWorkspaceAnchor().position.toArray(), [-1.15, 1.2, -1.1]);

    // Switch pin to right side of building pad
    mgr.setPinPlacement('right');
    assert.strictEqual(mgr.getPinPlacement(), 'right');
    assert.deepStrictEqual(mgr.getWorkspaceAnchor().position.toArray(), [1.15, 1.2, -1.1]);

    // Hide blueprint
    mgr.toggleVisibility();
    assert.strictEqual(mgr.getModeState(), 'hidden');
    assert.strictEqual(mgr.getWorkspaceAnchor().visible, false);

    // Reopen blueprint
    mgr.toggleVisibility();
    assert.strictEqual(mgr.getModeState(), 'construction_pinned');
    assert.strictEqual(mgr.getWorkspaceAnchor().visible, true);
  });

  // ── 6. Bidirectional Component Linking ───────────────────────────────────
  it('10. supports bidirectional component selection between blueprint and workspace', () => {
    const mgr = BlueprintManager.getInstance();
    const comp = mgr.selectComponent('bung_door_entrance');

    assert.ok(comp, 'Selected component must be returned');
    assert.strictEqual(comp.id, 'bung_door_entrance');
    assert.strictEqual(comp.componentType, 'door_frame');
    assert.strictEqual(comp.layerId, 'doors_windows');
    assert.strictEqual(comp.stageIndex, 4);

    const current = mgr.getSelectedComponent();
    assert.strictEqual(current?.id, 'bung_door_entrance');

    mgr.selectComponent(null);
    assert.strictEqual(mgr.getSelectedComponent(), null);
  });

  // ── 7. Blueprint-Based Construction Validation & Tolerances ──────────────
  it('11. validates construction against authoritative design with hand placement tolerances', () => {
    const design = TWO_BEDROOM_BUNGALOW_DESIGN;

    // Simulate empty placed components
    const emptyResult = BlueprintValidator.validateAgainstDesign(design, []);
    assert.strictEqual(emptyResult.passed, false);
    assert.strictEqual(emptyResult.overallScore, 0);
    assert.strictEqual(emptyResult.starRating, 0);
    assert.strictEqual(emptyResult.foundation.passed, false);

    // Simulate perfectly placed components for all design targets
    const placedList: PlacedComponentRecord[] = design.components.map((c) => ({
      instanceId: `placed_${c.id}`,
      componentType: c.componentType,
      position: c.position,
      rotation: c.rotation,
      structuralRole: c.structuralRole,
      connections: [],
      isStaticOptimized: true,
    }));

    const perfectResult = BlueprintValidator.validateAgainstDesign(design, placedList);
    assert.strictEqual(perfectResult.passed, true);
    assert.strictEqual(perfectResult.overallScore, 100);
    assert.strictEqual(perfectResult.starRating, 3);
    assert.strictEqual(perfectResult.foundation.passed, true);
    assert.strictEqual(perfectResult.floor.passed, true);
    assert.strictEqual(perfectResult.walls.passed, true);
    assert.strictEqual(perfectResult.internalPartitions.passed, true);
    assert.strictEqual(perfectResult.doors.passed, true);
    assert.strictEqual(perfectResult.windows.passed, true);
    assert.strictEqual(perfectResult.roof.passed, true);
    assert.ok(perfectResult.disclaimer.includes('gameplay and educational purposes'));
  });

  it('12. allows minor hand-placement position and rotation inaccuracies within tolerances', () => {
    const design = TWO_BEDROOM_BUNGALOW_DESIGN;

    // Simulate placed components with hand tracking jitter (±0.12m offset and ±15 deg rotation)
    const jitteredList: PlacedComponentRecord[] = design.components.map((c) => ({
      instanceId: `jittered_${c.id}`,
      componentType: c.componentType,
      // Small offset within 0.25m tolerance
      position: [c.position[0] + 0.08, c.position[1] + 0.04, c.position[2] - 0.06],
      rotation: c.rotation,
      structuralRole: c.structuralRole,
      connections: [],
      isStaticOptimized: true,
    }));

    const result = BlueprintValidator.validateAgainstDesign(design, jitteredList, 0.25, 30);
    assert.strictEqual(result.passed, true, 'Hand placement within tolerance must pass');
    assert.strictEqual(result.overallScore, 100);
  });

  it('13. detects missing wall panels and mispositioned roof trusses', () => {
    const design = TWO_BEDROOM_BUNGALOW_DESIGN;

    // Omit west wall and place roof truss at wrong location [5, 5, 5]
    const flawedList: PlacedComponentRecord[] = design.components
      .filter((c) => c.id !== 'bung_wall_ext_w')
      .map((c) => {
        if (c.id === 'bung_truss_mid') {
          return {
            instanceId: `flawed_${c.id}`,
            componentType: c.componentType,
            position: [5.0, 5.0, 5.0], // Out of bounds
            rotation: c.rotation,
            structuralRole: c.structuralRole,
            connections: [],
            isStaticOptimized: true,
          };
        }
        return {
          instanceId: `placed_${c.id}`,
          componentType: c.componentType,
          position: c.position,
          rotation: c.rotation,
          structuralRole: c.structuralRole,
          connections: [],
          isStaticOptimized: true,
        };
      });

    const result = BlueprintValidator.validateAgainstDesign(design, flawedList);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.walls.passed, false, 'Walls check must fail due to missing west wall');
    assert.ok(result.walls.missingComponents.some((m) => m.includes('West exterior')));
    assert.strictEqual(result.roof.passed, false, 'Roof check must fail due to mispositioned truss');
  });

  // ── 8. 3-Tier Assistance System ──────────────────────────────────────────
  it('14. generates Level 1 Visual Hint, Level 2 Guided Hint, and Level 3 Demonstration', () => {
    const assistance = new BlueprintAssistance(TWO_BEDROOM_BUNGALOW_DESIGN);

    // Empty workspace, stage 1 (Foundation)
    const hint1 = assistance.getVisualHint(1, []);
    assert.ok(hint1, 'Visual hint must be generated');
    assert.strictEqual(hint1.componentType, 'foundation_block');
    assert.ok(hint1.description.includes('footing block'));

    const hint2 = assistance.getGuidedHint(1, []);
    assert.ok(hint2, 'Guided hint must be generated');
    assert.strictEqual(hint2.relevantView, 'plan');
    assert.ok(hint2.architecturalNote.includes('foundation block'));
    assert.ok(hint2.connectionInstructions.length > 0);

    const hint3 = assistance.getDemonstration(1, []);
    assert.ok(hint3, 'Demonstration hint must be generated');
    assert.strictEqual(hint3.durationSeconds, 2.0);
    assert.strictEqual(hint3.keyframes.length, 3);
    assert.ok(hint3.assemblyTips.length >= 3);
  });

  // ── 9. Challenge Catalog & Stage 1 Bungalow Resolution ────────────────────
  it('15. resolves Stage 1 Two-Bedroom Bungalow from ChallengeManager and Catalog', () => {
    const bp1 = challengeManager.selectStage1Bungalow();
    assert.strictEqual(bp1.id, 'bungalow');
    assert.strictEqual(bp1.title, 'Stage 1: Two-Bedroom Bungalow');
    assert.strictEqual(bp1.stages.length, 7);
    assert.ok(bp1.targets.length >= 20);

    const bp2 = getBlueprintById('two_bedroom_bungalow');
    assert.strictEqual(bp2.id, 'bungalow');

    const formatted = BlueprintDisplay.formatArchitecturalDesign(TWO_BEDROOM_BUNGALOW_DESIGN);
    assert.strictEqual(formatted.id, 'two_bedroom_bungalow');
    assert.strictEqual(formatted.dimensions.width, '6.40 m');
    assert.strictEqual(formatted.dimensions.depth, '5.00 m');
    assert.strictEqual(formatted.rooms.length, 6);
    assert.strictEqual(formatted.layers.length, 9);
  });
});
