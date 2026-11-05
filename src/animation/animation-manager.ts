/**
 * Advenquo — Central Character Animation Manager & Asset Cache.
 *
 * Coordinates loading, auditing, retargeting, and runtime controller binding
 * for Standing Jump and Pain Gesture FBX animations across Advenquo:
 * - Tobi Adeleke (procedural junior architect)
 * - Moving Market Pedestrians (waypoint actors)
 * - Native Mixamo humanoid characters
 *
 * Provides safe in-memory caching to prevent duplicate network fetches or
 * repeated expensive FBX parsing.
 */

import {
  AnimationClip,
  Object3D,
} from '@iwsdk/core';
import {
  FBXAnimationLoaderService,
  PEDESTRIAN_BONE_MAP,
  TOBI_BONE_MAP,
  type AnimationAuditReport,
} from './fbx-animation-loader.js';
import {
  CharacterAnimationController,
  type CharacterAnimationState,
} from './character-animation-controller.js';

export interface PreparedAnimationClips {
  standingJump: AnimationClip;
  painGesture: AnimationClip;
  idle?: AnimationClip;
  walking?: AnimationClip;
  talking?: AnimationClip;
}

export class AnimationManager {
  private static instance: AnimationManager | null = null;
  private loaderService = FBXAnimationLoaderService.getInstance();

  // Cached audit reports
  public jumpAudit: AnimationAuditReport | null = null;
  public painAudit: AnimationAuditReport | null = null;

  // Cached raw and prepared clips
  private rawJumpClip: AnimationClip | null = null;
  private rawPainClip: AnimationClip | null = null;

  private nativeClips: PreparedAnimationClips | null = null;
  private tobiClips: PreparedAnimationClips | null = null;
  private pedestrianClips: PreparedAnimationClips | null = null;

  // Active controllers registry
  private activeControllers = new Map<number | string, CharacterAnimationController>();
  private isLoaded = false;
  private loadPromise: Promise<boolean> | null = null;

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  /**
   * Initialize and load both Standing Jump and Pain Gesture FBX animations.
   * Works in browser (fetch) and Node test environments (fs).
   */
  public async loadAnimations(customUrls?: { jumpUrl?: string; painUrl?: string }): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const baseUrl = (import.meta as any).env?.BASE_URL || '/';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const jumpUrl = customUrls?.jumpUrl || `${cleanBase}assets/animations/standing-jump/standing-jump.fbx`;
        const painUrl = customUrls?.painUrl || `${cleanBase}assets/animations/pain-gesture/pain-gesture.fbx`;

        if (typeof fetch !== 'function') {
          throw new Error('fetch is not defined in this environment; call processAnimationBuffers directly.');
        }

        const [jumpRes, painRes] = await Promise.all([fetch(jumpUrl), fetch(painUrl)]);
        if (!jumpRes.ok || !painRes.ok) {
          throw new Error(`Failed to fetch animation files: jump=${jumpRes.status}, pain=${painRes.status}`);
        }
        const jumpBuffer = await jumpRes.arrayBuffer();
        const painBuffer = await painRes.arrayBuffer();

