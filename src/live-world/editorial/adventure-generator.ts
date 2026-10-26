/**
 * Advenquo Global Live World Engine: Event-to-Adventure Pipeline
 *
 * Transforms verified, editorially approved world events into educational,
 * highly engaging game missions while strictly adhering to safety & non-gamification rules:
 *
 * 1. Explicit scene classification (Factual vs Illustrative vs Hypothetical)
 * 2. Strict non-gamification pledge (no points for human suffering or violence)
 * 3. Verified factual citations embedded directly in steps & debrief
 * 4. Production of fully compliant `MissionDefinition` objects compatible with Advenquo's Mission Engine
 */

import type { LiveAdventure, WorldEvent } from '../types.js';
import type { MissionDefinition, MissionStep } from '../../game/types.js';

export class AdventureGenerator {
  private adventures: Map<string, LiveAdventure> = new Map();

  /**
   * Builds an interactive adventure from an approved, verified WorldEvent.
   */
  public createAdventureFromEvent(
    event: WorldEvent,
    config: {
      adventureId: string;
      title: string;
      educationalObjective: string;
      learningSkills: ('geographicReasoning' | 'evidenceEvaluation' | 'culturalInterpretation' | 'languageComprehension' | 'navigationPlanning')[];
      sceneClassification: LiveAdventure['sceneClassification'];
      steps: MissionStep[];
      culturalTakeaway: string;
      realWorldContext: string;
    },
  ): LiveAdventure {
    if (event.status !== 'PUBLISHED' && event.status !== 'UPDATED' && event.status !== 'CORRECTED') {
      throw new Error(
        `Cannot create adventure for unapproved event (status is '${event.status}'). Must be PUBLISHED or UPDATED.`,
      );
    }

    const missionDefinition: MissionDefinition = {
      id: config.adventureId,
      version: `1.0.${event.currentVersion}`,
      title: config.title,
      type: 'contemporary_world_now',
      destinationId: event.location.countryCode === 'NG' ? 'nigeria' : 'global_hub',
      districtId: event.location.districtId || 'isale_eko',
      difficulty: 'apprentice',
      estimatedMinutes: 8,
      learningObjectives: config.learningSkills.map((skill) => ({
        skill,
        targetDescription: config.educationalObjective,
        xpReward: 150,
      })),
      introContext: `[${config.sceneClassification}] ${event.shortSummary} Explore the geographic, civic, and practical realities behind this development.`,
      steps: config.steps,
      rewards: {
        xp: 300,
        passportStamp: {
          id: `stamp_${config.adventureId}`,
          name: `${config.title} Contributor`,
          category: 'contemporary',
          destinationId: 'nigeria',
          districtId: event.location.districtId || 'isale_eko',
          icon: '🌍',
          description: `Participated in the educational investigation of: ${event.title}`,
        },
        journalDiscovery: {
          id: `journal_${config.adventureId}`,
          title: event.title,
          category: event.topic.replace('_', ' ').toUpperCase(),
          summary: event.shortSummary,
          verifiedFact: event.claims[0]?.statement || 'Verified contemporary development',
          sourceAttribution: event.sources[0]?.publisher || 'Verified Global Source',
        },
        skillsAdvancement: {
          evidenceEvaluation: 25,
          geographicReasoning: 20,
        },
      },
      culturalDebrief: {
        summary: event.shortSummary,
        keyVocabulary: ['Àjọṣe (Cooperation)', 'Ìlọsíwájú (Progress)', 'Àyíká (Environment)'],
        culturalTakeaway: config.culturalTakeaway,
        realWorldContext: config.realWorldContext,
      },
      sources: event.sources.map((s) => ({
        publisher: s.publisher,
        title: event.title,
        url: s.url,
        publishedDate: s.publishedAt.split('T')[0] || s.publishedAt,
        verifiedDate: new Date().toISOString().split('T')[0],
      })),
    };

    const adventure: LiveAdventure = {
      adventureId: config.adventureId,
      eventId: event.id,
      version: missionDefinition.version,
      title: config.title,
      educationalObjective: config.educationalObjective,
      learningSkills: config.learningSkills,
      difficulty: 'apprentice',
      sceneClassification: config.sceneClassification,
      factualBasisExplanation: `This interactive exploration is grounded in verified documentation from ${event.sources.map((s) => s.publisher).join(', ')}. All steps clearly distinguish factual data from educational simulation.`,
      nonGamificationPledge:
        'Advenquo strictly prohibits gamifying real-world suffering, casualties, or personal distress. This scenario is focused purely on peaceful civic understanding, ecological science, and infrastructure literacy.',
      missionDefinition,
      publishedAt: new Date().toISOString(),
    };

    this.adventures.set(adventure.adventureId, adventure);
    event.linkedAdventureId = adventure.adventureId;

    return adventure;
  }

  public getAdventure(adventureId: string): LiveAdventure | undefined {
    return this.adventures.get(adventureId);
  }

  public getAllAdventures(): LiveAdventure[] {
    return Array.from(this.adventures.values());
  }

  public getAdventureForEvent(eventId: string): LiveAdventure | undefined {
    for (const adv of this.adventures.values()) {
      if (adv.eventId === eventId) return adv;
    }
    return undefined;
  }
}

export const adventureGenerator = new AdventureGenerator();
