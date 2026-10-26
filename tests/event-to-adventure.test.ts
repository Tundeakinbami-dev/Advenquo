/**
 * Advenquo Global Live World Engine: Event-to-Adventure Pipeline Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { adventureGenerator } from '../src/live-world/editorial/adventure-generator.js';
import { missionEngine } from '../src/game/mission-engine.js';
import { storage } from '../src/game/storage.js';
import type { WorldEvent } from '../src/live-world/types.js';

function createPublishedStubEvent(): WorldEvent {
  return {
    id: 'evt_blue_line_2026',
    currentVersion: 1,
    title: 'Lagos Rail Mass Transit: Electrified Blue Line Rail Expands Across Coastal Lagoon',
    shortSummary:
      'Lagos has officially inaugurated and scaled passenger operations on the LRMT Blue Line, cutting transit times from 2.5 hours to 22 minutes.',
    inDepthContext:
      'Operating with 100% electric multiple units drawing power from a dedicated captive power plant.',
    topic: 'economy_business',
    location: {
      country: 'Nigeria',
      countryCode: 'NG',
      region: 'South West',
      city: 'Lagos',
      districtId: 'isale_eko',
      coordinates: [6.455, 3.394],
      locationConfidence: 'exact',
    },
    status: 'PUBLISHED',
    firstObservedAt: '2026-10-25T10:00:00Z',
    publishedAt: '2026-10-25T11:00:00Z',
    lastUpdatedAt: '2026-10-25T11:00:00Z',
    freshnessCategory: 'BREAKING',
    confidenceRating: 'VERIFIED_FACT',
    sources: [
      {
        sourceId: 'src_lamata_official',
        sourceName: 'LAMATA Official Press',
        publisher: 'Lagos Metropolitan Area Transport Authority',
        url: 'https://lamata-ng.com/press',
        publishedAt: '2026-10-25T10:00:00Z',
        retrievedAt: '2026-10-25T10:05:00Z',
        licenseText: 'Official public record',
        isLeadSource: true,
      },
    ],
    claims: [
      {
        claimId: 'claim_1',
        statement: 'Blue line operates on 100% electric multiple units with independent captive power.',
        category: 'CONFIRMED_FACT',
        corroborationCount: 2,
        evidence: [],
        confidenceScore: 0.98,
      },
    ],
    updatesTimeline: [],
    corrections: [],
    unresolvedQuestions: [],
    tags: ['transit', 'lagos', 'clean energy'],
  };
}

describe('Event-to-Adventure Pipeline', () => {
  it('refuses to generate an adventure for unverified or unpublished events', () => {
    const unapprovedEvent = createPublishedStubEvent();
    unapprovedEvent.status = 'DISCOVERED';

    assert.throws(
      () => {
        adventureGenerator.createAdventureFromEvent(unapprovedEvent, {
          adventureId: 'adv_invalid',
          title: 'Unapproved Adventure',
          educationalObjective: 'Explore unverified claims',
          learningSkills: ['evidenceEvaluation'],
          sceneClassification: 'FACTUAL_VISUALIZATION',
          steps: [],
          culturalTakeaway: 'Takeaway',
          realWorldContext: 'Context',
        });
      },
      /Cannot create adventure for unapproved event/,
      'Must reject unapproved event',
    );
  });

  it('transforms an approved WorldEvent into a valid LiveAdventure with explicit scene classification and non-gamification pledge', () => {
    const event = createPublishedStubEvent();

    const adventure = adventureGenerator.createAdventureFromEvent(event, {
      adventureId: 'mission_eval_transit_adventure',
      title: 'Electrified Transit & Lagoon Ecology',
      educationalObjective: 'Understand electric light rail engineering and emission reductions',
      learningSkills: ['evidenceEvaluation', 'geographicReasoning'],
      sceneClassification: 'FACTUAL_VISUALIZATION',
      steps: [
        {
          id: 'step_eval_1',
          ordinal: 1,
          type: 'investigation',
          title: 'Investigating Lagoon Power Substation',
          prompt: 'What dedicated power infrastructure was built to prevent electric train stoppage over the lagoon?',
          context: 'Reviewing LAMATA technical specifications.',
          dialogueChoices: [
            {
              id: 'c_ipp',
              text: 'A dedicated Independent Power Plant (IPP) with battery backup.',
              isCorrect: true,
              feedback: 'Verified! Captive power generation guarantees train reliability.',
              explanation: 'Urban light rail cannot depend on fluctuating shared municipal grids.',
            },
            {
              id: 'c_diesel',
              text: 'Hidden diesel generators.',
              isCorrect: false,
              feedback: 'Incorrect. The train is 100% electric multiple unit propulsion.',
              explanation: 'Verified records confirm zero locomotive diesel engines.',
            },
          ],
          hint: 'Look for dedicated independent power plant.',
          successOutcome: 'You proved electric transit infrastructural independence.',
          retryGuidance: 'Check captive power engineering solutions.',
        },
      ],
      culturalTakeaway: 'Sustainable megacity engineering respects both urban speed and lagoon ecology.',
      realWorldContext: 'The Lagos Blue Line is sub-Saharan Africa’s first electrified urban light rail.',
    });

    assert.ok(adventure.adventureId);
    assert.strictEqual(adventure.eventId, event.id);
    assert.strictEqual(adventure.sceneClassification, 'FACTUAL_VISUALIZATION');
    assert.ok(adventure.nonGamificationPledge.includes('strictly prohibits gamifying'));
    assert.strictEqual(event.linkedAdventureId, adventure.adventureId);

    // Verify MissionDefinition is compatible with MissionEngine
    assert.ok(adventure.missionDefinition.id);
    assert.strictEqual(adventure.missionDefinition.type, 'contemporary_world_now');
    assert.ok(adventure.missionDefinition.steps.length >= 1);
  });

  it('registers generated adventure into MissionEngine and executes to completion with rewards', () => {
    const event = createPublishedStubEvent();
    const adventure = adventureGenerator.createAdventureFromEvent(event, {
      adventureId: 'mission_eval_playable',
      title: 'Sustainable Infrastructure Investigation',
      educationalObjective: 'Evaluate real-world engineering data',
      learningSkills: ['evidenceEvaluation'],
      sceneClassification: 'FACTUAL_VISUALIZATION',
      steps: [
        {
          id: 'step_1',
          ordinal: 1,
          type: 'investigation',
          title: 'Power Infrastructure Check',
          prompt: 'Select the verified power source.',
          context: 'Engineering logs.',
          dialogueChoices: [
            {
              id: 'c_correct',
              text: 'Dedicated Independent Power Plant',
              isCorrect: true,
              feedback: 'Correct!',
              explanation: 'Verified fact.',
            },
          ],
          hint: 'Select the dedicated plant.',
          successOutcome: 'Step completed.',
          retryGuidance: 'Try again.',
        },
      ],
      culturalTakeaway: 'Takeaway',
      realWorldContext: 'Context',
    });

    // Register mission in engine
    missionEngine.registerMission(adventure.missionDefinition);

    // Start mission
    const startResult = missionEngine.startMission(adventure.missionDefinition.id);
    assert.strictEqual(startResult.success, true);

    // Submit correct choice
    const evalResult = missionEngine.submitChoice(
      adventure.missionDefinition.id,
      'step_1',
      'c_correct',
    );
    assert.strictEqual(evalResult.isCorrect, true);
    assert.strictEqual(evalResult.canAdvance, true);

    // Complete mission
    const compResult = missionEngine.completeMission(adventure.missionDefinition.id);
    assert.strictEqual(compResult.success, true);
    assert.ok(compResult.xpEarned > 0);
    assert.ok(compResult.unlockedStamp);
    assert.strictEqual(compResult.unlockedStamp.category, 'contemporary');
  });
});
