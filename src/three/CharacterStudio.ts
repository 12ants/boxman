import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterCustomization,
  PoseData,
  BoneEulerRotation,
  StudioSettings,
  BoneInfo,
  CustomAnimation,
} from '../types/character';
import { HUMANOID_BONES, PRESET_POSES } from '../constants/presets';
import { getProceduralPatternTexture } from '../utils/proceduralTextures';
import { createHeadAccessory, createBackAccessory, createHandAccessory } from '../utils/accessories';
import { generateStudioAnimationLibrary } from './animationLibrary';

export class CharacterStudio {
  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  private controls: OrbitControls | null = null;

  // Scene elements
  private characterGroup: THREE.Group = new THREE.Group();
  private floorGrid: THREE.GridHelper | null = null;
  private contactShadow: THREE.Mesh | null = null;
  private keyLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;
  private skeletonHelper: THREE.SkeletonHelper | null = null;

  // Model & Skeleton
  private modelRoot: THREE.Object3D | null = null;
  private bonesMap: Map<string, THREE.Bone> = new Map();
  private originalRotations: Map<string, THREE.Euler> = new Map();
  private originalQuaternions: Map<string, THREE.Quaternion> = new Map();
  private meshes: THREE.Mesh[] = [];

  // Accessories mounts
  private headAccessoryObj: THREE.Group | null = null;
  private backAccessoryObj: THREE.Group | null = null;
  private leftHandAccessoryObj: THREE.Group | null = null;
  private rightHandAccessoryObj: THREE.Group | null = null;

  // Built-in animations
  private mixer: THREE.AnimationMixer | null = null;
  private gltfAnimations: THREE.AnimationClip[] = [];
  private activeAction: THREE.AnimationAction | null = null;
  private currentClipName: string | null = null;

  // Custom keyframe animation
  private customAnimation: CustomAnimation | null = null;
  private isPlayingCustomAnim = false;
  private customAnimTime = 0;
  private animSpeed = 1.0;

  // State
  private isSoftwareGl = false;
  private animationFrameId = 0;
  private clock: THREE.Clock = new THREE.Clock();
  private currentPose: PoseData = {};
  private currentCustomization: CharacterCustomization | null = null;
  private isLoaded = false;
  private loadError: string | null = null;
  private activeBoneName: string | null = null;

  // Callbacks
  public onLoaded?: (info: { clipNames: string[]; boneNames: string[] }) => void;
  public onTimeUpdate?: (time: number, duration: number) => void;
  public onBoneSelect?: (boneName: string) => void;

  constructor() {
    this.characterGroup.name = 'CharacterRoot';
    this.scene.add(this.characterGroup);
  }

  public init(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Camera setup
    this.camera.aspect = width / height;
    this.camera.position.set(0, 1.25, 3.2);
    this.camera.updateProjectionMatrix();

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 0.9, 0);
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 7.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.12;

    // Studio Environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Setup Studio Scene
    this.setupStudioEnvironment();

    // Load BoxMan model
    this.loadBoxmanModel('https://www.onada.se/assets/boxman-Ml4osRgi.glb');

    // Resize listener
    window.addEventListener('resize', this.handleResize);

