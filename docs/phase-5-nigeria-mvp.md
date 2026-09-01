# Culture Kingdom — Phase 5: Nigeria MVP

**Principle:** smallest culturally meaningful scope that proves the game concept. Depth over breadth.

---

## 1. Scope Recommendation

**Launch with ONE culture, ONE language, ONE region cluster (3 scenes), ONE story arc (3 chapters).**

**Language: Yoruba.** **Region: a Yoruba-inspired town** (market, family compound, festival ground).

### Why (against the spec's criteria)

| Criterion | One culture/language/region | Multi-language/region |
|---|---|---|
| Development cost | One pack, one review cycle | N× content + N× expert review |
| Educational value | Deep spaced-repetition on one language beats shallow exposure to three | Shallow |
| Content quality | Expert bandwidth focused | Diluted |
| Cultural authenticity | Deep, sourced, reviewed | Risk of stereotype breadth |
| Player retention | A completable arc in v1 | Unfinished breadth |
| Scalability | Proves the pack pipeline — the actual point of MVP | Proves nothing about pipeline |

The MVP's real deliverable is **the Culture Pack pipeline working end-to-end**: author → review → publish → play → learn. A second language must be provably cheaper than the first (that's the Phase 14 test).

### Why Yoruba first

- Largest single-culture learner base with strong diaspora demand.
- Tonal language → proves the pronunciation/audio architecture (a harder case than French).
- Rich, well-documented material culture (Àsọ òkè, festivals, proverbs) → proves the Culture Engine.
- Existing expert community for review.

---

## 2. MVP Content Matrix

| Layer | Content | Count (target) | Review gate |
|---|---|---|---|
| Language | Core vocabulary (greetings, numbers 1–20, market nouns, verbs) | 60 phrases | Language expert |
| Language | Phrases/dialogue lines | 40 | Language expert |
| Language | Proverbs (sourced, with literal + idiomatic gloss) | 8 | Cultural + language expert |
| Audio | Native-speaker recordings per phrase | 100 (60 phrases + variants) | Language expert + contributor consent |
| Story | Story arc: "The Voice of the Market" | 3 chapters | Narrative + cultural review |
| Quests | Quest A (language), Quest B (culture), Quest C (combined), 2 supporting | 5 | Both experts |
| Culture | Knowledge cards (food, clothing, music, festivals, history, values) | 24 | Cultural expert |
| Culture | Artifacts (Àsọ òkè cloth, calabash, drum, etc.) | 10 | Cultural expert |
| NPCs | Named characters with dialogue trees | 6 | Narrative review |
| Scenes | Market, compound, festival ground | 3 | Art + cultural review |

**Every factual item carries:** source, content owner, reviewer, review status, version, publication status (enforced by the Phase 3 schema).

---

## 3. Launch Region Definition

### Region: Ìlú Ohùn ("Town of the Voice" — fictionalized)

**Environment:** stylized West African town — market square, family compound with veranda, festival ground with drum circle.

**Language:** Yoruba (tonal; Latin script with diacritics).

**Vocabulary themes:** greetings & registers, family terms, market goods & numbers, festival words, verbs of motion/transaction.

**Greetings:** time-of-day set (Ẹ káàárọ̀ / Ẹ káàsán / Ẹ káalẹ́) with elder/peer register distinction — the core teaching spine.

**Characters:**
- Baba Adéwálé — gatekeeper elder (greeting gate)
- Iyá Aláso — master weaver (pattern quest)
- ÌyáẸ̀wà — market trader (numbers/bargaining)
- Túndé — child guide (peer register, tutorial voice)
- Bàbá Ilù — festival drummer (rhythm quest)
- The Companion — fictional guide (hint system, diegetic)

**Stories:** the "Voice of the Market" arc — The Forgetting has silenced the town's drum; the player restores it through language and tradition.

**Traditions:** Àsọ òkè weaving, kúnlẹ̀ (greeting bow), oral storytelling, market day customs.

**Food:** àmàlà, jollof-style rice, ẹ̀wà beans — each a sourced knowledge card.

**Clothing:** Àsọ òkè, ànkárá, gele — cards with scope qualifiers.

**Music:** dùndún/bàtá drumming traditions — rhythm minigame source.

**Festival:** a harvest-style festival (fictionalized composite, clearly scoped) — Quest C setting.

**Historical content:** trade routes, cloth history — sourced, expert-reviewed.

**Quests:** the three GDD exemplar quests + two supporting (market counting, direction-following).

**Mini-games:** rhythm (drum), pattern-weaving, memory-pair (vocabulary), market transaction.

**Rewards:** cloth artifact, festival outfit, drum instrument, badges, clarity feathers.

---

## 4. Explicitly Deferred (not in MVP)

- Additional Nigerian languages (Igbo, Hausa, Pidgin, Tiv, Efik, Edo, Ibibio, Kanuri, Nupe) — enabled progressively via new packs.
- Multi-region Nigeria.
- Social features, leaderboards (flagged off).
- Payments (flagged off).
- Speech-recognition scoring (mic input optional, human-audio primary).

---

## 5. Success Criteria for the MVP

1. A player completes the arc: first greeting → first mastery → region completion (Phase 4 journey).
2. Every factual content item published with source + expert approval.
3. Adding a hypothetical second language pack requires **zero engine code changes** (Phase 14 test).
4. Mastery model demonstrably spaces reviews (no one-shot mastery).
5. Child-safety defaults active (Phase 15 checklist).
