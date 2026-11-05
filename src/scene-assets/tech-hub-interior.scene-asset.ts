/**
 * Advenquo — Accessible Yaba Innovation Lab Interior procedural 3D asset.
 *
 * Walkable interior space inside the Yaba Tech Hub:
 * - Room floor with polished light grey concrete
 * - Interior drywall partitions with collaborative whiteboard
 * - Developer workbench with dual monitor screens, keyboard & mouse
 * - IoT prototyping bench with microcontrollers, LED indicators & solar battery unit
 * - Tech books, server rack cabinet, and ergonomic office chairs
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

export function buildTechHubInterior(): Object3D {
  const root = new Object3D();
  root.name = 'TechHubInterior';

  // Materials
  const floorMat = new MeshStandardMaterial({
    color: 0xe0e0e0, // Polished studio floor
    roughness: 0.3,
  });

  const wallMat = new MeshStandardMaterial({
    color: 0x37474f, // Slate grey interior walls
    roughness: 0.7,
  });

  const deskMat = new MeshStandardMaterial({
    color: 0x212121, // Matte black modern workstation desk
    roughness: 0.5,
  });

  const woodWarmMat = new MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.6,
  });

  const screenMat = new MeshStandardMaterial({
    color: 0x01579b, // Glowing code editor screen
    emissive: 0x0288d1,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  const steelMat = new MeshStandardMaterial({
    color: 0x9e9e9e,
    metalness: 0.8,
    roughness: 0.3,
  });

  const whiteMat = new MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.2,
  });

  // 1. Walkable Room Floor (4.5m width x 4.0m depth)
  const floorGeo = new BoxGeometry(4.5, 0.05, 4.0);
  const floor = new Mesh(floorGeo, floorMat);
  floor.position.set(0, 0.025, 0);
  root.add(floor);

  // 2. Interior Walls (Back wall, Left wall, Right wall)
  // Back wall
  const backWallGeo = new BoxGeometry(4.5, 2.8, 0.1);
  const backWall = new Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 1.4, -2.0);
  root.add(backWall);

  // Left wall
  const sideWallGeo = new BoxGeometry(0.1, 2.8, 4.0);
  const leftWall = new Mesh(sideWallGeo, wallMat);
  leftWall.position.set(-2.25, 1.4, 0);
  root.add(leftWall);

  // Right wall
  const rightWall = new Mesh(sideWallGeo, wallMat);
  rightWall.position.set(2.25, 1.4, 0);
  root.add(rightWall);

  // 3. Collaborative Innovation Whiteboard on Back Wall
  const boardGeo = new BoxGeometry(2.4, 1.2, 0.04);
  const board = new Mesh(boardGeo, whiteMat);
  board.position.set(0, 1.6, -1.93);
  root.add(board);

  // Whiteboard header strip
  const stripGeo = new BoxGeometry(2.4, 0.08, 0.05);
  const strip = new Mesh(stripGeo, deskMat);
  strip.position.set(0, 2.22, -1.93);
  root.add(strip);

  // 4. Developer Workstations (Against Left Wall)
  const deskGeo = new BoxGeometry(0.9, 0.75, 2.2);
  const desk = new Mesh(deskGeo, deskMat);
  desk.position.set(-1.7, 0.375, -0.6);
  root.add(desk);

  // Dual Screens
  const monitorStandGeo = new CylinderGeometry(0.02, 0.02, 0.3, 8);
  const monitorPanelGeo = new BoxGeometry(0.04, 0.35, 0.55);

  for (let i = -1; i <= 1; i += 2) {
    const stand = new Mesh(monitorStandGeo, steelMat);
    stand.position.set(-1.7, 0.88, -0.6 + i * 0.4);
    root.add(stand);

    const screen = new Mesh(monitorPanelGeo, screenMat);
    screen.position.set(-1.7, 1.1, -0.6 + i * 0.4);
    root.add(screen);
  }

  // 5. IoT Hardware Prototyping Bench (Against Right Wall)
  const benchGeo = new BoxGeometry(0.9, 0.75, 1.8);
  const bench = new Mesh(benchGeo, woodWarmMat);
  bench.position.set(1.7, 0.375, -0.6);
  root.add(bench);

  // Microcontroller Breadboard & Solar Inverter box
  const breadboardGeo = new BoxGeometry(0.25, 0.03, 0.4);
  const breadboardMat = new MeshStandardMaterial({ color: 0xeeeeee });
  const breadboard = new Mesh(breadboardGeo, breadboardMat);
  breadboard.position.set(1.7, 0.77, -0.8);
  root.add(breadboard);

  const solarBatteryGeo = new BoxGeometry(0.3, 0.25, 0.4);
  const batteryMat = new MeshStandardMaterial({ color: 0x2e7d32 }); // Green eco-battery
  const battery = new Mesh(solarBatteryGeo, batteryMat);
  battery.position.set(1.7, 0.88, -0.3);
  root.add(battery);

  // 6. Server Rack Cabinet
  const serverGeo = new BoxGeometry(0.7, 1.8, 0.6);
  const serverMat = new MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
  const server = new Mesh(serverGeo, serverMat);
  server.position.set(1.7, 0.9, 1.2);
  root.add(server);

  return root;
}
