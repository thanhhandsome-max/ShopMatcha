'use client';

import { useEffect, useRef } from 'react';

interface ParticleConfig {
  count: number;
  fallSpeed: number;
  baseSize: number;
  windStrength: number;
}

function normalise(cfg: ParticleConfig) {
  return {
    fallSpeed:    cfg.fallSpeed    * 0.18,
    baseSize:     cfg.baseSize     * 0.9,
    windStrength: cfg.windStrength * 0.12,
  };
}

class MatchaParticle {
  canvas: HTMLCanvasElement;
  cfg: ReturnType<typeof normalise>;
  x = 0; y = 0; radius = 0;
  speedY = 0; speedX = 0;
  wobbleFreq = 0; wobbleAmp = 0; wobbleOff = 0;
  rotation = 0; rotSpeed = 0;
  opacity = 0; opacityPulse = 0;
  shape = 0; color = ''; tick = 0;

  constructor(canvas: HTMLCanvasElement, cfg: ReturnType<typeof normalise>, initial = false) {
    this.canvas = canvas;
    this.cfg = cfg;
    this.reset(initial);
  }

  reset(initial = false) {
    const { canvas, cfg } = this;
    this.x          = Math.random() * canvas.width;
    this.y          = initial ? Math.random() * canvas.height : -20;
    const sizeVar   = 0.5 + Math.random() * 1.2;
    this.radius     = cfg.baseSize * sizeVar;
    this.speedY     = (0.5 + Math.random() * 0.8) * cfg.fallSpeed;
    this.speedX     = (Math.random() - 0.5) * cfg.windStrength;
    this.wobbleFreq = 0.008 + Math.random() * 0.015;
    this.wobbleAmp  = 0.3   + Math.random() * 1.2;
    this.wobbleOff  = Math.random() * Math.PI * 2;
    this.rotation   = Math.random() * Math.PI * 2;
    this.rotSpeed   = (Math.random() - 0.5) * 0.04;
    this.opacity      = 0.25 + Math.random() * 0.5;
    this.opacityPulse = (Math.random() - 0.5) * 0.002;
    this.shape = Math.floor(Math.random() * 3);
    this.tick  = 0;
    const hue   = 115 + Math.floor(Math.random() * 30);
    const sat   = 45  + Math.floor(Math.random() * 30);
    const light = 38  + Math.floor(Math.random() * 22);
    this.color  = `hsl(${hue},${sat}%,${light}%)`;
  }

  update() {
    this.tick++;
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.tick * this.wobbleFreq + this.wobbleOff) * this.wobbleAmp;
    this.rotation += this.rotSpeed;
    this.opacity  += this.opacityPulse;
    if (this.opacity > 0.75 || this.opacity < 0.2) this.opacityPulse *= -1;
    if (this.x < -20)                    this.x = this.canvas.width + 10;
    if (this.x > this.canvas.width + 20) this.x = -10;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle   = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (this.shape === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 1) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const r = this.radius * (0.7 + Math.random() * 0.3);
        i === 0
          ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
          : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 0.6, this.radius * 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  isOffScreen() {
    return this.y > this.canvas.height + 30;
  }
}

const CONFIG: ParticleConfig = {
  count:        120,
  fallSpeed:    6,
  baseSize:     3,
  windStrength: 5,
};

export default function MatchaParticles() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<MatchaParticle[]>([]);
  const animIdRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = normalise(CONFIG);

    function resize() {
      // ✅ Bám vào parent (hero section), KHÔNG dùng window.innerWidth/Height
      const parent = canvas!.parentElement;
      if (parent) {
        canvas!.width  = parent.offsetWidth;
        canvas!.height = parent.offsetHeight;
      }
    }

    function spawnAll() {
      particlesRef.current = Array.from(
        { length: CONFIG.count },
        () => new MatchaParticle(canvas!, n, true),
      );
    }

    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particlesRef.current.forEach(p => {
        p.update();
        p.draw(ctx!);
        if (p.isOffScreen()) p.reset(false);
      });
      animIdRef.current = requestAnimationFrame(tick);
    }

    resize();
    spawnAll();
    tick();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', 
        top: 0,
        left: 0,
        width: '100%',        
        height: '100%',       
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}