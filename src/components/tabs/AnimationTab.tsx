import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Sparkles,
  Clapperboard,
  Film,
  Clock,
  Save,
  Check,
  Search,
  Scissors,
  ArrowRight,
} from 'lucide-react';
import { CustomAnimation, KeyframeData, PoseData } from '../../types/character';
import { DEFAULT_KEYFRAMES, PRESET_POSES } from '../../constants/presets';
import { ANIMATION_CATEGORIES, ANIMATION_METAS } from '../../three/animationLibrary';

interface AnimationTabProps {
  clipNames: string[];
  activeClip: string | null;
  onPlayClip: (clipName: string) => void;
  onStopClip: () => void;
  currentTime: number;
  duration: number;
  onScrub: (time: number) => void;
  animSpeed: number;
  onSetSpeed: (speed: number) => void;

  // Custom keyframe sequencer
  customAnimation: CustomAnimation;
  onUpdateCustomAnimation: (anim: CustomAnimation) => void;
  isPlayingCustom: boolean;
  onPlayCustom: () => void;
  onPauseCustom: () => void;
  currentPose: PoseData;
  onApplyPose: (pose: PoseData) => void;
  onCaptureFramePose?: () => void;
}

export const AnimationTab: React.FC<AnimationTabProps> = ({
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
  currentPose,
  onApplyPose,
  onCaptureFramePose,
}) => {
  const [mode, setMode] = useState<'library' | 'sequencer'>('library');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKfId, setSelectedKfId] = useState<string | null>(customAnimation.keyframes[0]?.id || null);
  const [poseCaptureNotice, setPoseCaptureNotice] = useState<string | null>(null);

  // Filter clips by category and search
  const filteredClips = useMemo(() => {
    return clipNames.filter((name) => {
      const meta = ANIMATION_METAS[name];
      const matchesCategory =
        selectedCategory === 'all' || (meta && meta.category === selectedCategory);
      const matchesSearch =
        searchQuery.trim() === '' ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meta && meta.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [clipNames, selectedCategory, searchQuery]);

  // Capture current pose from playing clip
  const handleCapturePose = () => {
    if (onCaptureFramePose) {
      onCaptureFramePose();
      setPoseCaptureNotice(`Captured pose from "${activeClip || 'Animation'}"! Ready in Pose Editor`);
      setTimeout(() => setPoseCaptureNotice(null), 3000);
    }
  };

  // Add new keyframe at current scrub time
  const handleAddKeyframe = () => {
    const newKf: KeyframeData = {
      id: `kf-${Date.now()}`,
      name: activeClip ? `${activeClip} @ ${currentTime.toFixed(1)}s` : `Pose @ ${currentTime.toFixed(1)}s`,
      time: Math.min(currentTime, customAnimation.duration),
      pose: { ...currentPose },
    };

    const updatedKeyframes = [...customAnimation.keyframes, newKf].sort((a, b) => a.time - b.time);
    onUpdateCustomAnimation({
      ...customAnimation,
      keyframes: updatedKeyframes,
    });
    setSelectedKfId(newKf.id);
  };

  // Update selected keyframe with current pose
  const handleUpdateSelectedKeyframe = () => {
    if (!selectedKfId) return;
    const updated = customAnimation.keyframes.map((kf) =>
      kf.id === selectedKfId ? { ...kf, pose: { ...currentPose }, time: currentTime } : kf
    );
    onUpdateCustomAnimation({
      ...customAnimation,
      keyframes: updated.sort((a, b) => a.time - b.time),
    });
  };

  // Delete keyframe
  const handleDeleteKeyframe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (customAnimation.keyframes.length <= 1) return;
    const updated = customAnimation.keyframes.filter((kf) => kf.id !== id);
    onUpdateCustomAnimation({
      ...customAnimation,
      keyframes: updated,
    });
    if (selectedKfId === id) {
      setSelectedKfId(updated[0]?.id || null);
    }
  };

  // Select keyframe
  const handleSelectKeyframe = (kf: KeyframeData) => {
    setSelectedKfId(kf.id);
    onScrub(kf.time);
    onApplyPose(kf.pose);
  };

  return (
    <div className="space-y-4 p-1 text-slate-200">
      {/* Top Header Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Animation & Pose Engine
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            {clipNames.length} Animations Available
          </span>
        </div>

        {/* Mode Pill Toggle */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => {
              setMode('library');
              onPauseCustom();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'library'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Animation Library ({clipNames.length})</span>
          </button>
          <button
            onClick={() => {
              setMode('sequencer');
              onStopClip();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'sequencer'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Keyframe Sequencer</span>
          </button>
        </div>
      </div>

      {/* Temporary Toast Notice when capturing a pose */}
      {poseCaptureNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {poseCaptureNotice}
          </span>
          <span className="text-[10px] text-emerald-400/80">Switch to 'Pose & Bones' tab anytime</span>
        </div>
      )}

      {/* MODE 1: Animation Library */}
      {mode === 'library' && (
        <div className="space-y-4">
          {/* Active Playback Bar */}
          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {activeClip ? (
                  <button
                    onClick={onStopClip}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow cursor-pointer transition-colors"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onPlayClip(clipNames[0] || 'Brisk Walk')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow cursor-pointer transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Sample</span>
                  </button>
                )}

                <div className="font-mono text-xs bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-2">
                  <span className="text-slate-400">Track:</span>
                  <span className="text-cyan-400 font-bold">{activeClip || 'None Selected'}</span>
                  {activeClip && (
                    <span className="text-slate-500">
                      ({currentTime.toFixed(2)}s / {duration.toFixed(1)}s)
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Capture Pose at this Frame & Speed */}
              <div className="flex items-center gap-2.5">
                {activeClip && onCaptureFramePose && (
                  <button
                    onClick={handleCapturePose}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-cyan-300 border border-cyan-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                    title="Capture the current animated frame and send to the Pose Editor"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Freeze & Tweak Pose</span>
                  </button>
                )}

                {/* Speed Multipliers */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Speed:</span>
                  {[0.25, 0.5, 1.0, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => onSetSpeed(s)}
                      className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        animSpeed === s
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrub Slider */}
            {activeClip && duration > 0 && (
              <input
                type="range"
                min="0"
                max={duration}
                step="0.02"
                value={currentTime}
                onChange={(e) => onScrub(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
            )}
          </div>

          {/* Filter Bar: Categories & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {ANIMATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search animations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Animation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredClips.map((name) => {
              const isPlaying = activeClip === name;
              const meta = ANIMATION_METAS[name] || {
                category: 'all',
                icon: '🎬',
                description: 'Pre-baked skeletal animation clip',
              };

              return (
                <div
                  key={name}
                  onClick={() => onPlayClip(name)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                    isPlaying
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-md ring-1 ring-cyan-400/40'
                      : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700/80 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {meta.icon}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          {name}
                        </div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                          {meta.category}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-1.5 rounded-lg ${
                        isPlaying ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-400 group-hover:text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{meta.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-400">
                      {isPlaying ? '● Playing' : 'Click to Play'}
                    </span>
                    <span className="group-hover:text-slate-200 flex items-center gap-1">
                      Smooth Crossfade ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: Custom Keyframe Sequencer */}
      {mode === 'sequencer' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={isPlayingCustom ? onPauseCustom : onPlayCustom}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isPlayingCustom
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isPlayingCustom ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingCustom ? 'Pause Loop' : 'Play Sequence'}</span>
                </button>

                <div className="font-mono text-xs bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
                  <span className="text-cyan-400 font-bold">{currentTime.toFixed(2)}s</span> / {customAnimation.duration.toFixed(1)}s
                </div>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Speed:</span>
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => onSetSpeed(s)}
                    className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                      animSpeed === s
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scrub Slider with Keyframe Tick Marks */}
            <div className="relative pt-2 pb-1">
              <input
                type="range"
                min="0"
                max={customAnimation.duration}
                step="0.05"
                value={currentTime}
                onChange={(e) => onScrub(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />

              {/* Keyframe tick marks */}
              <div className="relative w-full h-2 mt-1">
                {customAnimation.keyframes.map((kf) => {
                  const pct = (kf.time / customAnimation.duration) * 100;
                  const isSelected = kf.id === selectedKfId;
                  return (
                    <div
                      key={kf.id}
                      onClick={() => handleSelectKeyframe(kf)}
                      className={`absolute top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full cursor-pointer transition-transform hover:scale-150 ${
                        isSelected ? 'bg-amber-400 ring-2 ring-white scale-125 z-10' : 'bg-cyan-400'
                      }`}
                      style={{ left: `${pct}%` }}
                      title={`${kf.name} (${kf.time.toFixed(1)}s)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Keyframe Cards & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Timeline Keyframes ({customAnimation.keyframes.length})
                </span>
                <span className="text-[11px] text-slate-500">Click to preview pose & position</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customAnimation.keyframes.map((kf, idx) => {
                  const isSelected = kf.id === selectedKfId;
                  return (
                    <div
                      key={kf.id}
                      onClick={() => handleSelectKeyframe(kf)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative group ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-md ring-1 ring-cyan-400/40'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-cyan-300 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-amber-400">
                          {kf.time.toFixed(1)}s
                        </span>
                      </div>
                      <div className="text-xs font-semibold truncate text-slate-200">{kf.name}</div>

                      {customAnimation.keyframes.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteKeyframe(kf.id, e)}
                          className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                          title="Delete Keyframe"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300">Keyframe Actions:</div>
              <button
                onClick={handleAddKeyframe}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Keyframe @ {currentTime.toFixed(1)}s</span>
              </button>

              <button
                onClick={handleUpdateSelectedKeyframe}
                disabled={!selectedKfId}
                className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save Pose to Selected Keyframe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
