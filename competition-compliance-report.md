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
| Stability and judge testability | TypeScript project, test suite, IWER configuration, and local development workflow exist. | Browser/runtime stability, physical device, hosted build and judge onboarding remain unverified. | Test on Quest, publish a public HTTPS build and document access. | Latest typecheck and build pass; latest test suite: 121 passed, 0 failed. |
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
- Initial audit test result: 121 tests; 110 passed, 11 failed. This result was superseded by the continuation below, which brought the current suite to 121 passed and 0 failed.
- At initial audit time there was no managed runtime or active XR session. A later IWER session was used for a tracked-hand pinch-grab check; physical Quest, hosted build, frame-rate profile, and demonstration video remain unverified.

## Initial implementation priority

1. Make one short, deterministic Lagos adventure the scene's clear opening loop; resolve the mismatch between the current market-delivery loop and the requested Tobi construction-delivery story.
2. Verify seated, hands-only completion in an active XR session; use IWER for iteration but use an actual tracked-hand-capable session before claiming Quest hand compliance.
3. Repair the existing failing regression tests and verify the authored interactions in runtime.
4. Profile Quest performance, publish the judge build, and prepare the real demonstration and asset-rights inventory.

## Continuation results — 5 November 2026

### Automated verification

- `npm run --if-present typecheck`: passed.
- `npm test`: **121 tests passed, 0 failed**. The 11 earlier cinematic failures were not 11 broken runtime features: test assertions were stale against the current APIs and authored values (PBR material values, character schedule/profile APIs, conversation return shape, artifact discovery APIs, config shape, and mission progression). The assertions were updated to exercise those current APIs and preserve mission completion/reward checks. The suite also exposed one stale grabbing config assertion (`grabbing: true` vs the actual `{ useHandPinchForGrab: true }`); that assertion now checks the actual behavior flag.
- `npm run build`: passed. The build still emits static UIKitML atlas-coverage warnings and a >500 KB chunk warning.

### Runtime and input status

