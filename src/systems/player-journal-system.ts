/**
 * Advenquo — PlayerJournalSystem.
 *
 * Implements a personal life and adventure journal for the player:
 * - Records encounters with real human characters & tracks relationship growth
 * - Documents ongoing multi-chapter personal stories without compulsory quest arrows
 * - Catalogs authentic cultural, linguistic, and architectural insights discovered naturally
 * - Displays active commitments, promises, and neighborhood notes
 * - Supports free-form open-world exploration where players can pause and resume stories
 */

import { characterMemorySystem, CharacterMemorySystem } from './character-memory-system.js';
import { characterSimulationSystem, CharacterSimulationSystem } from './character-simulation-system.js';
import { storyEngine, StoryEngine } from './story-engine.js';
import { storage } from '../game/storage.js';

export interface JournalCharacterSummary {
  characterId: string;
  name: string;
  occupation: string;
  relationshipStage: string;
  relationshipScore: number;
  lastLocation: string;
  activeStoryTitle?: string;
  pendingPromise?: string;
}

export interface CulturalDiscoveryEntry {
  id: string;
  topic: 'architecture' | 'food_culture' | 'language' | 'social_customs' | 'geography';
  title: string;
  description: string;
  culturalSignificance: string;
  unlockedAt: string;
}

export class PlayerJournalSystem {
  private static instance: PlayerJournalSystem | null = null;
  private culturalDiscoveries: CulturalDiscoveryEntry[] = [];
  private memSys: CharacterMemorySystem;
  private simSys: CharacterSimulationSystem;
  private storySys: StoryEngine;

  public static getInstance(): PlayerJournalSystem {
    if (!PlayerJournalSystem.instance) {
      PlayerJournalSystem.instance = new PlayerJournalSystem();
    }
    return PlayerJournalSystem.instance;
  }

  constructor() {
    this.memSys = characterMemorySystem;
    this.simSys = characterSimulationSystem;
    this.storySys = storyEngine;
    this.loadDiscoveriesFromStorage();
  }

  private getStorageKey(): string {
    return 'advenquo_player_journal_discoveries';
  }

  private loadDiscoveriesFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const data = window.localStorage.getItem(this.getStorageKey());
      if (data) {
        this.culturalDiscoveries = JSON.parse(data) as CulturalDiscoveryEntry[];
      }
    } catch (e) {
      console.warn('Failed to load journal discoveries from storage:', e);
    }
  }

  public saveDiscoveriesToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.getStorageKey(), JSON.stringify(this.culturalDiscoveries));
    } catch (e) {
      console.warn('Failed to save journal discoveries to storage:', e);
    }
  }

  public recordCulturalDiscovery(
    id: string,
    topic: 'architecture' | 'food_culture' | 'language' | 'social_customs' | 'geography',
    title: string,
    description: string,
    culturalSignificance: string,
  ): boolean {
    const exists = this.culturalDiscoveries.some((d) => d.id === id);
    if (!exists) {
      this.culturalDiscoveries.unshift({
        id,
        topic,
        title,
        description,
        culturalSignificance,
        unlockedAt: new Date().toISOString(),
      });
      storage.recordDiscovery(`journal_${id}`, 'artifact');
      this.saveDiscoveriesToStorage();
      return true;
    }
    return false;
  }

  public getKnownCharacters(): JournalCharacterSummary[] {
    const chars = this.simSys.getAllCharacters();
    return chars.map((c) => {
      const mem = this.memSys.getOrCreateMemory(c.id);
      const arc = this.storySys.getStoryArc(c.id);
      const currentCh = this.storySys.getCurrentChapter(c.id);
      const pendingPromise = mem.promises.find((p) => !p.fulfilled);

      return {
        characterId: c.id,
        name: c.name,
        occupation: c.occupation,
        relationshipStage: mem.relationshipStage,
        relationshipScore: mem.relationshipScore,
        lastLocation: mem.lastInteractionLocation || c.workLocationId,
        activeStoryTitle: currentCh ? currentCh.title : undefined,
        pendingPromise: pendingPromise ? pendingPromise.description : undefined,
      };
    });
  }

  public getCulturalDiscoveries(): CulturalDiscoveryEntry[] {
    return this.culturalDiscoveries;
  }

  public getActiveStorySummaries(): Array<{
    characterName: string;
    chapterNumber: number;
    chapterTitle: string;
    synopsis: string;
    currentMilestones: string[];
    isComplete: boolean;
  }> {
    const summaries: any[] = [];
    for (const char of this.simSys.getAllCharacters()) {
      const arc = this.storySys.getStoryArc(char.id);
      if (arc) {
        const currentCh = this.storySys.getCurrentChapter(char.id);
        summaries.push({
          characterName: char.name,
          chapterNumber: arc.currentChapterNumber,
          chapterTitle: currentCh ? currentCh.title : 'Story Concluded',
          synopsis: currentCh ? currentCh.synopsis : 'The story has reached its resolution.',
          currentMilestones: currentCh
            ? currentCh.milestones.map((m) => `${m.title} [${m.completed ? 'DONE' : 'PENDING'}]`)
            : [],
          isComplete: arc.isComplete,
        });
      }
    }
    return summaries;
  }
}

export const playerJournalSystem = PlayerJournalSystem.getInstance();
