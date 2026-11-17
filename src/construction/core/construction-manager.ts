/**
 * Advenquo: Construction World — Unified Construction Manager
 *
 * Coordinates:
 * - Seated workspace configuration & turntable orientation
 * - Seated two-handed interaction & grab ownership
 * - Assembly graph, snap validation, and placement
 * - Havok rigid-body freeze optimization
 * - Blueprint tracking, structural statics validation, and rewards
 */

import {
  type ConstructionLevelId,
  type ComponentType,
  type PlacedComponentRecord,
  type StructuralAssessmentResult,
  type SeatedWorkspaceConfig,
} from './construction-types.js';
import {
  createInitialConstructionState,
  type ConstructionSessionState,
} from './construction-state.js';
import { ConstructionEventBus } from './construction-events.js';

export class ConstructionManager {
  private static instance: ConstructionManager;
  private state: ConstructionSessionState;
  private eventBus: ConstructionEventBus;

  private constructor() {
    this.state = createInitialConstructionState();
    this.eventBus = ConstructionEventBus.getInstance();
  }

  public static getInstance(): ConstructionManager {
    if (!ConstructionManager.instance) {
      ConstructionManager.instance = new ConstructionManager();
    }
    return ConstructionManager.instance;
  }

  public getState(): ConstructionSessionState {
    return this.state;
  }

  public getEventBus(): ConstructionEventBus {
    return this.eventBus;
  }

  /**
   * Recalibrate the seated interaction anchor around current player position.
   * Does NOT artificially move camera, preserving vestibular safety.
   */
  public recalibrateSeatedWorkspace(eyePosition: [number, number, number]): void {
    this.state.seatedWorkspace.playerSeatedAnchor = [...eyePosition];
    this.state.isCalibrated = true;
    this.eventBus.emit('WORKSPACE_RECALIBRATED', {
      newAnchor: [...eyePosition],
    });
  }

  /**
   * Adjust virtual table height offset (range -0.15m to -0.65m relative to eyes)
   */
  public adjustTableHeight(deltaY: number): void {
    const cur = this.state.seatedWorkspace.tableHeightOffset;
    const next = Math.max(-0.65, Math.min(-0.15, cur + deltaY));
    this.state.seatedWorkspace.tableHeightOffset = next;
    this.eventBus.emit('WORKSPACE_TABLE_ADJUSTED', {
      heightOffset: next,
      depthOffset: this.state.seatedWorkspace.tableDepthOffset,
    });
  }

  /**
   * Adjust virtual table depth offset (range -0.35m to -0.75m in front of player)
   */
  public adjustTableDepth(deltaZ: number): void {
    const cur = this.state.seatedWorkspace.tableDepthOffset;
    const next = Math.max(-0.75, Math.min(-0.35, cur + deltaZ));
    this.state.seatedWorkspace.tableDepthOffset = next;
    this.eventBus.emit('WORKSPACE_TABLE_ADJUSTED', {
      heightOffset: this.state.seatedWorkspace.tableHeightOffset,
      depthOffset: next,
    });
  }

  /**
   * Rotate virtual turntable so player can reach all sides while remaining seated
   */
  public rotateTurntable(deltaRad: number): void {
    let next = this.state.seatedWorkspace.turntableAngleRad + deltaRad;
    while (next > Math.PI) next -= Math.PI * 2;
    while (next < -Math.PI) next += Math.PI * 2;
    this.state.seatedWorkspace.turntableAngleRad = next;
    this.eventBus.emit('TURNTABLE_ROTATED', {
      angleRad: next,
    });
  }

  /**
   * Check if a world point is within comfortable seated reach without stretching
   */
  public isWithinComfortableReach(point: [number, number, number]): boolean {
    const [ax, ay, az] = this.state.seatedWorkspace.playerSeatedAnchor;
    const [px, py, pz] = point;
    // Calculate distance on horizontal plane & vertical delta
    const dx = px - ax;
    const dy = py - (ay + this.state.seatedWorkspace.tableHeightOffset);
    const dz = pz - az;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return (
      dist >= this.state.seatedWorkspace.comfortableRadiusMin &&
      dist <= this.state.seatedWorkspace.comfortableRadiusMax
    );
  }

  public recordPlacedComponent(record: PlacedComponentRecord): void {
    this.state.placedComponents.set(record.instanceId, record);
    this.state.placedCount = this.state.placedComponents.size;
    this.state.canUndo = true;
    this.eventBus.emit('COMPONENT_PLACED', { record });
  }

  public removePlacedComponent(instanceId: string): PlacedComponentRecord | undefined {
    const rec = this.state.placedComponents.get(instanceId);
    if (rec) {
      this.state.placedComponents.delete(instanceId);
      this.state.placedCount = this.state.placedComponents.size;
      this.state.canUndo = this.state.placedComponents.size > 0;
      this.eventBus.emit('COMPONENT_DISASSEMBLED', {
        instanceId,
        componentType: rec.componentType,
      });
    }
    return rec;
  }

  public setAssessmentResult(result: StructuralAssessmentResult): void {
    this.state.lastAssessmentResult = result;
    this.eventBus.emit('STRUCTURAL_VALIDATION_COMPLETED', { result });
  }

  public resetSession(): void {
    this.state.placedComponents.clear();
    this.state.placedCount = 0;
    this.state.currentStageIndex = 0;
    this.state.lastAssessmentResult = null;
    this.state.canUndo = false;
  }
}
