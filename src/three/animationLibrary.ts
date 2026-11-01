import * as THREE from 'three';

export interface AnimationCategory {
  id: string;
  name: string;
  icon: string;
}

export const ANIMATION_CATEGORIES: AnimationCategory[] = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'locomotion', name: 'Locomotion', icon: '🏃' },
  { id: 'idle', name: 'Idles & Living', icon: '🧍' },
  { id: 'social', name: 'Emotes & Social', icon: '👋' },
  { id: 'combat', name: 'Action & Combat', icon: '⚔️' },
  { id: 'dance', name: 'Dances & Groove', icon: '🕺' },
];

export interface AnimationMeta {
  name?: string;
  category: 'locomotion' | 'idle' | 'social' | 'combat' | 'dance';
  icon: string;
  description: string;
}

export const ANIMATION_METAS: Record<string, AnimationMeta> = {
  'Brisk Walk': { category: 'locomotion', icon: '🚶', description: 'Natural walking stride with synchronized arm swing and hip bob' },
  'Athletic Sprint': { category: 'locomotion', icon: '🏃', description: 'Fast forward-leaning sprint with dynamic knee drive' },
  'Stealth Sneak': { category: 'locomotion', icon: '🕵️', description: 'Low crouched stalking walk with cautious deliberate steps' },
  'Casual Swagger': { category: 'locomotion', icon: '😎', description: 'Relaxed street walk with loose shoulders and hip sway' },
  'Backward Retreat': { category: 'locomotion', icon: '🔙', description: 'Cautious backward steps while maintaining forward watch' },

  'Breathing Idle': { category: 'idle', icon: '🫁', description: 'Natural chest expansion, subtle weight shift, and relaxed sway' },
  'Hero Survey': { category: 'idle', icon: '🦸', description: 'Hands on hips, puffed chest, looking across the horizon' },
  'Exhausted Pant': { category: 'idle', icon: '😮‍💨', description: 'Hands resting on knees with heavy breathing recovery' },
  'Impatient Tap': { category: 'idle', icon: '⏱️', description: 'Arms crossed, tapping right foot impatiently' },
  'Curious Scan': { category: 'idle', icon: '🧐', description: 'Shading eyes with hand, scanning left and right' },

  'Friendly Wave': { category: 'social', icon: '👋', description: 'High arm wave with welcoming head tilt' },
  'Victory Cheer': { category: 'social', icon: '🎉', description: 'Exuberant double fist pump and celebratory knee bounce' },
  'Formal Bow': { category: 'social', icon: '🙇', description: 'Respectful 40-degree waist bow and poised rise' },
  'Rhythmic Applause': { category: 'social', icon: '👏', description: 'Enthusiastic hand clapping with cheerful head bob' },
  'Confused Shrug': { category: 'social', icon: '🤷', description: 'Palms out, raised shoulders, and quizzical head tilt' },

  'Boxing 1-2 Combo': { category: 'combat', icon: '🥊', description: 'Sharp left jab, powerful right cross, and guard reset' },
  'Roundhouse Kick': { category: 'combat', icon: '🥋', description: 'Full rotational spin with high horizontal kick extension' },
  'Katana Slash': { category: 'combat', icon: '⚔️', description: 'Swift diagonal weapon slash and combat flourish' },
  'Superhero Slam': { category: 'combat', icon: '💥', description: 'Mid-air leap and powerful 3-point ground impact' },
  'Shield Brace': { category: 'combat', icon: '🛡️', description: 'Bracing behind shield against heavy incoming impact' },

  'Robot Pop & Lock': { category: 'dance', icon: '🤖', description: 'Snappy 90-degree mechanical popping, locking, and head ticks' },
  'Disco Fever': { category: 'dance', icon: '🕺', description: 'Classic 70s diagonal finger pointing and energetic hip groove' },
  'Swaying Groove': { category: 'dance', icon: '🎶', description: 'Rhythmic shoulder drops, bouncing knees, and side groove' },
  'Air Guitar Solo': { category: 'dance', icon: '🎸', description: 'Rocking fretboard fingerwork and energetic strumming' },
  'Zen Levitation': { category: 'dance', icon: '🧘', description: 'Floating cross-legged meditation with harmonic vertical drift' },
};

/**
 * Helper to build smooth QuaternionKeyframeTrack
 */
function createQuatTrack(
  boneName: string,
  times: number[],
  eulers: [number, number, number][]
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();

  for (const [x, y, z] of eulers) {
    e.set(
      THREE.MathUtils.degToRad(x),
      THREE.MathUtils.degToRad(y),
      THREE.MathUtils.degToRad(z),
      'XYZ'
    );
    q.setFromEuler(e);
    values.push(q.x, q.y, q.z, q.w);
  }

  return new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);
}

/**
 * Helper to build VectorKeyframeTrack (e.g. for hips position)
 */
function createPosTrack(
  boneName: string,
  times: number[],
  positions: [number, number, number][]
): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  for (const [x, y, z] of positions) {
    values.push(x, y, z);
  }
  return new THREE.VectorKeyframeTrack(`${boneName}.position`, times, values);
}

/**
 * Generate full suite of 25+ animations retargeted to the actual bone names
 */
