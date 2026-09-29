import React from 'react';
import { Disc, Sliders, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderNavProps {
  onOpenClips: () => void;
  onOpenSettings: () => void;
  onOpenDownloadGuide: () => void;
  onOpenApkModal: () => void;
  clipsCount: number;
  activeTab: 'recorder' | 'benchmark' | 'tips';
  onChangeTab: (tab: 'recorder' | 'benchmark' | 'tips') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenClips,
  onOpenSettings,
  onOpenDownloadGuide,
  onOpenApkModal,
  clipsCount,
  activeTab,
  onChangeTab,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="font-gaming">ApexRec 720p60</span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
        <button
          onClick={() => onChangeTab('recorder')}
          className={`transition-colors hover:text-white ${activeTab === 'recorder' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Screen Capture
        </button>
        <button
          onClick={() => onChangeTab('benchmark')}
          className={`transition-colors hover:text-white ${activeTab === 'benchmark' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          60FPS Gameplay Test
        </button>
        <button
          onClick={() => onChangeTab('tips')}
          className={`transition-colors hover:text-white ${activeTab === 'tips' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Android Low-Lag Guide
        </button>
        <button
          onClick={onOpenApkModal}
          className="transition-colors text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
        >
          <span>Get APK</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        {/* Prominent GET APK Button */}
        <button
          onClick={onOpenApkModal}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all whitespace-nowrap"
          title="Download APK or Install on Android"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Get APK</span>
        </button>

        {/* Video Download Guide Button */}
        <button
          onClick={onOpenDownloadGuide}
          className="hidden sm:flex p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium items-center gap-1.5"
          title="How to download videos"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Save Guide</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Recorder Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenClips}
          className="px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/30 text-cyan-300 font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Disc className="w-3.5 h-3.5 text-cyan-400" />
          <span>Clips</span>
          {clipsCount > 0 && <span className="font-mono text-cyan-200">({clipsCount})</span>}
        </button>
      </div>
    </header>
  );
};
