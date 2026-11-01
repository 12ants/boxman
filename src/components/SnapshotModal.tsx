import React, { useState } from 'react';
import { X, Download, Copy, Check, RefreshCw } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (transparent: boolean) => string;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ isOpen, onClose, onCapture }) => {
  const [transparent, setTransparent] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const img = onCapture(transparent);
      setDataUrl(img);
    }
  }, [isOpen, transparent, onCapture]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `BoxMan_Pose_${Date.now()}.png`;
    a.click();
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Could not copy image to clipboard:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span>📸</span> Studio Snapshot Capture
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image Preview Container */}
          <div
            className={`w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center relative ${
              transparent
                ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950'
                : 'bg-slate-950'
            }`}
          >
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="BoxMan 3D Pose Snapshot"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-slate-500">Generating preview...</span>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div>
              <div className="font-semibold text-slate-200">Transparent Background</div>
              <div className="text-[11px] text-slate-400">Remove background for stickers / avatars</div>
            </div>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setDataUrl(onCapture(transparent))}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Retake Snapshot"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Image'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
