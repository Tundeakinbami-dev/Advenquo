# Advenquo: Meta Quest & VR Strategy

**Date:** October 25, 2026  
**Author:** Principal Software Architect & Technical Lead  
**Scope:** Architectural evaluation of deployment targets for Meta Quest headsets, WebXR compatibility, IWSDK utilization, and distribution pathways.

---

## 1. Target Platform Evaluation

We evaluated four potential deployment pathways for Meta Quest compatibility:

| Option | Architecture | Pros | Cons | Recommendation |
|---|---|---|---|---|
| **A. Responsive 2D Web** (Standard Browser) | Standard Web application running in Meta Quest Browser window. | Instant deployment; zero app store barrier; full responsive layout; works on any desktop/mobile device. | Lacks 3D spatial immersion; restricted to a flat virtual window inside Quest Home. | Essential baseline for accessibility, but insufficient alone for full VR immersion. |
| **B. Immersive WebXR via IWSDK** (Hybrid Web + PWA/TWA) | Meta Immersive Web SDK (IWSDK) running in Meta Quest Browser, packaged via Bubblewrap/Meta Quest PWA wrapper. | Single codebase; zero installation friction; native WebXR hand tracking and controller support; instant updates via web; capable of Horizon Store distribution. | Bounded by WebXR browser sandbox and mobile GPU memory limits. | **Selected & Implemented Path.** Optimal balance of development agility, XR fidelity, and cross-platform reach. |
| **C. Native Unity/Unreal Engine** | Standalone OpenXR/Oculus SDK native binary (APK) compiled in C# or C++. | Highest possible raw GPU performance and advanced post-processing shaders. | Requires complete rewrite of existing codebase, duplicates mission logic, requires long build cycles, high maintenance overhead. | Not justified for MVP. Can be re-evaluated for future high-budget spin-offs. |
| **D. Hybrid Progressive WebXR Architecture** | Responsive 2D navigation shell (Global Map, Districts, World Now, Passport) + Instant 3D WebXR Encounter mode (IWSDK Three.js ECS). | Players navigate on desktop, phone, or Quest Browser with full clarity; seamlessly enter 6DOF WebXR when inspecting 3D artifacts. | Requires clear architectural boundary between 2D UI and WebXR rendering contexts. | **Primary Product Strategy.** |

### Selected Strategy: Option D (Hybrid Progressive WebXR using IWSDK)
Advenquo uses **Meta's Immersive Web SDK (IWSDK v1.0.1)**. This allows the core adventure (world map, district exploration, journal, news) to run responsively on desktop, mobile, and Quest Browser, while providing an immersive, hands-first 3D WebXR mode for spatial artifact investigation and cultural inspection.

---

## 2. Headset Capabilities & Device Tiering

The application targets **Meta Quest 2, Meta Quest 3, and Meta Quest 3S**:

- **Primary Target Profile:** Meta Quest 3 / 3S (Snapdragon XR2 Gen 2, 8GB/12GB RAM).
- **Minimum Target Profile:** Meta Quest 2 (Snapdragon XR2 Gen 1, 6GB RAM).
- **Target Refresh Rate:** 72 Hz baseline (13.88 ms frame budget); optionally 90 Hz on Quest 3 (11.11 ms frame budget).
- **Rendering Resolution:** 1.0x native eye buffer scale with dynamic foveation enabled if GPU bound.
- **Draw Call Budget:** Under 100 draw calls per frame in spatial 3D scenes.
- **Poly Count Budget:** Under 100,000 triangles total per 3D encounter scene.

---

## 3. WebXR Runtime Detection and Fallback Architecture

Never rely on fragile User-Agent parsing to determine XR capabilities. The runtime detects immersive capabilities using the official WebXR Device API:

```typescript
export async function detectXRCapabilities(): Promise<{
  supported: boolean;
  immersiveVrSupported: boolean;
  handTrackingSupported: boolean;
}> {
  if (!navigator.xr) {
    return { supported: false, immersiveVrSupported: false, handTrackingSupported: false };
  }

  try {
    const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
    return {
      supported: true,
      immersiveVrSupported: vrSupported,
      handTrackingSupported: vrSupported // IWSDK enables hand tracking feature by default
    };
  } catch (err) {
    console.warn('WebXR capability query failed:', err);
    return { supported: false, immersiveVrSupported: false, handTrackingSupported: false };
  }
}
```

When WebXR is unavailable (e.g. running on an ordinary laptop or smartphone), the application falls back gracefully to interactive OrbitControls / pointer interaction in WebGL, ensuring zero player exclusion.

---

## 4. Packaging and Horizon Store Distribution Strategy

To distribute on the Meta Horizon Store:
1. **PWA Packaging**: Package the production build using Meta's Progressive Web App (PWA) tooling (`@meta-quest/metavr` or Bubblewrap CLI).
2. **Web App Manifest**: Provide standard `manifest.json` declaring `display: "standalone"`, `orientation: "any"`, icons (512x512, 192x192), and `ovr_package_name`.
3. **Auto-Enter XR Option**: Configure the manifest to launch directly into immersive mode when booted on Quest, or present the 2D shell in an expansive virtual slate.
4. **Digital Asset Links**: Host `.well-known/assetlinks.json` on the public HTTPS domain (e.g. Vercel) matching the APK signing keystore SHA256 fingerprint.
5. **Meta VRC Compliance**: Adhere strictly to the Virtual Reality Check requirements (see `docs/meta-quest-validation.md`).
