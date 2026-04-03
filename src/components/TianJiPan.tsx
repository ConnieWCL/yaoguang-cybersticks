import { useEffect, useState } from 'react';

/**
 * 天机盘 — Cosmic Wheel
 * A ritual SVG visualization showing the Eight Trigrams (八卦)
 * with a pointer indicating the current hexagram position.
 */

const BAGUA = [
  { name: '乾', symbol: '☰', element: '天', angle: 0 },
  { name: '兑', symbol: '☱', element: '泽', angle: 45 },
  { name: '离', symbol: '☲', element: '火', angle: 90 },
  { name: '震', symbol: '☳', element: '雷', angle: 135 },
  { name: '巽', symbol: '☴', element: '风', angle: 180 },
  { name: '坎', symbol: '☵', element: '水', angle: 225 },
  { name: '艮', symbol: '☶', element: '山', angle: 270 },
  { name: '坤', symbol: '☷', element: '地', angle: 315 },
];

interface TianJiPanProps {
  hexagramName: string;
  hexagram: string;
  guaIndex: number;
  level: string;
}

const TianJiPan = ({ hexagramName, hexagram, guaIndex, level }: TianJiPanProps) => {
  const [visible, setVisible] = useState(false);
  const [pointerAngle, setPointerAngle] = useState(0);

  // Find matching bagua or use guaIndex
  const targetIndex = BAGUA.findIndex(g => g.name === hexagramName);
  const activeIndex = targetIndex >= 0 ? targetIndex : guaIndex % 8;
  const targetAngle = BAGUA[activeIndex].angle;

  useEffect(() => {
    // Delayed entrance for ritual feel
    const t1 = setTimeout(() => setVisible(true), 300);
    // Pointer spins then lands
    const t2 = setTimeout(() => setPointerAngle(targetAngle), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [targetAngle]);

  const cx = 160, cy = 160, outerR = 130, innerR = 85, coreR = 42;

  // Level color accent
  const isAuspicious = ['大吉', '吉', '中吉'].includes(level);
  const accentColor = isAuspicious ? 'var(--gold)' : 'var(--jade)';

  return (
    <div
      className="flex items-center justify-center my-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0.6)',
        transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <svg viewBox="0 0 320 320" className="w-64 h-64 md:w-72 md:h-72" style={{ filter: 'drop-shadow(0 0 30px rgba(200,169,110,0.15))' }}>
        <defs>
          <radialGradient id="tj-core-grad" cx="50%" cy="45%">
            <stop offset="0%" stopColor="var(--overlay)" />
            <stop offset="100%" stopColor="var(--void)" />
          </radialGradient>
          <filter id="tj-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="tj-glow-strong">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR + 8} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.3" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />

        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.25"
          strokeDasharray="4 6" />

        {/* Radial lines */}
        {BAGUA.map((g, i) => {
          const rad = (g.angle - 90) * Math.PI / 180;
          const x1 = cx + innerR * Math.cos(rad);
          const y1 = cy + innerR * Math.sin(rad);
          const x2 = cx + outerR * Math.cos(rad);
          const y2 = cy + outerR * Math.sin(rad);
          const isActive = i === activeIndex;
          return (
            <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isActive ? 'var(--gold)' : 'var(--ink4)'}
              strokeWidth={isActive ? 1.5 : 0.5}
              opacity={isActive ? 0.8 : 0.3}
            />
          );
        })}

        {/* Bagua symbols on outer ring */}
        {BAGUA.map((g, i) => {
          const rad = (g.angle - 90) * Math.PI / 180;
          const midR = (innerR + outerR) / 2;
          const x = cx + midR * Math.cos(rad);
          const y = cy + midR * Math.sin(rad);
          const isActive = i === activeIndex;

          return (
            <g key={g.name} filter={isActive ? 'url(#tj-glow)' : undefined}>
              {/* Active highlight circle */}
              {isActive && (
                <>
                  <circle cx={x} cy={y} r="18" fill="rgba(200,169,110,0.08)" stroke="var(--gold)" strokeWidth="1" opacity="0.6">
                    <animate attributeName="r" from="16" to="22" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="16" fill="rgba(200,169,110,0.12)" stroke="var(--gold)" strokeWidth="0.8" />
                </>
              )}
              {/* Symbol */}
              <text x={x} y={y - 2} textAnchor="middle" dominantBaseline="central"
                fill={isActive ? 'var(--gold-lt)' : 'var(--ink3)'}
                fontSize={isActive ? 16 : 13}
                fontFamily="var(--serif)"
                opacity={isActive ? 1 : 0.6}
              >
                {g.symbol}
              </text>
              {/* Name label */}
              <text x={x} y={y + 12} textAnchor="middle"
                fill={isActive ? 'var(--gold)' : 'var(--ink4)'}
                fontSize="8"
                fontFamily="var(--serif)"
                opacity={isActive ? 0.9 : 0.4}
              >
                {g.name}
              </text>
            </g>
          );
        })}

        {/* Core circle */}
        <circle cx={cx} cy={cy} r={coreR} fill="url(#tj-core-grad)"
          stroke="var(--gold)" strokeWidth="1" opacity="0.8" />

        {/* Pointer needle */}
        <g
          style={{
            transform: `rotate(${pointerAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          filter="url(#tj-glow)"
        >
          {/* Needle body */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - innerR + 8}
            stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          {/* Needle tip */}
          <polygon
            points={`${cx},${cy - innerR + 4} ${cx - 4},${cy - innerR + 14} ${cx + 4},${cy - innerR + 14}`}
            fill={accentColor} opacity="0.9"
          />
          {/* Center pivot */}
          <circle cx={cx} cy={cy} r="4" fill={accentColor} opacity="0.9" />
        </g>

        {/* Center hexagram */}
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
          fill="var(--gold-lt)" fontSize="22"
          fontFamily="var(--serif)"
          filter="url(#tj-glow-strong)"
          style={{ textShadow: '0 0 16px rgba(200,169,110,0.5)' }}
        >
          {hexagram}
        </text>

        {/* Center label */}
        <text x={cx} y={cy + 16} textAnchor="middle"
          fill="var(--ink3)" fontSize="9"
          fontFamily="var(--mono)"
          letterSpacing="0.16em"
        >
          天机盘
        </text>

        {/* Outer decorative breathing ring */}
        <circle cx={cx} cy={cy} r={outerR + 14} fill="none" stroke="var(--gold)" strokeWidth="0.3" opacity="0.15">
          <animate attributeName="r" from={String(outerR + 10)} to={String(outerR + 20)} dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.2" to="0" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default TianJiPan;
