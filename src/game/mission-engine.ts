/**
 * Advenquo: Deterministic Mission Engine
 *
 * Executes missions authoritatively with deterministic rule verification,
 * adaptive scaffolding, contextual hints, and anti-tamper reward allocation.
 * AI never independently awards achievements or fabricates completion.
 */

import { storage } from './storage.js';
import { MISSIONS } from './missions-data.js';
import type {
  ActiveMissionState,
  DialogueChoice,
  MissionDefinition,
  MissionStep,
  MissionReward,
  PassportStamp,
  LearnedVocabulary,
  JournalDiscovery,
} from './types.js';

export interface ChoiceEvaluationResult {
  stepId: string;
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  canAdvance: boolean;
  attemptsCount: number;
  hintAvailable: boolean;
  hintText?: string;
}

export interface MissionCompletionResult {
  missionId: string;
  success: boolean;
  rewards: MissionReward;
  unlockedStamp?: PassportStamp;
  addedVocabulary?: LearnedVocabulary[];
  addedJournal?: JournalDiscovery;
  xpEarned: number;
  newGuardianLevel: number;
  leveledUp: boolean;
}

export class MissionEngine {
  private missionsMap: Map<string, MissionDefinition>;

  constructor() {
    this.missionsMap = new Map();
    for (const mission of MISSIONS) {
      this.missionsMap.set(mission.id, mission);
    }
  }

  public getMission(missionId: string): MissionDefinition | undefined {
    return this.missionsMap.get(missionId);
  }

  public registerMission(mission: MissionDefinition): void {
    this.missionsMap.set(mission.id, mission);
    if (!MISSIONS.some((m) => m.id === mission.id)) {
      MISSIONS.push(mission);
    }
  }

  public getAllMissions(): MissionDefinition[] {
    return MISSIONS;
  }

  public getMissionsByDistrict(districtId: string): MissionDefinition[] {
    return MISSIONS.filter((m) => m.districtId === districtId);
  }

  public getActiveMissionState(): ActiveMissionState | null {
    return storage.getState().activeMission;
  }

  public startMission(missionId: string): { success: boolean; mission?: MissionDefinition; state?: ActiveMissionState; error?: string } {
    const mission = this.getMission(missionId);
    if (!mission) {
      return { success: false, error: `Mission ${missionId} not found.` };
    }

    const activeState: ActiveMissionState = {
      missionId,
      currentStepIndex: 0,
      completedStepIds: [],
      attemptsPerStep: {},
      hintsRequested: {},
      isCompleted: false,
      startedAt: new Date().toISOString(),
    };

    storage.setActiveMission(activeState);
    return { success: true, mission, state: activeState };
  }

  public getCurrentStep(missionId: string): MissionStep | null {
    const mission = this.getMission(missionId);
    const activeState = this.getActiveMissionState();
    if (!mission || !activeState || activeState.missionId !== missionId) {
      return null;
    }
    return mission.steps[activeState.currentStepIndex] || null;
  }

  public requestHint(missionId: string, stepId: string): { hint: string; adaptiveHelp?: string } | null {
    const mission = this.getMission(missionId);
    const activeState = this.getActiveMissionState();
    if (!mission || !activeState || activeState.missionId !== missionId) return null;

    const step = mission.steps.find((s) => s.id === stepId);
    if (!step) return null;

    activeState.hintsRequested[stepId] = true;
    storage.setActiveMission(activeState);

    return {
      hint: step.hint,
      adaptiveHelp: step.adaptiveHelp,
    };
  }

  public submitChoice(missionId: string, stepId: string, choiceId: string): ChoiceEvaluationResult | null {
    const mission = this.getMission(missionId);
    const activeState = this.getActiveMissionState();
    if (!mission || !activeState || activeState.missionId !== missionId) return null;

    const step = mission.steps[activeState.currentStepIndex];
    if (!step || step.id !== stepId) return null;

    const choice: DialogueChoice | undefined = step.dialogueChoices?.find((c) => c.id === choiceId);
    if (!choice) return null;

    const currentAttempts = (activeState.attemptsPerStep[stepId] || 0) + 1;
    activeState.attemptsPerStep[stepId] = currentAttempts;

    const isCorrect = choice.isCorrect ?? false;

    if (isCorrect && !activeState.completedStepIds.includes(stepId)) {
      activeState.completedStepIds.push(stepId);
    }

    storage.setActiveMission(activeState);

    return {
      stepId,
      isCorrect,
      feedback: choice.feedback,
      explanation: choice.explanation,
      canAdvance: isCorrect,
      attemptsCount: currentAttempts,
      hintAvailable: !isCorrect,
      hintText: !isCorrect && currentAttempts >= 2 ? step.adaptiveHelp || step.hint : undefined,
    };
  }

  public advanceToNextStep(missionId: string): { hasNextStep: boolean; nextStepIndex: number; isCompleted: boolean } {
    const mission = this.getMission(missionId);
    const activeState = this.getActiveMissionState();
    if (!mission || !activeState || activeState.missionId !== missionId) {
      return { hasNextStep: false, nextStepIndex: -1, isCompleted: false };
    }

    const nextIndex = activeState.currentStepIndex + 1;
    if (nextIndex < mission.steps.length) {
      activeState.currentStepIndex = nextIndex;
      storage.setActiveMission(activeState);
      return { hasNextStep: true, nextStepIndex: nextIndex, isCompleted: false };
    } else {
      activeState.isCompleted = true;
      storage.setActiveMission(activeState);
      return { hasNextStep: false, nextStepIndex: nextIndex, isCompleted: true };
    }
  }

  public completeMission(missionId: string): MissionCompletionResult | null {
    const mission = this.getMission(missionId);
    const activeState = this.getActiveMissionState();
    if (!mission || !activeState || activeState.missionId !== missionId) return null;

    // Verify all steps were truly completed
    const allStepsDone = mission.steps.every((s) => activeState.completedStepIds.includes(s.id));
    if (!allStepsDone) {
      return null;
    }

    const now = new Date().toISOString();

    // Prepare stamp
    let unlockedStamp: PassportStamp | undefined;
    if (mission.rewards.passportStamp) {
      unlockedStamp = {
        ...mission.rewards.passportStamp,
        unlockedAt: now,
      };
    }

    // Prepare vocabulary
    let addedVocab: LearnedVocabulary[] | undefined;
    if (mission.rewards.vocabulary) {
      addedVocab = mission.rewards.vocabulary.map((v) => ({
        ...v,
        masteryScore: 50,
        learnedAt: now,
      }));
    }

    // Prepare journal
    let addedJournal: JournalDiscovery | undefined;
    if (mission.rewards.journalDiscovery) {
      addedJournal = {
        ...mission.rewards.journalDiscovery,
        discoveredAt: now,
      };
    }

    // Record idempotent completion
    storage.recordMissionCompletion(missionId, unlockedStamp, addedVocab, addedJournal);

    // Apply skill advancements
    if (mission.rewards.skillsAdvancement) {
      storage.advanceSkills(mission.rewards.skillsAdvancement);
    }

    // Award XP and check level progression
    const xpOutcome = storage.addXp(mission.rewards.xp);

    return {
      missionId,
      success: true,
      rewards: mission.rewards,
      unlockedStamp,
      addedVocabulary: addedVocab,
      addedJournal,
      xpEarned: mission.rewards.xp,
      newGuardianLevel: xpOutcome.guardianLevel,
      leveledUp: xpOutcome.leveledUp,
    };
  }
}

export const missionEngine = new MissionEngine();
