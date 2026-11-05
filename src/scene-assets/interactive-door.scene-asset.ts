/**
 * Advenquo — Interactive Accessible Door procedural 3D asset.
 *
 * Represents an architecturally authentic door that can be opened and closed
 * by the player to enter buildings (Market storehouse, Yaba Tech Hub,
 * Iga Idunganran Palace Chamber, Coastal shelter).
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

export function buildInteractiveDoor(): Object3D {
  const root = new Object3D();
  root.name = 'InteractiveDoor';

  // Materials
  const frameMat = new MeshStandardMaterial({
    color: 0x3e2723, // Deep carved iroko / dark timber frame
    roughness: 0.7,
  });

  const doorMat = new MeshStandardMaterial({
    color: 0x5d4037, // Carved wood panel
    roughness: 0.6,
  });

  const handleMat = new MeshStandardMaterial({
    color: 0xffd54f, // Brass / gold handle
    roughness: 0.3,
    metalness: 0.85,
  });

  // 1. Door Frame
  // Left post
  const postGeo = new BoxGeometry(0.12, 2.3, 0.14);
  const leftPost = new Mesh(postGeo, frameMat);
  leftPost.position.set(-0.66, 1.15, 0);
  root.add(leftPost);

  // Right post
  const rightPost = new Mesh(postGeo, frameMat);
  rightPost.position.set(0.66, 1.15, 0);
  root.add(rightPost);

  // Top lintel
  const lintelGeo = new BoxGeometry(1.44, 0.14, 0.14);
  const lintel = new Mesh(lintelGeo, frameMat);
  lintel.position.set(0, 2.37, 0);
  root.add(lintel);

  // 2. Door Leaf with Hinge Pivot
  // Pivot placed at left edge (-0.6) so rotation opens outward
  const doorPivot = new Object3D();
  doorPivot.name = 'DoorPivot';
  doorPivot.position.set(-0.6, 0, 0);
  root.add(doorPivot);

  const leafGeo = new BoxGeometry(1.18, 2.24, 0.06);
  const leaf = new Mesh(leafGeo, doorMat);
  leaf.name = 'DoorLeafMesh';
  // Offset leaf so its left edge is at pivot
  leaf.position.set(0.59, 1.12, 0);
  doorPivot.add(leaf);

  // Decorative Panels on door leaf
  const panelGeo = new BoxGeometry(0.42, 0.85, 0.02);
  const upperPanel = new Mesh(panelGeo, frameMat);
  upperPanel.position.set(0.59, 1.55, 0.035);
  doorPivot.add(upperPanel);

  const lowerPanel = new Mesh(panelGeo, frameMat);
  lowerPanel.position.set(0.59, 0.65, 0.035);
  doorPivot.add(lowerPanel);

  // 3. Brass Lever Handle
  const handleStemGeo = new CylinderGeometry(0.015, 0.015, 0.08, 8);
  const handleStem = new Mesh(handleStemGeo, handleMat);
  handleStem.rotation.x = Math.PI / 2;
  handleStem.position.set(1.05, 1.05, 0.05);
  doorPivot.add(handleStem);

  const handleLeverGeo = new BoxGeometry(0.12, 0.03, 0.02);
  const handleLever = new Mesh(handleLeverGeo, handleMat);
  handleLever.position.set(1.1, 1.05, 0.09);
  doorPivot.add(handleLever);

  return root;
}
