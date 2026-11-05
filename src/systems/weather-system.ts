/**
 * Advenquo — WeatherSystem.
 *
 * Simulates tropical weather variations across Nigerian environments:
 * - Clear Sunny: Bright tropical solar clarity (1.2x light)
 * - Tropical Breeze: Gentle Atlantic ocean trade winds (1.0x light)
 * - Market Haze: Warm atmospheric afternoon heat & dust (0.9x light)
 * - Coastal Mist: Early morning maritime fog over Lagos Lagoon & Tarkwa Bay (0.8x light)
 * - Tropical Rain: Warm monsoon shower with petrichor & rain ambiance (0.65x light)
 */

import type { WeatherPreset, WeatherState } from './types.js';

export const WEATHER_CONFIGS: Record<WeatherPreset, WeatherState> = {
  clear_sunny: {
    preset: 'clear_sunny',
    name: 'Clear Tropical Sun',
    description: 'Bright high-noon equatorial sunlight with minimal cloud cover.',
    fogDensity: 0.0,
    lightMultiplier: 1.25,
    windSpeed: 2.5,
    rainIntensity: 0.0,
  },
  tropical_breeze: {
    preset: 'tropical_breeze',
    name: 'Atlantic Sea Breeze',
    description: 'Pleasant cooling trade winds rolling in off the Gulf of Guinea.',
    fogDensity: 0.005,
    lightMultiplier: 1.1,
    windSpeed: 6.2,
    rainIntensity: 0.0,
  },
  market_haze: {
    preset: 'market_haze',
    name: 'Harmattan & Market Haze',
    description: 'Warm golden ambient haze softening distant building silhouettes.',
    fogDensity: 0.025,
    lightMultiplier: 0.95,
    windSpeed: 1.8,
    rainIntensity: 0.0,
  },
  coastal_mist: {
    preset: 'coastal_mist',
    name: 'Lagoon Morning Mist',
    description: 'Low-lying vapor drifting off the harbor water and coconut groves.',
    fogDensity: 0.04,
    lightMultiplier: 0.85,
    windSpeed: 3.0,
    rainIntensity: 0.0,
  },
  tropical_rain: {
    preset: 'tropical_rain',
    name: 'Tropical Afternoon Shower',
    description: 'Rhythmic warm monsoon rain cooling the heated asphalt and courtyard ground.',
    fogDensity: 0.03,
    lightMultiplier: 0.7,
    windSpeed: 8.5,
    rainIntensity: 0.8,
  },
};

export class WeatherSystem {
  private static instance: WeatherSystem | null = null;
  private currentPreset: WeatherPreset = 'clear_sunny';
  private onWeatherChangeCallbacks: Array<(weather: WeatherState) => void> = [];

  public static getInstance(): WeatherSystem {
    if (!WeatherSystem.instance) {
      WeatherSystem.instance = new WeatherSystem();
    }
    return WeatherSystem.instance;
  }

  public getCurrentWeather(): WeatherState {
    return WEATHER_CONFIGS[this.currentPreset];
  }

  public getCurrentPreset(): WeatherPreset {
    return this.currentPreset;
  }

  public setWeather(preset: WeatherPreset): void {
    if (!WEATHER_CONFIGS[preset]) return;
    this.currentPreset = preset;
    const state = WEATHER_CONFIGS[preset];
    for (const cb of this.onWeatherChangeCallbacks) {
      cb(state);
    }
  }

  public cycleNextWeather(): WeatherState {
    const presets: WeatherPreset[] = [
      'clear_sunny',
      'tropical_breeze',
      'market_haze',
      'coastal_mist',
      'tropical_rain',
    ];
    const currentIndex = presets.indexOf(this.currentPreset);
    const nextPreset = presets[(currentIndex + 1) % presets.length];
    this.setWeather(nextPreset);
    return this.getCurrentWeather();
  }

  public onWeatherChange(callback: (weather: WeatherState) => void): () => void {
    this.onWeatherChangeCallbacks.push(callback);
    return () => {
      const idx = this.onWeatherChangeCallbacks.indexOf(callback);
      if (idx !== -1) this.onWeatherChangeCallbacks.splice(idx, 1);
    };
  }
}

export const weatherSystem = WeatherSystem.getInstance();
