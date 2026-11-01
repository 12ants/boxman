import * as THREE from 'three';
import { PatternType } from '../types/character';

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getProceduralPatternTexture(type: PatternType, tintColorHex = '#ffffff'): THREE.CanvasTexture | null {
  if (type === 'none') return null;

  const cacheKey = `${type}_${tintColorHex}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  switch (type) {
    case 'smiley': {
      // Cute expressive box face
      ctx.fillStyle = tintColorHex;
      // Big expressive eyes
      ctx.beginPath();
      ctx.roundRect(110, 150, 70, 90, 20);
      ctx.roundRect(332, 150, 70, 90, 20);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(135, 175, 16, 0, Math.PI * 2);
      ctx.arc(357, 175, 16, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(100, 275, 24, 0, Math.PI * 2);
      ctx.arc(412, 275, 24, 0, Math.PI * 2);
      ctx.fill();

      // Wide happy smile
      ctx.strokeStyle = tintColorHex;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(256, 260, 90, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    }

    case 'tech_grid': {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);

      // Fine grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2;
      const step = 32;
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Bright accent lines
      ctx.strokeStyle = tintColorHex;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(64, 64);
      ctx.lineTo(256, 64);
      ctx.lineTo(320, 128);
      ctx.lineTo(448, 128);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(64, 448);
      ctx.lineTo(192, 448);
      ctx.lineTo(256, 384);
      ctx.lineTo(448, 384);
      ctx.stroke();

      // Corner tech brackets
      ctx.lineWidth = 8;
      ctx.strokeRect(32, 32, 448, 448);
      break;
    }

    case 'hexagons': {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = tintColorHex;
      ctx.lineWidth = 3;

      const r = 36;
      const h = r * Math.sqrt(3);
      const drawHex = (cx: number, cy: number) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      };

      for (let y = -h; y < 512 + h; y += h) {
        for (let x = -r * 3; x < 512 + r * 3; x += r * 3) {
          drawHex(x, y);
          drawHex(x + 1.5 * r, y + h / 2);
        }
      }
      break;
    }

    case 'stripes': {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = tintColorHex;

      const stripeWidth = 48;
      for (let i = -512; i < 1024; i += stripeWidth * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + stripeWidth, 0);
        ctx.lineTo(i + stripeWidth - 512, 512);
        ctx.lineTo(i - 512, 512);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'camo': {
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, 512, 512);

      const colors = [tintColorHex, '#166534', '#15803d', '#052e16', '#3f6212'];
      const blockSize = 32;
      for (let x = 0; x < 512; x += blockSize) {
        for (let y = 0; y < 512; y += blockSize) {
          const c = colors[Math.floor(Math.abs(Math.sin(x * 12.9898 + y * 78.233)) * colors.length)];
          ctx.fillStyle = c;
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
      break;
    }

    case 'circuit': {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = tintColorHex;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw branching circuit pathways
      const paths = [
        [[64, 128], [192, 128], [256, 192], [384, 192]],
        [[64, 384], [160, 384], [224, 320], [350, 320], [400, 270]],
        [[256, 64], [256, 160], [320, 224], [320, 384]],
        [[128, 64], [128, 256], [192, 320], [192, 448]],
        [[384, 96], [448, 96], [448, 384], [384, 448]],
      ];

      paths.forEach((pts) => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();

        // Terminal circle node
        const last = pts[pts.length - 1];
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(last[0], last[1], 8, 0, Math.PI * 2);
        ctx.fill();

        const first = pts[0];
        ctx.fillStyle = tintColorHex;
        ctx.beginPath();
        ctx.arc(first[0], first[1], 6, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
