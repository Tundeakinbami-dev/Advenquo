/**
 * Advenquo: Critical Meta Quest 3 VR Fixes Regression Suite
 *
 * Validates the three essential fixes:
 * 1. Task 1: VR Vestibular Camera Protection (CinematicCameraSystem guard against XR overrides)
 * 2. Task 2: Focus-Resume Position Preservation (LocomotionComfortSystem no teleport on unblur)
 * 3. Task 3: Player-Accessible VR Navigation Tablet (Player anchoring, summoning, and repositioning)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  PerspectiveCamera,
  Vector3,
  VisibilityState,
  Object3D,
} from '@iwsdk/core';

import { CinematicCameraSystem } from '../src/systems/cinematic-camera-system.js';
import { LocomotionComfortSystem } from '../src/locomotion-comfort-system.js';
import { VRTabletSystem } from '../src/vr-tablet-system.js';

describe('Critical Meta Quest 3 VR Fixes', () => {
  describe('Task 1: VR Vestibular Camera Protection', () => {
    it('prevents head-bob and lerping from modifying camera when in immersive VR (VisibilityState.Visible)', () => {
      const mockCamera = new PerspectiveCamera(75, 1, 0.1, 100);
      mockCamera.position.set(0, 1.6, 0);
      mockCamera.rotation.set(0, 0, 0);

      const mockWorld = {
        camera: mockCamera,
        visibilityState: { value: VisibilityState.Visible },
      };

      const camSys = new CinematicCameraSystem(mockWorld as any);
      camSys.init();

      // Enable movement that would normally trigger head-bob in 2D
      camSys.setMoving(true);
      camSys.update(0.1);

      // Camera position must remain completely unchanged in VR
      assert.strictEqual(mockCamera.position.x, 0, 'Camera X must not receive head-bob in VR');
      assert.strictEqual(mockCamera.position.y, 1.6, 'Camera Y must not receive head-bob in VR');
      assert.strictEqual(mockCamera.position.z, 0, 'Camera Z must not be modified in VR');
    });

    it('prevents conversation framing lerp and lookAt from modifying camera when in immersive VR', () => {
      const mockCamera = new PerspectiveCamera(75, 1, 0.1, 100);
      mockCamera.position.set(0, 1.6, 0);
      mockCamera.rotation.set(0, 0, 0);

      const mockWorld = {
        camera: mockCamera,
        visibilityState: { value: VisibilityState.Visible },
      };

      const camSys = new CinematicCameraSystem(mockWorld as any);
      camSys.init();

      // Trigger conversation framing
      camSys.enterConversationFraming(new Vector3(2, 0, -3), 'Baba Adéwálé', 1.7);
      assert.strictEqual(camSys.getMode(), 'conversation');

      // Execute several update steps
      camSys.update(0.016);
      camSys.update(0.016);
      camSys.update(0.05);

      // Camera transforms must remain untouched because physical headset tracking owns the pose
      assert.strictEqual(mockCamera.position.x, 0, 'Camera X must not lerp toward NPC in VR');
      assert.strictEqual(mockCamera.position.y, 1.6, 'Camera Y must not lerp toward NPC in VR');
      assert.strictEqual(mockCamera.position.z, 0, 'Camera Z must not lerp toward NPC in VR');
      assert.strictEqual(mockCamera.rotation.x, 0, 'Camera rotation must not be overridden in VR');
    });

    it('prevents camera modification when session is blurred (VisibilityState.VisibleBlurred)', () => {
      const mockCamera = new PerspectiveCamera(75, 1, 0.1, 100);
      mockCamera.position.set(1.2, 1.6, -0.5);

      const mockWorld = {
        camera: mockCamera,
        visibilityState: { value: VisibilityState.VisibleBlurred },
      };

      const camSys = new CinematicCameraSystem(mockWorld as any);
      camSys.init();
      camSys.setMoving(true);
      camSys.update(0.1);

      assert.strictEqual(mockCamera.position.x, 1.2, 'Camera must remain invariant during system overlay');
      assert.strictEqual(mockCamera.position.y, 1.6, 'Camera must remain invariant during system overlay');
      assert.strictEqual(mockCamera.position.z, -0.5, 'Camera must remain invariant during system overlay');
    });

    it('retains normal head-bob and cinematic framing in desktop 2D mode (VisibilityState.NonImmersive)', () => {
      const mockCamera = new PerspectiveCamera(75, 1, 0.1, 100);
      mockCamera.position.set(0, 1.6, 0);

      const mockWorld = {
        camera: mockCamera,
        visibilityState: { value: VisibilityState.NonImmersive },
      };

      const camSys = new CinematicCameraSystem(mockWorld as any);
      camSys.init();
      camSys.setMoving(true);
      camSys.update(0.1);

      // In 2D, head bob modifies position slightly
      const yDelta = Math.abs(mockCamera.position.y - 1.6);
      assert.ok(yDelta > 0.0001, 'Desktop 2D mode should still produce exploration head-bob');
    });
  });

  describe('Task 2: Eliminate Focus-Resume Teleportation', () => {
    it('preserves player world position when returning from Meta system menu focus loss', () => {
      let listener: ((state: VisibilityState) => void) | null = null;
      let setPositionCalls: Vector3[] = [];

      const mockLocomotion = {
        config: {
          turningMethod: { value: '' },
          turningAngle: { value: 0 },
          slidingSpeed: { value: 0 },
          comfortAssist: { value: 0 },
          enableJumping: { value: false },
        },
        setPlayerPosition: (pos: Vector3) => {
          setPositionCalls.push(pos.clone());
        },
      };

      const mockPlayer = new Object3D();
      // Player is exploring at coordinates [4.2, 0, -3.1]
      mockPlayer.position.set(4.2, 0, -3.1);

      const mockWorld = {
        getSystem: () => mockLocomotion,
        visibilityState: {
          subscribe: (fn: (state: VisibilityState) => void) => {
            listener = fn;
            return () => {};
          },
        },
      };

      const comfortSys = new LocomotionComfortSystem(mockWorld as any);
      (comfortSys as any).player = mockPlayer;
      comfortSys.init();

      // 1. Initial entry into VR: player position is preserved (or set if at 0,0,0)
      assert.ok(listener, 'Must subscribe to visibilityState transitions');
      listener!(VisibilityState.Visible);

      // Player was at [4.2, 0, -3.1], so initial spawn should not force [0, 0, 0]
      assert.strictEqual(mockPlayer.position.x, 4.2);
      assert.strictEqual(mockPlayer.position.z, -3.1);

      // Clear calls
      setPositionCalls = [];

      // 2. Player opens Meta Quest Universal Menu (session blurred)
      listener!(VisibilityState.VisibleBlurred);
      assert.strictEqual(setPositionCalls.length, 0, 'Must not teleport when blurred');

      // 3. Player closes Universal Menu and resumes gameplay (Visible)
      listener!(VisibilityState.Visible);

      // CRITICAL ASSERTION: No teleportation occurs on resume!
      assert.strictEqual(
        setPositionCalls.length,
        0,
        'Must NOT call setPlayerPosition when returning to Visible from system menu',
      );
      assert.strictEqual(mockPlayer.position.x, 4.2, 'Player X must remain unchanged after resume');
      assert.strictEqual(mockPlayer.position.z, -3.1, 'Player Z must remain unchanged after resume');
    });

    it('allows updating boundary limits dynamically for different travel destinations', () => {
      const comfortSys = new LocomotionComfortSystem({} as any);
      comfortSys.setBoundaryLimits(-15, 15, 5, 25);

      // Player at z = 15 (e.g. Yaba location) should not be clamped to market courtyard
      const mockPlayer = new Object3D();
      mockPlayer.position.set(2.0, 0, 15.0);
      (comfortSys as any).player = mockPlayer;

      comfortSys.update(0.016);
      assert.strictEqual(mockPlayer.position.z, 15.0, 'Player in Yaba must not be clamped by market bounds');
    });
  });

  describe('Task 3: Make VR Navigation Tablet Player-Accessible', () => {
    it('verifies vr-nav-tablet authored transform in scene JSON is placed comfortably in front of origin', () => {
      const sceneJsonPath = resolve(process.cwd(), 'public/scenes/main.iwsdk.scene.json');
      const rawScene = readFileSync(sceneJsonPath, 'utf-8');
      const scene = JSON.parse(rawScene);

      const tabletNode = scene.nodes.find((n: any) => n.id === 'vr-nav-tablet');
      assert.ok(tabletNode, 'vr-nav-tablet node must exist in main scene JSON');
      assert.deepStrictEqual(
        tabletNode.transform.position,
        [0, 1.25, -0.85],
        'Authored tablet position must be centered horizontally at 0.85m distance and 1.25m height',
      );
      assert.deepStrictEqual(
        tabletNode.transform.rotationDeg,
        [-10, 0, 0],
        'Authored tablet rotation must tilt slightly upward (-10 deg) to face player eyes',
      );
    });

    it('attaches dedicated tablet anchor to player rig and repositions tablet facing player', () => {
      const mockTablet = new Object3D();
      mockTablet.name = 'vr-nav-tablet';
      (mockTablet as any).document = { rootElement: { setProperties: () => {} } };
      (mockTablet as any).getElementById = () => null;

      const mockPlayer = new Object3D();
      mockPlayer.name = 'PlayerRig';
      mockPlayer.position.set(5.0, 0, -10.0);

      const mockWorld = {
        getSceneObject: (id: string) => (id === 'vr-nav-tablet' ? mockTablet : null),
        player: mockPlayer,
      };

      const tabletSys = new VRTabletSystem(mockWorld as any);
      (tabletSys as any).player = mockPlayer;
      tabletSys.init();

      // Tablet system instance must be accessible
      assert.strictEqual(VRTabletSystem.getInstance(), tabletSys);

      // Tablet anchor must be attached to the player rig
      const anchor = tabletSys.getTabletAnchor();
      assert.ok(anchor, 'Dedicated player-relative tablet anchor must be created');
      assert.strictEqual(anchor.parent, mockPlayer, 'Tablet anchor must be parented to player rig');
      assert.strictEqual(mockTablet.parent, anchor, 'Tablet must be parented to tablet anchor');

      // Tablet anchor should be ~0.85m in front of player at height ~1.25m
      assert.ok(Math.abs(anchor.position.x) < 1e-4);
      assert.strictEqual(anchor.position.y, 1.25);
      assert.ok(Math.abs(anchor.position.z - (-0.85)) < 1e-4);
    });

    it('supports summon, dismiss, and toggle functionality', () => {
      const mockTablet = new Object3D();
      mockTablet.name = 'vr-nav-tablet';
      (mockTablet as any).document = { rootElement: { setProperties: () => {} } };
      (mockTablet as any).getElementById = () => null;

      const mockPlayer = new Object3D();

      const mockWorld = {
        getSceneObject: (id: string) => (id === 'vr-nav-tablet' ? mockTablet : null),
        player: mockPlayer,
      };

      const tabletSys = new VRTabletSystem(mockWorld as any);
      (tabletSys as any).player = mockPlayer;
      tabletSys.init();

      assert.strictEqual(tabletSys.isTabletVisible(), true, 'Tablet starts visible');

      // Dismiss tablet
      tabletSys.dismissTablet();
      assert.strictEqual(tabletSys.isTabletVisible(), false, 'Tablet is dismissed');
      assert.strictEqual(mockTablet.visible, false);

      // Summon tablet
      tabletSys.summonTablet();
      assert.strictEqual(tabletSys.isTabletVisible(), true, 'Tablet is summoned');
      assert.strictEqual(mockTablet.visible, true);

      // Toggle tablet
      tabletSys.toggleTablet();
      assert.strictEqual(tabletSys.isTabletVisible(), false, 'Toggle dismisses tablet');

      tabletSys.toggleTablet();
      assert.strictEqual(tabletSys.isTabletVisible(), true, 'Toggle summons tablet');
    });

    it('repositions tablet in front of player when head orientation rotates', () => {
      const mockTablet = new Object3D();
      mockTablet.name = 'vr-nav-tablet';
      (mockTablet as any).document = { rootElement: { setProperties: () => {} } };
      (mockTablet as any).getElementById = () => null;

      const mockPlayer = new Object3D();
      const mockHead = new Object3D();
      // Player head is looking 90 degrees to the left (yaw = +PI/2)
      mockHead.rotation.y = Math.PI / 2;
      (mockPlayer as any).head = mockHead;

      const mockWorld = {
        getSceneObject: (id: string) => (id === 'vr-nav-tablet' ? mockTablet : null),
        player: mockPlayer,
      };

      const tabletSys = new VRTabletSystem(mockWorld as any);
      (tabletSys as any).player = mockPlayer;
      tabletSys.init();

      tabletSys.repositionInFrontOfPlayer(1.0);

      const anchor = tabletSys.getTabletAnchor()!;
      // When head yaw is PI/2:
      // offsetX = -sin(PI/2) * 1.0 = -1.0
      // offsetZ = -cos(PI/2) * 1.0 = ~0.0
      assert.ok(Math.abs(anchor.position.x - (-1.0)) < 0.001);
      assert.ok(Math.abs(anchor.position.z) < 0.001);
      assert.strictEqual(anchor.position.y, 1.25);
    });
  });
});
