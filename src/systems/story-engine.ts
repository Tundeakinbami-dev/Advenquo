/**
 * Advenquo — StoryEngine.
 *
 * Implements persistent, multi-chapter narrative progression:
 * - Episodic story chapters with narrative milestones and branching choices
 * - Deep, non-gamified character development over simulated time
 * - Connects choices to relationship scores, character emotions, and world state
 * - Full 5-Chapter narrative arc for Tobi Adeleke (Junior Architect, Lagos)
 * - Persists active story stage, completed milestones, and player decisions
 */

import { characterMemorySystem, CharacterMemorySystem } from './character-memory-system.js';
import { characterSimulationSystem, CharacterSimulationSystem } from './character-simulation-system.js';
import { storage } from '../game/storage.js';

export interface StoryChoiceOption {
  id: string;
  label: string;
  speechText: string;
  consequenceSummary: string;
  relationshipDelta: number;
  emotionalReaction: 'calm' | 'enthusiastic' | 'focused' | 'anxious' | 'determined' | 'relieved';
  resultingFactKey?: string;
  resultingFactValue?: string | boolean;
}

export interface StoryMilestone {
  id: string;
  title: string;
  description: string;
  locationId: string;
  targetCharacterId: string;
  completed: boolean;
  completedAt?: string;
}

export interface StoryChapter {
  chapterNumber: number;
  id: string;
  title: string;
  tagline: string;
  primaryLocationId: string;
  synopsis: string;
  milestones: StoryMilestone[];
  choicePrompt?: string;
  choices?: StoryChoiceOption[];
  resolutionText: string;
  minSimulatedHoursToAdvance?: number;
}

export interface CharacterStoryArc {
  characterId: string;
  characterName: string;
  currentChapterNumber: number; // 1 to 5
  totalChapters: number;
  chapters: StoryChapter[];
  chosenBranchId?: string;
  isComplete: boolean;
  completedAt?: string;
}

export class StoryEngine {
  private static instance: StoryEngine | null = null;
  private storyArcs: Map<string, CharacterStoryArc> = new Map();
  private memSys: CharacterMemorySystem;
  private simSys: CharacterSimulationSystem;

  public static getInstance(): StoryEngine {
    if (!StoryEngine.instance) {
      StoryEngine.instance = new StoryEngine();
    }
    return StoryEngine.instance;
  }

  constructor() {
    this.memSys = characterMemorySystem;
    this.simSys = characterSimulationSystem;
    this.initializeTobiStoryArc();
    this.loadFromStorage();
  }

