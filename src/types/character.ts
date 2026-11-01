/**
 * Types for BoxMan Character & Animation Studio
 */

export type MaterialFinish = 'clay' | 'glossy' | 'metallic' | 'cyber' | 'toon' | 'neon' | 'wireframe';

export type PatternType = 'none' | 'smiley' | 'stripes' | 'tech_grid' | 'hexagons' | 'camo' | 'circuit';

export interface CharacterColors {
  primary: string;       // Torso / Main suit
  secondary: string;     // Limbs / Arms & Legs
  head: string;          // Head / Face
  joints: string;        // Joint spheres / shoulders / elbows / knees
  accent: string;        // Trim / Details
  visor: string;         // Eyes / Visor glow
}

export interface CharacterProportions {
  headScale: number;      // 0.7 - 1.5
  torsoWidth: number;     // 0.7 - 1.5
  limbThickness: number;  // 0.7 - 1.5
  legLength: number;      // 0.8 - 1.4
  overallScale: number;   // 0.5 - 1.5
}

export type HeadAccessory = 'none' | 'crown' | 'horns' | 'headphones' | 'vr_headset' | 'halo' | 'party_hat' | 'samurai_crest';
export type BackAccessory = 'none' | 'jetpack' | 'dual_swords' | 'backpack' | 'cyber_wings' | 'cape';
export type HandAccessory = 'none' | 'sword' | 'blaster' | 'shield' | 'magic_orb' | 'coffee_mug' | 'microphone' | 'gamepad';

export interface CharacterAccessories {
  head: HeadAccessory;
  headColor: string;
  back: BackAccessory;
  backColor: string;
  leftHand: HandAccessory;
  leftHandColor: string;
  rightHand: HandAccessory;
  rightHandColor: string;
}

export interface CharacterCustomization {
  colors: CharacterColors;
  finish: MaterialFinish;
  pattern: PatternType;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  proportions: CharacterProportions;
  accessories: CharacterAccessories;
}

export interface BoneEulerRotation {
  x: number; // in degrees
  y: number;
  z: number;
}

export type PoseData = Record<string, BoneEulerRotation>;

export interface KeyframeData {
  id: string;
  name: string;
  time: number; // time in seconds on timeline
  pose: PoseData;
}

export interface CustomAnimation {
  name: string;
  duration: number; // in seconds
  keyframes: KeyframeData[];
}

export interface PresetPose {
  id: string;
  name: string;
  icon: string;
  description: string;
  pose: PoseData;
}

export interface PresetCharacter {
  id: string;
  name: string;
  category: string;
  previewColor: string;
  customization: CharacterCustomization;
  defaultPoseId?: string;
}

export interface StudioSettings {
  backgroundTheme: 'dark' | 'slate' | 'cyber' | 'studio' | 'light';
  lightingIntensity: number;
  showFloorGrid: boolean;
  showShadows: boolean;
  showSkeleton: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  cameraFov: number;
}

export type StudioTab = 'style' | 'accessories' | 'pose' | 'animation' | 'studio';

export interface BoneInfo {
  name: string;
  displayName: string;
  group: 'head' | 'torso' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'other';
}
