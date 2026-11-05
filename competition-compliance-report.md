# Advenquo — Meta VR Start 2026 compliance audit

Audit date: 5 November 2026. This report distinguishes source-level evidence from runtime or device verification. A configured feature is not counted as tested compliance.

| Requirement | Current implementation | Gap | Required action | Test / evidence |
|---|---|---|---|---|
| Meta Quest VR application | IWSDK 1.0.1 + WebXR; `iwsdk.config.json` sets `xr.mode: vr`, Meta Quest 3 IWER emulator, and `handTracking: true`. | No physical Quest launch or deployed build evidence in the repository. | Test on Quest and on the deployed HTTPS URL; record device and build. | Source configuration reviewed; physical/deployed launch unverified. |
| Hands-only essential play | `RayInteractable` is attached to NPCs, artifacts, and panels; `DiscoverySystem` and `AdventureMissionSystem` react to `Pressed`; hand tracking is requested in config. | This does not prove pinch/ray selection works throughout the actual immersive session. Grab behavior and UI paths are not verified with tracked hands. | Exercise every required path in active XR using hands only; correct any unreachable or controller-dependent interaction. | `npm test`: VR structure/config tests pass; no hand session test. |
| Seated play | Camera starts at 1.6 m; artifact table and objects are composed near the player; locomotion and snap-turn comfort settings exist. | No full mission completion test while stationary/seated; some story destinations are placed several meters away and may require locomotion. | Verify seated reach, navigation, pause/resume, and completion; add seated-accessible teleport/navigation as needed. | Source composition/config reviewed; seated runtime test missing. |
| Understandable within ten minutes | README describes a 5–8 minute artifact discovery loop; intro, fact cards, progress and completion panels exist. | Tutorial and whole-loop duration have not been measured; UI existence alone does not prove usability. | Run a first-time playthrough and observe time-to-first-success and completion. | Source and scene inspected; first-time user test missing. |
| Interactive game loop | Cultural discovery state, a staged delivery mission, NPC dialogue, inventory, XP, saves, and story/world systems are present. | Active scene combines a market artifact loop with a separate missing-goods mission; the requested Tobi construction-delivery story is not the active mission. | Select one short opening adventure and wire its interactions, consequences, and persistence end-to-end. | Unit tests cover mission/progression paths; no end-to-end runtime proof. |
| 60 FPS on supported Quest | Quality-profile and optimization systems exist. | No Quest frame-time profile or actual performance measurements. | Profile on target hardware under representative scene/NPC load; optimize and preserve measurement evidence. | Not tested. |
| Stability and judge testability | TypeScript project, test suite, IWER configuration, and local development workflow exist. | Full test suite currently has 11 failures; browser/runtime stability and fresh judge onboarding are unverified. | Resolve failures, perform a clean launch and judge-path walkthrough, and document access/test instructions. | Typecheck passes. Test suite: 110 passed, 11 failed (see below). |
| Honest demonstration | Project source supports an emulated XR workflow. | No recorded Quest/IWER gameplay demonstration found in the reviewed project files. | Record under three minutes from a real Quest session or clearly identified XR emulator; show actual interactions. | Not tested; no demo artifact reviewed. |
| Free judge access through announcement | Repository is public per supplied GitHub URL. | No hosted application URL, release/access guarantee, or availability evidence found in project configuration. | Publish the WebXR build on HTTPS and keep the link available through the announcement; verify it on Quest. | No deployment evidence reviewed. |
| Third-party rights and originality | Original project code and procedural assets are present; README declares MIT. | Complete provenance and license audit for every asset, sound, package, and service has not been performed. | Inventory asset origins/licenses and ensure attribution/use rights are compatible with submission. | Partial source review only; full audit remains. |
| Lagos setting and cultural accuracy | Lagos/Ìsàlẹ̀ Èkó market, Yaba, construction, food, NPC, and artifact content is represented in authored scene/assets/data. | Cinematic realism and cultural accuracy need visual and subject-matter review; no performance-aware Quest visual review. | Review the rendered scene and source-sensitive facts; fix inaccurate or generic representations. | Source-level presence verified; rendered review not completed. |
| Persistent characters and conversations | Character memory, five-chapter Tobi story, dialogue, relationship, and promise systems exist; story tests exercise them. | Test coverage of data models does not establish that these systems are registered and reachable from the active scene. | Wire the opening story to in-world NPC interactions and validate a returning encounter. | `living-world-tobi-story` unit tests are present; runtime integration unverified. |
| World Now accuracy | Editorial workflow, verification pipeline, dated/sourced data and tests exist. | Freshness and source validity are not established by code tests alone. | Keep this feature secondary; verify sources and dates before deployment. | Editorial/system unit tests pass; live-content review not performed. |

## Verification run

## Hands-first implementation update

- `iwsdk.config.json` now enables `features.grabbing.useHandPinchForGrab`, which maps primary tracked-hand pinch input to IWSDK proximity grabbing.
- `public/scenes/main.iwsdk.scene.json` now includes `handheld-adire-sample`, a seated-reachable Adire swatch placed at `[-0.35, 1.1, -0.7]` with `OneHandGrabbable`. It is intentionally separate from the ray-selectable cultural artifacts, because IWSDK proximity grab handles deny ray input.
- IWER verification completed in an active Meta Quest 3 `immersive-vr` session with `hand-tracking` enabled and only `hand-left` / `hand-right` active. A left-hand pinch added `Grabbed` to `Adire Cloth Sample — Hand Practice`; releasing the pinch removed it.
- This proves the configured tracked-hand grab path and a seated-reachable tutorial interaction. It does not yet prove controller-free completion of the whole opening adventure, physical Quest performance, deployed access, or the submission demonstration.

- `npm run --if-present typecheck`: passed (`tsc --noEmit`).
- `npm test`: 121 tests; 110 passed and 11 failed. Failures are concentrated in `cinematic-realism.test.ts` (including absent utility pole evidence, mismatched expected material value, missing character simulation/dialogue methods, and a character-role mismatch) and the open-world transformation assertions. See the test output for individual stacks.
- No managed runtime, active XR session, physical Quest, hosted build, frame-rate profile, or demonstration video was available as evidence during this audit.

## Initial implementation priority

1. Make one short, deterministic Lagos adventure the scene's clear opening loop; resolve the mismatch between the current market-delivery loop and the requested Tobi construction-delivery story.
2. Verify seated, hands-only completion in an active XR session; use IWER for iteration but use an actual tracked-hand-capable session before claiming Quest hand compliance.
3. Repair the existing failing regression tests and verify the authored interactions in runtime.
4. Profile Quest performance, publish the judge build, and prepare the real demonstration and asset-rights inventory.
