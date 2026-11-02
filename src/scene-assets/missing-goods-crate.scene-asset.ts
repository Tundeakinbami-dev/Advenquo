/**
 * Advenquo — Missing Indigo Dye Delivery Crate procedural asset.
 *
 * An authentic West African trade delivery consignment:
 * - Handcrafted cedar transport crate with corner brackets and cross-battens
 * - Indigo-stained cotton parcel bundle with hemp rope ties
 * - Abeokuta artisan dyers guild wax mark
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

export function buildMissingGoodsCrate(): Object3D {
  const root = new Object3D();
  root.name = 'MissingGoodsCrate';

  // Materials
  const woodMat = new MeshStandardMaterial({
    color: 0x795548, // Rich seasoned cedar/iroko wood
    roughness: 0.85,
    metalness: 0.05,
  });

  const cornerMat = new MeshStandardMaterial({
    color: 0x3e2723, // Dark iron corner braces
    roughness: 0.7,
    metalness: 0.4,
  });

  const indigoParcelMat = new MeshStandardMaterial({
    color: 0x1a237e, // Deep royal indigo dyed bundle
    roughness: 0.9,
    metalness: 0.0,
  });

  const ropeMat = new MeshStandardMaterial({
    color: 0xd7ccc8, // Natural woven hemp/raffia rope
    roughness: 0.95,
  });

  const sealMat = new MeshStandardMaterial({
    color: 0xd84315, // Terracotta-red artisan wax guild seal
    roughness: 0.4,
    metalness: 0.2,
  });

  const glowMat = new MeshStandardMaterial({
    color: 0xffd54f, // Soft golden quest indicator ring
    emissive: 0xffb300,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });

  // 1. Base Wooden Crate
  const boxGeo = new BoxGeometry(0.48, 0.32, 0.36);
  const boxMesh = new Mesh(boxGeo, woodMat);
  boxMesh.position.set(0, 0.16, 0);
  root.add(boxMesh);

  // 2. Corner Reinforcements
  const cornerPositions = [
    [-0.24, 0.16, -0.18],
    [0.24, 0.16, -0.18],
    [-0.24, 0.16, 0.18],
    [0.24, 0.16, 0.18],
  ];
  const postGeo = new CylinderGeometry(0.02, 0.02, 0.33, 8);
  for (const [cx, cy, cz] of cornerPositions) {
    const post = new Mesh(postGeo, cornerMat);
    post.position.set(cx, cy, cz);
    root.add(post);
  }

  // 3. Indigo Cloth Bundle Resting Inside Open Crate
  const bundleGeo = new BoxGeometry(0.42, 0.18, 0.3);
  const bundleMesh = new Mesh(bundleGeo, indigoParcelMat);
  bundleMesh.position.set(0, 0.26, 0);
  root.add(bundleMesh);

  // 4. Cross-Tied Binding Ropes
  const ropeLongGeo = new CylinderGeometry(0.008, 0.008, 0.44, 8);
  const ropeLongMesh = new Mesh(ropeLongGeo, ropeMat);
  ropeLongMesh.rotation.z = Math.PI / 2;
  ropeLongMesh.position.set(0, 0.355, 0);
  root.add(ropeLongMesh);

  const ropeCrossGeo = new CylinderGeometry(0.008, 0.008, 0.32, 8);
  const ropeCrossMesh = new Mesh(ropeCrossGeo, ropeMat);
  ropeCrossMesh.rotation.x = Math.PI / 2;
  ropeCrossMesh.position.set(0, 0.356, 0);
  root.add(ropeCrossMesh);

  // 5. Abeokuta Artisan Dyers Guild Seal
  const sealGeo = new CylinderGeometry(0.035, 0.035, 0.012, 16);
  const sealMesh = new Mesh(sealGeo, sealMat);
  sealMesh.position.set(0, 0.365, 0);
  root.add(sealMesh);

  // 6. Subtle Golden Quest Marker Ring on Ground
  const ringGeo = new TorusGeometry(0.38, 0.015, 8, 32);
  const ringMesh = new Mesh(ringGeo, glowMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.set(0, 0.01, 0);
  root.add(ringMesh);

  return root;
}
