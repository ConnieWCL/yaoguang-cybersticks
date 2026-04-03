import { useEffect, useRef, useState } from 'react';

interface LuckBarProps {
  label: string;
  value: number;
  color: string;
  delay?: number;
}

export function LuckBar({ label, value, color, delay = 0 }: LuckBarProps) {
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
      className="luck-bar-row"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <span className="luck-label">{label}</span>
      <div className="luck-track">
        <div
          className="luck-fill"
          style={{
            width: `${filled}%`,
            background: color,
            transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
      <span className="luck-grade" style={{ color }}>{gradeLabel}</span>
    </div>
  );
}
