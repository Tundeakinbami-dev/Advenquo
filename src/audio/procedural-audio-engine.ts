/**
 * Advenquo — Procedural Web Audio Synthesis Engine.
 *
 * Implements real-time mathematical audio synthesis for all four Nigerian environments:
 * 1. Ìsàlẹ̀ Èkó Artisan Market: Formant crowd murmurs, distant bartering, Yoruba Gángan talking drum, Shekere shaker.
 * 2. Yaba Tech Corridor: Lagos traffic asphalt drone, Danfo bus dual-tone horn, muffled studio Afrobeats groove, construction taps & generator.
 * 3. Iga Idunganran Royal Palace: Additive bronze bell chimes, ceremonial Kakaki long trumpets, reverent court presence.
 * 4. Tarkwa Bay Beach: Multi-stage ocean wave surf swells, coastal palm wind, FM seabird chirps, canoe hull water lap & creaks.
 *
 * Designed for Meta Quest 3 WebXR:
 * - High-efficiency native Web Audio DSP graph runs on background audio thread
 * - Zero allocations in per-frame tick
 * - Seamless fallback in Node/testing environments
 */

export interface ProceduralSoundHandle {
  node: any; // AudioNode or mock
  sourceNode?: any;
  gainNode: any;
  stop: () => void;
  disconnect: () => void;
}

export class ProceduralAudioEngine {
  private static instance: ProceduralAudioEngine | null = null;

  public static getInstance(): ProceduralAudioEngine {
    if (!ProceduralAudioEngine.instance) {
      ProceduralAudioEngine.instance = new ProceduralAudioEngine();
    }
    return ProceduralAudioEngine.instance;
  }

  // --------------------------------------------------------------------------
  // NOISE GENERATOR HELPERS
  // --------------------------------------------------------------------------

  /**
   * Generates a 2-second looping white/pink noise AudioBuffer.
   */
  public createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' = 'pink'): AudioBuffer | null {
    if (!ctx || typeof ctx.createBuffer !== 'function') return null;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      // Pink noise using Paul Kellet's filter method
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  // --------------------------------------------------------------------------
  // 1. ÌSÀLẸ̀ ÈKÓ MARKET SOUNDS
  // --------------------------------------------------------------------------

