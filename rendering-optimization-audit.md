# Rendering and environment optimization audit

Date: 5 November 2026. Baseline captured before rendering changes. Browser and scene-render measurements below are diagnostic host/emulator observations; they are not physical Meta Quest performance results.

## Current renderer and scene architecture

- **Engine:** IWSDK 1.0.1 with Three.js r181 (`super-three` alias); the runtime render statistics identify the renderer as IWSDK WebGL / `WebGLRenderer`. The project does not configure a separate WebGPU renderer.
- **Project entry:** `iwsdk.config.json` selects `public/scenes/main.iwsdk.scene.json`, `src/assets.ts`, and `src/components.ts`, and enables Quest 3 IWER emulation, WebXR hand tracking, locomotion, physics, and Horizon spatial UI.
- **Assets:** 49 procedural TypeScript scene-asset builders are registered in `src/assets.ts`; placed assets are parentless `Object3D` prototypes cloned into the scene. No environment model LODs, impostors, or InstancedMesh objects were found. The placed world is authored in one 30-node scene JSON. There is one external glTF file in `public/gltf/` (the WebXR banner), and the listed public texture is the WebXR image; many procedural assets generate small CanvasTextures in code.
- **Scene transitions:** `WorldStreamingSystem` switches visibility for entities carrying `LocationAnchor`, changes environment gradients, and teleports the player to the selected location spawn. This is location switching, not distance-based streaming, asynchronous progressive loading, or asset unloading. No asset is unloaded on travel; persistent state is stored separately.
- **Camera and movement:** `iwsdk.config.json` uses an initial origin spawn and 1.6 m browser camera, WebXR locomotion with a worker, snap turning and browser controls. `PlayerControllerSystem` implements desktop/touch movement; `WorldStreamingSystem` sets boundaries and spawn transforms on travel.
- **Lighting and atmosphere:** scene travel applies `DomeGradient` and `IBLGradient` to the level root from `EnvironmentManager`, with authored time/weather presets. The scene-file preview itself reports no authored lights, IBL texture, fog, or shadows. Runtime stats report shadows disabled and no active shadow casters. Meshes have many source `castShadow` flags, but those flags are not currently producing shadow work under this renderer state.
- **Materials and geometry:** procedural assets primarily use shared/reused `MeshStandardMaterial` and primitive geometries. No imported compressed texture/model pipeline (KTX2/Basis, Draco, Meshopt) or material LOD was found. Asset prototypes are built synchronously by the shared manifest.
- **Animation:** `NpcAnimationSystem` skips invisible objects and updates visible character poses. The market pedestrian receives a lightweight routine update only while the urban location is active. No skeletal crowd system is present in the active runtime.
- **Quality profiles:** `src/systems/quality-profile-system.ts` defines desktop/mobile/Quest tiers, but it is not registered in `src/index.ts`, and the profile values are not applied to renderer, textures, shadows, or NPC update budgets. Quest foveation/dynamic resolution is not configured in the project.

## Initial measured baseline

| Measurement | Baseline | Capture context |
|---|---:|---|
| Active runtime draw calls | 21 | Managed browser, canvas 925×1,014, pixel ratio 1, non-immersive snapshot after the scene loaded |
| Active runtime triangles | 2,106 | Same managed browser snapshot |
| Active runtime geometries / textures / programs | 105 / 25 / 13 | Same managed browser snapshot |
| Active runtime meshes / materials | 627 / 389 | Runtime counter includes non-drawing and hidden scene objects; it is not a draw-call count |
| Active runtime shadows / tone mapping | Off / none | Runtime renderer reported `shadows:false`, `toneMapping:0` |
| Authored-scene render calls / triangles | 226 / 16,284 | `scene_render_file`, 512×512; includes the composed authored scene rather than a physical headset frame |
| Authored-scene geometry / material / texture counts | 211 / 120 / 30 | Same scene render; 358 scene meshes, 402 objects, 30 authored nodes |
| Scene-render sample times | 13.6, 201.1, 4.9, 11, 4.2, 3.4 ms | Cold/short scene-render samples with a 201.1 ms outlier; too small and variable to infer FPS |
| Managed browser environment | IWER Quest 3 profile, Intel UHD 620 / ANGLE GLES 3.2 | Host/emulator, not Quest silicon |
| Production entry bundle | 6.887 MB minified / 1.775 MB gzip | Most recent successful production build on this revision; separate Havok WASM is 2.095 MB |

