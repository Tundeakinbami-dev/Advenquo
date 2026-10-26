/**
 * Advenquo — Iyá Aláso (Master Adire Artisan) procedural 3D NPC asset.
 *
 * Represents a master textile dyer and trader at the Ìsàlẹ̀ Èkó artisan guild.
 * - Wearing traditional indigo-patterned Buba blouse and Iro wrapper skirt
 * - Elegant folded Gele (Yoruba ceremonial headwrap)
 * - Beaded accessories
 * - Natural standing posture with one hand gesturing towards the textile displays
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
} from '@iwsdk/core';

export function buildNpcIyaAlaso(): Object3D {
  const root = new Object3D();
  root.name = 'NpcIyaAlaso';

  // Materials
  const indigoMat = new MeshStandardMaterial({
    color: 0x1a237e, // Deep indigo dye color
    roughness: 0.85,
    metalness: 0.05,
  });

  const geleMat = new MeshStandardMaterial({
    color: 0x0d47a1, // Indigo Gele headwrap with subtle sheen
    roughness: 0.6,
    metalness: 0.15,
  });

  const goldAccentMat = new MeshStandardMaterial({
    color: 0xfbc02d,
    roughness: 0.4,
    metalness: 0.3,
  });

  const skinMat = new MeshStandardMaterial({
    color: 0x5d4037, // Warm rich brown skin
    roughness: 0.75,
  });

  // 1. Lower Body / Wrapped Iro Skirt (from y = 0 to y = 0.95m)
  const iroGeo = new CylinderGeometry(0.24, 0.3, 0.95, 14);
  const iro = new Mesh(iroGeo, indigoMat);
  iro.position.set(0, 0.475, 0);
  iro.castShadow = true;
  root.add(iro);

  // 2. Torso / Buba Blouse (y = 0.95 to 1.35m)
  const bubaGeo = new CylinderGeometry(0.26, 0.23, 0.42, 12);
  const buba = new Mesh(bubaGeo, indigoMat);
  buba.position.set(0, 1.15, 0);
  buba.scale.set(1.05, 1, 0.85);
  root.add(buba);

  // Gold waist sash / wrapper knot
  const sashGeo = new TorusGeometry(0.25, 0.04, 8, 16);
  const sash = new Mesh(sashGeo, goldAccentMat);
  sash.position.set(0, 0.96, 0);
  sash.rotation.x = Math.PI / 2;
  root.add(sash);

  // 3. Neck & Coral Necklace
  const neckGeo = new CylinderGeometry(0.07, 0.08, 0.12, 10);
  const neck = new Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.39, 0);
  root.add(neck);

  const necklaceGeo = new TorusGeometry(0.12, 0.015, 6, 16);
  const necklace = new Mesh(necklaceGeo, goldAccentMat);
  necklace.position.set(0, 1.37, 0.03);
  necklace.rotation.x = Math.PI / 3;
  root.add(necklace);

  // 4. Head
  const headGeo = new SphereGeometry(0.125, 16, 14);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.5, 0);
  root.add(head);

  // 5. Traditional Folded Gele (Headwrap with wings/tiers)
  const geleCrownGeo = new CylinderGeometry(0.19, 0.14, 0.16, 16);
  const geleCrown = new Mesh(geleCrownGeo, geleMat);
  geleCrown.position.set(0, 1.6, 0);
  root.add(geleCrown);

  // Sculpted Gele Fan / Wing on the side
  const geleWingGeo = new TorusGeometry(0.24, 0.06, 8, 16, Math.PI);
  const geleWing = new Mesh(geleWingGeo, geleMat);
  geleWing.position.set(0.06, 1.65, 0);
  geleWing.rotation.set(0.2, 0.4, 0.3);
  root.add(geleWing);

  // 6. Arms & Hands
  const armGeo = new CylinderGeometry(0.045, 0.04, 0.35, 8);
  const handGeo = new SphereGeometry(0.05, 8, 8);

  // Left Arm (bent at elbow, resting on counter)
  const leftArm = new Mesh(armGeo, indigoMat);
  leftArm.position.set(-0.25, 1.15, 0.15);
  leftArm.rotation.set(Math.PI / 4, 0, -0.3);
  root.add(leftArm);

  const leftHand = new Mesh(handGeo, skinMat);
  leftHand.position.set(-0.28, 0.98, 0.32);
  root.add(leftHand);

  // Right Arm (welcoming gesture toward the cloth display)
  const rightArm = new Mesh(armGeo, indigoMat);
  rightArm.position.set(0.26, 1.18, 0.12);
  rightArm.rotation.set(0.2, -0.2, 0.5);
  root.add(rightArm);

  const rightHand = new Mesh(handGeo, skinMat);
  rightHand.position.set(0.42, 1.05, 0.22);
  root.add(rightHand);

  return root;
}
