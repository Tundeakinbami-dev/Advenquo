/**
 * Advenquo — Olori Morénikẹ́ (Palace Cultural Historian) procedural 3D NPC.
 *
 * Royal cultural custodian at Iga Idunganran Palace:
 * - Flowing royal gold and purple Bùbá and Ìró attire
 * - Elegant sculpted Gèlè (Yoruba head-tie)
 * - Multiple strands of polished red coral beads
 * - Welcoming ancestral posture
 *
 * Deterministic and side-effect free: parentless Object3D, no DOM, no timers.
 */

import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
} from '@iwsdk/core';

export function buildNpcOloriMorenike(): Object3D {
  const root = new Object3D();
  root.name = 'NpcOloriMorenike';

  // Materials
  const skinMat = new MeshStandardMaterial({
    color: 0x4e342e, // Warm deep brown skin
    roughness: 0.8,
  });

  const purpleBubaMat = new MeshStandardMaterial({
    color: 0x4a148c, // Royal purple silk
    roughness: 0.6,
  });

  const goldTrimMat = new MeshStandardMaterial({
    color: 0xffd54f, // Golden lace embroidery
    roughness: 0.4,
    metalness: 0.7,
  });

  const geleMat = new MeshStandardMaterial({
    color: 0x6a1b9a, // Architectural folded purple and gold head-tie
    roughness: 0.7,
  });

  const coralMat = new MeshStandardMaterial({
    color: 0xd32f2f, // Royal red coral beads
    roughness: 0.35,
  });

  // 1. Long Royal Ìró Skirt (Floor-length flared cylinder)
  const skirtGeo = new CylinderGeometry(0.24, 0.4, 0.95, 12);
  const skirt = new Mesh(skirtGeo, purpleBubaMat);
  skirt.position.set(0, 0.48, 0);
  root.add(skirt);

  // 2. Torso / Bùbá Blouse
  const torsoGeo = new CylinderGeometry(0.22, 0.25, 0.55, 12);
  const torso = new Mesh(torsoGeo, purpleBubaMat);
  torso.position.set(0, 1.18, 0);
  root.add(torso);

  // Gold Embroidery Sash / Ipele
  const sashGeo = new CylinderGeometry(0.23, 0.26, 0.52, 12, 1, false, 0, Math.PI);
  const sash = new Mesh(sashGeo, goldTrimMat);
  sash.position.set(0, 1.18, 0.02);
  root.add(sash);

  // 3. Wide Bell Sleeves
  const sleeveGeo = new CylinderGeometry(0.12, 0.07, 0.52, 10);
  const leftSleeve = new Mesh(sleeveGeo, purpleBubaMat);
  leftSleeve.position.set(-0.3, 1.12, 0);
  root.add(leftSleeve);

  const rightSleeve = new Mesh(sleeveGeo, purpleBubaMat);
  rightSleeve.position.set(0.3, 1.12, 0);
  root.add(rightSleeve);

  // 4. Red Coral Bead Collar
  const coralGeo = new TorusGeometry(0.12, 0.022, 8, 20);
  const coral = new Mesh(coralGeo, coralMat);
  coral.rotation.x = Math.PI / 2;
  coral.position.set(0, 1.42, 0);
  root.add(coral);

  // 5. Head and Gèlè Head-Tie
  const headGeo = new SphereGeometry(0.12, 14, 14);
  const head = new Mesh(headGeo, skinMat);
  head.position.set(0, 1.58, 0);
  root.add(head);

  // Sculpted Gele Crown
  const geleCrownGeo = new CylinderGeometry(0.28, 0.16, 0.22, 12);
  const gele = new Mesh(geleCrownGeo, geleMat);
  gele.position.set(0, 1.74, 0);
  root.add(gele);

  return root;
}
