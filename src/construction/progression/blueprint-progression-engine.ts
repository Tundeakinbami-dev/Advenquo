/**
 * Advenquo: Blueprint-Guided Construction & Automatic Progression Engine
 *
 * Single authoritative coordinator for:
 * - Authoritative Building Design (dimensions, coordinates, orientations, sequence)
 * - Sequential Construction Tasks (Task 1 Foundation -> Floor -> Walls -> Openings -> Roof -> Finishing)
 * - Target status tracking (pending, required, placed_valid, placed_needs_adjustment, invalid)
 * - Placement validation with clear human feedback (material, position, rotation, connectivity)
 * - Automatic task progression without manual "Next" buttons upon full task validation
 * - Automatic level completion, persistence, and unlocking of next difficulty levels
 * - Bidirectional synchronization with 2D floor plans, 3D building workspace, and ghost guides
 */

import { Quaternion, Vector3 } from '@iwsdk/core';
import type { ComponentType, ConstructionLevelId, PlacedComponentRecord } from '../core/construction-types.js';
import type { AuthoritativeBuildingDesign, DesignComponent } from '../blueprints/building-design.js';
import type { BlueprintDefinition } from '../blueprints/blueprint-types.js';
import { TWO_BEDROOM_BUNGALOW_DESIGN } from '../blueprints/two-bedroom-bungalow-design.js';
import { BUNGALOW_BLUEPRINT } from '../blueprints/bungalow.js';
import { getBlueprintById, BLUEPRINT_LIBRARY } from '../blueprints/blueprint-catalog.js';
import { ConstructionProgressPersistence, type BuilderProgressData } from '../persistence/construction-progress.js';
import { LevelManager } from './level-manager.js';
import { challengeManager } from './challenge-manager.js';

export type TargetPlacementStatus =
  | 'pending'
  | 'required'
  | 'placed_valid'
  | 'placed_needs_adjustment'
  | 'invalid';

export interface SinglePlacementValidationResult {
  isValid: boolean;
  status: TargetPlacementStatus;
  targetMatched?: DesignComponent;
  feedback: string;
  code:
    | 'SUCCESS'
    | 'WRONG_MATERIAL'
    | 'POSITION_OFF'
    | 'ROTATION_OFF'
    | 'WRONG_TASK'
    | 'CONNECTION_MISSING';
}

export interface TaskProgressSummary {
  currentLevelId: ConstructionLevelId;
  currentLevelName: string;
  currentTaskIndex: number;
  totalTasks: number;
  currentTaskTitle: string;
  currentTaskInstruction: string;
  currentTaskCriticalCheck: string;
  requiredInTask: number;
  placedInTask: number;
  remainingInTask: number;
  overallLevelCompletionPercent: number;
  isTaskCompleted: boolean;
  isLevelCompleted: boolean;
  activeTargetId: string | null;
}

export type ProgressionListener = (summary: TaskProgressSummary) => void;

export class BlueprintProgressionEngine {
  private static instance: BlueprintProgressionEngine | null = null;

  private currentLevelId: ConstructionLevelId = 'bungalow';
  private currentDesign: AuthoritativeBuildingDesign = TWO_BEDROOM_BUNGALOW_DESIGN;
  private currentBlueprint: BlueprintDefinition = BUNGALOW_BLUEPRINT;

  private currentTaskIndex = 1;
  private activeTargetId: string | null = null;
  private isTaskAdvancing = false;
  private isLevelCompleted = false;
  private advanceTimer: any = null;

  // Track target placement states: targetId -> status
  private targetStatuses: Map<string, TargetPlacementStatus> = new Map();
  // Bound placed instance IDs: targetId -> instanceId
  private boundInstances: Map<string, string> = new Map();
  // Reverse lookup: instanceId -> targetId
  private instanceToTarget: Map<string, string> = new Map();

  private levelManager: LevelManager = new LevelManager();
  private listeners: Set<ProgressionListener> = new Set();

  public static getInstance(): BlueprintProgressionEngine {
    if (!BlueprintProgressionEngine.instance) {
      BlueprintProgressionEngine.instance = new BlueprintProgressionEngine();
    }
    return BlueprintProgressionEngine.instance;
  }

  constructor() {
    this._loadPersistedProgress();
    this.currentLevelId = 'bungalow';
    this.currentDesign = TWO_BEDROOM_BUNGALOW_DESIGN;
    this.currentBlueprint = BUNGALOW_BLUEPRINT;
    for (const comp of this.currentDesign.components) {
      this.targetStatuses.set(comp.id, 'pending');
    }
    this._updateActiveTarget();
  }

