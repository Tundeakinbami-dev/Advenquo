/**
 * Advenquo — Iconic Lagos Danfo Minibus procedural 3D asset.
 *
 * Canary-yellow commercial transport van with characteristic dual black stripes,
 * black rubber tires, steel rims, tinted windscreen, headlights, and bumpers.
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

export function buildUrbanDanfoBus(): Object3D {
  const root = new Object3D();
  root.name = 'UrbanDanfoBus';

  // Materials
  const yellowPaintMat = new MeshStandardMaterial({
    color: 0xffd600, // Vibrant Lagos commercial bus yellow
    roughness: 0.35,
    metalness: 0.1,
  });

  const blackStripeMat = new MeshStandardMaterial({
    color: 0x1a1a1a, // Black racing stripe
    roughness: 0.5,
  });

  const glassMat = new MeshStandardMaterial({
    color: 0x1e3a5f, // Tinted cabin window glass
    roughness: 0.1,
    metalness: 0.8,
  });

  const tireMat = new MeshStandardMaterial({
    color: 0x212121, // Heavy-duty rubber tire
    roughness: 0.9,
  });

  const rimMat = new MeshStandardMaterial({
    color: 0xb0bec5, // Steel wheel hub
    roughness: 0.3,
    metalness: 0.8,
  });

  const chromeMat = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.9,
  });

  const lightMat = new MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffecb3,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  // 1. Lower Body Chassis
  const lowerBodyGeo = new BoxGeometry(1.8, 0.9, 3.8);
  const lowerBodyMesh = new Mesh(lowerBodyGeo, yellowPaintMat);
  lowerBodyMesh.position.set(0, 0.75, 0);
  lowerBodyMesh.castShadow = true;
  root.add(lowerBodyMesh);

  // 2. Dual Black Side Stripes
  const stripeUpperGeo = new BoxGeometry(1.82, 0.08, 3.82);
  const stripeUpperMesh = new Mesh(stripeUpperGeo, blackStripeMat);
  stripeUpperMesh.position.set(0, 0.82, 0);
  root.add(stripeUpperMesh);

  const stripeLowerGeo = new BoxGeometry(1.82, 0.08, 3.82);
  const stripeLowerMesh = new Mesh(stripeLowerGeo, blackStripeMat);
  stripeLowerMesh.position.set(0, 0.68, 0);
  root.add(stripeLowerMesh);

  // 3. Cabin & Roof
  const cabinGeo = new BoxGeometry(1.72, 0.85, 3.4);
  const cabinMesh = new Mesh(cabinGeo, yellowPaintMat);
  cabinMesh.position.set(0, 1.55, -0.1);
  cabinMesh.castShadow = true;
  root.add(cabinMesh);

  // 4. Windows (Front Windscreen, Sides, Rear)
  const frontWindshieldGeo = new BoxGeometry(1.64, 0.65, 0.05);
  const frontWindshield = new Mesh(frontWindshieldGeo, glassMat);
  frontWindshield.position.set(0, 1.55, -1.82);
  root.add(frontWindshield);

  const rearWindowGeo = new BoxGeometry(1.64, 0.65, 0.05);
  const rearWindow = new Mesh(rearWindowGeo, glassMat);
  rearWindow.position.set(0, 1.55, 1.62);
  root.add(rearWindow);

  const sideWindowsGeo = new BoxGeometry(1.76, 0.6, 2.6);
  const sideWindows = new Mesh(sideWindowsGeo, glassMat);
  sideWindows.position.set(0, 1.55, -0.1);
  root.add(sideWindows);

  // 5. Wheels (4 Corners)
  const wheelPositions = [
    [-0.95, 0.38, -1.2],
    [0.95, 0.38, -1.2],
    [-0.95, 0.38, 1.2],
    [0.95, 0.38, 1.2],
  ];

  const tireGeo = new CylinderGeometry(0.38, 0.38, 0.28, 18);
  const rimGeo = new CylinderGeometry(0.24, 0.24, 0.29, 16);

  for (const [wx, wy, wz] of wheelPositions) {
    const tire = new Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(wx, wy, wz);
    root.add(tire);

    const rim = new Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(wx, wy, wz);
    root.add(rim);
  }

  // 6. Headlights & Bumpers
  const headLightGeo = new CylinderGeometry(0.1, 0.1, 0.05, 16);
  const leftLight = new Mesh(headLightGeo, lightMat);
  leftLight.rotation.x = Math.PI / 2;
  leftLight.position.set(-0.65, 0.72, -1.92);
  root.add(leftLight);

  const rightLight = new Mesh(headLightGeo, lightMat);
  rightLight.rotation.x = Math.PI / 2;
  rightLight.position.set(0.65, 0.72, -1.92);
  root.add(rightLight);

  const bumperGeo = new BoxGeometry(1.88, 0.18, 0.2);
  const frontBumper = new Mesh(bumperGeo, chromeMat);
  frontBumper.position.set(0, 0.42, -1.92);
  root.add(frontBumper);

  return root;
}
