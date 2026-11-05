/**
 * Advenquo — CharacterSimulationSystem.
 *
 * Implements autonomous, persistent human NPC simulation:
 * - Authoritative profiles: identity, age, background, family, ambitions, financial circumstances
 * - Personality dimensions and communication styles
 * - Hour-by-hour daily schedules (work, commute, meals, site visits, rest)
 * - Dynamic emotional states (calm, enthusiastic, anxious, determined, relieved)
 * - Inter-character social network graph (trust, tension, mentorship, respect)
 * - Off-screen simulation (LOD simulation) that advances schedules without heavy rendering
 * - Synchronizes with in-game diurnal time (TimeOfDaySystem)
 */

import { timeOfDaySystem, TimeOfDaySystem } from './time-of-day-system.js';
import { characterMemorySystem, CharacterMemorySystem } from './character-memory-system.js';

export type EmotionalState = 'calm' | 'enthusiastic' | 'focused' | 'anxious' | 'determined' | 'relieved';

export interface ScheduleActivity {
  startHour: number; // 0 - 24
  endHour: number;
  locationId: string;
  activityName: string;
  description: string;
  posture: 'drafting' | 'walking' | 'eating' | 'inspecting' | 'conversing' | 'resting';
}

export interface SocialRelationship {
  targetCharacterId: string;
  targetRole: string;
  relationshipType: 'mentor' | 'colleague' | 'contractor' | 'friend' | 'family';
  trustScore: number; // -100 to 100
  dynamicNotes: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  indigenousName?: string;
  age: number;
  gender: string;
  occupation: string;
  companyOrAffiliation: string;
  homeLocationId: string;
  workLocationId: string;
  lunchLocationId: string;
  personalBio: string;
  ambitions: string;
  financialPressures: string;
  communicationStyle: {
    tone: string;
    useOfPidgin: 'minimal' | 'moderate' | 'frequent';
    useOfYoruba: 'greetings_only' | 'frequent_honorifics' | 'deep_proverbs';
    speechPace: 'deliberate' | 'energetic' | 'hurried' | 'contemplative';
  };
  personalityTraits: string[];
  currentEmotion: EmotionalState;
  dailySchedule: ScheduleActivity[];
  socialGraph: SocialRelationship[];
}

export class CharacterSimulationSystem {
  private static instance: CharacterSimulationSystem | null = null;
  private characters: Map<string, CharacterProfile> = new Map();
  private simulatedHour: number = 10; // Default: 10:00 AM (mid-morning)
  private timeSys: TimeOfDaySystem;
  private memSys: CharacterMemorySystem;

  public static getInstance(): CharacterSimulationSystem {
    if (!CharacterSimulationSystem.instance) {
      CharacterSimulationSystem.instance = new CharacterSimulationSystem();
    }
    return CharacterSimulationSystem.instance;
  }

  constructor() {
    this.timeSys = timeOfDaySystem;
    this.memSys = characterMemorySystem;
    this.registerCoreCharacters();
  }

