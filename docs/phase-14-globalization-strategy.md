# Culture Kingdom — Phase 14: Globalization Strategy

**Goal:** adding a new culture pack requires **zero engine code changes** (Phase 14 test).

---

## 1. Expansion Process

1. Research → cultural consultation → content creation → language validation → translation → audio recording → game design → expert review → QA → localization → publication → monitoring.
2. Every factual item must carry source + reviewer before publication.

---

## 2. Culture Pack (see Phase 0 §5)

The pack is the expansion mechanism. Adding a pack must be provably cheaper than the first (the Phase 14 test).

---

## 3. Explicit Handling

- Diaspora, minority/endangered languages, dialects, RTL, non-Latin scripts, historical cultures.
- Scope qualifiers prevent overgeneralization.
- Sacred content is honored: never tradeable, never consumable, always cited.

---

## 4. Language-Specific Concerns (content, not engine)

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

## 5. Success Test

1. Adding a hypothetical second language pack requires **zero engine code changes**.
2. Mastery model demonstrably spaces reviews (no one-shot mastery).
3. Child-safety defaults active.
