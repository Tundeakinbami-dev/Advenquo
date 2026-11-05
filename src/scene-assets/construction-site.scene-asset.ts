/**
 * Advenquo — Active Eko Eco-Terrace Construction Site procedural 3D asset.
 *
 * The building site at the center of Tobi's story:
 * - Reinforced concrete foundation slab with trench footings
 * - Two modular steel scaffolding towers with yellow poles & green safety netting
 * - Stacks of curing concrete masonry blocks (cinder blocks)
 * - Rotary concrete mixer drum with yellow frame chassis
 * - Surveyor tripod with optical level instrument
 * - High-vis site safety board (LASPPPA Compliance & PPE rules)
 * - CRITICAL STORY ASSET: The Defective Pillar — a structural concrete column
 *   exhibiting hairline diagonal stress fractures and red chalk engineering marks!
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

import { pbrMaterialSystem } from '../systems/pbr-material-system.js';

export function buildConstructionSite(): Object3D {
  const root = new Object3D();
  root.name = 'ConstructionSiteCompound';

  // Realistic PBR Materials
  const slabMat = pbrMaterialSystem.getMaterial('cured_concrete');
  const soilMat = pbrMaterialSystem.getMaterial('laterite_soil');
  const scaffoldMat = pbrMaterialSystem.getMaterial('steel_scaffold');

  const safetyMeshMat = new MeshStandardMaterial({
    color: 0x2e7d32, // Green debris containment safety netting
    roughness: 0.9,
    transparent: true,
    opacity: 0.75,
  });

  const cinderMat = pbrMaterialSystem.getMaterial('cured_concrete', {
    color: 0x757575, // Porous grey cinder blocks
    roughness: 0.9,
  });

  const mixerDrumMat = new MeshStandardMaterial({
    color: 0xd32f2f, // Crimson industrial cement mixer
    metalness: 0.4,
    roughness: 0.5,
  });

  const rebarMat = new MeshStandardMaterial({
    color: 0x424242, // Ribbed carbon steel rebar
    metalness: 0.7,
    roughness: 0.5,
  });

  const defectiveColumnMat = pbrMaterialSystem.getMaterial('cured_concrete', {
    color: 0xb0bec5, // Slightly pale, low-grade curing concrete
    roughness: 0.85,
  });

  const chalkMarkMat = new MeshStandardMaterial({
    color: 0xe53935, // Bright red grease-chalk fracture marker
    roughness: 0.7,
  });

  const tripodMat = new MeshStandardMaterial({
    color: 0xff6f00,
    metalness: 0.5,
    roughness: 0.4,
  });

  // 1. Foundation Ground (6.0m x 6.0m)
  const soilBase = new Mesh(new BoxGeometry(6.4, 0.1, 6.4), soilMat);
  soilBase.position.set(0, -0.05, 0);
  soilBase.receiveShadow = true;
  root.add(soilBase);

  const concreteSlab = new Mesh(new BoxGeometry(5.2, 0.12, 5.2), slabMat);
  concreteSlab.position.set(0, 0.04, 0);
  concreteSlab.receiveShadow = true;
  root.add(concreteSlab);

  // 2. Scaffolding Tower (Left side, X = -1.8, Z = -1.2)
  const poleGeo = new CylinderGeometry(0.025, 0.025, 3.2);
  for (let dx of [-0.6, 0.6]) {
    for (let dz of [-0.6, 0.6]) {
      const pole = new Mesh(poleGeo, scaffoldMat);
      pole.position.set(-1.8 + dx, 1.6, -1.2 + dz);
      pole.castShadow = true;
      root.add(pole);
    }
  }

  // Cross bars
  const barGeoH = new BoxGeometry(1.25, 0.03, 0.03);
  for (let y of [1.0, 2.0, 3.0]) {
    const barFront = new Mesh(barGeoH, scaffoldMat);
    barFront.position.set(-1.8, y, -0.6);
    barFront.castShadow = true;
    root.add(barFront);

    const barBack = new Mesh(barGeoH, scaffoldMat);
    barBack.position.set(-1.8, y, -1.8);
    barBack.castShadow = true;
    root.add(barBack);
  }

  // Safety green screen
  const netScreen = new Mesh(new BoxGeometry(1.2, 2.0, 0.02), safetyMeshMat);
  netScreen.position.set(-1.8, 2.0, -0.6);
  netScreen.castShadow = true;
  root.add(netScreen);

  // Scaffold wood walkboard
  const plank = new Mesh(new BoxGeometry(1.15, 0.05, 1.15), cinderMat);
  plank.position.set(-1.8, 1.55, -1.2);
  plank.receiveShadow = true;
  root.add(plank);

  // 3. Stacks of Cinder Blocks (X = -1.8, Z = 1.6)
  const blockGeo = new BoxGeometry(0.4, 0.2, 0.2);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      for (let layer = 0; layer < 4; layer++) {
        const block = new Mesh(blockGeo, cinderMat);
        block.position.set(-2.2 + col * 0.42, 0.15 + layer * 0.21, 1.2 + row * 0.22);
        block.castShadow = true;
        block.receiveShadow = true;
        root.add(block);
      }
    }
  }

  // 4. Concrete Mixer (X = 1.8, Z = 1.6)
  const mixerBase = new Mesh(new BoxGeometry(0.8, 0.5, 0.6), scaffoldMat);
  mixerBase.position.set(1.8, 0.35, 1.6);
  mixerBase.castShadow = true;
  root.add(mixerBase);

  const mixerDrum = new Mesh(new CylinderGeometry(0.35, 0.2, 0.8, 12), mixerDrumMat);
  mixerDrum.position.set(1.8, 0.85, 1.6);
  mixerDrum.rotation.z = Math.PI / 4; // Tilted mixing angle
  mixerDrum.castShadow = true;
  root.add(mixerDrum);

  // 5. CRITICAL STORY PILLAR: The Defective Load-Bearing Pillar (X = 1.0, Z = -1.0)
  // This is the pillar Tobi discovers with severe shear fractures
  const pillarGeo = new BoxGeometry(0.45, 3.2, 0.45);
  const defectivePillar = new Mesh(pillarGeo, defectiveColumnMat);
  defectivePillar.name = 'DefectivePillar';
  defectivePillar.position.set(1.0, 1.6, -1.0);
  defectivePillar.castShadow = true;
  defectivePillar.receiveShadow = true;
  root.add(defectivePillar);

  // Exposed protruding rebar at the top
  const rebarGeo = new CylinderGeometry(0.012, 0.012, 0.45);
  for (let rx of [-0.15, 0.15]) {
    for (let rz of [-0.15, 0.15]) {
      const rebar = new Mesh(rebarGeo, rebarMat);
      rebar.position.set(1.0 + rx, 3.35, -1.0 + rz);
      rebar.castShadow = true;
      root.add(rebar);
    }
  }

  // Diagonal stress crack chalk indicator (narrative focus)
  const crackMarker1 = new Mesh(new BoxGeometry(0.03, 0.35, 0.47), chalkMarkMat);
  crackMarker1.position.set(1.0, 1.45, -1.0);
  crackMarker1.rotation.z = 0.42;
  root.add(crackMarker1);

  const crackMarker2 = new Mesh(new BoxGeometry(0.02, 0.28, 0.47), chalkMarkMat);
  crackMarker2.position.set(1.0, 1.15, -1.0);
  crackMarker2.rotation.z = -0.35;
  root.add(crackMarker2);

  // 6. Surveyor Tripod & Transit Level (X = 0.0, Z = 1.5)
  const tripodLegGeo = new CylinderGeometry(0.015, 0.015, 1.25);
  for (let angle of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
    const leg = new Mesh(tripodLegGeo, tripodMat);
    leg.position.set(Math.cos(angle) * 0.25, 0.6, 1.5 + Math.sin(angle) * 0.25);
    leg.rotation.z = Math.cos(angle) * 0.25;
    leg.rotation.x = Math.sin(angle) * 0.25;
    leg.castShadow = true;
    root.add(leg);
  }

  const opticalLevel = new Mesh(new BoxGeometry(0.18, 0.08, 0.12), scaffoldMat);
  opticalLevel.position.set(0.0, 1.25, 1.5);
  opticalLevel.castShadow = true;
  root.add(opticalLevel);

  return root;
}
