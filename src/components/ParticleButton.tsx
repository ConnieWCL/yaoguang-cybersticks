import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface ParticleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  /** Suffix shown small/right (e.g. count "3 / 64", or "还剩 2 次") */
  suffix?: ReactNode;
  /** Leading decorative icon */
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 统一的金色粒子按钮 — 用于"分享签文 / 再抽一签 / 我的签文册"
 * primary = 实心金色发光 (主按钮)
 * secondary = 半透明金色 (次按钮)
 */
export function ParticleButton({
  children,
  onClick,
  disabled,
  variant = 'secondary',
  suffix,
  icon,
  className = '',
  style,
}: ParticleButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animId = useRef<number>(0);

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    const COUNT = variant === 'primary' ? 22 : 14;
    const baseAlpha = variant === 'primary' ? 0.85 : 0.55;
    const baseR = variant === 'primary' ? 1.4 : 1.0;

    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.35 + 0.1),
      r: Math.random() * baseR + 0.3,
      alpha: Math.random() * baseAlpha + 0.15,
      life: Math.random(),
      decay: Math.random() * 0.005 + 0.0025,
    }));

    const draw = () => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx + Math.sin(Date.now() * 0.0009 + p.y) * 0.06;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.y < -4) {
          p.x = Math.random() * w;
          p.y = h + 4;
          p.life = 1;
          p.vy = -(Math.random() * 0.35 + 0.1);
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,200,138,${p.alpha * p.life})`;
        ctx.fill();
      });
      animId.current = requestAnimationFrame(draw);
    };
    animId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId.current);
      ro.disconnect();
    };
  }, [variant, disabled]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`pbtn pbtn-${variant} ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className="pbtn-particles" />
      <span className="pbtn-content">
        <span className="pbtn-label">{children}</span>
        {(suffix || icon) && (
          <span className="pbtn-suffix">
            {icon && <span className="pbtn-suffix-icon">{icon}</span>}
            {suffix}
          </span>
        )}
      </span>
    </button>
  );
}
