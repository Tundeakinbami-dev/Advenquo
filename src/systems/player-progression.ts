/**
 * Advenquo — PlayerProgression System.
 *
 * Coordinates player level, XP accumulation, skill proficiencies,
 * passport stamps, and cultural vocabulary acquisition.
 */

import { storage } from '../game/storage.js';
import type { PassportStamp, LearnedVocabulary, JournalDiscovery, SkillMastery } from '../game/types.js';

export class PlayerProgression {
  private static instance: PlayerProgression | null = null;

  public static getInstance(): PlayerProgression {
    if (!PlayerProgression.instance) {
      PlayerProgression.instance = new PlayerProgression();
    }
    return PlayerProgression.instance;
  }

  public getPlayerProfile() {
    return storage.getState().profile;
  }

  public getLevel(): number {
    return storage.getState().profile.guardianLevel;
  }

  public getXP(): number {
    return storage.getState().profile.totalXp;
  }

  public addXP(amount: number): { newLevel: number; leveledUp: boolean } {
    const res = storage.addXp(amount);
    return {
      newLevel: res.guardianLevel,
      leveledUp: res.leveledUp,
    };
  }

  public advanceSkill(
    skillName: keyof SkillMastery,
    amount: number,
  ): void {
    storage.advanceSkills({ [skillName]: amount });
  }

  public awardStamp(stamp: PassportStamp): boolean {
    const state = storage.getState();
    const exists = state.passport.stamps.some((s) => s.id === stamp.id);
    if (!exists) {
      state.passport.stamps.push(stamp);
      storage.save(state);
      return true;
    }
    return false;
  }

  public recordVocabulary(word: Omit<LearnedVocabulary, 'learnedAt' | 'masteryScore'>): boolean {
    const state = storage.getState();
    const existing = state.passport.vocabulary.find((v) => v.term === word.term);
    if (existing) {
      existing.masteryScore = Math.min(100, existing.masteryScore + 25);
      storage.save(state);
      return false;
    }

    state.passport.vocabulary.push({
      ...word,
      masteryScore: 50,
      learnedAt: new Date().toISOString(),
    });
    storage.save(state);
    return true;
  }

  public recordJournalEntry(entry: JournalDiscovery): boolean {
    const state = storage.getState();
    const exists = state.passport.journal.some((j) => j.id === entry.id);
    if (!exists) {
      state.passport.journal.unshift(entry);
      storage.save(state);
      return true;
    }
    return false;
  }

  public getStamps(): PassportStamp[] {
    return storage.getState().passport.stamps;
  }

  public getVocabulary(): LearnedVocabulary[] {
    return storage.getState().passport.vocabulary;
  }

  public getJournalEntries(): JournalDiscovery[] {
    return storage.getState().passport.journal;
  }
}

export const playerProgression = PlayerProgression.getInstance();
