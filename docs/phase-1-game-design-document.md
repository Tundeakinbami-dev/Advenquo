# Culture Kingdom — Phase 1: Game Design Document (GDD)

**Status:** Design deliverable. No code.
**Upstream:** Phase 0 Technical Blueprint (`docs/phase-0-technical-blueprint.md`)
**Downstream:** Phase 2 (Architecture) consumes every mechanic defined here as a system requirement.

---

## 1. Core Gameplay

Culture Kingdom is a third-person, narrative-driven exploration adventure. The player is a **Cultural Guardian** traveling stylized regions inspired by real cultures. Every mechanic exists to make the player *need* language and cultural knowledge to progress.

**Core pillars:**
1. Language is the key that opens doors (literally and narratively).
2. Culture is discovered through interaction, never read from a wall.
3. Story stakes make forgetting feel like a real loss.
4. Mastery is earned through repeated meaningful use, not quizzes.

**Core loop (one session, 10–20 min):**
Enter region → meet NPC → language gate → explore/discover → quest step → cultural discovery → reward → next unlock.

---

## 2. Core Game Loop (formal)

```
┌──────────────────────────────────────────────────┐
│ ARRIVE in region scene                            │
│   → environmental storytelling hook               │
│ MEET NPC → dialogue (target language)             │
│   → comprehension gate (language mechanic)        │
│ EXPLORE → discover cultural artifact / practice   │
│   → knowledge card + Culture XP                   │
│ QUEST STEP → use language/culture to act          │
│   → success: Quest XP + reward                    │
│   → failure: low-pressure retry with hint         │
│ UNLOCK → next scene / next region fragment        │
│ RECOVER VOICE (region climax) → story beat        │
└──────────────────────────────────────────────────┘
```

---

## 3. Story Architecture

- **Overarching mythology (fictional):** "The Forgetting" erases languages/cultures; the Book of Voices shattered; each region holds a lost Voice.
- **Regional arcs:** each Culture Pack ships one complete story arc (3–5 chapters) ending in Voice recovery.
- **Real culture layer:** every factual element (proverb, food, festival) is content-sourced, reviewed, and attributed — never invented by the fiction.
- **Tone rule:** real cultures are living and modern, not frozen in the past or exoticized.

**Arc template:** Arrival → Misunderstanding → Trust earned through language → Cultural revelation → The Voice recovered → Region restored.

---

## 4. World & Region Structure

- **World:** the map of all Culture Packs.
- **Country:** grouping of regions (Nigeria first).
- **Cultural Region:** a playable scene cluster (e.g., a Yoruba-inspired town market and homestead).
- **Scene:** the smallest explorable unit — a screen/area with NPCs, interactables, and ambient audio.
- **Unlock model:** regions unlock via Voice recovery or quest completion; later regions require mastery thresholds (spaced-repetition enforced).

Regions are **content**: a region manifest declares its scenes, NPCs, ambient audio, language, and quest bindings.

---

## 5. Character & NPC System

- **Companion (guide):** a recurring fictional character who translates when the player is stuck (a diegetic hint system — costs in-game "clarity feathers," not real money).
- **Region NPCs:** 5–8 per region; each has a role (greeting elder, market trader, storyteller, child, artisan).
- **NPC memory:** NPCs remember quest progress and adjust dialogue ("You already greeted me properly — welcome back!").
- **NPC speech model:** NPCs speak the target language with subtitles; subtitles phase out as mastery grows (mastery-linked, not difficulty-linked).

NPC definitions are content: name, role, portrait, voice set, dialogue tree reference, memory flags.

---

## 6. Dialogue System

- **Tree-based** with condition checks (has item, mastery ≥ X, quest flag).
- **Language gates:** certain branches require the player to choose/produce the correct target-language phrase.
- **Branching types:** informational, gating (must succeed to proceed), optional (flavor/reward), and memory callbacks.
- **Localization:** dialogue is content; UI chrome is i18n.

---

## 7. Language-Learning Mechanics

