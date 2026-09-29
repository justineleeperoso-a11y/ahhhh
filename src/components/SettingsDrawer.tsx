import React from 'react';
import { X, Check, Cpu, Zap, Volume2, Shield, Sparkles, Smartphone, Sliders } from 'lucide-react';
import { RecorderSettings, QualityProfile, AudioSourceOption } from '../types/recorder';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RecorderSettings;
  onUpdateSettings: (newSettings: Partial<RecorderSettings>) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android Sheet Drag Handle indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Recorder Engine Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 py-4">
          {/* Quality & Framerate Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quality & Framerate Target
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ profile: '720p60', width: 1280, height: 720, frameRate: 60, videoBitrate: 4500000 })}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  settings.profile === '720p60'
                    ? 'border-cyan-500 bg-cyan-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-cyan-300">720p @ 60 FPS</span>
                  {settings.profile === '720p60' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400">Optimal smooth gameplay profile. Low CPU load, zero stuttering on Android.</p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ profile: '720p30', width: 1280, height: 720, frameRate: 30, videoBitrate: 3000000 })}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  settings.profile === '720p30'
                    ? 'border-cyan-500 bg-cyan-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-200">720p @ 30 FPS</span>
                  {settings.profile === '720p30' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400">Battery saver mode. Reduced memory and battery consumption for long sessions.</p>
              </button>
            </div>
          </div>

          {/* Video Bitrate */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Bitrate
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {(settings.videoBitrate / 1000000).toFixed(1)} Mbps
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Eco (2.5M)', value: 2500000, desc: 'Ultra-low lag' },
                { label: 'Balanced (4.5M)', value: 4500000, desc: 'Recommended' },
                { label: 'Crisp (6.5M)', value: 6500000, desc: 'High action' },
              ].map((bit) => (
                <button
                  key={bit.value}
                  type="button"
                  onClick={() => onUpdateSettings({ videoBitrate: bit.value })}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    settings.videoBitrate === bit.value
                      ? 'border-cyan-500 bg-cyan-950/50 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{bit.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{bit.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Source Options */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audio Capture Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'system', title: 'Game Audio Only', desc: 'Captures in-game sound directly' },
                { id: 'both', title: 'Game + Mic', desc: 'Mixed commentary voiceover' },
                { id: 'mic', title: 'Microphone Only', desc: 'Commentary only' },
                { id: 'muted', title: 'Muted', desc: 'Zero audio CPU processing' },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => onUpdateSettings({ audioSource: src.id as AudioSourceOption })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.audioSource === src.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{src.title}</span>
                    {settings.audioSource === src.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{src.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Low Resource & Auto-Save Toggles */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
            {/* Auto-Save */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Automatic Video Saving</span>
                <span className="text-[11px] text-slate-400">Instantly triggers download to device storage on stop</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ autoDownload: !settings.autoDownload })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.autoDownload ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Eco Mode / Low CPU preview suspension */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Low Resource Mode</span>
                <span className="text-[11px] text-slate-400">Mutes unnecessary preview rendering to eliminate game lag</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ecoMode: !settings.ecoMode })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.ecoMode ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptics on Android */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Android Haptic Vibration</span>
                <span className="text-[11px] text-slate-400">Tactile physical buzz on Start / Stop / Snap</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ hapticFeedback: !settings.hapticFeedback })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.hapticFeedback ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-xs text-white shadow-lg shadow-cyan-600/20 transition-all"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
