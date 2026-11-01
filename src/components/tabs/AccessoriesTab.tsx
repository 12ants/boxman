import React from 'react';
import {
  CharacterAccessories,
  HeadAccessory,
  BackAccessory,
  HandAccessory,
} from '../../types/character';
import { Shield, Sparkles, Wand2, Backpack, Crown, Swords } from 'lucide-react';

interface AccessoriesTabProps {
  accessories: CharacterAccessories;
  onChange: (updated: CharacterAccessories) => void;
}

export const AccessoriesTab: React.FC<AccessoriesTabProps> = ({ accessories, onChange }) => {
  const headItems: { id: HeadAccessory; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '🚫' },
    { id: 'crown', label: 'Golden Crown', icon: '👑' },
    { id: 'horns', label: 'Cyber Horns', icon: '😈' },
    { id: 'headphones', label: 'Headphones', icon: '🎧' },
    { id: 'vr_headset', label: 'VR Cyber Visor', icon: '🥽' },
    { id: 'halo', label: 'Angelic Halo', icon: '😇' },
    { id: 'party_hat', label: 'Party Cone', icon: '🎉' },
    { id: 'samurai_crest', label: 'Samurai Crest', icon: '⛩️' },
  ];

  const backItems: { id: BackAccessory; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '🚫' },
    { id: 'jetpack', label: 'Booster Jetpack', icon: '🚀' },
    { id: 'dual_swords', label: 'Dual Katanas', icon: '⚔️' },
    { id: 'backpack', label: 'Adventure Pack', icon: '🎒' },
    { id: 'cyber_wings', label: 'Cyber Wings', icon: '🪽' },
    { id: 'cape', label: 'Hero Cape', icon: '🦸' },
  ];

  const handItems: { id: HandAccessory; label: string; icon: string }[] = [
    { id: 'none', label: 'Empty Hand', icon: '🚫' },
    { id: 'blaster', label: 'Sci-Fi Blaster', icon: '🔫' },
    { id: 'sword', label: 'Energy Blade', icon: '🗡️' },
    { id: 'shield', label: 'Aegis Shield', icon: '🛡️' },
    { id: 'magic_orb', label: 'Mystic Orb', icon: '🔮' },
    { id: 'coffee_mug', label: 'Coffee Mug', icon: '☕' },
    { id: 'microphone', label: 'Vocal Mic', icon: '🎙️' },
    { id: 'gamepad', label: 'Retro Gamepad', icon: '🎮' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-1 text-slate-200">
      {/* 1. Headwear */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Crown className="w-3.5 h-3.5" /> Headgear
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">{accessories.headColor}</span>
            <input
              type="color"
              value={accessories.headColor}
              onChange={(e) => onChange({ ...accessories, headColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              title="Headgear Color"
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {headItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ ...accessories, head: item.id })}
              className={`w-full px-3 py-2 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                accessories.head === item.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {accessories.head === item.id && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Back Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Backpack className="w-3.5 h-3.5" /> Back Equipment
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">{accessories.backColor}</span>
            <input
              type="color"
              value={accessories.backColor}
              onChange={(e) => onChange({ ...accessories, backColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              title="Back Gear Color"
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {backItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ ...accessories, back: item.id })}
              className={`w-full px-3 py-2 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                accessories.back === item.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {accessories.back === item.id && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Left Hand Prop */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Shield className="w-3.5 h-3.5" /> Left Hand
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">{accessories.leftHandColor}</span>
            <input
              type="color"
              value={accessories.leftHandColor}
              onChange={(e) => onChange({ ...accessories, leftHandColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              title="Left Hand Item Color"
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {handItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ ...accessories, leftHand: item.id })}
              className={`w-full px-3 py-2 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                accessories.leftHand === item.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {accessories.leftHand === item.id && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Right Hand Prop */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Swords className="w-3.5 h-3.5" /> Right Hand
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">{accessories.rightHandColor}</span>
            <input
              type="color"
              value={accessories.rightHandColor}
              onChange={(e) => onChange({ ...accessories, rightHandColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              title="Right Hand Item Color"
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {handItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ ...accessories, rightHand: item.id })}
              className={`w-full px-3 py-2 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                accessories.rightHand === item.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {accessories.rightHand === item.id && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