export function generateStudioAnimationLibrary(bonesMap: Map<string, THREE.Bone>): THREE.AnimationClip[] {
  const b = (standardName: string): string => {
    const bone = bonesMap.get(standardName);
    return bone ? bone.name : standardName;
  };

  const hips = b('Hips');
  const spine = b('Spine');
  const chest = b('Chest');
  const neck = b('Neck');
  const head = b('Head');
  const lShoulder = b('LeftShoulder');
  const rShoulder = b('RightShoulder');
  const lArm = b('LeftArm');
  const rArm = b('RightArm');
  const lFore = b('LeftForeArm');
  const rFore = b('RightForeArm');
  const lHand = b('LeftHand');
  const rHand = b('RightHand');
  const lUpLeg = b('LeftUpLeg');
  const rUpLeg = b('RightUpLeg');
  const lLeg = b('LeftLeg');
  const rLeg = b('RightLeg');
  const lFoot = b('LeftFoot');
  const rFoot = b('RightFoot');

  const baseHipsY = bonesMap.get('Hips')?.position.y || 0.95;

  const clips: THREE.AnimationClip[] = [];

  // ==========================================
  // 1. LOCOMOTION: Brisk Walk (1.2s loop)
  // ==========================================
  {
    const dur = 1.2;
    const t = [0, 0.3, 0.6, 0.9, 1.2];
    const tracks: THREE.KeyframeTrack[] = [
      // Hips vertical bounce and sway
      createPosTrack(hips, t, [
        [0, baseHipsY, 0],
        [0.02, baseHipsY - 0.04, 0],
        [0, baseHipsY, 0],
        [-0.02, baseHipsY - 0.04, 0],
        [0, baseHipsY, 0],
      ]),
      createQuatTrack(hips, t, [
        [0, 5, 0],
        [0, 0, 2],
        [0, -5, 0],
        [0, 0, -2],
        [0, 5, 0],
      ]),
      createQuatTrack(chest, t, [
        [5, -5, 0],
        [3, 0, -2],
        [5, 5, 0],
        [3, 0, 2],
        [5, -5, 0],
      ]),
      // Legs
      createQuatTrack(lUpLeg, t, [
        [30, 0, 0],
        [-10, 0, 0],
        [-35, 0, 0],
        [5, 0, 0],
        [30, 0, 0],
      ]),
      createQuatTrack(rUpLeg, t, [
        [-35, 0, 0],
        [5, 0, 0],
        [30, 0, 0],
        [-10, 0, 0],
        [-35, 0, 0],
      ]),
      createQuatTrack(lLeg, t, [
        [15, 0, 0],
        [55, 0, 0],
        [10, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [10, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
        [55, 0, 0],
        [10, 0, 0],
      ]),
      createQuatTrack(lFoot, t, [
        [-15, 0, 0],
        [20, 0, 0],
        [-10, 0, 0],
        [5, 0, 0],
        [-15, 0, 0],
      ]),
      createQuatTrack(rFoot, t, [
        [-10, 0, 0],
        [5, 0, 0],
        [-15, 0, 0],
        [20, 0, 0],
        [-10, 0, 0],
      ]),
      // Arms opposing legs
      createQuatTrack(lArm, t, [
        [-30, 0, -10],
        [0, 0, -12],
        [25, 0, -10],
        [0, 0, -12],
        [-30, 0, -10],
      ]),
      createQuatTrack(rArm, t, [
        [25, 0, 10],
        [0, 0, 12],
        [-30, 0, 10],
        [0, 0, 12],
        [25, 0, 10],
      ]),
      createQuatTrack(lFore, t, [
        [35, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
        [25, 0, 0],
        [35, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [15, 0, 0],
        [25, 0, 0],
        [35, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Brisk Walk', dur, tracks));
  }

  // ==========================================
  // 2. LOCOMOTION: Athletic Sprint (0.8s loop)
  // ==========================================
  {
    const dur = 0.8;
    const t = [0, 0.2, 0.4, 0.6, 0.8];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY, 0],
        [0, baseHipsY - 0.08, 0],
        [0, baseHipsY, 0],
        [0, baseHipsY - 0.08, 0],
        [0, baseHipsY, 0],
      ]),
      createQuatTrack(hips, t, [
        [15, 8, 0],
        [18, 0, 0],
        [15, -8, 0],
        [18, 0, 0],
        [15, 8, 0],
      ]),
      createQuatTrack(chest, t, [
        [22, -8, 0],
        [18, 0, 0],
        [22, 8, 0],
        [18, 0, 0],
        [22, -8, 0],
      ]),
      // High knee drive
      createQuatTrack(lUpLeg, t, [
        [50, 0, 0],
        [-10, 0, 0],
        [-65, 0, 0],
        [15, 0, 0],
        [50, 0, 0],
      ]),
      createQuatTrack(rUpLeg, t, [
        [-65, 0, 0],
        [15, 0, 0],
        [50, 0, 0],
        [-10, 0, 0],
        [-65, 0, 0],
      ]),
      createQuatTrack(lLeg, t, [
        [20, 0, 0],
        [90, 0, 0],
        [15, 0, 0],
        [40, 0, 0],
        [20, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [15, 0, 0],
        [40, 0, 0],
        [20, 0, 0],
        [90, 0, 0],
        [15, 0, 0],
      ]),
      // Powerful arm drive (90-degree bent elbows)
      createQuatTrack(lArm, t, [
        [-60, 0, -15],
        [-10, 0, -15],
        [50, 0, -15],
        [0, 0, -15],
        [-60, 0, -15],
      ]),
      createQuatTrack(rArm, t, [
        [50, 0, 15],
        [0, 0, 15],
        [-60, 0, 15],
        [-10, 0, 15],
        [50, 0, 15],
      ]),
      createQuatTrack(lFore, t, [
        [85, 0, 0],
        [90, 0, 0],
        [75, 0, 0],
        [85, 0, 0],
        [85, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [75, 0, 0],
        [85, 0, 0],
        [85, 0, 0],
        [90, 0, 0],
        [75, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Athletic Sprint', dur, tracks));
  }

  // ==========================================
  // 3. LOCOMOTION: Stealth Sneak (1.8s loop)
  // ==========================================
  {
    const dur = 1.8;
    const t = [0, 0.45, 0.9, 1.35, 1.8];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY - 0.12, 0],
        [0, baseHipsY - 0.14, 0],
        [0, baseHipsY - 0.12, 0],
        [0, baseHipsY - 0.14, 0],
        [0, baseHipsY - 0.12, 0],
      ]),
      createQuatTrack(chest, t, [
        [25, 5, 0],
        [22, 0, 0],
        [25, -5, 0],
        [22, 0, 0],
        [25, 5, 0],
      ]),
      createQuatTrack(head, t, [
        [-15, 15, 0],
        [-10, 0, 0],
        [-15, -15, 0],
        [-10, 0, 0],
        [-15, 15, 0],
      ]),
      // Low bent legs
      createQuatTrack(lUpLeg, t, [
        [-35, 0, -8],
        [-10, 0, -8],
        [15, 0, -8],
        [-20, 0, -8],
        [-35, 0, -8],
      ]),
      createQuatTrack(rUpLeg, t, [
        [15, 0, 8],
        [-20, 0, 8],
        [-35, 0, 8],
        [-10, 0, 8],
        [15, 0, 8],
      ]),
      createQuatTrack(lLeg, t, [
        [55, 0, 0],
        [75, 0, 0],
        [40, 0, 0],
        [60, 0, 0],
        [55, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [40, 0, 0],
        [60, 0, 0],
        [55, 0, 0],
        [75, 0, 0],
        [40, 0, 0],
      ]),
      // Tense guarding arms
      createQuatTrack(lArm, t, [
        [-20, 20, -35],
        [-15, 15, -30],
        [-10, 10, -35],
        [-15, 15, -30],
        [-20, 20, -35],
      ]),
      createQuatTrack(rArm, t, [
        [-20, -20, 35],
        [-15, -15, 30],
        [-10, -10, 35],
        [-15, -15, 30],
        [-20, -20, 35],
      ]),
      createQuatTrack(lFore, t, [
        [70, 0, 0],
        [65, 0, 0],
        [70, 0, 0],
        [65, 0, 0],
        [70, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [70, 0, 0],
        [65, 0, 0],
        [70, 0, 0],
        [65, 0, 0],
        [70, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Stealth Sneak', dur, tracks));
  }

  // ==========================================
  // 4. LOCOMOTION: Casual Swagger (1.4s loop)
  // ==========================================
  {
    const dur = 1.4;
    const t = [0, 0.35, 0.7, 1.05, 1.4];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0.03, baseHipsY, 0],
        [0, baseHipsY - 0.03, 0],
        [-0.03, baseHipsY, 0],
        [0, baseHipsY - 0.03, 0],
        [0.03, baseHipsY, 0],
      ]),
      createQuatTrack(hips, t, [
        [0, 10, -4],
        [0, 0, 0],
        [0, -10, 4],
        [0, 0, 0],
        [0, 10, -4],
      ]),
      createQuatTrack(chest, t, [
        [-5, -10, 4],
        [-3, 0, 0],
        [-5, 10, -4],
        [-3, 0, 0],
        [-5, -10, 4],
      ]),
      createQuatTrack(head, t, [
        [5, 5, -3],
        [0, 0, 0],
        [5, -5, 3],
        [0, 0, 0],
        [5, 5, -3],
      ]),
      createQuatTrack(lUpLeg, t, [
        [25, 0, -5],
        [-5, 0, -5],
        [-25, 0, -5],
        [0, 0, -5],
        [25, 0, -5],
      ]),
      createQuatTrack(rUpLeg, t, [
        [-25, 0, 5],
        [0, 0, 5],
        [25, 0, 5],
        [-5, 0, 5],
        [-25, 0, 5],
      ]),
      createQuatTrack(lLeg, t, [
        [15, 0, 0],
        [45, 0, 0],
        [10, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [10, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
        [45, 0, 0],
        [10, 0, 0],
      ]),
      createQuatTrack(lArm, t, [
        [-25, 0, -18],
        [0, 0, -22],
        [20, 0, -18],
        [0, 0, -22],
        [-25, 0, -18],
      ]),
      createQuatTrack(rArm, t, [
        [20, 0, 18],
        [0, 0, 22],
        [-25, 0, 18],
        [0, 0, 22],
        [20, 0, 18],
      ]),
      createQuatTrack(lFore, t, [
        [25, 0, 0],
        [15, 0, 0],
        [10, 0, 0],
        [20, 0, 0],
        [25, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [10, 0, 0],
        [20, 0, 0],
        [25, 0, 0],
        [15, 0, 0],
        [10, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Casual Swagger', dur, tracks));
  }

  // ==========================================
  // 5. LOCOMOTION: Backward Retreat (1.4s loop)
  // ==========================================
  {
    const dur = 1.4;
    const t = [0, 0.35, 0.7, 1.05, 1.4];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(chest, t, [
        [10, 0, 0],
        [8, 5, 0],
        [10, 0, 0],
        [8, -5, 0],
        [10, 0, 0],
      ]),
      createQuatTrack(lUpLeg, t, [
        [-20, 0, 0],
        [10, 0, 0],
        [25, 0, 0],
        [-5, 0, 0],
        [-20, 0, 0],
      ]),
      createQuatTrack(rUpLeg, t, [
        [25, 0, 0],
        [-5, 0, 0],
        [-20, 0, 0],
        [10, 0, 0],
        [25, 0, 0],
      ]),
      createQuatTrack(lLeg, t, [
        [10, 0, 0],
        [40, 0, 0],
        [20, 0, 0],
        [30, 0, 0],
        [10, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [20, 0, 0],
        [30, 0, 0],
        [10, 0, 0],
        [40, 0, 0],
        [20, 0, 0],
      ]),
      createQuatTrack(lArm, t, [
        [20, 0, -15],
        [0, 0, -15],
        [-20, 0, -15],
        [0, 0, -15],
        [20, 0, -15],
      ]),
      createQuatTrack(rArm, t, [
        [-20, 0, 15],
        [0, 0, 15],
        [20, 0, 15],
        [0, 0, 15],
        [-20, 0, 15],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Backward Retreat', dur, tracks));
  }

  // ==========================================
  // 6. IDLE: Breathing Idle (2.4s loop)
  // ==========================================
  {
    const dur = 2.4;
    const t = [0, 1.2, 2.4];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY, 0],
        [0, baseHipsY + 0.02, 0],
        [0, baseHipsY, 0],
      ]),
      createQuatTrack(spine, t, [
        [0, 0, 0],
        [-4, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(chest, t, [
        [0, 0, 0],
        [-6, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [0, 0, 0],
        [3, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(lArm, t, [
        [0, 0, -55],
        [-3, 0, -58],
        [0, 0, -55],
      ]),
      createQuatTrack(rArm, t, [
        [0, 0, 55],
        [-3, 0, 58],
        [0, 0, 55],
      ]),
      createQuatTrack(lFore, t, [
        [15, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [15, 0, 0],
        [20, 0, 0],
        [15, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Breathing Idle', dur, tracks));
  }

  // ==========================================
  // 7. IDLE: Hero Survey (3.0s loop)
  // ==========================================
  {
    const dur = 3.0;
    const t = [0, 0.75, 1.5, 2.25, 3.0];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(chest, t, [
        [-10, 0, 0],
        [-8, 8, 0],
        [-10, 0, 0],
        [-8, -8, 0],
        [-10, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [-5, 0, 0],
        [0, 30, 5],
        [-5, 0, 0],
        [0, -30, -5],
        [-5, 0, 0],
      ]),
      // Hands on hips
      createQuatTrack(lArm, t, [
        [15, 10, -55],
        [15, 10, -55],
        [15, 10, -55],
        [15, 10, -55],
        [15, 10, -55],
      ]),
      createQuatTrack(rArm, t, [
        [15, -10, 55],
        [15, -10, 55],
        [15, -10, 55],
        [15, -10, 55],
        [15, -10, 55],
      ]),
      createQuatTrack(lFore, t, [
        [60, -30, 0],
        [60, -30, 0],
        [60, -30, 0],
        [60, -30, 0],
        [60, -30, 0],
      ]),
      createQuatTrack(rFore, t, [
        [60, 30, 0],
        [60, 30, 0],
        [60, 30, 0],
        [60, 30, 0],
        [60, 30, 0],
      ]),
      createQuatTrack(lUpLeg, t, [
        [-5, 0, -12],
        [-5, 0, -12],
        [-5, 0, -12],
        [-5, 0, -12],
        [-5, 0, -12],
      ]),
      createQuatTrack(rUpLeg, t, [
        [-5, 0, 12],
        [-5, 0, 12],
        [-5, 0, 12],
        [-5, 0, 12],
        [-5, 0, 12],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Hero Survey', dur, tracks));
  }

  // ==========================================
  // 8. IDLE: Exhausted Pant (2.0s loop)
  // ==========================================
  {
    const dur = 2.0;
    const t = [0, 0.5, 1.0, 1.5, 2.0];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY - 0.15, 0],
        [0, baseHipsY - 0.12, 0],
        [0, baseHipsY - 0.15, 0],
        [0, baseHipsY - 0.12, 0],
        [0, baseHipsY - 0.15, 0],
      ]),
      createQuatTrack(chest, t, [
        [40, 0, 0],
        [32, 0, 0],
        [40, 0, 0],
        [32, 0, 0],
        [40, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [-20, 0, 0],
        [-15, 0, 0],
        [-20, 0, 0],
        [-15, 0, 0],
        [-20, 0, 0],
      ]),
      // Bent legs
      createQuatTrack(lUpLeg, t, [
        [-40, 0, -12],
        [-35, 0, -12],
        [-40, 0, -12],
        [-35, 0, -12],
        [-40, 0, -12],
      ]),
      createQuatTrack(rUpLeg, t, [
        [-40, 0, 12],
        [-35, 0, 12],
        [-40, 0, 12],
        [-35, 0, 12],
        [-40, 0, 12],
      ]),
      createQuatTrack(lLeg, t, [
        [50, 0, 0],
        [45, 0, 0],
        [50, 0, 0],
        [45, 0, 0],
        [50, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [50, 0, 0],
        [45, 0, 0],
        [50, 0, 0],
        [45, 0, 0],
        [50, 0, 0],
      ]),
      // Hands on thighs
      createQuatTrack(lArm, t, [
        [20, 0, -35],
        [15, 0, -35],
        [20, 0, -35],
        [15, 0, -35],
        [20, 0, -35],
      ]),
      createQuatTrack(rArm, t, [
        [20, 0, 35],
        [15, 0, 35],
        [20, 0, 35],
        [15, 0, 35],
        [20, 0, 35],
      ]),
      createQuatTrack(lFore, t, [
        [55, 0, 0],
        [50, 0, 0],
        [55, 0, 0],
        [50, 0, 0],
        [55, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [55, 0, 0],
        [50, 0, 0],
        [55, 0, 0],
        [50, 0, 0],
        [55, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Exhausted Pant', dur, tracks));
  }

  // ==========================================
  // 9. IDLE: Impatient Tap (1.6s loop)
  // ==========================================
  {
    const dur = 1.6;
    const t = [0, 0.4, 0.6, 0.8, 1.0, 1.3, 1.6];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(chest, t, [
        [5, 5, 0],
        [5, 5, 0],
        [5, 5, 0],
        [5, 5, 0],
        [5, 5, 0],
        [8, 15, 0],
        [5, 5, 0],
      ]),
      createQuatTrack(head, t, [
        [5, -5, 5],
        [5, -5, 5],
        [5, -5, 5],
        [5, -5, 5],
        [5, -5, 5],
        [15, -20, 0],
        [5, -5, 5],
      ]),
      // Crossed arms
      createQuatTrack(lArm, t, [
        [-30, 25, -20],
        [-30, 25, -20],
        [-30, 25, -20],
        [-30, 25, -20],
        [-30, 25, -20],
        [-30, 25, -20],
        [-30, 25, -20],
      ]),
      createQuatTrack(rArm, t, [
        [-30, -25, 20],
        [-30, -25, 20],
        [-30, -25, 20],
        [-30, -25, 20],
        [-30, -25, 20],
        [-30, -25, 20],
        [-30, -25, 20],
      ]),
      createQuatTrack(lFore, t, [
        [90, -45, 0],
        [90, -45, 0],
        [90, -45, 0],
        [90, -45, 0],
        [90, -45, 0],
        [90, -45, 0],
        [90, -45, 0],
      ]),
      createQuatTrack(rFore, t, [
        [90, 45, 0],
        [90, 45, 0],
        [90, 45, 0],
        [90, 45, 0],
        [90, 45, 0],
        [90, 45, 0],
        [90, 45, 0],
      ]),
      // Right foot taps rhythmically
      createQuatTrack(rFoot, t, [
        [0, 0, 0],
        [-20, 0, 0],
        [5, 0, 0],
        [-20, 0, 0],
        [5, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Impatient Tap', dur, tracks));
  }

  // ==========================================
  // 10. SOCIAL: Friendly Wave (1.8s loop)
  // ==========================================
  {
    const dur = 1.8;
    const t = [0, 0.45, 0.9, 1.35, 1.8];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(head, t, [
        [0, 5, 8],
        [0, 10, 12],
        [0, 5, 8],
        [0, 10, 12],
        [0, 5, 8],
      ]),
      createQuatTrack(chest, t, [
        [0, 5, 0],
        [0, 8, 0],
        [0, 5, 0],
        [0, 8, 0],
        [0, 5, 0],
      ]),
      // Left arm relaxed
      createQuatTrack(lArm, t, [
        [5, 0, -65],
        [5, 0, -65],
        [5, 0, -65],
        [5, 0, -65],
        [5, 0, -65],
      ]),
      // Right arm raised high waving
      createQuatTrack(rArm, t, [
        [-20, 0, 125],
        [-20, 0, 130],
        [-20, 0, 125],
        [-20, 0, 130],
        [-20, 0, 125],
      ]),
      createQuatTrack(rFore, t, [
        [0, 0, 40],
        [0, 0, 85],
        [0, 0, 40],
        [0, 0, 85],
        [0, 0, 40],
      ]),
      createQuatTrack(rHand, t, [
        [0, 0, -15],
        [0, 0, 25],
        [0, 0, -15],
        [0, 0, 25],
        [0, 0, -15],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Friendly Wave', dur, tracks));
  }

  // ==========================================
  // 11. SOCIAL: Victory Cheer (1.6s loop)
  // ==========================================
  {
    const dur = 1.6;
    const t = [0, 0.4, 0.8, 1.2, 1.6];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY, 0],
        [0, baseHipsY + 0.12, 0],
        [0, baseHipsY - 0.04, 0],
        [0, baseHipsY + 0.12, 0],
        [0, baseHipsY, 0],
      ]),
      createQuatTrack(chest, t, [
        [-15, 0, 0],
        [-20, 0, 0],
        [-12, 0, 0],
        [-20, 0, 0],
        [-15, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [-20, 0, 0],
        [-25, 0, 0],
        [-15, 0, 0],
        [-25, 0, 0],
        [-20, 0, 0],
      ]),
      // Both arms pumping high
      createQuatTrack(lArm, t, [
        [0, 0, -135],
        [0, 0, -155],
        [0, 0, -130],
        [0, 0, -155],
        [0, 0, -135],
      ]),
      createQuatTrack(rArm, t, [
        [0, 0, 135],
        [0, 0, 155],
        [0, 0, 130],
        [0, 0, 155],
        [0, 0, 135],
      ]),
      createQuatTrack(lFore, t, [
        [40, 0, 0],
        [15, 0, 0],
        [50, 0, 0],
        [15, 0, 0],
        [40, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [40, 0, 0],
        [15, 0, 0],
        [50, 0, 0],
        [15, 0, 0],
        [40, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Victory Cheer', dur, tracks));
  }

  // ==========================================
  // 12. SOCIAL: Formal Bow (2.2s loop)
  // ==========================================
  {
    const dur = 2.2;
    const t = [0, 0.7, 1.2, 1.8, 2.2];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(hips, t, [
        [0, 0, 0],
        [20, 0, 0],
        [20, 0, 0],
        [5, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(chest, t, [
        [0, 0, 0],
        [35, 0, 0],
        [35, 0, 0],
        [10, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [0, 0, 0],
        [10, 0, 0],
        [10, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(lArm, t, [
        [0, 0, -60],
        [10, 0, -50],
        [10, 0, -50],
        [5, 0, -55],
        [0, 0, -60],
      ]),
      createQuatTrack(rArm, t, [
        [0, 0, 60],
        [10, 0, 50],
        [10, 0, 50],
        [5, 0, 55],
        [0, 0, 60],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Formal Bow', dur, tracks));
  }

  // ==========================================
  // 13. SOCIAL: Rhythmic Applause (1.2s loop)
  // ==========================================
  {
    const dur = 1.2;
    const t = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(chest, t, [
        [0, 0, 0],
        [3, 0, 0],
        [0, 0, 0],
        [3, 0, 0],
        [0, 0, 0],
        [3, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [-5, 0, 0],
        [2, 0, 0],
        [-5, 0, 0],
        [2, 0, 0],
        [-5, 0, 0],
        [2, 0, 0],
        [-5, 0, 0],
      ]),
      // Clapping hands together
      createQuatTrack(lArm, t, [
        [-35, 30, -35],
        [-35, 38, -30],
        [-35, 30, -35],
        [-35, 38, -30],
        [-35, 30, -35],
        [-35, 38, -30],
        [-35, 30, -35],
      ]),
      createQuatTrack(rArm, t, [
        [-35, -30, 35],
        [-35, -38, 30],
        [-35, -30, 35],
        [-35, -38, 30],
        [-35, -30, 35],
        [-35, -38, 30],
        [-35, -30, 35],
      ]),
      createQuatTrack(lFore, t, [
        [80, -20, 0],
        [85, -10, 0],
        [80, -20, 0],
        [85, -10, 0],
        [80, -20, 0],
        [85, -10, 0],
        [80, -20, 0],
      ]),
      createQuatTrack(rFore, t, [
        [80, 20, 0],
        [85, 10, 0],
        [80, 20, 0],
        [85, 10, 0],
        [80, 20, 0],
        [85, 10, 0],
        [80, 20, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Rhythmic Applause', dur, tracks));
  }

  // ==========================================
  // 14. SOCIAL: Confused Shrug (2.2s loop)
  // ==========================================
  {
    const dur = 2.2;
    const t = [0, 0.6, 1.4, 2.0, 2.2];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(head, t, [
        [0, 0, 0],
        [-5, 12, 18],
        [-5, 12, 18],
        [0, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(lShoulder, t, [
        [0, 0, 0],
        [0, 0, 25],
        [0, 0, 25],
        [0, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(rShoulder, t, [
        [0, 0, 0],
        [0, 0, -25],
        [0, 0, -25],
        [0, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(lArm, t, [
        [0, 0, -60],
        [-20, 25, -45],
        [-20, 25, -45],
        [0, 0, -60],
        [0, 0, -60],
      ]),
      createQuatTrack(rArm, t, [
        [0, 0, 60],
        [-20, -25, 45],
        [-20, -25, 45],
        [0, 0, 60],
        [0, 0, 60],
      ]),
      createQuatTrack(lFore, t, [
        [15, 0, 0],
        [85, -45, 0],
        [85, -45, 0],
        [15, 0, 0],
        [15, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [15, 0, 0],
        [85, 45, 0],
        [85, 45, 0],
        [15, 0, 0],
        [15, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Confused Shrug', dur, tracks));
  }

  // ==========================================
  // 15. COMBAT: Boxing 1-2 Combo (1.6s loop)
  // ==========================================
  {
    const dur = 1.6;
    const t = [0, 0.3, 0.6, 0.9, 1.2, 1.6];
    const tracks: THREE.KeyframeTrack[] = [
      // Torso twists into punches
      createQuatTrack(chest, t, [
        [10, -20, 0],
        [12, -35, 0], // Left Jab
        [10, -10, 0],
        [15, 30, 0],  // Right Cross
        [10, -20, 0],
        [10, -20, 0],
      ]),
      // Left Arm (Jab)
      createQuatTrack(lArm, t, [
        [-40, 20, -35],
        [-85, 10, -10], // Full jab extension
        [-40, 20, -35],
        [-35, 25, -40], // Guarding during cross
        [-40, 20, -35],
        [-40, 20, -35],
      ]),
      createQuatTrack(lFore, t, [
        [85, 0, 0],
        [10, 0, 0],     // Extended elbow
        [85, 0, 0],
        [90, 0, 0],
        [85, 0, 0],
        [85, 0, 0],
      ]),
      // Right Arm (Cross)
      createQuatTrack(rArm, t, [
        [-45, -20, 35],
        [-45, -20, 35],
        [-40, -15, 30],
        [-90, -15, 10], // Full cross extension
        [-45, -20, 35],
        [-45, -20, 35],
      ]),
      createQuatTrack(rFore, t, [
        [90, 0, 0],
        [90, 0, 0],
        [80, 0, 0],
        [10, 0, 0],     // Extended elbow
        [90, 0, 0],
        [90, 0, 0],
      ]),
      // Stance
      createQuatTrack(lUpLeg, t, [
        [-25, -15, -10],
        [-25, -15, -10],
        [-25, -15, -10],
        [-20, 10, -10],
        [-25, -15, -10],
        [-25, -15, -10],
      ]),
      createQuatTrack(rUpLeg, t, [
        [20, 15, 10],
        [20, 15, 10],
        [15, 15, 10],
        [30, 25, 10],
        [20, 15, 10],
        [20, 15, 10],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Boxing 1-2 Combo', dur, tracks));
  }

  // ==========================================
  // 16. COMBAT: Roundhouse Kick (1.8s loop)
  // ==========================================
  {
    const dur = 1.8;
    const t = [0, 0.4, 0.8, 1.2, 1.8];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY, 0],
        [0, baseHipsY + 0.05, 0],
        [0, baseHipsY + 0.1, 0],
        [0, baseHipsY, 0],
        [0, baseHipsY, 0],
      ]),
      createQuatTrack(hips, t, [
        [0, 0, 0],
        [10, -45, 0],
        [-15, -95, 20], // Full kick turn
        [5, -30, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(chest, t, [
        [0, 0, 0],
        [15, 30, 0],
        [-10, 60, -15],
        [10, 20, 0],
        [0, 0, 0],
      ]),
      // Right Leg: chamber, extend high kick, recover
      createQuatTrack(rUpLeg, t, [
        [10, 0, 10],
        [-65, -30, 45],  // Chamber knee
        [-85, -60, 95],  // Full horizontal extension
        [-40, -20, 30],
        [10, 0, 10],
      ]),
      createQuatTrack(rLeg, t, [
        [10, 0, 0],
        [110, 0, 0],    // Bent knee
        [10, 0, 0],     // Extended snap
        [60, 0, 0],
        [10, 0, 0],
      ]),
      // Left leg supporting
      createQuatTrack(lUpLeg, t, [
        [-15, 0, -10],
        [-20, 0, -10],
        [-15, 0, -10],
        [-15, 0, -10],
        [-15, 0, -10],
      ]),
      createQuatTrack(lLeg, t, [
        [20, 0, 0],
        [35, 0, 0],
        [25, 0, 0],
        [20, 0, 0],
        [20, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Roundhouse Kick', dur, tracks));
  }

  // ==========================================
  // 17. COMBAT: Katana Slash (1.8s loop)
  // ==========================================
  {
    const dur = 1.8;
    const t = [0, 0.4, 0.7, 1.2, 1.8];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(chest, t, [
        [10, -25, 0],
        [5, 45, 0],   // Wind up right
        [20, -50, 0], // Powerful diagonal strike left
        [15, -30, 0], // Flourish hold
        [10, -25, 0],
      ]),
      // Right arm weapon slash
      createQuatTrack(rArm, t, [
        [-30, 0, 45],
        [-80, 45, 80],  // Raised sword windup
        [-45, -65, 10], // Sweeping strike
        [-35, -40, 25],
        [-30, 0, 45],
      ]),
      createQuatTrack(rFore, t, [
        [75, 0, 0],
        [95, 0, 0],
        [20, 0, 0],     // Slashed extension
        [60, 0, 0],
        [75, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Katana Slash', dur, tracks));
  }

  // ==========================================
  // 18. COMBAT: Superhero Slam (2.4s loop)
  // ==========================================
  {
    const dur = 2.4;
    const t = [0, 0.5, 0.9, 1.3, 1.8, 2.4];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY, 0],
        [0, baseHipsY + 0.45, 0], // Mid-air leap
        [0, baseHipsY + 0.35, 0],
        [0, baseHipsY - 0.45, 0], // Ground impact crouch
        [0, baseHipsY - 0.45, 0], // Hold hero landing
        [0, baseHipsY, 0],
      ]),
      createQuatTrack(chest, t, [
        [0, 0, 0],
        [-20, 0, 0],
        [30, 0, 0],
        [65, -15, 0], // Slammed down
        [65, -15, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(head, t, [
        [0, 0, 0],
        [-20, 0, 0],
        [20, 0, 0],
        [-55, 15, 0], // Head looking forward from ground
        [-55, 15, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(rArm, t, [
        [0, 0, 60],
        [-110, 0, 30],
        [-130, 0, 20],
        [45, -20, 25], // Fist on ground
        [45, -20, 25],
        [0, 0, 60],
      ]),
      createQuatTrack(rFore, t, [
        [15, 0, 0],
        [70, 0, 0],
        [90, 0, 0],
        [40, 0, 0],
        [40, 0, 0],
        [15, 0, 0],
      ]),
      // Deep ground landing stance
      createQuatTrack(lUpLeg, t, [
        [0, 0, -10],
        [-50, 0, -20],
        [-70, 0, -20],
        [-75, 25, -35],
        [-75, 25, -35],
        [0, 0, -10],
      ]),
      createQuatTrack(rUpLeg, t, [
        [0, 0, 10],
        [30, 0, 20],
        [50, 0, 20],
        [65, 0, 25],
        [65, 0, 25],
        [0, 0, 10],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Superhero Slam', dur, tracks));
  }

  // ==========================================
  // 19. COMBAT: Shield Brace (2.0s loop)
  // ==========================================
  {
    const dur = 2.0;
    const t = [0, 0.4, 0.6, 1.2, 2.0];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0, baseHipsY - 0.08, 0],
        [0, baseHipsY - 0.14, 0], // Impact push back
        [0, baseHipsY - 0.12, 0],
        [0, baseHipsY - 0.08, 0],
        [0, baseHipsY - 0.08, 0],
      ]),
      createQuatTrack(chest, t, [
        [15, 25, 0],
        [25, 30, -5],
        [20, 28, -3],
        [15, 25, 0],
        [15, 25, 0],
      ]),
      // Left arm holds shield braced in front of body
      createQuatTrack(lArm, t, [
        [-55, 30, -45],
        [-45, 35, -40],
        [-50, 32, -42],
        [-55, 30, -45],
        [-55, 30, -45],
      ]),
      createQuatTrack(lFore, t, [
        [85, 0, 0],
        [95, 0, 0],
        [90, 0, 0],
        [85, 0, 0],
        [85, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Shield Brace', dur, tracks));
  }

  // ==========================================
  // 20. DANCE: Robot Pop & Lock (2.4s loop)
  // ==========================================
  {
    const dur = 2.4;
    const t = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4];
    const tracks: THREE.KeyframeTrack[] = [
      // Discrete 90-degree mechanical snaps
      createQuatTrack(head, t, [
        [0, 0, 0],
        [0, 45, 0],
        [0, 45, 0],
        [0, -45, 0],
        [0, -45, 0],
        [-20, 0, 0],
        [-20, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(chest, t, [
        [0, 0, 0],
        [-8, 0, 0],
        [0, 0, 0],
        [-8, 0, 0],
        [0, 0, 0],
        [-8, 0, 0],
        [0, 0, 0],
        [-8, 0, 0],
        [0, 0, 0],
      ]),
      createQuatTrack(lArm, t, [
        [0, 0, -90],
        [0, 0, -90],
        [-90, 0, 0],
        [-90, 0, 0],
        [0, 0, -90],
        [0, 0, -90],
        [-45, 45, 0],
        [-45, 45, 0],
        [0, 0, -90],
      ]),
      createQuatTrack(lFore, t, [
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
      ]),
      createQuatTrack(rArm, t, [
        [-90, 0, 0],
        [-90, 0, 0],
        [0, 0, 90],
        [0, 0, 90],
        [-90, 0, 0],
        [-90, 0, 0],
        [-45, -45, 0],
        [-45, -45, 0],
        [-90, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
        [90, 0, 0],
        [0, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Robot Pop & Lock', dur, tracks));
  }

  // ==========================================
  // 21. DANCE: Disco Fever (1.6s loop)
  // ==========================================
  {
    const dur = 1.6;
    const t = [0, 0.4, 0.8, 1.2, 1.6];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0.05, baseHipsY, 0],
        [0, baseHipsY - 0.04, 0],
        [-0.05, baseHipsY, 0],
        [0, baseHipsY - 0.04, 0],
        [0.05, baseHipsY, 0],
      ]),
      createQuatTrack(hips, t, [
        [0, 15, -10],
        [0, 0, 0],
        [0, -15, 10],
        [0, 0, 0],
        [0, 15, -10],
      ]),
      // Right arm finger point: high right to low left
      createQuatTrack(rArm, t, [
        [-30, 0, 140], // Pointing high right
        [-10, 0, 80],
        [30, -30, 20], // Pointing low across body
        [-10, 0, 80],
        [-30, 0, 140],
      ]),
      createQuatTrack(rFore, t, [
        [10, 0, 0],
        [40, 0, 0],
        [15, 0, 0],
        [40, 0, 0],
        [10, 0, 0],
      ]),
      // Left hand on hip
      createQuatTrack(lArm, t, [
        [15, 10, -50],
        [15, 10, -50],
        [15, 10, -50],
        [15, 10, -50],
        [15, 10, -50],
      ]),
      createQuatTrack(lFore, t, [
        [75, -25, 0],
        [75, -25, 0],
        [75, -25, 0],
        [75, -25, 0],
        [75, -25, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Disco Fever', dur, tracks));
  }

  // ==========================================
  // 22. DANCE: Swaying Groove (1.6s loop)
  // ==========================================
  {
    const dur = 1.6;
    const t = [0, 0.4, 0.8, 1.2, 1.6];
    const tracks: THREE.KeyframeTrack[] = [
      createPosTrack(hips, t, [
        [0.06, baseHipsY - 0.03, 0],
        [0, baseHipsY, 0],
        [-0.06, baseHipsY - 0.03, 0],
        [0, baseHipsY, 0],
        [0.06, baseHipsY - 0.03, 0],
      ]),
      createQuatTrack(chest, t, [
        [5, 0, 8],
        [0, 0, 0],
        [5, 0, -8],
        [0, 0, 0],
        [5, 0, 8],
      ]),
      createQuatTrack(head, t, [
        [5, 5, -8],
        [0, 0, 0],
        [5, -5, 8],
        [0, 0, 0],
        [5, 5, -8],
      ]),
      createQuatTrack(lArm, t, [
        [10, 0, -50],
        [0, 0, -65],
        [-10, 0, -50],
        [0, 0, -65],
        [10, 0, -50],
      ]),
      createQuatTrack(rArm, t, [
        [-10, 0, 50],
        [0, 0, 65],
        [10, 0, 50],
        [0, 0, 65],
        [-10, 0, 50],
      ]),
      createQuatTrack(lFore, t, [
        [50, 0, 0],
        [30, 0, 0],
        [50, 0, 0],
        [30, 0, 0],
        [50, 0, 0],
      ]),
      createQuatTrack(rFore, t, [
        [50, 0, 0],
        [30, 0, 0],
        [50, 0, 0],
        [30, 0, 0],
        [50, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Swaying Groove', dur, tracks));
  }

  // ==========================================
  // 23. DANCE: Air Guitar Solo (1.8s loop)
  // ==========================================
  {
    const dur = 1.8;
    const t = [0, 0.45, 0.9, 1.35, 1.8];
    const tracks: THREE.KeyframeTrack[] = [
      createQuatTrack(chest, t, [
        [15, -25, 0],
        [-5, -15, 0],
        [20, -30, 0],
        [-5, -15, 0],
        [15, -25, 0],
      ]),
      createQuatTrack(head, t, [
        [25, 0, 0],
        [-15, 0, 0], // Headbanging
        [30, 0, 0],
        [-15, 0, 0],
        [25, 0, 0],
      ]),
      // Left hand on fretboard high up
      createQuatTrack(lArm, t, [
        [-45, 45, -30],
        [-55, 40, -35],
        [-45, 45, -30],
        [-55, 40, -35],
        [-45, 45, -30],
      ]),
      createQuatTrack(lFore, t, [
        [110, -30, 0],
        [115, -25, 0],
        [110, -30, 0],
        [115, -25, 0],
        [110, -30, 0],
      ]),
      // Right hand strumming vigorously
      createQuatTrack(rArm, t, [
        [-15, -20, 45],
        [10, -20, 35],
        [-15, -20, 45],
        [10, -20, 35],
        [-15, -20, 45],
      ]),
      createQuatTrack(rFore, t, [
        [45, 0, 0],
        [85, 0, 0],
        [45, 0, 0],
        [85, 0, 0],
        [45, 0, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Air Guitar Solo', dur, tracks));
  }

  // ==========================================
  // 24. DANCE: Zen Levitation (3.0s loop)
  // ==========================================
  {
    const dur = 3.0;
    const t = [0, 0.75, 1.5, 2.25, 3.0];
    const tracks: THREE.KeyframeTrack[] = [
      // Floating vertical harmonic oscillation
      createPosTrack(hips, t, [
        [0, baseHipsY + 0.15, 0],
        [0, baseHipsY + 0.28, 0],
        [0, baseHipsY + 0.15, 0],
        [0, baseHipsY + 0.05, 0],
        [0, baseHipsY + 0.15, 0],
      ]),
      createQuatTrack(chest, t, [
        [-3, 0, 0],
        [-8, 0, 0],
        [-3, 0, 0],
        [0, 0, 0],
        [-3, 0, 0],
      ]),
      // Crossed meditative legs
      createQuatTrack(lUpLeg, t, [
        [-65, 35, -55],
        [-65, 35, -55],
        [-65, 35, -55],
        [-65, 35, -55],
        [-65, 35, -55],
      ]),
      createQuatTrack(rUpLeg, t, [
        [-65, -35, 55],
        [-65, -35, 55],
        [-65, -35, 55],
        [-65, -35, 55],
        [-65, -35, 55],
      ]),
      createQuatTrack(lLeg, t, [
        [110, 0, 0],
        [110, 0, 0],
        [110, 0, 0],
        [110, 0, 0],
        [110, 0, 0],
      ]),
      createQuatTrack(rLeg, t, [
        [110, 0, 0],
        [110, 0, 0],
        [110, 0, 0],
        [110, 0, 0],
        [110, 0, 0],
      ]),
      // Mudra hands
      createQuatTrack(lArm, t, [
        [10, 15, -45],
        [15, 20, -50],
        [10, 15, -45],
        [5, 10, -40],
        [10, 15, -45],
      ]),
      createQuatTrack(rArm, t, [
        [10, -15, 45],
        [15, -20, 50],
        [10, -15, 45],
        [5, -10, 40],
        [10, -15, 45],
      ]),
      createQuatTrack(lFore, t, [
        [75, -40, 0],
        [80, -45, 0],
        [75, -40, 0],
        [70, -35, 0],
        [75, -40, 0],
      ]),
      createQuatTrack(rFore, t, [
        [75, 40, 0],
        [80, 45, 0],
        [75, 40, 0],
        [70, 35, 0],
        [75, 40, 0],
      ]),
    ];
    clips.push(new THREE.AnimationClip('Zen Levitation', dur, tracks));
  }

  return clips;
}
