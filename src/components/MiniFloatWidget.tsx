import React, { useState } from 'react';
import { Square, Pause, Play, Minimize2, Camera, Move } from 'lucide-react';
import { RecordingState, RecordingStats, RecorderSettings } from '../types/recorder';
import { formatDuration } from '../utils/storage';
import { playTactileCue, triggerHaptic } from '../utils/audioEffects';

interface MiniFloatWidgetProps {
  recordingState: RecordingState;
  stats: RecordingStats;
  settings: RecorderSettings;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onTakeSnapshot: () => void;
  onRestoreFullView: () => void;
}

export const MiniFloatWidget: React.FC<MiniFloatWidgetProps> = ({
  recordingState,
  stats,
  settings,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onTakeSnapshot,
  onRestoreFullView,
}) => {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';

  const handleStop = () => {
    if (settings.soundEffects) playTactileCue('stop');
    if (settings.hapticFeedback) triggerHaptic(50);
    onStopRecording();
  };

  const handlePauseResume = () => {
    if (isRecording) {
      if (settings.soundEffects) playTactileCue('pause');
      if (settings.hapticFeedback) triggerHaptic(30);
      onPauseRecording();
    } else {
      if (settings.soundEffects) playTactileCue('resume');
      if (settings.hapticFeedback) triggerHaptic(30);
      onResumeRecording();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 p-2 bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md text-white select-none transition-all">
      {/* Live REC indicator */}
      <div className="flex items-center gap-2 pl-2">
        <span className="relative flex h-3 w-3">
          {isRecording && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-rose-500' : 'bg-amber-400'}`} />
        </span>
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-white">
            {formatDuration(stats.durationSeconds)}
          </span>
          <span className="font-mono text-[10px] text-emerald-400">
            {stats.currentFps > 0 ? `${stats.currentFps.toFixed(0)} FPS` : '60 FPS'}
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-slate-800 mx-1" />

      {/* Quick Pause / Resume */}
      <button
        onClick={handlePauseResume}
        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
        title={isRecording ? 'Pause' : 'Resume'}
      >
        {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
      </button>

      {/* Snapshot */}
      <button
        onClick={onTakeSnapshot}
        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
        title="Snap 720p screenshot"
      >
        <Camera className="w-3.5 h-3.5 text-cyan-400" />
      </button>

      {/* STOP and Auto-Save */}
      <button
        onClick={handleStop}
        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
        title="Stop & Auto Save"
      >
        <Square className="w-3 h-3 fill-white" />
        <span>STOP</span>
      </button>

      {/* Expand back */}
      <button
        onClick={onRestoreFullView}
        className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        title="Expand to Full HUD"
      >
        <Minimize2 className="w-3.5 h-3.5 rotate-180" />
      </button>
    </div>
  );
};
