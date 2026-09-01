# Culture Kingdom — Phase 6: Language Engine

**Rule:** the engine is language-agnostic. Everything language-specific lives in the Culture Pack.

---

## 1. Mastery Model

Six stages, promoted only through spaced, varied encounters:

```
introduced → encountered → practiced → understood → recalled → mastered
```

- **introduced:** first presentation inside a quest (never a quiz).
- **encountered:** seen again in a different NPC dialogue or scene.
- **practiced:** player produced or selected it correctly at least once.
- **understood:** correct in a new context (different NPC, different scene).
- **recalled:** correct after a spaced interval without a recent prompt.
- **mastered:** recalled after the longest interval; periodic spot-checks keep it live.

Regression is allowed: after a long gap, an item drops back one stage. The NPC re-teaches naturally — never a scolding quiz screen.

**SRS scheduling:** each phrase carries `due_at`, `interval_seconds`, `ease_factor` (SM-2-style). The quest engine queries due items and weaves them into upcoming NPC dialogue as natural gates, not as a quiz screen.

---

## 2. Challenge Types (engine-generic)

| Type | Engine contract | Content inputs |
|---|---|---|
| select | present N options, evaluate choice | phrase IDs, distractor IDs |
| order | sequence words/segments | ordered phrase segment IDs |
| type | free-text input, normalized compare | expected normalized forms |
| listen | play audio, select/type | audio recording ID, phrase ID |
| speak | mic capture, provider-agnostic scoring | pronunciation ref, threshold |
| match | pair items across columns | paired phrase/artifact IDs |
| rhythm | repeat a pattern | pattern asset ID, tolerance |

All challenge payloads are JSONB in the `challenges` table, validated against a per-type JSON schema. The engine interprets the payload; it never contains language logic.

---

## 3. Language-Specific Concerns (content, not engine)

| Concern | Where it lives |
|---|---|
| Tones | phrase `normalized_form` includes tone marks; audio carries the model |
| Scripts | `scripts` table + `phrase.script` column; font stack per script |
| Word order | challenge `order` payloads encode the target sequence |
| Grammar | introduced through quest context, not rules screens |
| Transliteration | `pronunciations.transliteration` |
| Regional variation | `dialects` + `phrase.dialect_id` |

The engine never assumes English-style grammar. It evaluates challenge payloads; the pack defines what "correct" means for each language.

---

## 4. Engine Interface (contract for Phase 2)

```
LearningEngine.SelectDue(playerID, limit) → []PhraseRef
LearningEngine.RecordExposure(playerID, phraseID, correct bool) → newStage
LearningEngine.MasteryStage(playerID, phraseID) → stage
```

The quest engine calls `SelectDue` when building NPC dialogue gates so due items appear naturally. It calls `RecordExposure` after every gate outcome.
