# Culture Kingdom — Phase 8: Quest & Story Engine

**Rule:** the engine is content-agnostic. Quests, dialogue, and story arcs live in the Culture Pack; the engine executes them.

---

## 1. Quest State Machine

Per-player, per-quest states:

```
locked → available → active → completed
                     ↘ failed (retryable, never terminal)
```

- `locked`: unlock condition unmet (previous quest, mastery threshold, region state).
- `available`: unlock condition met; player may start it.
- `active`: at least one step begun; progress tracked by step ordinal.
- `completed`: all steps done; rewards granted once.
- `failed`: retryable; the quest resets to `active` at the failed step, never to the beginning.

Storage: `quest_states(player_id, quest_id, state, current_step, memory_flags)`.

---

## 2. Step Types (engine-generic)

| Type | Engine contract | Content inputs |
|---|---|---|
| arrive | player enters a scene | scene ID |
| talk | dialogue node reached | NPC ID, dialogue node ID |
| challenge | language or cultural challenge passed | challenge ID |
| discover | knowledge card revealed | card ID |
| perform | minigame completed | minigame ID, threshold |
| reward | grant reward | reward ID |

All step payloads are JSONB in `quest_steps.config`, validated against a per-type JSON schema. The engine interprets the payload; it never contains culture logic.

---

## 3. Objective Evaluation

Each quest declares weighted learning objectives (`quest_learning_objectives`). Completing a step advances the matching objectives. A quest completes when all steps are done; rewards grant once, idempotently.

---

## 4. Dialogue Execution

- Dialogue trees are JSONB content: nodes, branches, conditions (has item, mastery ≥ X, quest flag, memory flag), language gates (challenge reference), and rewards.
- The runner evaluates conditions against player state and picks the available branch.
- Language gates embed a challenge reference; passing the gate advances the tree.
- NPC memory flags persist in `quest_states.memory_flags` and feed condition checks.

---

## 5. Story Beats

- A story arc is a sequence of chapters; each chapter unlocks when its `unlock_condition` is met (previous chapter, mastery threshold, Voice state).
- Voice recovery is a story event: `VoiceRecovered` fires when a region's climax step completes; it unlocks the next region and awards story progress.

---

## 6. Engine Interface (contract for Phase 2)

```
QuestEngine.Start(playerID, questID) → state
QuestEngine.AdvanceStep(playerID, questID) → state
QuestEngine.CompleteStep(playerID, questID, ordinal, outcome) → rewards
QuestEngine.State(playerID, questID) → state
DialogueRunner.Run(playerID, npcID, choice) → node, gate, rewards
```

The quest engine reads due SRS items when building NPC dialogue gates so due items appear naturally.
