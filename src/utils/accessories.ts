import * as THREE from 'three';
import { HeadAccessory, BackAccessory, HandAccessory } from '../types/character';

export function createHeadAccessory(type: HeadAccessory, colorHex: string): THREE.Group | null {
  if (type === 'none') return null;

  const group = new THREE.Group();
  group.name = `accessory_head_${type}`;
  const matMain = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.25,
    metalness: 0.5,
  });
  const matGold = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fbbf24'),
    roughness: 0.15,
    metalness: 0.85,
  });
  const matAccent = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    roughness: 0.2,
    metalness: 0.1,
    emissive: new THREE.Color('#0284c7'),
    emissiveIntensity: 0.4,
  });

  switch (type) {
    case 'crown': {
      // Base band
      const bandGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.08, 16, 1, true);
      const band = new THREE.Mesh(bandGeo, matGold);
      group.add(band);

      // 5 Crown points
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.14, 4),
          matGold
        );
        spike.position.set(Math.cos(angle) * 0.25, 0.09, Math.sin(angle) * 0.25);
        spike.rotation.y = angle;
        group.add(spike);

        // Gem tip
        const gem = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 8, 8),
          matAccent
        );
        gem.position.set(Math.cos(angle) * 0.25, 0.16, Math.sin(angle) * 0.25);
        group.add(gem);
      }
      group.position.set(0, 0.32, 0);
      break;
    }

    case 'horns': {
      for (const side of [-1, 1]) {
        const hornGroup = new THREE.Group();
        const seg1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), matMain);
        seg1.position.set(0, 0.09, 0);
        seg1.rotation.z = side * 0.3;
        hornGroup.add(seg1);

        const seg2 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 8), matGold);
        seg2.position.set(side * 0.04, 0.22, 0);
        seg2.rotation.z = side * 0.6;
        hornGroup.add(seg2);

        hornGroup.position.set(side * 0.22, 0.25, 0.08);
        group.add(hornGroup);
      }
      break;
    }

    case 'headphones': {
      // Headband arc
      const arcGeo = new THREE.TorusGeometry(0.28, 0.03, 8, 24, Math.PI);
      const headband = new THREE.Mesh(arcGeo, matMain);
      headband.rotation.z = Math.PI;
      headband.position.set(0, 0.05, 0);
      group.add(headband);

      // Ear cups
      for (const side of [-1, 1]) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), matMain);
        cup.rotation.z = Math.PI / 2;
        cup.position.set(side * 0.28, 0.05, 0);
        group.add(cup);

        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), matAccent);
        pad.rotation.z = Math.PI / 2;
        pad.position.set(side * 0.25, 0.05, 0);
        group.add(pad);
      }
      group.position.set(0, 0.12, 0);
      break;
    }

    case 'vr_headset': {
      // Visor box
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.14), matMain);
      visor.position.set(0, 0.05, 0.24);
      group.add(visor);

      // Glowing lens panel
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.02), matAccent);
      screen.position.set(0, 0.05, 0.315);
      group.add(screen);

      // Strap
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.44), matMain);
      strap.position.set(0, 0.05, 0.02);
      group.add(strap);
      break;
    }

    case 'halo': {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.26, 0.025, 12, 32),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex),
          emissive: new THREE.Color(colorHex),
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.1,
        })
      );
      torus.rotation.x = Math.PI / 2;
      group.add(torus);
      group.position.set(0, 0.46, 0);
      break;
    }

    case 'party_hat': {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 16), matMain);
      cone.position.set(0, 0.18, 0);
      group.add(cone);

      const pom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matAccent);
      pom.position.set(0, 0.37, 0);
      group.add(pom);

      group.position.set(0, 0.26, 0);
      break;
    }

    case 'samurai_crest': {
      const crestShape = new THREE.Shape();
      crestShape.moveTo(-0.25, 0);
      crestShape.quadraticCurveTo(0, 0.25, 0.25, 0);
      crestShape.quadraticCurveTo(0, 0.12, -0.25, 0);

      const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
      const geom = new THREE.ExtrudeGeometry(crestShape, extrudeSettings);
      const mesh = new THREE.Mesh(geom, matGold);
      mesh.position.set(0, 0.18, 0.22);
      group.add(mesh);
      break;
    }
  }

  return group;
}

