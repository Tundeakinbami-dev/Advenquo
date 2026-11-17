/**
 * Advenquo: Construction World — Material Registry
 */

import type { MaterialPhysicalProperties } from '../core/construction-types.js';
import { MATERIAL_SPECS } from './material-specs.js';

export class MaterialRegistry {
  private static instance: MaterialRegistry;
  private registry: Map<string, MaterialPhysicalProperties> = new Map();

  private constructor() {
    for (const [key, spec] of Object.entries(MATERIAL_SPECS)) {
      this.registry.set(key, spec);
    }
  }

  public static getInstance(): MaterialRegistry {
    if (!MaterialRegistry.instance) {
      MaterialRegistry.instance = new MaterialRegistry();
    }
    return MaterialRegistry.instance;
  }

  public registerMaterial(key: string, properties: MaterialPhysicalProperties): void {
    this.registry.set(key, properties);
  }

  public getMaterial(key: string): MaterialPhysicalProperties | undefined {
    return this.registry.get(key);
  }

  public hasMaterial(key: string): boolean {
    return this.registry.has(key);
  }

  public getAllMaterials(): Map<string, MaterialPhysicalProperties> {
    return new Map(this.registry);
  }
}