  private getStorageKey(): string {
    return 'advenquo_story_arcs';
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const data = window.localStorage.getItem(this.getStorageKey());
      if (data) {
        const parsed = JSON.parse(data) as Record<string, Partial<CharacterStoryArc>>;
        for (const [charId, arcData] of Object.entries(parsed)) {
          const existing = this.storyArcs.get(charId);
          if (existing) {
            if (arcData.currentChapterNumber !== undefined) {
              existing.currentChapterNumber = arcData.currentChapterNumber;
            }
            if (arcData.chosenBranchId !== undefined) {
              existing.chosenBranchId = arcData.chosenBranchId;
            }
            if (arcData.isComplete !== undefined) {
              existing.isComplete = arcData.isComplete;
            }
            if (arcData.chapters) {
              for (const ch of arcData.chapters) {
                const targetCh = existing.chapters.find((c) => c.chapterNumber === ch.chapterNumber);
                if (targetCh && ch.milestones) {
                  for (const m of ch.milestones) {
                    const targetM = targetCh.milestones.find((tm) => tm.id === m.id);
                    if (targetM) {
                      targetM.completed = m.completed;
                      targetM.completedAt = m.completedAt;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load story arcs from storage:', e);
    }
  }

  public saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const obj: Record<string, any> = {};
      for (const [id, arc] of this.storyArcs.entries()) {
        obj[id] = {
          currentChapterNumber: arc.currentChapterNumber,
          chosenBranchId: arc.chosenBranchId,
          isComplete: arc.isComplete,
          completedAt: arc.completedAt,
          chapters: arc.chapters.map((c) => ({
            chapterNumber: c.chapterNumber,
            milestones: c.milestones.map((m) => ({
              id: m.id,
              completed: m.completed,
              completedAt: m.completedAt,
            })),
          })),
        };
      }
      window.localStorage.setItem(this.getStorageKey(), JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save story arcs to storage:', e);
    }
  }

  private initializeTobiStoryArc(): void {
    const tobiArc: CharacterStoryArc = {
      characterId: 'npc_tobi',
      characterName: 'Tobi Adeleke',
      currentChapterNumber: 1,
      totalChapters: 5,
      isComplete: false,
      chapters: [
        // ── CHAPTER 1 ────────────────────────────────────────────────────────
        {
          chapterNumber: 1,
          id: 'tobi_ch1_blueprint_and_dream',
          title: 'The Blueprint and the Dream',
          tagline: 'Sustainable Architecture in the Heart of Yaba',
          primaryLocationId: 'yaba_architect_studio',
          synopsis:
            'Encounter Tobi at Studio Kán in Yaba as he works on the 3D maquette for the Lekki Eco-Terrace project. Discover his architectural vision, student loan burdens, and commitment to Yoruba passive cooling principles.',
          milestones: [
            {
              id: 'm_meet_tobi_studio',
              title: 'Meet Tobi at Studio Kán',
              description: 'Approach Tobi’s drafting table and discuss his architectural blueprints.',
              locationId: 'yaba_architect_studio',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
            {
              id: 'm_inspect_maquette',
              title: 'Examine the Eco-Terrace Maquette',
              description: 'Inspect the sustainable timber scale model on the central plinth.',
              locationId: 'yaba_architect_studio',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
          ],
          resolutionText:
            'Tobi shared his passion for climate-conscious architecture and admitted the heavy financial pressure of supporting his sister while paying down debt. A bond of mutual respect has begun.',
        },

        // ── CHAPTER 2 ────────────────────────────────────────────────────────
        {
          chapterNumber: 2,
          id: 'tobi_ch2_commute_and_reality',
          title: 'The Commute & Everyday Reality',
          tagline: 'Cost Pressures & Contractor Friction over Lunch',
          primaryLocationId: 'yaba_buka_canteen',
          synopsis:
            'Join Tobi on his midday break at Mama Nkechi’s Buka canteen. Over smoky Jollof rice and fried dodo, Tobi reveals mounting friction with chief contractor Kunle, who is pushing to switch to cheaper cement to beat rising inflation.',
          milestones: [
            {
              id: 'm_join_tobi_lunch',
              title: 'Join Tobi at Mama Nkechi’s Buka',
              description: 'Sit with Tobi at the canteen bench and discuss the reality of building in Lagos.',
              locationId: 'yaba_buka_canteen',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
            {
              id: 'm_promise_site_visit',
              title: 'Promise to Inspect the Site',
              description: 'Promise Tobi that you will meet him at the active construction site to review the concrete work.',
              locationId: 'yaba_buka_canteen',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
          ],
          resolutionText:
            'Tobi opened up about the ethical tightrope of building in Lagos. You promised to visit his active construction site to examine the foundation integrity firsthand.',
        },

        // ── CHAPTER 3 ────────────────────────────────────────────────────────
        {
          chapterNumber: 3,
          id: 'tobi_ch3_site_crisis',
          title: 'The Site Crisis: The Foundation Fracture',
          tagline: 'Cracks in the Pillar and a Clashing of Worlds',
          primaryLocationId: 'eko_construction_site',
          synopsis:
            'Arrive at the active Eco-Terrace construction site. Tobi discovers diagonal shear cracks developing on the eastern load-bearing column. Contractor Kunle furiously disputes the severity, warning that halting work will bankrupt his workers.',
          milestones: [
            {
              id: 'm_reach_construction_site',
              title: 'Arrive at the Eco-Terrace Build',
              description: 'Find Tobi among the concrete mixers and scaffolding.',
              locationId: 'eko_construction_site',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
            {
              id: 'm_inspect_defective_pillar',
              title: 'Inspect the Fractured Concrete Pillar',
              description: 'Examine the red chalk marks and shear cracks on the structural column.',
              locationId: 'eko_construction_site',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
            {
              id: 'm_witness_kunle_confrontation',
              title: 'Confront Contractor Kunle',
              description: 'Listen to Kunle’s defense of the site schedule and material delivery invoices.',
              locationId: 'eko_construction_site',
              targetCharacterId: 'npc_kunle',
              completed: false,
            },
          ],
          resolutionText:
            'The structural defect is real: Grade 32.5 cement was delivered instead of structural Grade 42.5. Tobi is overwhelmed by the gravity of the choice ahead and asks for your guidance.',
        },

        // ── CHAPTER 4 ────────────────────────────────────────────────────────
        {
          chapterNumber: 4,
          id: 'tobi_ch4_turning_point',
          title: 'The Turning Point: The Critical Decision',
          tagline: 'Ethical Integrity vs. Practical Survival',
          primaryLocationId: 'eko_construction_site',
          synopsis:
            'Tobi stands at a crossroads that will define his professional career and conscience. Help Tobi choose how to resolve the compromised structural column.',
          milestones: [
            {
              id: 'm_deliberate_with_tobi',
              title: 'Counsel Tobi on the Remediation Path',
              description: 'Review the three proposed solutions with Tobi.',
              locationId: 'eko_construction_site',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
          ],
          choicePrompt: 'How should Tobi handle the compromised load-bearing column?',
          choices: [
            {
              id: 'choice_whistleblow_folake',
              label: 'Immediate Whistleblow to Senior Partner Folake',
              speechText:
                'We must report this to Folake and the State Building Control Agency immediately. Lives are at stake; we cannot compromise on structural safety.',
              consequenceSummary:
                'Halts construction immediately. Protects public safety with zero ambiguity, but triggers fierce contractual disputes with Kunle.',
              relationshipDelta: 20,
              emotionalReaction: 'determined',
              resultingFactKey: 'decision_remediation_strategy',
              resultingFactValue: 'whistleblow_folake',
            },
            {
              id: 'choice_retrofit_compromise',
              label: 'Engineered Steel & Carbon-Fiber Jacketing Retrofit',
              speechText:
                'Work with Kunle tonight to install an external steel jacket and carbon-fiber reinforcement wrap before the upper slab is poured. Fix the load capacity without shutting down the site.',
              consequenceSummary:
                'Pragmatic compromise. Demonstrates real-world engineering ingenuity, earns Kunle’s deep respect, and avoids project termination.',
              relationshipDelta: 15,
              emotionalReaction: 'focused',
              resultingFactKey: 'decision_remediation_strategy',
              resultingFactValue: 'retrofit_jacketing',
            },
            {
              id: 'choice_independent_audit',
              label: 'Emergency State Laboratory Material Testing Audit',
              speechText:
                'Take core samples immediately to the Lagos State Materials Testing Laboratory (LSMTL) for a certified 48-hour pressure test before any more concrete is poured.',
              consequenceSummary:
                'Procedural and unimpeachable. Uncovers whether the cement distributor delivered counterfeit bags, shifting legal liability from both Tobi and Kunle.',
              relationshipDelta: 15,
              emotionalReaction: 'calm',
              resultingFactKey: 'decision_remediation_strategy',
              resultingFactValue: 'independent_audit',
            },
          ],
          resolutionText:
            'The decision was made. Tobi set the remediation plan in motion with clear resolve. Now, time must pass for the consequences to unfold.',
        },

        // ── CHAPTER 5 ────────────────────────────────────────────────────────
        {
          chapterNumber: 5,
          id: 'tobi_ch5_consequences_and_future',
          title: 'The Aftermath & The Future',
          tagline: 'Reputation, Gratitude, and New Horizons',
          primaryLocationId: 'yaba_architect_studio',
          synopsis:
            'Return to Studio Kán after the simulated crisis resolution. Discover how Tobi’s decision shaped his reputation, his relationship with Kunle and Folake, and his journey toward opening his own sustainable studio.',
          milestones: [
            {
              id: 'm_return_to_studio',
              title: 'Return to Studio Kán to Meet Tobi',
              description: 'Speak with Tobi to hear the outcome of the site resolution.',
              locationId: 'yaba_architect_studio',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
            {
              id: 'm_receive_architect_stamp',
              title: 'Receive Tobi’s Hand-Drawn Blueprint Keepsake',
              description: 'Celebrate Tobi’s success and receive the Master of Eko Architecture recognition.',
              locationId: 'yaba_architect_studio',
              targetCharacterId: 'npc_tobi',
              completed: false,
            },
          ],
          resolutionText:
            'Tobi’s character was forged in the fire of real-world adversity. He stands tall as a beacon of sustainable, ethical African architecture.',
        },
      ],
    };

    this.storyArcs.set(tobiArc.characterId, tobiArc);
  }

  public getStoryArc(characterId: string): CharacterStoryArc | undefined {
    return this.storyArcs.get(characterId);
  }

  public getCurrentChapter(characterId: string): StoryChapter | undefined {
    const arc = this.storyArcs.get(characterId);
    if (!arc) return undefined;
    return arc.chapters.find((c) => c.chapterNumber === arc.currentChapterNumber);
  }

  public completeMilestone(characterId: string, milestoneId: string): boolean {
    const arc = this.storyArcs.get(characterId);
    if (!arc) return false;

    const chapter = this.getCurrentChapter(characterId);
    if (!chapter) return false;

    const m = chapter.milestones.find((milestone) => milestone.id === milestoneId);
    if (m && !m.completed) {
      m.completed = true;
      m.completedAt = new Date().toISOString();

      this.memSys.recordInteraction(
        characterId,
        chapter.primaryLocationId,
        chapter.title,
        `Completed story milestone: ${m.title}`,
        'positive',
        5,
      );

      // Check if all milestones in chapter are complete
      const allComplete = chapter.milestones.every((milestone) => milestone.completed);
      if (allComplete && !chapter.choices) {
        // Automatically advance chapter if there are no branching choices
        this.advanceChapter(characterId);
      }

      this.saveToStorage();
      return true;
    }
    return false;
  }

  public selectChoice(characterId: string, choiceId: string): { success: boolean; choice?: StoryChoiceOption } {
    const arc = this.storyArcs.get(characterId);
    if (!arc) return { success: false };

    const chapter = this.getCurrentChapter(characterId);
    if (!chapter || !chapter.choices) return { success: false };

    const choice = chapter.choices.find((c) => c.id === choiceId);
    if (!choice) return { success: false };

    arc.chosenBranchId = choice.id;

    // Record decision in memory system
    this.memSys.recordKeyDecision(characterId, chapter.id, choice.id, choice.consequenceSummary);
    this.memSys.modifyRelationshipScore(characterId, choice.relationshipDelta);
    this.simSys.setCharacterEmotion(characterId, choice.emotionalReaction);

    if (choice.resultingFactKey && choice.resultingFactValue) {
      this.memSys.setKnownFact(characterId, choice.resultingFactKey, choice.resultingFactValue);
    }

    // Complete all milestones of this chapter and advance
    for (const m of chapter.milestones) {
      m.completed = true;
      m.completedAt = new Date().toISOString();
    }

    this.advanceChapter(characterId);
    this.saveToStorage();
    return { success: true, choice };
  }

  public advanceChapter(characterId: string): boolean {
    const arc = this.storyArcs.get(characterId);
    if (!arc) return false;

    if (arc.currentChapterNumber < arc.totalChapters) {
      arc.currentChapterNumber++;
      this.saveToStorage();
      return true;
    } else {
      arc.isComplete = true;
      arc.completedAt = new Date().toISOString();
      this.recordStoryCompletionRewards(characterId);
      this.saveToStorage();
      return true;
    }
  }

  private recordStoryCompletionRewards(characterId: string): void {
    if (characterId === 'npc_tobi') {
      storage.recordDiscovery('story_tobi_adeleke_complete', 'artifact');
      storage.recordDiscovery('passport_stamp_eko_architect', 'geography');
      storage.addXp(450);
    }
  }

  public isStoryComplete(characterId: string): boolean {
    const arc = this.storyArcs.get(characterId);
    return arc ? arc.isComplete : false;
  }

  public resetStoryArc(characterId: string): void {
    if (characterId === 'npc_tobi') {
      this.initializeTobiStoryArc();
      this.saveToStorage();
    }
  }

  public resetAll(): void {
    this.initializeTobiStoryArc();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.getStorageKey());
    }
  }
}

export const storyEngine = StoryEngine.getInstance();
