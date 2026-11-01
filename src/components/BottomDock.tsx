import React, { useState } from 'react';
import {
  StudioTab as TabType,
  CharacterCustomization,
  CharacterAccessories,
  PoseData,
  BoneEulerRotation,
  StudioSettings,
  CustomAnimation,
} from '../types/character';
import {
  Palette,
  Shield,
  Activity,
  Clapperboard,
  Sun,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StyleTab } from './tabs/StyleTab';
import { AccessoriesTab } from './tabs/AccessoriesTab';
import { PoseTab } from './tabs/PoseTab';
import { AnimationTab } from './tabs/AnimationTab';
import { StudioTab } from './tabs/StudioTab';

interface BottomDockProps {
  customization: CharacterCustomization;
  onUpdateCustomization: (cust: CharacterCustomization) => void;
  currentPose: PoseData;
  onApplyPose: (pose: PoseData) => void;
  onBoneChange: (boneName: string, rot: BoneEulerRotation) => void;
  onMirror: (fromSide: 'left' | 'right') => void;
  onResetPose: () => void;
  selectedBone: string;
  onSelectBone: (boneName: string) => void;

  // Animation props
  clipNames: string[];
  activeClip: string | null;
  onPlayClip: (clipName: string) => void;
  onStopClip: () => void;
  currentTime: number;
  duration: number;
  onScrub: (time: number) => void;
  animSpeed: number;
  onSetSpeed: (speed: number) => void;

  // Custom animation sequencer
  customAnimation: CustomAnimation;
  onUpdateCustomAnimation: (anim: CustomAnimation) => void;
  isPlayingCustom: boolean;
  onPlayCustom: () => void;
  onPauseCustom: () => void;
  onCaptureFramePose?: () => void;

  // Studio
  studioSettings: StudioSettings;
  onUpdateStudioSettings: (settings: Partial<StudioSettings>) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  customization,
  onUpdateCustomization,
  currentPose,
  onApplyPose,
  onBoneChange,
  onMirror,
  onResetPose,
  selectedBone,
  onSelectBone,
  clipNames,
  activeClip,
  onPlayClip,
  onStopClip,
  currentTime,
  duration,
  onScrub,
  animSpeed,
  onSetSpeed,
  customAnimation,
  onUpdateCustomAnimation,
  isPlayingCustom,
  onPlayCustom,
  onPauseCustom,
  onCaptureFramePose,
  studioSettings,
  onUpdateStudioSettings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('style');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'style', label: 'Style & Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'accessories', label: 'Accessories', icon: <Shield className="w-4 h-4" /> },
    { id: 'pose', label: 'Pose & Bones', icon: <Activity className="w-4 h-4" /> },
    { id: 'animation', label: 'Animation', icon: <Clapperboard className="w-4 h-4" />, badge: clipNames.length ? `${clipNames.length}` : undefined },
    { id: 'studio', label: 'Studio & Light', icon: <Sun className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-20 w-[96vw] max-w-[960px] transition-transform duration-300 ease-out ${
        isCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Tab Button pinned to top edge */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-slate-900 border-t border-x border-slate-700 text-slate-300 hover:text-white px-5 py-1.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xl cursor-pointer hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Control Dock (H)' : 'Collapse Control Dock (H)'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-4 h-4 text-cyan-400" />
              <span>Show Controls</span>
              <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">H</kbd>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-cyan-400" />
              <span>Hide Controls</span>
              <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">H</kbd>
            </>
          )}
        </button>
      </div>

      {/* Main Solid Dock Surface (No backdrop-filter to prevent WebGL GPU stalls) */}
      <div className="bg-slate-900 border border-slate-700/90 rounded-t-2xl shadow-2xl overflow-hidden pb-4">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-950/70 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (isCollapsed) setIsCollapsed(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden sm:block pr-2">
            Model: <span className="text-slate-300 font-semibold">BoxMan</span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 max-h-[380px] overflow-y-auto">
          {activeTab === 'style' && (
            <StyleTab customization={customization} onChange={onUpdateCustomization} />
          )}

          {activeTab === 'accessories' && (
            <AccessoriesTab
              accessories={customization.accessories}
              onChange={(acc: CharacterAccessories) =>
                onUpdateCustomization({ ...customization, accessories: acc })
              }
            />
          )}

          {activeTab === 'pose' && (
            <PoseTab
              currentPose={currentPose}
              onApplyPose={onApplyPose}
              onBoneChange={onBoneChange}
              onMirror={onMirror}
              onResetPose={onResetPose}
              selectedBone={selectedBone}
              onSelectBone={onSelectBone}
            />
          )}

          {activeTab === 'animation' && (
            <AnimationTab
              clipNames={clipNames}
              activeClip={activeClip}
              onPlayClip={onPlayClip}
              onStopClip={onStopClip}
              currentTime={currentTime}
              duration={duration}
              onScrub={onScrub}
              animSpeed={animSpeed}
              onSetSpeed={onSetSpeed}
              customAnimation={customAnimation}
              onUpdateCustomAnimation={onUpdateCustomAnimation}
              isPlayingCustom={isPlayingCustom}
              onPlayCustom={onPlayCustom}
              onPauseCustom={onPauseCustom}
              currentPose={currentPose}
              onApplyPose={onApplyPose}
              onCaptureFramePose={onCaptureFramePose}
            />
          )}

          {activeTab === 'studio' && (
            <StudioTab settings={studioSettings} onChange={onUpdateStudioSettings} />
          )}
        </div>
      </div>
    </div>
  );
};