Each mechanic maps to a real interaction (per the spec's philosophy — learn because you need it):

| # | Mechanic | Player does | Learns | Fun factor | Difficulty ramp | Reward |
|---|---|---|---|---|---|---|
| 1 | **Greeting gate** | Choose the right greeting for an elder vs. a peer | Register, greetings | Social risk (respect!) | More NPCs, more registers | NPC trust, access |
| 2 | **Market trade** | Count and name goods to buy | Numbers, nouns | Real transaction | Larger sums, bargaining | Item, discount |
| 3 | **Direction follow** | NPC gives verbal directions; player navigates | Spatial language, verbs | Mini-map puzzle | Longer, more steps | Shortcut, secret |
| 4 | **Task completion** | Follow multi-step instructions | Imperatives, sequence words | Competence | More steps, fewer repeats | Tool, quest progress |
| 5 | **Clue decode** | Riddle/proverb hints at a location | Proverbs, idioms | Detective moment | Harder proverbs | Key, lore |
| 6 | **Bargain dialogue** | Negotiate price with phrases | Negotiation phrases | Social win | Stubborn traders | Better price |
| 7 | **Puzzle input** | Type/select words to unlock mechanism | Spelling, vocabulary | Tactile | Longer words, no word bank | Mechanism opens |
| 8 | **Story recall** | Answer questions about a told story | Listening comprehension | Narrative payoff | Longer stories | Story fragment |
| 9 | **Listening challenge** | Identify spoken word among options | Ear training | Audio game | Faster, more similar words | Clarity feather |
| 10 | **Speaking challenge** | Repeat phrase (mic, optional) | Pronunciation | Performance | Harder phrases | Pronunciation badge |

**Mastery model (6 stages):** introduced → encountered → practiced → understood → recalled → mastered. Promotion requires *spaced, varied* encounters — never one correct answer. Regression is possible after long gaps (low-pressure: NPCs re-teach, never scold).

**Spaced repetition engine:** each vocabulary item has a schedule (introduce → 1 encounter → review after N minutes → recall test → mastered). The quest engine *requests* items due for review and weaves them into upcoming NPC dialogue naturally.

---

## 8. Cultural-Learning Mechanics

| Mechanic | How it works | Discovery type |
|---|---|---|
| **Knowledge cards** | Interacting with an artifact/NPC reveals a sourced, reviewed card | Collection |
| **Festival events** | Time-limited in-game festivals; participation teaches customs | Event |
| **Cooking/crafting minigames** | Prepare a dish / weave a pattern following authentic steps | Procedural |
| **Music rhythm** | Play a traditional rhythm pattern | Rhythm |
| **Oral history** | Elder tells a story; player retells key beats | Narrative |
| **Environmental storytelling** | Objects in scenes are inspectable and sourced | Exploration |

**Knowledge card schema (content):** title, description, media, language, region, community, source citation, reviewer, age suitability, publication status. Cards distinguish "some communities practice…" from universal claims — the content model carries a **scope qualifier** field.

---

## 9. XP & Progression

- **Four XP tracks:** Language XP, Culture XP, Quest XP, Exploration XP.
- **Cultural Guardian Level:** aggregate of all tracks; monotonic curve; ranks: Visitor → Explorer → Cultural Friend → Community Keeper → Language Guardian → Culture Guardian → Master of Voices.
- **No pay-to-win:** all XP comes from play; payments (future) never grant XP.
- **Mastery gates:** some content requires *demonstrated retention* (spaced-repetition due items completed), preventing binge-then-forget.

---

## 10. Rewards & Inventory

- Cosmetics (clothing, character customization), cultural artifacts (collectible, sourced), badges, titles, story chapters, instruments, traditional games, companion characters, knowledge cards.
- **Sacred-content rule:** items flagged sacred in content are never tradeable, never consumable, never cosmetic-only gag items. They are honored collectibles with their source citation attached.
- **Inventory:** bounded slots; artifacts have lore pages; duplicates convert to "clarity feathers" (hint currency).

---

## 11. Achievements & Daily Challenges

- **Achievements:** milestone-based (first greeting, first Voice, 7-day streak, all cards in a region).
- **Daily challenges:** 1–2 per day, generated from due-for-review vocabulary + one cultural card — never new content, always consolidation.

---

## 12. Exploration & Mini-games

- Scenes contain hidden interactables (fireflies of knowledge) that reward Exploration XP.
- Minigames: rhythm (music), pattern-weaving (craft), memory-pair (vocabulary), sorting (categorical cultural knowledge).
- All minigames are content-configurable (patterns, items, and rules come from the pack).

---

## 13. Difficulty Progression

- **Language:** vocabulary size → utterance length → subtitle fade → distractor count → time pressure (mild).
- **Culture:** card depth → cross-referencing (connect two cards to solve) → application (use knowledge in dialogue).
- **Adaptive:** the learning engine widens/narrows spaced-repetition intervals based on recall accuracy.

---

## 14. Multiplayer / Social — EXPLICITLY OUT OF SCOPE FOR v1

Per the master prompt's instruction, this is decided here rather than left undecided: **v1 is single-player.** No chat, no leaderboards visible to players, no user-generated content. The architecture reserves an identity/social boundary in the API, but no social features ship in v1. Leaderboard tables exist in the schema but are feature-flagged off. Revisit post-v1 with child-safety review.

---

## 15. Accessibility

- Subtitles always available; audio never the sole channel.
- Colorblind-safe palettes; scalable text; one-handed play; screen-reader labels on UI chrome.
- Motor: no timing-critical inputs required for progression (rhythm minigames are optional rewards).
- Cognitive: hints always available; failure never blocks progression permanently.

---

## 16. Child Safety (design level)

- No free-text input anywhere in v1.
- No external links; no user-to-user contact.
- Parental controls: session limits, spending locks (future), content visibility by age band.
- AI NPCs have strict boundaries (see Phase 9/15).

---

## 17. Failure States & Replayability

- **Language failure:** NPC gently re-teaches; the gate stays open after 2 attempts with a hint; mastery schedule adjusts.
- **Quest failure:** retryable; no permadeath; no lost progress.
- **Replayability:** region mastery replays (perfect run), card completion, daily challenges, festival events, Voice replays.

---

## 18. Content Expansion Model

Every mechanic above reads its content from the Culture Pack. Adding Japanese means authoring a Japan pack (scenes, NPCs, dialogues, vocabulary, audio, cards) — **zero engine changes**. The three Nigerian example quests below demonstrate the exact mechanics a French/Japanese/Arabic pack would reuse.

---

## 19. Example Quests (Nigerian content)

### Quest A — Language-focused: "The Greeting That Opens Doors"
**Region:** Yoruba-inspired town (Ìlú Ìfẹ́-inspired). **Language:** Yoruba.
- **Scene:** The player arrives at a family compound. The gatekeeper elder (Baba Adéwálé) will not admit strangers who cannot greet properly.
- **Mechanic chain:** Greeting gate (#1) → the player hears "Ẹ káàárọ̀" (good morning) from a passing child → must choose the correct elder greeting ("Ẹ káàárọ̀, sír") from three options → then produce it in a dialogue choice.
- **Escalation:** Inside, three more family members each expect the correct greeting for the time of day (afternoon "Ẹ káàsán", evening "Ẹ káalẹ́"). Wrong register (peer greeting to an elder) → gentle correction, retry.
- **Cultural beat:** Baba explains *why* elders are greeted first — kneeling/slight bow (kúnlẹ̀) — revealed as a Knowledge Card with source.
- **Reward:** Entry to the compound; Language XP; "Respectful Guest" badge; the elder's trust unlocks the next quest.
- **Engine note:** greetings, registers, and NPC expectations are pack content. A French pack would swap "Bonjour, monsieur" vs. "Salut" — same gate mechanic.

### Quest B — Culture-focused: "The Weaver's Pattern"
**Region:** same town. **Focus:** cultural discovery.
- **Scene:** The market's master weaver (Iyá Aláso) has lost her pattern book pages to "The Forgetting."
- **Mechanic chain:** Explore the market to find 3 pattern fragments (exploration) → each fragment triggers a Knowledge Card about Àsọ òkè weaving (sourced) → the player must reassemble the pattern in a pattern-matching minigame → then *name* the cloth type in Yoruba to claim it (light language touch).
- **Cultural depth:** the card explains that certain patterns historically denote status/occasion — with the scope qualifier "traditionally, in some communities…"
- **Reward:** the woven cloth as an inventory artifact (honored collectible, source cited); Culture XP; the weaver becomes a recurring NPC.
- **Engine note:** pattern assets, card content, and cloth names are pack content.

### Quest C — Combined: "The Festival Drum"
**Region:** same town, during the in-game festival. **Focus:** language + culture together.
- **Scene:** The festival cannot start — the festival drum's rhythm has been forgotten.
- **Mechanic chain:** (1) Ask the drummer what's wrong — listening comprehension in Yoruba; (2) Visit the elder, who tells a proverb about rhythm and community ("Bí a bá kọ orin, a ó máa tẹlẹ ẹlẹ́rin…" — sourced proverb card); (3) Rhythm minigame — repeat the festival pattern (audio-first, culture mechanic #4); (4) Speak the festival greeting to the assembled crowd — speaking challenge, higher register.
- **Climax:** the Voice fragment for this region is recovered when the drum sounds — the story beat ties language + culture + the Book of Voices mythology.
- **Reward:** Voice fragment (story progress), festival outfit (cosmetic), substantial all-track XP.
- **Engine note:** rhythm pattern, proverb, greeting, and festival config are all pack content; the quest *structure* (listen → learn → perform → speak → recover) is engine-generic.

---

## 20. Failure, Replayability, Session Shape

- Failure = re-teach + retry, never dead-end (see §17).
- Sessions target 10–20 minutes: one loop, one quest step, one consolidation.
- Replay: region mastery runs, card completion, daily consolidation challenges.

---

## 21. Content Expansion Contract (for Phase 2)

Every mechanic above declares its content inputs. The Phase 2 architecture must provide:
1. A content store serving all mechanics by ID.
2. A mastery/scheduling service.
3. A dialogue tree runner with condition evaluation.
4. A media service for audio/patterns/portraits.
5. A CMS pipeline with review states.

If a new culture needs anything beyond content + config, the architecture (Phase 2) has failed.
