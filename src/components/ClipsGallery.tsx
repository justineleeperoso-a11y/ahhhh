import React, { useState } from 'react';
import { X, Play, Download, Trash2, Share2, Film, Check, ExternalLink } from 'lucide-react';
import { RecordedClip } from '../types/recorder';
import { formatBytes, formatDuration, triggerAutoDownload } from '../utils/storage';

interface ClipsGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  clips: RecordedClip[];
  onDeleteClip: (id: string) => void;
}

export const ClipsGallery: React.FC<ClipsGalleryProps> = ({
  isOpen,
  onClose,
  clips,
  onDeleteClip,
}) => {
  const [selectedClip, setSelectedClip] = useState<RecordedClip | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShare = async (clip: RecordedClip) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        const file = new File([clip.blob], clip.name, { type: clip.mimeType });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: clip.name,
            text: 'Gameplay recording recorded with ApexRec 720p60',
          });
          return;
        }
      }
      // Fallback: trigger download or copy
      triggerAutoDownload(clip.blob, clip.name);
      setShareSuccess(clip.id);
      setTimeout(() => setShareSuccess(null), 2500);
    } catch (e) {
      console.warn('Share not completed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Saved Gameplay Recordings</h2>
            <span className="text-xs text-slate-400 font-mono">({clips.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Active Preview Player if clip selected */}
          {selectedClip && (
            <div className="mb-5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate max-w-[280px]">
                  {selectedClip.name}
                </span>
                <button
                  onClick={() => setSelectedClip(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Close Preview
                </button>
              </div>

              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  src={selectedClip.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{selectedClip.resolution}</span>
                  <span>·</span>
                  <span>{selectedClip.fps} FPS</span>
                  <span>·</span>
                  <span>{formatBytes(selectedClip.fileSizeBytes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerAutoDownload(selectedClip.blob, selectedClip.name)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleShare(selectedClip)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {clips.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              <Film className="w-12 h-12 stroke-[1.2] mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No recordings saved yet</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                When you record gameplay and hit Stop, your 720p 60FPS video will automatically save to your device and appear here!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setSelectedClip(clip)}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-cyan-950 flex items-center justify-center text-cyan-400 shrink-0 transition-colors group"
                      title="Play Preview"
                    >
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="flex flex-col">
                      <div className="text-xs font-semibold text-white truncate max-w-[220px] sm:max-w-xs">
                        {clip.name}
                      </div>

                      {/* Zero-Pill Clean Unboxed Metadata */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span>{formatDuration(clip.durationSeconds)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{clip.resolution}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-mono">{clip.fps} FPS</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatBytes(clip.fileSizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedClip(clip)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                    >
                      Watch
                    </button>

                    <button
                      onClick={() => triggerAutoDownload(clip.blob, clip.name)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Download to device"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(clip)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Android Share"
                    >
                      {shareSuccess === clip.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onDeleteClip(clip.id)}
                      className="p-2 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Recordings saved automatically to your device downloads folder</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
