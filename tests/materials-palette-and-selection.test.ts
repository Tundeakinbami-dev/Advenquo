/**
 * Advenquo: Materials Palette, Component Selection & Placement Preview Test Suite
 *
 * Verifies:
 * 1. 10 core construction components exist in catalog with physical dimensions and snap sockets
 * 2. Component categorization for UI filtering (blocks, foundation, walls, openings, roof, finishing)
 * 3. PlacementPreview ghost mesh visibility when candidate is null (pad placement preview)
 * 4. DesktopConstructionController component selection, rotation, and cancellation lifecycle
 * 5. First-launch guided tutorial steps and instruction copy
 * 6. Multi-brick stacking and assembly graph connection validation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  CONSTRUCTION_CATALOG,
  getComponentSpec,
  type ComponentType,
} from '../src/construction/materials/construction-catalog.js';

import { createComponentMesh } from '../src/construction/materials/component-factory.js';
import { MaterialSelector } from '../src/construction/ui/material-selector.js';
import { PlacementPreview } from '../src/construction/interaction/placement-preview.js';
import { DesktopConstructionController } from '../src/construction/interaction/desktop-interaction.js';
import {
  ConstructionTutorialManager,
  TUTORIAL_STEPS,
} from '../src/construction/progression/construction-tutorial-manager.js';
import { AssemblyManager } from '../src/construction/assembly/assembly-manager.js';
import { BlockSnappingSystem } from '../src/construction/assembly/block-snapping-system.js';

describe('Advenquo: Materials Palette & Object Selection', () => {
  // ── 1. Selectable Construction Components ─────────────────────────────────
  describe('1. 10 Core Construction Components Definition & Specifications', () => {
    const REQUIRED_COMPONENTS: Array<{ type: ComponentType; expectedName: string; category: string }> = [
      { type: 'clay_brick', expectedName: 'Modular Clay Brick', category: 'blocks' },
      { type: 'large_brick', expectedName: 'Large Clay Brick', category: 'blocks' },
      { type: 'concrete_block', expectedName: 'Solid Concrete Block', category: 'blocks' },
      { type: 'foundation_block', expectedName: 'Foundation Footing Block', category: 'foundation' },
      { type: 'floor_component', expectedName: 'Precast Concrete Floor Slab', category: 'foundation' },
      { type: 'wall_panel', expectedName: 'Standard Wall Panel', category: 'walls' },
      { type: 'corner_wall', expectedName: 'Corner Wall Unit', category: 'walls' },
      { type: 'door_frame', expectedName: 'Structural Door Frame Unit', category: 'openings' },
      { type: 'window_frame', expectedName: 'Modular Window Frame Unit', category: 'openings' },
      { type: 'roof_panel', expectedName: 'Corrugated Roof Panel', category: 'roof' },
    ];

    for (const item of REQUIRED_COMPONENTS) {
      it(`verifies component '${item.type}' exists in catalog with non-zero dimensions`, () => {
        const spec = getComponentSpec(item.type);
        assert.ok(spec, `Catalog must have spec for ${item.type}`);
        assert.strictEqual(spec.type, item.type);
        assert.ok(spec.name.length > 0, 'Must have a descriptive display name');
        assert.strictEqual(spec.dimensions.length, 3, 'Must have [width, height, depth]');
        assert.ok(spec.dimensions[0] > 0, 'Width must be positive');
        assert.ok(spec.dimensions[1] > 0, 'Height must be positive');
        assert.ok(spec.dimensions[2] > 0, 'Depth must be positive');
        assert.ok(spec.massKg > 0, 'Mass must be positive');
        assert.ok(Array.isArray(spec.snapPoints), 'Must provide snapPoints array');
        assert.ok(spec.snapPoints.length >= 2, 'Must have at least 2 snap points for stacking/joining');
      });
    }
  });

  // ── 2. Material Categorization for UI Filter Tabs ─────────────────────────
  describe('2. Material Categories and Catalog Classification', () => {
    it('verifies all 6 UI material categories are populated with catalog components', () => {
      const CATEGORY_MAP: Record<string, ComponentType[]> = {
        blocks: [
          'clay_brick',
          'small_brick',
          'large_brick',
          'concrete_block',
          'sandcrete_block',
          'square_block',
          'rectangular_block',
        ],
        foundation: ['foundation_block', 'floor_component'],
        walls: ['wall_panel', 'corner_wall', 'internal_partition', 'reinforced_column', 'horizontal_beam'],
        openings: ['door_frame', 'door', 'window_frame', 'window', 'staircase'],
        roof: ['roof_panel', 'roof_truss', 'timber_piece'],
        finishing: [
          'roofing_material',
          'floor_finish',
          'wall_finish',
          'decorative_element',
          'steel_connector',
          'rebar',
        ],
      };

      for (const [category, types] of Object.entries(CATEGORY_MAP)) {
        for (const type of types) {
          const spec = CONSTRUCTION_CATALOG[type];
          assert.ok(spec, `Category '${category}' references valid component '${type}'`);
        }
      }
    });
  });

  // ── 3. PlacementPreview Visibility and Feedback ───────────────────────────
  describe('3. PlacementPreview Ghost Mesh & Pad Placement', () => {
    it('initializes hidden and becomes visible on building pad when candidate is null', () => {
      const preview = new PlacementPreview();
      const root = preview.getRoot();

      assert.strictEqual(root.visible, false, 'Preview root should initially be hidden');

      const padWorldPos = new Vector3(0, 0.05, -2.5);
      const heldRot = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);

      // Call updatePreview with candidate = null (hovering over empty building pad)
      preview.updatePreview('clay_brick', null, padWorldPos, heldRot);

      assert.strictEqual(root.visible, true, 'Preview root must be visible on the pad even when candidate is null');

      // Check preview mesh child
      const previewMesh = root.children.find((c) => c.type === 'Mesh' && c !== (preview as any).snapMarker) as any;
      assert.ok(previewMesh, 'Preview root must contain the ghost box mesh');

      // Brick height is 0.08, half height is 0.04. Position Y should be at least 0.05 + 0.04 = 0.09
      assert.ok(
        previewMesh.position.y >= 0.089,
        `Ghost position Y (${previewMesh.position.y}) must sit on or above pad surface (0.09m)`,
      );
      assert.strictEqual(previewMesh.position.x, padWorldPos.x);
      assert.strictEqual(previewMesh.position.z, padWorldPos.z);

      // Snap marker should NOT be visible when there is no target socket
      assert.strictEqual((preview as any).snapMarker.visible, false, 'Snap marker should be hidden on empty pad');

      // Calling hide() hides the root
      preview.hide();
      assert.strictEqual(root.visible, false, 'Calling hide() must hide preview root');
    });

    it('shows emerald green preview when snap candidate is valid', () => {
      const preview = new PlacementPreview();
      const validCandidate: any = {
        isValid: true,
        snappedPosition: new Vector3(0, 0.2, -2.5),
        snappedRotation: new Quaternion(),
        targetSnapPoint: {
          worldPosition: new Vector3(0, 0.16, -2.5),
        },
      };

      preview.updatePreview('clay_brick', validCandidate, new Vector3(0, 0, 0));
      assert.strictEqual(preview.getRoot().visible, true);
      assert.strictEqual((preview as any).snapMarker.visible, true);
      assert.strictEqual((preview as any).previewMaterial.color.getHex(), 0x00e676); // Emerald Green
    });

    it('shows crimson red preview when snap candidate is invalid', () => {
      const preview = new PlacementPreview();
      const invalidCandidate: any = {
        isValid: false,
        snappedPosition: new Vector3(0, 0.2, -2.5),
        snappedRotation: new Quaternion(),
        targetSnapPoint: {
          worldPosition: new Vector3(0, 0.16, -2.5),
        },
      };

      preview.updatePreview('clay_brick', invalidCandidate, new Vector3(0, 0, 0));
      assert.strictEqual(preview.getRoot().visible, true);
      assert.strictEqual((preview as any).snapMarker.visible, true);
      assert.strictEqual((preview as any).previewMaterial.color.getHex(), 0xff5252); // Crimson Red
    });
  });

  // ── 4. DesktopConstructionController Selection & Placement Lifecycle ──────
  describe('4. Desktop Component Selection, Rotation and Cancellation', () => {
    it('selects component, tracks held item, allows rotation and cancellation', () => {
      const controller = new DesktopConstructionController();

      assert.strictEqual(controller.isHoldingComponent(), false, 'Initially not holding any component');
      assert.strictEqual(controller.getHeldComponentType(), null);

      // 1. Select clay_brick
      controller.selectComponent('clay_brick');
      assert.strictEqual(controller.isHoldingComponent(), true);
      assert.strictEqual(controller.getHeldComponentType(), 'clay_brick');

      // 2. Rotate yaw
      controller.rotateYaw(Math.PI / 2);
      assert.strictEqual(controller.isHoldingComponent(), true);

      // 3. Rotate pitch
      controller.rotatePitch(Math.PI / 2);
      assert.strictEqual(controller.isHoldingComponent(), true);

      // 4. Cancel placement (e.g. Esc or Cancel button)
      controller.cancelPlacement();
      assert.strictEqual(controller.isHoldingComponent(), false);
      assert.strictEqual(controller.getHeldComponentType(), null);
    });

    it('places component on the building pad when released', () => {
      const controller = new DesktopConstructionController();
      controller.selectComponent('foundation_block');

      // Move held component over building pad
      controller.moveHeldComponent(new Vector3(0, 0.05, -2.5));

      // Release / place
      const placed = controller.releaseAndPlace();
      assert.strictEqual(placed.success, true, 'Should place component successfully');
      assert.strictEqual(placed.type, 'foundation_block');
      assert.strictEqual(controller.isHoldingComponent(), false, 'Holding state clears on placement');
    });
  });

  // ── 5. Construction Tutorial Guided Sequence ──────────────────────────────
  describe('5. First-Launch Construction Tutorial', () => {
    it('verifies step 1 copy is welcoming and directs player to select a brick from Materials', () => {
      const step1 = TUTORIAL_STEPS[0];
      assert.strictEqual(step1.index, 1);
      assert.strictEqual(
        step1.instruction,
        'Welcome to your construction workshop. Select a brick from Materials to begin.',
      );
    });

    it('advances tutorial steps properly through selection, placement and stacking', () => {
      const tutorial = new ConstructionTutorialManager();

      assert.strictEqual(tutorial.getCurrentStep().index, 1);
      assert.strictEqual(
        tutorial.getCurrentStep().instruction,
        'Welcome to your construction workshop. Select a brick from Materials to begin.',
      );

      // Step 1 -> 2: Select a brick
      tutorial.onComponentSelected('clay_brick');
      assert.strictEqual(tutorial.getCurrentStep().index, 2);

      // Step 2 -> 3: Move over pad
      tutorial.onComponentMoved(new Vector3(0, 0.05, -2.5));
      assert.strictEqual(tutorial.getCurrentStep().index, 3);

      // Step 3 -> 4: Place first component on pad
      tutorial.onComponentPlaced({
        instanceId: 'brick_1',
        componentType: 'clay_brick',
        isStacked: false,
        hasConnection: false,
      });
      assert.strictEqual(tutorial.getCurrentStep().index, 4);

      // Step 4 -> 5: Select another brick
      tutorial.onComponentSelected('clay_brick');
      assert.strictEqual(tutorial.getCurrentStep().index, 5);

      // Step 5 -> 6: Stack second brick on first
      tutorial.onComponentPlaced({
        instanceId: 'brick_2',
        componentType: 'clay_brick',
        isStacked: true,
        hasConnection: true,
      });
      assert.strictEqual(tutorial.getCurrentStep().index, 6);
    });
  });

  // ── 6. Two-Brick Stacking & Assembly Connection ───────────────────────────
  describe('6. Brick Stacking & Assembly Graph Connection', () => {
    it('stacks brick 2 atop brick 1 and verifies valid connection in AssemblyManager', () => {
      const assembly = new AssemblyManager();
      const placedMap = new Map<string, any>();

      // 1. Register foundation block at pad center
      const foundationPos: [number, number, number] = [0, 0.15, -2.5];
      const foundationRecord = assembly.registerPlacedBlock(
        'foundation_1',
        'foundation_block',
        foundationPos,
        [0, 0, 0, 1],
        true,
      );
      assert.ok(foundationRecord);
      placedMap.set('foundation_1', foundationRecord);

      // 2. Snap brick 1 to foundation block top
      const heldPose: [number, number, number] = [0, 0.35, -2.5];
      const candidate1 = BlockSnappingSystem.findBestSnapCandidate(
        'clay_brick',
        heldPose,
        [0, 0, 0, 1],
        placedMap,
      );

      assert.strictEqual(candidate1.hasCandidate, true, 'Should find snap candidate on foundation block');
      assert.ok(candidate1.snappedPosition, 'Must have snapped position');
      assert.ok(candidate1.snappedRotation, 'Must have snapped rotation');

      // Place brick 1 at snapped position
      const brick1Record = assembly.registerPlacedBlock(
        'brick_1',
        'clay_brick',
        candidate1.snappedPosition,
        candidate1.snappedRotation,
      );
      assert.ok(brick1Record);
      placedMap.set('brick_1', brick1Record);

      // 3. Connect foundation_1 and brick_1
      assembly.connectBlocks(
        'foundation_1',
        candidate1.targetSnapPointId!,
        'brick_1',
        candidate1.sourceSnapPointId!,
      );

      const graph = assembly.getGraph();
      assert.strictEqual(graph.getNodeCount(), 2);
      assert.strictEqual(graph.hasConnection('foundation_1', 'brick_1'), true);

      // 4. Snap brick 2 atop brick 1
      const brick2Pose: [number, number, number] = [
        candidate1.snappedPosition[0],
        candidate1.snappedPosition[1] + 0.12,
        candidate1.snappedPosition[2],
      ];

      const candidate2 = BlockSnappingSystem.findBestSnapCandidate(
        'clay_brick',
        brick2Pose,
        [0, 0, 0, 1],
        placedMap,
      );

      assert.strictEqual(candidate2.hasCandidate, true, 'Should find snap candidate on brick 1');
      assert.strictEqual(candidate2.targetInstanceId, 'brick_1');
      assert.ok(candidate2.snappedPosition);
      assert.ok(candidate2.snappedRotation);

      // Place brick 2
      const brick2Record = assembly.registerPlacedBlock(
        'brick_2',
        'clay_brick',
        candidate2.snappedPosition,
        candidate2.snappedRotation,
      );
      assert.ok(brick2Record);
      placedMap.set('brick_2', brick2Record);

      assembly.connectBlocks(
        'brick_1',
        candidate2.targetSnapPointId!,
        'brick_2',
        candidate2.sourceSnapPointId!,
      );

      assert.strictEqual(graph.getNodeCount(), 3);
      assert.strictEqual(graph.hasConnection('brick_1', 'brick_2'), true);

      // Both brick 1 and brick 2 are connected to foundation and grounded
      assert.strictEqual(graph.isConnectedToGround('brick_1'), true);
      assert.strictEqual(graph.isConnectedToGround('brick_2'), true);
    });
  });

  // ── 7. Complete Construction Materials Catalogue (6 Categories A-F & 31 Items) ──
  describe('7. Complete Materials Catalogue Across All 6 Required Categories', () => {
    const CATEGORIES_A_TO_F: Record<string, ComponentType[]> = {
      'A. Basic building blocks': [
        'clay_brick',
        'half_brick',
        'square_block',
        'large_brick',
        'foundation_block',
        'corner_block',
      ],
      'B. Structural components': [
        'foundation_section',
        'floor_component',
        'reinforced_column',
        'horizontal_beam',
        'lintel_beam',
        'rebar',
        'steel_connector',
      ],
      'C. Walls and partitions': [
        'wall_panel',
        'half_wall_panel',
        'internal_partition',
        'corner_wall',
      ],
      'D. Doors and windows': [
        'door_frame',
        'door',
        'window_frame',
        'window',
        'window_lintel',
      ],
      'E. Roofing': [
        'roof_slab',
        'roof_panel',
        'roof_truss',
        'roof_ridge',
        'roofing_material',
      ],
      'F. Finishing materials': [
        'floor_finish',
        'wall_finish',
        'paint_texture',
        'decorative_element',
      ],
    };

    it('verifies all 31 components across 6 categories exist and have valid specifications', () => {
      let totalComponents = 0;
      for (const [categoryName, components] of Object.entries(CATEGORIES_A_TO_F)) {
        assert.ok(components.length >= 4, `${categoryName} must have multiple components`);
        for (const type of components) {
          totalComponents++;
          const spec = getComponentSpec(type);
          assert.ok(spec, `Catalog must contain specification for ${type}`);
          assert.strictEqual(spec.type, type);
          assert.ok(spec.name.length > 0, `${type} must have a name`);
          assert.ok(spec.dimensions[0] > 0, `${type} width must be positive`);
          assert.ok(spec.dimensions[1] > 0, `${type} height must be positive`);
          assert.ok(spec.dimensions[2] > 0, `${type} depth must be positive`);
          assert.ok(spec.massKg > 0, `${type} mass must be positive`);
          assert.ok(spec.snapPoints.length > 0, `${type} must have snap points`);
          assert.ok(spec.material, `${type} must have material properties`);
        }
      }
      assert.strictEqual(totalComponents, 31, 'Must define exactly 31 construction components');
    });

    it('verifies half_brick is genuinely half the length of standard brick with matching height & depth', () => {
      const standard = getComponentSpec('clay_brick');
      const half = getComponentSpec('half_brick');

      // Standard is [0.24, 0.08, 0.12]
      assert.strictEqual(standard.dimensions[0], 0.24, 'Standard brick width is 0.24m');
      // Half must be exactly 0.12 (half of 0.24)
      assert.strictEqual(half.dimensions[0], 0.12, 'Half brick width must be exactly 0.12m (half of standard)');
      assert.strictEqual(half.dimensions[1], standard.dimensions[1], 'Half brick height matches standard brick');
      assert.strictEqual(half.dimensions[2], standard.dimensions[2], 'Half brick depth matches standard brick');
      assert.strictEqual(half.massKg, standard.massKg / 2, 'Half brick mass is half of standard brick');
    });

    it('verifies every single component produces a real, renderable Three.js Object3D mesh', () => {
      const allTypes = Object.values(CATEGORIES_A_TO_F).flat();
      for (const type of allTypes) {
        const mesh = createComponentMesh(type);
        assert.ok(mesh, `createComponentMesh('${type}') must return a Three.js Object3D`);
        assert.strictEqual(mesh.name, `ConstructionMesh_${type}`);
        assert.ok(mesh.children.length > 0, `${type} mesh must contain geometry meshes`);
      }
    });

    it('verifies MaterialSelector initializes with all 31 components for VR arc palette', () => {
      const selector = new MaterialSelector();
      const slots = selector.getSeatedPaletteSlots([0, 0.5, -2.5]);
      assert.strictEqual(slots.length, 31, 'Seated arc palette must offer all 31 components');
      for (const slot of slots) {
        assert.ok(slot.isUnlocked, `${slot.type} should be unlocked`);
        assert.ok(slot.palletPosition, `${slot.type} must have 3D arc position`);
      }
    });

    it('verifies index.html contains all 6 category tabs and cards for all 31 components', () => {
      const htmlPath = resolve(process.cwd(), 'index.html');
      const html = readFileSync(htmlPath, 'utf-8');

      // Category tabs
      assert.ok(html.includes('data-category="blocks"'), 'Must have blocks category tab');
      assert.ok(html.includes('data-category="structural"'), 'Must have structural category tab');
      assert.ok(html.includes('data-category="walls"'), 'Must have walls category tab');
      assert.ok(html.includes('data-category="openings"'), 'Must have openings category tab');
      assert.ok(html.includes('data-category="roof"'), 'Must have roof category tab');
      assert.ok(html.includes('data-category="finishing"'), 'Must have finishing category tab');

      // Component count badge
      assert.ok(html.includes('id="materials-count-badge"'), 'Must have component count badge');
      assert.ok(html.includes('31 Components'), 'Badge must display total component count');

      // Every component must have a card
      const allTypes = Object.values(CATEGORIES_A_TO_F).flat();
      for (const type of allTypes) {
        assert.ok(
          html.includes(`data-component-type="${type}"`),
          `index.html must have a card for component type '${type}'`,
        );
      }
    });
  });
});