  // =========================================================================
  // Level Initialization & Configuration
  // =========================================================================

  public initLevel(levelId: ConstructionLevelId): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
    this.currentLevelId = levelId;
    this.currentTaskIndex = 1;
    this.isTaskAdvancing = false;
    this.isLevelCompleted = false;
    this.targetStatuses.clear();
    this.boundInstances.clear();
    this.instanceToTarget.clear();

    if (levelId === 'bungalow' || levelId === 'small_house') {
      this.currentDesign = TWO_BEDROOM_BUNGALOW_DESIGN;
      this.currentBlueprint = BUNGALOW_BLUEPRINT;
    } else {
      const bp = getBlueprintById(levelId);
      this.currentBlueprint = bp;
      // Synthesize AuthoritativeBuildingDesign wrapper if loading other catalog levels
      this.currentDesign = this._synthesizeDesignFromBlueprint(bp);
    }

    // Initialize all targets as pending
    for (const comp of this.currentDesign.components) {
      this.targetStatuses.set(comp.id, 'pending');
    }

    // Activate the first target in Task 1
    this._updateActiveTarget();

    // Sync with ChallengeManager & LevelManager
    challengeManager.setActiveChallenge(this.currentBlueprint.id);
    challengeManager.setStage(this.currentTaskIndex);

