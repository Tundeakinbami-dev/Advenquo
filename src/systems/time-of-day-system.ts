/**
 * Advenquo — TimeOfDaySystem.
 *
 * Coordinates dynamic day/night cycles, sun elevation, and atmospheric lighting:
 * - Morning: Fresh dawn light with soft gold equator (0.35, 0.58, 0.92)
 * - Midday: High overhead equatorial sun, sharp shadows (0.45, 0.65, 0.95)
 * - Golden Hour: Warm amber rays glancing off carved verandas (0.55, 0.45, 0.75)
 * - Coastal Sunset: Rich violet and blazing orange horizon (0.3, 0.65, 0.9)
 * - Night: Indigo-navy starlit sky with glowing urban streetlights and palace lanterns (0.05, 0.08, 0.18)
 */

import type { TimeOfDayPreset, DiurnalLighting } from './types.js';

export const DIURNAL_CONFIGS: Record<TimeOfDayPreset, DiurnalLighting> = {
  morning: {
    timeOfDay: 'morning',
    sunElevation: 25,
    skyColor: [0.35, 0.58, 0.92, 1],
    equatorColor: [0.92, 0.78, 0.62, 1],
    groundColor: [0.45, 0.32, 0.22, 1],
    intensity: 1.15,
  },
  midday: {
    timeOfDay: 'midday',
    sunElevation: 75,
    skyColor: [0.45, 0.65, 0.95, 1],
    equatorColor: [0.88, 0.9, 0.94, 1],
    groundColor: [0.3, 0.32, 0.35, 1],
    intensity: 1.35,
  },
  golden_hour: {
    timeOfDay: 'golden_hour',
    sunElevation: 15,
    skyColor: [0.55, 0.45, 0.75, 1],
    equatorColor: [0.98, 0.72, 0.42, 1],
    groundColor: [0.55, 0.38, 0.28, 1],
    intensity: 1.1,
  },
  coastal_sunset: {
    timeOfDay: 'coastal_sunset',
    sunElevation: 5,
    skyColor: [0.3, 0.65, 0.9, 1],
    equatorColor: [0.95, 0.85, 0.72, 1],
    groundColor: [0.85, 0.75, 0.55, 1],
    intensity: 1.05,
  },
  night: {
    timeOfDay: 'night',
    sunElevation: -20,
    skyColor: [0.05, 0.08, 0.18, 1],
    equatorColor: [0.12, 0.15, 0.28, 1],
    groundColor: [0.08, 0.08, 0.12, 1],
    intensity: 0.45,
  },
};

export class TimeOfDaySystem {
  private static instance: TimeOfDaySystem | null = null;
  private currentPreset: TimeOfDayPreset = 'morning';
  private autoCycle = false;
  private cycleTimer = 0;
  private readonly cycleDuration = 60; // Seconds per time-of-day step
  private onTimeChangeCallbacks: Array<(lighting: DiurnalLighting) => void> = [];

  public static getInstance(): TimeOfDaySystem {
    if (!TimeOfDaySystem.instance) {
      TimeOfDaySystem.instance = new TimeOfDaySystem();
    }
    return TimeOfDaySystem.instance;
  }

  public getCurrentLighting(): DiurnalLighting {
    return DIURNAL_CONFIGS[this.currentPreset];
  }

  public getCurrentPreset(): TimeOfDayPreset {
    return this.currentPreset;
  }

  public setTimeOfDay(preset: TimeOfDayPreset): void {
    if (!DIURNAL_CONFIGS[preset]) return;
    this.currentPreset = preset;
    const lighting = DIURNAL_CONFIGS[preset];
    for (const cb of this.onTimeChangeCallbacks) {
      cb(lighting);
    }
  }

  public cycleNextTime(): DiurnalLighting {
    const presets: TimeOfDayPreset[] = [
      'morning',
      'midday',
      'golden_hour',
      'coastal_sunset',
      'night',
    ];
    const currentIndex = presets.indexOf(this.currentPreset);
    const nextPreset = presets[(currentIndex + 1) % presets.length];
    this.setTimeOfDay(nextPreset);
    return this.getCurrentLighting();
  }

  public setAutoCycle(enabled: boolean): void {
    this.autoCycle = enabled;
  }

  public isAutoCycleEnabled(): boolean {
    return this.autoCycle;
  }

  public update(delta: number): void {
    if (!this.autoCycle) return;
    this.cycleTimer += delta;
    if (this.cycleTimer >= this.cycleDuration) {
      this.cycleTimer = 0;
      this.cycleNextTime();
    }
  }

  public onTimeChange(callback: (lighting: DiurnalLighting) => void): () => void {
    this.onTimeChangeCallbacks.push(callback);
    return () => {
      const idx = this.onTimeChangeCallbacks.indexOf(callback);
      if (idx !== -1) this.onTimeChangeCallbacks.splice(idx, 1);
    };
  }
}

export const timeOfDaySystem = TimeOfDaySystem.getInstance();
