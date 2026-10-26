# Advenquo: Architecture and Repository Audit

**Date:** October 25, 2026  
**Auditor:** Principal Software Architect & Technical Lead  
**Audit Scope:** Repository configuration, packages, core engines, UI/spatial layer, mission logic, persistence, security, and Meta Quest/WebXR readiness.

---

## 1. Executive Summary

Advenquo is an adventure and cultural exploration title developed using Meta's **Immersive Web SDK (IWSDK v1.0.1)** and **Three.js (super-three v0.181.0)** targeting WebXR on Meta Quest and desktop/mobile browsers.

Prior to this audit, the repository contained:
1. An initial proof-of-concept immersive WebXR room (`public/scenes/main.iwsdk.scene.json`) featuring a seated display table and four procedural 3D Yoruba cultural artifacts: **Adire Cloth**, **Gangan (Talking Drum)**, **Igba (Calabash Bowl)**, and **Obi (Kola Nut)**.
2. A basic discovery mechanic triggered via ray pinch / controller clicks (`DiscoverySystem`, `SceneUISystem`), revealing simple fact panels authored in UIKitML (`@pmndrs/uikit`).
3. An extensive collection of theoretical specification documents in `docs/` (labeled *Culture Kingdom Phase 0–17*) detailing a vision for a global language/culture adventure engine, database schemas, and AI tutoring.

However, **there was an acute gap between the documentation and the codebase**:
- **No Global Map** existed in code (Layer A was completely missing).
- **No District Exploration** existed beyond a single 3D table scene (Layer B was missing).
- **No Mission Engine** was implemented; the app only possessed a simple counter (`x / 4 discovered`) without language mechanics, investigation clues, or practical problem solving (Layer D was missing).
- **No World Now Hub** existed; no contemporary sourced news, editorial review state, or story-linked missions were present.
- **No Player Persistence**, Culture Passport, or Discovery Journal existed (all state was transient in-memory ECS component fields).
- **No Test Suite** existed in `package.json` (no unit, integration, or progression tests).

The underlying 3D procedural rendering and IWSDK ECS foundation are technically sound and compile cleanly (`tsc --noEmit` exits with 0; `vite build` creates a valid production bundle). The architecture must now be expanded into a unified, hybrid adventure application that realizes the product vision without discarding the working WebXR capabilities.

---

## 2. Repository and Tooling Inspection

### 2.1 File Structure and Authority
- **Authority:** `iwsdk.config.json` acts as the project authority configuring the active scene (`public/scenes/main.iwsdk.scene.json`), asset module (`./src/assets`), component module (`./src/components`), and XR features (VR mode, seated camera, hand tracking, grabbing, physics).
- **Virtual Module:** `virtual:iwsdk-project` is consumed in `src/index.ts` and passed to `World.create()`.
- **Three.js Instance:** Three.js is imported through `@iwsdk/core`, which re-exports `super-three@0.181.0`. Direct imports from `three` are strictly avoided to prevent dual-instance context bugs.
- **Build & Packaging:** Node v24.18.0 with npm 12.0.2. Vite 7.3.7 builds the client production bundle into `dist/` (generating `dist/index.html`, Havok physics WASM, MSDF font workers, and bundled assets).

### 2.2 System & Component Layout
- `src/components.ts`: Component registry defining `[CulturalObject]`.
- `src/cultural-object-component.ts`: Schema component with `factId` (string) and `discovered` (boolean).
- `src/discovery-system.ts`: ECS system subscribing to `[CulturalObject, Pressed]`, toggling `discovered: true` and playing `AudioSource`.
- `src/scene-ui-system.ts`: Reads discovery state in `update()`, manages visibility timers for UIKitML fact panels, and triggers the completion panel.
- `src/assets.ts`: Deterministic catalog registering 5 procedural Three.js assets and 6 UIKitML panels.

---

## 3. Verified Findings vs. Unverified Assumptions

