# World navigation audit

Date: 5 November 2026. This records the first movement correction for the requested living-world work; it is not a completion report for the full prompt.

## Existing architecture and findings

- IWSDK owns the camera and persistent player rig. The camera's position is a local eye offset relative to the player; `world.player.position` is the world-space locomotion origin.
- `src/player-controller-system.ts` is the app's desktop/mobile controller. It reads WASD/arrow keys, mouse drag, and a left/right touch split. Before this change it treated `world.camera.position` as the world-space player location, wrote world X/Z into the camera's local eye offset, then copied the camera values to the player. This mixed coordinate spaces and could move the view away from the player rig.
- The project already enables IWSDK locomotion, physics, and WebXR hand tracking in `iwsdk.config.json`. XR is an immersive session; IWER is the browser-based XR emulator. The app's custom controller explicitly avoids desktop movement while immersive.
- `src/world-streaming-system.ts` swaps visibility for `LocationAnchor` entities and teleports between four named destinations. These transitions are menu/route travel, not continuous travel between neighbouring streets or asynchronous scene streaming.
- Current desktop collision consists of a rectangular clamp plus one market veranda wall check. It is not geometry-based collision. Scene locations are loaded into the world and hidden by anchor; this is not chunk loading/unloading or LOD.
- `src/systems/cinematic-camera-system.ts` owns conversation framing and head-bob. `src/responsive-ui-system.ts` adjusts the non-immersive camera on resize. XR pose, pinch selection, and seated behavior require an active headset session to validate.

## First correction

- Desktop/mobile translation now reads and updates the player rig's world-space position while preserving the camera's local eye offset.
- Yaw is applied to the player rig and pitch to the attached camera in non-immersive play. Travel teleports update the player origin and reset local pitch/yaw.
- Desktop click now requests pointer lock where supported, uses movement deltas while locked, retains drag-look fallback, and Escape releases pointer lock. Window blur clears held movement and touch state. Listeners have cleanup handlers.
- The Codex preview host rejects pointer lock with `WrongDocumentError` because the app is embedded. The rejected request is now caught, so it no longer becomes an unhandled browser error. Keyboard locomotion still works in that host; mouse yaw was not cleanly measurable there and remains unverified.
- Initial active-location setup now applies the location spawn and boundaries, including saved-location restoration.
- The desktop proximity dialogue check now reads the camera's world position when no XR head pose is available, ignores hidden NPCs, and requires the player to face a nearby NPC. A 5 cm exclusive radius margin prevents the initial player origin from auto-opening Baba's dialogue at exactly his 3.8 m interaction boundary before the saved market spawn applies.
- Conversation camera framing now converts the NPC-relative world target into the camera rig's local space. Closing dialogue eases back to the saved exploration camera position instead of leaving the player at the NPC framing offset.

## Verification and scope

- `npm run --if-present typecheck`: passed.
- `npm test`: 122 passed, 0 failed.
- Managed runtime: after reload, the player rig started at approximately `[0, 0.089, 1.200]`; holding W moved it to `[-0.244, 0.158, -0.339]`. A further interval moved it to `[-0.480, 0.019, -1.840]`. This proves keyboard locomotion changes the player rig's Transform in IWER/host runtime; it does not prove physical headset behavior or geometry collision.
- Camera debug replay: before the startup-dialogue fix, the camera child was at approximately `[0.45, 1.53, -2.15]`, facing Baba; this came from proximity dialogue firing at the world origin before the 100 ms saved-spawn initialization. After the fix, a clean restart reported camera local position `[0, 1.6, 0]` and identity orientation; after three fixed 16 ms ECS steps it remained at that pose. The player was also no longer immediately placed in Baba's close-up.
- Browser console sample contained no errors; it did contain existing font glyph warnings.
- `npm run build`: passed after the movement changes. Vite emitted the same UIKit font glyph warnings and >500 kB entry chunk warning already present in the rendering audit.

## Still needed for the requested living world

- Directly verify mouse yaw with a reliable browser input trace, mobile joystick and touch-look, XR headset pose, hand pinch, seated mode, and camera stability in their supported runtimes. Pointer lock is rejected inside the embedded preview; the error is caught and drag-look remains as the fallback.
- Replace the bounds-only collision with a collision-aware movement approach and test the market's walls and obstacles.
- Extend the market into one genuinely connected neighbourhood, preserving player position and orientation at seams. The current location routes teleport and do not satisfy this requirement.
- Add appropriate near/mid/far detail management and asynchronous region loading only after the connected layout and asset boundaries are authored.
- Add restrained pedestrian/trader/vehicle/environment motion and spatial ambience after collision/path rules exist.
- Measure FPS, frame time, memory, and load/transition time separately in desktop, IWER, and physical Quest. No physical Quest was available in this audit.
