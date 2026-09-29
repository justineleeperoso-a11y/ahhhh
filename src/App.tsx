import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RecordingState, 
  RecordingStats, 
  RecorderSettings, 
  RecordedClip 
} from './types/recorder';
import { RecorderEngine } from './utils/recorderEngine';
import { loadClipsFromDB, saveClipToDB, deleteClipFromDB, formatDuration, formatBytes } from './utils/storage';
import { HeaderNav } from './components/HeaderNav';
import { RecordingHUD } from './components/RecordingHUD';
import { MiniFloatWidget } from './components/MiniFloatWidget';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ClipsGallery } from './components/ClipsGallery';
import { DownloadGuideModal } from './components/DownloadGuideModal';
import { ApkGeneratorModal } from './components/ApkGeneratorModal';
import { GameBenchmarkCanvas } from './components/GameBenchmarkCanvas';
import { AndroidTips } from './components/AndroidTips';
import { 
  Monitor, 
  Gamepad2, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Maximize, 
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';

export default function App() {
  // Settings with lightweight 720p60 defaults
  const [settings, setSettings] = useState<RecorderSettings>({
    profile: '720p60',
    frameRate: 60,
    width: 1280,
    height: 720,
    videoBitrate: 4500000, // 4.5 Mbps balanced
    audioSource: 'system',
    ecoMode: false,
    autoDownload: true,
    soundEffects: true,
    hapticFeedback: true,
  });

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [activeSource, setActiveSource] = useState<'display' | 'canvas' | 'camera'>('canvas');
  const [stats, setStats] = useState<RecordingStats>({
    durationSeconds: 0,
    currentFps: 60,
    dataSizeEstimateBytes: 0,
    droppedFrames: 0,
    resolution: '1280x720',
    actualBitrateKbps: 4500,
  });

  const [clips, setClips] = useState<RecordedClip[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isClipsOpen, setIsClipsOpen] = useState<boolean>(false);
  const [isDownloadGuideOpen, setIsDownloadGuideOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [isMiniHud, setIsMiniHud] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'recorder' | 'benchmark' | 'tips'>('recorder');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'error' } | null>(null);

  // References
  const recorderEngineRef = useRef<RecorderEngine | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);

  // Load saved clips from IndexedDB on mount
  useEffect(() => {
    loadClipsFromDB().then((saved) => {
      setClips(saved);
    });
  }, []);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initialize or re-configure recorder engine
  const getEngine = useCallback(() => {
    if (!recorderEngineRef.current) {
      recorderEngineRef.current = new RecorderEngine(settings, {
        onStateChange: (state) => {
          setRecordingState(state);
        },
        onStatsUpdate: (newStats) => {
          setStats(newStats);
        },
        onClipSaved: async (clip) => {
          await saveClipToDB(clip);
          setClips((prev) => [clip, ...prev]);
          showToast(
            'Recording Saved Automatically!',
            `${clip.name} (${formatDuration(clip.durationSeconds)}, ${formatBytes(clip.fileSizeBytes)}) saved to downloads.`,
            'success'
          );
        },
        onError: (err) => {
          showToast('Recording Notice', err.message, 'error');
        },
      });
    } else {
      recorderEngineRef.current.updateSettings(settings);
    }
    return recorderEngineRef.current;
  }, [settings]);

  // Handle start recording
  const handleStartRecording = async (source: 'display' | 'canvas' | 'camera') => {
    try {
      setActiveSource(source);
      const engine = getEngine();
      const stream = await engine.startCapture(
        source,
        source === 'canvas' ? canvasStreamRef.current || undefined : undefined
      );

      // Attach stream to live preview if not in ecoMode
      if (previewVideoRef.current && !settings.ecoMode) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.play().catch(() => {});
      }

      showToast(
        'Recording Started',
        `Targeting 720p @ ${settings.frameRate} FPS with low resource encoding.`,
        'info'
      );
    } catch (err: unknown) {
      console.warn('Start recording cancelled or failed:', err);
    }
  };

  const handleStopRecording = () => {
    if (recorderEngineRef.current) {
      recorderEngineRef.current.stopRecording();
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  };

  const handlePauseRecording = () => {
    if (recorderEngineRef.current) {
      recorderEngineRef.current.pauseRecording();
    }
  };

  const handleResumeRecording = () => {
    if (recorderEngineRef.current) {
      recorderEngineRef.current.resumeRecording();
    }
  };

  const handleTakeSnapshot = async () => {
    if (recorderEngineRef.current) {
      const snap = await recorderEngineRef.current.takeSnapshot(previewVideoRef.current);
      if (snap) {
        showToast('Snapshot Saved', 'High quality 720p PNG frame saved to downloads.', 'success');
      }
    }
  };

  const handleDeleteClip = async (id: string) => {
    await deleteClipFromDB(id);
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateSettings = (newSettings: Partial<RecorderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (recorderEngineRef.current) {
      recorderEngineRef.current.updateSettings(updated);
    }
  };

  const handleCanvasStreamReady = useCallback((stream: MediaStream) => {
    canvasStreamRef.current = stream;
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Header */}
      <HeaderNav
        onOpenClips={() => setIsClipsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDownloadGuide={() => setIsDownloadGuideOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        clipsCount={clips.length}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Floating Mini HUD Overlay when minimized */}
      {isMiniHud && (
        <MiniFloatWidget
          recordingState={recordingState}
          stats={stats}
          settings={settings}
          onStopRecording={handleStopRecording}
          onPauseRecording={handlePauseRecording}
          onResumeRecording={handleResumeRecording}
          onTakeSnapshot={handleTakeSnapshot}
          onRestoreFullView={() => setIsMiniHud(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 right-4 sm:right-6 z-50 animate-slide-in-down max-w-sm">
            <div className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
                : 'bg-slate-900/90 border-cyan-500/50 text-cyan-100'
            }`}>
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
              <div className="flex flex-col text-xs">
                <span className="font-bold">{toastMessage.title}</span>
                <span className="text-slate-300 mt-0.5">{toastMessage.desc}</span>
              </div>
            </div>
          </div>
        )}

        {/* Source Selector Bar */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSource('canvas')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeSource === 'canvas'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>In-App 60FPS Game Benchmark</span>
            </button>

            <button
              onClick={() => setActiveSource('display')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeSource === 'display'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Full Screen / Android App</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pr-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Target Profile:</span>
            <span className="font-mono text-cyan-400">720p @ {settings.frameRate}fps</span>
          </div>
        </div>

        {/* Primary Viewport Area */}
        {activeSource === 'canvas' ? (
          <GameBenchmarkCanvas
            onCanvasStreamReady={handleCanvasStreamReady}
            isRecording={recordingState === 'recording'}
          />
        ) : (
          <div className="relative w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {recordingState !== 'idle' && !settings.ecoMode ? (
              <video
                ref={previewVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : settings.ecoMode && recordingState === 'recording' ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <EyeOff className="w-10 h-10 text-cyan-400 mb-2" />
                <span className="text-sm font-semibold text-white">Eco Mode Active (Preview Suspended)</span>
                <span className="text-xs text-slate-500 mt-1 max-w-sm">
                  Screen recording is actively running at 720p @ 60 FPS in the background. GPU rendering is saved for maximum gameplay performance.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Monitor className="w-12 h-12 text-slate-600 mb-3" />
                <span className="text-sm font-semibold text-white">Screen Capture Ready</span>
                <span className="text-xs text-slate-500 mt-1 max-w-md">
                  Click &ldquo;Record Screen&rdquo; below to select your Android game or entire device display. ApexRec will automatically capture in lightweight 720p 60 FPS and auto-save the video.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Primary Gaming HUD Controls (Natural Thumb-Zone) */}
        <RecordingHUD
          recordingState={recordingState}
          stats={stats}
          settings={settings}
          activeSource={activeSource}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPauseRecording={handlePauseRecording}
          onResumeRecording={handleResumeRecording}
          onTakeSnapshot={handleTakeSnapshot}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenClips={() => setIsClipsOpen(true)}
          onToggleMiniHud={() => setIsMiniHud(!isMiniHud)}
          clipsCount={clips.length}
        />

        {/* Quick Help & Download Status Card */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white block">Auto-Save & Android APK Ready</span>
              <span className="text-slate-400">Stopping any recording automatically saves 720p 60FPS video. You can also install ApexRec as a native Android app/APK.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
            >
              <span>Get APK / Install</span>
            </button>
            <button
              onClick={() => setIsDownloadGuideOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              <span>Save Guide</span>
            </button>
          </div>
        </div>

        {/* Low-Lag & Android Thermal Guidelines */}
        <AndroidTips />

      </main>

      {/* Settings Modal Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Clips Gallery Drawer */}
      <ClipsGallery
        isOpen={isClipsOpen}
        onClose={() => setIsClipsOpen(false)}
        clips={clips}
        onDeleteClip={handleDeleteClip}
      />

      {/* Download & Install Guide Modal */}
      <DownloadGuideModal
        isOpen={isDownloadGuideOpen}
        onClose={() => setIsDownloadGuideOpen(false)}
        onOpenClips={() => setIsClipsOpen(true)}
      />

      {/* APK Generator & Android Install Modal */}
      <ApkGeneratorModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Clean quiet footer */}
      <footer className="w-full py-4 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">
        <span>ApexRec 720p60 · Low Resource Mobile Screen Recorder · Hardware Accelerated Encoding</span>
      </footer>
    </div>
  );
}
