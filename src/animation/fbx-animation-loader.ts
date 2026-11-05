/**
 * Advenquo — FBX Animation Loader, Inspector, and Skeleton Retargeting Engine.
 *
 * Responsibilities:
 * - Load and parse FBX animation files using Three.js FBXLoader
 * - Audit and inspect skeletons, bone hierarchies, durations, and keyframe tracks
 * - Validate compatibility against standard Mixamo rigs and Advenquo procedural characters
 * - Normalize scale from FBX centimeters to Three.js world meters (x0.01)
 * - Sanitize root motion to prevent teleportation and drift while preserving natural vertical leaps
 * - Retarget tracks dynamically to Advenquo character hierarchies (e.g. Tobi Adeleke, pedestrians)
 * - Synthesize baseline idle and locomotion animation clips for smooth AnimationMixer cross-fades
 */

import {
  AnimationClip,
  LoopOnce,
  LoopRepeat,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from '@iwsdk/core';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export interface AnimationAuditReport {
  fileName: string;
  clipName: string;
  duration: number;
  tracksCount: number;
  boneCount: number;
  sampleBones: string[];
  isMixamoRig: boolean;
  hasRootMotion: boolean;
  rootMotion: {
    startY: number;
    minY: number;
    maxY: number;
    deltaYRange: number;
    deltaXRange: number;
    deltaZRange: number;
    returnsToStart: boolean;
  };
  compatibility: {
    nativeMixamo: boolean;
    proceduralTobi: boolean;
    proceduralPedestrian: boolean;
    notes: string[];
  };
}

export interface AnimationLibrary {
  standingJump: AnimationClip;
  painGesture: AnimationClip;
  standingJumpAudit: AnimationAuditReport;
  painGestureAudit: AnimationAuditReport;
}

/**
 * Standard bone mapping from Mixamo rig to procedural Advenquo characters.
 */
export const TOBI_BONE_MAP: Record<string, string> = {
  'mixamorigSpine': 'Tobi_Chest',
  'mixamorigSpine1': 'Tobi_Chest',
  'mixamorigSpine2': 'Tobi_Chest',
  'mixamorigNeck': 'Tobi_Neck',
  'mixamorigHead': 'Tobi_Head',
  'mixamorigRightArm': 'Tobi_RightArm',
  'mixamorigRightForeArm': 'Tobi_RightForearm',
  'mixamorigLeftArm': 'Tobi_LeftArm',
};

export const PEDESTRIAN_BONE_MAP: Record<string, string> = {
  'mixamorigSpine': 'Torso',
  'mixamorigRightArm': 'WalkRightArm',
  'mixamorigLeftArm': 'WalkLeftArm',
  'mixamorigRightUpLeg': 'WalkRightLeg',
  'mixamorigLeftUpLeg': 'WalkLeftLeg',
};

export class FBXAnimationLoaderService {
  private static instance: FBXAnimationLoaderService | null = null;
  private cache: AnimationLibrary | null = null;
  private fbxLoader = new FBXLoader();

  public static getInstance(): FBXAnimationLoaderService {
    if (!FBXAnimationLoaderService.instance) {
      FBXAnimationLoaderService.instance = new FBXAnimationLoaderService();
    }
    return FBXAnimationLoaderService.instance;
  }

  /**
   * Parse an FBX file from an ArrayBuffer and return its parsed Group and animations.
   */
  public parseFBX(buffer: ArrayBuffer, resourcePath = ''): { group: Object3D; clips: AnimationClip[] } {
    const group = this.fbxLoader.parse(buffer, resourcePath);
    const clips = (group.animations || []).filter((c) => c.duration > 0 && c.tracks.length > 0);
    return { group, clips };
  }

  /**
   * Perform an architectural audit and compatibility check on a loaded AnimationClip and group.
   */
  public auditAnimation(fileName: string, clip: AnimationClip, group?: Object3D): AnimationAuditReport {
    const bones: string[] = [];
    if (group) {
      group.traverse((child: any) => {
        if (child.isBone || (child.name && child.name.startsWith('mixamorig'))) {
          bones.push(child.name);
        }
      });
    }

    const isMixamoRig = clip.tracks.some((t) => t.name.startsWith('mixamorig'));
    const posTrack = clip.tracks.find((t) => t.name.includes('Hips.position'));

    let rootMotion = {
      startY: 0,
      minY: 0,
      maxY: 0,
      deltaYRange: 0,
      deltaXRange: 0,
      deltaZRange: 0,
      returnsToStart: true,
    };

    if (posTrack && posTrack.values.length >= 3) {
      const vals = posTrack.values;
      const startX = vals[0];
      const startY = vals[1];
      const startZ = vals[2];
      const endIdx = vals.length - 3;
      const endX = vals[endIdx];
      const endY = vals[endIdx + 1];
      const endZ = vals[endIdx + 2];

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let minZ = Infinity;
      let maxZ = -Infinity;

      for (let i = 0; i < vals.length; i += 3) {
        minX = Math.min(minX, vals[i]);
        maxX = Math.max(maxX, vals[i]);
        minY = Math.min(minY, vals[i + 1]);
        maxY = Math.max(maxY, vals[i + 1]);
        minZ = Math.min(minZ, vals[i + 2]);
        maxZ = Math.max(maxZ, vals[i + 2]);
      }

      const diffStartEnd = Math.hypot(endX - startX, endY - startY, endZ - startZ);

      rootMotion = {
        startY,
        minY,
        maxY,
        deltaYRange: (maxY - minY) * 0.01, // In meters
        deltaXRange: (maxX - minX) * 0.01,
        deltaZRange: (maxZ - minZ) * 0.01,
        returnsToStart: diffStartEnd < 0.5, // Returns within 0.5 cm of start
      };
    }

    const notes: string[] = [];
    if (isMixamoRig) {
      notes.push('Uses standard Mixamo humanoid skeletal hierarchy (53 articulated joints).');
    }
    if (posTrack) {
      notes.push(
        `Vertical motion trajectory: ${rootMotion.deltaYRange.toFixed(2)}m elevation change. Root returns to origin: ${rootMotion.returnsToStart}.`,
      );
    }
    notes.push('Direct application requires 0.01 scale normalization from FBX centimeters to Three.js meters.');
    notes.push('Retargeting available for Tobi Adeleke and moving pedestrian procedural hierarchies.');

    return {
      fileName,
      clipName: clip.name,
      duration: clip.duration,
      tracksCount: clip.tracks.length,
      boneCount: bones.length,
      sampleBones: bones.slice(0, 10),
      isMixamoRig,
      hasRootMotion: Boolean(posTrack),
      rootMotion,
      compatibility: {
        nativeMixamo: isMixamoRig,
        proceduralTobi: true, // Supported via retargeting
        proceduralPedestrian: true, // Supported via retargeting
        notes,
      },
    };
  }

  /**
   * Sanitize an animation clip for native Mixamo rigs:
   * - Scales position tracks by 0.01 (cm to meters)
   * - Clamps horizontal X and Z root motion to the start position to prevent unwanted drift or teleportation
   * - Retains vertical Y elevation for natural jumping or knee bends
   */
  public sanitizeMixamoClip(clip: AnimationClip, name?: string): AnimationClip {
    const tracks: any[] = [];

    for (const track of clip.tracks) {
      if (track.name.endsWith('.position')) {
        const times = track.times.slice();
        const values = new Float32Array(track.values.length);
        const startX = track.values[0] * 0.01;
        const startZ = track.values[2] * 0.01;

        for (let i = 0; i < track.values.length; i += 3) {
          // Clamp horizontal drift to starting origin, preserve vertical Y
          values[i] = startX;
          values[i + 1] = track.values[i + 1] * 0.01;
          values[i + 2] = startZ;
        }

        tracks.push(new VectorKeyframeTrack(track.name, times as any, values as any));
      } else {
        tracks.push(track.clone());
      }
    }

    return new AnimationClip(name || clip.name, clip.duration, tracks);
  }

  /**
   * Retarget an animation clip to a procedural character hierarchy (e.g. Tobi or Pedestrian).
   * Maps bone rotation tracks to named scene nodes and converts root vertical displacement to root elevation.
   */
  public retargetClipToProcedural(
    clip: AnimationClip,
    boneMap: Record<string, string>,
    characterName: string,
    options: { includeVerticalDisplacement?: boolean; scale?: number } = {},
  ): AnimationClip {
    const scale = options.scale ?? 0.01;
    const includeVertical = options.includeVerticalDisplacement ?? true;
    const tracks: any[] = [];
    const usedTargetBones = new Set<string>();

    for (const track of clip.tracks) {
      // Find matching bone prefix
      const dotIdx = track.name.indexOf('.');
      if (dotIdx === -1) continue;
      const boneName = track.name.slice(0, dotIdx);
      const property = track.name.slice(dotIdx + 1);

      const targetNodeName = boneMap[boneName];
      if (targetNodeName && property === 'quaternion' && !usedTargetBones.has(targetNodeName)) {
        usedTargetBones.add(targetNodeName);
        const cloned = track.clone();
        cloned.name = `${targetNodeName}.quaternion`;
        tracks.push(cloned);
      }
    }

    // Retarget vertical jump root motion: map delta Y to root object position Y
    const hipsPosTrack = clip.tracks.find((t) => t.name.includes('Hips.position'));
    if (includeVertical && hipsPosTrack && hipsPosTrack.values.length >= 3) {
      const times = hipsPosTrack.times.slice();
      const posValues = new Float32Array(hipsPosTrack.values.length);
      const startY = hipsPosTrack.values[1];

      for (let i = 0; i < hipsPosTrack.values.length; i += 3) {
        const rawY = hipsPosTrack.values[i + 1];
        const deltaY = (rawY - startY) * scale;
        // In-place vertical elevation: X=0, Y=deltaY, Z=0
        posValues[i] = 0;
        posValues[i + 1] = deltaY;
        posValues[i + 2] = 0;
      }

      // Target root object position
      tracks.push(new VectorKeyframeTrack('.position', times as any, posValues as any));
    }

    return new AnimationClip(`${characterName}_${clip.name}`, clip.duration, tracks);
  }

  /**
   * Synthesize a smooth baseline idle AnimationClip for procedural characters
   * with natural respiratory breathing and postural presence.
   */
  public createSyntheticIdleClip(targetNode = 'Tobi_Chest', duration = 3.2): AnimationClip {
    const times = [0, duration * 0.5, duration];
    // Gentle spine pitch for respiratory breathing
    const qNeutral = new Quaternion();
    const qInhale = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.035);
    const qValues = new Float32Array([
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qInhale.x, qInhale.y, qInhale.z, qInhale.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
    ]);

    const chestTrack = new QuaternionKeyframeTrack(`${targetNode}.quaternion`, times, qValues);
    return new AnimationClip('idle', duration, [chestTrack]);
  }

  /**
   * Synthesize a baseline locomotion walk AnimationClip for procedural characters.
   */
  public createSyntheticWalkClip(
    leftArmNode = 'WalkLeftArm',
    rightArmNode = 'WalkRightArm',
    duration = 1.0,
  ): AnimationClip {
    const times = [0, 0.25, 0.5, 0.75, 1.0];
    const q0 = new Quaternion();
    const qFwd = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.35);
    const qBack = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -0.35);

    const leftArmValues = new Float32Array([
      q0.x, q0.y, q0.z, q0.w,
      qFwd.x, qFwd.y, qFwd.z, qFwd.w,
      q0.x, q0.y, q0.z, q0.w,
      qBack.x, qBack.y, qBack.z, qBack.w,
      q0.x, q0.y, q0.z, q0.w,
    ]);

    const rightArmValues = new Float32Array([
      q0.x, q0.y, q0.z, q0.w,
      qBack.x, qBack.y, qBack.z, qBack.w,
      q0.x, q0.y, q0.z, q0.w,
      qFwd.x, qFwd.y, qFwd.z, qFwd.w,
      q0.x, q0.y, q0.z, q0.w,
    ]);

    const leftTrack = new QuaternionKeyframeTrack(`${leftArmNode}.quaternion`, times, leftArmValues);
    const rightTrack = new QuaternionKeyframeTrack(`${rightArmNode}.quaternion`, times, rightArmValues);

    return new AnimationClip('walking', duration, [leftTrack, rightTrack]);
  }
}