    this._notifyListeners();
  }

  public resetCurrentLevel(): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
    this.currentTaskIndex = 1;
    this.isTaskAdvancing = false;
    this.isLevelCompleted = false;
    this.targetStatuses.clear();
    this.boundInstances.clear();
    this.instanceToTarget.clear();
    for (const comp of this.currentDesign.components) {
      this.targetStatuses.set(comp.id, 'pending');
    }
    this._updateActiveTarget();
    this._notifyListeners();
  }

  public getDesign(): AuthoritativeBuildingDesign {
    return this.currentDesign;
  }

  public getBlueprint(): BlueprintDefinition {
    return this.currentBlueprint;
  }

  public getCurrentLevelId(): ConstructionLevelId {
    return this.currentLevelId;
  }

  public getCurrentTaskIndex(): number {
    return this.currentTaskIndex;
  }

  public getActiveTargetId(): string | null {
    return this.activeTargetId;
  }

  public getActiveTarget(): DesignComponent | null {
    if (!this.activeTargetId) return null;
    return this.currentDesign.components.find((c) => c.id === this.activeTargetId) || null;
  }

  public getTargetStatus(targetId: string): TargetPlacementStatus {
    return this.targetStatuses.get(targetId) || 'pending';
  }

  public getAllTargetStatuses(): Map<string, TargetPlacementStatus> {
    return new Map(this.targetStatuses);
  }

  public setActiveTarget(targetId: string | null): void {
    if (targetId && this.currentDesign.components.some((c) => c.id === targetId)) {
      this.activeTargetId = targetId;
      this._notifyListeners();
    }
  }

  // =========================================================================
  // Task Target Scoping
  // =========================================================================

  public getTargetsForTask(taskIndex: number = this.currentTaskIndex): DesignComponent[] {
    return this.currentDesign.components.filter((c) => c.stageIndex === taskIndex);
  }

  public getNextRequiredTarget(): DesignComponent | null {
    const taskTargets = this.getTargetsForTask(this.currentTaskIndex);
    return taskTargets.find((t) => this.targetStatuses.get(t.id) !== 'placed_valid') || null;
  }

  public getNextTargetForComponent(componentType: ComponentType): DesignComponent | null {
    const taskTargets = this.getTargetsForTask(this.currentTaskIndex);
    return (
      taskTargets.find(
        (t) => t.componentType === componentType && this.targetStatuses.get(t.id) !== 'placed_valid',
      ) || null
    );
  }

  // =========================================================================
  // Validation with Educational & Actionable Feedback
  // =========================================================================

  public validatePlacement(
    componentType: ComponentType,
    position: Vector3 | [number, number, number],
    rotation: Quaternion | [number, number, number, number] = new Quaternion(),
  ): SinglePlacementValidationResult {
    const posVec = position instanceof Vector3 ? position : new Vector3(...position);
    const rotQuat = rotation instanceof Quaternion ? rotation : new Quaternion(...rotation);

    const taskTargets = this.getTargetsForTask(this.currentTaskIndex);

    // 1. Check if component type belongs to the current task
    const typeMatchingTargets = taskTargets.filter((t) => t.componentType === componentType);
    if (typeMatchingTargets.length === 0) {
      // Check if it belongs to a future task
      const futureMatch = this.currentDesign.components.find((c) => c.componentType === componentType);
      if (futureMatch) {
        return {
          isValid: false,
          status: 'invalid',
          code: 'WRONG_TASK',
          feedback: `Sequence error: Complete Task ${this.currentTaskIndex} before placing ${componentType.replace(/_/g, ' ')}.`,
        };
      }
      return {
        isValid: false,
        status: 'invalid',
        code: 'WRONG_MATERIAL',
        feedback: `This is the wrong material. Current task requires ${taskTargets[0]?.componentType.replace(/_/g, ' ') || 'different material'}.`,
      };
    }

    // 2. Find closest target in current task matching this type
    let bestTarget: DesignComponent | null = null;
    let minDistance = Infinity;

    for (const target of typeMatchingTargets) {
      // Prioritize unplaced targets
      const isPlaced = this.targetStatuses.get(target.id) === 'placed_valid';
      const targetPos = new Vector3(...target.position);
      const dist = posVec.distanceTo(targetPos);

      if (!isPlaced && dist < minDistance) {
        minDistance = dist;
        bestTarget = target;
      }
    }

    // If all are placed, check closest target overall for repositioning
    if (!bestTarget) {
      for (const target of typeMatchingTargets) {
        const targetPos = new Vector3(...target.position);
        const dist = posVec.distanceTo(targetPos);
        if (dist < minDistance) {
          minDistance = dist;
          bestTarget = target;
        }
      }
    }

    if (!bestTarget) {
      return {
        isValid: false,
        status: 'invalid',
        code: 'WRONG_MATERIAL',
        feedback: 'No matching target found in the current construction task.',
      };
    }

    // 3. Position tolerance check
    const posTol = bestTarget.positionToleranceM ?? 0.25;
    if (minDistance > posTol) {
      const distFormatted = minDistance.toFixed(2);
      return {
        isValid: false,
        status: 'placed_needs_adjustment',
        targetMatched: bestTarget,
        code: 'POSITION_OFF',
        feedback: `Move this block closer to the highlighted position (currently ${distFormatted}m away, tolerance is ${posTol}m).`,
      };
    }

    // 4. Orientation tolerance check
    const targetQuat = new Quaternion(...bestTarget.rotation);
    const angleRad = rotQuat.angleTo(targetQuat);
    const rotTolDeg = bestTarget.rotationToleranceDeg ?? 30;
    const rotTolRad = (rotTolDeg * Math.PI) / 180;

    if (angleRad > rotTolRad) {
      const angleDeg = Math.round((angleRad * 180) / Math.PI);
      return {
        isValid: false,
        status: 'placed_needs_adjustment',
        targetMatched: bestTarget,
        code: 'ROTATION_OFF',
        feedback: `Rotate the component (press R) to align with the blueprint (current angle difference: ${angleDeg}°).`,
      };
    }

    // 5. Structural connectivity check (tasks > 1 must connect/ground)
    if (this.currentTaskIndex > 1 && bestTarget.criticalLoadBearing) {
      // Must not be floating unsupported in mid-air
      if (posVec.y > 0.3 && !this._hasSupportingComponentBelow(bestTarget)) {
        return {
          isValid: false,
          status: 'invalid',
          targetMatched: bestTarget,
          code: 'CONNECTION_MISSING',
          feedback: 'This component must connect to the foundation or supporting walls first.',
        };
      }
    }

    // 6. Placement Valid!
    return {
      isValid: true,
      status: 'placed_valid',
      targetMatched: bestTarget,
      code: 'SUCCESS',
      feedback: `Correct placement! ${bestTarget.description || bestTarget.id} is accurately positioned and bonded.`,
    };
  }

  // =========================================================================
  // Placement Registration & Automatic Progression
  // =========================================================================

  public onComponentPlaced(record: {
    instanceId: string;
    componentType: ComponentType;
    position: Vector3 | [number, number, number];
    rotation?: Quaternion | [number, number, number, number];
  }): SinglePlacementValidationResult {
    const valResult = this.validatePlacement(
      record.componentType,
      record.position,
      record.rotation,
    );

    if (valResult.isValid && valResult.targetMatched) {
      const targetId = valResult.targetMatched.id;
      this.targetStatuses.set(targetId, 'placed_valid');
      this.boundInstances.set(targetId, record.instanceId);
      this.instanceToTarget.set(record.instanceId, targetId);

      this._checkTaskCompletion();
    } else if (valResult.targetMatched) {
      this.targetStatuses.set(valResult.targetMatched.id, valResult.status);
    }

    this._updateActiveTarget();
    this._notifyListeners();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('advenquo-placement-validated', {
          detail: {
            ...valResult,
            instanceId: record.instanceId,
            componentType: record.componentType,
          },
        }),
      );
    }

    return valResult;
  }

  public onComponentRemoved(instanceId: string): void {
    const targetId = this.instanceToTarget.get(instanceId);
    if (targetId) {
      this.instanceToTarget.delete(instanceId);
      this.boundInstances.delete(targetId);
      this.targetStatuses.set(targetId, 'pending');
      this._updateActiveTarget();
      this._notifyListeners();
    }
  }

  private _checkTaskCompletion(): void {
    if (this.isTaskAdvancing || this.isLevelCompleted) return;

    const currentTaskTargets = this.getTargetsForTask(this.currentTaskIndex);
    const allPlacedValid =
      currentTaskTargets.length > 0 &&
      currentTaskTargets.every((t) => this.targetStatuses.get(t.id) === 'placed_valid');

    if (allPlacedValid) {
      this.isTaskAdvancing = true;

      // Broadcast task completion event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('advenquo-task-completed', {
            detail: {
              taskIndex: this.currentTaskIndex,
              taskTitle: this._getTaskTitle(this.currentTaskIndex),
            },
          }),
        );
      }

      // Automatic Task Progression: short comfortable transition (750ms)
      this.advanceTimer = setTimeout(() => {
        this.advanceTimer = null;
        this._advanceTaskAutomatically();
      }, 750);
    }
  }

  public advanceTaskImmediately(): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
    this._advanceTaskAutomatically();
  }

  private _advanceTaskAutomatically(): void {
    const totalTasks = this._getTotalTasks();
    if (this.currentTaskIndex < totalTasks) {
      this.currentTaskIndex++;
      this.isTaskAdvancing = false;

      challengeManager.setStage(this.currentTaskIndex);
      this._updateActiveTarget();
      this._notifyListeners();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('advenquo-task-advanced', {
            detail: {
              newTaskIndex: this.currentTaskIndex,
              newTaskTitle: this._getTaskTitle(this.currentTaskIndex),
            },
          }),
        );
      }
    } else {
      // Completed all tasks in this level!
      this._completeLevel();
    }
  }

  private _completeLevel(): void {
    this.isLevelCompleted = true;
    this.isTaskAdvancing = false;

    // Persist completion and unlock next level
    const newlyUnlocked = this.levelManager.getUnlockManager().markLevelCompleted(this.currentLevelId);
    this._persistProgress(newlyUnlocked);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('advenquo-level-completed', {
          detail: {
            levelId: this.currentLevelId,
            newlyUnlocked,
          },
        }),
      );
    }

    this._notifyListeners();
  }

  private _updateActiveTarget(): void {
    const nextTarget = this.getNextRequiredTarget();
    this.activeTargetId = nextTarget ? nextTarget.id : null;
  }

  private _hasSupportingComponentBelow(target: DesignComponent): boolean {
    // Check if any foundation or floor slab is positioned below this target
    const lowerComps = this.currentDesign.components.filter(
      (c) => c.stageIndex < target.stageIndex && this.targetStatuses.get(c.id) === 'placed_valid',
    );
    return lowerComps.length > 0;
  }

  // =========================================================================
  // Summary & Progress Metrics
  // =========================================================================

  public getProgressSummary(): TaskProgressSummary {
    const taskTargets = this.getTargetsForTask(this.currentTaskIndex);
    const placedInTask = taskTargets.filter(
      (t) => this.targetStatuses.get(t.id) === 'placed_valid',
    ).length;
    const requiredInTask = taskTargets.length;
    const remainingInTask = Math.max(0, requiredInTask - placedInTask);

    const totalComps = this.currentDesign.components.length;
    let totalPlacedValid = 0;
    for (const status of this.targetStatuses.values()) {
      if (status === 'placed_valid') totalPlacedValid++;
    }

    const overallLevelCompletionPercent =
      totalComps > 0 ? Math.round((totalPlacedValid / totalComps) * 100) : 100;

    return {
      currentLevelId: this.currentLevelId,
      currentLevelName: this.currentDesign.title,
      currentTaskIndex: this.currentTaskIndex,
      totalTasks: this._getTotalTasks(),
      currentTaskTitle: this._getTaskTitle(this.currentTaskIndex),
      currentTaskInstruction: this._getTaskInstruction(this.currentTaskIndex),
      currentTaskCriticalCheck: this._getTaskCriticalCheck(this.currentTaskIndex),
      requiredInTask,
      placedInTask,
      remainingInTask,
      overallLevelCompletionPercent,
      isTaskCompleted: requiredInTask > 0 && remainingInTask === 0,
      isLevelCompleted: this.isLevelCompleted,
      activeTargetId: this.activeTargetId,
    };
  }

  public subscribe(listener: ProgressionListener): () => void {
    this.listeners.add(listener);
    listener(this.getProgressSummary());
    return () => this.listeners.delete(listener);
  }

  private _notifyListeners(): void {
    const summary = this.getProgressSummary();
    for (const listener of this.listeners) {
      try {
        listener(summary);
      } catch (e) {
        // Safe callback execution
      }
    }
  }

  // =========================================================================
  // Persistence & Difficulty Progression
  // =========================================================================

  private _loadPersistedProgress(): void {
    const saved = ConstructionProgressPersistence.load();
    if (saved && Array.isArray(saved.completedLevels)) {
      for (const levelId of saved.completedLevels) {
        this.levelManager.getUnlockManager().markLevelCompleted(levelId);
      }
    }
  }

  private _persistProgress(newlyUnlocked: ConstructionLevelId[]): void {
    const current = ConstructionProgressPersistence.load() || {
      version: 1,
      totalXp: 0,
      unlockedLevels: ['bungalow', 'sandbox'],
      completedLevels: [],
      stars: {},
      achievements: [],
      lastSaved: Date.now(),
    };

    current.totalXp += 250;
    if (!current.completedLevels.includes(this.currentLevelId)) {
      current.completedLevels.push(this.currentLevelId);
    }
    for (const un of newlyUnlocked) {
      if (!current.unlockedLevels.includes(un)) {
        current.unlockedLevels.push(un);
      }
    }
    current.lastSaved = Date.now();
    ConstructionProgressPersistence.save(current);
  }

  private _getTotalTasks(): number {
    if (this.currentBlueprint.stages && this.currentBlueprint.stages.length > 0) {
      return this.currentBlueprint.stages.length;
    }
    const maxStage = Math.max(...this.currentDesign.components.map((c) => c.stageIndex), 1);
    return maxStage;
  }

  private _getTaskTitle(taskIndex: number): string {
    const stage = this.currentBlueprint.stages?.find((s) => s.stageIndex === taskIndex);
    return stage?.title || `Task ${taskIndex}`;
  }

  private _getTaskInstruction(taskIndex: number): string {
    const stage = this.currentBlueprint.stages?.find((s) => s.stageIndex === taskIndex);
    return stage?.instruction || `Complete all requirements for Task ${taskIndex}.`;
  }

  private _getTaskCriticalCheck(taskIndex: number): string {
    const stage = this.currentBlueprint.stages?.find((s) => s.stageIndex === taskIndex);
    return stage?.criticalCheck || 'Ensure correct positioning and alignment.';
  }

  private _synthesizeDesignFromBlueprint(bp: BlueprintDefinition): AuthoritativeBuildingDesign {
    const comps: DesignComponent[] = bp.targets.map((t, idx) => ({
      id: t.id || t.targetId || `target_${idx + 1}`,
      componentType: t.componentType,
      structuralRole: t.structuralRole || 'compressive_masonry',
      layerId: 'structural_walls',
      stageIndex: t.stageIndex,
      position: t.targetPosition,
      rotation: t.targetRotation,
      dimensions: [0.4, 0.2, 0.2],
      description: t.description || `Target ${idx + 1}`,
      criticalLoadBearing: t.criticalLoadBearing,
      positionToleranceM: t.positionToleranceMeters,
      rotationToleranceDeg: t.rotationToleranceDeg,
    }));

    return {
      id: bp.id,
      title: bp.title,
      subtitle: 'Architectural Construction Challenge',
      description: bp.description,
      overallDimensions: {
        width: bp.foundationDimensions[0],
        height: 3.5,
        depth: bp.foundationDimensions[2],
      },
      foundationOrigin: bp.foundationPosition,
      layers: [],
      rooms: [],
      elevationDatums: [],
      dimensions: [],
      doorOpenings: [],
      windowOpenings: [],
      components: comps,
      totalAreaM2: bp.foundationDimensions[0] * bp.foundationDimensions[2],
    };
  }
}

export const blueprintProgressionEngine = BlueprintProgressionEngine.getInstance();
