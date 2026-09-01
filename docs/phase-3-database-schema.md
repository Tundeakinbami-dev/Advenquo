# Culture Kingdom — Phase 3: Database Schema

**Upstream:** Phase 2 architecture (two planes: player DB mutable, content DB versioned/immutable).
**Rule:** adding a new country/language = inserting rows. Zero schema migration.

---

## 1. Conventions

- UUIDv7 primary keys (time-ordered, index-friendly).
- Audit fields on every table: `created_at`, `created_by`, `updated_at`, `updated_by`.
- Soft deletion: `deleted_at TIMESTAMPTZ NULL` on content and player entities.
- All content entities implement the versioning + approval pattern (§2.0).
- Foreign keys `ON DELETE RESTRICT` by default; `ON DELETE CASCADE` only for owned child rows (e.g., quest steps).
- Naming: `snake_case`, plural table names.

---

## 2. Content Plane

### 2.0 Versioning pattern (applies to every content entity)

Every content table carries:

```sql
status             content_status  NOT NULL DEFAULT 'draft',
pack_id            UUID NOT NULL REFERENCES culture_packs(id),
current_version    INTEGER NOT NULL DEFAULT 1,
-- immutability: published rows are never UPDATEd; edits fork a new version row
```

`content_status` enum: `draft | review | expert_review | approved | published | archived`.

### 2.1 Geography & culture graph

```sql
CREATE TABLE culture_packs (
  id UUID PRIMARY KEY,
  pack_key TEXT NOT NULL UNIQUE,          -- 'nigeria-01'
  engine_compat TEXT NOT NULL,            -- semver range
  manifest JSONB NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE countries (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  iso_code CHAR(2),                        -- nullable: historical/hypothetical cultures
  name TEXT NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, iso_code)
);

CREATE TABLE cultural_regions (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  country_id UUID REFERENCES countries(id),  -- nullable: cross-border/historical regions
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, slug)
);

CREATE TABLE communities (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ
);

-- m:n with semantics: a language spans communities; a community uses several languages
CREATE TABLE community_languages (
  community_id UUID NOT NULL REFERENCES communities(id),
  language_id UUID NOT NULL REFERENCES languages(id),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  register_notes TEXT,
  PRIMARY KEY (community_id, language_id)
);

CREATE TABLE region_communities (
  region_id UUID NOT NULL REFERENCES cultural_regions(id),
  community_id UUID NOT NULL REFERENCES communities(id),
  overlap_note TEXT,                       -- diaspora, cross-border, historical era
  PRIMARY KEY (region_id, community_id)
);

CREATE TABLE languages (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  bcp47 TEXT NOT NULL,                     -- 'yo', 'ig', 'ha', 'fr', 'ja'
  display_name TEXT NOT NULL,
  default_script TEXT NOT NULL REFERENCES scripts(code),
  rtl BOOLEAN NOT NULL DEFAULT false,
  tonal BOOLEAN NOT NULL DEFAULT false,
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, bcp47)
);

CREATE TABLE dialects (
  id UUID PRIMARY KEY,
  language_id UUID NOT NULL REFERENCES languages(id),
  display_name TEXT NOT NULL,
  notes TEXT,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE scripts (
  code TEXT PRIMARY KEY,                   -- 'latn', 'arab', 'jpan', 'hani', 'cyrl'
  display_name TEXT NOT NULL,
  rtl BOOLEAN NOT NULL DEFAULT false
);
```

### 2.2 Language content