The host browser exited unexpectedly during the bounded rendering profile, so no stable frame-time series was recorded. No headset was connected for this audit. CPU/GPU utilization, Quest memory, physical frame pacing, loading time, and before/after Quest FPS are **unmeasured**.

## Cost assessment and safe first optimization

The active runtime sample has a modest visible draw-call/triangle count and disables real-time shadows, so large-scale polygon or shadow rewrites are not justified by the current evidence. The isolated authored-scene render has a much larger draw-call count because it composes the complete placed scene; this makes static repeated meshes a reasonable low-risk target. `market-props` is a non-interactive static group containing three yams and four plantains built as individual meshes despite sharing geometry/materials within each group. Consolidating each produce group into one instanced draw preserves all visible instances and has no collision, interaction, NPC state, or player-input dependency.

Do not describe that local draw-call reduction as a Quest FPS improvement without measuring the physical headset. Leave shadows, renderer resolution, LOD distances, and scene transition behavior unchanged until device measurements identify those as bottlenecks.

## Required next performance work

1. Re-capture active runtime and scene statistics after the isolated instancing change; compare calls, geometry, triangles, and visible asset IDs from the same view.
2. Profile repeated market props, the 63-mesh construction site, and the 129-mesh authored navigation tablet as separate rendering targets before deciding whether geometry merging or UI structure is worthwhile.
3. Integrate device quality tiers only after a supported IWSDK renderer-quality API is verified; current profile data is descriptive, not operational.
4. Establish Quest hardware frame-time, CPU/GPU, and memory capture under the eight requested scenarios before setting LOD, shadow, foveation, or compression targets.
5. Treat progressive cross-location loading and safe unloading as a separate architectural feature: preserve active gameplay entities and save state, then load only destination-specific asset groups.

## Change and verification log

- Baseline code inspected: project config, package versions, manifest, active scene, runtime system registration, player movement, location switching, NPC animation, environment/time/weather, quality-profile declarations, and procedural market/street assets.
- Changed `src/scene-assets/market-props.scene-asset.ts`: replaced three separate yam meshes and four separate plantain meshes with two `InstancedMesh` objects (3 and 4 instances). This preserves seven produce instances while reducing the static asset's mesh submissions by five; interactive objects and collision were not changed.
- Isolated managed-browser asset preview after the change: 16 meshes, 12 geometries, 6 materials, 1,060 rendered triangles. The two named produce parts appear as `YamsInBasket` and `PlantainsInBasket`. This is a host editor preview, not a Quest render. A directly comparable pre-change isolated preview was not captured, so the five-submission reduction is derived from the previous seven-mesh source and current two-instanced-mesh source.
- `npm run --if-present typecheck`: passed after the source change.
- `npm test`: passed, 122 tests across 29 suites.
- `npm run build`: passed. Vite emitted existing UIKit font coverage warnings for Yoruba/Latin characters and a large entry chunk warning; output entry bundle is 6.887 MB minified / 1.775 MB gzip, Havok WASM 2.095 MB. These are recorded for follow-up rather than concealed.
- No stable runtime frame-time series, physical Quest FPS, CPU/GPU, memory, or loading-time measurements are available. The asset-level mesh submission reduction is not an FPS claim.

## Follow-up priorities

1. Recapture the full scene render with the same camera and resolution to quantify scene-wide change; compare equivalent views before attributing a runtime benefit.
2. Profile repeated market props, the 63-mesh construction site, and the 129-mesh authored navigation tablet as separate rendering targets before deciding whether more geometry merging or UI structure is worthwhile.
3. Integrate device quality tiers only after a supported IWSDK renderer-quality API is verified; current profile data is descriptive, not operational.
4. Establish Quest hardware frame-time, CPU/GPU, and memory capture under the requested scenarios before setting LOD, shadow, foveation, or compression targets.
5. Treat progressive cross-location loading and safe unloading as a separate architectural feature: preserve active gameplay entities and save state, then load only destination-specific asset groups.
