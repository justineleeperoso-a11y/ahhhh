import { RecorderSettings, RecordingStats, RecordedClip } from '../types/recorder';
import { triggerAutoDownload } from './storage';

export type EngineEventCallback = {
  onStateChange?: (state: 'idle' | 'recording' | 'paused' | 'processing') => void;
  onStatsUpdate?: (stats: RecordingStats) => void;
  onClipSaved?: (clip: RecordedClip) => void;
  onError?: (err: Error) => void;
};

export class RecorderEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private mixedStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private recordedChunks: Blob[] = [];
  
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private timerInterval: number | null = null;
  
  // FPS calculation
  private frameCount: number = 0;
  private lastFpsUpdateTime: number = 0;
  private currentCalculatedFps: number = 60;
  private videoElementForFps: HTMLVideoElement | null = null;
  private rvfcId: number | null = null;
  private totalBytesRecorded: number = 0;
  private lastByteCheckTime: number = 0;
  private lastByteCount: number = 0;
  private currentBitrateKbps: number = 0;

  private callbacks: EngineEventCallback = {};
  public settings: RecorderSettings;

  constructor(settings: RecorderSettings, callbacks: EngineEventCallback) {
    this.settings = settings;
    this.callbacks = callbacks;
  }

  public updateSettings(newSettings: Partial<RecorderSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  public static getBestSupportedMimeType(): string {
    const candidateTypes = [
      'video/webm;codecs=h264,opus', // Hardware accelerated on Android
      'video/webm;codecs=vp8,opus',  // Low CPU fallback
      'video/mp4;codecs=avc1,mp4a',  // MP4 container
      'video/webm;codecs=vp9,opus',
      'video/webm',
    ];

    for (const type of candidateTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  }

  public async startCapture(source: 'display' | 'canvas' | 'camera', customCanvasStream?: MediaStream): Promise<MediaStream> {
    try {
      this.callbacks.onStateChange?.('processing');

      let videoStream: MediaStream;

      if (source === 'canvas' && customCanvasStream) {
        videoStream = customCanvasStream;
      } else if (source === 'camera') {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: this.settings.width },
            height: { ideal: this.settings.height },
            frameRate: { ideal: this.settings.frameRate, max: this.settings.frameRate },
          },
          audio: this.settings.audioSource !== 'muted',
        });
      } else {
        // Display / Screen Capture
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen recording API is not supported in this browser environment. You can use the In-App 60 FPS Game Benchmark or Camera mode!');
        }

        const audioNeeded = this.settings.audioSource === 'system' || this.settings.audioSource === 'both';
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
            width: { ideal: this.settings.width },
            height: { ideal: this.settings.height },
            frameRate: { ideal: this.settings.frameRate, max: this.settings.frameRate },
          },
          audio: audioNeeded,
        });
      }

      this.displayStream = videoStream;

      // Handle user terminating screen share from browser banner
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.stopRecording();
          }
        };
      }

      // Handle Audio Mixing
      let finalAudioStream: MediaStream | null = null;
      if (this.settings.audioSource === 'both') {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          // Mix system audio + mic audio using AudioContext
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          this.audioCtx = new AudioContextClass();
          const dest = this.audioCtx.createMediaStreamDestination();

          const sysTracks = videoStream.getAudioTracks();
          if (sysTracks.length > 0) {
            const sysSource = this.audioCtx.createMediaStreamSource(new MediaStream([sysTracks[0]]));
            const sysGain = this.audioCtx.createGain();
            sysGain.gain.value = 1.0;
            sysSource.connect(sysGain);
            sysGain.connect(dest);
          }

          const micTracks = this.micStream.getAudioTracks();
          if (micTracks.length > 0) {
            const micSource = this.audioCtx.createMediaStreamSource(new MediaStream([micTracks[0]]));
            const micGain = this.audioCtx.createGain();
            micGain.gain.value = 1.2; // slight boost for commentary
            micSource.connect(micGain);
            micGain.connect(dest);
          }

          finalAudioStream = dest.stream;
        } catch (micErr) {
          console.warn('Microphone access denied or error, proceeding with system audio only', micErr);
        }
      } else if (this.settings.audioSource === 'mic') {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          finalAudioStream = this.micStream;
        } catch (micErr) {
          console.warn('Microphone access denied', micErr);
        }
      }

      // Combine video track and audio tracks
      const finalTracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
      if (finalAudioStream && finalAudioStream.getAudioTracks().length > 0) {
        finalTracks.push(...finalAudioStream.getAudioTracks());
      } else if (this.settings.audioSource === 'system' && videoStream.getAudioTracks().length > 0) {
        finalTracks.push(...videoStream.getAudioTracks());
      }

      this.mixedStream = new MediaStream(finalTracks);

      // Start MediaRecorder with lightweight encoding constraints
      const mimeType = RecorderEngine.getBestSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: this.settings.videoBitrate,
      };

      this.mediaRecorder = new MediaRecorder(this.mixedStream, recorderOptions);
      this.recordedChunks = [];
      this.totalBytesRecorded = 0;
      this.lastByteCheckTime = performance.now();
      this.lastByteCount = 0;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          this.totalBytesRecorded += event.data.size;
        }
      };

      this.mediaRecorder.onstart = () => {
        this.startTime = performance.now();
        this.pausedDuration = 0;
        this.callbacks.onStateChange?.('recording');
        this.startStatsMonitoring();
      };

      this.mediaRecorder.onpause = () => {
        this.pauseStartTime = performance.now();
        this.callbacks.onStateChange?.('paused');
      };

      this.mediaRecorder.onresume = () => {
        if (this.pauseStartTime > 0) {
          this.pausedDuration += performance.now() - this.pauseStartTime;
          this.pauseStartTime = 0;
        }
        this.callbacks.onStateChange?.('recording');
      };

      this.mediaRecorder.onstop = () => {
        this.finishRecording(mimeType);
      };

      // 1000ms timeslice for lightweight flushing without memory spiking
      this.mediaRecorder.start(1000);
      return this.mixedStream;
    } catch (err: unknown) {
      this.cleanupStreams();
      this.callbacks.onStateChange?.('idle');
      const error = err instanceof Error ? err : new Error(String(err));
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  public pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  public resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.callbacks.onStateChange?.('processing');
      this.stopStatsMonitoring();
      this.mediaRecorder.stop();
    }
  }

  private finishRecording(mimeType: string) {
    const elapsedSeconds = Math.max(
      1,
      (performance.now() - this.startTime - this.pausedDuration) / 1000
    );

    const blob = new Blob(this.recordedChunks, { type: mimeType });
    const clipId = `clip_${Date.now()}`;
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = `ApexRec_${timestampStr}_720p60.${ext}`;

    const recordedClip: RecordedClip = {
      id: clipId,
      blob,
      url: URL.createObjectURL(blob),
      name: filename,
      durationSeconds: Math.round(elapsedSeconds * 10) / 10,
      fileSizeBytes: blob.size,
      createdAt: Date.now(),
      mimeType,
      resolution: `${this.settings.width}x${this.settings.height}`,
      fps: Math.round(this.currentCalculatedFps),
    };

    // Automatic Video Saving
    if (this.settings.autoDownload) {
      triggerAutoDownload(blob, filename);
    }

    this.cleanupStreams();
    this.callbacks.onClipSaved?.(recordedClip);
    this.callbacks.onStateChange?.('idle');
  }

  public async takeSnapshot(targetVideoElement?: HTMLVideoElement | null): Promise<string | null> {
    try {
      const video = targetVideoElement || this.videoElementForFps;
      if (!video || !video.videoWidth) return null;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png', 0.95);

      // Auto download snapshot
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ApexRec_Snap_${Date.now()}.png`;
      a.click();

      return dataUrl;
    } catch {
      return null;
    }
  }

  private startStatsMonitoring() {
    // Setup lightweight video element to tap requestVideoFrameCallback for accurate FPS
    if (this.displayStream) {
      this.videoElementForFps = document.createElement('video');
      this.videoElementForFps.muted = true;
      this.videoElementForFps.playsInline = true;
      this.videoElementForFps.srcObject = this.displayStream;
      this.videoElementForFps.play().catch(() => {});

      this.frameCount = 0;
      this.lastFpsUpdateTime = performance.now();

      // If requestVideoFrameCallback is available, use it for zero-overhead hardware frame sync
      const hookRVFC = () => {
        if (!this.videoElementForFps) return;
        if ('requestVideoFrameCallback' in this.videoElementForFps) {
          const checkFrame = () => {
            this.frameCount++;
            if (this.videoElementForFps && 'requestVideoFrameCallback' in this.videoElementForFps) {
              this.rvfcId = (this.videoElementForFps as any).requestVideoFrameCallback(checkFrame);
            }
          };
          this.rvfcId = (this.videoElementForFps as any).requestVideoFrameCallback(checkFrame);
        }
      };
      hookRVFC();
    }

    // Interval to emit stats smoothly every 500ms
    this.timerInterval = window.setInterval(() => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;

      const now = performance.now();
      const isPaused = this.mediaRecorder.state === 'paused';
      const currentPause = isPaused ? (now - this.pauseStartTime) : 0;
      const elapsedSeconds = Math.max(0, (now - this.startTime - this.pausedDuration - currentPause) / 1000);

      // Calculate actual live FPS
      const fpsDeltaTime = (now - this.lastFpsUpdateTime) / 1000;
      if (fpsDeltaTime >= 0.5) {
        if (this.frameCount > 0) {
          const measured = (this.frameCount / fpsDeltaTime);
          this.currentCalculatedFps = Math.min(60, Math.round(measured * 10) / 10);
        } else {
          // If RVFC wasn't triggered or static frame, estimate near target
          this.currentCalculatedFps = this.settings.frameRate;
        }
        this.frameCount = 0;
        this.lastFpsUpdateTime = now;
      }

      // Calculate actual bitrate in kbps
      const bytesDeltaTime = (now - this.lastByteCheckTime) / 1000;
      if (bytesDeltaTime >= 1.0) {
        const bytesDiff = this.totalBytesRecorded - this.lastByteCount;
        this.currentBitrateKbps = Math.round((bytesDiff * 8) / (bytesDeltaTime * 1000));
        this.lastByteCount = this.totalBytesRecorded;
        this.lastByteCheckTime = now;
      }

      this.callbacks.onStatsUpdate?.({
        durationSeconds: elapsedSeconds,
        currentFps: isPaused ? 0 : this.currentCalculatedFps,
        dataSizeEstimateBytes: this.totalBytesRecorded,
        droppedFrames: 0,
        resolution: `${this.settings.width}x${this.settings.height}`,
        actualBitrateKbps: isPaused ? 0 : (this.currentBitrateKbps || Math.round(this.settings.videoBitrate / 1000)),
      });
    }, 500);
  }

  private stopStatsMonitoring() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.rvfcId && this.videoElementForFps && 'cancelVideoFrameCallback' in this.videoElementForFps) {
      (this.videoElementForFps as any).cancelVideoFrameCallback(this.rvfcId);
      this.rvfcId = null;
    }
    if (this.videoElementForFps) {
      this.videoElementForFps.srcObject = null;
      this.videoElementForFps = null;
    }
  }

  private cleanupStreams() {
    this.stopStatsMonitoring();

    if (this.displayStream) {
      this.displayStream.getTracks().forEach((track) => track.stop());
      this.displayStream = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.mixedStream) {
      this.mixedStream.getTracks().forEach((track) => track.stop());
      this.mixedStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  public getActiveStream(): MediaStream | null {
    return this.displayStream || this.mixedStream;
  }
}
