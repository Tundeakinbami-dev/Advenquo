/**
 * Advenquo — Market Props procedural asset group.
 *
 * Represents everyday objects found in a traditional Nigerian heritage market:
 * - Woven raffia produce baskets with yams, plantains, and peppers
 * - Terracotta clay water vessels (Amu) with rounded base and narrow neck
 * - Wooden trade crates
 * - Brass trade balance scale
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from '@iwsdk/core';

export function buildMarketProps(): Object3D {
  const root = new Object3D();
  root.name = 'MarketProps';

  // Shared Materials
  const basketMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Natural woven straw / raffia
    roughness: 0.95,
  });

  const clayMat = new MeshStandardMaterial({
    color: 0xbf360c, // Deep burnt terracotta clay
    roughness: 0.85,
    metalness: 0.05,
  });

  const crateWoodMat = new MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.9,
  });

  const plantainMat = new MeshStandardMaterial({
    color: 0xfbc02d, // Ripe plantain yellow
    roughness: 0.6,
  });

  const yamMat = new MeshStandardMaterial({
    color: 0x5d4037, // Earthy brown yam tuber
    roughness: 0.95,
  });

  const brassMat = new MeshStandardMaterial({
    color: 0xffb300, // Polished brass scale
    roughness: 0.35,
    metalness: 0.8,
  });

  // 1. Wooden Trade Crates (stacked in corner)
  const crate1Geo = new BoxGeometry(0.55, 0.4, 0.45);
  const crate1 = new Mesh(crate1Geo, crateWoodMat);
  crate1.position.set(-0.8, 0.2, 0);
  crate1.castShadow = true;
  root.add(crate1);

  const crate2Geo = new BoxGeometry(0.5, 0.35, 0.4);
  const crate2 = new Mesh(crate2Geo, crateWoodMat);
  crate2.position.set(-0.75, 0.575, 0);
  crate2.rotation.y = 0.15;
  crate2.castShadow = true;
  root.add(crate2);

  // 2. Terracotta Clay Pots (Amu)
  const potGeo = new SphereGeometry(0.22, 12, 10);
  const neckGeo = new CylinderGeometry(0.1, 0.12, 0.12, 10);
  const rimGeo = new CylinderGeometry(0.14, 0.1, 0.04, 10);

  const pot1 = new Mesh(potGeo, clayMat);
  pot1.position.set(0.6, 0.22, -0.2);
  pot1.scale.set(1, 1.15, 1);
  root.add(pot1);

  const neck1 = new Mesh(neckGeo, clayMat);
  neck1.position.set(0.6, 0.46, -0.2);
  root.add(neck1);

  const rim1 = new Mesh(rimGeo, clayMat);
  rim1.position.set(0.6, 0.53, -0.2);
  root.add(rim1);

  // Second smaller pot
  const pot2 = new Mesh(potGeo, clayMat);
  pot2.position.set(0.85, 0.18, 0.1);
  pot2.scale.set(0.8, 0.9, 0.8);
  root.add(pot2);

  const neck2 = new Mesh(neckGeo, clayMat);
  neck2.position.set(0.85, 0.36, 0.1);
  neck2.scale.set(0.8, 0.8, 0.8);
  root.add(neck2);

  // 3. Woven Raffia Produce Baskets
  const basketGeo = new CylinderGeometry(0.25, 0.18, 0.22, 12);
  const basket1 = new Mesh(basketGeo, basketMat);
  basket1.position.set(0.1, 0.11, 0.35);
  root.add(basket1);

  // Yams inside basket 1
  const yamGeo = new CylinderGeometry(0.045, 0.04, 0.35, 8);
  const yams = new InstancedMesh(yamGeo, yamMat, 3);
  yams.name = 'YamsInBasket';
  for (let i = 0; i < 3; i++) {
    const transform = new Matrix4().compose(
      new Vector3(0.08 + (i - 1) * 0.08, 0.2, 0.35),
      new Quaternion().setFromEuler(new Euler(0.2, (i - 1) * 0.3, 0.1)),
      new Vector3(1, 1, 1),
    );
    yams.setMatrixAt(i, transform);
  }
  yams.instanceMatrix.needsUpdate = true;
  yams.computeBoundingSphere();
  root.add(yams);

  // Second basket with ripe plantains
  const basket2 = new Mesh(basketGeo, basketMat);
  basket2.position.set(-0.35, 0.11, 0.4);
  root.add(basket2);

  const plantainGeo = new CylinderGeometry(0.025, 0.02, 0.26, 8);
  const plantains = new InstancedMesh(plantainGeo, plantainMat, 4);
  plantains.name = 'PlantainsInBasket';
  for (let j = 0; j < 4; j++) {
    const transform = new Matrix4().compose(
      new Vector3(-0.35 + (j - 1.5) * 0.06, 0.21, 0.4),
      new Quaternion().setFromEuler(new Euler(0.15, (j - 1.5) * 0.25, 0.3)),
      new Vector3(1, 1, 1),
    );
    plantains.setMatrixAt(j, transform);
  }
  plantains.instanceMatrix.needsUpdate = true;
  plantains.computeBoundingSphere();
  root.add(plantains);

  // 4. Brass Balance Scale on table / counter
  const scaleBaseGeo = new CylinderGeometry(0.06, 0.08, 0.02, 10);
  const scalePillarGeo = new CylinderGeometry(0.012, 0.012, 0.32, 8);
  const scaleBeamGeo = new BoxGeometry(0.38, 0.01, 0.015);
  const scalePanGeo = new CylinderGeometry(0.07, 0.05, 0.015, 10);

  const scaleBase = new Mesh(scaleBaseGeo, brassMat);
  scaleBase.position.set(0.1, 0.01, -0.6);
  root.add(scaleBase);

  const scalePillar = new Mesh(scalePillarGeo, brassMat);
  scalePillar.position.set(0.1, 0.16, -0.6);
  root.add(scalePillar);

  const scaleBeam = new Mesh(scaleBeamGeo, brassMat);
  scaleBeam.position.set(0.1, 0.31, -0.6);
  root.add(scaleBeam);

  const leftPan = new Mesh(scalePanGeo, brassMat);
  leftPan.position.set(-0.06, 0.2, -0.6);
  root.add(leftPan);

  const rightPan = new Mesh(scalePanGeo, brassMat);
  rightPan.position.set(0.26, 0.22, -0.6);
  root.add(rightPan);

  return root;
}
