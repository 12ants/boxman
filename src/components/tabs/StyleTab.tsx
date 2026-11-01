import React from 'react';
import {
  CharacterCustomization,
  MaterialFinish,
  PatternType,
} from '../../types/character';
import { Palette, Sparkles, Sliders, Box, Smile, Grid, Shield, Disc, Zap } from 'lucide-react';

interface StyleTabProps {
  customization: CharacterCustomization;
  onChange: (updated: CharacterCustomization) => void;
}

export const StyleTab: React.FC<StyleTabProps> = ({ customization, onChange }) => {
  const updateColors = (key: keyof CharacterCustomization['colors'], val: string) => {
    onChange({
      ...customization,
      colors: {
        ...customization.colors,
        [key]: val,
      },
    });
  };

  const updateProportions = (key: keyof CharacterCustomization['proportions'], val: number) => {
    onChange({
      ...customization,
      proportions: {
        ...customization.proportions,
        [key]: val,
      },
    });
  };

  const finishes: { id: MaterialFinish; label: string; icon: string }[] = [
    { id: 'clay', label: 'Clay / Matte', icon: '🎨' },
    { id: 'glossy', label: 'Plastic Gloss', icon: '✨' },
    { id: 'metallic', label: 'Metallic PBR', icon: '🔩' },
    { id: 'cyber', label: 'Cyber Tech', icon: '⚡' },
    { id: 'toon', label: 'Cel Toon', icon: '💥' },
    { id: 'neon', label: 'Radiant Neon', icon: '🌟' },
    { id: 'wireframe', label: 'Holo Wire', icon: '🕸️' },
  ];

  const patterns: { id: PatternType; label: string; icon: string }[] = [
    { id: 'none', label: 'Clean Solid', icon: '⚪' },
    { id: 'smiley', label: 'Smiley Face', icon: '😊' },
    { id: 'tech_grid', label: 'Cyber Grid', icon: '🌐' },
    { id: 'hexagons', label: 'Hex Matrix', icon: '⬡' },
    { id: 'stripes', label: 'Sport Stripes', icon: '🏁' },
    { id: 'camo', label: 'Pixel Camo', icon: '🟩' },
    { id: 'circuit', label: 'PCB Circuit', icon: '⚡' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 text-slate-200">
      {/* 1. Body Colors */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Palette className="w-3.5 h-3.5" /> Body Palette
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Main Torso */}
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300">Suit / Torso</div>
              <div className="text-[10px] text-slate-400 font-mono">{customization.colors.primary}</div>
            </div>
            <input
              type="color"
              value={customization.colors.primary}
              onChange={(e) => updateColors('primary', e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          {/* Limbs */}
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300">Arms & Legs</div>
              <div className="text-[10px] text-slate-400 font-mono">{customization.colors.secondary}</div>
            </div>
            <input
              type="color"
              value={customization.colors.secondary}
              onChange={(e) => updateColors('secondary', e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          {/* Head */}
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300">Head / Face</div>
              <div className="text-[10px] text-slate-400 font-mono">{customization.colors.head}</div>
            </div>
            <input
              type="color"
              value={customization.colors.head}
              onChange={(e) => updateColors('head', e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          {/* Joint Spheres */}
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300">Joints & Hands</div>
              <div className="text-[10px] text-slate-400 font-mono">{customization.colors.joints}</div>
            </div>
            <input
              type="color"
              value={customization.colors.joints}
              onChange={(e) => updateColors('joints', e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          {/* Accent Trim */}
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300">Accent Trim</div>
              <div className="text-[10px] text-slate-400 font-mono">{customization.colors.accent}</div>
            </div>
            <input
              type="color"
              value={customization.colors.accent}
              onChange={(e) => updateColors('accent', e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          {/* Visor Eyes */}
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300">Visor Glow</div>
              <div className="text-[10px] text-slate-400 font-mono">{customization.colors.visor}</div>
            </div>
            <input
              type="color"
              value={customization.colors.visor}
              onChange={(e) => updateColors('visor', e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>

        {/* Quick color combos */}
        <div className="pt-1">
          <div className="text-[10px] text-slate-400 mb-1.5">Quick Palettes:</div>
          <div className="flex gap-2">
            {[
              { p: '#3b82f6', s: '#0f172a', h: '#ffffff', j: '#64748b', a: '#f59e0b', v: '#38bdf8' },
              { p: '#e11d48', s: '#18181b', h: '#fecdd3', j: '#475569', a: '#fbbf24', v: '#f43f5e' },
              { p: '#10b981', s: '#022c22', h: '#d1fae5', j: '#6b7280', a: '#34d399', v: '#6ee7b7' },
              { p: '#8b5cf6', s: '#1e1b4b', h: '#ede9fe', j: '#94a3b8', a: '#ec4899', v: '#c084fc' },
              { p: '#f59e0b', s: '#292524', h: '#fef3c7', j: '#78716c', a: '#ef4444', v: '#fbbf24' },
            ].map((pal, idx) => (
              <button
                key={idx}
                onClick={() =>
                  onChange({
                    ...customization,
                    colors: { primary: pal.p, secondary: pal.s, head: pal.h, joints: pal.j, accent: pal.a, visor: pal.v },
                  })
                }
                className="flex-1 h-6 rounded-md flex overflow-hidden border border-slate-700 hover:scale-105 transition-transform cursor-pointer"
                title="Apply Color Harmony"
              >
                <div className="flex-1" style={{ backgroundColor: pal.p }} />
                <div className="flex-1" style={{ backgroundColor: pal.s }} />
                <div className="flex-1" style={{ backgroundColor: pal.h }} />
                <div className="flex-1" style={{ backgroundColor: pal.a }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Material Finish & Pattern */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Surface Finish
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {finishes.map((f) => (
              <button
                key={f.id}
                onClick={() => onChange({ ...customization, finish: f.id })}
                className={`px-3 py-2 text-xs font-medium rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  customization.finish === f.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Smile className="w-3.5 h-3.5" /> Pattern & Decal
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => onChange({ ...customization, pattern: p.id })}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  customization.pattern === p.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Proportions & Morphology */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Sliders className="w-3.5 h-3.5" /> Proportions & Scale
        </div>

        <div className="space-y-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
          {/* Head Size */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Head Size</span>
              <span className="font-mono text-cyan-400 text-[11px]">{customization.proportions.headScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.45"
              step="0.05"
              value={customization.proportions.headScale}
              onChange={(e) => updateProportions('headScale', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Torso Width */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Torso Width</span>
              <span className="font-mono text-cyan-400 text-[11px]">{customization.proportions.torsoWidth.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={customization.proportions.torsoWidth}
              onChange={(e) => updateProportions('torsoWidth', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Limbs Thickness */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Limb Thickness</span>
              <span className="font-mono text-cyan-400 text-[11px]">{customization.proportions.limbThickness.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.35"
              step="0.05"
              value={customization.proportions.limbThickness}
              onChange={(e) => updateProportions('limbThickness', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Leg Length */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Leg Length</span>
              <span className="font-mono text-cyan-400 text-[11px]">{customization.proportions.legLength.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.35"
              step="0.05"
              value={customization.proportions.legLength}
              onChange={(e) => updateProportions('legLength', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Reset Proportions */}
          <button
            onClick={() =>
              onChange({
                ...customization,
                proportions: {
                  headScale: 1.0,
                  torsoWidth: 1.0,
                  limbThickness: 1.0,
                  legLength: 1.0,
                  overallScale: 1.0,
                },
              })
            }
            className="w-full mt-1 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Reset Default Proportions
          </button>
        </div>
      </div>
    </div>
  );
};
