/**
 * Advenquo — Royal Throne Dais & Regalia Chamber procedural 3D asset.
 *
 * Sacred audience chamber of the Oba of Lagos:
 * - Two-tier royal dais platform with crimson velvet steps
 * - Carved high-back throne chair with lion/crown crest
 * - Dual cast bronze leopard sculptures guarding the dais
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from '@iwsdk/core';

export function buildPalaceThroneDais(): Object3D {
  const root = new Object3D();
  root.name = 'PalaceThroneDais';

  // Materials
  const crimsonVelvetMat = new MeshStandardMaterial({
    color: 0x880e4f, // Imperial deep crimson velvet
    roughness: 0.85,
  });

  const goldRegaliaMat = new MeshStandardMaterial({
    color: 0xffd54f, // Rich polished royal brass/gold
    roughness: 0.3,
    metalness: 0.85,
  });

  const irokoWoodMat = new MeshStandardMaterial({
    color: 0x3e2723, // Dark carved timber
    roughness: 0.7,
  });

  const bronzeLeopardMat = new MeshStandardMaterial({
    color: 0xbf360c, // Lost-wax Benin bronze
    roughness: 0.35,
    metalness: 0.75,
  });

  // 1. Two-Tier Dais Platform
  const lowerStepGeo = new BoxGeometry(3.6, 0.22, 2.8);
  const lowerStep = new Mesh(lowerStepGeo, crimsonVelvetMat);
  lowerStep.position.set(0, 0.11, 0);
  root.add(lowerStep);

  const upperStepGeo = new BoxGeometry(2.6, 0.22, 2.0);
  const upperStep = new Mesh(upperStepGeo, crimsonVelvetMat);
  upperStep.position.set(0, 0.33, -0.2);
  root.add(upperStep);

  // 2. High-Back Royal Throne Chair
  // Seat cushion
  const seatGeo = new BoxGeometry(1.0, 0.25, 0.9);
  const seat = new Mesh(seatGeo, crimsonVelvetMat);
  seat.position.set(0, 0.65, -0.4);
  root.add(seat);

  // Carved throne backrest
  const backrestGeo = new BoxGeometry(1.0, 1.4, 0.18);
  const backrest = new Mesh(backrestGeo, irokoWoodMat);
  backrest.position.set(0, 1.45, -0.85);
  root.add(backrest);

  // Gold Crest Finial on Backrest
  const crestGeo = new CylinderGeometry(0.28, 0.28, 0.1, 16);
  const crest = new Mesh(crestGeo, goldRegaliaMat);
  crest.rotation.x = Math.PI / 2;
  crest.position.set(0, 2.2, -0.8);
  root.add(crest);

  // Throne Armrests
  const armrestGeo = new BoxGeometry(0.16, 0.45, 0.85);
  const leftArm = new Mesh(armrestGeo, goldRegaliaMat);
  leftArm.position.set(-0.55, 0.88, -0.4);
  root.add(leftArm);

  const rightArm = new Mesh(armrestGeo, goldRegaliaMat);
  rightArm.position.set(0.55, 0.88, -0.4);
  root.add(rightArm);

  // 3. Bronze Guardian Leopards (Flanking the Dais)
  const leopardPositions = [
    [-1.6, 0.45, 0.4],
    [1.6, 0.45, 0.4],
  ];

  const leopardBodyGeo = new CylinderGeometry(0.18, 0.22, 0.7, 12);
  const leopardHeadGeo = new SphereGeometry(0.16, 12, 12);

  for (const [lx, ly, lz] of leopardPositions) {
    // Body (sitting upright)
    const body = new Mesh(leopardBodyGeo, bronzeLeopardMat);
    body.rotation.x = -0.35;
    body.position.set(lx, ly, lz);
    root.add(body);

    // Head
    const head = new Mesh(leopardHeadGeo, bronzeLeopardMat);
    head.position.set(lx, ly + 0.42, lz - 0.1);
    root.add(head);
  }

  return root;
}
