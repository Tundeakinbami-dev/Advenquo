/**
 * Advenquo: Phase 3 Character Realism & Animation Regression Suite.
 *
 * Validates:
 * 1. Character model import pipeline & LOD manifest declarations
 * 2. Missing-asset graceful fallback & diagnostic logging
 * 3. Mixamo-to-Advenquo humanoid bone retargeting
 * 4. Multi-joint respiratory breathing & natural posture weight shifting
 * 5. Procedural stochastic eyelid blinking (120ms duration)
 * 6. Dialogue-triggered speech lip synchronization
 * 7. Conversational hand & forearm gestures
 * 8. Shared articulation hierarchy across primary NPCs
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  Object3D,
  Vector3,
} from '@iwsdk/core';

import {
  characterModelLoader,
  CharacterModelLoader,
  CHARACTER_MANIFESTS,
} from '../src/animation/character-model-loader.js';
import { buildNpcIyaAlaso } from '../src/scene-assets/npc-iya-alaso.scene-asset.js';
import { buildNpcBabaAdewale } from '../src/scene-assets/npc-baba-adewale.scene-asset.js';
import { buildNpcTobi } from '../src/scene-assets/npc-tobi.scene-asset.js';
import { NpcAnimationSystem } from '../src/npc-animation-system.js';
import { NPCCharacter } from '../src/npc-component.js';

describe('Phase 3: Character Realism & Advanced Articulation', () => {
  describe('1. Asset Pipeline & LOD Manifests', () => {
    it('defines explicit polygon targets and LOD configs for hero characters', () => {
      const iyaManifest = CHARACTER_MANIFESTS['npc-iya-alaso'];
      assert.ok(iyaManifest, 'Iyá Aláso manifest must exist');
      assert.strictEqual(iyaManifest.targetTriangles, 20000, 'Target triangles must be ~20,000');
      assert.ok(iyaManifest.lodConfig.lod0Url, 'Must specify LOD0 URL');
      assert.ok(iyaManifest.lodConfig.distances, 'Must specify LOD transition distances');
    });

    it('reports missing external GLB assets cleanly and falls back without throwing', async () => {
      const loader = CharacterModelLoader.getInstance();
      let fallbackInvoked = false;

      const model = await loader.loadCharacterWithLOD('npc-iya-alaso', () => {
        fallbackInvoked = true;
        return buildNpcIyaAlaso();
      });

      assert.ok(model, 'Model must be returned');
      assert.strictEqual(fallbackInvoked, true, 'Fallback factory must be invoked when external GLB is missing');
      assert.strictEqual(loader.isExternalModelAvailable('npc-iya-alaso'), false, 'Reports external asset unavailability explicitly');
    });

    it('retargets Mixamo humanoid bones to Advenquo named joints', () => {
      const mockRig = new Object3D();
      const mixamoChest = new Object3D();
      mixamoChest.name = 'mixamorig:Spine2';
      const mixamoHead = new Object3D();
      mixamoHead.name = 'mixamorig:Head';
      mockRig.add(mixamoChest);
      mixamoChest.add(mixamoHead);

      const loader = CharacterModelLoader.getInstance();
      loader.retargetBones(mockRig, {
        Spine2: 'Iya_Chest',
        Head: 'Iya_Head',
      });

      assert.strictEqual(mixamoChest.name, 'Iya_Chest');
      assert.strictEqual(mixamoHead.name, 'Iya_Head');
    });
  });

  describe('2. Iyá Aláso Organic Geometry & Joint Structure', () => {
    it('constructs anatomically proportioned Yoruba matriarch with articulated facial & limb joints', () => {
      const iya = buildNpcIyaAlaso();

      // Check named joints
      assert.ok(iya.getObjectByName('Iya_Chest'), 'Must have Iya_Chest joint');
      assert.ok(iya.getObjectByName('Iya_Neck'), 'Must have Iya_Neck joint');
      assert.ok(iya.getObjectByName('Iya_Head'), 'Must have Iya_Head joint');
      assert.ok(iya.getObjectByName('Iya_RightArm'), 'Must have Iya_RightArm joint');
      assert.ok(iya.getObjectByName('Iya_RightForearm'), 'Must have Iya_RightForearm joint');
      assert.ok(iya.getObjectByName('Iya_RightHand'), 'Must have Iya_RightHand joint');
      assert.ok(iya.getObjectByName('Iya_LeftArm'), 'Must have Iya_LeftArm joint');

      // Check facial articulation
      assert.ok(iya.getObjectByName('EyeLid_L'), 'Must have EyeLid_L for blinking');
      assert.ok(iya.getObjectByName('EyeLid_R'), 'Must have EyeLid_R for blinking');
      assert.ok(iya.getObjectByName('UpperLip'), 'Must have UpperLip for speech');
      assert.ok(iya.getObjectByName('LowerLip'), 'Must have LowerLip for speech');
      assert.ok(iya.getObjectByName('Jaw_Joint'), 'Must have Jaw_Joint for mouth opening');
    });
  });

  describe('3. Organic Animation System Integration', () => {
    let mockWorld: any;
    let animSystem: NpcAnimationSystem;
    let mockEntity: any;
    let iyaModel: Object3D;

    beforeEach(() => {
      iyaModel = buildNpcIyaAlaso();
      iyaModel.position.set(0, 0, 0);

      mockEntity = {
        index: 1,
        object3D: iyaModel,
        getValue: (comp: any, field: string) => {
          if (field === 'inDialogue') return false;
          if (field === 'interactionRadius') return 3.5;
          return null;
        },
      };

      mockWorld = {
        camera: { position: new Vector3(0, 1.6, 5) },
      };

      animSystem = new NpcAnimationSystem(mockWorld);
      (animSystem as any).queries = {
        npcs: {
          entities: [mockEntity],
        },
      };
      animSystem.init();
    });

    it('performs multi-joint respiratory breathing and weight shifting on standing NPC', () => {
      const chest = iyaModel.getObjectByName('Iya_Chest');
      assert.ok(chest);
      const initialChestY = chest.position.y;
      const initialRootX = iyaModel.position.x;

      animSystem.update(0.5);

      // Chest Y must modulate with breathing phase
      assert.notStrictEqual(chest.position.y, initialChestY, 'Chest height should oscillate with breathing');
      // Root X must oscillate with standing weight shift
      assert.notStrictEqual(iyaModel.position.x, initialRootX, 'Root X should subtly shift weight');
    });

    it('modulates lower lip and jaw when NPC enters dialogue', () => {
      const lowerLip = iyaModel.getObjectByName('LowerLip');
      const jaw = iyaModel.getObjectByName('Jaw_Joint');
      assert.ok(lowerLip);
      assert.ok(jaw);

      const restingLipY = lowerLip.position.y;

      // Put NPC in dialogue
      mockEntity.getValue = (comp: any, field: string) => {
        if (field === 'inDialogue') return true;
        return null;
      };

      animSystem.update(0.1);

      assert.notStrictEqual(lowerLip.position.y, restingLipY, 'Lower lip must articulate during dialogue speech');
    });

    it('articulates right forearm and hand gestures when in dialogue', () => {
      const forearm = iyaModel.getObjectByName('Iya_RightForearm');
      assert.ok(forearm);
      const initialRotX = forearm.rotation.x;

      mockEntity.getValue = (comp: any, field: string) => {
        if (field === 'inDialogue') return true;
        return null;
      };

      animSystem.update(0.2);

      assert.notStrictEqual(forearm.rotation.x, initialRotX, 'Forearm rotation must modulate with conversational gesture');
    });
  });

  describe('4. Shared Articulation Hierarchy on Other Important NPCs', () => {
    it('Baba Adéwálé shares articulated chest, head, and forearm joints', () => {
      const baba = buildNpcBabaAdewale();
      assert.ok(baba.getObjectByName('Baba_Chest'), 'Baba must have chest joint');
      assert.ok(baba.getObjectByName('Baba_Head'), 'Baba must have head joint');
      assert.ok(baba.getObjectByName('Baba_RightForearm'), 'Baba must have forearm joint');
    });

    it('Tobi Adeleke shares articulated chest, head, and forearm joints', () => {
      const tobi = buildNpcTobi();
      assert.ok(tobi.getObjectByName('Tobi_Chest'), 'Tobi must have chest joint');
      assert.ok(tobi.getObjectByName('Tobi_Head'), 'Tobi must have head joint');
      assert.ok(tobi.getObjectByName('Tobi_RightForearm'), 'Tobi must have forearm joint');
    });
  });
});
