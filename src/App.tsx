/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterStudio } from './three/CharacterStudio';
import {
  CharacterCustomization,
  PoseData,
  BoneEulerRotation,
  StudioSettings,
  CustomAnimation,
  PresetCharacter,
} from './types/character';
import {
  DEFAULT_CUSTOMIZATION,
  PRESET_POSES,
  PRESET_CHARACTERS,
  DEFAULT_KEYFRAMES,
} from './constants/presets';
import { TopNav } from './components/TopNav';
import { BottomDock } from './components/BottomDock';
import { SnapshotModal } from './components/SnapshotModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<CharacterStudio | null>(null);

  // Character Customization State
  const [customization, setCustomization] = useState<CharacterCustomization>(DEFAULT_CUSTOMIZATION);
  const [activePresetId, setActivePresetId] = useState<string>('cyberpunk');

  // Pose State
  const [currentPose, setCurrentPose] = useState<PoseData>(PRESET_POSES[1].pose); // Default to Hero Stance
  const [selectedBone, setSelectedBone] = useState<string>('RightArm');

  // Animation State
  const [clipNames, setClipNames] = useState<string[]>([]);
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(4.0);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);

  // Custom Keyframe Sequencer State
  const [customAnimation, setCustomAnimation] = useState<CustomAnimation>(DEFAULT_KEYFRAMES);
  const [isPlayingCustom, setIsPlayingCustom] = useState<boolean>(false);

  // Studio Settings State
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    backgroundTheme: 'dark',
    lightingIntensity: 1.0,
    showFloorGrid: true,
    showShadows: true,
    showSkeleton: false,
    autoRotate: false,
    autoRotateSpeed: 1.5,
    cameraFov: 40,
  });

  // UI Modals
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Three.js Studio
  useEffect(() => {
    if (!mountRef.current) return;

    const studio = new CharacterStudio();
    studioRef.current = studio;

    studio.onLoaded = ({ clipNames: clips }) => {
      setClipNames(clips);
      setIsLoaded(true);

      // Apply initial customization & pose once loaded
      studio.applyCustomization(DEFAULT_CUSTOMIZATION);
      studio.applyPose(PRESET_POSES[1].pose);
      studio.setCustomAnimation(DEFAULT_KEYFRAMES);
    };

    studio.onTimeUpdate = (time, totalDur) => {
      setCurrentTime(time);
      setDuration(totalDur);
    };

    studio.init(mountRef.current);

    return () => {
      studio.dispose();
      studioRef.current = null;
    };
  }, []);

  // Update customization
  const handleUpdateCustomization = useCallback((updated: CharacterCustomization) => {
    setCustomization(updated);
    if (studioRef.current) {
      studioRef.current.applyCustomization(updated);
    }
  }, []);

  // Preset character archetype selection
  const handleSelectPresetCharacter = useCallback((preset: PresetCharacter) => {
    setActivePresetId(preset.id);
    handleUpdateCustomization(preset.customization);
    if (preset.defaultPoseId) {
      const foundPose = PRESET_POSES.find((p) => p.id === preset.defaultPoseId);
      if (foundPose) {
        handleApplyPose(foundPose.pose);
      }
    }
  }, [handleUpdateCustomization]);

  // Apply full pose
  const handleApplyPose = useCallback((pose: PoseData) => {
    setCurrentPose(pose);
    if (studioRef.current) {
      studioRef.current.applyPose(pose);
    }
  }, []);

  // Single bone rotation adjustment
  const handleBoneChange = useCallback((boneName: string, rot: BoneEulerRotation) => {
    setCurrentPose((prev) => ({
      ...prev,
      [boneName]: rot,
    }));
    if (studioRef.current) {
      studioRef.current.setBoneEuler(boneName, rot);
    }
  }, []);

  // Mirror pose
  const handleMirror = useCallback((fromSide: 'left' | 'right') => {
    if (studioRef.current) {
      studioRef.current.mirrorPose(fromSide);
      // Synchronize React pose state with mirrored values
      const syncedPose: PoseData = {};
      PRESET_POSES[0].pose; // touch keys
      for (const [k] of Object.entries(currentPose)) {
        syncedPose[k] = studioRef.current.getBoneEuler(k);
      }
      setCurrentPose(syncedPose);
    }
  }, [currentPose]);

  // Reset pose to T-pose
  const handleResetPose = useCallback(() => {
    const tPose = PRESET_POSES[0].pose;
    handleApplyPose(tPose);
  }, [handleApplyPose]);

  // GLB Clip Playback
  const handlePlayClip = useCallback((clipName: string) => {
    setActiveClip(clipName);
    setIsPlayingCustom(false);
    if (studioRef.current) {
      studioRef.current.playClip(clipName);
    }
  }, []);

  const handleStopClip = useCallback(() => {
    setActiveClip(null);
    if (studioRef.current) {
      studioRef.current.stopClip();
    }
  }, []);

  const handleScrub = useCallback((time: number) => {
    setCurrentTime(time);
    if (studioRef.current) {
      studioRef.current.setAnimationTime(time);
    }
  }, []);

  const handleSetSpeed = useCallback((speed: number) => {
    setAnimSpeed(speed);
    if (studioRef.current) {
      studioRef.current.setAnimationSpeed(speed);
    }
  }, []);

  // Custom keyframe sequencer
  const handleUpdateCustomAnimation = useCallback((anim: CustomAnimation) => {
    setCustomAnimation(anim);
    if (studioRef.current) {
      studioRef.current.setCustomAnimation(anim);
    }
  }, []);

  const handlePlayCustom = useCallback(() => {
    setIsPlayingCustom(true);
    setActiveClip(null);
    if (studioRef.current) {
      studioRef.current.playCustomAnimation();
    }
  }, []);

  const handlePauseCustom = useCallback(() => {
    setIsPlayingCustom(false);
    if (studioRef.current) {
      studioRef.current.pauseCustomAnimation();
    }
  }, []);

  const handleCaptureFramePose = useCallback(() => {
    if (studioRef.current) {
      const captured = studioRef.current.captureCurrentAnimatedPose();
      setCurrentPose(captured);
      // Pause any active animation and apply this exact captured pose
      studioRef.current.stopClip();
      studioRef.current.pauseCustomAnimation();
      setActiveClip(null);
      setIsPlayingCustom(false);
      studioRef.current.applyPose(captured);
    }
  }, []);

  // Studio Settings update
  const handleUpdateStudioSettings = useCallback((updated: Partial<StudioSettings>) => {
    setStudioSettings((prev) => {
      const next = { ...prev, ...updated };
      if (studioRef.current) {
        studioRef.current.updateStudioSettings(next);
      }
      return next;
    });
  }, []);

  // Camera presets
  const handleSetCameraView = useCallback((preset: 'front' | 'perspective' | 'side' | 'portrait' | 'back') => {
    if (studioRef.current) {
      studioRef.current.setCameraView(preset);
    }
  }, []);

  // Export GLTF
  const handleExportGLTF = useCallback(() => {
    if (studioRef.current) {
      studioRef.current.exportGLTF(`BoxMan_${customization.finish}.glb`);
    }
  }, [customization.finish]);

  // Capture snapshot callback
  const handleCaptureSnapshot = useCallback((transparent: boolean) => {
    if (studioRef.current) {
      return studioRef.current.captureSnapshot(transparent);
    }
    return '';
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in inputs
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlayingCustom) {
          handlePauseCustom();
        } else if (activeClip) {
          handleStopClip();
        } else {
          handlePlayCustom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingCustom, activeClip, handlePauseCustom, handleStopClip, handlePlayCustom]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      {/* Three.js Isolated Canvas Mount (useRef container as required by Three.js skill) */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Navigation Header */}
      <TopNav
        onSelectPresetCharacter={handleSelectPresetCharacter}
        onSetCameraView={handleSetCameraView}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        onExportGLTF={handleExportGLTF}
        onResetPose={handleResetPose}
        onToggleHelp={() => setIsHelpOpen(true)}
        studioSettings={studioSettings}
        onUpdateStudioSettings={handleUpdateStudioSettings}
        activePresetId={activePresetId}
        isLoaded={isLoaded}
      />

      {/* Collapsible Bottom Control Dock (Consolidated controls, zero left/right occlusion) */}
      <BottomDock
        customization={customization}
        onUpdateCustomization={handleUpdateCustomization}
        currentPose={currentPose}
        onApplyPose={handleApplyPose}
        onBoneChange={handleBoneChange}
        onMirror={handleMirror}
        onResetPose={handleResetPose}
        selectedBone={selectedBone}
        onSelectBone={setSelectedBone}
        clipNames={clipNames}
        activeClip={activeClip}
        onPlayClip={handlePlayClip}
        onStopClip={handleStopClip}
        currentTime={currentTime}
        duration={duration}
        onScrub={handleScrub}
        animSpeed={animSpeed}
        onSetSpeed={handleSetSpeed}
        customAnimation={customAnimation}
        onUpdateCustomAnimation={handleUpdateCustomAnimation}
        isPlayingCustom={isPlayingCustom}
        onPlayCustom={handlePlayCustom}
        onPauseCustom={handlePauseCustom}
        onCaptureFramePose={handleCaptureFramePose}
        studioSettings={studioSettings}
        onUpdateStudioSettings={handleUpdateStudioSettings}
      />

      {/* Snapshot Modal */}
      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        onCapture={handleCaptureSnapshot}
      />

      {/* Help & Shortcuts Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
