/**
 * Advenquo: Construction World — Block Factory
 *
 * Dedicated factory for masonry and foundation blocks:
 * - Clay bricks
 * - Sandcrete blocks
 * - Concrete blocks
 * - Foundation footing blocks
 */

import type { Object3D } from '@iwsdk/core';
import type { ComponentType } from '../core/construction-types.js';
import { createComponentMesh } from './component-factory.js';

export class BlockFactory {
  public static createClayBrick(): Object3D {
    return createComponentMesh('clay_brick');
  }

  public static createSandcreteBlock(): Object3D {
    return createComponentMesh('sandcrete_block');
  }

  public static createConcreteBlock(): Object3D {
    return createComponentMesh('concrete_block');
  }

  public static createFoundationBlock(): Object3D {
    return createComponentMesh('foundation_block');
  }

  public static createBlock(type: ComponentType): Object3D {
    return createComponentMesh(type);
  }
}
