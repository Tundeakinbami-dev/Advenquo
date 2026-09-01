# Culture Kingdom — Phase 7: Culture Engine

**Rule:** the culture engine is culture-agnostic. Everything culture-specific lives in the Culture Pack.

---

## 1. Knowledge Cards

A knowledge card is the atomic cultural discovery unit:

```json
{
  "id": "asooke-weaving",
  "pack_id": "nigeria-01",
  "title": "Àsọ òkè weaving",
  "description": "Hand-woven cloth traditionally made on narrow strip looms.",
  "scope_qualifier": "some_communities",
  "region_id": "region-ilu-ohun",
  "language_id": "yo",
  "media": [{"type": "image", "url": "..."}, {"type": "audio", "url": "..."}],
  "sources": [{"citation": "...", "source_type": "book", "url": "..."}],
  "reviewers": ["..."],
  "age_suitability": "8_12",
  "is_sacred": false
}
```

Rules:
- Every card carries at least one source citation before it can be published.
- Scope qualifier prevents overgeneralization ("some communities practice…").
- Sacred content is honored: it renders with a distinct badge and can never become a tradeable inventory item.
- Cards are versioned like all content; edits fork a new version.

---

## 2. Discovery Surfaces

| Surface | Trigger | Reward |
|---|---|---|
| Scene interactable | player inspects an object | knowledge card + Exploration XP |
| NPC dialogue branch | dialogue condition met | knowledge card + Culture XP |
| Quest step (discover) | quest step of type `discover` | knowledge card + Culture XP |
| Festival event | player joins the festival activity | knowledge card + Culture XP |
| Minigame completion | minigame finished | knowledge card + Culture XP |

The culture engine exposes `Discoveries.For(playerID, regionID)` for the collection screen and progress percentages.

---

## 3. Minigame Contracts (engine-generic)

| Type | Engine contract | Content inputs |
|---|---|---|
| pattern | repeat/reassemble a pattern | pattern asset ID, tolerance |
| rhythm | repeat a rhythm sequence | rhythm pattern ID, tolerance |
| memory-pair | pair items across columns | paired card/artifact IDs |
| sorting | sort items into categories | item IDs, category IDs |
| cooking | follow ordered steps | step list, ingredient IDs |
| market | complete a transaction | price, phrase IDs |

All minigame payloads are JSONB in the pack, validated against a per-type JSON schema. The engine interprets the payload; it never contains culture logic.

---

## 4. Festival Events

- A festival is a timed scene modifier: decor, NPC集合, activities, and rewards come from pack config.
- Participation rewards knowledge cards + Culture XP.
- The engine provides `Festivals.Active(regionID, at)` for the region map and scene renderer.

---

## 5. Sacred Content Handling

- Sacred content renders with a distinct badge.
- Sacred artifacts can never become tradeable inventory items, consumables, or cosmetic gag items; they are honored collectibles with their source citation attached.
- Sacred knowledge cards render with a distinct badge and carry their source citation.
- Sacred content is versioned like all content; edits fork a new version.

---

## 6. Engine Interface (contract for Phase 2)

```
CultureEngine.Cards(regionID) → []CardRef
CultureEngine.Card(id) → Card
CultureEngine.Minigame(id) → config
CultureEngine.Festivals.Active(regionID, at) → []Festival
CultureEngine.Discover(playerID, cardID) → first time? reward : duplicate
```

The quest engine calls `Discover` when a quest step or dialogue branch reveals a card; the collection screen reads `Cards` and `Discoveries`.
