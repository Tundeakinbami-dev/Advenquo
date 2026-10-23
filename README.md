# Advenquo: The World Begins at Home

> **Discover your world. Unlock the next. Explore humanity through hands-on cultural adventures in VR.**

Advenquo is an original hands-first, seated-friendly VR cultural exploration game created for the **Meta VR Start Developer Competition 2026**. Built with [IWSDK](https://iwsdk.dev) (Immersive Web SDK) and WebXR, it brings cultural heritage to life through interactive miniature environments, spatial storytelling, hands-on physical interactions, and rewarding discovery progression.

---

## 🌍 Experience Overview

In this competition release, players begin in the **Yoruba Culture of West Africa**:

- **Seated Comfort**: The entire experience is ergonomically calibrated for comfortable seated play. An interactive wooden display table rests at natural arm reach directly in front of the player.
- **Hands-First Interaction**: Fully operable end-to-end using hand tracking (pinch and ray interactions) without requiring physical controllers, while remaining fully compatible with Quest controllers.
- **Cultural Artefacts**:
  1. **Adire Cloth**: Ancient Yoruba resist-dyed indigo textile with symbolic geometric patterns.
  2. **Gangan (Talking Drum)**: Hourglass-shaped drum that mimics the tonal cadence of human speech.
  3. **Igba (Calabash Bowl)**: Polished, pyrography-engraved gourd central to hospitality and ceremonies.
  4. **Obi (Kola Nut)**: Sacred symbol of blessing, hospitality, and life ("He who brings kola brings life").
- **Focused Session Loop**: Designed for a complete, rewarding 5-to-8 minute journey. Discovering each artefact triggers audio chimes and reveals rich cultural fact cards. Discovering all four triggers celebration and unlocks the next destination (Nile Valley).

---

## 🛠️ Architecture & Technology Stack

- **Framework**: Meta IWSDK (Immersive Web SDK) + Three.js (`@iwsdk/core`)
- **Language**: TypeScript (`tsc --noEmit` verified)
- **ECS (Entity-Component System)**:
  - `CulturalObject`: ECS component marking interactive artefacts and tracking discovery state.
  - `DiscoverySystem`: Detects hand-ray pinch / controller press events and triggers spatial audio.
  - `SceneUISystem`: Manages spatial UIKitML fact panels, live counter progression, and the completion celebration.
- **Spatial UI**: Horizon UIKitML (`@pmndrs/uikit` + Horizon design system) rendered in 3D space with clean typography and responsive layout.
- **Procedural 3D Assets**: Side-effect-free parentless Three.js procedural models registered in the asset catalog.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `20.19+` or `22.12+` (Node 22 recommended, see `.nvmrc`)
- npm

### Installation

```bash
git clone https://github.com/Tundeakinbami-dev/Advenquo.git
cd Advenquo
npm install
```

### Typecheck & Production Build

```bash
# Verify TypeScript types
npm run typecheck

# Build optimized production bundle
npm run build
```

### Local Development

```bash
# Launch managed dev server with IWER browser emulator
npm run dev
```

---

## 🏆 Meta VR Start Developer Competition Compliance

- ✅ **Hands-First**: Uses WebXR Hand Tracking and Ray/Pinch interactions without requiring controllers.
- ✅ **Seated-Friendly**: Optimized table height (`y = 0.72m`) and reach distance (`z = -0.75m`).
- ✅ **Original WebXR Experience**: Not a 2D web page embedded in VR; built specifically for immersive 3D space.
- ✅ **5–8 Minute Session**: Focused, complete single-session exploration loop with milestone progression.
- ✅ **Zero-Error Compilation**: Passes all strict TypeScript and Vite build validations cleanly.

---

## 📄 License

MIT
