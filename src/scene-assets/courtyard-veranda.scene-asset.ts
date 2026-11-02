/**
 * Advenquo — Historic Courtyard Veranda procedural asset.
 *
 * Represents an authentic Yoruba royal/elder compound veranda (Iga Idunganran style)
 * in Ìsàlẹ̀ Èkó, Lagos.
 *
 * Features:
 * - Warm ochre/terracotta laterite plaster compound walls
 * - Elevated wooden veranda porch
 * - Hand-carved wooden veranda posts (caryatid / pillar style)
 * - Corrugated zinc awning roof with timber eaves
 * - Carved elder wooden bench / alcove
 *
 * Evaluated in two realms (runtime + editor) — deterministic and side-effect free.
 */

import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from '@iwsdk/core';

export function buildCourtyardVeranda(): Object3D {
  const root = new Object3D();
  root.name = 'CourtyardVeranda';

  // Materials
  const wallMat = new MeshStandardMaterial({
    color: 0xbcaaa4, // Warm earthy laterite plaster
    roughness: 0.9,
    metalness: 0.05,
  });

  const woodPillarMat = new MeshStandardMaterial({
    color: 0x4e342e, // Deep aged mahogany / iroko timber
    roughness: 0.8,
    metalness: 0.05,
  });

  const roofMat = new MeshStandardMaterial({
    color: 0x546e7a, // Weathered corrugated zinc / metal roof
    roughness: 0.7,
    metalness: 0.35,
  });

  const platformMat = new MeshStandardMaterial({
    color: 0x795548,
    roughness: 0.85,
    metalness: 0.0,
  });

  // 1. Back Compound Wall (6m wide × 3m high × 0.3m thick)
  const wallGeo = new BoxGeometry(6, 3, 0.3);
  const wallMesh = new Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 1.5, -1.2);
  wallMesh.receiveShadow = true;
  root.add(wallMesh);

  // 2. Elevated Veranda Platform (6m wide × 0.15m high × 2m deep)
  const platGeo = new BoxGeometry(6, 0.15, 2.0);
  const platMesh = new Mesh(platGeo, platformMat);
  platMesh.position.set(0, 0.075, -0.3);
  platMesh.receiveShadow = true;
  root.add(platMesh);

  // 3. Veranda Carved Wooden Pillars (4 pillars spaced across the front)
  const pillarHeight = 2.6;
  const pillarRadius = 0.08;
  const pillarGeo = new CylinderGeometry(pillarRadius, pillarRadius * 1.1, pillarHeight, 10);
  const capitalGeo = new BoxGeometry(0.24, 0.12, 0.24);

  const pillarXPositions = [-2.4, -0.8, 0.8, 2.4];
  for (const x of pillarXPositions) {
    // Main column
    const pillar = new Mesh(pillarGeo, woodPillarMat);
    pillar.position.set(x, 1.35, 0.6);
    pillar.castShadow = true;
    root.add(pillar);

    // Carved decorative ring bands on the pillar
    const ringGeo = new CylinderGeometry(pillarRadius * 1.3, pillarRadius * 1.3, 0.06, 10);
    for (const ry of [0.8, 1.4, 2.0]) {
      const ring = new Mesh(ringGeo, woodPillarMat);
      ring.position.set(x, ry, 0.6);
      root.add(ring);
    }

    // Capital beam connector
    const cap = new Mesh(capitalGeo, woodPillarMat);
    cap.position.set(x, 2.66, 0.6);
    root.add(cap);
  }

  // 4. Overhanging Roof Beams
  const beamGeo = new BoxGeometry(6.2, 0.15, 0.18);
  const frontBeam = new Mesh(beamGeo, woodPillarMat);
  frontBeam.position.set(0, 2.7, 0.6);
  root.add(frontBeam);

  // Cross joists connecting front beam to back wall
  const joistGeo = new BoxGeometry(0.1, 0.12, 2.1);
  for (const jx of [-2.4, -1.2, 0, 1.2, 2.4]) {
    const joist = new Mesh(joistGeo, woodPillarMat);
    joist.position.set(jx, 2.8, -0.3);
    root.add(joist);
  }

  // 5. Corrugated Zinc Veranda Awning (slanted forward)
  const roofGeo = new BoxGeometry(6.4, 0.05, 2.3);
  const roof = new Mesh(roofGeo, roofMat);
  roof.position.set(0, 2.9, -0.3);
  roof.rotation.x = 0.15; // Slants downward toward the courtyard
  roof.castShadow = true;
  root.add(roof);

  // 6. Carved Wooden Elder Stool / Bench Base (for Baba Adéwálé)
  const stoolTopGeo = new CylinderGeometry(0.35, 0.32, 0.08, 16);
  const stoolTop = new Mesh(stoolTopGeo, woodPillarMat);
  stoolTop.position.set(0, 0.45, -0.5);
  root.add(stoolTop);

  const stoolStemGeo = new CylinderGeometry(0.14, 0.18, 0.3, 12);
  const stoolStem = new Mesh(stoolStemGeo, woodPillarMat);
  stoolStem.position.set(0, 0.25, -0.5);
  root.add(stoolStem);

  const stoolBaseGeo = new CylinderGeometry(0.32, 0.35, 0.08, 16);
  const stoolBase = new Mesh(stoolBaseGeo, woodPillarMat);
  stoolBase.position.set(0, 0.14, -0.5);
  root.add(stoolBase);

  return root;
}
