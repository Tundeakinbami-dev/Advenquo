/**
 * Advenquo — CinematicCameraSystem.
 *
 * Implements professional game camera direction & cinematography:
 * - Smooth First-Person Exploration: Natural acceleration damping, subtle head-bob
 *   walking sway (vertical + lateral harmonic), and dynamic field of view
 * - Cinematic Conversation Framing: Automatically frames NPCs during dialogue with
 *   filmic 3/4 medium close-ups, over-the-shoulder offsets, and eye-level alignment
 * - Landmark Establishing Cuts: Smooth establishing sweeps when discovering major
 *   story assets (e.g. Defective Cracked Pillar, Studio Maquette, Palace Dais)
 * - Seamless return to free-look exploration upon dialogue termination
 *
 * Frame-rate friendly: zero per-frame garbage collection.
 */

import {
  createSystem,
  PerspectiveCamera,
  Vector3,
} from '@iwsdk/core';

export type CameraMode = 'exploration' | 'conversation' | 'establishing_shot';

export class CinematicCameraSystem extends createSystem({}) {
  private static instance: CinematicCameraSystem | null = null;
  private mode: CameraMode = 'exploration';

  // Scratch vectors
  private currentCamPos = new Vector3();
  private targetCamPos = new Vector3();
  private currentLookTarget = new Vector3();
  private targetLookTarget = new Vector3();
  private scratchVec = new Vector3();
  private savedExplorationCameraPosition = new Vector3();
  private hasSavedExplorationPose = false;
  private restoringExplorationPose = false;

  // Head bob state
  private bobElapsed = 0;
  private isMoving = false;
  private bobIntensity = 1.0;

  // Active dialogue target
  private dialogueTargetPos = new Vector3();
  private dialogueTargetName = '';
  private transitionAlpha = 1.0; // 0 = start, 1 = complete

  public static getInstance(): CinematicCameraSystem | null {
    return CinematicCameraSystem.instance;
  }

  init(): void {
    CinematicCameraSystem.instance = this;
  }

  public setMoving(moving: boolean): void {
    this.isMoving = moving;
  }

  public getMode(): CameraMode {
    return this.mode;
  }

  /**
   * Triggers cinematic framing for dialogue with an NPC
   */
  public enterConversationFraming(
    npcWorldPos: Vector3,
    npcName: string,
    npcHeight = 1.68,
  ): void {
    const camera = this.world.camera;
    if (camera instanceof PerspectiveCamera) {
      // Camera transforms are local to the persistent player rig. Save that
      // local pose so closing dialogue can return to first-person correctly.
      this.savedExplorationCameraPosition.copy(camera.position);
      this.hasSavedExplorationPose = true;
      camera.updateWorldMatrix(true, false);
      camera.getWorldPosition(this.currentCamPos);
      camera.getWorldDirection(this.scratchVec);
      this.currentLookTarget.copy(this.currentCamPos).addScaledVector(this.scratchVec, 4);
    }
    this.restoringExplorationPose = false;
    this.mode = 'conversation';
    this.dialogueTargetName = npcName;
    this.dialogueTargetPos.copy(npcWorldPos);

    // Look at NPC's eye line (around height - 0.12m)
    this.targetLookTarget.set(
      npcWorldPos.x,
      npcWorldPos.y + npcHeight - 0.12,
      npcWorldPos.z,
    );

    // Position camera ~1.65m away, offset laterally by 0.45m for a cinematic 3/4 framing
    this.targetCamPos.set(
      npcWorldPos.x + 0.45,
      npcWorldPos.y + npcHeight - 0.15,
      npcWorldPos.z + 1.65,
    );
    if (camera?.parent) {
      camera.parent.updateWorldMatrix(true, false);
      camera.parent.worldToLocal(this.targetCamPos);
    }

    this.transitionAlpha = 0.0;
  }

  /**
   * Exits conversation mode and smoothly restores player camera
   */
  public exitConversationFraming(): void {
    this.mode = 'exploration';
    this.transitionAlpha = 0.0;
    this.restoringExplorationPose = this.hasSavedExplorationPose;
  }

  /**
   * Triggers a dramatic landmark reveal (e.g. the cracked structural column)
   */
  public triggerLandmarkEstablishingShot(
    targetWorldPos: Vector3,
    cameraOffset: Vector3 = new Vector3(1.2, 0.4, 2.0),
  ): void {
    this.mode = 'establishing_shot';
    this.targetLookTarget.copy(targetWorldPos);
    this.targetCamPos.copy(targetWorldPos).add(cameraOffset);
    this.transitionAlpha = 0.0;
  }

  update(delta: number): void {
    const camera = this.world.camera;
    if (!(camera instanceof PerspectiveCamera)) return;

    if (this.mode === 'conversation' || this.mode === 'establishing_shot') {
      // Smooth cinematic interpolation (damped slerp-like transition)
      this.transitionAlpha = Math.min(1.0, this.transitionAlpha + delta * 3.2);
      const t = this.transitionAlpha;
      const smoothT = t * t * (3 - 2 * t); // Smoothstep

      camera.position.lerp(this.targetCamPos, smoothT * 0.15);
      this.currentLookTarget.lerp(this.targetLookTarget, smoothT * 0.2);
      camera.lookAt(this.currentLookTarget);
    } else if (this.restoringExplorationPose) {
      this.transitionAlpha = Math.min(1.0, this.transitionAlpha + delta * 3.2);
      if (this.transitionAlpha >= 1.0) {
        camera.position.copy(this.savedExplorationCameraPosition);
        this.restoringExplorationPose = false;
        this.hasSavedExplorationPose = false;
      } else {
        camera.position.lerp(this.savedExplorationCameraPosition, Math.min(1, delta * 8));
      }
    } else {
      // Exploration Mode: Add natural walking head-bob
      if (this.isMoving) {
        this.bobElapsed += delta * 9.5; // ~2 steps per second
        const verticalBob = Math.sin(this.bobElapsed) * 0.025 * this.bobIntensity;
        const lateralBob = Math.cos(this.bobElapsed * 0.5) * 0.012 * this.bobIntensity;

        camera.position.y += verticalBob * 0.1;
        camera.position.x += lateralBob * 0.1;
      } else {
        this.bobElapsed = 0;
      }
    }
  }
}