XR means an immersive headset session; IWER is IWSDK’s browser based XR emulator ([Testing Your Experience](https://iwsdk.dev/guides/02-testing-experience.html)). ECS (entity-component system) is the framework’s way to attach data and behavior to scene entities. In an immersive session, a controller’s target-ray pose points where it aims, while its grip pose follows the physical handle ([XR Input](https://iwsdk.dev/concepts/xr-input.html)); the active input path is handled by IWSDK. The earlier active IWER session verified immersive VR with hand tracking, no connected controllers, and pinch grab/release on the Adire sample. That is an emulator result, not proof from a physical Quest 3.

The requested full route is still **not accepted**. In particular, `npc_tobi` is authored in the scene and has a five chapter arc, but `NpcDialogueSystem` has no Tobi branch and the active spatial mission route is Iyá Aláso’s market delivery. The authored Tobi conversation/story engine is not wired into the spatial dialogue choices. Existing snap/smooth locomotion, comfort vignette and tablet location travel do not yet prove that every required Tobi objective can be reached and completed seated, hands only.

| Opening route step | Current evidence | Hands only | Seated |
|---|---|---|---|
| Enter immersive VR | Active IWER immersive VR session observed earlier | Yes, emulator setup | Not a Quest seat test |
| Hand tutorial | Pinch grab/release on the Adire practice swatch | Yes, emulator | Swatch is positioned within seated reach; no full tutorial |
| Virtual movement / turning | IWSDK locomotion and comfort settings; tablet has location travel | Not exercised end to end with hands | Not validated end to end |
| Meet Tobi / begin conversation | Scene entity exists; no dialogue-system Tobi route | No | No |
| Inspect construction materials and clues | Story data describes site/pillar/invoice investigation; runtime objective route is not connected | No | No |
| Make meaningful decision and see outcome | Story arc contains a chapter 4 decision in data, but is not reached through the spatial dialogue flow | No | No |
| Finish and receive the Tobi outcome | Story engine has completion rewards; spatial mission does not call through this route | No | No |

### Yoruba glyph investigation

`public/fonts/NotoSans-Yoruba.ttf` includes the requested precomposed characters (Ẹ, Ọ, Ṣ, ẹ, ọ, ṣ) and tone combining marks; the accompanying OFL license is present. The running UIKit renderer uses generated MSDF atlases, not browser CSS font fallback. A runtime loader now generates a Yoruba atlas with an explicit character set and installs it on both the NPC dialogue and VR tablet roots. The browser still logs missing-glyph messages during initial UIKit startup before that async atlas is installed, and a full screenshot check with all six requested glyphs in each affected panel remains pending. Therefore the glyph fix is implemented but visual/runtime coverage is **not yet accepted**.

### Bundle investigation

The production app entry is 6,877.92 kB minified (1,772.46 kB gzip); Havok physics WASM is 2,094.56 kB (664.19 kB gzip). `game-shell` is split into a 131.83 kB chunk (32.83 kB gzip), but the main app entry remains essentially 6.88 MB. This limited split is not a material reduction of initial transfer cost. The build continues to warn about chunks over 500 kB; deeper dependency attribution and further code splitting remain open.

### Physical Quest 3 validation procedure

1. Start the managed server with `npx @iwsdk/cli dev up`, then wait for `npx @iwsdk/cli dev status` to report `browserCommandReady: true`.
2. For a local headset smoke test, connect Quest 3 to the same Wi-Fi, open the `network` URL shown by dev status in Quest Browser, accept the local development certificate warning, and launch immersive VR. For a judge-accessible build, publish the app at a public HTTPS origin first; local HTTPS is not a public submission URL.
3. Enable hand tracking in Quest settings, enter with controllers set aside, and confirm the active WebXR session reports hand tracking. Demonstrate target-ray pointing, pinch selection and release on each essential interaction; verify no controller button is needed.
4. Run the written route while seated, recording each objective, any required physical reach, comfort issue, and whether tablet travel or turning is sufficient.
5. Measure FPS on the physical headset under the full scene load and record the device, build, location, test duration, and frame-time result. Do not use desktop/IWER statistics as Quest performance evidence.
6. Record the full opening adventure from the headset using casting or headset capture. Label emulator footage as emulator footage and retain the physical device/build details with the clip.

## Remaining acceptance blockers

- Integrate Tobi’s authored story arc with the actual spatial dialogue and environmental interactions; provide a complete objective, meaningful choice, consequence, and reward path.
- Add or prove a comfortable seated virtual navigation path through that complete route and test it using hands only.
- Verify the custom Yoruba atlas after installation on the live panel and visually confirm Ẹ Ọ Ṣ ẹ ọ ṣ plus tone marks in dialogue and the tablet; remove startup coverage warnings where possible.
- Reduce the real initial entry cost further through dependency and import graph analysis.
- Run the full opening route and performance capture on a physical Quest 3; publish a public HTTPS judge build and capture the actual demonstration.

## Status correction — 5 November 2026

The earlier continuation text above records the pre-integration state and is historical. Since then, the active scene has been updated to place Tobi at the market, and `NpcDialogueSystem` now routes Tobi and Iyá Aláso into the existing `AdventureMissionSystem` dialogue and progression path. The player can investigate the drum clue, collect the guild receipt and crate, return to Tobi, choose a construction schedule, and persist the story stage and outcome. An IWER inspection confirmed Tobi's opening dialogue panel and choices; the complete route and physical Quest path remain unverified.

The 5 November 2026 master-product audit also made free exploration the default saved mode and added a response to postpone Tobi's story. Its new storage behavior is unit-tested, but the managed browser command timed out before visual/runtime verification. The current automated suite passes **122 tests with 0 failures** after updating an obsolete assertion that placed Tobi in the urban scene. `npm run --if-present typecheck` and `npm run build` pass. Build warnings for UIKitML Yoruba glyph coverage and the large initial bundle remain.

See [master-product-architecture-audit.md](master-product-architecture-audit.md) for the current architecture inventory, implementation status, risks, and roadmap. This report still does not establish physical Quest performance, hosted judge access, or complete asset/cultural provenance.