  private registerCoreCharacters(): void {
    // ── 1. TOBI ADELEKE (Protagonist / Junior Architect) ────────────────────
    const tobi: CharacterProfile = {
      id: 'npc_tobi',
      name: 'Tobi Adeleke',
      indigenousName: 'Oluwatobiloba Adeleke',
      age: 27,
      gender: 'male',
      occupation: 'Junior Architect & Sustainable Building Designer',
      companyOrAffiliation: 'Studio Kán Architectes, Yaba',
      homeLocationId: 'yaba_residential_compound',
      workLocationId: 'yaba_architect_studio',
      lunchLocationId: 'yaba_buka_canteen',
      personalBio:
        'Graduate of the Department of Architecture at the University of Lagos. Passionate about marrying traditional Yoruba passive cooling verandas with modern low-carbon earth blocks. Living in Yaba, paying off educational loans while helping support his younger sister at school.',
      ambitions:
        'To establish his own sustainable architectural studio in Lagos and pioneer climate-resilient community hubs across West Africa.',
      financialPressures:
        'Junior architect salary with heavy city living costs, student debt repayment, and dreams of buying professional structural simulation software.',
      communicationStyle: {
        tone: 'Articulate, respectful, earnest, occasionally anxious when under professional pressure',
        useOfPidgin: 'moderate',
        useOfYoruba: 'frequent_honorifics',
        speechPace: 'deliberate',
      },
      personalityTraits: ['Detail-oriented', 'Idealistic', 'Ethically uncompromising', 'Self-critical', 'Empathetic'],
      currentEmotion: 'focused',
      dailySchedule: [
        {
          startHour: 7,
          endHour: 8.5,
          locationId: 'yaba_residential_compound',
          activityName: 'Morning tea and sketchbook drafts',
          description: 'Reviewing structural pencil sketches over hot tea on his balcony',
          posture: 'drafting',
        },
        {
          startHour: 8.5,
          endHour: 9.5,
          locationId: 'lagos_urban',
          activityName: 'Danfo bus commute through Yaba',
          description: 'Riding the yellow minibus along Commercial Avenue with blueprints in satchel',
          posture: 'walking',
        },
        {
          startHour: 9.5,
          endHour: 13,
          locationId: 'yaba_architect_studio',
          activityName: 'CAD drafting and 3D maquette review',
          description: 'Working at his slanted drafting desk at Studio Kán on the Eco-Terrace project',
          posture: 'drafting',
        },
        {
          startHour: 13,
          endHour: 14.5,
          locationId: 'yaba_buka_canteen',
          activityName: 'Lunch at Mama Nkechi’s Buka',
          description: 'Eating smoky Jollof rice and fried dodo while debriefing with contractor Kunle',
          posture: 'eating',
        },
        {
          startHour: 14.5,
          endHour: 17.5,
          locationId: 'eko_construction_site',
          activityName: 'On-site structural quality inspection',
          description: 'Checking concrete cures and reinforcing rebar at the active building site',
          posture: 'inspecting',
        },
        {
          startHour: 17.5,
          endHour: 19,
          locationId: 'yaba_architect_studio',
          activityName: 'Evening site notes debrief with Folake',
          description: 'Documenting site observations and material variances in project logs',
          posture: 'conversing',
        },
        {
          startHour: 19,
          endHour: 24,
          locationId: 'yaba_residential_compound',
          activityName: 'Evening relaxation and personal research',
          description: 'Reading architectural monographs and resting for the next workday',
          posture: 'resting',
        },
      ],
      socialGraph: [
        {
          targetCharacterId: 'npc_kunle',
          targetRole: 'Chief Building Contractor',
          relationshipType: 'contractor',
          trustScore: 35,
          dynamicNotes: 'Respects Kunle’s practical site experience, but deeply worried about cost-cutting shortcuts on concrete mixes.',
        },
        {
          targetCharacterId: 'npc_folake',
          targetRole: 'Senior Architecture Partner',
          relationshipType: 'mentor',
          trustScore: 85,
          dynamicNotes: 'Reveres Folake as an architectural icon; eager to prove his diligence without causing project scandals.',
        },
        {
          targetCharacterId: 'npc_mama_nkechi',
          targetRole: 'Buka Proprietress',
          relationshipType: 'friend',
          trustScore: 90,
          dynamicNotes: 'Mama Nkechi feeds him like a son and always senses when he is stressed about blueprints.',
        },
      ],
    };
    this.characters.set(tobi.id, tobi);

    // ── 2. KUNLE BADMUS (Lead Site Contractor) ──────────────────────────────
    const kunle: CharacterProfile = {
      id: 'npc_kunle',
      name: 'Kunle Badmus',
      indigenousName: 'Akinkunmi Badmus',
      age: 44,
      gender: 'male',
      occupation: 'General Building Contractor & Civil Engineer',
      companyOrAffiliation: 'Badmus Engineering & Concrete Works',
      homeLocationId: 'surulere_residence',
      workLocationId: 'eko_construction_site',
      lunchLocationId: 'yaba_buka_canteen',
      personalBio:
        'Veteran of 20 years on Lagos building sites. Has built schools, warehouses, and apartment complexes. Under relentless financial pressure from fluctuating building material prices and strict penalty clauses for project delays.',
      ambitions: 'To complete the Eco-Terrace build on time and secure bigger commercial contracts.',
      financialPressures: 'Carries payroll for 28 site workers and loans on heavy concrete mixers.',
      communicationStyle: {
        tone: 'Pragmatic, direct, commanding, impatient with theoretical perfectionism',
        useOfPidgin: 'frequent',
        useOfYoruba: 'frequent_honorifics',
        speechPace: 'hurried',
      },
      personalityTraits: ['Pragmatic', 'Hardworking', 'Protective of his crew', 'Cost-conscious', 'Stubborn'],
      currentEmotion: 'anxious',
      dailySchedule: [
        {
          startHour: 7,
          endHour: 13,
          locationId: 'eko_construction_site',
          activityName: 'Morning concrete pour and crew briefing',
          description: 'Directing crane operators and cement batches on the active foundation',
          posture: 'inspecting',
        },
        {
          startHour: 13,
          endHour: 14.5,
          locationId: 'yaba_buka_canteen',
          activityName: 'Lunch at Mama Nkechi’s',
          description: 'Pounded yam and Egusi lunch while reviewing delivery invoices',
          posture: 'eating',
        },
        {
          startHour: 14.5,
          endHour: 18.5,
          locationId: 'eko_construction_site',
          activityName: 'Afternoon structural review with Tobi',
          description: 'Walking the slab with Tobi to examine columns and rebar placement',
          posture: 'conversing',
        },
      ],
      socialGraph: [
        {
          targetCharacterId: 'npc_tobi',
          targetRole: 'Junior Architect',
          relationshipType: 'colleague',
          trustScore: 40,
          dynamicNotes: 'Likes the boy’s talent, but thinks young architects worry too much about micro-hairline shrinkage.',
        },
      ],
    };
    this.characters.set(kunle.id, kunle);

    // ── 3. FOLAKE COKER (Senior Architecture Partner) ───────────────────────
    const folake: CharacterProfile = {
      id: 'npc_folake',
      name: 'Folake Coker',
      indigenousName: 'Omofolake Coker (FNIA)',
      age: 52,
      gender: 'female',
      occupation: 'Senior Founding Partner & Principal Architect',
      companyOrAffiliation: 'Studio Kán Architectes',
      homeLocationId: 'ikoyi_residence',
      workLocationId: 'yaba_architect_studio',
      lunchLocationId: 'yaba_architect_studio',
      personalBio:
        'Fellow of the Nigerian Institute of Architects. Renowned for designing award-winning cultural libraries and university complexes across Nigeria. Fierce guardian of building safety standards.',
      ambitions: 'To mentor the next generation of African architects and maintain Studio Kán’s pristine reputation.',
      financialPressures: 'Oversees multi-million Naira firm operations, insurance bonds, and client contracts.',
      communicationStyle: {
        tone: 'Poised, incisive, dignified, deeply knowledgeable',
        useOfPidgin: 'minimal',
        useOfYoruba: 'frequent_honorifics',
        speechPace: 'contemplative',
      },
      personalityTraits: ['Incisive', 'Principled', 'Supportive mentor', 'Discerning'],
      currentEmotion: 'calm',
      dailySchedule: [
        {
          startHour: 8.5,
          endHour: 18,
          locationId: 'yaba_architect_studio',
          activityName: 'Executive design reviews and partner consultations',
          description: 'Reviewing major project submissions and client briefs at her executive desk',
          posture: 'conversing',
        },
      ],
      socialGraph: [
        {
          targetCharacterId: 'npc_tobi',
          targetRole: 'Junior Architect',
          relationshipType: 'mentor',
          trustScore: 90,
          dynamicNotes: 'Sees immense potential in Tobi and trusts his keen eye for structural ethics.',
        },
      ],
    };
    this.characters.set(folake.id, folake);
  }