```sql
CREATE TABLE phrases (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  language_id UUID NOT NULL REFERENCES languages(id),
  dialect_id UUID REFERENCES dialects(id),          -- nullable = language-wide
  script TEXT NOT NULL REFERENCES scripts(code),
  normalized_form TEXT NOT NULL,                    -- canonical form for SRS identity
  alternative_spellings TEXT[] NOT NULL DEFAULT '{}',
  part_of_speech TEXT,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  is_essential BOOLEAN NOT NULL DEFAULT false,      -- never paywalled (hard rule)
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (language_id, dialect_id, normalized_form, script)
);
CREATE INDEX idx_phrases_srs ON phrases (language_id, difficulty) WHERE deleted_at IS NULL;

CREATE TABLE translations (
  id UUID PRIMARY KEY,
  phrase_id UUID NOT NULL REFERENCES phrases(id),
  ui_locale TEXT NOT NULL,                 -- 'en', 'fr', 'yo' (glosses in any locale)
  text TEXT NOT NULL,
  literal TEXT,                            -- literal vs idiomatic meaning
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  UNIQUE (phrase_id, ui_locale)
);

CREATE TABLE pronunciations (
  id UUID PRIMARY KEY,
  phrase_id UUID NOT NULL REFERENCES phrases(id),
  dialect_id UUID REFERENCES dialects(id),
  phonetic TEXT,                           -- IPA
  transliteration TEXT,
  audio_recording_id UUID REFERENCES audio_recordings(id),
  is_synthetic BOOLEAN NOT NULL DEFAULT false,  -- never the only source for sensitive languages
  deleted_at TIMESTAMPTZ
);

CREATE TABLE audio_recordings (
  id UUID PRIMARY KEY,
  asset_url TEXT NOT NULL,                 -- object storage key
  language_id UUID NOT NULL REFERENCES languages(id),
  dialect_id UUID REFERENCES dialects(id),
  speaker_pseudonym TEXT NOT NULL,         -- never real names
  gender_volunteered TEXT,                 -- only if speaker opted in
  quality_score NUMERIC(3,2),
  license TEXT NOT NULL,                   -- 'cc-by', 'proprietary', ...
  consent_on_file BOOLEAN NOT NULL DEFAULT false,
  duration_ms INTEGER NOT NULL,
  status content_status NOT NULL DEFAULT 'review',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE learning_objectives (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  code TEXT NOT NULL,                      -- 'yo.greet.elder'
  description TEXT NOT NULL,
  mastery_threshold INTEGER NOT NULL DEFAULT 5,   -- spaced exposures required
  UNIQUE (pack_id, code)
);
```

### 2.3 Story, quests, challenges

```sql
CREATE TABLE story_arcs (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  title TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  is_fictional BOOLEAN NOT NULL DEFAULT true,   -- mythology vs fact flag
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE chapters (
  id UUID PRIMARY KEY,
  story_arc_id UUID NOT NULL REFERENCES story_arcs(id),
  ordinal INTEGER NOT NULL,
  title TEXT NOT NULL,
  unlock_condition JSONB NOT NULL DEFAULT '{}',  -- engine-interpreted
  UNIQUE (story_arc_id, ordinal)
);

CREATE TABLE quests (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  chapter_id UUID REFERENCES chapters(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  quest_type TEXT NOT NULL,   -- dialogue|exploration|language|culture|investigation|collection|puzzle|timed|festival|story
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, slug)
);

CREATE TABLE quest_steps (
  id UUID PRIMARY KEY,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  step_type TEXT NOT NULL,    -- arrive|talk|challenge|discover|perform|reward
  config JSONB NOT NULL,      -- engine-interpreted step payload
  UNIQUE (quest_id, ordinal)
);

CREATE TABLE challenges (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  challenge_type TEXT NOT NULL,  -- select|order|type|listen|speak|match|rhythm|pattern
  config JSONB NOT NULL,         -- typed payload; validated by JSON schema per type
  phrase_ids UUID[] NOT NULL DEFAULT '{}',
  objective_ids UUID[] NOT NULL DEFAULT '{}',
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE quest_learning_objectives (
  quest_id UUID NOT NULL REFERENCES quests(id),
  objective_id UUID NOT NULL REFERENCES learning_objectives(id),
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  PRIMARY KEY (quest_id, objective_id)
);
```

### 2.4 Cultural content

