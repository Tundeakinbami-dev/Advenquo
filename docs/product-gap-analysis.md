# Advenquo: Product Gap Analysis

**Date:** October 25, 2026  
**Auditor:** Principal Software Architect & Technical Lead  
**Scope:** Evaluation of repository against the 16 MVP Acceptance Criteria and the 4-layer gameplay architecture.

---

## 1. Evaluation Against the 16 MVP Acceptance Criteria

| # | Acceptance Criterion | Pre-Audit Baseline | Target MVP Requirement | Gap Severity | Resolution Strategy |
|---|---|---|---|---|---|
| **1** | Enter Advenquo and choose interests and challenge level | Missing. Loads straight to 3D room. | Onboarding profile selection: interest tags (Arts, Language, Geography, Innovation) & challenge tier (Explorer, Apprentice, Scholar). | High | Build onboarding modal and profile initialization system in game state. |
| **2** | Open an interactive world map | Missing. | Global Map view representing Africa/Nigeria with playable status, locked regions, and preview badges. | High | Implement Layer A: Global Map with SVG/interactive canvas and territory nodes. |
| **3** | Explore Nigerian destination with 2 distinct districts | Missing. Only 1 static table room existed. | Nigeria destination with two distinct playable environments: **Ìsàlẹ̀ Èkó (Historic Heritage & Arts Quarter)** and **Yaba (Tech & Creative Hub)**. | High | Implement Layer B: Multi-district local exploration view with POIs and environmental context. |
| **4** | Inspect locations and discover interactive POIs | Partially Present. 4 objects on a table. | Rich interactive Points of Interest across districts with contextual dialogues, visual inspection, and clues. | Medium | Connect district POIs to narrative clues, cultural context, and mission gates. |
| **5** | Start & complete 3 distinct mission types | Missing. Only a click-counter existed. | Support: (1) **Contextual Language Interaction** (greetings/honorifics), (2) **Cultural/Historical Investigation** (Adire motifs/oral history), (3) **Geography/Practical Navigation** (lagoon transport routes & planning). | Critical | Implement Layer D: Deterministic Mission Engine with data contracts and validators. |
| **6** | Encounter meaningful choices, hints, feedback & consequences | Missing. Fact cards auto-opened on click. | Branching dialogue, contextual hints (using clarity tokens or adaptive assistance), failure retry without harsh penalties. | High | Build adaptive hint runner, step validation rules, and explanation feedback cards. |
| **7** | Enter at least one selected immersive 3D encounter | Present. Seated table scene with 4 artifacts. | Integrated 3D artifact inspection encounter invoked seamlessly from relevant district mission with exit return flow. | Low | Connect existing IWSDK 3D table scene as a focused Layer C encounter with a defined objective and return path. |
| **8** | Receive a clear explanation of what was learned | Minimal. Only brief fact card text. | Comprehensive completion recap summarizing linguistic terms, cultural history, and practical takeaways. | Medium | Build Mission Completion Summary and Educational Debrief modal. |
| **9** | Save discoveries in personal journal & Culture Passport | Missing. | Persistent Culture Passport recording discovered stamps, linguistic mastery, and journal notes. | High | Implement persistent Culture Passport and Discovery Journal module. |
| **10** | Earn validated achievements & progression | Missing. No progression or achievement system. | XP progression, Guardian rank curve, and anti-tamper validated achievements. | High | Implement Progression Engine with level thresholds and validated achievement unlocks. |
| **11** | Open a dedicated World Now hub | Missing. | First-class World Now discovery portal presenting contemporary developments. | High | Build World Now Hub UI with filtering, category tags, and verified source cards. |
| **12** | Read sourced, dated & reviewed contemporary story | Missing. | Contemporary stories citing real publishers, author dates, verification timestamps, and editorial review badges. | Critical | Implement Sourced Content Engine with authentic Nigerian developments (e.g. Lagos Rail Mass Transit Blue Line, Great Green Wall reforestation). |
| **13** | Discover an optional mission connected to that story | Missing. | World Now story directly links to an optional in-game investigation mission (e.g. Sustainable Urban Transit challenge). | High | Wire story ID references into mission definitions to launch current-affairs adventures. |
| **14** | Distinguish verified facts from uncertainty & fiction | Missing. | Clear UI indicators differentiating verified historical/contemporary facts, developing news, and gameplay fiction. | High | Add explicit classification tags (`[Verified Fact]`, `[Developing Story]`, `[Gameplay Scenario]`). |
| **15** | Leave game and resume progress later | Missing. State wiped on page reload. | LocalStorage/IndexedDB state persistence with versioning, auto-save, and reset options. | High | Build `StorageManager` to serialize/hydrate player profile, passport, and active missions. |
| **16** | Core experience usable on desktop/mobile browser | Partially Present. 3D room renders, but UI is 3D spatial only. | Responsive hybrid shell allowing complete 2D desktop/mobile gameplay while providing one-click launch into WebXR. | High | Implement responsive 2D/3D hybrid UI overlay with graceful WebXR entry/exit bridges. |

