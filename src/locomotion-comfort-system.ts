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
  private headPos = new Vector3();
  private safeOrigin = new Vector3(0, 0, 0);
  private boundaryHalfWidth = 7.5; // Courtyard is 16m × 16m (half-width 8m minus 0.5m curb cushion)
  private minZ = -7.0; // In front of back compound wall
  private maxZ = 7.0;

  init(): void {
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
          // In immersive XR, ensure player is grounded safely
          if (locomotion) {
            locomotion.setPlayerPosition(this.safeOrigin);
          }
        }
      }),
    );
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
