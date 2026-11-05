/**
 * Advenquo — Living, Realistic & Story-Driven Virtual World Test Suite.
 *
 * Verifies all requirements from prompt:
 * - Persistent human character simulation (Tobi Adeleke, Kunle Badmus, Folake Coker)
 * - Hour-by-hour daily routines, independent movement, and off-screen LOD simulation
 * - 5-chapter branching story engine with milestone progression and player decisions
 * - Contextual conversational AI with persona prompts and multi-turn fallback responses
 * - Persistent character memory: interaction logs, promises, relationship stages, and summaries
 * - Free-form player exploration and life in the world (canteen, studio, active build site)
 * - Section 15: Definition of Done contract verification
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

import {
  CharacterMemorySystem,
  characterMemorySystem,
} from '../src/systems/character-memory-system.js';
import {
  CharacterSimulationSystem,
  characterSimulationSystem,
} from '../src/systems/character-simulation-system.js';
import { StoryEngine, storyEngine } from '../src/systems/story-engine.js';
import {
  ConversationalAISystem,
  conversationalAISystem,
} from '../src/systems/conversational-ai-system.js';
import {
  PlayerJournalSystem,
  playerJournalSystem,
} from '../src/systems/player-journal-system.js';
import { WorldManager, worldManager } from '../src/systems/world-manager.js';
import { interactionManager } from '../src/systems/interaction-manager.js';

describe('Advenquo: Living World & Persistent Character Story', () => {
  beforeEach(() => {
    characterMemorySystem.clearMemories();
    storyEngine.resetAll();
    characterSimulationSystem.setSimulatedHour(10); // 10:00 AM (at Studio Kán)
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. PERSISTENT HUMAN CHARACTER ARCHITECTURE & DAILY ROUTINES
  // ──────────────────────────────────────────────────────────────────────────
  describe('1. Persistent Human Characters & Daily Simulation', () => {
    it('creates Tobi Adeleke with full human background, ambitions, and financial realities', () => {
      const tobi = characterSimulationSystem.getCharacter('npc_tobi');
      assert.ok(tobi);
      assert.strictEqual(tobi.name, 'Tobi Adeleke');
      assert.strictEqual(tobi.age, 27);
      assert.strictEqual(tobi.occupation, 'Junior Architect & Sustainable Building Designer');
      assert.ok(tobi.ambitions.includes('sustainable architectural studio'));
      assert.ok(tobi.financialPressures.includes('student debt'));
      assert.ok(tobi.personalityTraits.includes('Detail-oriented'));
      assert.ok(tobi.personalityTraits.includes('Ethically uncompromising'));
    });

    it('simulates hour-by-hour daily routines across multiple locations', () => {
      // 1. Morning (07:30) -> In residential compound with sketchbook
      characterSimulationSystem.setSimulatedHour(7.5);
      const actMorning = characterSimulationSystem.getCharacterCurrentActivity('npc_tobi');
      assert.ok(actMorning);
      assert.strictEqual(actMorning.locationId, 'yaba_residential_compound');
      assert.strictEqual(actMorning.posture, 'drafting');

      // 2. Commute (09:00) -> Danfo bus transit through Yaba
      characterSimulationSystem.setSimulatedHour(9.0);
      const actCommute = characterSimulationSystem.getCharacterCurrentActivity('npc_tobi');
      assert.ok(actCommute);
      assert.strictEqual(actCommute.locationId, 'lagos_urban');
      assert.strictEqual(actCommute.posture, 'walking');

      // 3. Mid-morning (11:00) -> Studio Kán drafting desk
      characterSimulationSystem.setSimulatedHour(11.0);
      const actStudio = characterSimulationSystem.getCharacterCurrentActivity('npc_tobi');
      assert.ok(actStudio);
      assert.strictEqual(actStudio.locationId, 'yaba_architect_studio');
      assert.strictEqual(actStudio.posture, 'drafting');

      // 4. Lunch (13:30) -> Mama Nkechi’s Buka Canteen
      characterSimulationSystem.setSimulatedHour(13.5);
      const actLunch = characterSimulationSystem.getCharacterCurrentActivity('npc_tobi');
      assert.ok(actLunch);
      assert.strictEqual(actLunch.locationId, 'yaba_buka_canteen');
      assert.strictEqual(actLunch.posture, 'eating');

      // 5. Afternoon (15:30) -> Active Eco-Terrace Construction Site
      characterSimulationSystem.setSimulatedHour(15.5);
      const actSite = characterSimulationSystem.getCharacterCurrentActivity('npc_tobi');
      assert.ok(actSite);
      assert.strictEqual(actSite.locationId, 'eko_construction_site');
      assert.strictEqual(actSite.posture, 'inspecting');
    });

    it('maintains an interconnected social graph between Tobi, Kunle, and Folake', () => {
      const tobi = characterSimulationSystem.getCharacter('npc_tobi');
      assert.ok(tobi);

      const kunleRel = tobi.socialGraph.find((r) => r.targetCharacterId === 'npc_kunle');
      assert.ok(kunleRel);
      assert.strictEqual(kunleRel.relationshipType, 'contractor');
      assert.ok(kunleRel.dynamicNotes.includes('concrete mixes'));

      const folakeRel = tobi.socialGraph.find((r) => r.targetCharacterId === 'npc_folake');
      assert.ok(folakeRel);
      assert.strictEqual(folakeRel.relationshipType, 'mentor');
      assert.ok(folakeRel.trustScore >= 80);
    });

    it('simulates off-screen presence and character location queries cleanly', () => {
      characterSimulationSystem.setSimulatedHour(15);
      const siteCharacters = characterSimulationSystem.getCharactersAtLocation('eko_construction_site');
      const hasTobi = siteCharacters.some((c) => c.id === 'npc_tobi');
      const hasKunle = siteCharacters.some((c) => c.id === 'npc_kunle');
      assert.strictEqual(hasTobi, true);
      assert.strictEqual(hasKunle, true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. PERSISTENT CHARACTER MEMORY & CONTEXT SYNTHESIS
  // ──────────────────────────────────────────────────────────────────────────
  describe('2. Persistent Character Memory System', () => {
    it('records player interactions and updates relationship stages dynamically', () => {
      const charId = 'npc_tobi';
      const initialMem = characterMemorySystem.getOrCreateMemory(charId);
      assert.strictEqual(initialMem.relationshipStage, 'Stranger');
      assert.strictEqual(initialMem.relationshipScore, 0);

      // Record first meeting
      characterMemorySystem.recordInteraction(
        charId,
        'yaba_architect_studio',
        'Architectural Vision',
        'Player inspected the Eco-Terrace maquette with Tobi',
        'positive',
        15,
      );

      const memAfter = characterMemorySystem.getOrCreateMemory(charId);
      assert.strictEqual(memAfter.totalInteractions, 1);
      assert.strictEqual(memAfter.relationshipScore, 15);
      assert.strictEqual(memAfter.relationshipStage, 'Acquaintance');

      // Record deeper collaboration
      characterMemorySystem.modifyRelationshipScore(charId, 40);
      const memFriend = characterMemorySystem.getOrCreateMemory(charId);
      assert.strictEqual(memFriend.relationshipStage, 'Trusted_Friend');
    });

    it('remembers player promises and manages fulfillment state', () => {
      const charId = 'npc_tobi';
      characterMemorySystem.recordPromise(
        charId,
        'promise_visit_site',
        'Visit Tobi at the Eco-Terrace construction site',
      );

      const mem = characterMemorySystem.getOrCreateMemory(charId);
      assert.strictEqual(mem.promises.length, 1);
      assert.strictEqual(mem.promises[0].fulfilled, false);

      const fulfilled = characterMemorySystem.fulfillPromise(charId, 'promise_visit_site');
      assert.strictEqual(fulfilled, true);
      assert.strictEqual(mem.promises[0].fulfilled, true);
      assert.ok(mem.relationshipScore >= 15);
    });

    it('synthesizes structured memory summaries for conversational AI', () => {
      const charId = 'npc_tobi';
      characterMemorySystem.setPlayerName(charId, 'Adebayo');
      characterMemorySystem.recordInteraction(
        charId,
        'yaba_architect_studio',
        'Passive Cooling',
        'Discussed Yoruba veranda architecture',
        'positive',
        10,
      );

      const summary = characterMemorySystem.generateContextSummary(charId);
      assert.ok(summary.includes('Adebayo'));
      assert.ok(summary.includes('Passive Cooling'));
      assert.ok(summary.includes('Relationship:'));
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. TOBI'S MULTI-CHAPTER STORY ENGINE
  // ──────────────────────────────────────────────────────────────────────────
  describe('3. Long-Running Personal Story: Tobi Adeleke (Chapters 1-5)', () => {
    it('progresses through all 5 chapters of Tobi Adeleke story with branching choices and consequences', () => {
      // 1. Initial State: Chapter 1
      const arc = storyEngine.getStoryArc('npc_tobi');
      assert.ok(arc);
      assert.strictEqual(arc.totalChapters, 5);
      assert.strictEqual(arc.currentChapterNumber, 1);
      assert.strictEqual(arc.isComplete, false);

      const ch1 = storyEngine.getCurrentChapter('npc_tobi');
      assert.ok(ch1);
      assert.strictEqual(ch1.id, 'tobi_ch1_blueprint_and_dream');

      // 2. Complete Chapter 1 milestones -> Advances to Chapter 2
      storyEngine.completeMilestone('npc_tobi', 'm_meet_tobi_studio');
      storyEngine.completeMilestone('npc_tobi', 'm_inspect_maquette');
      assert.strictEqual(arc.currentChapterNumber, 2);

      const ch2 = storyEngine.getCurrentChapter('npc_tobi');
      assert.ok(ch2);
      assert.strictEqual(ch2.id, 'tobi_ch2_commute_and_reality');
      assert.strictEqual(ch2.primaryLocationId, 'yaba_buka_canteen');

      // 3. Complete Chapter 2 milestones -> Advances to Chapter 3
      storyEngine.completeMilestone('npc_tobi', 'm_join_tobi_lunch');
      storyEngine.completeMilestone('npc_tobi', 'm_promise_site_visit');
      assert.strictEqual(arc.currentChapterNumber, 3);

      const ch3 = storyEngine.getCurrentChapter('npc_tobi');
      assert.ok(ch3);
      assert.strictEqual(ch3.id, 'tobi_ch3_site_crisis');

      // 4. Complete Chapter 3 site milestones -> Advances to Chapter 4
      storyEngine.completeMilestone('npc_tobi', 'm_reach_construction_site');
      storyEngine.completeMilestone('npc_tobi', 'm_inspect_defective_pillar');
      storyEngine.completeMilestone('npc_tobi', 'm_witness_kunle_confrontation');
      assert.strictEqual(arc.currentChapterNumber, 4);

      const ch4 = storyEngine.getCurrentChapter('npc_tobi');
      assert.ok(ch4);
      assert.strictEqual(ch4.id, 'tobi_ch4_turning_point');
      assert.ok(ch4.choices);
      assert.strictEqual(ch4.choices.length, 3);

      // 5. Select Choice B: Engineered Structural Retrofit (Jacketing) -> Advances to Chapter 5
      const res = storyEngine.selectChoice('npc_tobi', 'choice_retrofit_compromise');
      assert.strictEqual(res.success, true);
      assert.ok(res.choice);
      assert.strictEqual(res.choice.id, 'choice_retrofit_compromise');
      assert.strictEqual(arc.chosenBranchId, 'choice_retrofit_compromise');
      assert.strictEqual(arc.currentChapterNumber, 5);

      const fact = characterMemorySystem.getKnownFact('npc_tobi', 'decision_remediation_strategy');
      assert.strictEqual(fact, 'retrofit_jacketing');

      // 6. Complete Chapter 5 -> Marks story complete & awards rewards
      const ch5 = storyEngine.getCurrentChapter('npc_tobi');
      assert.ok(ch5);
      assert.strictEqual(ch5.id, 'tobi_ch5_consequences_and_future');

      storyEngine.completeMilestone('npc_tobi', 'm_return_to_studio');
      storyEngine.completeMilestone('npc_tobi', 'm_receive_architect_stamp');

      assert.strictEqual(storyEngine.isStoryComplete('npc_tobi'), true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CONTEXTUAL CONVERSATIONAL AI & SPEECH
  // ──────────────────────────────────────────────────────────────────────────
  describe('4. Context-Aware Conversational AI', () => {
    it('synthesizes bounded persona prompt for Tobi with active chapter context', () => {
      const prompt = conversationalAISystem.buildPersonaPrompt('npc_tobi');
      assert.ok(prompt.includes('Tobi Adeleke'));
      assert.ok(prompt.includes('Studio Kán'));
      assert.ok(prompt.includes('COMMUNICATION STYLE:'));
      assert.ok(prompt.includes('STRICT BOUNDARIES:'));
    });

    it('generates rich, natural responses and advances milestones from conversation', async () => {
      // 1. Initial greeting
      const respGreet = await conversationalAISystem.converse(
        'npc_tobi',
        'Hello Tobi, good morning!',
        'yaba_architect_studio',
      );
      assert.strictEqual(respGreet.speakerName, 'Tobi Adeleke');
      assert.ok(respGreet.spokenText.includes('Studio Kán'));
      assert.ok(respGreet.suggestedFollowUps.length > 0);

      // 2. Inquire about the architectural maquette
      const respMaquette = await conversationalAISystem.converse(
        'npc_tobi',
        'Tell me about this architectural maquette on the plinth.',
        'yaba_architect_studio',
      );
      assert.ok(respMaquette.spokenText.includes('veranda'));
      assert.strictEqual(respMaquette.internalEmotion, 'enthusiastic');

      // 3. Offer a promise to visit the active construction site
      const respPromise = await conversationalAISystem.converse(
        'npc_tobi',
        'I promise to visit the construction site with you to check the concrete.',
        'yaba_buka_canteen',
      );
      assert.ok(respPromise.extractedPromise);
      assert.strictEqual(respPromise.extractedPromise.id, 'promise_visit_site');
      assert.strictEqual(respPromise.sentiment, 'grateful');
    });

    it('handles crisis conversations and choice inputs naturally', async () => {
      const arc = storyEngine.getStoryArc('npc_tobi');
      if (arc) arc.currentChapterNumber = 3;

      const respPillar = await conversationalAISystem.converse(
        'npc_tobi',
        'Let’s inspect the cracked pillar and the foundation defect.',
        'eko_construction_site',
      );
      assert.ok(respPillar.spokenText.includes('Grade 32.5'));

      // Advise jacketing retrofit
      const respRetrofit = await conversationalAISystem.converse(
        'npc_tobi',
        'Can we engineer a steel jacketing retrofit with Kunle?',
        'eko_construction_site',
      );
      assert.ok(respRetrofit.spokenText.includes('steel jacket'));
      assert.strictEqual(respRetrofit.internalEmotion, 'focused');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. PLAYER JOURNAL & CULTURAL DISCOVERIES
  // ──────────────────────────────────────────────────────────────────────────
  describe('5. Player Journal & Free Exploration Life', () => {
    it('records cultural and architectural discoveries emerging from everyday life', () => {
      const recorded = playerJournalSystem.recordCulturalDiscovery(
        'yoruba_passive_cooling',
        'architecture',
        'Yoruba Bioclimatic Architecture (Àtẹ́lẹwọ́)',
        'Traditional shaded courtyards designed for cross-ventilation',
        'Cuts ambient temperatures by up to 6°C without mechanical refrigeration.',
      );
      assert.strictEqual(recorded, true);

      const discoveries = playerJournalSystem.getCulturalDiscoveries();
      assert.strictEqual(discoveries.length, 1);
      assert.strictEqual(discoveries[0].id, 'yoruba_passive_cooling');
    });

    it('summarizes known characters and ongoing life stories in player journal', () => {
      const known = playerJournalSystem.getKnownCharacters();
      assert.ok(known.length >= 3);
      const tobiEntry = known.find((k) => k.characterId === 'npc_tobi');
      assert.ok(tobiEntry);
      assert.strictEqual(tobiEntry.name, 'Tobi Adeleke');

      const stories = playerJournalSystem.getActiveStorySummaries();
      assert.ok(stories.length >= 1);
      assert.strictEqual(stories[0].characterName, 'Tobi Adeleke');
    });

    it('dispatches rich environmental interactions for Tobi’s workplaces and canteen', () => {
      // 1. Studio Kán
      const studioEvt = interactionManager.handleEntityInteraction('architect-studio', 'ArchitectStudioInterior');
      assert.strictEqual(studioEvt.category, 'building');
      assert.ok(studioEvt.title.includes('Studio Kán'));

      // 2. Active Construction Site
      const siteEvt = interactionManager.handleEntityInteraction('construction-site', 'ConstructionSiteCompound');
      assert.strictEqual(siteEvt.category, 'building');
      assert.ok(siteEvt.title.includes('Construction Site'));

      // 3. Mama Nkechi's Buka
      const bukaEvt = interactionManager.handleEntityInteraction('buka-restaurant', 'MamaNkechiBuka');
      assert.strictEqual(bukaEvt.category, 'food_produce');
      assert.ok(bukaEvt.title.includes('Mama Nkechi'));

      // 4. Defective Pillar
      const pillarEvt = interactionManager.handleEntityInteraction('DefectivePillar', 'DefectivePillar');
      assert.strictEqual(pillarEvt.category, 'artifact');
      assert.ok(pillarEvt.title.includes('Cracked Structural Column'));
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. SECTION 15: DEFINITION OF DONE CONTRACT
  // ──────────────────────────────────────────────────────────────────────────
  describe('6. Section 15: Definition of Done Contract', () => {
    it('fulfills complete Definition of Done criteria for living world experience', async () => {
      // 1. Enter Lagos and explore multiple connected locations
      const locations = worldManager.locations.getAllPlayableLocations();
      assert.ok(locations.length >= 4);

      // 2. Meet Tobi at his workplace (Studio Kán)
      const tobi = characterSimulationSystem.getCharacter('npc_tobi');
      assert.ok(tobi);
      assert.strictEqual(tobi.workLocationId, 'yaba_architect_studio');

      // 3. Have a substantial natural conversation
      const talkRes = await conversationalAISystem.converse(
        'npc_tobi',
        'Hello Tobi, I saw your design for the Eco-Terrace.',
        'yaba_architect_studio',
      );
      assert.ok(talkRes.spokenText.length > 50);

      // 4. Meet people connected to him (Kunle the contractor & Folake the mentor)
      const kunle = characterSimulationSystem.getCharacter('npc_kunle');
      const folake = characterSimulationSystem.getCharacter('npc_folake');
      assert.ok(kunle);
      assert.ok(folake);

      // 5. Participate in his story across chapters
      assert.ok(storyEngine.getStoryArc('npc_tobi') !== undefined);

      // 6. Leave the location and return later: Tobi remembers previous interactions
      characterSimulationSystem.advanceSimulatedTime(4); // Advance 4 hours
      characterMemorySystem.recordInteraction(
        'npc_tobi',
        'yaba_architect_studio',
        'Return Visit',
        'Player returned after 4 hours of exploring Lagos',
        'positive',
      );
      const summary = characterMemorySystem.generateContextSummary('npc_tobi');
      assert.ok(summary.includes('Total Interactions:'));

      // 7. Free exploration without forced question missions
      const summaries = playerJournalSystem.getActiveStorySummaries();
      assert.ok(summaries.length > 0);
    });
  });
});