export function createBackAccessory(type: BackAccessory, colorHex: string): THREE.Group | null {
  if (type === 'none') return null;

  const group = new THREE.Group();
  group.name = `accessory_back_${type}`;
  const matMain = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.3,
    metalness: 0.4,
  });
  const matMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'),
    roughness: 0.2,
    metalness: 0.85,
  });
  const matGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    emissive: new THREE.Color('#0284c7'),
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });

  switch (type) {
    case 'jetpack': {
      // Central fuel module
      const tank = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.15), matMain);
      group.add(tank);

      // Dual booster thrusters
      for (const side of [-1, 1]) {
        const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.45, 16), matMetal);
        thruster.position.set(side * 0.22, 0, 0.02);
        group.add(thruster);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), matMain);
        cap.position.set(side * 0.22, 0.23, 0.02);
        group.add(cap);

        // Exhaust flame nozzle
        const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 12), matGlow);
        nozzle.position.set(side * 0.22, -0.28, 0.02);
        nozzle.rotation.x = Math.PI;
        group.add(nozzle);
      }
      group.position.set(0, 0.1, -0.24);
      break;
    }

    case 'dual_swords': {
      for (const side of [-1, 1]) {
        const scabbard = new THREE.Group();
        // Sheath
        const sheath = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.03), matMain);
        sheath.position.set(0, 0, 0);
        scabbard.add(sheath);

        // Hilt & Guard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.05), matMetal);
        guard.position.set(0, 0.36, 0);
        scabbard.add(guard);

        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8), matMetal);
        handle.position.set(0, 0.46, 0);
        scabbard.add(handle);

        scabbard.rotation.z = side * 0.45;
        scabbard.position.set(side * 0.1, 0.05, -0.18);
        group.add(scabbard);
      }
      break;
    }

    case 'backpack': {
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.22), matMain);
      group.add(pack);

      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.08), matMetal);
      pocket.position.set(0, -0.08, -0.14);
      group.add(pocket);

      const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12), matMetal);
      bedroll.rotation.z = Math.PI / 2;
      bedroll.position.set(0, 0.27, -0.05);
      group.add(bedroll);

      group.position.set(0, 0.05, -0.22);
      break;
    }

    case 'cyber_wings': {
      for (const side of [-1, 1]) {
        const wing = new THREE.Group();
        const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.02), matGlow);
        blade1.position.set(side * 0.25, 0.2, 0);
        blade1.rotation.z = side * -0.7;
        wing.add(blade1);

        const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), matMain);
        blade2.position.set(side * 0.2, 0.05, 0);
        blade2.rotation.z = side * -0.9;
        wing.add(blade2);

        wing.position.set(side * 0.12, 0.15, -0.18);
        group.add(wing);
      }
      break;
    }

    case 'cape': {
      const capeGeo = new THREE.PlaneGeometry(0.5, 0.75, 4, 6);
      const capeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, -0.15, -0.2);
      cape.rotation.x = -0.15;
      group.add(cape);
      break;
    }
  }

  return group;
}

export function createHandAccessory(type: HandAccessory, colorHex: string, isLeft: boolean): THREE.Group | null {
  if (type === 'none') return null;

  const group = new THREE.Group();
  group.name = `accessory_hand_${isLeft ? 'L' : 'R'}_${type}`;

  const matMain = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.25,
    metalness: 0.6,
  });
  const matGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1e293b'),
    roughness: 0.3,
    metalness: 0.7,
  });

  switch (type) {
    case 'sword': {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), matDark);
      group.add(handle);

      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.05), matDark);
      guard.position.set(0, 0.1, 0);
      group.add(guard);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.02), matGlow);
      blade.position.set(0, 0.48, 0);
      group.add(blade);

      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 4), matGlow);
      tip.position.set(0, 0.9, 0);
      group.add(tip);

      group.position.set(0, -0.05, 0.1);
      group.rotation.x = Math.PI / 2;
      break;
    }

    case 'blaster': {
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), matDark);
      grip.rotation.x = 0.2;
      group.add(grip);

      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.32), matMain);
      barrel.position.set(0, 0.07, 0.08);
      group.add(barrel);

      const energyCore = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), matGlow);
      energyCore.rotation.x = Math.PI / 2;
      energyCore.position.set(0, 0.11, 0.05);
      group.add(energyCore);

      group.position.set(0, -0.05, 0.1);
      break;
    }

    case 'shield': {
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.05), matMain);
      group.add(shield);

      const emblem = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.06, 6), matGlow);
      emblem.rotation.x = Math.PI / 2;
      emblem.position.set(0, 0, 0.04);
      group.add(emblem);

      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), matDark);
      strap.position.set(0, 0, -0.04);
      group.add(strap);

      group.position.set(isLeft ? -0.15 : 0.15, 0, 0.05);
      break;
    }

    case 'magic_orb': {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), matGlow);
      group.add(orb);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 8, 24), matMain);
      ring.rotation.x = 0.7;
      ring.rotation.y = 0.5;
      group.add(ring);

      group.position.set(0, 0.18, 0.1);
      break;
    }

    case 'coffee_mug': {
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.14, 16), matMain);
      group.add(mug);

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 8, 16, Math.PI), matMain);
      handle.position.set(0.08, 0, 0);
      handle.rotation.z = -Math.PI / 2;
      group.add(handle);

      const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: '#3d1d06' }));
      coffee.rotation.x = -Math.PI / 2;
      coffee.position.set(0, 0.065, 0);
      group.add(coffee);

      group.position.set(0, 0, 0.08);
      break;
    }

    case 'microphone': {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.22, 12), matDark);
      group.add(handle);

      const grill = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.9,
        roughness: 0.1,
      }));
      grill.position.set(0, 0.14, 0);
      group.add(grill);

      group.position.set(0, 0.05, 0.08);
      break;
    }

    case 'gamepad': {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.04), matDark);
      group.add(body);

      const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), matMain);
      dpad.position.set(-0.06, 0.01, 0.025);
      group.add(dpad);

      for (const [bx, by] of [[0.05, 0.03], [0.08, 0.01], [0.05, -0.01], [0.02, 0.01]]) {
        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8), matGlow);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(bx, by, 0.025);
        group.add(btn);
      }

      group.position.set(0, 0, 0.1);
      break;
    }
  }

  return group;
}