        this.processAnimationBuffers(jumpBuffer, painBuffer);
        this.isLoaded = true;
        return true;
      } catch (error) {
        console.error('AnimationManager: Failed to load FBX animations:', error);
        return false;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Process parsed FBX ArrayBuffers directly. Useful for synchronous setup or test runners.
   */
  public processAnimationBuffers(jumpBuffer: ArrayBuffer, painBuffer: ArrayBuffer): void {
    const jumpParsed = this.loaderService.parseFBX(jumpBuffer);
    const painParsed = this.loaderService.parseFBX(painBuffer);

    this.rawJumpClip = jumpParsed.clips[0] || null;
    this.rawPainClip = painParsed.clips[0] || null;

    if (!this.rawJumpClip || !this.rawPainClip) {
      throw new Error('AnimationManager: Invalid FBX files, no valid animation clips detected.');
    }

    // 1. Audit reports
    this.jumpAudit = this.loaderService.auditAnimation('Standing Jump.fbx', this.rawJumpClip, jumpParsed.group);
    this.painAudit = this.loaderService.auditAnimation('Pain Gesture.fbx', this.rawPainClip, painParsed.group);

    // 2. Prepare Native Mixamo clips (sanitized root motion in meters)
    this.nativeClips = {
      standingJump: this.loaderService.sanitizeMixamoClip(this.rawJumpClip, 'jump'),
      painGesture: this.loaderService.sanitizeMixamoClip(this.rawPainClip, 'pain'),
    };

    // 3. Prepare Tobi Adeleke Retargeted clips
    const tobiJump = this.loaderService.retargetClipToProcedural(
      this.rawJumpClip,
      TOBI_BONE_MAP,
      'Tobi',
      { includeVerticalDisplacement: true, scale: 0.01 },
    );
    const tobiPain = this.loaderService.retargetClipToProcedural(
      this.rawPainClip,
      TOBI_BONE_MAP,
      'Tobi',
      { includeVerticalDisplacement: false },
    );
    const tobiIdle = this.loaderService.createSyntheticIdleClip('Tobi_Chest', 3.2);

    this.tobiClips = {
      standingJump: tobiJump,
      painGesture: tobiPain,
      idle: tobiIdle,
    };

    // 4. Prepare Moving Pedestrian Retargeted clips
    const pedJump = this.loaderService.retargetClipToProcedural(
      this.rawJumpClip,
      PEDESTRIAN_BONE_MAP,
      'Pedestrian',
      { includeVerticalDisplacement: true, scale: 0.01 },
    );
    const pedPain = this.loaderService.retargetClipToProcedural(
      this.rawPainClip,
      PEDESTRIAN_BONE_MAP,
      'Pedestrian',
      { includeVerticalDisplacement: false },
    );
    const pedWalk = this.loaderService.createSyntheticWalkClip('WalkLeftArm', 'WalkRightArm', 1.0);
    const pedIdle = this.loaderService.createSyntheticIdleClip('Torso', 2.8);

    this.pedestrianClips = {
      standingJump: pedJump,
      painGesture: pedPain,
      walking: pedWalk,
      idle: pedIdle,
    };

    this.isLoaded = true;
  }

  /**
   * Detect character rig type and attach a configured CharacterAnimationController.
   */
  public setupController(
    identifier: number | string,
    root: Object3D,
    forcedRigType: 'auto' | 'native' | 'retargeted' = 'auto',
  ): CharacterAnimationController {
    // Check if controller already cached
    const existing = this.activeControllers.get(identifier);
    if (existing) return existing;

    const controller = new CharacterAnimationController(root);

    // Determine target rig type
    const isTobi = root.name.includes('Tobi') || root.getObjectByName('Tobi_Chest') !== undefined;
    const isPedestrian =
      root.name.includes('Pedestrian') || root.getObjectByName('WalkLeftLeg') !== undefined;
    const isNative =
      forcedRigType === 'native' ||
      (!isTobi && !isPedestrian && root.getObjectByName('mixamorigHips') !== undefined);

    if (isTobi && this.tobiClips) {
      controller.registerClip('jumping', this.tobiClips.standingJump);
      controller.registerClip('pain', this.tobiClips.painGesture);
      if (this.tobiClips.idle) controller.registerClip('idle', this.tobiClips.idle);
      controller.transitionTo('idle');
    } else if (isPedestrian && this.pedestrianClips) {
      controller.registerClip('jumping', this.pedestrianClips.standingJump);
      controller.registerClip('pain', this.pedestrianClips.painGesture);
      if (this.pedestrianClips.walking) controller.registerClip('walking', this.pedestrianClips.walking);
      if (this.pedestrianClips.idle) controller.registerClip('idle', this.pedestrianClips.idle);
      controller.transitionTo('idle');
    } else if (this.nativeClips) {
      controller.registerClip('jumping', this.nativeClips.standingJump);
      controller.registerClip('pain', this.nativeClips.painGesture);
      controller.transitionTo('idle');
    }

    this.activeControllers.set(identifier, controller);
    return controller;
  }

  /**
   * Retrieve active controller by identifier.
   */
  public getController(identifier: number | string): CharacterAnimationController | undefined {
    return this.activeControllers.get(identifier);
  }

  /**
   * Trigger Standing Jump on a registered character.
   */
  public triggerJump(identifier: number | string): boolean {
    const ctrl = this.activeControllers.get(identifier);
    return ctrl ? ctrl.triggerJump() : false;
  }

  /**
   * Trigger Pain Gesture on a registered character.
   */
  public triggerPain(identifier: number | string): boolean {
    const ctrl = this.activeControllers.get(identifier);
    return ctrl ? ctrl.triggerPain() : false;
  }

  /**
   * Set animation state on a registered character.
   */
  public setState(identifier: number | string, state: CharacterAnimationState): boolean {
    const ctrl = this.activeControllers.get(identifier);
    return ctrl ? ctrl.transitionTo(state) : false;
  }

  /**
   * Update all registered controllers. Zero allocation per frame.
   */
  public update(delta: number): void {
    for (const ctrl of this.activeControllers.values()) {
      ctrl.update(delta);
    }
  }

  /**
   * Remove and dispose a controller.
   */
  public removeController(identifier: number | string): void {
    const ctrl = this.activeControllers.get(identifier);
    if (ctrl) {
      ctrl.dispose();
      this.activeControllers.delete(identifier);
    }
  }

  /**
   * Clear all controllers.
   */
  public disposeAll(): void {
    for (const ctrl of this.activeControllers.values()) {
      ctrl.dispose();
    }
    this.activeControllers.clear();
  }
}

export const animationManager = AnimationManager.getInstance();
