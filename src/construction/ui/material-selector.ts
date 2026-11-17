/**
 * Advenquo: Construction World — Seated Material Selector
 *
 * Positions the material supply carousel within comfortable seated arm reach:
 * - Arranged in a gentle arc 0.50m from the seated player
 * - Rotates or scrolls through available unlocked components
 * - Direct grab from palette spawns new block into the player's pinching hand
 */

import type { ComponentType } from '../core/construction-types.js';
import { CONSTRUCTION_CATALOG } from '../materials/construction-catalog.js';

export interface MaterialPaletteSlot {
  type: ComponentType;
  name: string;
  isUnlocked: boolean;
  requiresTwoHands: boolean;
  palletPosition: [number, number, number];
}

export class MaterialSelector {
  private availableComponents: ComponentType[] = [];

  constructor(initialUnlocked?: ComponentType[]) {
    this.availableComponents = initialUnlocked || [
      'clay_brick',
      'concrete_block',
      'reinforced_column',
      'horizontal_beam',
      'wall_panel',
      'roof_panel',
    ];
  }

  public setUnlockedComponents(components: ComponentType[]): void {
    this.availableComponents = [...components];
  }

  /**
   * Generates 3D ergonomic slot positions for an arc palette in front of seated player.
   */
  public getSeatedPaletteSlots(
    tableCenter: [number, number, number]
  ): MaterialPaletteSlot[] {
    const slots: MaterialPaletteSlot[] = [];
    const count = this.availableComponents.length;
    if (count === 0) return slots;

    const arcRadius = 0.55; // 0.55m from player center
    const arcSpreadRad = Math.PI * 0.6; // 108 degree comfortable arc
    const startAngle = -arcSpreadRad / 2;
    const stepAngle = count > 1 ? arcSpreadRad / (count - 1) : 0;

    for (let i = 0; i < count; i++) {
      const type = this.availableComponents[i];
      const spec = CONSTRUCTION_CATALOG[type];
      const angle = startAngle + i * stepAngle;

      // Arc coordinates around table center
      const px = tableCenter[0] + Math.sin(angle) * arcRadius;
      const py = tableCenter[1] + 0.05; // Slightly elevated above surface
      const pz = tableCenter[2] + (Math.cos(angle) * arcRadius - arcRadius);

      slots.push({
        type,
        name: spec ? spec.name : type,
        isUnlocked: true,
        requiresTwoHands: spec ? spec.requiresTwoHands : false,
        palletPosition: [px, py, pz],
      });
    }

    return slots;
  }
}
