import React from 'react';
import { Cpu, Zap, Shield, BatteryCharging, Gauge, CheckCircle2 } from 'lucide-react';

export const AndroidTips: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-slate-300">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Why 720p @ 60 FPS Eliminates Gameplay Lag on Android
        </h3>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Modern Android mobile chipsets (Snapdragon, MediaTek Dimensity, Google Tensor, Mali GPUs) have dedicated hardware video encoding blocks. 1080p recording often overloads the thermal budget during heavy games like PUBG, Genshin Impact, or Call of Duty Mobile, triggering CPU throttling and dropped frames. ApexRec 720p 60 FPS operates inside the optimal thermal envelope.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1.5">
            <Gauge className="w-4 h-4" />
            <span>55% Lower Memory Bandwidth</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            720p processes 921,600 pixels per frame compared to 2,073,600 in 1080p. This leaves 55% more GPU memory bandwidth free for maintaining game FPS.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1.5">
            <Zap className="w-4 h-4" />
            <span>Zero-Buffer Direct Pipe</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Media streams bypass intermediate memory buffers and feed directly into the hardware H.264/VP8 encoder with 1000ms chunk streaming.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
            <BatteryCharging className="w-4 h-4" />
            <span>Thermal Throttling Protection</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            By preventing chip overheating, your device maintains high turbo clock speeds throughout extended gameplay sessions without FPS degradation.
          </p>
        </div>
      </div>

      {/* Pro-Tips for Android Gamers */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-200">Recommended Android Recording Setup:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Use the <strong>Mini Floating HUD</strong> overlay while playing in split screen or floating window.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Keep <strong>Eco Mode</strong> enabled to eliminate unnecessary preview redraws.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Select <strong>Game Audio</strong> for crisp sound without microphone ambient noise.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Videos automatically save to your device storage when you press Stop.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
