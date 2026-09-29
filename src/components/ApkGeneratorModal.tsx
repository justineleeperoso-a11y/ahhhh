import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Layers,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGeneratorModal: React.FC<ApkGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'webapk' | 'pwabuilder' | 'qr'>('webapk');

  if (!isOpen) return null;

  // Use window.location.href or fallback to production shared app URL
  const currentUrl = typeof window !== 'undefined' && window.location.href 
    ? window.location.href 
    : 'https://ais-pre-pnsjorm3kxg3prk3p7cvvt-222979046025.asia-southeast1.run.app';

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&bgcolor=07090e&color=38bdf8&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Download APK / Install on Android</span>
              </h2>
              <span className="text-[11px] text-slate-400">Turn ApexRec 720p60 into an Android App</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-4 pb-2 border-b border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('webapk')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'webapk'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Method 1: Instant WebAPK (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Method 2: Standalone .APK File</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan to Phone</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 text-xs">
          
          {/* TAB 1: WebAPK */}
          {activeTab === 'webapk' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google Chrome Official Android WebAPK</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  You don&apos;t need to manually sideload shady files! Google Chrome on Android has a built-in feature that <strong>automatically compiles a real, signed Android APK (called a WebAPK)</strong> directly onto your device.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-300/90 font-medium">
                  <span>✓ Creates real icon in Android App Drawer</span>
                  <span>·</span>
                  <span>✓ Standalone window without browser bar</span>
                </div>
              </div>

              {/* Direct 1-Click Install Button if in compatible browser */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={install}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Install ApexRec APK on this Android Device</span>
                </button>
              )}

              {/* 3 Step Guide */}
              <div className="flex flex-col gap-2.5">
                <span className="font-semibold text-slate-200">How to do it in 15 seconds on your Android phone:</span>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-bold font-mono shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white block">Open this app in Chrome on your phone</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">
                      Make sure you are using Google Chrome or Samsung Internet browser on Android.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-bold font-mono shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white block">Tap the 3 dots (⋮) Menu in Chrome</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">
                      Look at the top-right corner of Google Chrome and tap the three vertical dots.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold font-mono shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white block">Tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">
                      Chrome will prompt you with &ldquo;Install ApexRec&rdquo;. Tap <strong>Install</strong>. Android will mint the APK and place the app icon on your phone!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PWABuilder Standalone APK */}
          {activeTab === 'pwabuilder' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Download className="w-4 h-4" />
                  <span>Generate a .APK file via Microsoft PWABuilder</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Want an actual downloadable <code>.apk</code> or <code>.aab</code> installer package? You can use Microsoft&apos;s free official tool to package this app into a signed Android APK in 1 click!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-semibold text-slate-200">Step-by-step:</span>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[11px] text-slate-400">Your App URL to convert:</span>
                    <span className="font-mono text-cyan-300 text-xs truncate max-w-[280px] sm:max-w-md">
                      {currentUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all text-center"
                >
                  <span>Open PWABuilder to Download APK</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <p className="text-[11px] text-slate-400 leading-normal">
                  On PWABuilder, click <strong>&ldquo;Package for Android&rdquo;</strong> $\rightarrow$ tap <strong>&ldquo;Generate APK&rdquo;</strong>. It will build and download the <code>apexrec.apk</code> directly to your device!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: QR Code to open on phone */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center gap-4 py-2 text-center">
              <p className="text-slate-300 text-xs max-w-sm">
                If you are currently on a computer or laptop, scan this QR code with your Android phone camera to open ApexRec and install the APK!
              </p>

              <div className="p-4 bg-[#07090e] border-2 border-cyan-500/40 rounded-2xl shadow-xl flex items-center justify-center">
                <img 
                  src={qrImageUrl} 
                  alt="Scan to open on Android phone"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Copy App Link'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Android 8.0+ compatible · Zero lag 720p60 recording</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