  /**
   * Market Crowd Murmur: Multi-formant filtered noise shaped to vocal resonances
   * (F1 ~550Hz, F2 ~1500Hz) with gentle low-frequency breathing modulation.
   */
  public createMarketCrowdMurmur(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const noiseBuffer = this.createNoiseBuffer(ctx, 'pink');
    if (!noiseBuffer) return this._createMockHandle();

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Formant filter 1 (lower vowel resonance)
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.value = 550;
    formant1.Q.value = 3.0;

    // Formant filter 2 (mid vowel resonance)
    const formant2 = ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.value = 1500;
    formant2.Q.value = 2.5;

    // LFO to modulate amplitude simulating ebb and flow of crowd chatter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.28; // ~3.5s breathing cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.35;

    // Wire: noiseSource -> formant1 & formant2 -> gainNode -> destination
    noiseSource.connect(formant1);
    noiseSource.connect(formant2);
    formant1.connect(gainNode);
    formant2.connect(gainNode);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    try {
      noiseSource.start();
      lfo.start();
    } catch (_) {}

    return {
      node: gainNode,
      sourceNode: noiseSource,
      gainNode,
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
        } catch (_) {}
      },
      disconnect: () => {
        try {
          noiseSource.disconnect();
          formant1.disconnect();
          formant2.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
          gainNode.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Distant Bartering & Greetings: Intermittent conversational bursts
   */
  public createDistantConversations(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const triggerMurmurBurst = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const burstGain = ctx.createGain();

      // Pitch in vocal range (160Hz - 240Hz)
      const baseFreq = 160 + Math.random() * 80;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(baseFreq * (0.9 + Math.random() * 0.3), ctx.currentTime + 0.4);

      filter.type = 'bandpass';
      filter.frequency.value = 1200 + Math.random() * 600;
      filter.Q.value = 4.0;

      burstGain.gain.setValueAtTime(0, ctx.currentTime);
      burstGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.08);
      burstGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(filter);
      filter.connect(burstGain);
      burstGain.connect(masterGain);

      try {
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch (_) {}

      // Schedule next burst after 3 - 6 seconds
      const nextDelay = 3000 + Math.random() * 3000;
      timer = setTimeout(triggerMurmurBurst, nextDelay);
    };

    timer = setTimeout(triggerMurmurBurst, 1500);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Yoruba Gángan Talking Drum: Pitch bend tension envelope (140Hz -> 260Hz -> 150Hz)
   * with wooden body resonance and syncopated rhythmic cadence.
   */
  public createTalkingDrum(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let beatStep = 0;

    // Traditional Yoruba 6-step syncopation pattern
    const pattern = [
      { startPitch: 140, peakPitch: 240, duration: 0.3, rest: 500 },
      { startPitch: 180, peakPitch: 220, duration: 0.2, rest: 250 },
      { startPitch: 220, peakPitch: 280, duration: 0.25, rest: 450 },
      { startPitch: 150, peakPitch: 200, duration: 0.2, rest: 300 },
      { startPitch: 160, peakPitch: 250, duration: 0.35, rest: 600 },
      { startPitch: 130, peakPitch: 190, duration: 0.4, rest: 900 },
    ];

    const playDrumStroke = () => {
      if (isDisposed) return;
      if (ctx.state === 'running') {
        const stroke = pattern[beatStep % pattern.length];
        beatStep++;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const bodyFilter = ctx.createBiquadFilter();
        const strokeGain = ctx.createGain();

        // Realistic drum skin pitch bend (tension squeeze)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(stroke.startPitch, now);
        osc.frequency.exponentialRampToValueAtTime(stroke.peakPitch, now + stroke.duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(stroke.startPitch * 0.95, now + stroke.duration);

        // Body resonance (wooden drum shell)
        bodyFilter.type = 'bandpass';
        bodyFilter.frequency.value = 280;
        bodyFilter.Q.value = 4.5;

        // Amplitude envelope (fast stick attack, resonant body ring)
        strokeGain.gain.setValueAtTime(0, now);
        strokeGain.gain.linearRampToValueAtTime(0.4, now + 0.015);
        strokeGain.gain.exponentialRampToValueAtTime(0.001, now + stroke.duration);

        osc.connect(bodyFilter);
        bodyFilter.connect(strokeGain);
        strokeGain.connect(masterGain);

        try {
          osc.start(now);
          osc.stop(now + stroke.duration + 0.05);
        } catch (_) {}

        timer = setTimeout(playDrumStroke, stroke.rest);
      } else {
        timer = setTimeout(playDrumStroke, 1000);
      }
    };

    timer = setTimeout(playDrumStroke, 800);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Shekere Shaker: High-passed white noise bursts playing offbeat syncopations.
   */
  public createShekere(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.2;
    masterGain.connect(destination);

    const noiseBuffer = this.createNoiseBuffer(ctx, 'white');
    if (!noiseBuffer) return this._createMockHandle();

    let isDisposed = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    // Offbeat shaker rhythm (~250ms cadence)
    const playShakerShake = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3800; // Crisp gourd bead sizzle

      const shakeGain = ctx.createGain();
      shakeGain.gain.setValueAtTime(0, now);
      shakeGain.gain.linearRampToValueAtTime(0.25, now + 0.012);
      shakeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      noiseSource.connect(filter);
      filter.connect(shakeGain);
      shakeGain.connect(masterGain);

      try {
        noiseSource.start(now);
        noiseSource.stop(now + 0.1);
      } catch (_) {}
    };

    interval = setInterval(playShakerShake, 350);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (interval) clearInterval(interval);
      },
      disconnect: () => {
        isDisposed = true;
        if (interval) clearInterval(interval);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  // --------------------------------------------------------------------------
  // 2. YABA TECH CORRIDOR SOUNDS
  // --------------------------------------------------------------------------

  /**
   * Lagos Traffic Drone: Low frequency asphalt rumble, passing vehicle hums.
   */
  public createLagosTrafficDrone(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const noiseBuffer = this.createNoiseBuffer(ctx, 'pink');
    if (!noiseBuffer) return this._createMockHandle();

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Low-pass filter for distant engine hum and asphalt friction
    const roadFilter = ctx.createBiquadFilter();
    roadFilter.type = 'lowpass';
    roadFilter.frequency.value = 110;

    // Sub-bass engine idle drone
    const subEngine = ctx.createOscillator();
    subEngine.type = 'sine';
    subEngine.frequency.value = 52; // 52Hz engine rumble

    const subGain = ctx.createGain();
    subGain.gain.value = 0.2;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;

    noiseSource.connect(roadFilter);
    roadFilter.connect(masterGain);

    subEngine.connect(subGain);
    subGain.connect(masterGain);

    masterGain.connect(destination);

    try {
      noiseSource.start();
      subEngine.start();
    } catch (_) {}

    return {
      node: masterGain,
      sourceNode: noiseSource,
      gainNode: masterGain,
      stop: () => {
        try {
          noiseSource.stop();
          subEngine.stop();
        } catch (_) {}
      },
      disconnect: () => {
        try {
          noiseSource.disconnect();
          subEngine.disconnect();
          roadFilter.disconnect();
          subGain.disconnect();
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Danfo Bus Horn: Iconic dual-tone harmonic horn burst (440Hz + 554Hz) with "peep-peep" cadence.
   */
  public createDanfoBusHorn(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const beepHorn = (delay: number) => {
      const now = ctx.currentTime + delay;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const hornGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.value = 440; // Tone 1: A4
      osc2.type = 'sawtooth';
      osc2.frequency.value = 554; // Tone 2: C#5 (major 3rd)

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 2.0;

      hornGain.gain.setValueAtTime(0, now);
      hornGain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      hornGain.gain.linearRampToValueAtTime(0.22, now + 0.12);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(hornGain);
      hornGain.connect(masterGain);

      try {
        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now);
        osc2.stop(now + 0.2);
      } catch (_) {}
    };

    const scheduleDanfoHornSequence = () => {
      if (isDisposed) return;
      if (ctx.state === 'running') {
        // Double honk "peep-peep!"
        beepHorn(0);
        beepHorn(0.22);
      }
      // Periodic honk every 8 - 14 seconds
      const nextDelay = 8000 + Math.random() * 6000;
      timer = setTimeout(scheduleDanfoHornSequence, nextDelay);
    };

    timer = setTimeout(scheduleDanfoHornSequence, 2000);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Distant Afrobeats Groove: Muffled 108 BPM syncopated bass, warm electric piano chords,
   * lowpass filtered at 450Hz simulating music drifting from Studio Kán.
   */
  public createAfrobeatsMusic(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.28;

    // Wall filter: lowpass at 450Hz gives authentic distant room absorption
    const wallFilter = ctx.createBiquadFilter();
    wallFilter.type = 'lowpass';
    wallFilter.frequency.value = 450;
    wallFilter.Q.value = 1.0;

    masterGain.connect(wallFilter);
    wallFilter.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let step = 0;

    // 8-step Afrobeats bassline (F#m - E progression)
    const bassline = [92.5, 92.5, 0, 110, 0, 82.4, 82.4, 73.4];

    const playAfrobeatStep = () => {
      if (isDisposed) return;
      if (ctx.state === 'running') {
        const now = ctx.currentTime;
        const freq = bassline[step % bassline.length];
        step++;

        if (freq > 0) {
          const osc = ctx.createOscillator();
          const bassGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          bassGain.gain.setValueAtTime(0, now);
          bassGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

          osc.connect(bassGain);
          bassGain.connect(masterGain);

          try {
            osc.start(now);
            osc.stop(now + 0.28);
          } catch (_) {}
        }
      }
      // 108 BPM = ~277ms sixteenth note
      timer = setTimeout(playAfrobeatStep, 277);
    };

    timer = setTimeout(playAfrobeatStep, 500);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
          wallFilter.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Construction Site Activity: 50Hz generator hum and intermittent metallic tapping.
   */
  public createConstructionSounds(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(destination);

    // Continuous 50Hz diesel generator hum
    const genOsc = ctx.createOscillator();
    genOsc.type = 'sawtooth';
    genOsc.frequency.value = 50;

    const genFilter = ctx.createBiquadFilter();
    genFilter.type = 'lowpass';
    genFilter.frequency.value = 160;

    const genGain = ctx.createGain();
    genGain.gain.value = 0.12;

    genOsc.connect(genFilter);
    genFilter.connect(genGain);
    genGain.connect(masterGain);

    try {
      genOsc.start();
    } catch (_) {}

    // Intermittent metallic taps
    let isDisposed = false;
    let tapTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerMetallicTap = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const tapOsc = ctx.createOscillator();
      tapOsc.type = 'sine';
      tapOsc.frequency.setValueAtTime(1800 + Math.random() * 400, now);

      const tapFilter = ctx.createBiquadFilter();
      tapFilter.type = 'bandpass';
      tapFilter.frequency.value = 1800;
      tapFilter.Q.value = 8.0;

      const tapGain = ctx.createGain();
      tapGain.gain.setValueAtTime(0, now);
      tapGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      tapOsc.connect(tapFilter);
      tapFilter.connect(tapGain);
      tapGain.connect(masterGain);

      try {
        tapOsc.start(now);
        tapOsc.stop(now + 0.1);
      } catch (_) {}

      tapTimer = setTimeout(triggerMetallicTap, 2000 + Math.random() * 3000);
    };

    tapTimer = setTimeout(triggerMetallicTap, 1200);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (tapTimer) clearTimeout(tapTimer);
        try {
          genOsc.stop();
        } catch (_) {}
      },
      disconnect: () => {
        isDisposed = true;
        if (tapTimer) clearTimeout(tapTimer);
        try {
          genOsc.disconnect();
          genFilter.disconnect();
          genGain.disconnect();
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  // --------------------------------------------------------------------------
  // 3. IGA IDUNGANRAN ROYAL PALACE SOUNDS
  // --------------------------------------------------------------------------

  /**
   * Resonant Bronze Bell Chimes: Metallic additive synthesis (fundamental 680Hz + non-harmonic partials)
   * with exponential decay (tau = 3.5s).
   */
  public createCeremonialBronzeChimes(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.28;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const ringBronzeBell = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const fundamental = 680;
      // Non-harmonic metallic partials: 1.0, 1.34, 1.87, 2.42
      const partials = [
        { f: fundamental, gain: 0.35, decay: 3.2 },
        { f: fundamental * 1.34, gain: 0.25, decay: 2.8 },
        { f: fundamental * 1.87, gain: 0.18, decay: 2.2 },
        { f: fundamental * 2.42, gain: 0.12, decay: 1.6 },
      ];

      partials.forEach(({ f, gain, decay }) => {
        const osc = ctx.createOscillator();
        const pGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = f;

        pGain.gain.setValueAtTime(0, now);
        pGain.gain.linearRampToValueAtTime(gain, now + 0.015);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(pGain);
        pGain.connect(masterGain);

        try {
          osc.start(now);
          osc.stop(now + decay + 0.1);
        } catch (_) {}
      });

      // Ring chime every 7 - 12 seconds
      timer = setTimeout(ringBronzeBell, 7000 + Math.random() * 5000);
    };

    timer = setTimeout(ringBronzeBell, 1000);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Royal Kakaki Long Trumpet: Sawtooth through dual brass formants (800Hz / 1400Hz)
   * sounding regal flourishes.
   */
  public createKakakiTrumpet(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.26;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const playKakakiCall = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      // Traditional royal fanfare notes (Bb3, D4, F4)
      const notes = [
        { f: 233.08, delay: 0.0, dur: 0.4 },
        { f: 293.66, delay: 0.45, dur: 0.4 },
        { f: 349.23, delay: 0.9, dur: 1.1 },
      ];

      notes.forEach(({ f, delay, dur }) => {
        const tStart = now + delay;
        const osc = ctx.createOscillator();
        const brassFilter = ctx.createBiquadFilter();
        const noteGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, tStart);
        // Gentle royal brass pitch vibrato
        osc.frequency.linearRampToValueAtTime(f * 1.01, tStart + dur * 0.5);
        osc.frequency.linearRampToValueAtTime(f, tStart + dur);

        brassFilter.type = 'bandpass';
        brassFilter.frequency.value = 1100;
        brassFilter.Q.value = 3.5;

        noteGain.gain.setValueAtTime(0, tStart);
        noteGain.gain.linearRampToValueAtTime(0.28, tStart + 0.08); // Brass swell
        noteGain.gain.exponentialRampToValueAtTime(0.001, tStart + dur);

        osc.connect(brassFilter);
        brassFilter.connect(noteGain);
        noteGain.connect(masterGain);

        try {
          osc.start(tStart);
          osc.stop(tStart + dur + 0.1);
        } catch (_) {}
      });

      // Fanfare every 14 - 22 seconds
      timer = setTimeout(playKakakiCall, 14000 + Math.random() * 8000);
    };

    timer = setTimeout(playKakakiCall, 3500);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Palace Courtyard Murmur: Reverent, quiet stillness and subtle courtyard whispers.
   */
  public createPalaceCourtyardMurmur(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const noiseBuffer = this.createNoiseBuffer(ctx, 'pink');
    if (!noiseBuffer) return this._createMockHandle();

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // High air presence filter
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 850;
    airFilter.Q.value = 1.2;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.18;

    noiseSource.connect(airFilter);
    airFilter.connect(masterGain);
    masterGain.connect(destination);

    try {
      noiseSource.start();
    } catch (_) {}

    return {
      node: masterGain,
      sourceNode: noiseSource,
      gainNode: masterGain,
      stop: () => {
        try {
          noiseSource.stop();
        } catch (_) {}
      },
      disconnect: () => {
        try {
          noiseSource.disconnect();
          airFilter.disconnect();
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  // --------------------------------------------------------------------------
  // 4. TARKWA BAY BEACH SOUNDS
  // --------------------------------------------------------------------------

  /**
   * Gentle Ocean Waves: Continuous multi-stage pink noise swept with 7.2-second rhythmic swell cycle.
   */
  public createOceanWaves(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const noiseBuffer = this.createNoiseBuffer(ctx, 'pink');
    if (!noiseBuffer) return this._createMockHandle();

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Swept lowpass for wave body
    const waveFilter = ctx.createBiquadFilter();
    waveFilter.type = 'lowpass';
    waveFilter.frequency.value = 280;

    // LFO for periodic wave swell (7.2s swell cycle)
    const swellLFO = ctx.createOscillator();
    swellLFO.type = 'sine';
    swellLFO.frequency.value = 1 / 7.2;

    // Modulate filter cutoff (180Hz to 650Hz as wave crests and washes)
    const filterMod = ctx.createGain();
    filterMod.gain.value = 250;
    swellLFO.connect(filterMod);
    filterMod.connect(waveFilter.frequency);

    // Modulate wave amplitude
    const ampMod = ctx.createGain();
    ampMod.gain.value = 0.2;
    swellLFO.connect(ampMod);

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.38;
    ampMod.connect(masterGain.gain);

    noiseSource.connect(waveFilter);
    waveFilter.connect(masterGain);
    masterGain.connect(destination);

    try {
      noiseSource.start();
      swellLFO.start();
    } catch (_) {}

    return {
      node: masterGain,
      sourceNode: noiseSource,
      gainNode: masterGain,
      stop: () => {
        try {
          noiseSource.stop();
          swellLFO.stop();
        } catch (_) {}
      },
      disconnect: () => {
        try {
          noiseSource.disconnect();
          swellLFO.disconnect();
          filterMod.disconnect();
          ampMod.disconnect();
          waveFilter.disconnect();
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Coastal Palm Wind: Atlantic sea breeze rustling palm fronds.
   */
  public createCoastalWind(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const noiseBuffer = this.createNoiseBuffer(ctx, 'pink');
    if (!noiseBuffer) return this._createMockHandle();

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 2.2;

    // Slow gust modulation (0.12Hz = ~8.3s gust period)
    const gustLFO = ctx.createOscillator();
    gustLFO.type = 'sine';
    gustLFO.frequency.value = 0.12;

    const gustGain = ctx.createGain();
    gustGain.gain.value = 0.12;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;

    gustLFO.connect(gustGain);
    gustGain.connect(masterGain.gain);

    noiseSource.connect(windFilter);
    windFilter.connect(masterGain);
    masterGain.connect(destination);

    try {
      noiseSource.start();
      gustLFO.start();
    } catch (_) {}

    return {
      node: masterGain,
      sourceNode: noiseSource,
      gainNode: masterGain,
      stop: () => {
        try {
          noiseSource.stop();
          gustLFO.stop();
        } catch (_) {}
      },
      disconnect: () => {
        try {
          noiseSource.disconnect();
          gustLFO.disconnect();
          gustGain.disconnect();
          windFilter.disconnect();
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Distant Seabirds: High-pitched FM chirps (2.8kHz - 3.6kHz) at natural intervals.
   */
  public createSeabirdChirps(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.24;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const chirpBird = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const chirpGain = ctx.createGain();

      osc.type = 'sine';
      // Tern whistle down-chirp
      osc.frequency.setValueAtTime(3400, now);
      osc.frequency.linearRampToValueAtTime(2700, now + 0.12);

      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(chirpGain);
      chirpGain.connect(masterGain);

      try {
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (_) {}

      // Schedule next chirp after 4 - 9 seconds
      timer = setTimeout(chirpBird, 4000 + Math.random() * 5000);
    };

    timer = setTimeout(chirpBird, 2000);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  /**
   * Fishing Canoe Waterfront: Gentle water droplet lap and low resonant wood hull creaking.
   */
  public createWaterfrontCanoeWater(ctx: AudioContext, destination: any): ProceduralSoundHandle {
    if (!ctx || !destination || typeof ctx.createGain !== 'function') {
      return this._createMockHandle();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(destination);

    let isDisposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const waterLap = () => {
      if (isDisposed || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      // Fluid droplet splash
      const dropOsc = ctx.createOscillator();
      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(600 + Math.random() * 400, now);
      dropOsc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

      const dropGain = ctx.createGain();
      dropGain.gain.setValueAtTime(0, now);
      dropGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      dropOsc.connect(dropGain);
      dropGain.connect(masterGain);

      try {
        dropOsc.start(now);
        dropOsc.stop(now + 0.2);
      } catch (_) {}

      // Occasional wooden hull creak
      if (Math.random() > 0.6) {
        const creakOsc = ctx.createOscillator();
        creakOsc.type = 'sawtooth';
        creakOsc.frequency.setValueAtTime(92, now + 0.1);

        const creakFilter = ctx.createBiquadFilter();
        creakFilter.type = 'bandpass';
        creakFilter.frequency.value = 320;
        creakFilter.Q.value = 4.0;

        const creakGain = ctx.createGain();
        creakGain.gain.setValueAtTime(0, now + 0.1);
        creakGain.gain.linearRampToValueAtTime(0.14, now + 0.18);
        creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        creakOsc.connect(creakFilter);
        creakFilter.connect(creakGain);
        creakGain.connect(masterGain);

        try {
          creakOsc.start(now + 0.1);
          creakOsc.stop(now + 0.5);
        } catch (_) {}
      }

      timer = setTimeout(waterLap, 2500 + Math.random() * 2500);
    };

    timer = setTimeout(waterLap, 1000);

    return {
      node: masterGain,
      gainNode: masterGain,
      stop: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
      },
      disconnect: () => {
        isDisposed = true;
        if (timer) clearTimeout(timer);
        try {
          masterGain.disconnect();
        } catch (_) {}
      },
    };
  }

  // --------------------------------------------------------------------------
  // MOCK FALLBACK (for headless / non-audio environments)
  // --------------------------------------------------------------------------

  private _createMockHandle(): ProceduralSoundHandle {
    return {
      node: null,
      gainNode: {
        gain: {
          value: 0,
          setValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: () => {},
        disconnect: () => {},
      },
      stop: () => {},
      disconnect: () => {},
    };
  }
}

export const proceduralAudioEngine = ProceduralAudioEngine.getInstance();
