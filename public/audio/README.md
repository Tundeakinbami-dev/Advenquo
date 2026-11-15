# Advenquo Audio System & Soundscapes

Advenquo implements a production-quality, low-latency spatial audio architecture built on Three.js, WebXR, and the Web Audio API, specifically optimized for Meta Quest 3 standalone VR headsets.

---

## 1. Environmental Soundscape Architecture

All four playable Nigerian environments feature customized ambient beds and 3D positional audio emitters with distance attenuation:

### 1. Ìsàlẹ̀ Èkó Artisan Market (`nigerian_market`)
- **Base Ambience**: Open-air crowd murmur generated via dual vocal-formant bandpass filters (F1 ~550Hz, F2 ~1500Hz) with natural breathing amplitude modulation (0.28Hz).
- **Positional Emitters**:
  - `market-talking-drum` (`[0, 0.8, -2.0]`): Authentic Yoruba Gángan tension pitch bend (140Hz -> 260Hz -> 150Hz) with wooden shell resonance and 6-step syncopation.
  - `market-shekere-percussion` (`[-2.5, 1.2, 0.0]`): Crisp gourd bead high-pass noise bursts (3.8kHz) playing offbeat shaker syncopation.
  - `market-distant-traders` (`[4.0, 1.4, -3.0]`): Intermittent Yoruba/Pidgin market bartering and greeting vocal cadences.

### 2. Yaba Creative & Transit Corridor (`lagos_urban`)
- **Base Ambience**: Continuous Lagos traffic asphalt rumble and sub-bass engine idle drone (52Hz sine + 110Hz low-pass pink noise).
- **Positional Emitters**:
  - `yaba-danfo-bus-horn` (`[5.0, 1.2, 8.0]`): Signature Lagos commercial bus horn chord (440Hz + 554Hz) with rapid double-honk ("peep-peep!").
  - `yaba-studio-afrobeats` (`[-3.5, 1.0, 1.0]`): Muffled 108 BPM syncopated Afrobeats bassline and warm keyboard groove lowpass filtered at 450Hz (sound of music inside Studio Kán).
  - `yaba-construction-activity` (`[8.0, 1.0, -2.0]`): 50Hz diesel generator hum with 100Hz harmonics and intermittent 1.8kHz metallic construction taps.

### 3. Iga Idunganran Royal Palace (`heritage_iga`)
- **Base Ambience**: Serene royal courtyard stillness with acoustic air dispersion (850Hz bandpass filter) and quiet reverent presence.
- **Positional Emitters**:
  - `palace-ceremonial-chimes` (`[0, 1.2, 142.0]`): Additive bronze bell synthesis with non-harmonic partials (680Hz, 915Hz, 1270Hz, 1650Hz) and long 3.5s exponential ring-down.
  - `palace-royal-kakaki-horn` (`[0, 1.6, 147.0]`): Ceremonial royal long trumpet (Kakaki) with rich sawtooth harmonics, dual brass formants (800Hz / 1400Hz), and regal crescendos.
  - `palace-court-murmur` (`[-2.5, 1.4, 145.0]`): Subdued whispers and respectful murmurs of royal courtiers and attendants.

### 4. Tarkwa Bay Beach (`beach_waterfront`)
- **Base Ambience**: Atlantic coastal wind rustling coconut palm fronds (400Hz bandpass filter with slow 0.12Hz gust modulation).
- **Positional Emitters**:
  - `beach-ocean-surf-waves` (`[0, 0.2, 315.0]`): Multi-stage breaking ocean surf with 7.2-second swell cycle (low-frequency wash -> sea-spray crest -> receding gravel roll).
  - `beach-fishing-canoe-water` (`[3.0, 0.3, 310.0]`): Fluid water droplet splashes and low resonant wooden canoe hull creaks (92Hz).
  - `beach-distant-seabirds` (`[-6.0, 4.0, 312.0]`): Atlantic tern and gull calls synthesized via frequency-modulated whistle chirps (3.4kHz -> 2.7kHz).

---

## 2. Meta Quest 3 Technical Safeguards

- **Autoplay Compliance**: Context starts suspended and is unlocked on first user gesture (`pointerdown`, `keydown`, `touchstart`, or `sessionstart`).
- **VR Head Tracking**: Three.js `AudioListener` is attached to `player.head` during immersive sessions, ensuring 6DOF binaural spatialization across Quest 3 lenses and headphones.
- **Crossfading & Transition Cleanliness**: Location changes trigger a smooth 1.2s crossfade. Previous environment soundscapes are completely disconnected and stopped, preventing simultaneous playback.
- **Duplicate Prevention**: Redundant transitions to the same location are rejected idempotently, preventing multiple audio instances or memory leaks.
- **Performance Budget**: Native Web Audio DSP graph runs on the browser's background audio thread. The JavaScript main thread has zero allocations in the per-frame tick, maintaining Quest 3's 72–90 FPS target.

---

## 3. Extensible Asset Bridge & Future Studio Recordings

All environmental sounds currently run on the procedural mathematical Web Audio engine, guaranteeing instant playback with zero asset download overhead.

When licensed studio field recordings are added, the engine can load them directly:
| Desired Asset | Recommended Specs | Target Location |
|---|---|---|
| `isale_eko_ambience.ogg` | 48kHz, 24-bit stereo, 45s loop | `public/audio/isale_eko_ambience.ogg` |
| `talking_drum_solo.ogg` | 48kHz, mono, dry | `public/audio/talking_drum_solo.ogg` |
| `danfo_traffic_ambience.ogg` | 48kHz, stereo | `public/audio/danfo_traffic_ambience.ogg` |
| `afrobeats_studio_loop.ogg` | 48kHz, 108 BPM stereo | `public/audio/afrobeats_studio_loop.ogg` |
| `kakaki_royal_fanfare.ogg` | 48kHz, mono | `public/audio/kakaki_royal_fanfare.ogg` |
| `tarkwa_bay_surf.ogg` | 48kHz, stereo | `public/audio/tarkwa_bay_surf.ogg` |