```sql
CREATE TABLE cultural_artifacts (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media JSONB NOT NULL DEFAULT '[]',
  scope_qualifier TEXT NOT NULL DEFAULT 'some_communities',
  -- 'some_communities' | 'region_specific' | 'period_specific' | 'widely_practiced'
  is_sacred BOOLEAN NOT NULL DEFAULT false,   -- never tradeable/consumable (GDD rule)
  age_suitability age_band NOT NULL DEFAULT '8_12',
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, slug)
);

CREATE TABLE traditions (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  title TEXT NOT NULL, description TEXT NOT NULL,
  scope_qualifier TEXT NOT NULL DEFAULT 'some_communities',
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE festivals (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  title TEXT NOT NULL, description TEXT NOT NULL,
  timing_note TEXT,                          -- lunar/agricultural calendars vary
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE artifact_traditions (
  artifact_id UUID NOT NULL REFERENCES cultural_artifacts(id),
  tradition_id UUID NOT NULL REFERENCES traditions(id),
  PRIMARY KEY (artifact_id, tradition_id)
);

CREATE TABLE artifact_festivals (
  artifact_id UUID NOT NULL REFERENCES cultural_artifacts(id),
  festival_id UUID NOT NULL REFERENCES festivals(id),
  PRIMARY KEY (artifact_id, festival_id)
);
```

### 2.5 Sources, review, NPC/scene content

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  citation TEXT NOT NULL,
  source_type TEXT NOT NULL,   -- book|oral|institution|expert|interview|film
  url TEXT,
  reliability TEXT NOT NULL DEFAULT 'unverified',  -- unverified|verified|contested
  deleted_at TIMESTAMPTZ
);

CREATE TABLE source_citations (
  content_type TEXT NOT NULL,   -- 'phrase'|'artifact'|'tradition'|'festival'|...
  content_id UUID NOT NULL,
  source_id UUID NOT NULL REFERENCES sources(id),
  PRIMARY KEY (content_type, content_id, source_id)
);

CREATE TABLE expert_reviewers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  display_name TEXT NOT NULL,
  expertise TEXT[] NOT NULL,    -- ['yoruba-language','weaving']
  credentials_note TEXT,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE content_approvals (
  id UUID PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  version INTEGER NOT NULL,
  from_status content_status NOT NULL,
  to_status content_status NOT NULL,
  actor_user_id UUID NOT NULL,
  reviewer_id UUID REFERENCES expert_reviewers(id),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);
CREATE INDEX idx_approvals_entity ON content_approvals (content_type, content_id, version);

CREATE TABLE npcs (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  region_id UUID NOT NULL REFERENCES cultural_regions(id),
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  persona_config JSONB NOT NULL,        -- AI boundaries, speech style
  portrait_asset TEXT,
  dialogue_tree_id UUID REFERENCES dialogue_trees(id),
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, slug)
);

CREATE TABLE dialogue_trees (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  slug TEXT NOT NULL,
  nodes JSONB NOT NULL,                 -- validated against dialogue-node JSON schema
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (pack_id, slug)
);

CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  region_id UUID NOT NULL REFERENCES cultural_regions(id),
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  ambient_audio TEXT,
  interactables JSONB NOT NULL DEFAULT '[]',
  unlock_condition JSONB NOT NULL DEFAULT '{}',
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ,
  UNIQUE (region_id, slug)
);
```

---

## 3. Player Plane

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  auth_provider TEXT NOT NULL,
  external_subject TEXT,
  email CITEXT UNIQUE,                    -- nullable: anonymous play
  role TEXT NOT NULL DEFAULT 'player',    -- player|cms roles (see Phase 10 RBAC)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE players (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  age_band age_band NOT NULL,
  guardian_consent BOOLEAN NOT NULL DEFAULT false,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE parental_links (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id),
  guardian_user_id UUID NOT NULL REFERENCES users(id),
  relationship TEXT NOT NULL,
  consent_at TIMESTAMPTZ,
  UNIQUE (player_id, guardian_user_id)
);

CREATE TABLE consents (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  guardian_user_id UUID REFERENCES users(id),
  consent_type TEXT NOT NULL,   -- terms|data|audio_recording|research
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE progressions (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id),
  track TEXT NOT NULL,          -- language|culture|quest|exploration
  xp INTEGER NOT NULL DEFAULT 0,
  UNIQUE (player_id, track)
);

CREATE TABLE guardian_levels (
  player_id UUID PRIMARY KEY REFERENCES players(id),
  level INTEGER NOT NULL DEFAULT 1,
  rank TEXT NOT NULL DEFAULT 'visitor',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE phrase_mastery (
  player_id UUID NOT NULL REFERENCES players(id),
  phrase_id UUID NOT NULL REFERENCES phrases(id),
  stage mastery_stage NOT NULL DEFAULT 'introduced',
  -- introduced|encountered|practiced|understood|recalled|mastered
  exposure_count INTEGER NOT NULL DEFAULT 0,
  last_recalled_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),    -- SRS scheduling
  interval_seconds INTEGER NOT NULL DEFAULT 0,
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,  -- SM-2 style
  PRIMARY KEY (player_id, phrase_id)
);
CREATE INDEX idx_srs_due ON phrase_mastery (player_id, due_at);

CREATE TABLE quest_states (
  player_id UUID NOT NULL REFERENCES players(id),
  quest_id UUID NOT NULL REFERENCES quests(id),
  state quest_state NOT NULL DEFAULT 'locked',
  -- locked|available|active|completed|failed
  current_step INTEGER NOT NULL DEFAULT 0,
  memory_flags JSONB NOT NULL DEFAULT '{}',     -- NPC memory
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (player_id, quest_id)
);

CREATE TABLE objective_progress (
  player_id UUID NOT NULL REFERENCES players(id),
  objective_id UUID NOT NULL REFERENCES learning_objectives(id),
  exposures INTEGER NOT NULL DEFAULT 0,
  mastery_stage mastery_stage NOT NULL DEFAULT 'introduced',
  PRIMARY KEY (player_id, objective_id)
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id),
  artifact_id UUID REFERENCES cultural_artifacts(id),
  reward_id UUID REFERENCES rewards(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (artifact_id IS NOT NULL OR reward_id IS NOT NULL)
);

CREATE TABLE rewards (
  id UUID PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES culture_packs(id),
  reward_type TEXT NOT NULL,   -- cosmetic|badge|title|artifact|instrument|story|clarity_feather
  config JSONB NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  deleted_at TIMESTAMPTZ
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL,        -- engine-interpreted unlock condition
  deleted_at TIMESTAMPTZ
);

CREATE TABLE player_achievements (
  player_id UUID NOT NULL REFERENCES players(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, achievement_id)
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  player_id UUID,               -- nullable; pseudonymous
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  client_ts TIMESTAMPTZ,
  server_ts TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_player_ts ON analytics_events (player_id, server_ts);

-- Feature-flagged OFF in v1 (no social surface for minors)
CREATE TABLE leaderboard_entries (
  player_id UUID PRIMARY KEY REFERENCES players(id),
  board TEXT NOT NULL,
  score INTEGER NOT NULL,
  period TEXT NOT NULL
);

-- Feature-flagged OFF in v1 (Build Sprint 20)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id),
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ
);

CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id),
  product_key TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency CHAR(3) NOT NULL,
  store_receipt TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Enums (summary)

```sql
CREATE TYPE content_status AS ENUM ('draft','review','expert_review','approved','published','archived');
CREATE TYPE mastery_stage  AS ENUM ('introduced','encountered','practiced','understood','recalled','mastered');
CREATE TYPE quest_state    AS ENUM ('locked','available','active','completed','failed');
CREATE TYPE age_band       AS ENUM ('under_8','8_12','13_17','18_plus');
```

---

## 5. Migration Strategy

1. **Forward-only migrations** (no down-migrations in production); expand-then-contract pattern for column changes.
2. **Culture Packs are data, not migrations.** A new country/language inserts rows via the CMS import path — never a schema change. This is enforced by review: any PR adding a migration that touches culture-specific tables gets rejected unless it's genuinely structural.
3. **Published content immutability:** enforced by triggers/permissions — `UPDATE` on published rows is denied; edits fork a new version.
4. **Backups:** continuous WAL archiving + daily snapshots; content store restorable to any publication point.
5. **Data retention:** `deleted_at` soft delete; hard delete via scheduled job respecting legal holds and child-data retention rules (Phase 15).
