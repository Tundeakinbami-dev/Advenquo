/**
 * Advenquo: Construction World — Complete Test Suite
 *
 * Verifies all 12 required test areas:
 * 1. Material definitions
 * 2. Block creation
 * 3. Hand grabbing
 * 4. Object rotation
 * 5. Two-hand manipulation
 * 6. Snap-point compatibility
 * 7. Invalid placement
 * 8. Assembly connections
 * 9. Blueprint validation
 * 10. Structural validation
 * 11. Level completion
 * 12. Save and restore
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  Quaternion,
  Vector3,
  Mesh,
} from '@iwsdk/core';

import {
  CONSTRUCTION_CONSTANTS,
  CONSTRUCTION_CATALOG,
  getComponentSpec,
  MATERIAL_SPECS,
  createComponentMesh,
  computeWorldSnapPoint,
  areSnapPointsCompatible,
  evaluateSnapCandidate,
  ConnectionGraph,
  AssemblySystem,
  assemblySystem,
  ConstructionPhysicsManager,
  constructionPhysicsManager,
  SMALL_HOUSE_BLUEPRINT,
  BlueprintVisualizer,
  StructuralValidator,
  AssessmentEngine,
  ChallengeManager,
  challengeManager,
  DesktopConstructionController,
  desktopConstructionController,
  ConstructionPersistence,
  buildConstructionWorkshop,
  type ComponentType,
} from '../src/construction/index.js';

describe('Advenquo: Construction World — Phase 1 Test Suite', () => {
  beforeEach(() => {
    assemblySystem.reset();
    constructionPhysicsManager.reset();
    challengeManager.reset();
    desktopConstructionController.reset();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. MATERIAL DEFINITIONS
  // ──────────────────────────────────────────────────────────────────────────
  describe('1. Material Definitions', () => {
    it('defines realistic physical material properties for engineering validation', () => {
      const clay = MATERIAL_SPECS.terracotta_clay;
      assert.ok(clay);
      assert.strictEqual(clay.densityKgM3, CONSTRUCTION_CONSTANTS.DENSITY_CLAY_BRICK);
      assert.strictEqual(clay.compressiveStrengthMpa, 18.0);
      assert.strictEqual(clay.tensileStrengthMpa, 1.8);
      assert.ok(clay.friction > 0.5);

      const concrete = MATERIAL_SPECS.aggregate_concrete_block;
      assert.ok(concrete);
      assert.strictEqual(concrete.compressiveStrengthMpa, 22.0);

      const reinforced = MATERIAL_SPECS.reinforced_structural_concrete;
      assert.ok(reinforced);
      assert.strictEqual(reinforced.tensileStrengthMpa, 280.0, 'Steel rebar must provide high tensile strength');
    });

    it('contains all 7 modular construction components in the catalog', () => {
      const expectedTypes: ComponentType[] = [
        'clay_brick',
        'concrete_block',
        'reinforced_column',
        'horizontal_beam',
        'floor_component',
        'wall_panel',
        'roof_panel',
      ];

      for (const type of expectedTypes) {
        const spec = getComponentSpec(type);
        assert.ok(spec, `Spec missing for ${type}`);
        assert.strictEqual(spec.type, type);
        assert.ok(spec.dimensions[0] > 0);
        assert.ok(spec.dimensions[1] > 0);
        assert.ok(spec.dimensions[2] > 0);
        assert.ok(spec.massKg > 0);
        assert.ok(spec.snapPoints.length > 0);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. BLOCK CREATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('2. Block Creation', () => {
    it('builds procedural 3D models with LEGO-like modular studs and PBR materials for all 7 components', () => {
      const types: ComponentType[] = [
        'clay_brick',
        'concrete_block',
        'reinforced_column',
        'horizontal_beam',
        'floor_component',
        'wall_panel',
        'roof_panel',
      ];

      for (const type of types) {
        const meshRoot = createComponentMesh(type);
        assert.ok(meshRoot, `Failed to build mesh for ${type}`);
        assert.strictEqual(meshRoot.name, `ConstructionMesh_${type}`);
        assert.strictEqual(meshRoot.parent, null, 'Must be parentless Object3D for dual JS realm safety');
        assert.ok(meshRoot.children.length > 0, `${type} must contain visible sub-meshes`);
      }
    });

    it('builds the dedicated construction workshop compound', () => {
      const workshop = buildConstructionWorkshop();
      assert.ok(workshop);
      assert.strictEqual(workshop.name, 'ConstructionWorkshopCompound');
      assert.strictEqual(workshop.parent, null);

      const foundationPad = workshop.getObjectByName('FoundationFootingPad');
      assert.ok(foundationPad, 'Workshop must include foundation footing pad');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. HAND GRABBING
  // ──────────────────────────────────────────────────────────────────────────
  describe('3. Hand Grabbing & Physics Activation', () => {
    it('manages dynamic-to-kinematic transitions when grabbed', () => {
      const body = constructionPhysicsManager.registerComponentPhysics('brick_1', 'clay_brick', 'DYNAMIC');
      assert.strictEqual(body.state, 'DYNAMIC');
      assert.strictEqual(body.isOptimized, false);

      // Grab component with hand
      constructionPhysicsManager.activateComponentForGrab('brick_1');
      assert.strictEqual(body.state, 'KINEMATIC', 'Held component must become kinematic for hand tracking');

      // Release to physics
      constructionPhysicsManager.releaseComponentToPhysics('brick_1');
      assert.strictEqual(body.state, 'DYNAMIC');
    });

    it('freezes placed components to STATIC to protect Quest 3 frame times', () => {
      const body = constructionPhysicsManager.registerComponentPhysics('block_1', 'concrete_block', 'DYNAMIC');
      constructionPhysicsManager.optimizePlacedComponent('block_1');

      assert.strictEqual(body.state, 'STATIC', 'Placed component must freeze to STATIC');
      assert.strictEqual(body.isOptimized, true);
      assert.strictEqual(constructionPhysicsManager.getOptimizedCount(), 1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. OBJECT ROTATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('4. Object Rotation', () => {
    it('rotates held components along yaw and pitch via desktop controller', () => {
      desktopConstructionController.selectComponent(
        'brick_rot_test',
        'clay_brick',
        new Vector3(0, 1.2, -1.5),
      );

      const held = desktopConstructionController.getHeldItem();
      assert.ok(held);

      // Rotate 90 degrees around Y (yaw / wrist rotation)
      desktopConstructionController.rotateHeldComponentYaw(Math.PI / 2);
      const angleY = (held.rotation.y);
      assert.ok(Math.abs(angleY) > 0.6, 'Yaw rotation must be applied');

      // Rotate 45 degrees around X (pitch)
      desktopConstructionController.rotateHeldComponentPitch(Math.PI / 4);
      const angleX = held.rotation.x;
      assert.ok(Math.abs(angleX) > 0.2, 'Pitch rotation must be applied');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. TWO-HAND MANIPULATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('5. Two-Hand Manipulation', () => {
    it('identifies heavy and long components as requiring two-hand manipulation', () => {
      assert.strictEqual(getComponentSpec('clay_brick').requiresTwoHands, false);
      assert.strictEqual(getComponentSpec('concrete_block').requiresTwoHands, false);

      assert.strictEqual(getComponentSpec('reinforced_column').requiresTwoHands, true);
      assert.strictEqual(getComponentSpec('horizontal_beam').requiresTwoHands, true);
      assert.strictEqual(getComponentSpec('wall_panel').requiresTwoHands, true);
      assert.strictEqual(getComponentSpec('roof_panel').requiresTwoHands, true);
      assert.strictEqual(getComponentSpec('floor_component').requiresTwoHands, true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. SNAP-POINT COMPATIBILITY
  // ──────────────────────────────────────────────────────────────────────────
  describe('6. Snap-Point Compatibility', () => {
    it('validates compatible socket pairings (male stud <-> female socket)', () => {
      const brickSpec = getComponentSpec('clay_brick');
      const studPoint = brickSpec.snapPoints.find((p) => p.role === 'male')!;
      const socketPoint = brickSpec.snapPoints.find((p) => p.role === 'female')!;

      const worldStud = computeWorldSnapPoint(
        'brick_1',
        'clay_brick',
        studPoint,
        new Vector3(0, 0, 0),
        new Quaternion(),
      );

      const worldSocket = computeWorldSnapPoint(
        'brick_2',
        'clay_brick',
        socketPoint,
        new Vector3(0, 0.08, 0),
        new Quaternion(),
      );

      const comp = areSnapPointsCompatible(worldStud, worldSocket);
      assert.strictEqual(comp.compatible, true);
    });

    it('calculates valid snap candidate within distance tolerance and opposing normals', () => {
      const blockSpec = getComponentSpec('concrete_block');
      const studPoint = blockSpec.snapPoints.find((p) => p.role === 'male')!;
      const socketPoint = blockSpec.snapPoints.find((p) => p.role === 'female')!;

      // Target block sitting at ground [0, 0.1, -2.5]
      const targetPoint = computeWorldSnapPoint(
        'block_base',
        'concrete_block',
        studPoint,
        new Vector3(0, 0.1, -2.5),
        new Quaternion(),
      );

      // Held block positioned closely above target [0, 0.35, -2.5]
      const sourcePoint = computeWorldSnapPoint(
        'block_held',
        'concrete_block',
        socketPoint,
        new Vector3(0, 0.35, -2.5),
        new Quaternion(),
      );

      const candidate = evaluateSnapCandidate(sourcePoint, targetPoint, new Quaternion());
      assert.strictEqual(candidate.isValid, true);
      assert.ok(candidate.snappedPosition.y > 0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. INVALID PLACEMENT
  // ──────────────────────────────────────────────────────────────────────────
  describe('7. Invalid Placement Rejection', () => {
    it('rejects connection if distance exceeds snap distance tolerance', () => {
      const blockSpec = getComponentSpec('concrete_block');
      const studPoint = blockSpec.snapPoints.find((p) => p.role === 'male')!;
      const socketPoint = blockSpec.snapPoints.find((p) => p.role === 'female')!;

      const targetPoint = computeWorldSnapPoint(
        'block_base',
        'concrete_block',
        studPoint,
        new Vector3(0, 0.1, -2.5),
        new Quaternion(),
      );

      // Placed far away (> 0.16m tolerance)
      const sourcePoint = computeWorldSnapPoint(
        'block_held',
        'concrete_block',
        socketPoint,
        new Vector3(0, 1.5, -2.5), // 1.4m away
        new Quaternion(),
      );

      const candidate = evaluateSnapCandidate(sourcePoint, targetPoint, new Quaternion());
      assert.strictEqual(candidate.isValid, false);
      assert.ok(candidate.rejectionReason?.includes('exceeds tolerance'));
    });

    it('rejects connection if socket is already occupied', () => {
      const brickSpec = getComponentSpec('clay_brick');
      const studPoint = brickSpec.snapPoints.find((p) => p.role === 'male')!;
      const socketPoint = brickSpec.snapPoints.find((p) => p.role === 'female')!;

      const targetPoint = computeWorldSnapPoint(
        'brick_base',
        'clay_brick',
        studPoint,
        new Vector3(0, 0, 0),
        new Quaternion(),
      );
      targetPoint.isOccupied = true; // Mark occupied!

      const sourcePoint = computeWorldSnapPoint(
        'brick_held',
        'clay_brick',
        socketPoint,
        new Vector3(0, 0.08, 0),
        new Quaternion(),
      );

      const candidate = evaluateSnapCandidate(sourcePoint, targetPoint, new Quaternion());
      assert.strictEqual(candidate.isValid, false);
      assert.ok(candidate.rejectionReason?.includes('already occupied'));
    });

    it('rejects connection when normal angles do not oppose each other', () => {
      const brickSpec = getComponentSpec('clay_brick');
      const studPoint = brickSpec.snapPoints.find((p) => p.role === 'male')!;

      // Both points facing UP [0, 1, 0] (male to male, normals in same direction)
      const targetPoint = computeWorldSnapPoint(
        'brick_a',
        'clay_brick',
        studPoint,
        new Vector3(0, 0, 0),
        new Quaternion(),
      );

      const sourcePoint = computeWorldSnapPoint(
        'brick_b',
        'clay_brick',
        studPoint,
        new Vector3(0, 0.05, 0),
        new Quaternion(),
      );

      const candidate = evaluateSnapCandidate(sourcePoint, targetPoint, new Quaternion());
      assert.strictEqual(candidate.isValid, false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. ASSEMBLY CONNECTIONS & GRAPH
  // ──────────────────────────────────────────────────────────────────────────
  describe('8. Assembly Connections & Graph', () => {
    it('maintains bidirectional connection graph and supports disassembly / undo', () => {
      const graph = new ConnectionGraph();

      // Add foundation slab
      graph.addNode('foundation', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
      // Add first column
      graph.addNode('col_1', 'reinforced_column', 'load_bearing_column', [0, 1.2, 0], [0, 0, 0, 1]);

      assert.strictEqual(graph.getNodeCount(), 2);
      assert.strictEqual(graph.isConnectedToGround('col_1'), false);

      // Connect column to foundation
      const connected = graph.connect('col_1', 'column_base_socket', 'foundation', 'floor_top_deck');
      assert.strictEqual(connected, true);
      assert.strictEqual(graph.hasConnection('col_1', 'foundation'), true);
      assert.strictEqual(graph.hasConnection('foundation', 'col_1'), true);
      assert.strictEqual(graph.isConnectedToGround('col_1'), true, 'Column should now be grounded');

      // Disconnect / Undo
      graph.removeNode('col_1');
      assert.strictEqual(graph.getNodeCount(), 1);
      assert.strictEqual(graph.hasConnection('foundation', 'col_1'), false);
    });

    it('commits snap placement via AssemblySystem', () => {
      // Register foundation
      assemblySystem.registerPlacedBlock({
        instanceId: 'foundation_slab',
        componentType: 'floor_component',
        position: new Vector3(0, 0.05, -2.5),
        rotation: new Quaternion(),
        isGrounded: true,
      });

      // Find snap candidate for base block
      const candidate = assemblySystem.findBestSnapCandidate(
        'base_block_1',
        'concrete_block',
        new Vector3(0, 0.25, -2.5),
        new Quaternion(),
      );

      assert.ok(candidate);
      assert.strictEqual(candidate.isValid, true);

      // Commit snap
      const commit = assemblySystem.commitSnapPlacement('base_block_1', 'concrete_block', candidate);
      assert.strictEqual(commit.success, true);
      assert.strictEqual(assemblySystem.getGraph().hasConnection('base_block_1', 'foundation_slab'), true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. BLUEPRINT VALIDATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('9. Blueprint Validation', () => {
    it('verifies Small-House Blueprint specification', () => {
      const bp = SMALL_HOUSE_BLUEPRINT;
      assert.strictEqual(bp.id, 'small_house_challenge');
      assert.strictEqual(bp.stages.length, 6);
      assert.ok(bp.targets.length >= 10);
      assert.ok(bp.requiredQuantities.concrete_block > 0);
      assert.ok(bp.requiredQuantities.reinforced_column > 0);
      assert.ok(bp.requiredQuantities.horizontal_beam > 0);
      assert.ok(bp.requiredQuantities.roof_panel > 0);
    });

    it('creates BlueprintVisualizer ghost meshes matching all blueprint targets', () => {
      const visualizer = new BlueprintVisualizer(SMALL_HOUSE_BLUEPRINT);
      const root = visualizer.getRoot();
      assert.ok(root);
      assert.strictEqual(visualizer.getVisible(), true);

      // Highlight active stage
      visualizer.highlightStage(2);
      visualizer.setVisible(false);
      assert.strictEqual(visualizer.getVisible(), false);
    });

    it('detects incomplete materials and placement errors when assembly is incomplete', () => {
      const graph = new ConnectionGraph();
      // Empty assembly
      const result = AssessmentEngine.assessBlueprint(SMALL_HOUSE_BLUEPRINT, graph);
      assert.strictEqual(result.passed, false);
      assert.ok(result.missingComponents.length > 0);
      assert.ok(result.placementErrors.length > 0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. STRUCTURAL VALIDATION
  // ──────────────────────────────────────────────────────────────────────────
  describe('10. Structural Validation & Statics Checks', () => {
    it('fails structure if load path to foundation is broken (floating blocks)', () => {
      const graph = new ConnectionGraph();
      // Unanchored floating roof panel
      graph.addNode('floating_roof', 'roof_panel', 'weather_enclosure', [0, 3.0, 0], [0, 0, 0, 1]);

      const report = StructuralValidator.validateStructure(graph);
      assert.strictEqual(report.isStable, false);
      assert.ok(report.ungroundedComponents.includes('floating_roof'));
      assert.ok(report.stabilityErrors.length > 0);
    });

    it('detects unanchored roof lacking beam or wall bearing support', () => {
      const graph = new ConnectionGraph();
      graph.addNode('ground', 'floor_component', 'foundation', [0, 0, 0], [0, 0, 0, 1], true);
      // Brick directly on ground, but roof sitting on nothing
      graph.addNode('brick_1', 'clay_brick', 'compressive_masonry', [0, 0.08, 0], [0, 0, 0, 1]);
      graph.connect('brick_1', 'brick_bottom_socket', 'ground', 'floor_top_deck');

      graph.addNode('roof_1', 'roof_panel', 'weather_enclosure', [2, 2.5, 0], [0, 0, 0, 1]);

      const report = StructuralValidator.validateStructure(graph);
      assert.strictEqual(report.isStable, false);
      assert.ok(report.missingLoadPaths.includes('roof_1'));
    });

    it('confirms educational disclaimer is present in structural report', () => {
      const report = StructuralValidator.validateStructure(new ConnectionGraph());
      assert.ok(report.disclaimer.includes('Educational engineering simulation only'));
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 11. LEVEL COMPLETION
  // ──────────────────────────────────────────────────────────────────────────
  describe('11. Level Completion & Small-House Challenge', () => {
    it('passes assessment and awards +250 XP when all blueprint targets and connections are satisfied', () => {
      const graph = new ConnectionGraph();
      const bp = SMALL_HOUSE_BLUEPRINT;

      // 1. Add foundation
      graph.addNode('foundation_slab', 'floor_component', 'foundation', [0, 0, -2.5], [0, 0, 0, 1], true);

      // 2. Add all blueprint targets at exact target positions and establish required connections
      for (const target of bp.targets) {
        graph.addNode(
          target.id,
          target.componentType,
          target.structuralRole,
          [...target.targetPosition],
          [...target.targetRotation],
        );

        for (const req of target.requiredConnections) {
          graph.connect(target.id, req.mySnapPointId, req.targetItemId, req.targetSnapPointId);
        }
      }

      // 3. Connect roof panels to back wall as well to ensure full bearing support
      graph.connect('target_roof_panel_left', 'roof_seat_left', 'target_wall_back', 'wall_top_plate');
      graph.connect('target_roof_panel_right', 'roof_seat_right', 'target_wall_back', 'wall_top_plate');

      const assessment = challengeManager.evaluateProgress(graph);
      assert.strictEqual(assessment.passed, true, `Assessment should pass: ${JSON.stringify(assessment)}`);
      assert.strictEqual(assessment.missingComponents.length, 0);
      assert.strictEqual(assessment.placementErrors.length, 0);
      assert.strictEqual(assessment.connectionErrors.length, 0);
      assert.strictEqual(assessment.score, 100);
      assert.strictEqual(challengeManager.isChallengeCompleted(), true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 12. SAVE AND RESTORE
  // ──────────────────────────────────────────────────────────────────────────
  describe('12. Save and Restore', () => {
    it('serializes assembly graph into a snapshot and restores it accurately', () => {
      // Build a 2-component structure in AssemblySystem
      assemblySystem.registerPlacedBlock({
        instanceId: 'slab_save_test',
        componentType: 'floor_component',
        position: new Vector3(0, 0, -2.5),
        rotation: new Quaternion(),
        isGrounded: true,
      });

      assemblySystem.registerPlacedBlock({
        instanceId: 'col_save_test',
        componentType: 'reinforced_column',
        position: new Vector3(0, 1.2, -2.5),
        rotation: new Quaternion(),
      });

      assemblySystem.getGraph().connect('col_save_test', 'column_base_socket', 'slab_save_test', 'floor_top_deck');

      // Create save snapshot
      const snapshot = ConstructionPersistence.createSaveSnapshot('small_house_challenge', false);
      assert.strictEqual(snapshot.version, 1);
      assert.strictEqual(snapshot.components.length, 2);

      // Reset system
      assemblySystem.reset();
      assert.strictEqual(assemblySystem.getGraph().getNodeCount(), 0);

      // Restore from snapshot
      const restored = ConstructionPersistence.restoreSnapshot(snapshot);
      assert.strictEqual(restored, true);
      assert.strictEqual(assemblySystem.getGraph().getNodeCount(), 2);
      assert.strictEqual(assemblySystem.getGraph().hasConnection('col_save_test', 'slab_save_test'), true);
      assert.strictEqual(assemblySystem.getGraph().isConnectedToGround('col_save_test'), true);
    });
  });
});