  public getCharacter(characterId: string): CharacterProfile | undefined {
    return this.characters.get(characterId);
  }

  public getAllCharacters(): CharacterProfile[] {
    return Array.from(this.characters.values());
  }

  public getSimulatedHour(): number {
    return this.simulatedHour;
  }

  public setSimulatedHour(hour: number): void {
    this.simulatedHour = Math.max(0, Math.min(24, hour));
    this.updateDiurnalTimeMatch(this.simulatedHour);
  }

  public advanceSimulatedTime(hours: number): void {
    this.simulatedHour = (this.simulatedHour + hours) % 24;
    this.updateDiurnalTimeMatch(this.simulatedHour);
  }

  private updateDiurnalTimeMatch(hour: number): void {
    if (hour >= 6 && hour < 11) {
      this.timeSys.setTimeOfDay('morning');
    } else if (hour >= 11 && hour < 16) {
      this.timeSys.setTimeOfDay('midday');
    } else if (hour >= 16 && hour < 19) {
      this.timeSys.setTimeOfDay('golden_hour');
    } else {
      this.timeSys.setTimeOfDay('night');
    }
  }

  public getCharacterCurrentActivity(characterId: string): ScheduleActivity | undefined {
    const char = this.characters.get(characterId);
    if (!char) return undefined;

    const currentHour = this.simulatedHour;
    for (const item of char.dailySchedule) {
      if (currentHour >= item.startHour && currentHour < item.endHour) {
        return item;
      }
    }
    return char.dailySchedule[0];
  }

  public getCharacterCurrentLocation(characterId: string): string {
    const act = this.getCharacterCurrentActivity(characterId);
    return act ? act.locationId : 'yaba_architect_studio';
  }

  public setCharacterEmotion(characterId: string, emotion: EmotionalState): void {
    const char = this.characters.get(characterId);
    if (char) {
      char.currentEmotion = emotion;
    }
  }

  public getCharactersAtLocation(locationId: string): CharacterProfile[] {
    return this.getAllCharacters().filter((char) => {
      const currentLoc = this.getCharacterCurrentLocation(char.id);
      return currentLoc === locationId;
    });
  }

  public updateSocialTrust(fromCharId: string, toCharId: string, delta: number): void {
    const char = this.characters.get(fromCharId);
    if (!char) return;
    const rel = char.socialGraph.find((r) => r.targetCharacterId === toCharId);
    if (rel) {
      rel.trustScore = Math.max(-100, Math.min(100, rel.trustScore + delta));
    }
  }
}

export const characterSimulationSystem = CharacterSimulationSystem.getInstance();
