/**
 * Advenquo — DialogueManager.
 *
 * Coordinates interactive conversations with all living world NPCs:
 * - Branching dialogues with Yoruba cultural etiquette & vocabulary learning
 * - Evaluates respectful elder registers vs casual expressions
 * - Awards XP, vocabulary items, and journal notes upon completion
 * - Drives both 2D responsive dialogue cards and 3D spatial UIKitML panels
 */

import { locationManager } from './location-manager.js';
import { playerProgression } from './player-progression.js';
import type { LocationNPCDef } from '../world/location-types.js';

export interface ActiveConversationState {
  characterId: string;
  name: string;
  role: string;
  greetingYoruba: string;
  greetingEnglish: string;
  currentTopicIndex: number;
  speech: string;
  culturalNote?: string;
  choices: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
    yorubaTerm?: string;
  }>;
  isComplete: boolean;
}

export class DialogueManager {
  private static instance: DialogueManager | null = null;
  private activeConversation: ActiveConversationState | null = null;
  private onDialogueChangeCallbacks: Array<(conv: ActiveConversationState | null) => void> = [];

  public static getInstance(): DialogueManager {
    if (!DialogueManager.instance) {
      DialogueManager.instance = new DialogueManager();
    }
    return DialogueManager.instance;
  }

  public getActiveConversation(): ActiveConversationState | null {
    return this.activeConversation;
  }

  public startConversation(characterId: string): ActiveConversationState | null {
    const loc = locationManager.getActiveLocation();
    const npcDef = loc.npcs.find((n) => n.characterId === characterId);

    if (!npcDef) return null;

    const topic = npcDef.dialogueTopics[0];
    const choices = [
      {
        id: 'choice_respectful',
        text: `Ẹ káàárọ̀ o! Please tell me about ${topic?.topicLabel || 'this place'}.`,
        isCorrect: true,
        feedback: 'Warm smile: "You speak with great home training (Ọmọlúwàbí). Welcome!"',
        yorubaTerm: 'Ẹ jọ̀wọ́',
      },
      {
        id: 'choice_casual',
        text: 'Báwo ni! Give me some information.',
        isCorrect: false,
        feedback: 'Gentle correction: "Soften your tongue with honorific greetings before asking for directions."',
      },
      {
        id: 'choice_english',
        text: 'Good day! What can you teach me about your traditions?',
        isCorrect: true,
        feedback: 'Appreciative nod: "I am glad to share our heritage with earnest travelers."',
      },
    ];

    this.activeConversation = {
      characterId: npcDef.characterId,
      name: npcDef.name,
      role: npcDef.role,
      greetingYoruba: npcDef.greetingYoruba,
      greetingEnglish: npcDef.greetingEnglish,
      currentTopicIndex: 0,
      speech: topic ? `${npcDef.greetingEnglish} "${topic.speech}"` : npcDef.greetingEnglish,
      culturalNote: topic?.culturalNote,
      choices,
      isComplete: false,
    };

    // If topic has vocabulary reward, award it!
    if (topic?.vocabularyReward) {
      playerProgression.recordVocabulary({
        term: topic.vocabularyReward.term,
        phonetic: topic.vocabularyReward.phonetic,
        englishGloss: topic.vocabularyReward.englishGloss,
        language: 'Yoruba',
        context: topic.culturalNote || 'Learned during conversation.',
      });
      playerProgression.addXP(40);
    }

    this._notify();
    return this.activeConversation;
  }

  public submitChoice(choiceId: string): { isCorrect: boolean; feedback: string } | null {
    if (!this.activeConversation) return null;
    const choice = this.activeConversation.choices.find((c) => c.id === choiceId);
    if (!choice) return null;

    if (choice.isCorrect) {
      this.activeConversation.isComplete = true;
      playerProgression.addXP(60);
      playerProgression.advanceSkill('culturalInterpretation', 5);
      playerProgression.advanceSkill('languageComprehension', 5);
    }

    this._notify();
    return {
      isCorrect: choice.isCorrect,
      feedback: choice.feedback,
    };
  }

  public endConversation(): void {
    this.activeConversation = null;
    this._notify();
  }

  public onDialogueChange(callback: (conv: ActiveConversationState | null) => void): () => void {
    this.onDialogueChangeCallbacks.push(callback);
    return () => {
      const idx = this.onDialogueChangeCallbacks.indexOf(callback);
      if (idx !== -1) this.onDialogueChangeCallbacks.splice(idx, 1);
    };
  }

  private _notify(): void {
    for (const cb of this.onDialogueChangeCallbacks) {
      cb(this.activeConversation);
    }
  }
}

export const dialogueManager = DialogueManager.getInstance();
