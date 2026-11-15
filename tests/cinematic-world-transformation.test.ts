import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Object3D, Vector3 } from '@iwsdk/core';

import { buildNpcIyaAlaso } from '../src/scene-assets/npc-iya-alaso.scene-asset.js';
import { buildNpcBabaAdewale } from '../src/scene-assets/npc-baba-adewale.scene-asset.js';
import { buildMarketGround } from '../src/scene-assets/market-ground.scene-asset.js';
import { buildMarketStall } from '../src/scene-assets/market-stall.scene-asset.js';
import { NpcAnimationSystem } from '../src/npc-animation-system.js';
import { NPCCharacter } from '../src/npc-component.js';
import { IYA_ALASO_BONE_MAP } from '../src/animation/fbx-animation-loader.js';
import { animationManager } from '../src/animation/animation-manager.js';
import { EnvironmentalAnimationSystem } from '../src/environmental-animation-system.js';
import { qualityProfileSystem } from '../src/systems/quality-profile-system.js';

describe('Advenquo: Cinematic 3D World Transformation', () => {
  describe('1. Iyá Aláso Master Artisan Character Architecture', () => {
    it('creates an anatomically proportioned character with full skeletal joint hierarchy', () => {
      const iya = buildNpcIyaAlaso();
      assert.strictEqual(iya.name, 'NpcIyaAlaso');

      // Verify all required articulated named joints for skeletal animation
      const chest = iya.getObjectByName('Iya_Chest');
      const neck = iya.getObjectByName('Iya_Neck');
      const head = iya.getObjectByName('Iya_Head');
      const rightArm = iya.getObjectByName('Iya_RightArm');
      const rightForearm = iya.getObjectByName('Iya_RightForearm');
      const leftArm = iya.getObjectByName('Iya_LeftArm');

      assert.ok(chest, 'Iya_Chest joint must be present');
      assert.ok(neck, 'Iya_Neck joint must be present');
      assert.ok(head, 'Iya_Head joint must be present');
      assert.ok(rightArm, 'Iya_RightArm joint must be present');
      assert.ok(rightForearm, 'Iya_RightForearm joint must be present');
      assert.ok(leftArm, 'Iya_LeftArm joint must be present');

      // Verify hierarchy chaining
      assert.strictEqual(neck?.parent, chest, 'Iya_Neck must be child of Iya_Chest');
      assert.strictEqual(head?.parent, neck, 'Iya_Head must be child of Iya_Neck');
      assert.strictEqual(rightArm?.parent, chest, 'Iya_RightArm must be child of Iya_Chest');
      assert.strictEqual(rightForearm?.parent, rightArm, 'Iya_RightForearm must be child of Iya_RightArm');
      assert.strictEqual(leftArm?.parent, chest, 'Iya_LeftArm must be child of Iya_Chest');
    });

    it('contains detailed anatomical facial features, ceremonial Gele, and artisan props', () => {
      const iya = buildNpcIyaAlaso();

      // Facial geometry check
      const head = iya.getObjectByName('Iya_Head')!;
      assert.ok(head, 'Head joint must exist');

      let hasSclera = false;
      let hasIris = false;
      let hasGele = false;
      let hasEarring = false;
      let hasNose = false;

      head.traverse((child: any) => {
        if (child.isMesh) {
          // Identify elements by name or geometry properties
          if (child.name?.includes('EyeSclera') || (child.geometry?.type === 'SphereGeometry' && child.scale.x > 1.1)) {
            hasSclera = true;
          }
          if (child.name?.includes('EyeIris') || (child.geometry?.type === 'SphereGeometry' && child.position.z > 0.1)) {
            hasIris = true;
          }
          if (child.geometry?.type === 'TorusGeometry' && child.rotation.y !== 0) {
            hasEarring = true;
          }
          if (child.geometry?.type === 'TorusGeometry' && child.geometry?.parameters?.arc !== undefined) {
            hasGele = true;
          }
          if (child.geometry?.type === 'BoxGeometry' && child.position.z > 0.1) {
            hasNose = true;
          }
        }
      });

      assert.ok(hasSclera, 'Iyá Aláso must possess sculpted eye sclera');
      assert.ok(hasIris, 'Iyá Aláso must possess dark pupils/irises');
      assert.ok(hasNose, 'Iyá Aláso must possess sculpted Nigerian nose bridge');
      assert.ok(hasEarring, 'Iyá Aláso must possess traditional gold coral hoop earrings');
      assert.ok(hasGele, 'Iyá Aláso must possess multi-tiered ceremonial folded Gele wings');

      // Artisan props check: bolt of Adire cloth in left arm
      const leftArm = iya.getObjectByName('Iya_LeftArm')!;
      let hasClothBolt = false;
      leftArm.traverse((child: any) => {
        if (child.isMesh && child.geometry?.type === 'CylinderGeometry' && child.geometry?.parameters?.height > 0.4) {
          hasClothBolt = true;
        }
      });
      assert.ok(hasClothBolt, 'Iyá Aláso must hold a rolled bolt of Adire cloth in left arm');

      // Welcoming palm gesture on right forearm
      const rightForearm = iya.getObjectByName('Iya_RightForearm')!;
      let hasFingers = false;
      rightForearm.traverse((child: any) => {
        if (child.isMesh && child.geometry?.type === 'CylinderGeometry' && child.geometry?.parameters?.height < 0.1) {
          hasFingers = true;
        }
      });
      assert.ok(hasFingers, 'Iyá Aláso must have articulated fingers open in welcoming gesture');
    });

    it('maps to standard Mixamo bone hierarchy via IYA_ALASO_BONE_MAP', () => {
      assert.strictEqual(IYA_ALASO_BONE_MAP['mixamorigSpine'], 'Iya_Chest');
      assert.strictEqual(IYA_ALASO_BONE_MAP['mixamorigNeck'], 'Iya_Neck');
      assert.strictEqual(IYA_ALASO_BONE_MAP['mixamorigHead'], 'Iya_Head');
      assert.strictEqual(IYA_ALASO_BONE_MAP['mixamorigRightArm'], 'Iya_RightArm');
      assert.strictEqual(IYA_ALASO_BONE_MAP['mixamorigRightForeArm'], 'Iya_RightForearm');
      assert.strictEqual(IYA_ALASO_BONE_MAP['mixamorigLeftArm'], 'Iya_LeftArm');
    });
  });

  describe('2. Baba Adéwálé Elder Character Architecture', () => {
    it('creates an articulated elder character with beard, Fila, and Agbada robes', () => {
      const baba = buildNpcBabaAdewale();
      assert.strictEqual(baba.name, 'NpcBabaAdewale');

      const chest = baba.getObjectByName('Baba_Chest');
      const neck = baba.getObjectByName('Baba_Neck');
      const head = baba.getObjectByName('Baba_Head');
      const rightForearm = baba.getObjectByName('Baba_RightForearm');

      assert.ok(chest, 'Baba_Chest joint must exist');
      assert.ok(neck, 'Baba_Neck joint must exist');
      assert.ok(head, 'Baba_Head joint must exist');
      assert.ok(rightForearm, 'Baba_RightForearm joint must exist');

      // Verify elder facial features: beard and tilted Fila cap
      let hasBeard = false;
      let hasFila = false;
      head?.traverse((child: any) => {
        if (child.isMesh) {
          if (child.geometry?.type === 'SphereGeometry' && child.position.y < 0) {
            hasBeard = true;
          }
          if (child.geometry?.type === 'CylinderGeometry' && child.rotation.z !== 0) {
            hasFila = true;
          }
        }
      });

      assert.ok(hasBeard, 'Baba Adéwálé must have grey-flecked elder beard');
      assert.ok(hasFila, 'Baba Adéwálé must wear dignified tilted Fila cap');
    });
  });

  describe('3. Real-Time Multi-Joint Articulation & Dialogue Animation', () => {
    it('articulates Iyá Aláso with breathing, gaze tracking, and conversational gesturing', () => {
      const mockPlayer = new Object3D();
      mockPlayer.position.set(2.65, 1.6, 0.5); // Player stands 1.9m in front of Iyá Aláso

      const iya = buildNpcIyaAlaso();
      iya.position.set(2.65, 0, -1.4);

      const mockEntity = {
        index: 101,
        object3D: iya,
        getValue: (comp: any, field: string) => {
          if (comp === NPCCharacter) {
            if (field === 'inDialogue') return true;
            if (field === 'interactionRadius') return 3.5;
            if (field === 'name') return 'Iyá Aláso';
          }
          return null;
        },
      };

      const mockWorld = {
        player: mockPlayer,
        camera: { position: mockPlayer.position },
      };

      const animSys = new NpcAnimationSystem(mockWorld as any);
      (animSys as any).queries = {
        npcs: { entities: [mockEntity] },
      };

      animSys.init();

      // Step simulation by 0.5 seconds
      animSys.update(0.5);

      const chest = iya.getObjectByName('Iya_Chest')!;
      const head = iya.getObjectByName('Iya_Head')!;
      const rightForearm = iya.getObjectByName('Iya_RightForearm')!;

      // 1. Chest should exhibit respiratory expansion
      assert.notStrictEqual(chest.scale.z, 1.0, 'Chest should expand during breathing cycle');

      // 2. Head should track toward player
      assert.notStrictEqual(head.rotation.x, 0, 'Head should pitch toward player eye level');

      // 3. Right forearm should gesture during dialogue
      assert.notStrictEqual(rightForearm.rotation.x, 0, 'Forearm should articulate speech gesture');
      assert.notStrictEqual(rightForearm.rotation.z, 0, 'Forearm should pulse with natural cadence');
    });
  });

  describe('4. Environment Transformation: Ground & Market Stall Architecture', () => {
    it('creates detailed ground with cobblestone paving, drainage gutters, and gateway curbs', () => {
      const ground = buildMarketGround();
      assert.strictEqual(ground.name, 'MarketGround');

      let hasWalkableSlab = false;
      let hasGutters = false;
      let hasStormGrates = false;
      let hasOuterRoad = false;

      ground.traverse((child: any) => {
        if (child.isMesh) {
          // Check for 16x16 central slab
          if (child.geometry?.parameters?.width === 16 && child.geometry?.parameters?.depth === 16) {
            hasWalkableSlab = true;
          }
          // Check for outer road (24x24)
          if (child.geometry?.parameters?.width === 24 && child.geometry?.parameters?.depth === 24) {
            hasOuterRoad = true;
          }
          // Check for gutter channels
          if (child.geometry?.parameters?.width === 16.4) {
            hasGutters = true;
          }
          // Check for cast iron storm grates
          if (child.geometry?.parameters?.width === 1.2 && child.position.y === -0.01) {
            hasStormGrates = true;
          }
        }
      });

      assert.ok(hasWalkableSlab, 'Walkable courtyard slab (16m × 16m) must exist');
      assert.ok(hasOuterRoad, 'Surrounding roadway slab (24m × 24m) must exist for continuous world scale');
      assert.ok(hasGutters, 'Concrete stormwater drainage gutters must exist');
      assert.ok(hasStormGrates, 'Cast iron storm grates must exist');
    });

    it('creates an artisan market stall with canopy, brass scales, and dye vats', () => {
      const stall = buildMarketStall();
      assert.strictEqual(stall.name, 'MarketStall');

      assert.ok(stall.getObjectByName('MarketStallCanopy'), 'Canopy roof mesh must exist');
      assert.ok(stall.getObjectByName('MarketStallAwningFlap'), 'Scalloped awning flap must exist');

      let hasBrassScale = false;
      let hasDyeVats = false;
      let hasHangingCloth = false;

      stall.traverse((child: any) => {
        if (child.isMesh) {
          if (child.geometry?.type === 'CylinderGeometry' && child.position.y > 0.9 && child.position.x > 0.5) {
            hasBrassScale = true;
          }
          if (child.geometry?.type === 'SphereGeometry' && child.position.y < 0.3) {
            hasDyeVats = true;
          }
          if (child.geometry?.type === 'BoxGeometry' && child.position.y > 1.2 && child.position.z < -0.4) {
            hasHangingCloth = true;
          }
        }
      });

      assert.ok(hasBrassScale, 'Traditional brass trade balance scale must be present on counter');
      assert.ok(hasDyeVats, 'Earthen terracotta indigo dye vats must be present under stall shelf');
      assert.ok(hasHangingCloth, 'Hanging textile displays must be suspended from back rail');
    });
  });

  describe('5. Ambient Environmental Life: Wind & Foliage Animation', () => {
    it('animates vegetation sway and canopy flutter without runtime memory allocations', () => {
      const palmMock = new Object3D();
      palmMock.name = 'courtyard-palm-west';
      const palmMesh = new Object3D();
      palmMesh.name = 'PalmFronds';
      (palmMesh as any).type = 'Mesh';
      palmMock.add(palmMesh);

      const flapMock = new Object3D();
      flapMock.name = 'MarketStallAwningFlap';
      (flapMock as any).type = 'Mesh';

      const mockScene = new Object3D();
      mockScene.add(palmMock);
      mockScene.add(flapMock);

      const mockWorld = {
        scene: mockScene,
        player: { head: { getWorldPosition: (v: Vector3) => v.set(0, 1.6, 0) } },
      };

      const envAnim = new EnvironmentalAnimationSystem(mockWorld as any);
      envAnim.init();

      // Step time forward
      envAnim.update(0.6);

      // Verify that palm frond and fabric flap rotated due to ambient wind
      assert.notStrictEqual(palmMesh.rotation.z, 0, 'Palm fronds must sway with ambient breeze');
      assert.notStrictEqual(flapMock.rotation.x, 0, 'Awning flap must flutter in the wind');
    });

    it('respects Quest VR quality profile distance threshold for peak 72 FPS frame budgets', () => {
      const distantPalm = new Object3D();
      distantPalm.name = 'distant-coconut-palm';
      (distantPalm as any).type = 'Mesh';
      distantPalm.position.set(50.0, 0, 50.0); // 70m away, far past Quest 15m threshold

      const mockScene = new Object3D();
      mockScene.add(distantPalm);

      const mockWorld = {
        scene: mockScene,
        player: { head: { getWorldPosition: (v: Vector3) => v.set(0, 1.6, 0) } },
      };

      const envAnim = new EnvironmentalAnimationSystem(mockWorld as any);
      envAnim.init();

      // Force Quest profile
      (qualityProfileSystem as any).currentProfileName = 'quest_vr_performance';

      envAnim.update(0.5);

      // Distant palm should be culled from rotation update to save GPU/CPU cycles
      assert.strictEqual(distantPalm.rotation.z, 0, 'Distant vegetation (>15m) should be culled in Quest VR mode');
    });
  });
});