| Feature / Area | Verified Status | Technical Finding | Notes |
|---|---|---|---|
| **TypeScript Compilation** | **Verified (Working)** | `tsc --noEmit` exits with 0. Strict type checking is enforced. | Zero type errors in core files. |
| **Vite Client Production Build** | **Verified (Working)** | `npm run build` succeeds in ~54s, producing optimized bundles in `dist/`. | Generates Havok WASM, MSDF workers, and application JS. |
| **Procedural 3D Geometry** | **Verified (Working)** | Models are side-effect-free parentless Three.js `Object3D` trees (`adire-cloth`, `calabash`, `display-table`, `kola-nut`, `talking-drum`). | Complies with IWSDK dual-realm evaluation rules. |
| **Ray & Pinch Interaction** | **Verified (Working)** | Components use `RayInteractable` and `DistanceGrabbable`. `DiscoverySystem` subscribes to `Pressed`. | Operable via Meta Quest controller trigger or WebXR hand pinch. |
| **Global Map (Layer A)** | **Verified (Missing)** | No map component, route, or navigation logic existed. | Must be implemented to ground Nigerian destination and districts. |
| **Local Districts (Layer B)** | **Verified (Missing)** | Only a single isolated table room existed; no market district or compound. | Must be implemented to support multi-district Nigerian exploration. |
| **Mission Engine (Layer D)** | **Verified (Missing)** | No mission runner, objective validation, dialogue trees, or failure/retry handling. | Must be implemented with strict data contracts and deterministic execution. |
| **World Now Hub** | **Verified (Missing)** | No sourced editorial content, verification metadata, or story-linked missions existed. | Must be implemented with verified real-world sources and editorial states. |
| **Culture Passport & Journal** | **Verified (Missing)** | No player inventory, discovery log, or unlocked knowledge records. | Must be implemented with persistent storage. |
| **State Persistence** | **Verified (Missing)** | Progress was lost immediately on page reload. | LocalStorage/IndexedDB state persistence required. |
| **Automated Testing Suite** | **Verified (Missing)** | No test script, test framework, or test files existed in the repository. | Automated test suite must be established. |
| **Physical Quest Headset** | **Environmental Limitation** | Headset hardware testing requires connected Quest device via ADB reverse. | Validated via code inspection, schema compliance, and WebXR APIs. |

---

## 4. Architectural Analysis: 3D Scene & WebXR

### 4.1 3D Environment Evaluation
- **Is the 3D environment merely decorative or functional?**  
  The 3D environment in `main.iwsdk.scene.json` is **functional but narrow**. It places four cultural artifacts on an ergonomically placed table (`position: [0, 0.72, -0.75]`), directly within comfortable arm's reach of a seated player. Interacting with an object plays an audio cue and triggers fact cards.
- **Limitation:** It is confined to an inspection table. It lacks an exploration context (how the player arrived there, what cultural mission prompted the inspection, or how this relates to a broader narrative).
- **Remedy:** The 3D scene should serve as the **Layer C: Immersive Encounter** within a broader adventure loop. The player navigates from the Global Map (Layer A) to an interactive District (Layer B), where a specific mission objective (e.g. inspecting heritage artifacts or deciphering textiles) transitions seamlessly into the 3D spatial encounter.

### 4.2 WebXR / Quest Architecture
- Configured for WebXR immersive VR mode with `offer: "always"`.
- Uses Horizon UIKitML for 3D spatial UI overlays.
- Employs `RayInteractable` for hand tracking pinch and 6DOF controller rays.
- Follows seated VR design guidelines (no involuntary camera movement, zero artificial acceleration, calibrated eye height).

---

## 5. Security, Validation & Child Safety Audit

1. **Client Trust Boundaries:** The initial codebase had no validation layer; ECS state was modified directly. A deterministic mission and reward validator must enforce that achievements and discoveries cannot be granted without valid prerequisite completions.
2. **AI Safety & Hallucination Prevention:** The docs proposed AI conversational agents. However, per the core safety guidelines, **AI must never invent cultural facts or independently award achievements**. Cultural and historical facts must be sourced, editorially reviewed, and delivered deterministically.
3. **Data Minimization:** No personal data, location tracking, camera feeds, or microphone streams are captured. The application operates securely client-side with zero telemetry leakage.
4. **Content Lifecycle & Attribution:** World Now stories must strictly record publication dates, source URLs, editorial review timestamps, and explicitly distinguish verified factual claims from gameplay fiction.

---

## 6. Conclusion & Transition to Implementation

The repository possesses a functional IWSDK core, but lacks the game architecture that makes Advenquo a global adventure. The architecture will be augmented with:
1. **Core Domain Model & Mission Engine**: Strict TypeScript interfaces and deterministic rule runners for Contextual Language, Cultural Investigation, and Geographic Reasoning.
2. **Global Map & Local District Navigation**: Interactive exploration covering Nigeria with two distinct districts (Ìsàlẹ̀ Èkó Cultural Quarter and Lagos Tech & Innovation Hub).
3. **World Now Sourced Editorial System**: Sourced contemporary stories with editorial lifecycles linked to optional in-game missions.
4. **Persistent Culture Passport & Discovery Journal**: LocalStorage-backed progress, skill tracking, and mastery records.
5. **Hybrid Desktop / Mobile / WebXR Shell**: Ensuring full accessibility on standard screens while seamlessly launching immersive WebXR encounters.
6. **Comprehensive Automated Test Suite**: Testing mission validation, progression math, editorial lifecycle, and persistence.
