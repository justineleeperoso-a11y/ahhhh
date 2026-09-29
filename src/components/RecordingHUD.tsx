import React from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  Camera, 
  Disc, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Mic, 
  Monitor, 
  Gamepad2, 
  ShieldCheck, 
  Activity,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { RecordingState, RecordingStats, RecorderSettings, AudioSourceOption } from '../types/recorder';
import { formatDuration, formatBytes } from '../utils/storage';
import { playTactileCue, triggerHaptic } from '../utils/audioEffects';

interface RecordingHUDProps {
  recordingState: RecordingState;
  stats: RecordingStats;
  settings: RecorderSettings;
  activeSource: 'display' | 'canvas' | 'camera';
  onStartRecording: (source: 'display' | 'canvas' | 'camera') => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onTakeSnapshot: () => void;
  onOpenSettings: () => void;
  onOpenClips: () => void;
  onToggleMiniHud: () => void;
  clipsCount: number;
}

export const RecordingHUD: React.FC<RecordingHUDProps> = ({
  recordingState,
  stats,
  settings,
  activeSource,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onTakeSnapshot,
  onOpenSettings,
  onOpenClips,
  onToggleMiniHud,
  clipsCount,
}) => {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isProcessing = recordingState === 'processing';
  const isIdle = recordingState === 'idle';

  const handleStart = (source: 'display' | 'canvas' | 'camera') => {
    if (settings.soundEffects) playTactileCue('start');
    if (settings.hapticFeedback) triggerHaptic([40, 30, 40]);
    onStartRecording(source);
  };

  const handleStop = () => {
    if (settings.soundEffects) playTactileCue('stop');
    if (settings.hapticFeedback) triggerHaptic(60);
    onStopRecording();
  };

  const handlePauseResume = () => {
    if (isRecording) {
      if (settings.soundEffects) playTactileCue('pause');
      if (settings.hapticFeedback) triggerHaptic(30);
      onPauseRecording();
    } else if (isPaused) {
      if (settings.soundEffects) playTactileCue('resume');
      if (settings.hapticFeedback) triggerHaptic(30);
      onResumeRecording();
    }
  };

  const handleSnapshot = () => {
    if (settings.soundEffects) playTactileCue('snap');
    if (settings.hapticFeedback) triggerHaptic(20);
    onTakeSnapshot();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* HUD Telemetry Banner & Status Indicator */}
      <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Indicator & Live Timer */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-950 border border-slate-800">
              {isRecording && (
                <>
                  <span className="absolute w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75" />
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                </>
              )}
              {isPaused && (
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              {isIdle && (
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              )}
              {isProcessing && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isRecording ? 'RECORDING' : isPaused ? 'PAUSED' : isProcessing ? 'SAVING CLIP...' : 'STANDBY'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-cyan-400 font-mono">720p @ {settings.frameRate} FPS</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
                {isIdle ? '00:00.0' : formatDuration(stats.durationSeconds)}
              </div>
            </div>
          </div>

          {/* Real-Time Live Performance Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
            {/* FPS Gauge */}
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">FPS Rate</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg sm:text-xl font-mono font-bold ${
                  stats.currentFps >= 55 ? 'text-emerald-400' : stats.currentFps >= 30 ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {isIdle ? '60.0' : stats.currentFps.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">FPS</span>
              </div>
            </div>

            {/* Estimated File Size */}
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Recorded Size</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-mono font-bold text-slate-200">
                  {isIdle ? '0.0 MB' : formatBytes(stats.dataSizeEstimateBytes)}
                </span>
              </div>
            </div>

            {/* Bitrate & Low Overhead Mode */}
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Bitrate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-mono font-bold text-cyan-400">
                  {isIdle ? `${Math.round(settings.videoBitrate / 1000)}` : stats.actualBitrateKbps}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">kbps</span>
              </div>
            </div>

            {/* Float HUD switch */}
            <button
              onClick={onToggleMiniHud}
              title="Mini Floating HUD (Android overlay mode)"
              className="hidden md:flex p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Low Resource Indicator Pill-Free Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Low-Resource Engine:</span>
            <span>Hardware H.264/VP8 encoder active · Zero frame drops target</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Auto-Save:</span>
            <span className={settings.autoDownload ? 'text-emerald-400' : 'text-slate-500'}>
              {settings.autoDownload ? 'Enabled' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Touch Controls Bar (Bottom Natural Thumb-Zone Ergonomics) */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          {/* Left Action: Settings & Audio status */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              disabled={isRecording}
              className="min-h-[46px] min-w-[46px] px-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Configure 720p 60FPS recording settings"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={onOpenClips}
              className="relative min-h-[46px] min-w-[46px] px-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="View Auto-Saved Clips"
            >
              <Disc className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium hidden sm:inline">Clips</span>
              {clipsCount > 0 && (
                <span className="ml-0.5 text-xs font-bold font-mono text-cyan-300">
                  ({clipsCount})
                </span>
              )}
            </button>
          </div>

          {/* Center Primary Action: Glow REC / STOP Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isIdle && (
              <div className="flex items-center gap-2">
                {/* Primary Screen Capture Button */}
                <button
                  onClick={() => handleStart('display')}
                  className="min-h-[52px] px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-rose-600/30 transition-all"
                >
                  <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <span>Record Screen</span>
                </button>

                {/* Quick Game Benchmark Record Button */}
                <button
                  onClick={() => handleStart('canvas')}
                  className="min-h-[52px] px-4 py-2.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
                  title="Directly record smooth 60fps in-app canvas stream"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Record In-App 60FPS</span>
                  <span className="sm:hidden">Game</span>
                </button>
              </div>
            )}

            {(isRecording || isPaused) && (
              <div className="flex items-center gap-2.5">
                {/* Pause / Resume Button */}
                <button
                  onClick={handlePauseResume}
                  className="min-h-[50px] min-w-[50px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center gap-2 transition-colors border border-amber-500/20"
                  title={isRecording ? 'Pause Recording' : 'Resume Recording'}
                >
                  {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-emerald-400" />}
                  <span className="text-xs font-semibold hidden sm:inline">
                    {isRecording ? 'Pause' : 'Resume'}
                  </span>
                </button>

                {/* Primary STOP and Auto-Save Button */}
                <button
                  onClick={handleStop}
                  className="min-h-[52px] px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-rose-600/30 transition-all"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>STOP & SAVE</span>
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="min-h-[52px] px-6 rounded-xl bg-slate-800 text-cyan-400 flex items-center gap-2 font-medium text-sm">
                <span className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Auto-Saving 720p Video...</span>
              </div>
            )}
          </div>

          {/* Right Action: Instant Screenshot & Audio Quick Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSnapshot}
              className="min-h-[46px] min-w-[46px] px-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Take instant 720p screenshot"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium hidden sm:inline">Snap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
