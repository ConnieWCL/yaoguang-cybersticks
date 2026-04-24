import { useEffect, useState } from 'react';

interface LuckBarProps {
  label: string;
  value: number;
  color: string;
  icon?: string;
  delay?: number;
}

// 把数值映射成 0-5 格的符文点数
function toSegments(value: number): number {
  if (value >= 88) return 5;
  if (value >= 72) return 4;
  if (value >= 55) return 3;
  if (value >= 38) return 2;
  return 1;
}

const GRADE_LABELS = ['', '低', '低', '平', '旺', '极旺'];
const TOTAL = 5;

export function LuckBar({ label, value, color, icon, delay = 0 }: LuckBarProps) {
  const [lit,     setLit]     = useState(0);
  const [visible, setVisible] = useState(false);
  const segments = toSegments(value);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    // 逐格点亮动效
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setLit(count);
      if (count >= segments) clearInterval(interval);
    }, 120);
    const t2 = setTimeout(() => {}, delay + 100); // trigger after delay
    const t3 = setTimeout(() => {
      // restart after delay
      setLit(0);
      let c = 0;
      const iv = setInterval(() => {
        c++;
        setLit(c);
        if (c >= segments) clearInterval(iv);
      }, 110);
    }, delay + 80);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [value, delay, segments]);

  const grade = GRADE_LABELS[segments] || '平';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 0',
      }}
    >
      {/* 标签 */}
      <div style={{
        width: '38px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
      }}>
        {icon && (
          <span style={{
            fontSize: '12px',
            filter: `drop-shadow(0 0 5px ${color})`,
            lineHeight: 1,
          }}>{icon}</span>
        )}
        <span style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '13px',
          color: 'rgba(200,169,110,0.7)',
          letterSpacing: '0.05em',
          fontWeight: 500,
        }}>{label}</span>
      </div>

      {/* 符文方块组 */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
      }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const isLit = i < lit;
          const isToday = i === segments - 1 && lit >= segments; // 最后一格特效
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '2px',
                background: isLit
                  ? `linear-gradient(90deg, ${color}88, ${color})`
                  : 'rgba(255,255,255,0.06)',
                boxShadow: isLit
                  ? `0 0 8px ${color}90, 0 0 16px ${color}40`
                  : 'none',
                border: isLit
                  ? `0.5px solid ${color}60`
                  : '0.5px solid rgba(255,255,255,0.08)',
                transition: `background 0.2s ease ${i * 0.08}s, box-shadow 0.2s ease ${i * 0.08}s`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 光泽扫过效果 — 仅点亮格 */}
              {isLit && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: '-100%',
                  width: '60%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                  animation: `shimmer 2.5s ease-in-out ${i * 0.15 + delay * 0.001}s infinite`,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 等级文字 */}
      <span style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: '11px',
        color: color,
        opacity: lit >= segments ? 1 : 0,
        transition: 'opacity 0.4s ease',
        letterSpacing: '0.06em',
        textShadow: `0 0 8px ${color}60`,
        width: '24px',
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {grade}
      </span>

      <style>{`
        @keyframes shimmer {
          0%   { left: -60%; opacity: 0; }
          20%  { opacity: 1; }
          60%  { left: 110%; opacity: 0; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
