/**
 * Advenquo: Construction World — Construction Workshop Environment Asset
 *
 * Builds the dedicated 3D workshop environment:
 * - Foundation construction pad (2.8m x 2.8m at Z = -2.5m)
 * - Heavy-timber workshop workbenches and material supply pallets
 * - Tool racks and surveyor equipment matching Studio Kán's aesthetic
 * - Deterministic, side-effect free: parentless Object3D, safe for dual JS realm evaluation
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

import { pbrMaterialSystem } from '../../systems/pbr-material-system.js';
import { createComponentMesh } from '../materials/component-factory.js';

export function buildConstructionWorkshop(): Object3D {
  const root = new Object3D();
  root.name = 'ConstructionWorkshopCompound';

  const concreteMat = pbrMaterialSystem.getMaterial('cured_concrete');
  const woodMat = pbrMaterialSystem.getMaterial('african_iroko');
  const steelMat = pbrMaterialSystem.getMaterial('steel_scaffold');
  const soilMat = pbrMaterialSystem.getMaterial('laterite_soil');

  // 1. Workshop Surrounding Soil/Slab Base
  const baseGround = new Mesh(new BoxGeometry(12.0, 0.1, 12.0), soilMat);
  baseGround.position.set(0, -0.06, -2.5);
  baseGround.receiveShadow = true;
  root.add(baseGround);

  // 2. Main Assembly Foundation Footing Pad (2.8m x 0.14m x 2.8m at Z = -2.5m)
  const foundationPad = new Mesh(new BoxGeometry(2.8, 0.14, 2.8), concreteMat);
  foundationPad.position.set(0, 0.05, -2.5);
  foundationPad.receiveShadow = true;
  foundationPad.name = 'FoundationFootingPad';
  const padAlias = new Object3D();
  padAlias.name = 'FoundationBuildingPad';
  foundationPad.add(padAlias);
  root.add(foundationPad);

  // Yellow perimeter hazard / alignment border
  const borderMat = new MeshStandardMaterial({
    color: 0xfbc02d, // Industrial safety yellow
    roughness: 0.6,
  });
  const borderFront = new Mesh(new BoxGeometry(2.84, 0.02, 0.06), borderMat);
  borderFront.position.set(0, 0.125, -1.1);
  borderFront.name = 'FoundationBoundaryLine';
  root.add(borderFront);

  const borderBack = new Mesh(new BoxGeometry(2.84, 0.02, 0.06), borderMat);
  borderBack.position.set(0, 0.125, -3.9);
  root.add(borderBack);

  const borderLeft = new Mesh(new BoxGeometry(0.06, 0.02, 2.84), borderMat);
  borderLeft.position.set(-1.4, 0.125, -2.5);
  root.add(borderLeft);

  const borderRight = new Mesh(new BoxGeometry(0.06, 0.02, 2.84), borderMat);
  borderRight.position.set(1.4, 0.125, -2.5);
  root.add(borderRight);

  // 3. Left Material Supply Workbench (X = -2.6, Z = -2.2)
  const benchTopL = new Mesh(new BoxGeometry(1.4, 0.08, 0.8), woodMat);
  benchTopL.position.set(-2.6, 0.76, -2.2);
  benchTopL.castShadow = true;
  benchTopL.receiveShadow = true;
  root.add(benchTopL);

  // Bench legs
  const legGeo = new CylinderGeometry(0.035, 0.035, 0.76);
  for (const dx of [-0.6, 0.6]) {
    for (const dz of [-0.3, 0.3]) {
      const leg = new Mesh(legGeo, steelMat);
      leg.position.set(-2.6 + dx, 0.38, -2.2 + dz);
      leg.castShadow = true;
      root.add(leg);
    }
  }

  // Display initial brick & block specimens on workbench
  const sampleBrick = createComponentMesh('clay_brick');
  sampleBrick.position.set(-2.8, 0.84, -2.2);
  root.add(sampleBrick);

  const sampleBlock = createComponentMesh('concrete_block');
  sampleBlock.position.set(-2.3, 0.9, -2.2);
  root.add(sampleBlock);

  // 4. Right Heavy Components Pallet (X = 2.6, Z = -2.2)
  const palletMat = new MeshStandardMaterial({
    color: 0x8d6e63, // Sturdy pallet pine / timber
    roughness: 0.85,
  });
  const palletBase = new Mesh(new BoxGeometry(1.6, 0.12, 1.2), palletMat);
  palletBase.position.set(2.6, 0.06, -2.2);
  palletBase.receiveShadow = true;
  root.add(palletBase);

  // Display sample column & beam on pallet
  const sampleColumn = createComponentMesh('reinforced_column');
  sampleColumn.rotation.z = Math.PI / 2; // Laid down horizontally on pallet
  sampleColumn.position.set(2.6, 0.28, -2.0);
  root.add(sampleColumn);

  const sampleRoof = createComponentMesh('roof_panel');
  sampleRoof.position.set(2.6, 0.2, -2.5);
  root.add(sampleRoof);

  // 5. Blueprint Drafting Easel / Stand (X = -1.8, Z = -0.8)
  const easelMat = new MeshStandardMaterial({
    color: 0x424242,
    metalness: 0.4,
    roughness: 0.5,
  });
  const easelBoard = new Mesh(new BoxGeometry(0.9, 0.7, 0.04), woodMat);
  easelBoard.position.set(-1.8, 1.4, -0.8);
  easelBoard.rotation.x = -0.25; // Angled for player reading
  easelBoard.castShadow = true;
  root.add(easelBoard);

  const easelLeg = new Mesh(new CylinderGeometry(0.02, 0.02, 1.4), easelMat);
  easelLeg.position.set(-1.8, 0.7, -0.85);
  root.add(easelLeg);

  // Paper blueprint sheet on easel
  const paperMat = new MeshStandardMaterial({
    color: 0x0284c7, // Blueprint blue paper
    roughness: 0.9,
  });
  const paper = new Mesh(new BoxGeometry(0.82, 0.62, 0.005), paperMat);
  paper.position.set(-1.8, 1.4, -0.77);
  paper.rotation.x = -0.25;
  root.add(paper);

  return root;
}
