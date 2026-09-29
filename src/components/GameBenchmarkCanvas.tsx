import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Trophy, Flame } from 'lucide-react';

interface GameBenchmarkCanvasProps {
  onCanvasStreamReady?: (stream: MediaStream) => void;
  isRecording: boolean;
}

export const GameBenchmarkCanvas: React.FC<GameBenchmarkCanvasProps> = ({
  onCanvasStreamReady,
  isRecording,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [gameScore, setGameScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [engineFps, setEngineFps] = useState<number>(60);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);

  // Game internal state
  const gameStateRef = useRef({
    playerX: 640,
    playerY: 600,
    playerTargetX: 640,
    speed: 7,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }>,
    obstacles: [] as Array<{ x: number; y: number; size: number; speed: number; rot: number; color: string; type: 'rock' | 'energy' }>,
    stars: [] as Array<{ x: number; y: number; speed: number; size: number; opacity: number }>,
    lastTime: performance.now(),
    frameCount: 0,
    fpsTimer: performance.now(),
    score: 0,
  });

  // Setup Stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        speed: 1 + Math.random() * 3,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    gameStateRef.current.stars = stars;
  }, []);

  // Expose stream
  useEffect(() => {
    if (canvasRef.current && onCanvasStreamReady) {
      try {
        const stream = canvasRef.current.captureStream(60);
        onCanvasStreamReady(stream);
      } catch (e) {
        console.warn('Canvas captureStream error:', e);
      }
    }
  }, [onCanvasStreamReady]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let running = isPlaying;

    const loop = (timestamp: number) => {
      if (!running) return;

      const state = gameStateRef.current;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.1);
      state.lastTime = timestamp;

      // Update FPS counter
      state.frameCount++;
      if (timestamp - state.fpsTimer >= 500) {
        const measured = (state.frameCount * 1000) / (timestamp - state.fpsTimer);
        setEngineFps(Math.round(measured));
        state.frameCount = 0;
        state.fpsTimer = timestamp;
      }

      // Smooth player interpolation towards target
      state.playerX += (state.playerTargetX - state.playerX) * 0.18;
      // Boundaries
      state.playerX = Math.max(80, Math.min(1200, state.playerX));

      // Spawn obstacles / gems
      if (Math.random() < 0.04) {
        const isEnergy = Math.random() < 0.35;
        state.obstacles.push({
          x: 100 + Math.random() * 1080,
          y: -40,
          size: isEnergy ? 18 : 28 + Math.random() * 20,
          speed: (isEnergy ? 5 : 6 + Math.random() * 3) + (isBoosting ? 4 : 0),
          rot: Math.random() * Math.PI * 2,
          color: isEnergy ? '#10b981' : '#f43f5e',
          type: isEnergy ? 'energy' : 'rock',
        });
      }

      // Spawn engine thruster particles
      for (let p = 0; p < (isBoosting ? 4 : 2); p++) {
        state.particles.push({
          x: state.playerX + (Math.random() * 20 - 10),
          y: state.playerY + 28,
          vx: (Math.random() - 0.5) * 2,
          vy: 4 + Math.random() * 4 + (isBoosting ? 5 : 0),
          life: 1.0,
          color: isBoosting ? '#06b6d4' : '#f59e0b',
          size: 3 + Math.random() * 3,
        });
      }

      // CLEAR CANVAS (Deep Space Navy #080c14)
      ctx.fillStyle = '#070a12';
      ctx.fillRect(0, 0, 1280, 720);

      // Cyber Grid Horizon Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1280; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }
      for (let y = 0; y < 720; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      // Draw Stars
      for (const s of state.stars) {
        s.y += s.speed * (isBoosting ? 2.5 : 1);
        if (s.y > 720) {
          s.y = 0;
          s.x = Math.random() * 1280;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      // Update & Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= dt * 2.2;
        if (pt.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Update & Draw Obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.y += obs.speed;
        obs.rot += 0.03;

        // Collision check
        const dx = obs.x - state.playerX;
        const dy = obs.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < obs.size + 24) {
          if (obs.type === 'energy') {
            // Gem collected!
            state.score += 150 * combo;
            setGameScore(state.score);
            setCombo((c) => Math.min(c + 1, 8));
            // Sparkle burst
            for (let b = 0; b < 10; b++) {
              state.particles.push({
                x: obs.x,
                y: obs.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                color: '#10b981',
                size: 4,
              });
            }
          } else {
            // Rock collision
            state.score = Math.max(0, state.score - 50);
            setGameScore(state.score);
            setCombo(1);
            // Explosion particles
            for (let b = 0; b < 12; b++) {
              state.particles.push({
                x: obs.x,
                y: obs.y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                life: 1.0,
                color: '#f43f5e',
                size: 5,
              });
            }
          }
          state.obstacles.splice(i, 1);
          continue;
        }

        if (obs.y > 760) {
          if (obs.type === 'rock') {
            state.score += 10;
            setGameScore(state.score);
          }
          state.obstacles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rot);

        if (obs.type === 'energy') {
          // Glowing Diamond
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, -obs.size);
          ctx.lineTo(obs.size, 0);
          ctx.lineTo(0, obs.size);
          ctx.lineTo(-obs.size, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Cyber Asteroid Polygon
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          const sides = 6;
          for (let s = 0; s < sides; s++) {
            const angle = (s * Math.PI * 2) / sides;
            const r = obs.size * (s % 2 === 0 ? 1 : 0.82);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Player Ship (Sleek Cyber Jet)
      ctx.save();
      ctx.translate(state.playerX, state.playerY);

      // Jet Glow
      ctx.shadowColor = isBoosting ? '#06b6d4' : '#38bdf8';
      ctx.shadowBlur = 16;

      // Cockpit & Wings
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -28); // Tip
      ctx.lineTo(26, 24); // Right wing
      ctx.lineTo(12, 18);
      ctx.lineTo(0, 22);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-26, 24); // Left wing
      ctx.closePath();
      ctx.fill();

      // Canopy
      ctx.fillStyle = isBoosting ? '#67e8f9' : '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(0, 2, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Top Benchmark HUD inside Canvas for recording proof
      ctx.font = '600 15px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`APEX 60FPS BENCHMARK · 1280x720`, 24, 38);

      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`${engineFps} FPS`, 24, 66);

      if (isRecording) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(120, 60, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`REC`, 134, 65);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, isBoosting, isRecording, combo]);

  // Touch and Mouse Handling for responsive Android touch
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    gameStateRef.current.playerTargetX = clientX * scaleX;
  }, []);

  const resetGame = () => {
    gameStateRef.current.score = 0;
    gameStateRef.current.obstacles = [];
    gameStateRef.current.particles = [];
    gameStateRef.current.playerX = 640;
    gameStateRef.current.playerTargetX = 640;
    setGameScore(0);
    setCombo(1);
  };

  return (
    <div className="w-full flex flex-col bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Game Benchmark Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Interactive 60 FPS Gameplay Canvas</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-emerald-400">{engineFps} FPS Lock</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>{gameScore}</span>
            {combo > 1 && <span className="text-emerald-400 text-[10px]">x{combo}</span>}
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isPlaying ? 'Pause Game' : 'Resume Game'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 720p Native Aspect Ratio Canvas Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onPointerMove={handlePointerMove}
          onPointerDown={() => setIsBoosting(true)}
          onPointerUp={() => setIsBoosting(false)}
          onPointerLeave={() => setIsBoosting(false)}
          className="w-full h-full object-contain touch-none"
        />

        {/* Floating guidance overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none text-xs text-slate-400/80 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
          <span>Drag/Touch finger left & right to steer · Hold down for Hyper Boost</span>
          <div className="flex items-center gap-1 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Target: 720p @ 60 FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
