/**
 * Advenquo — Locomotion & Comfort Supervisor System.
 *
 * Enforces Meta Quest comfort standards, safe navigation boundaries,
 * and seated/standing play ergonomics.
 *
 * Core capabilities:
 * - Initializes LocomotionSystem with comfortable presets (Snap Turn 45°, Vignette 0.5)
 * - Safe boundary enforcement (prevents falls or wall clipping outside the courtyard)
 * - Seated/standing viewpoint compensation for comfortable interaction reach
 * - Recovery reset to safe origin [0, 0, 0]
 */

import {
  createSystem,
  LocomotionSystem,
  TurningMethod,
  Vector3,
  VisibilityState,
} from '@iwsdk/core';

export class LocomotionComfortSystem extends createSystem({}) {
  private static instance: LocomotionComfortSystem | null = null;
  private headPos = new Vector3();
  private safeOrigin = new Vector3(0, 0, 0);
  private boundaryHalfWidth = 7.5; // Courtyard is 16m × 16m (half-width 8m minus 0.5m curb cushion)
  private minZ = -7.0; // In front of back compound wall
  private maxZ = 7.0;
  private hasInitialSpawnOccurred = false;

  public static getInstance(): LocomotionComfortSystem | null {
    return LocomotionComfortSystem.instance;
  }

  init(): void {
    LocomotionComfortSystem.instance = this;
    const locomotion = this.world.getSystem(LocomotionSystem);
    if (locomotion) {
      // Default to Quest comfort best practices: Snap Turn, Vignette, moderate sliding speed
      locomotion.config.turningMethod.value = TurningMethod.SnapTurn;
      locomotion.config.turningAngle.value = 45;
      locomotion.config.slidingSpeed.value = 2.4;
      locomotion.config.comfortAssist.value = 0.5;
      locomotion.config.enableJumping.value = false;
    }

    // Subscribe to XR visibility transitions
    this.cleanupFuncs.push(
      this.world.visibilityState.subscribe((state) => {
        if (state === VisibilityState.Visible) {
          // Only ground player on first launch into immersive XR if initial spawn has not yet occurred.
          // On focus resume (e.g. returning from Meta system menu), PRESERVE player's current world position.
          if (!this.hasInitialSpawnOccurred) {
            this.hasInitialSpawnOccurred = true;
            if (
              locomotion &&
              (!this.player || (this.player.position.x === 0 && this.player.position.z === 0))
            ) {
              locomotion.setPlayerPosition(this.safeOrigin);
            }
          }
        } else if (state === VisibilityState.VisibleBlurred) {
          // When Meta system menu is opened or focus is lost, do not reset position.
          // Locomotion remains safely paused while system overlay is active.
        }
      }),
      () => {
        LocomotionComfortSystem.instance = null;
      },
    );
  }

  public setBoundaryLimits(minX: number, maxX: number, minZ: number, maxZ: number): void {
    this.boundaryHalfWidth = Math.max(Math.abs(minX), Math.abs(maxX));
    this.minZ = minZ;
    this.maxZ = maxZ;
  }

  public resetSpawnFlag(): void {
    this.hasInitialSpawnOccurred = false;
  }

  public hasSpawned(): boolean {
    return this.hasInitialSpawnOccurred;
  }

  update(delta: number): void {
    // Check player boundary coordinates
    if (this.player) {
      const px = this.player.position.x;
      const pz = this.player.position.z;

      // If player wanders beyond courtyard boundary, clamp and gently reset
      if (
        Math.abs(px) > this.boundaryHalfWidth ||
        pz < this.minZ ||
        pz > this.maxZ
      ) {
        const clampedX = Math.max(-this.boundaryHalfWidth, Math.min(this.boundaryHalfWidth, px));
        const clampedZ = Math.max(this.minZ, Math.min(this.maxZ, pz));
        this.player.position.set(clampedX, this.player.position.y, clampedZ);

        const locomotion = this.world.getSystem(LocomotionSystem);
        if (locomotion) {
          locomotion.setPlayerPosition(new Vector3(clampedX, this.player.position.y, clampedZ));
        }
      }
    }
  }
}
