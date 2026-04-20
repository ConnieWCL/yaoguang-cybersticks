import { useEffect, useState } from 'react';

interface LuckBarProps {
  label: string;
  value: number;
  color: string;
  icon?: string;
  delay?: number;
}

export function LuckBar({ label, value, color, icon, delay = 0 }: LuckBarProps) {
  const [filled, setFilled] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    const t2 = setTimeout(() => setFilled(value), delay + 100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [value, delay]);

  const gradeLabel = value >= 85 ? '极旺' : value >= 70 ? '旺' : value >= 55 ? '平' : '低';

  // 10 段刻度
  const segments = 10;
  const filledSegs = Math.round((filled / 100) * segments);

  return (
    <div
      className="luck-bar-row-v2"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="luck-bar-head">
        <span className="luck-bar-label" style={{ color }}>
          {icon && <span className="luck-bar-icon" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>{icon}</span>}
          {label}
        </span>
        <span className="luck-bar-grade" style={{
          color,
          textShadow: `0 0 8px ${color}80`,
        }}>
          {gradeLabel}
          <span className="luck-bar-num" style={{ color }}>{value}</span>
        </span>
      </div>
      <div className="luck-bar-segments">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="luck-seg"
            style={{
              background: i < filledSegs ? color : 'rgba(255,255,255,0.05)',
              boxShadow: i < filledSegs ? `0 0 8px ${color}, 0 0 2px ${color}` : 'none',
              opacity: i < filledSegs ? 0.9 : 1,
              transitionDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
