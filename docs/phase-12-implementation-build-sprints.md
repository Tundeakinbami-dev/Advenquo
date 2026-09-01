# Culture Kingdom — Phase 12: Implementation (Build Sprints)

**Sources:** Phase 0 blueprint, Phase 1 GDD, Phase 2 architecture, Phase 3 schema, Phase 4 design system, Phase 5 Nigeria MVP, Phase 6 language engine, Phase 7 culture engine, Phase 8 quest engine, Phase 9 AI system, Phase 10 content pipeline, Phase 11 audio.
**Posture:** vertical slices. Each sprint is fully functional and tested before the next. Review gates from Phase 2 §9 apply to every sprint.

---

## Sprint 1 — Content foundation
- Schema: all Phase 3 tables as forward migrations.
- JSON Schema for dialogue nodes and challenge payloads.
- Seed the `scripts` table.

## Sprint 2 — Content pipeline
- Pack import: manifest validation, JSON Schema validation per entity, bulk import.
- Review workflow transitions with audit trail; publication immutability triggers.
- Read API serving published content with `content_version`.

## Sprint 3 — Player foundation
- Anonymous play, age selection, profile creation; parental link and consent.
- Progression engine: XP awards, rank curve from config.
- Idempotent reward grants.

## Sprint 4 — Learning engine
- SRS scheduler (SM-2-style), mastery stage transitions, due-item selection.
- Challenge evaluation for all Phase 6 types (select, order, type, listen, speak, match, rhythm).
- Exposure recording wired into challenge outcomes.

## Sprint 5 — Quest engine
- Quest state machine with unlock conditions and memory flags.
- Step execution: arrive, talk, challenge, discover, perform, reward.
- Dialogue runner with condition evaluation and language gates.
- Rewards granted once, idempotently.

## Sprint 6 — Client shell
- The 27-screen navigation, bottom tab bar, back stack.
- Design tokens from Phase 4; component library with all defined states.
- Scene exploration rendering: NPCs, interactables, ambient audio, fireflies.

## Sprint 7 — Challenge surfaces
- All challenge type UIs with hint button and retry.
- Subtitles with mastery-linked fade.
- Audio playback with recording metadata.
- Mic capture behind an optional flag; provider-agnostic scoring interface.

## Sprint 8 — Progression & collection surfaces
- Player level, language progress, culture progress, story chapter screens.
- Collection grid, inventory with lore pages, sacred-item badge.
- Achievements, daily challenges from due SRS items.

## Sprint 9 — AI dialogue
- AI gateway with persona/boundary config from content.
- Fictional dialogue mode with safety filters; factual RAG mode with citations.
- Moderation logging; eval harness with golden sets.

## Sprint 10 — Parental controls & settings
- Guardian gate, session limits, consent, data controls.
- Settings, accessibility options, help explainers.
- Content reporting flow.

## Sprint 11 — Admin dashboard
- Pack list, review queue, publish controls.
- Content reporting triage.

## Sprint 12 — Nigeria pack authoring
- Author the Ìlú Ohùn MVP pack (Phase 5 content matrix) in CMS.
- Both-expert review gates exercised end-to-end.

## Sprint 13 — Testing & non-functional hardening
- Phase 13 strategy executed: unit, integration, E2E, content validation.
- Non-functional: poor network, offline states, RTL, long strings, WCAG AA.
- Phase 14 zero-engine-change expansion test with a hypothetical second pack.

## Sprint 14 — Security & child safety
- Phase 15 checklist executed: parental controls, consent, data minimization, audit logging.
- Threat-model mitigations verified.

## Sprint 15 — Launch
- Phase 16 launch checklist; monitoring, feedback triage.
- Expansion-beyond-Nigeria readiness review (Phase 17).

---

## Review gates (every sprint)

From Phase 2 §9. Each is a rejection criterion:

1. Culture/language conditionals in engine code → rejected.
2. Tree-only content model → rejected.
3. Published content mutated in place → rejected.
4. Payments gating learning content → rejected.
5. Client-side cultural logic → rejected.
6. AI as source of truth for cultural facts → rejected.
7. Missing expert review gate → rejected.
8. Per-platform business logic → rejected.

## Sprint exit checklist

- All tests green (unit, integration, E2E).
- Phase 13 non-functional checks pass.
- Phase 14 zero-engine-change expansion test passes (Sprint 13).
