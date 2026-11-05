/**
 * Advenquo: Persistent Game Storage & State Manager
 *
 * Implements schema-versioned client storage with automatic in-memory fallback
 * when LocalStorage is disabled or unavailable. Provides safe mutations,
 * anti-tampering validation for rewards, and mission resumption.
 */

import type {
  GameSaveState,
  PlayerProfile,
  SkillMastery,
  CulturePassport,
  ActiveMissionState,
  AdventureProgress,
  ExplorationMode,
} from './types.js';

const STORAGE_KEY = 'advenquo_save_state_v1';
const CURRENT_VERSION = 1;

export function createDefaultProfile(): PlayerProfile {
  return {
    id: `player_${Date.now().toString(36)}`,
    name: 'Cultural Explorer',
    avatar: '🧭',
    interests: ['arts', 'language', 'geography', 'innovation'],
    challengeLevel: 'apprentice',
    totalXp: 0,
    guardianLevel: 1,
    clarityTokens: 5,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
  };
}

export function createDefaultSkills(): SkillMastery {
  return {
    languageComprehension: 15,
    culturalInterpretation: 15,
    geographicReasoning: 15,
    evidenceEvaluation: 15,
    navigationPlanning: 15,
  };
}

export function createDefaultPassport(): CulturePassport {
  return {
    stamps: [],
    vocabulary: [],
    journal: [],
    completedMissionIds: [],
  };
}

export function createInitialState(): GameSaveState {
  return {
    version: CURRENT_VERSION,
    profile: createDefaultProfile(),
    skills: createDefaultSkills(),
    passport: createDefaultPassport(),
    activeMission: null,
    adventureProgress: null,
    explorationMode: 'free_exploration',
    selectedDestinationId: 'nigeria',
    selectedDistrictId: 'isale_eko',
    activeSpatialEncounterId: null,
  };
}

export class GameStorage {
  private memoryCache: GameSaveState;
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorage();
    this.memoryCache = this.load() ?? createInitialState();
  }

  private checkLocalStorage(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__advenquo_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getState(): GameSaveState {
    return this.memoryCache;
  }

  public save(state: GameSaveState): void {
    state.profile.lastPlayedAt = new Date().toISOString();
    this.memoryCache = state;

    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn('Failed to serialize game state to localStorage:', err);
      }
    }
  }

  public load(): GameSaveState | null {
    if (!this.isLocalStorageAvailable) {
      return this.memoryCache || null;
    }

    try {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (!serialized) return null;
      const parsed = JSON.parse(serialized) as GameSaveState;
      if (parsed && parsed.version === CURRENT_VERSION) {
        this.memoryCache = parsed;
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('Failed to parse game state from localStorage:', err);
      return null;
    }
  }

  public reset(): GameSaveState {
    const fresh = createInitialState();
    this.save(fresh);
    return fresh;
  }

  public updateProfile(updates: Partial<PlayerProfile>): PlayerProfile {
    const state = this.getState();
    state.profile = { ...state.profile, ...updates };
    this.save(state);
    return state.profile;
  }

  public addXp(amount: number): { totalXp: number; guardianLevel: number; leveledUp: boolean } {
    const state = this.getState();
    const oldLevel = state.profile.guardianLevel;
    state.profile.totalXp += Math.max(0, amount);
    // Linear-step progression curve: Level = 1 + floor(XP / 250)
    state.profile.guardianLevel = 1 + Math.floor(state.profile.totalXp / 250);
    const leveledUp = state.profile.guardianLevel > oldLevel;
    this.save(state);
    return {
      totalXp: state.profile.totalXp,
      guardianLevel: state.profile.guardianLevel,
      leveledUp,
    };
  }

  public advanceSkills(advancements: Partial<Record<keyof SkillMastery, number>>): SkillMastery {
    const state = this.getState();
    for (const [skill, boost] of Object.entries(advancements) as [keyof SkillMastery, number][]) {
      if (typeof boost === 'number') {
        const current = state.skills[skill] ?? 0;
        state.skills[skill] = Math.min(100, Math.max(0, current + boost));
      }
    }
    this.save(state);
    return state.skills;
  }

  public isMissionCompleted(missionId: string): boolean {
    return this.getState().passport.completedMissionIds.includes(missionId);
  }

  public recordMissionCompletion(
    missionId: string,
    stamp?: GameSaveState['passport']['stamps'][0],
    vocabulary?: GameSaveState['passport']['vocabulary'],
    journal?: GameSaveState['passport']['journal'][0],
  ): boolean {
    const state = this.getState();
    if (state.passport.completedMissionIds.includes(missionId)) {
      // Idempotent: already completed, avoid duplicate reward injection
      return false;
    }

    state.passport.completedMissionIds.push(missionId);

    if (stamp) {
      const exists = state.passport.stamps.some((s) => s.id === stamp.id);
      if (!exists) state.passport.stamps.push(stamp);
    }

    if (vocabulary && vocabulary.length > 0) {
      for (const vocab of vocabulary) {
        const existingIdx = state.passport.vocabulary.findIndex((v) => v.term === vocab.term);
        if (existingIdx >= 0) {
          state.passport.vocabulary[existingIdx].masteryScore = Math.min(
            100,
            state.passport.vocabulary[existingIdx].masteryScore + 25,
          );
        } else {
          state.passport.vocabulary.push(vocab);
        }
      }
    }

    if (journal) {
      const exists = state.passport.journal.some((j) => j.id === journal.id);
      if (!exists) state.passport.journal.unshift(journal);
    }

    state.activeMission = null;
    this.save(state);
    return true;
  }

  public setActiveMission(missionState: ActiveMissionState | null): void {
    const state = this.getState();
    state.activeMission = missionState;
    this.save(state);
  }

  public setAdventureProgress(progress: AdventureProgress | null): void {
    const state = this.getState();
    state.adventureProgress = progress;
    this.save(state);
  }

  public setExplorationMode(mode: ExplorationMode): void {
    const state = this.getState();
    state.explorationMode = mode;
    this.save(state);
  }

  public setSelectedLocation(destinationId: string, districtId: string): void {
    const state = this.getState();
    state.selectedDestinationId = destinationId;
    state.selectedDistrictId = districtId;
    state.selectedLocationId = districtId;
    this.save(state);
  }

  public recordDiscovery(locationId: string, category: string): void {
    const state = this.getState();
    const stampId = `stamp_${locationId}`;
    const exists = state.passport.stamps.some((s) => s.id === stampId);
    if (!exists) {
      state.passport.stamps.push({
        id: stampId,
        name: locationId.replace(/_/g, ' ').toUpperCase(),
        category: 'geography',
        destinationId: 'nigeria',
        districtId: locationId,
        icon: '📍',
        unlockedAt: new Date().toISOString(),
        description: `Discovered and explored ${locationId}`,
      });
      this.addXp(50);
      this.save(state);
    }
  }

  public setActiveSpatialEncounter(encounterId: string | null): void {
    const state = this.getState();
    state.activeSpatialEncounterId = encounterId;
    this.save(state);
  }
}

export const storage = new GameStorage();
