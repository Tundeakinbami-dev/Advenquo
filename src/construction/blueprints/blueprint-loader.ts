/**
 * Advenquo: Construction World — Blueprint Loader
 */

import type { BlueprintDefinition } from './blueprint-types.js';
import { SMALL_HOUSE_BLUEPRINT } from './small-house-blueprint.js';
import { DUPLEX_BLUEPRINT } from './duplex.js';
import { BUNGALOW_BLUEPRINT } from './bungalow.js';
import { CASTLE_BLUEPRINT } from './castle.js';
import { MANSION_BLUEPRINT } from './mansion.js';
import { BRIDGE_BLUEPRINT } from './bridge.js';

export const SANDBOX_BLUEPRINT: BlueprintDefinition = {
  id: 'sandbox',
  title: 'Creative Construction Sandbox',
  description: 'Unrestricted modular building sandbox with live physics and structural statics.',
  estimatedBuildTimeMinutes: 0,
  foundationDimensions: [12.0, 0.1, 12.0],
  foundationPosition: [0, 0, -2.5],
  requiredQuantities: {
    clay_brick: 99,
    concrete_block: 99,
    reinforced_column: 99,
    horizontal_beam: 99,
    wall_panel: 99,
    floor_component: 99,
    roof_panel: 99,
  },
  stages: [
    {
      stageIndex: 1,
      title: 'Free Construction Sandbox',
      instruction: 'Select any material from the palette bay and assemble freely with two hands.',
      criticalCheck: 'Maintain continuous load paths down to the foundation pad.',
    },
  ],
  targets: [],
};

export class BlueprintLoader {
  private static cache: Map<string, BlueprintDefinition> = new Map();

  static {
    this.register(SMALL_HOUSE_BLUEPRINT);
    this.cache.set('small_house', SMALL_HOUSE_BLUEPRINT);
    this.register(DUPLEX_BLUEPRINT);
    this.register(BUNGALOW_BLUEPRINT);
    this.register(CASTLE_BLUEPRINT);
    this.register(MANSION_BLUEPRINT);
    this.register(BRIDGE_BLUEPRINT);
    this.register(SANDBOX_BLUEPRINT);
  }

  public static register(blueprint: BlueprintDefinition): void {
    this.cache.set(blueprint.id, blueprint);
    if (blueprint.id === 'small_house_challenge') {
      this.cache.set('small_house', blueprint);
    }
  }

  public static load(id: string): BlueprintDefinition | undefined {
    return this.cache.get(id);
  }

  public static getAll(): BlueprintDefinition[] {
    return Array.from(this.cache.values());
  }
}
