/**
 * Advenquo — CharacterMemorySystem.
 *
 * Implements persistent, structured memory for major virtual world characters:
 * - Remembers player's name, moniker, and conversational preferences
 * - Logs interaction history (location, simulated game time, topics discussed)
 * - Tracks commitments and promises made between player and NPC
 * - Maintains dynamic relationship scores (-100 to +100) and friendship stages
 * - Stores structured milestone facts and player decisions
 * - Produces concise context summaries for the conversational AI system
 * - Persists state to storage and restores seamlessly across sessions
 */

import { storage } from '../game/storage.js';

export type RelationshipStage =
  | 'Stranger'
  | 'Acquaintance'
  | 'Professional_Associate'
  | 'Trusted_Friend'
  | 'Confidant';

export interface InteractionLogEntry {
  timestamp: string;
  locationId: string;
  topic: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'concerned' | 'grateful';
}

export interface PromiseCommitment {
  id: string;
  description: string;
  madeAt: string;
  fulfilled: boolean;
  fulfilledAt?: string;
}

export interface CharacterMemoryRecord {
  characterId: string;
  playerName?: string;
  playerMoniker: string; // e.g. "Friend", "Ẹ̀gbọ́n", "Architect"
  relationshipScore: number; // -100 to +100
  relationshipStage: RelationshipStage;
  totalInteractions: number;
  lastInteractionTime?: string;
  lastInteractionLocation?: string;
  interactionHistory: InteractionLogEntry[];
  promises: PromiseCommitment[];
  knownFacts: Record<string, boolean | string | number>;
  keyDecisions: Array<{
    decisionId: string;
    choice: string;
    decidedAt: string;
    impactDescription: string;
  }>;
}

export class CharacterMemorySystem {
  private static instance: CharacterMemorySystem | null = null;
  private memoryCache: Map<string, CharacterMemoryRecord> = new Map();

  public static getInstance(): CharacterMemorySystem {
    if (!CharacterMemorySystem.instance) {
      CharacterMemorySystem.instance = new CharacterMemorySystem();
    }
    return CharacterMemorySystem.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  private getStorageKey(): string {
    return 'advenquo_character_memories';
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const data = window.localStorage.getItem(this.getStorageKey());
      if (data) {
        const parsed = JSON.parse(data) as Record<string, CharacterMemoryRecord>;
        for (const [id, record] of Object.entries(parsed)) {
          this.memoryCache.set(id, record);
        }
      }
    } catch (e) {
      console.warn('Failed to load character memories from storage:', e);
    }
  }

