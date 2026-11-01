import React from 'react';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Download,
  Image,
  Eye,
  Grid,
  Bone,
  HelpCircle,
  Play,
  Pause,
} from 'lucide-react';
import { PRESET_CHARACTERS } from '../constants/presets';
import { PresetCharacter, StudioSettings } from '../types/character';

interface TopNavProps {
  onSelectPresetCharacter: (preset: PresetCharacter) => void;
  onSetCameraView: (preset: 'front' | 'perspective' | 'side' | 'portrait' | 'back') => void;
  onOpenSnapshot: () => void;
  onExportGLTF: () => void;
  onResetPose: () => void;
  onToggleHelp: () => void;
  studioSettings: StudioSettings;
  onUpdateStudioSettings: (settings: Partial<StudioSettings>) => void;
  activePresetId?: string;
  isLoaded: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSelectPresetCharacter,
  onSetCameraView,
  onOpenSnapshot,
  onExportGLTF,
  onResetPose,
  onToggleHelp,
  studioSettings,
  onUpdateStudioSettings,
  activePresetId,
  isLoaded,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Brand & Status lockup */}
      <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-sm tracking-wider">
            BM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-white text-sm tracking-wide">BOXMAN STUDIO</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                3D GLB
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Character Customizer & Pose Animator</p>
          </div>
        </div>

        {/* Character archetype quick picker */}
        <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block" />
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
          <select
            value={activePresetId || ''}
            onChange={(e) => {
              const found = PRESET_CHARACTERS.find((p) => p.id === e.target.value);
              if (found) onSelectPresetCharacter(found);
            }}
            className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {PRESET_CHARACTERS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Camera Angle Pills */}
      <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl backdrop-blur-none">
        <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-cyan-400" /> View
        </span>
        <button
          onClick={() => onSetCameraView('perspective')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="3/4 Perspective View"
        >
          3/4
        </button>
        <button
          onClick={() => onSetCameraView('front')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Front View"
        >
          Front
        </button>
        <button
          onClick={() => onSetCameraView('side')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Profile Side View"
        >
          Side
        </button>
        <button
          onClick={() => onSetCameraView('portrait')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Close-up Portrait View"
        >
          Portrait
        </button>
        <button
          onClick={() => onSetCameraView('back')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Back View"
        >
          Back
        </button>
      </div>

      {/* Right: Studio Quick Toggles & Export */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl backdrop-blur-none">
        {/* Floor Grid toggle */}
        <button
          onClick={() => onUpdateStudioSettings({ showFloorGrid: !studioSettings.showFloorGrid })}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            studioSettings.showFloorGrid
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Toggle Floor Grid"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Skeleton Bone visualization toggle */}
        <button
          onClick={() => onUpdateStudioSettings({ showSkeleton: !studioSettings.showSkeleton })}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            studioSettings.showSkeleton
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Toggle Skeleton Rig Lines"
        >
          <Bone className="w-4 h-4" />
        </button>

        {/* Turntable Auto-rotate */}
        <button
          onClick={() => onUpdateStudioSettings({ autoRotate: !studioSettings.autoRotate })}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            studioSettings.autoRotate
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Auto-Rotate Turntable"
        >
          <RotateCcw className={`w-4 h-4 ${studioSettings.autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-0.5" />

        {/* Reset Pose */}
        <button
          onClick={onResetPose}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          title="Reset Bones to T-Pose"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset Pose</span>
        </button>

        {/* Snapshot Photo */}
        <button
          onClick={onOpenSnapshot}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors border border-cyan-800/60 flex items-center gap-1.5 cursor-pointer"
          title="Capture High-Res Screenshot"
        >
          <Image className="w-3.5 h-3.5" />
          <span>Snapshot</span>
        </button>

        {/* Export 3D GLB */}
        <button
          onClick={onExportGLTF}
          className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          title="Export 3D Model as GLB"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 3D</span>
        </button>

        {/* Help */}
        <button
          onClick={onToggleHelp}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Studio Guide & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
