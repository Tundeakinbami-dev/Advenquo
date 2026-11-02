# Advenquo: VR Interaction Specification

**Date:** October 25, 2026  
**Author:** Principal Software Architect & Technical Lead  
**Scope:** Seated comfort, ergonomics, hands-first interaction, controller input, spatial UI design, and accessibility specifications for Meta Quest WebXR encounters.

---

## 1. Ergonomics & Seated Comfort Baseline

Advenquo is designed from the ground up to be **100% seated-friendly**:

1. **Table Placement & Reach Coordinates**:
   - The interactive cultural table is positioned at `x = 0.0m`, `y = 0.72m`, `z = -0.75m`.
   - The player's virtual head spawns at seated eye-level: `x = 0.0m`, `y = 1.20m`, `z = 0.35m`.
   - Cultural artifacts rest between `y = 0.76m` and `y = 0.85m`, perfectly aligned with natural arm extension without requiring reaching forward or bending.
2. **Comfort Envelope & Field of View**:
   - Primary interactables and HUD panels remain within a comfortable 60° horizontal cone (±30° from center) and 30° vertical cone (-15° to +15° from center).
   - Prevents neck fatigue from continuous head turning.
3. **Locomotion Policy**:
   - **Zero Involuntary Camera Motion**: The camera position is locked to the physical head pose. No camera bobbing, camera shakes, or forced transitions.
   - **No Stick Locomotion Required**: Because artifact encounters are seated and table-centric, continuous smooth locomotion is disabled (`world.features.locomotion = false`), eliminating motion sickness.
   - In potential future multi-room spatial scenes, comfortable point-and-click teleportation with snap turning (30°/45° increments) will be the default.

---

## 2. Input Modalities: Hands-First & Controllers

Advenquo supports both **WebXR Hand Tracking** and **Touch Plus 6DOF Controllers** seamlessly through IWSDK's unified input abstraction.

### 2.1 Hand Tracking (Hands-First Mode)
- **Natural Pinch**: Bringing the index finger and thumb together triggers the `Pressed` state via `RayInteractable`.
- **Target-Ray Targeting**: A subtle, semi-transparent ray projects from the wrist/palm toward interactive artifacts. When pointing at a CulturalObject, the object subtly elevates and highlights.
- **Direct Pinch-Grab**: Grabbing objects within proximity uses `OneHandGrabbable` / `DistanceGrabbable`, allowing players to lift, inspect, and rotate artifacts in 3D space.

### 2.2 Controller Interaction (Quest Touch Plus)
- **Trigger Press**: Acts as primary select/activate for ray targets and spatial UI buttons.
- **Grip Squeeze**: Engages physics grab on grabbables (`DistanceGrabbable`).
- **Haptic Feedback**: Short 15ms pulse at 40% amplitude on hover; medium 30ms pulse at 70% amplitude on successful activation or grab.

---

## 3. Spatial UI (Horizon UIKitML)

1. **Typography & Readability**:
   - Minimum font size: 1.4 cm (equivalent to ~28 arcminutes at 0.75m distance).
   - High contrast ratios: Light gold `#F5D370` and crisp white `#FFFFFF` against deep indigo/midnight `#0A0A1E` backgrounds (minimum contrast 7:1).
   - Clean sans-serif MSDF fonts with anti-aliasing.
2. **Panel Distances**:
   - Fact and intro panels are positioned at `z = -0.75m`, angled inward between 15° and 25° toward the player's eye vector for optimal readability without parallax distortion.
3. **Audio Subtitles & Captions**:
   - Important audio cues (e.g. Talking Drum rhythms, spoken Yoruba greetings) display synchronized spatial text captions on the nearby HUD.

---

## 4. Accessibility and Comfort Settings

| Feature | Specification | Rationale |
|---|---|---|
| **Height Adjustment** | One-touch recenter / floor-offset slider (±0.30m) | Accommodates players in wheelchairs, low sofas, or standing postures. |
| **Dominant Hand Switch** | Ray interaction operable equally from left or right hand | Accommodates left-handed and right-handed players. |
| **High Contrast UI** | Semi-opaque backing panels with thick borders | Guarantees legibility regardless of background environmental lighting. |
| **Audio-Visual Redundancy**| Visual glow and card reveal accompany every audio chime | Ensures deaf and hard-of-hearing players receive full feedback. |
| **Instant Exit** | Persistent "Exit to 2D / District" button on spatial HUD and physical Oculus Menu button | Never traps the player in VR; instant, safe departure. |
