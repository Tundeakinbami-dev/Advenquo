# Culture Kingdom — Phase 9: AI System

**Rule:** the AI gateway is content-agnostic. Everything language- or culture-specific lives in the Culture Pack.

---

## 1. Modes

| Mode | Source of truth | Safety posture |
|---|---|---|
| fictional | LLM with persona + boundaries from content | age-appropriate filters, strict conversation boundaries |
| factual | RAG over APPROVED content only | answers cite approved content; model never asserts unreviewed facts |

---

## 2. Hard Rules

1. Cultural **facts** are served only from approved, cited content (RAG over the content store). The model never asserts unreviewed facts.
2. Fictional NPC dialogue is permitted but runs behind age-appropriate safety filters and strict conversation boundaries (no PII solicitation, no unsafe topics).
3. Every AI-assisted *content-creation* draft enters the normal review workflow; AI never publishes.
4. Evaluation: golden-set regression on cultural accuracy + red-team prompts for child safety; expert sampling per language.

---

## 3. Safety Filters

| Filter | Behavior |
|---|---|
| age | age band from profile; blocks unsafe topics for the band |
| boundaries | persona boundaries from content; no PII solicitation, no unsafe topics |
| injection | strip prompt-injection attempts from player-visible text |
| moderation | log + moderate every AI response |

---

## 4. Engine Interface (contract for Phase 2)

```
AIGateway.Dialogue(playerID, npcID, playerAction) → response
AIGateway.Hint(playerID, challengeID) → hint
AIGateway.PronunciationFeedback(playerID, phraseID, audio) → score
```

The AI gateway reads persona and boundary config from the Culture Pack; it never contains culture logic.