    // Start render loop
    this.clock.start();
    this.tick();
  }

  private setupStudioEnvironment() {
    this.scene.background = new THREE.Color('#0b0f17');
    this.scene.fog = new THREE.FogExp2('#0b0f17', 0.08);

    // Warm Key Light with soft shadow
    this.keyLight = new THREE.DirectionalLight('#fff7ed', 2.2);
    this.keyLight.position.set(3, 4.5, 3.5);
    this.keyLight.castShadow = !this.isSoftwareGl;
    if (this.keyLight.castShadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
      const d = 2.5;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 12;
    }
    this.scene.add(this.keyLight);

    // Cool Sky / Warm Ground Hemisphere fill
    this.hemiLight = new THREE.HemisphereLight('#60a5fa', '#0f172a', 1.1);
    this.scene.add(this.hemiLight);

    // Rim / Back light for edge definition
    this.rimLight = new THREE.DirectionalLight('#38bdf8', 1.8);
    this.rimLight.position.set(-2.5, 3, -3.5);
    this.scene.add(this.rimLight);

    // Soft Contact Shadow Plane underneath feet
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });
    this.contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = 0.002;
    this.scene.add(this.contactShadow);

    // Floor Grid
    this.floorGrid = new THREE.GridHelper(10, 20, '#38bdf8', '#1e293b');
    this.floorGrid.position.y = 0.001;
    this.scene.add(this.floorGrid);
  }

  private handleResize = () => {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Load the BoxMan model from GLB URL, with procedural fallback if network fails
   */
  public loadBoxmanModel(url: string) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.processLoadedModel(gltf.scene, gltf.animations);
      },
      undefined,
      (err) => {
        console.warn('Could not load remote BoxMan GLB, generating procedural articulated BoxMan:', err);
        this.loadError = 'Used fallback articulated BoxMan (remote GLB was unreachable)';
        const procedural = this.createProceduralBoxman();
        this.processLoadedModel(procedural.root, procedural.animations);
      }
    );
  }

  private processLoadedModel(model: THREE.Object3D, animations: THREE.AnimationClip[] = []) {
    // Clear previous
    while (this.characterGroup.children.length > 0) {
      this.characterGroup.remove(this.characterGroup.children[0]);
    }
    this.bonesMap.clear();
    this.originalRotations.clear();
    this.originalQuaternions.clear();
    this.meshes = [];

    this.modelRoot = model;
    this.characterGroup.add(model);

    // Center & scale model to sit flush on ground
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;

    // Normalizing scale so height is around 1.8 units
    if (size.y > 0.01) {
      const scaleFactor = 1.8 / size.y;
      model.scale.setScalar(scaleFactor);
      model.position.y = -min.y * scaleFactor;
    }

    // Traverse objects: collect meshes and bones
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = !this.isSoftwareGl;
        mesh.receiveShadow = !this.isSoftwareGl;
        this.meshes.push(mesh);
      }

      if ((child as THREE.Bone).isBone) {
        const bone = child as THREE.Bone;
        this.indexBone(bone);
      }
    });

    // Skeleton helper
    if (this.skeletonHelper) {
      this.scene.remove(this.skeletonHelper);
    }
    this.skeletonHelper = new THREE.SkeletonHelper(model);
    this.skeletonHelper.visible = false;
    this.scene.add(this.skeletonHelper);

    // Setup Animation Mixer
    this.mixer = new THREE.AnimationMixer(model);

    // Generate comprehensive studio animation library (Locomotion, Idles, Combat, Dance, Emotes)
    const studioClips = generateStudioAnimationLibrary(this.bonesMap);

    // Merge GLTF animations with the comprehensive library
    const originalNames = new Set(animations.map((a) => a.name));
    this.gltfAnimations = [
      ...animations,
      ...studioClips.filter((c) => !originalNames.has(c.name)),
    ];

    this.isLoaded = true;

    // Apply default customization if set
    if (this.currentCustomization) {
      this.applyCustomization(this.currentCustomization);
    }

    const boneNames = Array.from(this.bonesMap.keys());
    const clipNames = this.gltfAnimations.map((c) => c.name);

    if (this.onLoaded) {
      this.onLoaded({ clipNames, boneNames });
    }
  }

  /**
   * Map messy or standard bone names to standard humanoid keys
   */
  private indexBone(bone: THREE.Bone) {
    const rawName = bone.name;
    const lower = rawName.toLowerCase();

    // Cache rest rotation and quaternion
    this.originalRotations.set(rawName, bone.rotation.clone());
    this.originalQuaternions.set(rawName, bone.quaternion.clone());

    // Normalize bone matching
    let matchedKey: string | null = null;
    for (const b of HUMANOID_BONES) {
      const target = b.name.toLowerCase();
      if (lower === target || lower.endsWith(target) || lower.includes(`_${target}`) || lower.includes(`:${target}`)) {
        matchedKey = b.name;
        break;
      }
    }

    if (!matchedKey) {
      // Common variations
      if (lower.includes('head')) matchedKey = 'Head';
      else if (lower.includes('neck')) matchedKey = 'Neck';
      else if (lower.includes('chest') || lower.includes('spine1') || lower.includes('spine2')) matchedKey = 'Chest';
      else if (lower.includes('spine')) matchedKey = 'Spine';
      else if (lower.includes('hip') || lower.includes('pelvis') || lower.includes('root')) matchedKey = 'Hips';
      else if (lower.includes('left') && lower.includes('shoulder')) matchedKey = 'LeftShoulder';
      else if (lower.includes('right') && lower.includes('shoulder')) matchedKey = 'RightShoulder';
      else if ((lower.includes('left') || lower.includes('_l')) && (lower.includes('forearm') || lower.includes('elbow'))) matchedKey = 'LeftForeArm';
      else if ((lower.includes('right') || lower.includes('_r')) && (lower.includes('forearm') || lower.includes('elbow'))) matchedKey = 'RightForeArm';
      else if ((lower.includes('left') || lower.includes('_l')) && (lower.includes('hand') || lower.includes('wrist'))) matchedKey = 'LeftHand';
      else if ((lower.includes('right') || lower.includes('_r')) && (lower.includes('hand') || lower.includes('wrist'))) matchedKey = 'RightHand';
      else if ((lower.includes('left') || lower.includes('_l')) && (lower.includes('arm'))) matchedKey = 'LeftArm';
      else if ((lower.includes('right') || lower.includes('_r')) && (lower.includes('arm'))) matchedKey = 'RightArm';
      else if ((lower.includes('left') || lower.includes('_l')) && (lower.includes('upleg') || lower.includes('thigh'))) matchedKey = 'LeftUpLeg';
      else if ((lower.includes('right') || lower.includes('_r')) && (lower.includes('upleg') || lower.includes('thigh'))) matchedKey = 'RightUpLeg';
      else if ((lower.includes('left') || lower.includes('_l')) && (lower.includes('leg') || lower.includes('knee') || lower.includes('shin'))) matchedKey = 'LeftLeg';
      else if ((lower.includes('right') || lower.includes('_r')) && (lower.includes('leg') || lower.includes('knee') || lower.includes('shin'))) matchedKey = 'RightLeg';
      else if ((lower.includes('left') || lower.includes('_l')) && (lower.includes('foot') || lower.includes('ankle'))) matchedKey = 'LeftFoot';
      else if ((lower.includes('right') || lower.includes('_r')) && (lower.includes('foot') || lower.includes('ankle'))) matchedKey = 'RightFoot';
      else matchedKey = rawName;
    }

    this.bonesMap.set(matchedKey, bone);
    this.bonesMap.set(rawName, bone);
  }

  /**
   * Generates procedural BoxMan rigged model with bones
   */
  private createProceduralBoxman(): { root: THREE.Group; animations: THREE.AnimationClip[] } {
    const root = new THREE.Group();
    root.name = 'ProceduralBoxman';

    // Build bone hierarchy
    const hips = new THREE.Bone();
    hips.name = 'Hips';
    hips.position.set(0, 0.95, 0);

    const spine = new THREE.Bone();
    spine.name = 'Spine';
    spine.position.set(0, 0.22, 0);
    hips.add(spine);

    const chest = new THREE.Bone();
    chest.name = 'Chest';
    chest.position.set(0, 0.24, 0);
    spine.add(chest);

    const neck = new THREE.Bone();
    neck.name = 'Neck';
    neck.position.set(0, 0.16, 0);
    chest.add(neck);

    const head = new THREE.Bone();
    head.name = 'Head';
    head.position.set(0, 0.12, 0);
    neck.add(head);

    // Left Arm
    const leftShoulder = new THREE.Bone();
    leftShoulder.name = 'LeftShoulder';
    leftShoulder.position.set(0.18, 0.1, 0);
    chest.add(leftShoulder);

    const leftArm = new THREE.Bone();
    leftArm.name = 'LeftArm';
    leftArm.position.set(0.14, 0, 0);
    leftShoulder.add(leftArm);

    const leftForeArm = new THREE.Bone();
    leftForeArm.name = 'LeftForeArm';
    leftForeArm.position.set(0.24, 0, 0);
    leftArm.add(leftForeArm);

    const leftHand = new THREE.Bone();
    leftHand.name = 'LeftHand';
    leftHand.position.set(0.22, 0, 0);
    leftForeArm.add(leftHand);

    // Right Arm
    const rightShoulder = new THREE.Bone();
    rightShoulder.name = 'RightShoulder';
    rightShoulder.position.set(-0.18, 0.1, 0);
    chest.add(rightShoulder);

    const rightArm = new THREE.Bone();
    rightArm.name = 'RightArm';
    rightArm.position.set(-0.14, 0, 0);
    rightShoulder.add(rightArm);

    const rightForeArm = new THREE.Bone();
    rightForeArm.name = 'RightForeArm';
    rightForeArm.position.set(-0.24, 0, 0);
    rightArm.add(rightForeArm);

    const rightHand = new THREE.Bone();
    rightHand.name = 'RightHand';
    rightHand.position.set(-0.22, 0, 0);
    rightForeArm.add(rightHand);

    // Left Leg
    const leftUpLeg = new THREE.Bone();
    leftUpLeg.name = 'LeftUpLeg';
    leftUpLeg.position.set(0.15, -0.05, 0);
    hips.add(leftUpLeg);

    const leftLeg = new THREE.Bone();
    leftLeg.name = 'LeftLeg';
    leftLeg.position.set(0, -0.42, 0);
    leftUpLeg.add(leftLeg);

    const leftFoot = new THREE.Bone();
    leftFoot.name = 'LeftFoot';
    leftFoot.position.set(0, -0.42, 0.08);
    leftLeg.add(leftFoot);

    // Right Leg
    const rightUpLeg = new THREE.Bone();
    rightUpLeg.name = 'RightUpLeg';
    rightUpLeg.position.set(-0.15, -0.05, 0);
    hips.add(rightUpLeg);

    const rightLeg = new THREE.Bone();
    rightLeg.name = 'RightLeg';
    rightLeg.position.set(0, -0.42, 0);
    rightUpLeg.add(rightLeg);

    const rightFoot = new THREE.Bone();
    rightFoot.name = 'RightFoot';
    rightFoot.position.set(0, -0.42, 0.08);
    rightLeg.add(rightFoot);

    root.add(hips);

    // Build Composite Boxman Meshes attached to bones
    const matTorso = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.35, metalness: 0.1 });
    const matHead = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.1 });
    const matLimbs = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.15 });
    const matJoint = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.2, metalness: 0.8 });
    const matVisor = new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#0284c7', emissiveIntensity: 0.8 });

    // Head Box
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), matHead);
    headMesh.name = 'mesh_head';
    headMesh.position.set(0, 0.18, 0);
    head.add(headMesh);

    // Visor eyes
    const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.05), matVisor);
    visorMesh.name = 'mesh_visor';
    visorMesh.position.set(0, 0.18, 0.18);
    head.add(visorMesh);

    // Chest Box
    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.28), matTorso);
    chestMesh.name = 'mesh_torso_upper';
    chestMesh.position.set(0, 0.05, 0);
    chest.add(chestMesh);

    // Spine Box
    const spineMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.26), matTorso);
    spineMesh.name = 'mesh_torso_lower';
    spineMesh.position.set(0, 0, 0);
    spine.add(spineMesh);

    // Pelvis Box
    const hipsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.26), matLimbs);
    hipsMesh.name = 'mesh_hips';
    hips.add(hipsMesh);

    // Arms
    for (const [armBone, foreBone, handBone, dir] of [
      [leftArm, leftForeArm, leftHand, 1],
      [rightArm, rightForeArm, rightHand, -1],
    ] as const) {
      // Shoulder joint
      const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), matJoint);
      armBone.add(shoulderJoint);

      // Upper arm
      const upperArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.14), matLimbs);
      upperArmMesh.name = 'mesh_arm_upper';
      upperArmMesh.position.set(dir * 0.11, 0, 0);
      armBone.add(upperArmMesh);

      // Elbow joint
      const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), matJoint);
      foreBone.add(elbowJoint);

      // Forearm
      const foreMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.13), matLimbs);
      foreMesh.name = 'mesh_arm_lower';
      foreMesh.position.set(dir * 0.1, 0, 0);
      foreBone.add(foreMesh);

      // Hand Box
      const handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), matJoint);
      handMesh.name = 'mesh_hand';
      handBone.add(handMesh);
    }

    // Legs
    for (const [upLegBone, legBone, footBone] of [
      [leftUpLeg, leftLeg, leftFoot],
      [rightUpLeg, rightLeg, rightFoot],
    ]) {
      // Hip joint
      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), matJoint);
      upLegBone.add(hipJoint);

      // Thigh
      const thighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.16), matLimbs);
      thighMesh.name = 'mesh_thigh';
      thighMesh.position.set(0, -0.2, 0);
      upLegBone.add(thighMesh);

      // Knee joint
      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), matJoint);
      legBone.add(kneeJoint);

      // Shin
      const shinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.36, 0.15), matLimbs);
      shinMesh.name = 'mesh_shin';
      shinMesh.position.set(0, -0.2, 0);
      legBone.add(shinMesh);

      // Foot Box
      const footMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.26), matTorso);
      footMesh.name = 'mesh_foot';
      footMesh.position.set(0, -0.02, 0.05);
      footBone.add(footMesh);
    }

    return { root, animations: this.generateFallbackClips() };
  }

  /**
   * Generate fallback animation clips for Idle, Walk, and Wave
   */
  private generateFallbackClips(): THREE.AnimationClip[] {
    const clips: THREE.AnimationClip[] = [];

    // 1. Idle Clip
    const idleTimes = [0, 1.2, 2.4];
    const spineQuatTracks: THREE.KeyframeTrack[] = [];
    const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0, 0));
    spineQuatTracks.push(
      new THREE.QuaternionKeyframeTrack('Spine.quaternion', idleTimes, [
        q0.x, q0.y, q0.z, q0.w,
        q1.x, q1.y, q1.z, q1.w,
        q0.x, q0.y, q0.z, q0.w,
      ])
    );
    clips.push(new THREE.AnimationClip('Idle Breathing', 2.4, spineQuatTracks));

    // 2. Wave Clip
    const waveTimes = [0, 0.5, 1.0, 1.5, 2.0];
    const armTracks: THREE.KeyframeTrack[] = [];
    const rArm0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
    const rArm1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0, 2.2));
    const rFore0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.5));
    const rFore1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 1.2));
    armTracks.push(
      new THREE.QuaternionKeyframeTrack('RightArm.quaternion', waveTimes, [
        rArm0.x, rArm0.y, rArm0.z, rArm0.w,
        rArm1.x, rArm1.y, rArm1.z, rArm1.w,
        rArm1.x, rArm1.y, rArm1.z, rArm1.w,
        rArm1.x, rArm1.y, rArm1.z, rArm1.w,
        rArm0.x, rArm0.y, rArm0.z, rArm0.w,
      ]),
      new THREE.QuaternionKeyframeTrack('RightForeArm.quaternion', waveTimes, [
        rFore0.x, rFore0.y, rFore0.z, rFore0.w,
        rFore1.x, rFore1.y, rFore1.z, rFore1.w,
        rFore0.x, rFore0.y, rFore0.z, rFore0.w,
        rFore1.x, rFore1.y, rFore1.z, rFore1.w,
        rFore0.x, rFore0.y, rFore0.z, rFore0.w,
      ])
    );
    clips.push(new THREE.AnimationClip('Friendly Wave', 2.0, armTracks));

    return clips;
  }

  /**
   * Apply materials, patterns, finish, and proportions to character
   */
  public applyCustomization(cust: CharacterCustomization) {
    this.currentCustomization = cust;
    if (!this.modelRoot) return;

    const patternTex = getProceduralPatternTexture(cust.pattern, cust.colors.accent);

    // Apply finishes & colors to meshes
    this.meshes.forEach((mesh) => {
      const name = mesh.name.toLowerCase();
      let partColor = cust.colors.primary;

      if (name.includes('head') || name.includes('face')) {
        partColor = cust.colors.head;
      } else if (name.includes('visor') || name.includes('eye')) {
        partColor = cust.colors.visor;
      } else if (name.includes('joint') || name.includes('hand') || name.includes('elbow') || name.includes('knee')) {
        partColor = cust.colors.joints;
      } else if (name.includes('arm') || name.includes('leg') || name.includes('thigh') || name.includes('shin') || name.includes('hips')) {
        partColor = cust.colors.secondary;
      }

      // Material finish config
      let roughness = cust.roughness;
      let metalness = cust.metalness;
      let emissive = new THREE.Color(0x000000);
      let emissiveIntensity = 0;
      let wireframe = cust.wireframe || cust.finish === 'wireframe';

      switch (cust.finish) {
        case 'clay':
          roughness = 0.6;
          metalness = 0.05;
          break;
        case 'glossy':
          roughness = 0.08;
          metalness = 0.15;
          break;
        case 'metallic':
          roughness = 0.15;
          metalness = 0.9;
          break;
        case 'cyber':
          roughness = 0.2;
          metalness = 0.7;
          if (name.includes('visor') || name.includes('accent')) {
            emissive = new THREE.Color(cust.colors.visor);
            emissiveIntensity = 0.9;
          }
          break;
        case 'toon':
          roughness = 0.5;
          metalness = 0.0;
          break;
        case 'neon':
          roughness = 0.2;
          metalness = 0.2;
          emissive = new THREE.Color(partColor);
          emissiveIntensity = 0.45;
          break;
        case 'wireframe':
          wireframe = true;
          break;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(partColor),
        roughness,
        metalness,
        wireframe,
        map: name.includes('torso') || name.includes('head') ? patternTex : null,
        emissive,
        emissiveIntensity,
      });

      mesh.material = mat;
    });

    // Proportions scaling
    const headBone = this.getBone('Head');
    if (headBone) {
      const hs = cust.proportions.headScale;
      headBone.scale.set(hs, hs, hs);
    }

    const chestBone = this.getBone('Chest');
    if (chestBone) {
      const tw = cust.proportions.torsoWidth;
      chestBone.scale.set(tw, 1.0, (tw + 1) / 2);
    }

    for (const legKey of ['LeftUpLeg', 'RightUpLeg']) {
      const legBone = this.getBone(legKey);
      if (legBone) {
        const ll = cust.proportions.legLength;
        const lt = cust.proportions.limbThickness;
        legBone.scale.set(lt, ll, lt);
      }
    }

    for (const armKey of ['LeftArm', 'RightArm']) {
      const armBone = this.getBone(armKey);
      if (armBone) {
        const lt = cust.proportions.limbThickness;
        armBone.scale.set(lt, lt, lt);
      }
    }

    if (this.modelRoot) {
      const s = cust.proportions.overallScale;
      this.modelRoot.scale.set(s, s, s);
    }

    // Attach Accessories
    this.updateAccessories(cust.accessories);
  }

  /**
   * Mount accessories onto bones
   */
  private updateAccessories(acc: CharacterCustomization['accessories']) {
    // 1. Head accessory
    const headBone = this.getBone('Head');
    if (headBone) {
      if (this.headAccessoryObj) {
        headBone.remove(this.headAccessoryObj);
        this.headAccessoryObj = null;
      }
      const newHead = createHeadAccessory(acc.head, acc.headColor);
      if (newHead) {
        this.headAccessoryObj = newHead;
        headBone.add(newHead);
      }
    }

    // 2. Back accessory
    const chestBone = this.getBone('Chest') || this.getBone('Spine');
    if (chestBone) {
      if (this.backAccessoryObj) {
        chestBone.remove(this.backAccessoryObj);
        this.backAccessoryObj = null;
      }
      const newBack = createBackAccessory(acc.back, acc.backColor);
      if (newBack) {
        this.backAccessoryObj = newBack;
        chestBone.add(newBack);
      }
    }

    // 3. Left hand accessory
    const leftHandBone = this.getBone('LeftHand');
    if (leftHandBone) {
      if (this.leftHandAccessoryObj) {
        leftHandBone.remove(this.leftHandAccessoryObj);
        this.leftHandAccessoryObj = null;
      }
      const newLeft = createHandAccessory(acc.leftHand, acc.leftHandColor, true);
      if (newLeft) {
        this.leftHandAccessoryObj = newLeft;
        leftHandBone.add(newLeft);
      }
    }

    // 4. Right hand accessory
    const rightHandBone = this.getBone('RightHand');
    if (rightHandBone) {
      if (this.rightHandAccessoryObj) {
        rightHandBone.remove(this.rightHandAccessoryObj);
        this.rightHandAccessoryObj = null;
      }
      const newRight = createHandAccessory(acc.rightHand, acc.rightHandColor, false);
      if (newRight) {
        this.rightHandAccessoryObj = newRight;
        rightHandBone.add(newRight);
      }
    }
  }

  public getBone(name: string): THREE.Bone | null {
    return this.bonesMap.get(name) || null;
  }

  /**
   * Apply entire PoseData (angles in degrees)
   */
  public applyPose(pose: PoseData) {
    this.currentPose = { ...pose };
    // Stop clip animation if posing manually
    if (this.activeAction && this.activeAction.isRunning()) {
      this.activeAction.stop();
      this.currentClipName = null;
    }

    for (const [boneName, rotDeg] of Object.entries(pose)) {
      this.setBoneEuler(boneName, rotDeg);
    }

    if (this.skeletonHelper) {
      (this.skeletonHelper as any).update?.();
    }
  }

  /**
   * Set Euler rotation on specific bone (degrees)
   */
  public setBoneEuler(boneName: string, deg: BoneEulerRotation) {
    const bone = this.getBone(boneName);
    if (!bone) return;

    this.currentPose[boneName] = { ...deg };

    const radX = THREE.MathUtils.degToRad(deg.x);
    const radY = THREE.MathUtils.degToRad(deg.y);
    const radZ = THREE.MathUtils.degToRad(deg.z);

    const baseQuat = this.originalQuaternions.get(bone.name) || new THREE.Quaternion();
    const rotQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(radX, radY, radZ, 'XYZ'));

    bone.quaternion.copy(baseQuat).multiply(rotQuat);

    if (this.skeletonHelper) {
      (this.skeletonHelper as any).update?.();
    }
  }

  /**
   * Get current rotation of bone in degrees
   */
  public getBoneEuler(boneName: string): BoneEulerRotation {
    return this.currentPose[boneName] || { x: 0, y: 0, z: 0 };
  }

  /**
   * Mirror pose from left-to-right or right-to-left
   */
  public mirrorPose(fromSide: 'left' | 'right') {
    const sourcePrefix = fromSide === 'left' ? 'Left' : 'Right';
    const targetPrefix = fromSide === 'left' ? 'Right' : 'Left';

    const newPose = { ...this.currentPose };

    for (const b of HUMANOID_BONES) {
      if (b.name.startsWith(sourcePrefix)) {
        const counterpart = targetPrefix + b.name.slice(sourcePrefix.length);
        const srcRot = this.currentPose[b.name] || { x: 0, y: 0, z: 0 };
        // Symmetrical mirroring: invert Y and Z rotations
        newPose[counterpart] = {
          x: srcRot.x,
          y: -srcRot.y,
          z: -srcRot.z,
        };
      }
    }

    this.applyPose(newPose);
  }

  /**
   * Reset all bones to bind pose
   */
  public resetPose() {
    this.bonesMap.forEach((bone) => {
      const origQuat = this.originalQuaternions.get(bone.name);
      if (origQuat) bone.quaternion.copy(origQuat);
      else bone.quaternion.identity();
    });
    this.currentPose = {};
    if (this.skeletonHelper) (this.skeletonHelper as any).update?.();
  }

  // --- Animation Playback ---

  public playClip(name: string, crossfade = 0.25) {
    if (!this.mixer) return;
    const clip = THREE.AnimationClip.findByName(this.gltfAnimations, name);
    if (!clip) return;

    this.isPlayingCustomAnim = false;
    const prevAction = this.activeAction;
    const nextAction = this.mixer.clipAction(clip);
    nextAction.timeScale = this.animSpeed;

    if (prevAction && prevAction.isRunning() && prevAction !== nextAction) {
      nextAction.reset().play();
      prevAction.crossFadeTo(nextAction, crossfade, true);
    } else {
      nextAction.reset().fadeIn(crossfade).play();
    }

    this.activeAction = nextAction;
    this.currentClipName = name;
  }

  /**
   * Capture bone rotations at the current frame of whatever is currently playing
   * allowing any pose in an animation to be ported directly to the Pose Editor!
   */
  public captureCurrentAnimatedPose(): PoseData {
    const pose: PoseData = {};
    for (const b of HUMANOID_BONES) {
      const bone = this.getBone(b.name);
      if (!bone) continue;
      const baseQuat = this.originalQuaternions.get(bone.name) || new THREE.Quaternion();
      // Relative rotation: rot = base^-1 * current
      const invBase = baseQuat.clone().invert();
      const relQuat = invBase.multiply(bone.quaternion.clone());
      const euler = new THREE.Euler().setFromQuaternion(relQuat, 'XYZ');

      pose[b.name] = {
        x: Math.round(THREE.MathUtils.radToDeg(euler.x)),
        y: Math.round(THREE.MathUtils.radToDeg(euler.y)),
        z: Math.round(THREE.MathUtils.radToDeg(euler.z)),
      };
    }
    return pose;
  }

  public stopClip() {
    if (this.activeAction) {
      this.activeAction.stop();
      this.currentClipName = null;
    }
  }

  public setAnimationSpeed(speed: number) {
    this.animSpeed = speed;
    if (this.activeAction) {
      this.activeAction.timeScale = speed;
    }
  }

  public setAnimationTime(time: number) {
    if (this.activeAction) {
      this.activeAction.time = time;
    }
    if (this.isPlayingCustomAnim && this.customAnimation) {
      this.customAnimTime = time;
      this.evaluateCustomAnimation(time);
    }
  }

  // --- Custom Keyframe Timeline Sequencer ---

  public setCustomAnimation(anim: CustomAnimation) {
    this.customAnimation = anim;
    this.customAnimTime = 0;
  }

  public playCustomAnimation() {
    if (this.activeAction) {
      this.activeAction.stop();
      this.currentClipName = null;
    }
    this.isPlayingCustomAnim = true;
  }

  public pauseCustomAnimation() {
    this.isPlayingCustomAnim = false;
  }

  public scrubCustomAnimation(time: number) {
    this.customAnimTime = time;
    this.evaluateCustomAnimation(time);
  }

  /**
   * Spherical Linear Interpolation (SLERP) across keyframes
   */
  private evaluateCustomAnimation(time: number) {
    if (!this.customAnimation || this.customAnimation.keyframes.length === 0) return;
    const kfs = [...this.customAnimation.keyframes].sort((a, b) => a.time - b.time);
    const duration = this.customAnimation.duration || 4.0;
    const t = Math.max(0, Math.min(time, duration));

    // Find bounding keyframes
    let prevKf = kfs[0];
    let nextKf = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length - 1; i++) {
      if (t >= kfs[i].time && t <= kfs[i + 1].time) {
        prevKf = kfs[i];
        nextKf = kfs[i + 1];
        break;
      }
    }

    const span = nextKf.time - prevKf.time;
    const progress = span > 0.0001 ? (t - prevKf.time) / span : 0;
    // Smooth cosine ease
    const smoothFactor = 0.5 - 0.5 * Math.cos(progress * Math.PI);

    // Interpolate all bones
    for (const b of HUMANOID_BONES) {
      const rA = prevKf.pose[b.name] || { x: 0, y: 0, z: 0 };
      const rB = nextKf.pose[b.name] || { x: 0, y: 0, z: 0 };

      const interDeg: BoneEulerRotation = {
        x: rA.x + (rB.x - rA.x) * smoothFactor,
        y: rA.y + (rB.y - rA.y) * smoothFactor,
        z: rA.z + (rB.z - rA.z) * smoothFactor,
      };

      this.setBoneEuler(b.name, interDeg);
    }
  }

  // --- Studio Environment & Controls ---

  public updateStudioSettings(settings: StudioSettings) {
    const bgColors: Record<StudioSettings['backgroundTheme'], string> = {
      dark: '#0b0f17',
      slate: '#1e293b',
      cyber: '#050b14',
      studio: '#27272a',
      light: '#f1f5f9',
    };
    const c = bgColors[settings.backgroundTheme];
    this.scene.background = new THREE.Color(c);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.set(c);
    }

    if (this.keyLight) {
      this.keyLight.intensity = 2.2 * settings.lightingIntensity;
    }
    if (this.hemiLight) {
      this.hemiLight.intensity = 1.1 * settings.lightingIntensity;
    }
    if (this.rimLight) {
      this.rimLight.intensity = 1.8 * settings.lightingIntensity;
    }

    if (this.floorGrid) {
      this.floorGrid.visible = settings.showFloorGrid;
    }
    if (this.contactShadow) {
      this.contactShadow.visible = settings.showShadows;
    }
    if (this.skeletonHelper) {
      this.skeletonHelper.visible = settings.showSkeleton;
    }

    if (this.controls) {
      this.controls.autoRotate = settings.autoRotate;
      this.controls.autoRotateSpeed = settings.autoRotateSpeed;
    }
  }

  public setCameraView(preset: 'front' | 'perspective' | 'side' | 'portrait' | 'back') {
    if (!this.controls) return;
    const dur = 0.8;
    const targetY = preset === 'portrait' ? 1.45 : 0.9;
    this.controls.target.set(0, targetY, 0);

    switch (preset) {
      case 'front':
        this.camera.position.set(0, 1.1, 3.2);
        break;
      case 'perspective':
        this.camera.position.set(2.2, 1.4, 2.6);
        break;
      case 'side':
        this.camera.position.set(3.2, 1.1, 0);
        break;
      case 'back':
        this.camera.position.set(0, 1.1, -3.2);
        break;
      case 'portrait':
        this.camera.position.set(0, 1.45, 1.5);
        break;
    }
    this.camera.lookAt(0, targetY, 0);
    this.controls.update();
  }

  // --- Exporting ---

  public captureSnapshot(transparent = false): string {
    if (!this.renderer) return '';

    const prevBg = this.scene.background;
    if (transparent) {
      this.scene.background = null;
      if (this.floorGrid) this.floorGrid.visible = false;
    }

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    if (transparent) {
      this.scene.background = prevBg;
      if (this.floorGrid) this.floorGrid.visible = true;
    }

    return dataUrl;
  }

  public exportGLTF(filename = 'BoxMan_Custom.glb') {
    if (!this.characterGroup) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      this.characterGroup,
      (result) => {
        const output = result instanceof ArrayBuffer ? result : JSON.stringify(result, null, 2);
        const blob = new Blob([output], {
          type: result instanceof ArrayBuffer ? 'model/gltf-binary' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      (err) => {
        console.error('GLTF Export Error:', err);
      },
      { binary: true }
    );
  }

  // --- Main Loop ---

  private tick = () => {
    this.animationFrameId = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Update mixer for GLB clips
    if (this.mixer && this.activeAction && this.activeAction.isRunning()) {
      this.mixer.update(dt);
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.activeAction.time, this.activeAction.getClip().duration);
      }
    }

    // Update custom keyframe sequencer
    if (this.isPlayingCustomAnim && this.customAnimation) {
      this.customAnimTime += dt * this.animSpeed;
      if (this.customAnimTime > this.customAnimation.duration) {
        this.customAnimTime = 0; // loop
      }
      this.evaluateCustomAnimation(this.customAnimTime);
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.customAnimTime, this.customAnimation.duration);
      }
    }

    // Damping controls update
    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.handleResize);
    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
