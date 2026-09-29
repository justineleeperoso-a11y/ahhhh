export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export type QualityProfile = '720p60' | '720p30' | 'low_resource';

export type AudioSourceOption = 'system' | 'mic' | 'both' | 'muted';

export interface RecorderSettings {
  profile: QualityProfile;
  frameRate: number; // 60 or 30
  width: number; // 1280
  height: number; // 720
  videoBitrate: number; // in bps, e.g. 4000000 (4 Mbps)
  audioSource: AudioSourceOption;
  ecoMode: boolean; // turns off canvas live preview to save GPU/CPU
  autoDownload: boolean; // automatically save video to device upon stopping
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export interface RecordingStats {
  durationSeconds: number;
  currentFps: number;
  dataSizeEstimateBytes: number;
  droppedFrames: number;
  resolution: string;
  actualBitrateKbps: number;
}

export interface RecordedClip {
  id: string;
  blob: Blob;
  url: string;
  name: string;
  durationSeconds: number;
  fileSizeBytes: number;
  createdAt: number;
  mimeType: string;
  resolution: string;
  fps: number;
}
