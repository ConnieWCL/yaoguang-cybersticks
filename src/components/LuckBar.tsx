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
      <div className="luck-bar-track">
        <div
          className="luck-bar-fill"
          style={{
            width: `${filled}%`,
            background: `linear-gradient(90deg, ${color}55, ${color} 60%, ${color})`,
            boxShadow: `0 0 10px ${color}, 0 0 18px ${color}80`,
          }}
        >
          <span className="luck-bar-shine" />
        </div>
      </div>
    </div>
  );
}
