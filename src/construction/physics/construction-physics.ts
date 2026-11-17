/**
 * Advenquo: Construction World — Unified Construction Physics
 */

export { ConstructionPhysicsManager } from './construction-physics-manager.js';
export { CollisionManager } from './collision-manager.js';
export { LoadDistribution } from './load-distribution.js';
export { StabilityValidator } from './stability-validator.js';

import { ConstructionPhysicsManager } from './construction-physics-manager.js';
import { CollisionManager } from './collision-manager.js';
import { LoadDistribution } from './load-distribution.js';
import { StabilityValidator } from './stability-validator.js';

export class ConstructionPhysics {
  public static getPhysicsManager(): ConstructionPhysicsManager {
    return ConstructionPhysicsManager.getInstance();
  }

  public static getCollisionManager() {
    return CollisionManager;
  }

  public static getLoadDistribution() {
    return LoadDistribution;
  }

  public static getStabilityValidator() {
    return StabilityValidator;
  }
}
