/**
 * Advenquo — EnvironmentManager.
 *
 * Coordinates atmospheric realism across all environments:
 * - Unifies Diurnal cycles (TimeOfDaySystem) & Weather conditions (WeatherSystem)
 * - Updates DomeGradient & IBLGradient color vectors and intensities on LevelRoot
 * - Manages environmental soundscapes and ambient audio cues
 */

import { weatherSystem, WeatherSystem } from './weather-system.js';
import { timeOfDaySystem, TimeOfDaySystem } from './time-of-day-system.js';
import type { TimeOfDayPreset, WeatherPreset } from './types.js';
import type { LocationDefinition } from '../world/location-types.js';

export class EnvironmentManager {
  private static instance: EnvironmentManager | null = null;
  private weatherSys: WeatherSystem;
  private timeSys: TimeOfDaySystem;
  private activeLocation: LocationDefinition | null = null;
  private onAtmosphereUpdatedCallbacks: Array<() => void> = [];

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  constructor() {
    this.weatherSys = weatherSystem;
    this.timeSys = timeOfDaySystem;

    // Listen to diurnal and weather changes
    this.timeSys.onTimeChange(() => this._notifyAtmosphereChanged());
    this.weatherSys.onWeatherChange(() => this._notifyAtmosphereChanged());
  }

  public setLocationAtmosphere(location: LocationDefinition): void {
    this.activeLocation = location;
    if (location.atmosphere) {
      this.timeSys.setTimeOfDay(location.atmosphere.timeOfDay as TimeOfDayPreset);
    }
  }

  public getEffectiveSkyColor(): [number, number, number, number] {
    const diurnal = this.timeSys.getCurrentLighting();
    const weather = this.weatherSys.getCurrentWeather();

    // Adjust sky towards mist/rain tone if raining or misty
    if (weather.preset === 'tropical_rain') {
      return [0.25, 0.32, 0.42, 1];
    } else if (weather.preset === 'market_haze') {
      return [0.65, 0.55, 0.45, 1];
    }
    return diurnal.skyColor;
  }

  public getEffectiveEquatorColor(): [number, number, number, number] {
    const diurnal = this.timeSys.getCurrentLighting();
    const weather = this.weatherSys.getCurrentWeather();

    if (weather.preset === 'tropical_rain') {
      return [0.38, 0.42, 0.48, 1];
    }
    return diurnal.equatorColor;
  }

  public getEffectiveGroundColor(): [number, number, number, number] {
    return this.timeSys.getCurrentLighting().groundColor;
  }

  public getEffectiveIntensity(): number {
    const diurnal = this.timeSys.getCurrentLighting();
    const weather = this.weatherSys.getCurrentWeather();
    return Math.max(0.3, diurnal.intensity * weather.lightMultiplier);
  }

  public getSoundscapeDescription(): string {
    const weather = this.weatherSys.getCurrentWeather();
    const locSound = this.activeLocation?.atmosphere.soundscapeDescription || 'Ambient environmental soundscape.';
    if (weather.preset === 'tropical_rain') {
      return `Rhythmic tropical rain shower over ${this.activeLocation?.name || 'the area'}. ${locSound}`;
    }
    return locSound;
  }

  public onAtmosphereUpdated(callback: () => void): () => void {
    this.onAtmosphereUpdatedCallbacks.push(callback);
    return () => {
      const idx = this.onAtmosphereUpdatedCallbacks.indexOf(callback);
      if (idx !== -1) this.onAtmosphereUpdatedCallbacks.splice(idx, 1);
    };
  }

  private _notifyAtmosphereChanged(): void {
    for (const cb of this.onAtmosphereUpdatedCallbacks) {
      cb();
    }
  }
}

export const environmentManager = EnvironmentManager.getInstance();
