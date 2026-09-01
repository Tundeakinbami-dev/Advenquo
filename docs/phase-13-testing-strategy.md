# Culture Kingdom — Phase 13: Testing Strategy

**Scope:** the whole system. Every subsystem has: unit tests, integration tests, E2E tests, content-validation tests, non-functional tests, and a fail-safe posture: incomplete or unreviewed content must fail safe (not render) rather than render wrong.

---

## 1. Unit Tests

- Progression math: XP→rank curve is monotonic; ranks are config, not code.
- Mastery model: stages promote only through spaced, varied encounters; regression after long gaps drops one stage.
- SRS scheduler: due items appear in quest gates; record exposure updates stage and schedule.
- Quest state machine: transitions (locked→available→active→completed; failed is retryable at the failed step, never to the beginning).
- Dialogue runner: conditions, gates, rewards.
- Challenge evaluation per type.

---

## 2. Integration Tests

- Auth flows: anonymous play, upgrade to full account, parental consent gating.
- Content publication: pack import validates manifest, blocks unpublished content from the read API.
- Quest execution against a sample pack.

---

## 3. E2E Tests (the four player journeys)

1. New player → first region completion.
2. Mastery model demonstrably spaces reviews (no one-shot mastery).
3. Adding a hypothetical second language pack requires **zero engine code changes** (Phase 14 test).
4. Mastery model demonstrably spaces reviews (no one-shot mastery).
5. Child-safety defaults active (Phase 15 checklist).

---

## 4. Content-Validation Tests

- Manifest validation, per-type JSON schema checks.
- Every factual item must carry source + reviewer before publication.

---

## 5. Non-Functional Tests

- Poor network, offline states, RTL, long strings, WCAG AA contrast.
- Every screen defines: default, loading, empty, error, offline states.
- Content that fails review or is unpublished renders as **locked**, never as wrong content (fail-safe per Phase 13).

---

## 6. AI Evaluation

- Golden-set regression on cultural accuracy + red-team prompts for child safety; expert sampling per language.

---

## 7. CI

- Every push runs unit + integration tests; pack import validates manifest, blocks unpublished content from the read API.
