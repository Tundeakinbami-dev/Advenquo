/**
 * Advenquo — PlayerController.
 *
 * Coordinates player locomotion, viewpoint rotation, collision clamp,
 * running speed modifiers, and teleportation across Desktop, Mobile, and WebXR.
 */

import { PlayerControllerSystem } from '../player-controller-system.js';

export class PlayerController {
  private static instance: PlayerController | null = null;

  public static getInstance(): PlayerController {
    if (!PlayerController.instance) {
      PlayerController.instance = new PlayerController();
    }
    return PlayerController.instance;
  }

  private getSys(): PlayerControllerSystem | null {
    return PlayerControllerSystem.getInstance();
  }

  public teleportTo(x: number, z: number, yaw = 0): void {
    const sys = this.getSys();
    if (sys) {
      sys.teleportTo(x, z, yaw);
    }
  }

  public setBoundaryLimits(minX: number, maxX: number, minZ: number, maxZ: number): void {
    const sys = this.getSys();
    if (sys) {
      sys.setBoundaryLimits(minX, maxX, minZ, maxZ);
    }
  }

  public getDistanceToTarget(): number {
    const sys = this.getSys();
    return sys ? sys.getDistanceToTarget() : 0;
  }

  public getBearingToTarget(): number {
    const sys = this.getSys();
    return sys ? sys.getBearingToTarget() : 0;
  }
}

export const playerController = PlayerController.getInstance();