---

## 2. Layer-by-Layer Architectural Gap Analysis

```
┌────────────────────────────────────────────────────────┐
│ Layer A: Global Map (Current: 0% → Target: 100%)       │
│ Gap: No world map, no country selection, no status flags.│
├────────────────────────────────────────────────────────┤
│ Layer B: Local Exploration (Current: 15% → Target: 100%)│
│ Gap: Only 1 table room; missing districts & POIs.      │
├────────────────────────────────────────────────────────┤
│ Layer C: Immersive 3D (Current: 75% → Target: 100%)    │
│ Gap: Present but disconnected; lacks mission linkage.  │
├────────────────────────────────────────────────────────┤
│ Layer D: Mission Engine (Current: 0% → Target: 100%)    │
│ Gap: No mission runner, no validation, no dialogue trees.│
└────────────────────────────────────────────────────────┘
```

### Layer A: Global Map
- **Current State:** Non-existent. Application booted immediately into a Three.js canvas.
- **Required State:** An interactive global navigation interface focusing on Nigeria as the inaugural playable destination, while displaying preview indicators for future destinations (Nile Valley, Kyoto, Andean Highlands).

### Layer B: Local District Exploration
- **Current State:** Confined to a single table with 4 items.
- **Required State:** Two distinct, evocative districts in Nigeria:
  1. **Ìsàlẹ̀ Èkó (Heritage Quarter)**: Historic heart of Lagos, featuring master dye pits (Adire craft), royal palace grounds (Iga Idunganran), and drum guilds (Gangan oral traditions).
  2. **Yaba (Innovation & Transit Corridor)**: Modern Lagos creative hub, featuring the electric Blue Line light rail, tech hubs, and contemporary eco-design.

### Layer C: Immersive 3D Encounters
- **Current State:** Procedural models (`adire-cloth`, `talking-drum`, `calabash`, `kola-nut`) arranged in a spatial scene.
- **Enhancement Required:** Keep the seated 3D encounter intact, but trigger it dynamically when the player engages in an artifact inspection mission or POI. Provide an intuitive "Return to Exploration" button and HUD status.

### Layer D: Reusable Mission Engine
- **Current State:** Completely absent.
- **Required State:** A data-driven engine supporting:
  - Strongly typed mission schemas with step types: `dialogue`, `investigation`, `challenge`, `spatial_inspection`, `decision`.
  - Deterministic step completion validation.
  - Adaptive hint delivery.
  - Sourced educational debriefing.

---

## 3. Learning & Adaptive Skill Engine Gaps
- **Skill Tracking:** Missing. Need tracking for:
  - `languageComprehension`: Yoruba greetings, honorifics, transactional terms.
  - `culturalInterpretation`: Textile symbolism, oral communication, ceremonial customs.
  - `geographicReasoning`: Urban waterways, transport planning, regional geography.
  - `evidenceEvaluation`: Sourced fact analysis, separating truth from rumor.
- **Adaptive Guidance:** Players struggling with dialogue or navigation must receive contextual hints rather than punitive failure blocks.

---

## 4. World Now & Editorial Integrity Gaps
- **Authenticity:** Prior docs proposed AI generating news. This violates safety and factual integrity rules.
- **Solution:** A curated editorial pipeline of verified, dated, real-world Nigerian developments:
  1. *Lagos Rail Mass Transit (LRMT) Blue Line Electrification & Expansion* (Sources: Lagos Metropolitan Area Transport Authority, verified 2024–2026).
  2. *Great Green Wall & Sahelian Agroforestry Initiative* (Sources: UN Convention to Combat Desertification / African Union).
- **Metadata:** Each story carries `storyId`, `headline`, `summary`, `category`, `publisher`, `sourceUrl`, `publishedAt`, `verifiedAt`, `editorialStatus` (`PUBLISHED`), and `linkedMissionId`.

---

## 5. Summary of Priority Interventions
1. Implement the **Mission Engine and Content Schemas** with unit test coverage.
2. Implement the **World Now Hub** and curated sourced articles with linked missions.
3. Build the **Hybrid Game Shell** (Layer A Global Map, Layer B Multi-District Navigation, Layer C 3D Encounter Bridge, Culture Passport, Discovery Journal).
4. Establish persistent player state in `LocalStorage`.
5. Write automated unit and integration tests to verify all 16 acceptance criteria.
