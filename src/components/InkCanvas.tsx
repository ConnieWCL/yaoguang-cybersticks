import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; alpha: number;
  decay: number; life: number;
}

export function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Static ink particles drifting upward
    const spawnParticle = () => {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.15),
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.25 + 0.05,
        decay: Math.random() * 0.0008 + 0.0003,
        life: 1,
      });
    };

    let frame = 0;
    const draw = (ts: number) => {
      timeRef.current = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn
      if (frame % 4 === 0) spawnParticle();
      frame++;

      // Draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        p.x += p.vx + Math.sin(ts * 0.001 + p.y * 0.01) * 0.15;
        p.y += p.vy;
        p.life -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 160, 100, ${p.alpha * p.life})`;
        ctx.fill();
      }

      // Subtle hexagram-inspired grid lines
      ctx.strokeStyle = 'rgba(180,155,80,0.03)';
      ctx.lineWidth = 0.5;
      const spacing = 80;
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);
return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        opacity: 0.8,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
  
}
