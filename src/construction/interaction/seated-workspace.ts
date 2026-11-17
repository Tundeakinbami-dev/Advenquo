/**
 * Advenquo: Construction World — Seated Interaction Workspace
 *
 * Implements ergonomic seated reach optimization for Meta Quest 3:
 * - Positioned directly in front of the seated player (0.35m - 0.75m radius).
 * - Adjustable virtual table height (raise/lower by +/- 0.35m).
 * - Adjustable table depth (closer/further by +/- 0.25m).
 * - Virtual turntable rotation: allows the seated player to rotate the construction
 *   turntable around the vertical axis to reach all 4 sides without physical body twisting.
 * - Recalibration of seated anchor without artificial camera movement (protects vestibular comfort).
 */

import type { SeatedWorkspaceConfig } from '../core/construction-types.js';

export class SeatedWorkspace {
  private config: SeatedWorkspaceConfig;

  constructor(initialConfig?: Partial<SeatedWorkspaceConfig>) {
    this.config = {
      tableHeightOffset: -0.35, // 0.35m below eye level
      tableDepthOffset: -0.55,  // 0.55m in front of chest
      turntableAngleRad: 0,
      comfortableRadiusMin: 0.35,
      comfortableRadiusMax: 0.75,
      playerSeatedAnchor: [0, 1.2, 0], // Default seated eye height
      ...initialConfig,
    };
  }

  public getConfig(): SeatedWorkspaceConfig {
    return { ...this.config };
  }

  /**
   * Recalibrate workspace center to current headset eye position.
   * Does NOT alter camera transform, maintaining 100% VR vestibular comfort.
   */
  public recalibrate(headPosition: [number, number, number]): void {
    this.config.playerSeatedAnchor = [...headPosition];
  }

  /**
   * Adjust virtual table height.
   * Clamped to safe seated arm range (-0.65m to -0.15m relative to eyes).
   */
  public adjustHeight(deltaY: number): number {
    const raw = Math.max(
      -0.65,
      Math.min(-0.15, this.config.tableHeightOffset + deltaY)
    );
    this.config.tableHeightOffset = Math.round(raw * 10000) / 10000;
    return this.config.tableHeightOffset;
  }

  /**
   * Adjust virtual table depth.
   * Clamped to comfortable reach range (-0.75m to -0.35m).
   */
  public adjustDepth(deltaZ: number): number {
    const raw = Math.max(
      -0.75,
      Math.min(-0.35, this.config.tableDepthOffset + deltaZ)
    );
    this.config.tableDepthOffset = Math.round(raw * 10000) / 10000;
    return this.config.tableDepthOffset;
  }

  /**
   * Rotate turntable so seated player can access opposite sides of the building.
   */
  public rotateTurntable(deltaRad: number): number {
    this.config.turntableAngleRad += deltaRad;
    while (this.config.turntableAngleRad > Math.PI) {
      this.config.turntableAngleRad -= Math.PI * 2;
    }
    while (this.config.turntableAngleRad < -Math.PI) {
      this.config.turntableAngleRad += Math.PI * 2;
    }
    return this.config.turntableAngleRad;
  }

  /**
   * Get the world center position of the construction table/turntable.
   */
  public getTableCenter(): [number, number, number] {
    const [ax, ay, az] = this.config.playerSeatedAnchor;
    return [
      ax,
      ay + this.config.tableHeightOffset,
      az + this.config.tableDepthOffset,
    ];
  }

  /**
   * Check if a 3D coordinate falls within comfortable seated reach.
   */
  public isPointWithinReach(point: [number, number, number]): boolean {
    const [ax, ay, az] = this.config.playerSeatedAnchor;
    const [px, py, pz] = point;
    const dx = px - ax;
    const dy = py - (ay + this.config.tableHeightOffset);
    const dz = pz - az;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return (
      dist >= this.config.comfortableRadiusMin &&
      dist <= this.config.comfortableRadiusMax
    );
  }

  public isWithinReach(x: number, y: number, z: number): boolean {
    return this.isPointWithinReach([x, y, z]);
  }

  /**
   * Transforms a local building coordinate through the turntable rotation.
   */
  public applyTurntableTransform(
    localOffset: [number, number, number]
  ): [number, number, number] {
    const [lx, ly, lz] = localOffset;
    const angle = this.config.turntableAngleRad;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rotatedX = lx * cosA - lz * sinA;
    const rotatedZ = lx * sinA + lz * cosA;
    const [tx, ty, tz] = this.getTableCenter();
    return [tx + rotatedX, ty + ly, tz + rotatedZ];
  }
}
