import React from 'react';
import { X, Keyboard, Compass, Sparkles, Activity } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'H', desc: 'Toggle Bottom Control Dock (Expand / Collapse)' },
    { key: 'Space', desc: 'Play / Pause Animation' },
    { key: 'Left Click + Drag', desc: 'Orbit & Rotate 3D Camera' },
    { key: 'Right Click + Drag', desc: 'Pan Camera Position' },
    { key: 'Mouse Wheel / Pinch', desc: 'Zoom Camera In / Out' },
  ];

  const features = [
    {
      title: '3D Character Customization',
      desc: 'Customize colors for suit, limbs, head, joints, and visor. Choose from finishes (Clay, Metallic, Cyber, Toon, Neon, Wireframe), decals, accessories, and body proportions.',
    },
    {
      title: 'Articulated Bone Posing',
      desc: 'Select humanoid joints (Head, Chest, Arms, Forearms, Hands, Legs, Feet) and rotate along Pitch (X), Yaw (Y), and Roll (Z) with instant symmetry mirroring (Left ➔ Right).',
    },
    {
      title: 'Animation & Keyframe Sequencer',
      desc: 'Scrub embedded GLB animation clips, or build your own custom keyframed animation sequence with smooth slerp interpolation between custom poses!',
    },
    {
      title: 'Exporting & 3D Sharing',
      desc: 'Export high-res PNG snapshots with optional transparent background or export full 3D .GLB models for use in Blender, Unity, Godot, or web games.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>BoxMan Studio Guide & Shortcuts</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Shortcuts */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2.5">
              <Keyboard className="w-3.5 h-3.5" /> Navigation & Shortcuts
            </div>
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-700/60">
              {shortcuts.map((sc) => (
                <div key={sc.key} className="flex items-center justify-between px-3.5 py-2 text-xs">
                  <span className="text-slate-300">{sc.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-900 font-mono text-[11px] text-cyan-300 border border-slate-700 font-semibold">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> Studio Features
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="text-xs font-bold text-white">{f.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
            >
              Got It, Let's Create!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