  public saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const obj: Record<string, CharacterMemoryRecord> = {};
      for (const [id, record] of this.memoryCache.entries()) {
        obj[id] = record;
      }
      window.localStorage.setItem(this.getStorageKey(), JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save character memories to storage:', e);
    }
  }

  public getOrCreateMemory(characterId: string, defaultMoniker = 'Friend'): CharacterMemoryRecord {
    let mem = this.memoryCache.get(characterId);
    if (!mem) {
      mem = {
        characterId,
        playerMoniker: defaultMoniker,
        relationshipScore: 0,
        relationshipStage: 'Stranger',
        totalInteractions: 0,
        interactionHistory: [],
        promises: [],
        knownFacts: {},
        keyDecisions: [],
      };
      this.memoryCache.set(characterId, mem);
      this.saveToStorage();
    }
    return mem;
  }

  public recordInteraction(
    characterId: string,
    locationId: string,
    topic: string,
    summary: string,
    sentiment: 'positive' | 'neutral' | 'concerned' | 'grateful' = 'neutral',
    scoreDelta = 5,
  ): void {
    const mem = this.getOrCreateMemory(characterId);
    mem.totalInteractions++;
    mem.lastInteractionTime = new Date().toISOString();
    mem.lastInteractionLocation = locationId;

    mem.interactionHistory.unshift({
      timestamp: mem.lastInteractionTime,
      locationId,
      topic,
      summary,
      sentiment,
    });

    // Keep history bounded to avoid unbounded state
    if (mem.interactionHistory.length > 20) {
      mem.interactionHistory.pop();
    }

    this.modifyRelationshipScore(characterId, scoreDelta);
  }

  public modifyRelationshipScore(characterId: string, delta: number): void {
    const mem = this.getOrCreateMemory(characterId);
    mem.relationshipScore = Math.max(-100, Math.min(100, mem.relationshipScore + delta));

    if (mem.relationshipScore >= 75) {
      mem.relationshipStage = 'Confidant';
    } else if (mem.relationshipScore >= 50) {
      mem.relationshipStage = 'Trusted_Friend';
    } else if (mem.relationshipScore >= 25) {
      mem.relationshipStage = 'Professional_Associate';
    } else if (mem.relationshipScore >= 10) {
      mem.relationshipStage = 'Acquaintance';
    } else {
      mem.relationshipStage = 'Stranger';
    }

    this.saveToStorage();
  }

  public recordPromise(characterId: string, promiseId: string, description: string): void {
    const mem = this.getOrCreateMemory(characterId);
    const existing = mem.promises.find((p) => p.id === promiseId);
    if (!existing) {
      mem.promises.push({
        id: promiseId,
        description,
        madeAt: new Date().toISOString(),
        fulfilled: false,
      });
      this.saveToStorage();
    }
  }

  public fulfillPromise(characterId: string, promiseId: string): boolean {
    const mem = this.getOrCreateMemory(characterId);
    const promise = mem.promises.find((p) => p.id === promiseId);
    if (promise && !promise.fulfilled) {
      promise.fulfilled = true;
      promise.fulfilledAt = new Date().toISOString();
      this.modifyRelationshipScore(characterId, 15);
      return true;
    }
    return false;
  }

  public setKnownFact(characterId: string, factKey: string, value: boolean | string | number): void {
    const mem = this.getOrCreateMemory(characterId);
    mem.knownFacts[factKey] = value;
    this.saveToStorage();
  }

  public getKnownFact<T = boolean | string | number>(characterId: string, factKey: string): T | undefined {
    const mem = this.getOrCreateMemory(characterId);
    return mem.knownFacts[factKey] as T | undefined;
  }

  public recordKeyDecision(
    characterId: string,
    decisionId: string,
    choice: string,
    impactDescription: string,
  ): void {
    const mem = this.getOrCreateMemory(characterId);
    mem.keyDecisions.push({
      decisionId,
      choice,
      decidedAt: new Date().toISOString(),
      impactDescription,
    });
    this.setKnownFact(characterId, `decision_${decisionId}`, choice);
    this.saveToStorage();
  }

  public setPlayerName(characterId: string, name: string): void {
    const mem = this.getOrCreateMemory(characterId);
    mem.playerName = name;
    mem.playerMoniker = name;
    this.saveToStorage();
  }

  public generateContextSummary(characterId: string): string {
    const mem = this.getOrCreateMemory(characterId);
    const lines: string[] = [];

    lines.push(`Relationship: ${mem.relationshipStage} (Score: ${mem.relationshipScore}/100)`);
    lines.push(`Total Interactions: ${mem.totalInteractions}`);

    if (mem.playerName) {
      lines.push(`Player Name: ${mem.playerName}`);
    }

    const pendingPromises = mem.promises.filter((p) => !p.fulfilled);
    if (pendingPromises.length > 0) {
      lines.push(`Pending Player Promises: ${pendingPromises.map((p) => `"${p.description}"`).join(', ')}`);
    }

    const recentInteractions = mem.interactionHistory.slice(0, 3);
    if (recentInteractions.length > 0) {
      lines.push('Recent Memories:');
      for (const entry of recentInteractions) {
        lines.push(`- Discussed ${entry.topic} at ${entry.locationId}: "${entry.summary}"`);
      }
    }

    if (mem.keyDecisions.length > 0) {
      lines.push('Important Decisions Recorded:');
      for (const d of mem.keyDecisions) {
        lines.push(`- ${d.decisionId}: Selected "${d.choice}" (${d.impactDescription})`);
      }
    }

    return lines.join('\n');
  }

  public clearMemories(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.getStorageKey());
    }
  }
}

export const characterMemorySystem = CharacterMemorySystem.getInstance();
