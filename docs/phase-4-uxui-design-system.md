# Culture Kingdom — Phase 4: UX/UI Design System

**Upstream:** Phase 1 GDD (mechanics, screen list), Phase 2 (API contracts).
**Rule:** mobile-first, globally adaptable, culturally respectful, accessible.

---

## 1. Visual Identity

- **Mood:** exploration, discovery, warmth, cultural richness — modern game design, not a textbook.
- **Authentic references:** patterns, colors, and motifs sourced from the target culture with documented citations. No generic "African" stereotypes; per-pack visual themes are content, not engine code.
- **Tone:** warm, inviting, adventure-forward — a world to explore, not a classroom.

### Design tokens (initial set)

```json
{
  "color.bg.deep": "#141026",
  "color.bg.panel": "#1F1A38",
  "color.accent.primary": "#F5B841",
  "color.accent.secondary": "#7C5CBF",
  "color.success": "#4CC38A",
  "color.error": "#E5484D",
  "color.text.primary": "#F4F1FA",
  "color.text.dim": "#9C94B8",
  "radius.md": "12px",
  "radius.lg": "20px",
  "space.unit": "8px",
  "font.ui": "'Nunito', system-ui, sans-serif",
  "font.display": "'Fraunces', Georgia, serif",
  "font.size.body": "16px",
  "font.size.title": "28px"
}
```

- **Typography:** display font for titles/story beats; UI font for chrome. Both must support Latin + extended ranges; target-language text renders with its script's font stack (fallback chain per script: latn / arab / jpan / cyrl).
- **Spacing:** 8px base grid; components snap to the grid.
- **Radius:** 12px components, 20px panels — warm, modern, not sterile.

---

## 2. Screen Map (27 screens per the master prompt)

| # | Screen | Purpose | Key elements |
|---|---|---|---|
| 1 | Splash | Brand + loading | Logo, progress bar |
| 2 | Intro | Story hook | The Forgetting intro, "Begin" CTA |
| 3 | Account creation | Anonymous-first | "Play as guest" prominent; email optional |
| 4 | Age selection | Age band gate | under_8 / 8_12 / 13_17 / 18_plus |
| 5 | Player profile | Identity | Avatar, display name, guardian link |
| 6 | Character creation | Avatar picker | Cosmetics, color, starter outfit |
| 7 | World map | Pack selection | Country cards, lock states, progress % |
| 8 | Region map | Region selection | Region cards, mastery %, Voice fragments |
| 9 | Scene exploration | Core play | NPCs, interactables, ambient audio, fireflies |
| 10 | NPC interaction | Dialogue entry | NPC portrait, speech bubble, continue |
| 11 | Dialogue | Conversation | Tree branches, language gates, subtitles |
| 12 | Language challenge | Comprehension gate | Options, input, hint button, retry |
| 13 | Cultural challenge | Knowledge gate | Card-based prompts, matching |
| 14 | Quest screen | Objective tracking | Steps, progress, rewards preview |
| 15 | Inventory | Items & artifacts | Slots, lore pages, sacred-item badge |
| 16 | Collection | Knowledge cards | Grid, per-region completion |
| 17 | Achievements | Milestones | Unlocked/locked, criteria |
| 18 | Player level | Guardian rank | XP tracks, next-rank progress |
| 19 | Language progress | Per-language mastery | Stage breakdown, due-for-review count |
| 20 | Culture progress | Per-region completion | Cards found, artifacts, Voice state |
| 21 | Story chapters | Narrative archive | Read/unread, replay |
| 22 | Settings | Preferences | Audio, text size, language, subtitle mode |
| 23 | Accessibility | A11y options | Contrast, text size, reduce motion, subtitles |
| 24 | Parental controls | Guardian gate | Session limits, consent, data controls |
| 25 | Help | How to play | Mechanic explainers |
| 26 | Content reporting | Flag content | Reason picker, source context |
| 27 | Admin dashboard | CMS entry | Pack list, review queue, publish controls |

---

## 3. Design Tokens

```json
{
  "color.bg.deep": "#141026",
  "color.bg.panel": "#1F1A38",
  "color.accent.primary": "#F5B841",
  "color.accent.secondary": "#7C5CBF",
  "color.success": "#4CC38A",
  "color.error": "#E5484D",
  "color.text.primary": "#F4F1FA",
  "color.text.dim": "#9C94B8",
  "radius.md": "12px",
  "radius.lg": "20px",
  "space.unit": "8px",
  "font.ui": "'Nunito', system-ui, sans-serif",
  "font.display": "'Fraunces', Georgia, serif",
  "font.size.body": "16px",
  "font.size.title": "28px"
}
```

- **Typography:** display font for titles/story beats; UI font for chrome. Target-language text renders with a per-script font fallback chain (latn / arab / jpan / cyrl / deva).
- **Spacing:** 8px base grid.
- **Radius:** 12px components, 20px panels — warm, modern, not sterile.
- **Per-pack theming:** accent hues and motifs come from the pack config; tokens define the structural skeleton only.

---

## 4. Component & State System

- **Components:** button (primary/secondary/ghost), speech bubble, dialogue choice, challenge card, knowledge card, progress ring, badge, inventory slot, quest tracker, unlock banner.
- **States every component must define:** default, hover, pressed, disabled, loading, error, empty.
- **Navigation:** bottom tab bar (Map, Quests, Collection, Profile) + back stack; admin dashboard is a separate gated surface.
- **Feedback:** every player action has visible acknowledgment within 100ms (haptics on mobile where available).

---

## 5. Accessibility Rules

- Subtitles always; audio never the sole channel.
- WCAG AA contrast minimums on all token pairs.
- No timing-critical input required for progression.
- Screen-reader labels on all UI chrome; focus order matches visual order.
- Text scaling to 200% without layout breakage.

---

## 6. User Journey (new player → first region completion)

1. **Splash** → brand + load.
2. **Intro** → "The Forgetting" story hook → "Begin".
3. **Account creation** → "Play as guest" is the prominent path (anonymous-first, A2).
4. **Age selection** → age band stored on profile.
5. **Character creation** → avatar, name, starter outfit.
6. **World map** → single pack visible (Nigeria), region locked.
7. **Region map** → first region available.
8. **Scene exploration** → ambient hook, firefly hint draws to first NPC.
9. **NPC interaction** → greeting gate (Quest A begins).
10. **Language challenge** → succeed with hint if needed → NPC trust.
11. **Explore** → knowledge cards, fireflies, Quest B trigger.
12. **Quest B** → cultural discovery + collection.
13. **Festival unlock** → Quest C → Voice recovered.
14. **Region complete** → mastery summary screen → next region teased on the world map.

---

## 7. State Matrix (every screen)

Every screen defines: default, loading, empty, error, offline states. Content that fails review or is unpublished renders as **locked**, never as wrong content (fail-safe per Phase 13).
