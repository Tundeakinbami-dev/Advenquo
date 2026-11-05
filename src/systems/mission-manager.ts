/**
 * Advenquo — MissionManager.
 *
 * Coordinates Free Exploration mode vs Adventure Mission mode:
 * - Free Exploration: Untracked open-world movement, discovering artifacts,
 *   talking with locals, entering accessible buildings without timer or objective constraints.
 * - Adventure Missions: Objectives with spatial waypoints, clues, inventory items,
 *   step evaluations, and completion rewards.
 * - Guarantees that the world remains explorable after any mission finishes.
 */

import { missionEngine } from '../game/mission-engine.js';
import { MISSIONS } from '../game/missions-data.js';
import type { MissionDefinition, ActiveMissionState } from '../game/types.js';
import type { ExplorationMode } from './types.js';

export class MissionManager {
  private static instance: MissionManager | null = null;
  private currentMode: ExplorationMode = 'free_exploration';
  private activeMission: MissionDefinition | null = null;
  private onModeChangedCallbacks: Array<(mode: ExplorationMode) => void> = [];

  public static getInstance(): MissionManager {
    if (!MissionManager.instance) {
      MissionManager.instance = new MissionManager();
    }
    return MissionManager.instance;
  }

  public getExplorationMode(): ExplorationMode {
    return this.currentMode;
  }

  public setExplorationMode(mode: ExplorationMode): void {
    this.currentMode = mode;
    for (const cb of this.onModeChangedCallbacks) {
      cb(mode);
    }
  }

  public startMission(missionId: string): { success: boolean; mission?: MissionDefinition; error?: string } {
    const outcome = missionEngine.startMission(missionId);
    if (!outcome.success || !outcome.mission) {
      return { success: false, error: outcome.error || 'Failed to start mission' };
    }

    this.activeMission = outcome.mission;
    this.setExplorationMode('adventure_mission');
    return { success: true, mission: outcome.mission };
  }

  public completeCurrentMission(): { success: boolean; completed: boolean } {
    if (!this.activeMission) return { success: false, completed: false };

    const outcome = missionEngine.completeMission(this.activeMission.id);
    this.activeMission = null;

    // Return to free exploration mode so world remains explorable!
    this.setExplorationMode('free_exploration');
    return { success: true, completed: Boolean(outcome && outcome.success) };
  }

  public abortCurrentMission(): void {
    this.activeMission = null;
    this.setExplorationMode('free_exploration');
  }

  public getActiveMission(): MissionDefinition | null {
    return this.activeMission;
  }

  public getActiveMissionState(): ActiveMissionState | null {
    return missionEngine.getActiveMissionState();
  }

  public getAllMissions(): MissionDefinition[] {
    return MISSIONS;
  }

  public onModeChange(callback: (mode: ExplorationMode) => void): () => void {
    this.onModeChangedCallbacks.push(callback);
    return () => {
      const idx = this.onModeChangedCallbacks.indexOf(callback);
      if (idx !== -1) this.onModeChangedCallbacks.splice(idx, 1);
    };
  }
}

export const missionManager = MissionManager.getInstance();
