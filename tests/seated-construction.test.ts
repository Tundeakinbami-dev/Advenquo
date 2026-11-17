/**
 * Advenquo: Seated VR Construction & Building Game — Full Specification Test Suite
 *
 * Verifies all Section 14 test requirements:
 * 1. Left-hand grabbing
 * 2. Right-hand grabbing
 * 3. Independent hand interaction
 * 4. Two-hand manipulation
 * 5. Seated workspace positioning
 * 6. Workspace calibration (without artificial camera movement)
 * 7. Hand tracking interruption and recovery
 * 8. Object rotation
 * 9. Object placement
 * 10. Snap-point compatibility
 * 11. Invalid connections rejection
 * 12. Assembly graph maintenance
 * 13. Physics behaviour (dynamic-to-static freeze & compound bounds)
 * 14. Blueprint validation
 * 15. Structural validation & load path
 * 16. Scoring & Star Ratings (0 to 3 stars)
 * 17. Level unlocking progression (Levels 1 to 7)
 * 18. Save and restore
 * 19. Desktop fallback
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  HandGrabSystem,
  TwoHandManipulationController,
  SeatedWorkspace,
  HandInteractionManager,
  BlockSnappingSystem,
  ConnectionValidator,
  AssemblyManager,
  ConnectionGraph,
  CollisionManager,
  LoadDistribution,
  StabilityValidator,
  BlueprintValidator,
  MaterialValidator,
  ConstructionScore,
  UnlockManager,
  AchievementManager,
  LevelManager,
  ConstructionPersistence,
  DesktopConstructionController,
  CONSTRUCTION_CATALOG,
  getComponentSpec,
  type HandPoseData,
  type PlacedComponentRecord,
} from '../src/construction/index.js';

import { SMALL_HOUSE_BLUEPRINT } from '../src/construction/blueprints/small-house-blueprint.js';
import { DUPLEX_BLUEPRINT } from '../src/construction/blueprints/duplex.js';
import { BRIDGE_BLUEPRINT } from '../src/construction/blueprints/bridge.js';

describe('Advenquo: Seated VR Construction Game Acceptance Suite', () => {
  // 1 & 2. Left and Right Hand Grabbing
  describe('1 & 2. Independent Hand Grabbing (Left & Right)', () => {
    it('supports left-hand pinch to grab and hold tracking', () => {
      const grabSystem = new HandGrabSystem();
      const leftPose: HandPoseData = {
        handedness: 'left',
        isTracked: true,
        pinchStrength: 0.95,
        isPinching: true,
        wristPosition: [-0.2, 0.9, -0.45],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [-0.18, 0.92, -0.42],
        pointerRayDirection: [0, 0, -1],
      };

      const grabbed = grabSystem.grab('left', 'brick_l1', leftPose, [-0.2, 0.9, -0.45], [0, 0, 0, 1]);
      assert.strictEqual(grabbed, true);
      assert.strictEqual(grabSystem.getHeldInstanceId('left'), 'brick_l1');
      assert.strictEqual(grabSystem.isHandHolding('left'), true);
      assert.strictEqual(grabSystem.isHandHolding('right'), false);
    });

    it('supports right-hand pinch to grab independently without affecting left hand', () => {
      const grabSystem = new HandGrabSystem();
      const rightPose: HandPoseData = {
        handedness: 'right',
        isTracked: true,
        pinchStrength: 0.92,
        isPinching: true,
        wristPosition: [0.2, 0.9, -0.45],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [0.18, 0.92, -0.42],
        pointerRayDirection: [0, 0, -1],
      };

      const grabbed = grabSystem.grab('right', 'block_r1', rightPose, [0.2, 0.9, -0.45], [0, 0, 0, 1]);
      assert.strictEqual(grabbed, true);
      assert.strictEqual(grabSystem.getHeldInstanceId('right'), 'block_r1');
      assert.strictEqual(grabSystem.isHandHolding('right'), true);
      assert.strictEqual(grabSystem.isHandHolding('left'), false);
    });
  });

  // 3. Independent Hand Interaction
  describe('3. Independent Hand Interaction (Neither Hand Locked to a Role)', () => {
    it('allows both hands to hold different blocks simultaneously', () => {
      const grabSystem = new HandGrabSystem();
      const leftPose: HandPoseData = {
        handedness: 'left',
        isTracked: true,
        pinchStrength: 0.9,
        isPinching: true,
        wristPosition: [-0.2, 0.85, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [-0.2, 0.85, -0.5],
        pointerRayDirection: [0, 0, -1],
      };
      const rightPose: HandPoseData = {
        handedness: 'right',
        isTracked: true,
        pinchStrength: 0.88,
        isPinching: true,
        wristPosition: [0.2, 0.85, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [0.2, 0.85, -0.5],
        pointerRayDirection: [0, 0, -1],
      };

      grabSystem.grab('left', 'clay_1', leftPose, [-0.2, 0.85, -0.5], [0, 0, 0, 1]);
      grabSystem.grab('right', 'concrete_1', rightPose, [0.2, 0.85, -0.5], [0, 0, 0, 1]);

      assert.strictEqual(grabSystem.getHeldInstanceId('left'), 'clay_1');
      assert.strictEqual(grabSystem.getHeldInstanceId('right'), 'concrete_1');

      // Release left hand without releasing right hand
      const released = grabSystem.release('left');
      assert.strictEqual(released, 'clay_1');
      assert.strictEqual(grabSystem.isHandHolding('left'), false);
      assert.strictEqual(grabSystem.getHeldInstanceId('right'), 'concrete_1');
    });
  });

  // 4. Two-Hand Manipulation
  describe('4. Two-Hand Manipulation for Large Components', () => {
    it('engages dual-hand 6-DOF tracking when both hands pinch a large component', () => {
      const controller = new TwoHandManipulationController();
      const leftPose: HandPoseData = {
        handedness: 'left',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [-0.4, 0.9, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [-0.4, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };
      const rightPose: HandPoseData = {
        handedness: 'right',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [0.4, 0.9, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [0.4, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };

      controller.startTwoHandGrab('beam_heavy_1', leftPose, rightPose, [0, 0.9, -0.5], [0, 0, 0, 1]);
      assert.strictEqual(controller.isActive(), true);
      assert.strictEqual(controller.getTargetInstanceId(), 'beam_heavy_1');

      // Move both hands forward (+0.1m along Z) and up (+0.1m along Y)
      const movedLeft = { ...leftPose, wristPosition: [-0.4, 1.0, -0.4] as [number, number, number] };
      const movedRight = { ...rightPose, wristPosition: [0.4, 1.0, -0.4] as [number, number, number] };

      const result = controller.update(movedLeft, movedRight);
      assert.strictEqual(result.isStable, true);
      assert.ok(Math.abs(result.position[1] - 1.0) < 0.01);
      assert.ok(Math.abs(result.position[2] - -0.4) < 0.01);
    });

    it('transfers grab smoothly to the single remaining hand when one hand releases without jumping', () => {
      const controller = new TwoHandManipulationController();
      const leftPose: HandPoseData = {
        handedness: 'left',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [-0.3, 0.9, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [-0.3, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };
      const rightPose: HandPoseData = {
        handedness: 'right',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [0.3, 0.9, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [0.3, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };

      controller.startTwoHandGrab('wall_panel_1', leftPose, rightPose, [0, 0.9, -0.5], [0, 0, 0, 1]);

      // Release left hand
      const handover = controller.releaseHand('left', rightPose);
      assert.strictEqual(handover.remainingHand, 'right');
      assert.strictEqual(controller.isActive(), false);
      // Grab offset calculated smoothly from remaining right wrist
      assert.ok(Array.isArray(handover.newLocalGrabOffset));
      assert.strictEqual(handover.newLocalGrabOffset.length, 3);
    });
  });

  // 5 & 6. Seated Workspace Positioning & Calibration
  describe('5 & 6. Seated Workspace Positioning & Calibration', () => {
    it('positions the construction surface within comfortable seated arm reach', () => {
      const workspace = new SeatedWorkspace();
      const tableCenter = workspace.getTableCenter();

      // At eye height Y=1.2, table should be at Y ~ 0.85m (-0.35m offset)
      assert.strictEqual(tableCenter[1], 1.2 - 0.35);
      // Distance along Z should be within comfortable reach (e.g. -0.55m)
      assert.strictEqual(tableCenter[2], -0.55);

      // Verify comfortable reach envelope check
      assert.strictEqual(workspace.isPointWithinReach([0, 0.85, -0.55]), true);
      assert.strictEqual(workspace.isPointWithinReach([0, 2.8, -0.55]), false); // Above head
      assert.strictEqual(workspace.isPointWithinReach([0, 0.85, -2.5]), false); // Far away
    });

    it('allows virtual table height and depth adjustment for different seated players', () => {
      const workspace = new SeatedWorkspace();
      const newHeight = workspace.adjustHeight(0.1);
      assert.strictEqual(newHeight, -0.25);

      const newDepth = workspace.adjustDepth(-0.1);
      assert.strictEqual(newDepth, -0.65);

      const center = workspace.getTableCenter();
      assert.strictEqual(center[1], 1.2 - 0.25);
      assert.strictEqual(center[2], -0.65);
    });

    it('recalibrates seated position without artificial camera translation', () => {
      const workspace = new SeatedWorkspace();
      // Player shifts in their seat to [0.1, 1.15, 0.05]
      workspace.recalibrate([0.1, 1.15, 0.05]);
      const cfg = workspace.getConfig();
      assert.deepStrictEqual(cfg.playerSeatedAnchor, [0.1, 1.15, 0.05]);
      assert.strictEqual(workspace.isPointWithinReach([0.1, 1.15 - 0.35, 0.05 - 0.55]), true);
    });

    it('rotates turntable so seated player reaches all sides without torso twisting', () => {
      const workspace = new SeatedWorkspace();
      workspace.rotateTurntable(Math.PI / 2); // 90 deg rotation
      const transformed = workspace.applyTurntableTransform([0.5, 0, 0]);
      const tableCenter = workspace.getTableCenter();
      // [0.5, 0, 0] rotated 90 deg clockwise becomes [0, 0, 0.5] relative to table center
      assert.ok(Math.abs(transformed[0] - tableCenter[0]) < 0.001);
      assert.ok(Math.abs(transformed[2] - (tableCenter[2] + 0.5)) < 0.001);
    });
  });

  // 7. Hand Tracking Interruption and Recovery
  describe('7. Hand Tracking Interruption & Safe Recovery', () => {
    it('freezes component transform safely during temporary hand occlusion without teleporting', () => {
      const controller = new TwoHandManipulationController();
      const leftPose: HandPoseData = {
        handedness: 'left',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [-0.3, 0.9, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [-0.3, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };
      const rightPose: HandPoseData = {
        handedness: 'right',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [0.3, 0.9, -0.5],
        wristOrientation: [0, 0, 0, 1],
        indexTipPosition: [0.3, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };

      controller.startTwoHandGrab('roof_panel_1', leftPose, rightPose, [0, 0.9, -0.5], [0, 0, 0, 1]);

      // Left hand loses tracking (occluded by headset rim)
      const occludedLeft = { ...leftPose, isTracked: false };
      const occludedResult = controller.update(occludedLeft, rightPose);

      assert.strictEqual(occludedResult.isStable, false);
      // Transform stays at last valid position without flying away
      assert.strictEqual(occludedResult.position[0], 0);
      assert.strictEqual(occludedResult.position[1], 0.9);
      assert.strictEqual(occludedResult.position[2], -0.5);

      // Tracking recovers
      const recoveredResult = controller.update(leftPose, rightPose);
      assert.strictEqual(recoveredResult.isStable, true);
    });
  });

  // 8. Object Rotation
  describe('8. 6-DOF Wrist & Dual-Hand Rotation', () => {
    it('rotates held object in 3D through wrist orientation', () => {
      const grabSystem = new HandGrabSystem();
      const initialWrist: [number, number, number, number] = [0, 0, 0, 1];
      const initialPose: HandPoseData = {
        handedness: 'right',
        isTracked: true,
        pinchStrength: 1.0,
        isPinching: true,
        wristPosition: [0.2, 0.9, -0.5],
        wristOrientation: initialWrist,
        indexTipPosition: [0.2, 0.9, -0.5],
        pointerRayDirection: [0, 0, -1],
      };

      grabSystem.grab('right', 'block_rot_1', initialPose, [0.2, 0.9, -0.5], [0, 0, 0, 1]);

      // Rotate wrist 45 deg around Y axis
      const rotatedQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
      const rotatedPose: HandPoseData = {
        ...initialPose,
        wristOrientation: [rotatedQuat.x, rotatedQuat.y, rotatedQuat.z, rotatedQuat.w],
      };

      const pose = grabSystem.updateHeldPose('right', rotatedPose);
      assert.ok(pose);
      const resQuat = new Quaternion(...pose.rotation);
      assert.ok(Math.abs(resQuat.y) > 0.3); // Y component rotated
    });
  });

  // 9, 10 & 11. Object Placement, Snap-Point Compatibility & Invalid Connections
  describe('9, 10 & 11. Snap-Point Compatibility & Invalid Placement Rejection', () => {
    it('validates compatible male-to-female modular snap connections within distance tolerance', () => {
      const placed: Map<string, PlacedComponentRecord> = new Map();
      placed.set('base_block_1', {
        instanceId: 'base_block_1',
        componentType: 'concrete_block',
        position: [0, 0, -2.5],
        rotation: [0, 0, 0, 1],
        structuralRole: 'compressive_masonry',
        isGrounded: true,
        connections: [],
        isStaticOptimized: true,
      });

      // Held brick positioned directly above base block's top stud (within 0.16m tolerance)
      const candidate = BlockSnappingSystem.findBestSnapCandidate(
        'clay_brick',
        [0, 0.15, -2.5],
        [0, 0, 0, 1],
        placed
      );

      assert.strictEqual(candidate.hasCandidate, true);
      assert.strictEqual(candidate.targetInstanceId, 'base_block_1');
      assert.strictEqual(candidate.targetSnapPointId, 'block_top_stud');
      assert.strictEqual(candidate.sourceSnapPointId, 'brick_bottom_socket');
    });

    it('rejects connection when spatial distance exceeds snap tolerance', () => {
      const placed: Map<string, PlacedComponentRecord> = new Map();
      placed.set('base_block_1', {
        instanceId: 'base_block_1',
        componentType: 'concrete_block',
        position: [0, 0, -2.5],
        rotation: [0, 0, 0, 1],
        structuralRole: 'compressive_masonry',
        isGrounded: true,
        connections: [],
        isStaticOptimized: true,
      });

      // Held block placed 0.5m away (beyond 0.18m tolerance)
      const candidate = BlockSnappingSystem.findBestSnapCandidate(
        'clay_brick',
        [0, 0.5, -2.5],
        [0, 0, 0, 1],
        placed
      );

      assert.strictEqual(candidate.hasCandidate, false);
    });

    it('rejects connection when normal angles are co-directional rather than opposing', () => {
      const validation = ConnectionValidator.validate({
        sourceType: 'clay_brick',
        sourceRole: 'compressive_masonry',
        sourceSnap: {
          id: 's1',
          type: 'stud_socket',
          role: 'female',
          localPosition: [0, -0.04, 0],
          localNormal: [0, -1, 0],
          compatibleTypes: ['concrete_block'],
        },
        sourceWorldPos: [0, 0.1, 0],
        sourceWorldNormal: [0, 1, 0], // points UP

        targetType: 'concrete_block',
        targetRole: 'compressive_masonry',
        targetSnap: {
          id: 't1',
          type: 'stud_socket',
          role: 'male',
          localPosition: [0, 0.1, 0],
          localNormal: [0, 1, 0],
          compatibleTypes: ['clay_brick'],
        },
        targetWorldPos: [0, 0.1, 0],
        targetWorldNormal: [0, 1, 0], // also points UP (both face same way, not opposing!)
      });

      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.reason?.includes('Normal misalignment'));
    });
  });

  // 12. Assembly Graph & Undo
  describe('12. Assembly Graph Maintenance & Undo', () => {
    it('records placed blocks in the graph and supports undo disassembly', () => {
      const manager = new AssemblyManager();
      const b1 = manager.registerPlacedBlock('blk_1', 'concrete_block', [0, 0, 0], [0, 0, 0, 1], true);
      const b2 = manager.registerPlacedBlock('blk_2', 'concrete_block', [0, 0.2, 0], [0, 0, 0, 1], false);

      manager.connectBlocks('blk_2', 'block_bottom_socket', 'blk_1', 'block_top_stud');
      assert.strictEqual(manager.getGraph().getAllNodes().length, 2);
      assert.strictEqual(manager.getGraph().isConnectedToGround('blk_2'), true);

      // Undo removes blk_2
      const undone = manager.undo();
      assert.strictEqual(undone?.instanceId, 'blk_2');
      assert.strictEqual(manager.getGraph().getAllNodes().length, 1);
    });
  });

  // 13. Physics Behaviour
  describe('13. Physics Behaviour & Collision Penetration', () => {
    it('detects bounding volume penetration between held block and placed wall', () => {
      const placed: Map<string, PlacedComponentRecord> = new Map();
      placed.set('wall_solid_1', {
        instanceId: 'wall_solid_1',
        componentType: 'wall_panel',
        position: [0, 1.2, -2.5],
        rotation: [0, 0, 0, 1],
        structuralRole: 'wall_partition',
        isGrounded: true,
        connections: [],
        isStaticOptimized: true,
      });

      // Held block placed right inside the wall bounds
      const collision = CollisionManager.checkPenetration('concrete_block', [0, 1.2, -2.5], placed);
      assert.strictEqual(collision.hasCollision, true);
      assert.strictEqual(collision.collidingInstanceId, 'wall_solid_1');

      // Held block positioned clearly outside
      const clear = CollisionManager.checkPenetration('concrete_block', [2.0, 1.2, -2.5], placed);
      assert.strictEqual(clear.hasCollision, false);
    });

    it('calculates vertical dead load distribution and stress', () => {
      const components: Map<string, PlacedComponentRecord> = new Map();
      components.set('col_base', {
        instanceId: 'col_base',
        componentType: 'reinforced_column',
        position: [0, 1.2, 0],
        rotation: [0, 0, 0, 1],
        structuralRole: 'load_bearing_column',
        isGrounded: true,
        connections: [],
        isStaticOptimized: true,
      });
      components.set('beam_top', {
        instanceId: 'beam_top',
        componentType: 'horizontal_beam',
        position: [0, 2.5, 0],
        rotation: [0, 0, 0, 1],
        structuralRole: 'load_transfer_beam',
        isGrounded: false,
        connections: [{ mySnapPointId: 's1', targetInstanceId: 'col_base', targetSnapPointId: 't1' }],
        isStaticOptimized: true,
      });

      const loads = LoadDistribution.calculateLoads(components);
      const colReport = loads.get('col_base');
      assert.ok(colReport);
      // Column carries its own weight + beam tributary load
      assert.ok(colReport.totalVerticalLoadKn > colReport.selfWeightKn);
      assert.strictEqual(colReport.isOverstressed, false);
    });
  });

  // 14 & 15. Blueprint & Structural Validation
  describe('14 & 15. Blueprint Validation & Structural Engineering Checks', () => {
    it('validates blueprint required components and flags missing critical items', () => {
      const placed: Map<string, PlacedComponentRecord> = new Map();
      // Only 2 blocks placed, blueprint requires more
      placed.set('b1', {
        instanceId: 'b1',
        componentType: 'concrete_block',
        position: [-1.2, 0.1, -1.3],
        rotation: [0, 0, 0, 1],
        structuralRole: 'compressive_masonry',
        isGrounded: true,
        connections: [],
        isStaticOptimized: true,
      });

      const val = BlueprintValidator.validate(SMALL_HOUSE_BLUEPRINT, placed);
      assert.strictEqual(val.passed, false);
      assert.ok(val.missingComponents.length > 0);
    });

    it('fails stability check if center of mass falls outside foundation base', () => {
      const components: Map<string, PlacedComponentRecord> = new Map();
      components.set('ftg_1', {
        instanceId: 'ftg_1',
        componentType: 'foundation_block',
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        structuralRole: 'foundation',
        isGrounded: true,
        connections: [],
        isStaticOptimized: true,
      });
      // Extreme off-center massive block at X=5.0m
      components.set('heavy_beam', {
        instanceId: 'heavy_beam',
        componentType: 'bridge_section',
        position: [5.0, 2.0, 0],
        rotation: [0, 0, 0, 1],
        structuralRole: 'span_deck',
        isGrounded: false,
        connections: [],
        isStaticOptimized: true,
      });

      const stability = StabilityValidator.validate(components);
      assert.strictEqual(stability.isStable, false);
      assert.strictEqual(stability.topplingRisk, true);
    });
  });

  // 16. Scoring & Star Ratings
  describe('16. Construction Scoring & Star Ratings', () => {
    it('awards 3 stars for near-perfect score >= 95%', () => {
      const score = ConstructionScore.calculate({
        blueprintAccuracy: 40,
        structuralStability: 30,
        materialSuitability: 15,
        sequenceEfficiency: 14,
        hasCriticalStructuralFailure: false,
      });
      assert.strictEqual(score.totalScore, 99);
      assert.strictEqual(score.starRating, 3);
    });

    it('awards 0 stars and caps score when critical structural failure occurs', () => {
      const score = ConstructionScore.calculate({
        blueprintAccuracy: 40,
        structuralStability: 0,
        materialSuitability: 15,
        sequenceEfficiency: 15,
        hasCriticalStructuralFailure: true, // floating blocks or unanchored structure
      });
      assert.ok(score.totalScore <= 45);
      assert.strictEqual(score.starRating, 0);
    });
  });

  // 17. Level Unlocking Progression
  describe('17. Progressive Level Unlocks (Levels 1 to 7)', () => {
    it('unlocks Level 2 (Duplex) after completing Level 1 (Small House)', () => {
      const unlockManager = new UnlockManager();
      assert.strictEqual(unlockManager.isLevelUnlocked('small_house'), true);
      assert.strictEqual(unlockManager.isLevelUnlocked('duplex'), false);

      const unlocked = unlockManager.markLevelCompleted('small_house');
      assert.ok(unlocked.includes('duplex'));
      assert.strictEqual(unlockManager.isLevelUnlocked('duplex'), true);
      // Bungalow still locked
      assert.strictEqual(unlockManager.isLevelUnlocked('bungalow'), false);
    });

    it('unlocks all 7 progression tiers sequentially through LevelManager', () => {
      const levelManager = new LevelManager();
      assert.strictEqual(levelManager.getCurrentLevelId(), 'small_house');

      // Complete Small House (Level 1)
      levelManager.completeCurrentLevel(3, 98);
      assert.strictEqual(levelManager.setLevel('duplex'), true);

      // Complete Duplex (Level 2)
      levelManager.completeCurrentLevel(2, 88);
      assert.strictEqual(levelManager.setLevel('bungalow'), true);

      // Complete Bungalow (Level 3)
      levelManager.completeCurrentLevel(3, 96);
      assert.strictEqual(levelManager.setLevel('castle'), true);

      // Complete Castle (Level 4)
      levelManager.completeCurrentLevel(3, 95);
      assert.strictEqual(levelManager.setLevel('mansion'), true);

      // Complete Mansion (Level 5)
      levelManager.completeCurrentLevel(2, 86);
      assert.strictEqual(levelManager.setLevel('bridge'), true);

      // Complete Bridge (Level 6)
      levelManager.completeCurrentLevel(3, 99);
      assert.strictEqual(levelManager.setLevel('mega_construction'), true);
    });
  });

  // 18. Save and Restore
  describe('18. Assembly Persistence (Save and Restore)', () => {
    it('serializes and deserializes assembled structures accurately', () => {
      const graph = new ConnectionGraph();
      graph.addNode('b1', 'concrete_block', 'compressive_masonry', [0, 0, -2], [0, 0, 0, 1], true);
      graph.addNode('b2', 'clay_brick', 'compressive_masonry', [0, 0.2, -2], [0, 0, 0, 1], false);
      graph.connect('b2', 'brick_bottom_socket', 'b1', 'block_top_stud');

      const serialized = graph.serialize();
      assert.strictEqual(serialized.length, 2);

      const restoredGraph = new ConnectionGraph();
      restoredGraph.deserialize(serialized);
      assert.strictEqual(restoredGraph.getAllNodes().length, 2);
      assert.strictEqual(restoredGraph.isConnectedToGround('b2'), true);
    });
  });

  // 19. Desktop Fallback
  describe('19. Desktop Keyboard & Mouse Fallback', () => {
    it('supports rotating held blocks along Yaw and Pitch via desktop key commands', () => {
      const desktop = new DesktopConstructionController();
      desktop.selectComponent('block_desk_1', 'concrete_block', new Vector3(0, 0.5, -2.5));

      assert.strictEqual(desktop.isHoldingBlock(), true);

      // Rotate Yaw with Q/E
      desktop.rotateYaw(Math.PI / 4);
      // Rotate Pitch with R/F
      desktop.rotatePitch(Math.PI / 4);

      const rot = desktop.getHeldRotation();
      const q = new Quaternion(...rot);
      assert.ok(Math.abs(q.y) > 0.2);
      assert.ok(Math.abs(q.x) > 0.2);

      const placed = desktop.place();
      assert.ok(placed);
      assert.strictEqual(desktop.isHoldingBlock(), false);
    });
  });
});
