# Advenquo: Implementation Roadmap & Technical Plan

**Date:** October 25, 2026  
**Status:** In Progress — Active Implementation  
**Lead:** Principal Software Architect & Technical Lead  

---

## 1. Architectural Strategy: The Hybrid Exploration Shell

To satisfy all 16 MVP acceptance criteria while preserving the IWSDK WebXR 3D capabilities, Advenquo employs a **Hybrid Adventure Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADVENQUO GAME SHELL                             │
│                                                                        │
│  ┌────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Navigation Bar     │  │ World Map / District / Journal / Now UI  │  │
│  │ - Global Map (A)   │  │                                          │  │
│  │ - Districts (B)    │  │ [ Responsive 2D / Canvas Exploration ]   │  │
│  │ - 3D Encount (C)   │  │                                          │  │
│  │ - World Now        │  │                                          │  │
│  │ - Culture Passport │  │                                          │  │
│  └────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Layer C: IWSDK WebXR 3D Engine                                   │  │
│  │ (Canvas container: #scene-container, Three.js, ECS, Seated VR)   │  │
│  │ Active during 3D artifact inspections and spatial missions       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Core Services: Deterministic Mission Engine, Sourced World Now,  │  │
│  │ Learning & Skill Tracker, Persistent Storage, Audio Manager      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Layer A: Global Map**: Interactive world map prioritizing Nigeria (Ìsàlẹ̀ Èkó & Yaba districts), showing unlock states, preview-only international destinations (Nile Valley, Kyoto, Andean Highlands), and contemporary story pins.
2. **Layer B: Local District Exploration**: Visual 2D exploration with Points of Interest (POIs), resident dialogues, cultural investigations, and navigation puzzles across two distinct Nigerian environments.
3. **Layer C: Immersive 3D Encounters**: Seamlessly bridges into the existing IWSDK Three.js scene (`#scene-container`) when inspecting physical artifacts (Adire cloth, Talking drum, Calabash, Kola nut), equipped with comfortable seated VR ergonomics and one-click exit back to district exploration.
4. **Layer D: Reusable Mission Engine**: Strong TypeScript contracts for multi-step missions:
   - **Contextual Language**: Yoruba greetings (`Ẹ káàárọ̀`, `Ẹ káasán`), honorifics, and market transactions.
   - **Cultural & Historical Investigation**: Deciphering Adire geometric motifs and Gangan drum tonal cadences.
   - **Geographical & Practical Navigation**: Lagos transit planning on the electrified Blue Line.
5. **World Now Hub**: Editorial-grade sourced news with verified publication dates, source links, and linked playable missions.
6. **Culture Passport & Journal**: Persistent record of discoveries, earned badges, linguistic vocabulary, and real-world insights.

---

## 2. Phased Implementation Breakdown

### Phase 1: Stabilization & Core Data Contracts
- Define TypeScript interfaces in `src/game/types.ts`:
  - `PlayerProfile`, `SkillMastery`, `CulturePassport`, `DiscoveryJournalEntry`.
  - `MissionDefinition`, `MissionStep`, `MissionOutcome`, `MissionType`.
  - `WorldNowStory`, `EditorialStatus`, `SourceCitation`.
  - `Destination`, `District`, `PointOfInterest`.
- Implement `src/game/storage.ts` for safe, schema-versioned persistence.

### Phase 2: Deterministic Mission Engine
- Implement `src/game/mission-engine.ts`:
  - Objective verification with zero AI hallucination.
  - Step progression: choice validation, hint delivery, educational debriefing.
  - Reward calculation and skill progression math.
- Author 3 core Nigeria missions + 1 World Now connected mission in `src/game/missions-data.ts`.

### Phase 3: World Now Sourced Content System
- Implement `src/game/world-now-data.ts`:
  - Authentic, verified contemporary developments (Lagos Blue Line Rail, Great Green Wall).
  - Editorial metadata: publisher, source URL, publication date, verification date, status.
  - Strict classification flags: `[Verified Fact]`, `[Developing News]`, `[Gameplay Scenario]`.

### Phase 4: World & District Navigation Content
- Implement `src/game/world-data.ts`:
  - Global map configuration (Nigeria active; Nile Valley, Kyoto, Andes preview).
  - Two distinct districts: **Ìsàlẹ̀ Èkó (Heritage Quarter)** and **Yaba (Tech & Transit Corridor)**.
  - Interactive Points of Interest with cultural context, audio hooks, and character dialogues.

### Phase 5: Hybrid Game UI & 3D Bridge
- Build the integrated UI in `src/game/ui.ts` and `src/game/game-shell.ts`:
  - Top navigation bar (Map, District, 3D Encounters, World Now, Passport).
  - Onboarding modal (interest selection, challenge tier).
  - Interactive Map and District exploration views.
  - Mission runner modal with dialogue choices, hints, and completion recap.
  - 3D Encounter bridge: shows/hides the IWSDK `#scene-container` with clean controls and fallback.

### Phase 6: Automated Verification & Testing Suite
- Create unit and integration tests verifying:
  - Mission state transitions, step completion, and reward idempotency.
  - Progression calculation and skill mastery curves.
  - World Now editorial status filters and source citation integrity.
  - Persistence save/load cycles and error handling.
  - Full player journey integration test.

### Phase 7: Meta Quest VR Strategy Documentation
- Author:
  - `docs/vr-strategy.md`: Architecture trade-offs, Meta Quest Browser vs native APK, IWSDK integration.
  - `docs/vr-interaction-spec.md`: Seated ergonomics, hand-tracking pinch, controller raycasting, comfortable viewing frustum.
  - `docs/meta-quest-validation.md`: VRC compliance checklist, frame budget analysis, and hardware testing instructions.

---

## 3. Milestones and Checkpoints

| Milestone | Deliverables | Verification Criterion |
|---|---|---|
| **M1: Data Contracts & Storage** | `src/game/types.ts`, `src/game/storage.ts` | Typecheck passes; storage unit tests pass. |
| **M2: Mission Engine & Content** | `mission-engine.ts`, `missions-data.ts` | 4 missions playable end-to-end with unit test validation. |
| **M3: World Now & Districts** | `world-now-data.ts`, `world-data.ts` | Sourced stories verified; 2 districts with POIs authored. |
| **M4: Hybrid UI Shell** | `game-shell.ts`, `ui.ts`, styling | Interactive in standard browser; switches between map, districts, journal, and 3D. |
| **M5: 3D Encounter Bridge** | Seamless WebXR room toggling | 3D table scene operable; exit returns to exploration. |
| **M6: Verification & Docs** | Test suite + VR documentation | All unit and journey tests pass; production build green. |
