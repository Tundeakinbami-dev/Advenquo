/**
 * Advenquo: Core Domain Types and Data Contracts
 *
 * Strict, validated TypeScript contracts for game state, missions, progression,
 * world hierarchy, editorial World Now stories, and persistent Culture Passport.
 */

export type ChallengeLevel = 'explorer' | 'apprentice' | 'scholar';

export type InterestTag = 'arts' | 'language' | 'geography' | 'history' | 'innovation' | 'ecology';

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  interests: InterestTag[];
  challengeLevel: ChallengeLevel;
  totalXp: number;
  guardianLevel: number;
  clarityTokens: number;
  createdAt: string;
  lastPlayedAt: string;
}

export interface SkillMastery {
  languageComprehension: number; // 0 - 100
  culturalInterpretation: number; // 0 - 100
  geographicReasoning: number; // 0 - 100
  evidenceEvaluation: number; // 0 - 100
  navigationPlanning: number; // 0 - 100
}

export interface PassportStamp {
  id: string;
  name: string;
  category: 'artifact' | 'language' | 'geography' | 'contemporary';
  destinationId: string;
  districtId: string;
  icon: string;
  unlockedAt: string;
  description: string;
}

export interface LearnedVocabulary {
  term: string;
  phonetic: string;
  englishGloss: string;
  language: string;
  context: string;
  masteryScore: number;
  learnedAt: string;
}

export interface JournalDiscovery {
  id: string;
  title: string;
  category: string;
  summary: string;
  verifiedFact: string;
  sourceAttribution: string;
  discoveredAt: string;
}

export interface CulturePassport {
  stamps: PassportStamp[];
  vocabulary: LearnedVocabulary[];
  journal: JournalDiscovery[];
  completedMissionIds: string[];
}

export type MissionType = 'language' | 'investigation' | 'geography_navigation' | 'contemporary_world_now';

export interface LearningObjective {
  skill: keyof SkillMastery;
  targetDescription: string;
  xpReward: number;
}

export interface DialogueChoice {
  id: string;
  text: string;
  requiresLanguageSkill?: boolean;
  isCorrect?: boolean;
  feedback: string;
  explanation: string;
}

export interface InvestigationClue {
  id: string;
  title: string;
  description: string;
  sourceContext: string;
}

export type MissionStepType = 'dialogue' | 'investigation' | 'challenge' | 'spatial_inspection' | 'decision';

export interface MissionStep {
  id: string;
  ordinal: number;
  type: MissionStepType;
  title: string;
  prompt: string;
  context: string;
  characterName?: string;
  characterRole?: string;
  dialogueChoices?: DialogueChoice[];
  clues?: InvestigationClue[];
  spatialTargetId?: string; // Links to procedural 3D entity if spatial_inspection
  hint: string;
  adaptiveHelp?: string;
  successOutcome: string;
  retryGuidance: string;
}

export interface MissionReward {
  xp: number;
  passportStamp?: Omit<PassportStamp, 'unlockedAt'>;
  vocabulary?: Omit<LearnedVocabulary, 'learnedAt' | 'masteryScore'>[];
  journalDiscovery?: Omit<JournalDiscovery, 'discoveredAt'>;
  skillsAdvancement: Partial<Record<keyof SkillMastery, number>>;
}

export interface SourceCitation {
  publisher: string;
  title: string;
  url: string;
  publishedDate: string;
  verifiedDate: string;
}

export interface CulturalDebrief {
  summary: string;
  keyVocabulary: string[];
  culturalTakeaway: string;
  realWorldContext: string;
}

export interface MissionDefinition {
  id: string;
  version: string;
  title: string;
  type: MissionType;
  destinationId: string;
  districtId: string;
  difficulty: ChallengeLevel;
  estimatedMinutes: number;
  learningObjectives: LearningObjective[];
  introContext: string;
  steps: MissionStep[];
  rewards: MissionReward;
  culturalDebrief: CulturalDebrief;
  sources: SourceCitation[];
}

export type VerificationLevel = 'VERIFIED_FACT' | 'DEVELOPING_NEWS' | 'HISTORICAL_RECORD';
export type EditorialStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface WorldNowStory {
  id: string;
  headline: string;
  summary: string;
  category: 'Infrastructure & Transit' | 'Ecology & Agriculture' | 'Arts & Heritage' | 'Technology & Innovation';
  publisher: string;
  sourceUrl: string;
  publishedAt: string;
  verifiedAt: string;
  editorialReviewAt: string;
  status: EditorialStatus;
  verificationLevel: VerificationLevel;
  uncertaintyNotes?: string;
  linkedMissionId?: string;
  linkedDistrictId?: string;
  tags: string[];
  factualHighlights: string[];
}

export type DestinationStatus = 'PLAYABLE' | 'PREVIEW' | 'LOCKED';

export interface PointOfInterest {
  id: string;
  name: string;
  localName?: string;
  type: 'heritage' | 'market' | 'transit' | 'craft' | 'civic';
  coordinates: [number, number]; // Percent coordinates [x%, y%] within district map
  description: string;
  culturalSignificance: string;
  audioSnippet?: string;
  linkedMissionId?: string;
  spatialAssetId?: string;
}

export interface District {
  id: string;
  destinationId: string;
  name: string;
  localName: string;
  tagline: string;
  description: string;
  theme: string;
  pointsOfInterest: PointOfInterest[];
  availableMissionIds: string[];
}

export interface Destination {
  id: string;
  name: string;
  countryCode: string;
  regionName: string;
  status: DestinationStatus;
  description: string;
  districts: District[];
  lat: number;
  lng: number;
}

export interface ActiveMissionState {
  missionId: string;
  currentStepIndex: number;
  completedStepIds: string[];
  attemptsPerStep: Record<string, number>;
  hintsRequested: Record<string, boolean>;
  isCompleted: boolean;
  startedAt: string;
}

export interface GameSaveState {
  version: number;
  profile: PlayerProfile;
  skills: SkillMastery;
  passport: CulturePassport;
  activeMission: ActiveMissionState | null;
  selectedDestinationId: string;
  selectedDistrictId: string;
  activeSpatialEncounterId: string | null;
}
