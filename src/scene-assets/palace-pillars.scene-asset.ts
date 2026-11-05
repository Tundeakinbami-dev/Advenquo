/**
 * Advenquo — Carved Ancestral Iroko Pillars & Royal Architrave procedural 3D asset.
 *
 * Traditional Yoruba palace architecture:
 * - Hand-carved hardwood columns depicting ancestral warriors and royal guardians
 * - Upper architrave carved with relief motifs
 * - Terracotta column pedestals
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TorusGeometry,
} from '@iwsdk/core';

export function buildPalacePillars(): Object3D {
  const root = new Object3D();
  root.name = 'PalacePillars';

  // Materials
  const irokoWoodMat = new MeshStandardMaterial({
    color: 0x4e342e, // Deep dark seasoned iroko timber
    roughness: 0.75,
  });

  const reliefGoldMat = new MeshStandardMaterial({
    color: 0xffb300, // Ceremonial gold/brass accent leaf
    roughness: 0.4,
    metalness: 0.6,
  });

  const stonePedestalMat = new MeshStandardMaterial({
    color: 0x8d6e63, // Carved sandstone pedestal
    roughness: 0.9,
  });

  // 1. Column Positions (4 Grand Pillars across 6.4m span)
  const pillarXPositions = [-2.8, -0.9, 0.9, 2.8];

  const pedestalGeo = new BoxGeometry(0.55, 0.35, 0.55);
  const columnShaftGeo = new CylinderGeometry(0.18, 0.22, 3.2, 16);
  const ringGeo = new TorusGeometry(0.24, 0.035, 8, 20);

  for (const px of pillarXPositions) {
    // Pedestal
    const pedestal = new Mesh(pedestalGeo, stonePedestalMat);
    pedestal.position.set(px, 0.175, 0);
    root.add(pedestal);

    // Carved Column Shaft
    const shaft = new Mesh(columnShaftGeo, irokoWoodMat);
    shaft.position.set(px, 1.95, 0);
    root.add(shaft);

    // Relief Decorative Rings (Warrior, Ancestor, Royalty levels)
    const ringHeights = [1.0, 1.9, 2.8];
    for (const rh of ringHeights) {
      const ring = new Mesh(ringGeo, reliefGoldMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(px, rh, 0);
      root.add(ring);
    }
  }

  // 2. Transverse Overhead Royal Architrave Beam
  const beamGeo = new BoxGeometry(6.6, 0.38, 0.65);
  const beam = new Mesh(beamGeo, irokoWoodMat);
  beam.position.set(0, 3.65, 0);
  root.add(beam);

  // 3. Central Royal Crown Plaque Relief
  const crownPlaqueGeo = new BoxGeometry(1.2, 0.45, 0.1);
  const crownPlaque = new Mesh(crownPlaqueGeo, reliefGoldMat);
  crownPlaque.position.set(0, 3.65, 0.35);
  root.add(crownPlaque);

  return root;
}
