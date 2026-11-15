# Audio Assets & Synthesis Licenses

This directory documents the legal provenance, licenses, and sound generation architecture for all audio assets in Advenquo.

---

## 1. Static Audio Files

| File | Source / Author | License | Description |
|---|---|---|---|
| `public/audio/chime.mp3` | Meta / IWSDK Scaffolding | MIT / CC0 | High-frequency discovery feedback chime used for cultural object interaction cues. |

---

## 2. Procedural Web Audio Generators

All environmental soundscapes across the four Nigerian locations (Market, Yaba, Palace, Tarkwa Bay) are mathematically synthesized in real time via the Web Audio API in `src/audio/procedural-audio-engine.ts`.

- **Engine Code License**: MIT License (same as project)
- **Acoustic Models**:
  - Gángan pitch envelope & shell resonance: Procedural mathematical synthesis.
  - Shekere noise shaping: Filtered white noise.
  - Lagos Danfo dual-tone horn: Dual harmonic oscillators (440Hz + 554Hz).
  - Studio Afrobeats bassline: 108 BPM algorithmic sequencer with low-pass filtered triangle oscillator.
  - Bronze bell partials: Additive synthesis (680Hz + 1.34x, 1.87x, 2.42x).
  - Kakaki fanfare: Sawtooth wave with dual brass formant filters.
  - Ocean waves & coastal wind: Kellet pink noise algorithm with swept biquad filters.
  - Seabird whistles: Modulated sine oscillators.

No proprietary, copyrighted, or uncredited audio samples are distributed or redistributed in this repository.
