import { useEffect, useState } from 'react';

type Wuxing = '木' | '火' | '土' | '金' | '水';

const ELEMENTS: { name: Wuxing; color: string }[] = [
  { name: '木', color: '#4ADE80' },
  { name: '火', color: '#F87171' },
  { name: '土', color: '#F59E0B' },
  { name: '金', color: '#FCD34D' },
  { name: '水', color: '#60A5FA' },
];

interface WuxingPentagonProps {
  todayWuxing: Wuxing;
}

function getPentagonPoints(cx: number, cy: number, r: number) {
  return ELEMENTS.map((_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

const WuxingPentagon = ({ todayWuxing }: WuxingPentagonProps) => {
  const [visible, setVisible] = useState(false);
  const [lit, setLit] = useState(false);

  const todayIdx = ELEMENTS.findIndex(e => e.name === todayWuxing);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setLit(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const R = 75;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 19;

  return (
    <div
      style={{
        margin: '20px auto',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      <p style={{
        fontFamily: "'Noto Serif SC', Georgia, serif",
        fontSize: '14px',
        color: 'var(--gold)',
        marginBottom: '10px',
        letterSpacing: '3px',
        opacity: 0.6,
      }}>
        天机盘
      </p>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '170px', maxWidth: '60vw', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          {/* Glow filters for each element color */}
          {ELEMENTS.map((el, i) => (
            <filter key={`glow-${i}`} id={`wx-glow-${i}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor={el.color} floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
              <feMerge>
                <feMergeNode in="colorBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <marker id="wx-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5" fill="none" stroke="var(--gold)" strokeWidth="0.8" opacity="0.4" />
          </marker>
        </defs>

        {/* Pentagon outline */}
        <polygon
          points={pts.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.8"
          opacity="0.15"
        />

        {/* Edges with arrows */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = p.x + ux * (nodeR + 4);
          const y1 = p.y + uy * (nodeR + 4);
          const x2 = next.x - ux * (nodeR + 7);
          const y2 = next.y - uy * (nodeR + 7);
          return (
            <line
              key={`edge-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--gold)"
              strokeWidth="0.8"
              opacity="0.2"
              markerEnd="url(#wx-arrow)"
            />
          );
        })}

        {/* Element nodes */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const isActive = lit && i === todayIdx;
          const isDim = lit && i !== todayIdx;

          return (
            <g key={el.name} style={{ transition: 'opacity 0.4s ease' }}>
              {/* Breathing glow for active element */}
              {isActive && (
                <circle cx={p.x} cy={p.y} r={nodeR + 6} fill={el.color} opacity="0.25"
                  filter={`url(#wx-glow-${i})`}>
                  <animate attributeName="r" values={`${nodeR + 5};${nodeR + 10};${nodeR + 5}`} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.12;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Circle - ink wash style */}
              <circle
                cx={p.x} cy={p.y} r={nodeR}
                fill={el.color}
                opacity={isActive ? 0.7 : isDim ? 0.3 : 0.5}
                stroke="none"
                filter={isActive ? `url(#wx-glow-${i})` : undefined}
              />

              {/* Text */}
              <text
                x={p.x} y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="16"
                fontFamily="'Noto Serif SC', Georgia, serif"
                fontWeight={isActive ? 600 : 400}
                opacity={isDim ? 0.5 : 1}
              >
                {el.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WuxingPentagon;
