/**
 * Advenquo: Functional Building Materials, Desktop Mouse Controls & VR Grab-and-Place Interactions
 * Acceptance & Regression Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  CONSTRUCTION_CATALOG,
  getComponentSpec,
} from '../src/construction/materials/construction-catalog.js';
import { createComponentMesh } from '../src/construction/materials/component-factory.js';
import type { ComponentType } from '../src/construction/core/construction-types.js';
import { DesktopConstructionController } from '../src/construction/interaction/desktop-interaction.js';
import { assemblySystem } from '../src/construction/assembly/assembly-system.js';
import {
  ConstructionTutorialManager,
  TUTORIAL_STEPS,
} from '../src/construction/progression/construction-tutorial-manager.js';
import { BlueprintManager } from '../src/construction/blueprints/blueprint-manager.js';

describe('Advenquo: Functional Building Materials & Component Catalog', () => {
  const ALL_21_TYPES: ComponentType[] = [
    // Basic Building Blocks
    'small_brick',
    'large_brick',
    'square_block',
    'rectangular_block',
    'foundation_block',
    // Structural Components
    'floor_component',
    'wall_panel',
    'corner_wall',
    'internal_partition',
    'reinforced_column',
    'horizontal_beam',
    'roof_truss',
    'roof_panel',
    // Architectural Components
    'door_frame',
    'door',
    'window_frame',
    'window',
    'staircase',
    // Finishing Components
    'roofing_material',
    'floor_finish',
    'wall_finish',
    'decorative_element',
  ];

  it('1. defines all 21 requested building components with valid physical and architectural properties', () => {
    for (const type of ALL_21_TYPES) {
      const spec = getComponentSpec(type);
      assert.ok(spec, `Catalog spec missing for type: ${type}`);
      assert.strictEqual(spec.type, type);
      assert.ok(spec.name.length > 0, `Name missing for ${type}`);
      assert.ok(spec.dimensions[0] > 0, `Width must be > 0 for ${type}`);
      assert.ok(spec.dimensions[1] > 0, `Height must be > 0 for ${type}`);
      assert.ok(spec.dimensions[2] > 0, `Depth must be > 0 for ${type}`);
      assert.ok(spec.massKg > 0, `Mass must be > 0 for ${type}`);
      assert.ok(spec.material.colorHex !== undefined, `Color hex missing for ${type}`);
      assert.ok(spec.structuralRole, `Structural role missing for ${type}`);
      assert.ok(Array.isArray(spec.snapPoints), `Snap points array missing for ${type}`);
    }
  });

  it('2. verifies structural roles across Blocks, Structural, Architectural, and Finishing', () => {
    const roles = ALL_21_TYPES.map((t) => getComponentSpec(t).structuralRole);
    assert.ok(roles.includes('foundation'));
    assert.ok(roles.includes('compressive_masonry'));
    assert.ok(roles.includes('load_bearing_column'));
    assert.ok(roles.includes('load_transfer_beam'));
    assert.ok(roles.includes('horizontal_deck'));
    assert.ok(roles.includes('wall_partition'));
    assert.ok(roles.includes('architectural_opening'));
    assert.ok(roles.includes('stair_circulation'));
    assert.ok(roles.includes('surface_finish'));
    assert.ok(roles.includes('decorative'));
  });

  it('3. generates parentless, deterministic 3D procedural Object3D meshes for all 21 components', () => {
    for (const type of ALL_21_TYPES) {
      const mesh = createComponentMesh(type);
      assert.ok(mesh, `Mesh generation failed for ${type}`);
      assert.strictEqual(mesh.parent, null, `Mesh must be parentless for safe dual-realm evaluation: ${type}`);
      assert.ok(mesh.name.startsWith('ConstructionMesh_'), `Mesh name must be descriptive: ${mesh.name}`);
      assert.ok(mesh.children.length > 0, `Mesh should have geometric child sub-elements: ${type}`);
    }
  });

  it('4. distinguishes single-hand grabbable vs heavy two-handed components according to IWSDK rules', () => {
    // Heavy structural components require two hands
    const heavyTypes: ComponentType[] = [
      'reinforced_column',
      'horizontal_beam',
      'wall_panel',
      'roof_truss',
      'roof_panel',
      'corner_wall',
      'internal_partition',
    ];

    for (const type of heavyTypes) {
      const spec = getComponentSpec(type);
      assert.strictEqual(
        spec.requiresTwoHands,
        true,
        `Heavy component ${type} must require two hands (TwoHandsGrabbable)`,
      );
    }

    // Single hand blocks
    const singleHandTypes: ComponentType[] = [
      'small_brick',
      'large_brick',
      'square_block',
      'rectangular_block',
      'foundation_block',
      'decorative_element',
    ];

    for (const type of singleHandTypes) {
      const spec = getComponentSpec(type);
      assert.strictEqual(
        spec.requiresTwoHands,
        false,
        `Light component ${type} must be single-hand grabbable (OneHandGrabbable)`,
      );
    }
  });
});

describe('Advenquo: Workspace Separation & Pad Clearance', () => {
  it('1. verifies building pad area is completely unobstructed at startup', () => {
    const bp = BlueprintManager.getInstance();
    assert.strictEqual(
      bp.getWorkspaceAnchor().visible,
      false,
      'Blueprint reference must start hidden to ensure building pad is clear',
    );
  });

  it('2. pins blueprint reference comfortably beside player without obstructing pad at Z = -2.5m', () => {
    const bp = BlueprintManager.getInstance();
    bp.startConstruction();

    assert.strictEqual(bp.getModeState(), 'construction_pinned');
    assert.strictEqual(bp.getWorkspaceAnchor().visible, true);

    const leftPos = bp.getWorkspaceAnchor().position;
    // Left pin is at [-1.15, 1.2, -1.1] which is well clear of the pad at (0, 0.5, -2.5)
    assert.strictEqual(leftPos.x, -1.15);
    assert.strictEqual(leftPos.z, -1.1);
    assert.ok(Math.abs(leftPos.z - (-2.5)) > 1.0, 'Blueprint pin must not collide with building pad depth');

    // Switch pin to right
    bp.setPinPlacement('right');
    const rightPos = bp.getWorkspaceAnchor().position;
    assert.strictEqual(rightPos.x, 1.15);
    assert.strictEqual(rightPos.z, -1.1);

    // Hide blueprint again
    bp.toggleVisibility();
    assert.strictEqual(bp.getWorkspaceAnchor().visible, false);
  });
});

describe('Advenquo: Desktop Mouse & Keyboard Construction Controls', () => {
  it('1. selects a component from palette and holds it in placement preview', () => {
    const controller = new DesktopConstructionController();
    controller.selectComponent('test_brick_1', 'small_brick', new Vector3(0, 0.5, -2.5));

    assert.strictEqual(controller.isHoldingBlock(), true);
    const item = controller.getHeldItem();
    assert.ok(item);
    assert.strictEqual(item?.componentType, 'small_brick');
    assert.strictEqual(item?.instanceId, 'test_brick_1');
    assert.deepStrictEqual(item?.position.toArray(), [0, 0.5, -2.5]);
  });

  it('2. supports 90-degree yaw rotation and pitch rotation', () => {
    const controller = new DesktopConstructionController();
    controller.selectComponent('test_rot_1', 'rectangular_block', new Vector3(0, 0.5, -2.5));

    // Rotate yaw by 90 degrees (Math.PI / 2)
    controller.rotateHeldComponentYaw(Math.PI / 2);
    let rot = controller.getHeldRotation();
    let q = new Quaternion(...rot);
    assert.ok(Math.abs(q.y) > 0.6, `Yaw quaternion Y should be ~0.707, got ${q.y}`);

    // Rotate pitch by 90 degrees
    controller.rotateHeldComponentPitch(Math.PI / 2);
    rot = controller.getHeldRotation();
    q = new Quaternion(...rot);
    assert.ok(Math.abs(q.x) > 0.4, `Pitch quaternion X should be significant, got ${q.x}`);
  });

  it('3. places component on the building pad and commits to assembly graph', () => {
    assemblySystem.reset();
    const controller = new DesktopConstructionController();
    controller.selectComponent('base_foundation_1', 'foundation_block', new Vector3(0, 0.1, -2.5));

    const placed = controller.place();
    assert.strictEqual(placed, true);
    assert.strictEqual(controller.isHoldingBlock(), false);

    const graph = assemblySystem.getGraph();
    assert.strictEqual(graph.hasNode('base_foundation_1'), true);
    assert.strictEqual(graph.isConnectedToGround('base_foundation_1'), true);
  });

  it('4. stacks second block vertically on top of first with automatic snap detection', () => {
    const controller = new DesktopConstructionController();
    // Select second block and place above base foundation (which has top sockets)
    controller.selectComponent('stacked_block_2', 'concrete_block', new Vector3(0, 0.35, -2.5));

    const placed = controller.place();
    assert.strictEqual(placed, true);

    const graph = assemblySystem.getGraph();
    assert.strictEqual(graph.hasNode('stacked_block_2'), true);
    // Stacked block should be connected and transitively grounded through foundation
    assert.strictEqual(graph.isConnectedToGround('stacked_block_2'), true);
  });

  it('5. duplicates a selected component and offsets placement', () => {
    const controller = new DesktopConstructionController();
    controller.selectComponent('dup_source', 'square_block', new Vector3(0.5, 0.1, -2.5));

    const duplicatedId = controller.duplicateSelectedComponent();
    assert.ok(duplicatedId);
    assert.ok(duplicatedId.startsWith('dup_square_block_'));
    assert.strictEqual(controller.isHoldingBlock(), true);

    const held = controller.getHeldItem();
    assert.strictEqual(held?.instanceId, duplicatedId);
    // Check offset by +0.2m along X
    assert.ok(Math.abs((held?.position.x ?? 0) - 0.7) < 0.001);
  });

  it('6. deletes held component cleanly from assembly and cancels preview', () => {
    const controller = new DesktopConstructionController();
    controller.selectComponent('delete_candidate', 'timber_piece', new Vector3(0, 0.5, -2.5));

    assert.strictEqual(controller.isHoldingBlock(), true);
    const deleted = controller.deleteSelectedComponent();
    assert.strictEqual(deleted, true);
    assert.strictEqual(controller.isHoldingBlock(), false);
    assert.strictEqual(assemblySystem.getGraph().hasNode('delete_candidate'), false);
  });

  it('7. allows undoing last placed block and repositions without graph corruption', () => {
    const controller = new DesktopConstructionController();
    controller.selectComponent('undo_block', 'clay_brick', new Vector3(-0.4, 0.1, -2.5));
    controller.place();
    assert.strictEqual(assemblySystem.getGraph().hasNode('undo_block'), true);

    const undoneId = controller.undoLastPlacement();
    assert.strictEqual(undoneId, 'undo_block');
    assert.strictEqual(assemblySystem.getGraph().hasNode('undo_block'), false);
  });
});

describe('Advenquo: 8-Step Construction Tutorial Progression', () => {
  it('advances through all 8 guided tutorial steps sequentially via user actions', () => {
    const tutorial = new ConstructionTutorialManager();
    tutorial.reset();

    assert.strictEqual(tutorial.getCurrentStepIndex(), 1);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Select Foundation Block');

    // Step 1: Select foundation block
    tutorial.onComponentSelected('foundation_block');
    assert.strictEqual(tutorial.getCurrentStepIndex(), 2);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Move Into Construction Area');

    // Step 2: Move into construction area (Z < -1.0)
    tutorial.onComponentMoved(new Vector3(0, 0.5, -2.0));
    assert.strictEqual(tutorial.getCurrentStepIndex(), 3);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Place on Building Pad');

    // Step 3: Place on building pad
    tutorial.onComponentPlaced({
      instanceId: 't_foundation',
      componentType: 'foundation_block',
      isStacked: false,
      hasConnection: false,
    });
    assert.strictEqual(tutorial.getCurrentStepIndex(), 4);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Select Second Block');

    // Step 4: Select another block (non-foundation)
    tutorial.onComponentSelected('concrete_block');
    assert.strictEqual(tutorial.getCurrentStepIndex(), 5);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Stack on First Block');

    // Step 5: Stack on first block
    tutorial.onComponentPlaced({
      instanceId: 't_block_2',
      componentType: 'concrete_block',
      isStacked: true,
      hasConnection: true,
    });
    assert.strictEqual(tutorial.getCurrentStepIndex(), 6);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Rotate a Component');

    // Step 6: Rotate component
    tutorial.onComponentRotated();
    assert.strictEqual(tutorial.getCurrentStepIndex(), 7);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Connect Compatible Components');

    // Step 7: Connect compatible components
    tutorial.onComponentPlaced({
      instanceId: 't_block_3',
      componentType: 'rectangular_block',
      isStacked: false,
      hasConnection: true,
    });
    assert.strictEqual(tutorial.getCurrentStepIndex(), 8);
    assert.strictEqual(tutorial.getCurrentStep().title, 'Remove and Reposition');

    // Step 8: Remove and reposition
    tutorial.onComponentRepositioned();
    assert.strictEqual(tutorial.isTutorialCompleted(), true);
  });
});
