# Culture Kingdom — Phase 11: Audio & Pronunciation

**Rule:** the audio pipeline is language-agnostic. Everything language-specific lives in the Culture Pack.

---

## 1. Audio Sources

| Source | Primary? | Metadata |
|---|---|---|
| Native-speaker recording | yes | speaker pseudonym, license, consent, quality score |
| Synthetic voice | fallback only, flagged | `is_synthetic: true`; never the only source for culturally sensitive languages |

---

## 2. Recording Metadata

Every recording carries: speaker pseudonym, license, consent-on-file flag, quality score, duration, dialect. Consent is required before publication.

---

## 3. Pronunciation Feedback

- Mic capture is optional; human-audio recordings are the primary teaching artifact.
- Speech scoring is provider-agnostic: a threshold from the pack config determines pass/fail.
- Feedback never blocks progression; the pronunciation badge is a reward, not a gate.

---

## 4. Engine Interface (contract for Phase 2)

```
AudioService.Play(recordingID) → stream
AudioService.Score(playerID, phraseID, audio) → score
AudioService.Recordings(phraseID) → []RecordingRef
```

The audio service reads scoring thresholds from the Culture Pack; it never contains language logic.
