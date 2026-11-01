import React, { useState } from 'react';
import {
  PoseData,
  BoneEulerRotation,
  BoneInfo,
} from '../../types/character';
import { HUMANOID_BONES, PRESET_POSES } from '../../constants/presets';
import {
  RotateCcw,
  Sliders,
  Copy,
  Check,
  Split,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

interface PoseTabProps {
  currentPose: PoseData;
  onApplyPose: (pose: PoseData) => void;
  onBoneChange: (boneName: string, rot: BoneEulerRotation) => void;
  onMirror: (fromSide: 'left' | 'right') => void;
  onResetPose: () => void;
  selectedBone: string;
  onSelectBone: (boneName: string) => void;
}

export const PoseTab: React.FC<PoseTabProps> = ({
  currentPose,
  onApplyPose,
  onBoneChange,
  onMirror,
  onResetPose,
  selectedBone,
  onSelectBone,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const boneGroups = [
    { id: 'all', label: 'All Bones' },
    { id: 'head', label: 'Head & Neck' },
    { id: 'torso', label: 'Spine & Hips' },
    { id: 'left_arm', label: 'Left Arm' },
    { id: 'right_arm', label: 'Right Arm' },
    { id: 'left_leg', label: 'Left Leg' },
    { id: 'right_leg', label: 'Right Leg' },
  ];

  const filteredBones = HUMANOID_BONES.filter(
    (b) => activeGroup === 'all' || b.group === activeGroup
  );

  const activeBoneRot = currentPose[selectedBone] || { x: 0, y: 0, z: 0 };

  const handleAxisChange = (axis: 'x' | 'y' | 'z', val: number) => {
    onBoneChange(selectedBone, {
      ...activeBoneRot,
      [axis]: Math.round(val),
    });
  };

  const handleStep = (axis: 'x' | 'y' | 'z', delta: number) => {
    let nextVal = activeBoneRot[axis] + delta;
    if (nextVal > 180) nextVal -= 360;
    if (nextVal < -180) nextVal += 360;
    handleAxisChange(axis, nextVal);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPose, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentBoneInfo = HUMANOID_BONES.find((b) => b.name === selectedBone) || {
    name: selectedBone,
    displayName: selectedBone,
    group: 'other',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-1 text-slate-200">
      {/* Left Column: Preset Poses (3 cols) */}
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" /> Pose Presets
          </div>
          <button
            onClick={onResetPose}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            title="Reset All Bones to T-Pose"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {PRESET_POSES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPose(preset.pose)}
              className="px-3 py-2 text-xs font-medium bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-left flex items-center gap-2.5 transition-all cursor-pointer group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">{preset.icon}</span>
              <div className="truncate">
                <div className="text-slate-200 font-semibold truncate">{preset.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{preset.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Symmetry & Export Helpers */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Pose Symmetry Tools:</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onMirror('left')}
              className="px-2 py-1.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              title="Mirror Left arm/leg angles to Right"
            >
              <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
              <span>Left ➔ Right</span>
            </button>
            <button
              onClick={() => onMirror('right')}
              className="px-2 py-1.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              title="Mirror Right arm/leg angles to Left"
            >
              <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
              <span>Right ➔ Left</span>
            </button>
          </div>
          <button
            onClick={handleCopyJson}
            className="w-full mt-1 py-1 text-[11px] font-medium bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center gap-1.5 border border-slate-700/80 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Pose JSON Copied!' : 'Copy Pose Data'}</span>
          </button>
        </div>
      </div>

      {/* Middle Column: Humanoid Skeleton Bones List (4 cols) */}
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Split className="w-3.5 h-3.5" /> Select Bone Joint
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredBones.length} joints
          </span>
        </div>

        {/* Bone Group Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
          {boneGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                activeGroup === g.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Bone Buttons List */}
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {filteredBones.map((b) => {
            const rot = currentPose[b.name] || { x: 0, y: 0, z: 0 };
            const isPosed = rot.x !== 0 || rot.y !== 0 || rot.z !== 0;
            const isSelected = selectedBone === b.name;

            return (
              <button
                key={b.name}
                onClick={() => onSelectBone(b.name)}
                className={`w-full px-3 py-1.5 text-xs rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 font-semibold shadow-sm'
                    : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPosed ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span>{b.displayName}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  {isPosed && <span>{rot.x}° / {rot.y}° / {rot.z}°</span>}
                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Bone 3D Rotation Sliders (5 cols) */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700">
          <div>
            <div className="text-[10px] uppercase font-semibold text-cyan-400">Editing Joint:</div>
            <div className="text-sm font-bold text-white">{currentBoneInfo.displayName}</div>
          </div>
          <button
            onClick={() => onBoneChange(selectedBone, { x: 0, y: 0, z: 0 })}
            className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset this bone to 0°"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" /> Reset Bone
          </button>
        </div>

        <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 space-y-4">
          {/* Pitch / X Axis (Red) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Pitch (X Axis / Forward-Back Tilt)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStep('x', -10)}
                  className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono"
                >
                  -10°
                </button>
                <span className="font-mono text-rose-300 font-semibold w-12 text-right">
                  {activeBoneRot.x}°
                </span>
                <button
                  onClick={() => handleStep('x', 10)}
                  className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono"
                >
                  +10°
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={activeBoneRot.x}
              onChange={(e) => handleAxisChange('x', parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Yaw / Y Axis (Green) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Yaw (Y Axis / Twist Left-Right)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStep('y', -10)}
                  className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono"
                >
                  -10°
                </button>
                <span className="font-mono text-emerald-300 font-semibold w-12 text-right">
                  {activeBoneRot.y}°
                </span>
                <button
                  onClick={() => handleStep('y', 10)}
                  className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono"
                >
                  +10°
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={activeBoneRot.y}
              onChange={(e) => handleAxisChange('y', parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Roll / Z Axis (Blue) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                Roll (Z Axis / Lean Side-to-Side)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStep('z', -10)}
                  className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono"
                >
                  -10°
                </button>
                <span className="font-mono text-sky-300 font-semibold w-12 text-right">
                  {activeBoneRot.z}°
                </span>
                <button
                  onClick={() => handleStep('z', 10)}
                  className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono"
                >
                  +10°
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={activeBoneRot.z}
              onChange={(e) => handleAxisChange('z', parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
