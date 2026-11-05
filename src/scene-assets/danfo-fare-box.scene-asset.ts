/**
 * Advenquo — Vintage Danfo Fare Collection Box procedural 3D asset.
 *
 * Metal coin pouch and cash box used by Lagos Danfo conductors:
 * - Stamped steel coin dispenser box
 * - Compartments for vintage Nigerian naira coins & paper transit cowries
 * - Leather shoulder strap
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

export function buildDanfoFareBox(): Object3D {
  const root = new Object3D();
  root.name = 'DanfoFareBox';

  // Materials
  const metalMat = new MeshStandardMaterial({
    color: 0x546e7a, // Stamped sheet steel
    metalness: 0.85,
    roughness: 0.35,
  });

  const brassCoinMat = new MeshStandardMaterial({
    color: 0xffd54f, // Nigerian brass coins
    metalness: 0.9,
    roughness: 0.25,
  });

  const leatherMat = new MeshStandardMaterial({
    color: 0x4e342e,
    roughness: 0.8,
  });

  // 1. Coin Box Body
  const boxGeo = new BoxGeometry(0.24, 0.12, 0.18);
  const box = new Mesh(boxGeo, metalMat);
  box.position.set(0, 0.06, 0);
  root.add(box);

  // 2. Coin Tubes / Slots on Top
  const tubeGeo = new CylinderGeometry(0.02, 0.02, 0.04, 12);
  for (let i = -2; i <= 2; i++) {
    const tube = new Mesh(tubeGeo, brassCoinMat);
    tube.position.set(i * 0.04, 0.13, 0);
    root.add(tube);
  }

  // 3. Leather Shoulder Strap loop
  const strapGeo = new BoxGeometry(0.03, 0.22, 0.22);
  const strap = new Mesh(strapGeo, leatherMat);
  strap.position.set(0, 0.18, 0);
  root.add(strap);

  return root;
}
