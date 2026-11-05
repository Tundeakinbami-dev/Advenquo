/**
 * Advenquo — Yaba Innovation Tech Studio & Transit Canopy procedural asset.
 *
 * Modern multi-tier building facade with glass paneling, fiber transit antenna,
 * steel entrance canopy, rooftop photovoltaic solar panels, and digital signage.
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

export function buildUrbanTechHub(): Object3D {
  const root = new Object3D();
  root.name = 'UrbanTechHub';

  // Materials
  const concreteMat = new MeshStandardMaterial({
    color: 0x37474f, // Sleek slate grey architectural facade
    roughness: 0.8,
  });

  const whitePillarMat = new MeshStandardMaterial({
    color: 0xf5f5f5, // Clean architectural white columns
    roughness: 0.4,
  });

  const blueGlassMat = new MeshStandardMaterial({
    color: 0x0288d1, // Cyan-blue modern corporate glass
    roughness: 0.1,
    metalness: 0.85,
  });

  const solarMat = new MeshStandardMaterial({
    color: 0x0d47a1, // Deep navy solar cell paneling
    roughness: 0.2,
    metalness: 0.7,
  });

  const logoOrangeMat = new MeshStandardMaterial({
    color: 0xff6d00, // Vibrant tech accent color
    roughness: 0.3,
    emissive: 0xe65100,
    emissiveIntensity: 0.4,
  });

  const steelMat = new MeshStandardMaterial({
    color: 0x90a4ae,
    roughness: 0.4,
    metalness: 0.8,
  });

  // 1. Main Studio Facade
  const mainFacadeGeo = new BoxGeometry(5.2, 5.0, 1.2);
  const mainFacadeMesh = new Mesh(mainFacadeGeo, concreteMat);
  mainFacadeMesh.position.set(0, 2.5, 0);
  root.add(mainFacadeMesh);

  // 2. Glass Curtain Wall Bands (Ground, 1st & 2nd floors)
  const windowRowGeo = new BoxGeometry(4.6, 0.95, 0.1);
  const floorHeights = [1.2, 2.6, 4.0];
  for (const fh of floorHeights) {
    const windowMesh = new Mesh(windowRowGeo, blueGlassMat);
    windowMesh.position.set(0, fh, 0.61);
    root.add(windowMesh);
  }

  // 3. Entrance Canopy
  const canopyRoofGeo = new BoxGeometry(3.2, 0.12, 1.8);
  const canopyRoof = new Mesh(canopyRoofGeo, whitePillarMat);
  canopyRoof.position.set(0, 2.3, 1.5);
  root.add(canopyRoof);

  // 4. Canopy Steel Posts
  const postGeo = new CylinderGeometry(0.04, 0.04, 2.3, 12);
  const leftPost = new Mesh(postGeo, steelMat);
  leftPost.position.set(-1.4, 1.15, 2.2);
  root.add(leftPost);

  const rightPost = new Mesh(postGeo, steelMat);
  rightPost.position.set(1.4, 1.15, 2.2);
  root.add(rightPost);

  // 5. Rooftop Solar Photovoltaic Array
  const solarPanelGeo = new BoxGeometry(1.6, 0.08, 1.0);
  for (let i = -1; i <= 1; i++) {
    const solarMesh = new Mesh(solarPanelGeo, solarMat);
    solarMesh.rotation.x = -0.25; // Angled toward sun
    solarMesh.position.set(i * 1.5, 5.2, 0);
    root.add(solarMesh);
  }

  // 6. Rooftop Communication Antenna
  const mastGeo = new CylinderGeometry(0.02, 0.05, 1.8, 8);
  const mast = new Mesh(mastGeo, steelMat);
  mast.position.set(2.0, 5.8, 0);
  root.add(mast);

  // 7. Innovation Hub Signage Strip
  const signGeo = new BoxGeometry(2.4, 0.35, 0.08);
  const signMesh = new Mesh(signGeo, logoOrangeMat);
  signMesh.position.set(0, 4.75, 0.65);
  root.add(signMesh);

  return root;
}
