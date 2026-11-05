/**
 * Advenquo — Standing Jump & Pain Gesture FBX Animation Integration Tests.
 *
 * Verifies:
 * 1. FBX animation asset organization and file preservation
 * 2. FBXLoader parsing, hierarchy inspection, and clip detection
 * 3. Skeleton compatibility and Mixamo bone hierarchy auditing
 * 4. Root motion analysis, meter scaling, and horizontal clamping (teleport prevention)
 * 5. Track retargeting to procedural characters (Tobi Adeleke, moving pedestrians)
 * 6. CharacterAnimationController state transitions (idle, walking, jumping, pain recovery)
 * 7. Preservation of existing character models, NPC routines, and scene components
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  AnimationClip,
  Object3D,
  Vector3,
} from '@iwsdk/core';

import {
  FBXAnimationLoaderService,
  TOBI_BONE_MAP,
  PEDESTRIAN_BONE_MAP,
} from '../src/animation/fbx-animation-loader.js';
import {
  CharacterAnimationController,
} from '../src/animation/character-animation-controller.js';
import {
  AnimationManager,
} from '../src/animation/animation-manager.js';
import { buildNpcTobi } from '../src/scene-assets/npc-tobi.scene-asset.js';
import { buildMovingPedestrian } from '../src/scene-assets/moving-pedestrian.scene-asset.js';

describe('Advenquo FBX Animation System & Asset Integration', () => {
  const rootDir = process.cwd();
  const jumpOrganizedPath = path.resolve(rootDir, 'public/assets/animations/standing-jump/standing-jump.fbx');
  const painOrganizedPath = path.resolve(rootDir, 'public/assets/animations/pain-gesture/pain-gesture.fbx');
  const jumpRootPath = path.resolve(rootDir, 'Standing Jump.fbx');
  const painRootPath = path.resolve(rootDir, 'Pain Gesture.fbx');

  it('Criterion 1: FBX files are organized in public/assets/animations/ and root originals are preserved', () => {
    // Check root files are preserved (not deleted)
    assert.ok(fs.existsSync(jumpRootPath), 'Root "Standing Jump.fbx" must be preserved');
    assert.ok(fs.existsSync(painRootPath), 'Root "Pain Gesture.fbx" must be preserved');

    // Check organized directory structure
    assert.ok(fs.existsSync(jumpOrganizedPath), 'Organized standing-jump.fbx must exist in public/assets/animations/');
    assert.ok(fs.existsSync(painOrganizedPath), 'Organized pain-gesture.fbx must exist in public/assets/animations/');

    // Check non-empty file size (> 1MB)
    const jumpStat = fs.statSync(jumpOrganizedPath);
    const painStat = fs.statSync(painOrganizedPath);
    assert.ok(jumpStat.size > 1_000_000, `Standing Jump file must be valid FBX binary, got ${jumpStat.size} bytes`);
    assert.ok(painStat.size > 1_000_000, `Pain Gesture file must be valid FBX binary, got ${painStat.size} bytes`);
  });

  it('Criterion 2: Three.js FBXLoader parses both files and detects valid animation clips', () => {
    const loader = FBXAnimationLoaderService.getInstance();
    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const painBuf = fs.readFileSync(painOrganizedPath);

    const jumpParsed = loader.parseFBX(jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength));
    const painParsed = loader.parseFBX(painBuf.buffer.slice(painBuf.byteOffset, painBuf.byteOffset + painBuf.byteLength));

    assert.ok(jumpParsed.clips.length > 0, 'Standing Jump FBX must contain at least one valid AnimationClip');
    assert.ok(painParsed.clips.length > 0, 'Pain Gesture FBX must contain at least one valid AnimationClip');

    const jumpClip = jumpParsed.clips[0];
    const painClip = painParsed.clips[0];

    assert.ok(jumpClip.duration > 2.0 && jumpClip.duration < 3.0, `Jump clip duration should be ~2.4s, got ${jumpClip.duration}`);
    assert.ok(painClip.duration > 1.5 && painClip.duration < 2.0, `Pain clip duration should be ~1.7s, got ${painClip.duration}`);
    assert.equal(jumpClip.tracks.length, 53, 'Standing Jump clip must contain 53 keyframe tracks');
    assert.equal(painClip.tracks.length, 53, 'Pain Gesture clip must contain 53 keyframe tracks');
  });

  it('Criterion 3: Skeleton audit validates Mixamo bone hierarchy and root motion trajectories', () => {
    const loader = FBXAnimationLoaderService.getInstance();
    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const painBuf = fs.readFileSync(painOrganizedPath);

    const jumpParsed = loader.parseFBX(jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength));
    const painParsed = loader.parseFBX(painBuf.buffer.slice(painBuf.byteOffset, painBuf.byteOffset + painBuf.byteLength));

    const jumpAudit = loader.auditAnimation('standing-jump.fbx', jumpParsed.clips[0], jumpParsed.group);
    const painAudit = loader.auditAnimation('pain-gesture.fbx', painParsed.clips[0], painParsed.group);

    assert.equal(jumpAudit.isMixamoRig, true, 'Standing Jump must be recognized as Mixamo humanoid rig');
    assert.equal(painAudit.isMixamoRig, true, 'Pain Gesture must be recognized as Mixamo humanoid rig');
    assert.equal(jumpAudit.hasRootMotion, true, 'Standing Jump contains root motion track');
    assert.equal(painAudit.hasRootMotion, true, 'Pain Gesture contains root motion track');

    // Verify vertical jump elevation
    assert.ok(
      jumpAudit.rootMotion.deltaYRange > 0.4 && jumpAudit.rootMotion.deltaYRange < 1.0,
      `Jump elevation should be ~0.49m - ~0.87m, got ${jumpAudit.rootMotion.deltaYRange}m`,
    );
    assert.equal(jumpAudit.rootMotion.returnsToStart, true, 'Jump animation root must return to start elevation');
  });

  it('Criterion 4: Root motion sanitization clamps horizontal drift while preserving vertical jump trajectory', () => {
    const loader = FBXAnimationLoaderService.getInstance();
    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const jumpParsed = loader.parseFBX(jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength));
    const rawClip = jumpParsed.clips[0];

    const sanitized = loader.sanitizeMixamoClip(rawClip, 'jump_sanitized');
    const posTrack = sanitized.tracks.find((t) => t.name.endsWith('.position'));
    assert.ok(posTrack, 'Sanitized clip must have position track');

    const vals = posTrack.values;
    const startX = vals[0];
    const startZ = vals[2];

    for (let i = 0; i < vals.length; i += 3) {
      assert.equal(vals[i], startX, 'Horizontal X position must remain clamped to startX');
      assert.equal(vals[i + 2], startZ, 'Horizontal Z position must remain clamped to startZ');
    }

    // Check vertical scale: peak Y in meters should be reasonable (between 1.0m and 1.7m)
    let maxY = -Infinity;
    for (let i = 0; i < vals.length; i += 3) {
      maxY = Math.max(maxY, vals[i + 1]);
    }
    assert.ok(maxY > 1.2 && maxY < 2.0, `Peak jump height in meters should be ~1.5m, got ${maxY}`);
  });

  it('Criterion 5: Tracks successfully retarget to Tobi Adeleke procedural hierarchy', () => {
    const loader = FBXAnimationLoaderService.getInstance();
    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const painBuf = fs.readFileSync(painOrganizedPath);

    const jumpParsed = loader.parseFBX(jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength));
    const painParsed = loader.parseFBX(painBuf.buffer.slice(painBuf.byteOffset, painBuf.byteOffset + painBuf.byteLength));

    const tobiJump = loader.retargetClipToProcedural(jumpParsed.clips[0], TOBI_BONE_MAP, 'Tobi', {
      includeVerticalDisplacement: true,
      scale: 0.01,
    });
    const tobiPain = loader.retargetClipToProcedural(painParsed.clips[0], TOBI_BONE_MAP, 'Tobi', {
      includeVerticalDisplacement: false,
    });

    const trackNames = tobiJump.tracks.map((t) => t.name);
    assert.ok(trackNames.includes('Tobi_Chest.quaternion'), 'Retargeted clip must target Tobi_Chest');
    assert.ok(trackNames.includes('Tobi_Head.quaternion'), 'Retargeted clip must target Tobi_Head');
    assert.ok(trackNames.includes('Tobi_RightArm.quaternion'), 'Retargeted clip must target Tobi_RightArm');
    assert.ok(trackNames.includes('Tobi_RightForearm.quaternion'), 'Retargeted clip must target Tobi_RightForearm');
    assert.ok(trackNames.includes('.position'), 'Retargeted jump clip must include root .position vertical elevation');

    const painTrackNames = tobiPain.tracks.map((t) => t.name);
    assert.ok(painTrackNames.includes('Tobi_Chest.quaternion'), 'Pain clip must articulate Tobi_Chest');
    assert.ok(painTrackNames.includes('Tobi_Head.quaternion'), 'Pain clip must articulate Tobi_Head');
  });

  it('Criterion 6: Tracks successfully retarget to Moving Pedestrian walk rig', () => {
    const loader = FBXAnimationLoaderService.getInstance();
    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const jumpParsed = loader.parseFBX(jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength));

    const pedJump = loader.retargetClipToProcedural(jumpParsed.clips[0], PEDESTRIAN_BONE_MAP, 'Pedestrian', {
      includeVerticalDisplacement: true,
      scale: 0.01,
    });

    const trackNames = pedJump.tracks.map((t) => t.name);
    assert.ok(trackNames.includes('Torso.quaternion'), 'Pedestrian clip must target Torso');
    assert.ok(trackNames.includes('WalkRightArm.quaternion'), 'Pedestrian clip must target WalkRightArm');
    assert.ok(trackNames.includes('WalkLeftArm.quaternion'), 'Pedestrian clip must target WalkLeftArm');
    assert.ok(trackNames.includes('WalkRightLeg.quaternion'), 'Pedestrian clip must target WalkRightLeg');
    assert.ok(trackNames.includes('WalkLeftLeg.quaternion'), 'Pedestrian clip must target WalkLeftLeg');
  });

  it('Criterion 7: CharacterAnimationController plays Standing Jump and recovers smoothly to idle', () => {
    const tobiMesh = buildNpcTobi();
    const manager = AnimationManager.getInstance();

    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const painBuf = fs.readFileSync(painOrganizedPath);
    manager.processAnimationBuffers(
      jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength),
      painBuf.buffer.slice(painBuf.byteOffset, painBuf.byteOffset + painBuf.byteLength),
    );

    const controller = manager.setupController('test_tobi_jump', tobiMesh, 'retargeted');
    assert.equal(controller.getCurrentState(), 'idle', 'Initial state should be idle');

    // Trigger jump
    const jumpSuccess = controller.triggerJump();
    assert.equal(jumpSuccess, true, 'Trigger jump should succeed');
    assert.equal(controller.getCurrentState(), 'jumping', 'State should transition to jumping');
    assert.equal(controller.isPlayingOneShot(), true, 'One-shot action should be active');

    // Step to jump apex (t = 1.2s)
    controller.update(1.2);
    assert.equal(controller.getCurrentState(), 'jumping');

    // Step past animation duration (total duration 2.43s)
    controller.update(1.5);
    assert.equal(controller.isPlayingOneShot(), false, 'One-shot action should complete');
    assert.equal(controller.getCurrentState(), 'idle', 'Controller should recover smoothly to idle');

    controller.dispose();
  });

  it('Criterion 8: CharacterAnimationController plays Pain Gesture and recovers to walking', () => {
    const pedMesh = buildMovingPedestrian();
    const manager = AnimationManager.getInstance();

    const jumpBuf = fs.readFileSync(jumpOrganizedPath);
    const painBuf = fs.readFileSync(painOrganizedPath);
    manager.processAnimationBuffers(
      jumpBuf.buffer.slice(jumpBuf.byteOffset, jumpBuf.byteOffset + jumpBuf.byteLength),
      painBuf.buffer.slice(painBuf.byteOffset, painBuf.byteOffset + painBuf.byteLength),
    );

    const controller = manager.setupController('test_ped_pain', pedMesh, 'retargeted');
    controller.transitionTo('walking');
    assert.equal(controller.getCurrentState(), 'walking');

    // Trigger pain reaction
    const painSuccess = controller.triggerPain();
    assert.equal(painSuccess, true);
    assert.equal(controller.getCurrentState(), 'pain');
    assert.equal(controller.isPlayingOneShot(), true);

    // Step forward past pain duration (1.77s)
    controller.update(1.0);
    assert.equal(controller.getCurrentState(), 'pain');

    controller.update(1.0);
    assert.equal(controller.isPlayingOneShot(), false, 'Pain gesture should complete');
    assert.equal(controller.getCurrentState(), 'walking', 'Pedestrian should resume walking after pain reaction');

    controller.dispose();
  });

  it('Criterion 9: Scene JSON declares CharacterAnimation on Tobi and Moving Pedestrian', () => {
    const sceneJsonPath = path.resolve(rootDir, 'public/scenes/main.iwsdk.scene.json');
    const sceneContent = fs.readFileSync(sceneJsonPath, 'utf-8');
    const scene = JSON.parse(sceneContent);

    const tobiNode = scene.nodes.find((n: any) => n.id === 'npc-tobi');
    assert.ok(tobiNode, 'Scene must include npc-tobi node');
    assert.ok(tobiNode.components.CharacterAnimation, 'npc-tobi must declare CharacterAnimation component');
    assert.equal(tobiNode.components.CharacterAnimation.characterId, 'npc_tobi');

    const pedNode = scene.nodes.find((n: any) => n.id === 'moving-pedestrian-urban');
    assert.ok(pedNode, 'Scene must include moving-pedestrian-urban node');
    assert.ok(pedNode.components.CharacterAnimation, 'moving-pedestrian-urban must declare CharacterAnimation component');
  });

  it('Criterion 10: Existing Tobi character model, pedestrian walk cycle, and PBR materials remain intact', () => {
    const tobi = buildNpcTobi();
    assert.equal(tobi.name, 'NpcTobiAdeleke');
    assert.ok(tobi.getObjectByName('Tobi_Chest'), 'Tobi_Chest must be preserved');
    assert.ok(tobi.getObjectByName('Tobi_Head'), 'Tobi_Head must be preserved');
    assert.ok(tobi.getObjectByName('Tobi_RightArm'), 'Tobi_RightArm must be preserved');

    const ped = buildMovingPedestrian();
    assert.equal(ped.name, 'MovingPedestrian');
    assert.ok(ped.getObjectByName('WalkLeftLeg'), 'WalkLeftLeg must be preserved');
    assert.ok(ped.getObjectByName('WalkRightLeg'), 'WalkRightLeg must be preserved');
  });
});
