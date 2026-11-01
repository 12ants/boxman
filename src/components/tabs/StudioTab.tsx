import React from 'react';
import { StudioSettings } from '../../types/character';
import { Sun, RotateCcw, Grid, Bone, Eye, Layers } from 'lucide-react';

interface StudioTabProps {
  settings: StudioSettings;
  onChange: (updated: Partial<StudioSettings>) => void;
}

export const StudioTab: React.FC<StudioTabProps> = ({ settings, onChange }) => {
  const themes: { id: StudioSettings['backgroundTheme']; label: string; color: string; desc: string }[] = [
    { id: 'dark', label: 'Dark Cyber Void', color: '#0b0f17', desc: 'Deep cosmic slate with neon rim lights' },
    { id: 'slate', label: 'Pro Studio Slate', color: '#1e293b', desc: 'Balanced neutral blue-gray studio' },
    { id: 'cyber', label: 'Midnight Blue', color: '#050b14', desc: 'High-contrast sci-fi environment' },
    { id: 'studio', label: 'Neutral Gray', color: '#27272a', desc: 'Clean product showcase backdrop' },
    { id: 'light', label: 'Clean White', color: '#f1f5f9', desc: 'Bright daylight gallery presentation' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 text-slate-200">
      {/* 1. Backdrop Theme */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Layers className="w-3.5 h-3.5" /> Studio Backdrop
        </div>

        <div className="space-y-1.5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ backgroundTheme: t.id })}
              className={`w-full px-3 py-2 text-xs rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                settings.backgroundTheme === t.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div
                className="w-5 h-5 rounded-lg border border-slate-600 flex-shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <div className="truncate">
                <div className="font-semibold text-slate-200">{t.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Studio Lighting */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Sun className="w-3.5 h-3.5" /> 3-Point Lighting Rig
        </div>

        <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Overall Light Intensity</span>
              <span className="font-mono text-cyan-400 font-semibold">{settings.lightingIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={settings.lightingIntensity}
              onChange={(e) => onChange({ lightingIntensity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Soft Contact Shadow</span>
              <input
                type="checkbox"
                checked={settings.showShadows}
                onChange={(e) => onChange({ showShadows: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Floor Reference Grid</span>
              <input
                type="checkbox"
                checked={settings.showFloorGrid}
                onChange={(e) => onChange({ showFloorGrid: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Skeletal Rig Bones Visualizer</span>
              <input
                type="checkbox"
                checked={settings.showSkeleton}
                onChange={(e) => onChange({ showSkeleton: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Turntable & Camera Motion */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <RotateCcw className="w-3.5 h-3.5" /> Turntable & Motion
        </div>

        <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Turntable Auto-Rotate</div>
              <div className="text-[10px] text-slate-400">Smooth 360° showcase spin</div>
            </div>
            <button
              onClick={() => onChange({ autoRotate: !settings.autoRotate })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                settings.autoRotate
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {settings.autoRotate ? 'Active' : 'Off'}
            </button>
          </div>

          {settings.autoRotate && (
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Rotation Speed</span>
                <span className="font-mono text-cyan-400 font-semibold">{settings.autoRotateSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={settings.autoRotateSpeed}
                onChange={(e) => onChange({ autoRotateSpeed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">OrbitControls Navigation:</div>
            <div>• <strong className="text-slate-200">Left Click + Drag:</strong> Rotate Orbit</div>
            <div>• <strong className="text-slate-200">Right Click + Drag:</strong> Pan Viewport</div>
            <div>• <strong className="text-slate-200">Scroll Wheel:</strong> Zoom In / Out</div>
          </div>
        </div>
      </div>
    </div>
  );
};
