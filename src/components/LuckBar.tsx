import { useEffect, useState } from 'react';

interface LuckBarProps {
  label: string;
  value: number;       // 0-100
  color: string;
  icon?: string;
  delay?: number;
}

function gradeOf(value: number): string {
  if (value >= 88) return '极旺';
  if (value >= 72) return '旺';
  if (value >= 55) return '平';
  if (value >= 38) return '低';
  return '弱';
}

export function LuckBar({ label, value, color, icon, delay = 0 }: LuckBarProps) {
  const [visible, setVisible] = useState(false);
  const [filled,  setFilled]  = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    // 从 0 平滑流到目标值
    const t2 = setTimeout(() => setFilled(value), delay + 60);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [value, delay]);

  const grade = gradeOf(value);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 0',
      }}
    >
      {/* 标签 */}
      <div style={{
        width: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        flexShrink: 0,
      }}>
        {icon && (
          <span style={{
            fontSize: '12px',
            color: color,
            filter: `drop-shadow(0 0 5px ${color}80)`,
            lineHeight: 1,
          }}>{icon}</span>
        )}
        <span style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '13px',
          color: color,
          opacity: 0.85,
          letterSpacing: '0.05em',
          fontWeight: 500,
          textShadow: `0 0 6px ${color}40`,
        }}>{label}</span>
      </div>

      {/* 进度条 */}
      <div style={{
        flex: 1,
        height: '8px',
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.05)',
        border: '0.5px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 填充层 — 从 0 流到 value */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          height: '100%',
          width: `${filled}%`,
          background: `linear-gradient(90deg, ${color}55, ${color})`,
          boxShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
          borderRadius: '4px',
          transition: `width 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        }}>
          {/* 流动光泽 */}
          <div style={{
            position: 'absolute',
            top: 0, left: '-40%',
            width: '40%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
            animation: `lb-shimmer 2.4s ease-in-out ${delay + 600}ms infinite`,
          }} />
        </div>
      </div>

      {/* 等级文字 */}
      <span style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: '11px',
        color: color,
        opacity: filled > 0 ? 1 : 0,
        transition: `opacity 0.5s ease ${delay + 800}ms`,
        letterSpacing: '0.06em',
        textShadow: `0 0 8px ${color}60`,
        width: '28px',
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {grade}
      </span>

      <style>{`
        @keyframes lb-shimmer {
          0%   { left: -40%; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
