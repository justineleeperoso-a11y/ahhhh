import React from 'react';
import { X, Download, Smartphone, CheckCircle2, Share2, Film, FolderDown, ArrowRight, HardDrive } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenClips: () => void;
}

export const DownloadGuideModal: React.FC<DownloadGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenClips,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">How to Download</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 py-4">
          
          {/* Section 1: Downloading Your Recorded Gameplay Videos */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Downloading Recorded 720p 60FPS Videos
              </h3>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                  A
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Automatic Download on STOP</span>
                  <span className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Whenever you press <strong className="text-rose-400">STOP & SAVE</strong>, ApexRec automatically saves the video file straight into your phone&apos;s <strong>Downloads</strong> folder (or browser downloads list).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                  B
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Saved Clips Gallery</span>
                  <span className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Tap the <strong>Clips</strong> button at any time to re-download any previously recorded gameplay video, preview the video with audio, or share it.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                  C
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Where to find it on Android</span>
                  <span className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Open your Android <strong>Files / My Files</strong> app $\rightarrow$ go to <strong>Downloads</strong> $\rightarrow$ look for files named <code className="text-cyan-300 font-mono text-[11px]">ApexRec_..._720p60.webm</code>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenClips();
                }}
                className="mt-1 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>Open Saved Clips Gallery Now</span>
              </button>
            </div>
          </div>

          {/* Section 2: Installing/Downloading the App onto Android Device */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Install / Download the App to Your Phone
              </h3>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                You can install ApexRec directly onto your Android home screen as a standalone application. It runs with zero browser address bar, low RAM overhead, and quick launch for gaming.
              </p>

              {/* Direct Install Button if supported */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>1-Tap Install App on This Device</span>
                </button>
              )}

              {isInstalled && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ApexRec is already installed as a standalone app on this device!</span>
                </div>
              )}

              {/* Step by step for Android Chrome */}
              <div className="flex flex-col gap-2 pt-1 text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Manual Steps on Android (Chrome / Samsung Internet):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed pl-1">
                  <li>
                    Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.
                  </li>
                  <li>
                    Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </li>
                  <li>
                    Tap <strong>Install</strong> when prompted. The ApexRec icon will appear on your phone screen alongside your games!
                  </li>
                </ol>
              </div>

              {/* iOS instructions if user is on iPhone/iPad */}
              {isIOS && (
                <div className="mt-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-white block mb-0.5">On iPhone / iPad Safari:</strong>
                  Tap the <strong>Share</strong> button (box with upward arrow) $\rightarrow$ scroll down and tap <strong>Add to Home Screen</strong>.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-xs text-white transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
