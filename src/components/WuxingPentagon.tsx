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
    const t2 = setTimeout(() => setLit(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const R = 110;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 28;

  return (
    <div
      style={{
        margin: '20px auto',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '260px', maxWidth: '70vw', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          {ELEMENTS.map((el, i) => (
            <filter key={`glow-${i}`} id={`wx-glow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor={el.color} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
              <feMerge>
                <feMergeNode in="colorBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <marker id="wx-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.35" />
          </marker>
        </defs>

        {/* Edges with arrows — dashed lines */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = p.x + ux * (nodeR + 6);
          const y1 = p.y + uy * (nodeR + 6);
          const x2 = next.x - ux * (nodeR + 9);
          const y2 = next.y - uy * (nodeR + 9);
          return (
            <line
              key={`edge-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--gold)"
              strokeWidth="1"
              opacity="0.18"
              strokeDasharray="4 3"
              markerEnd="url(#wx-arrow)"
            />
          );
        })}

        {/* Center label */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--gold)"
          fontSize="13"
          fontFamily="'Noto Serif SC', Georgia, serif"
          opacity="0.45"
          letterSpacing="4"
        >
          天机盘
        </text>
        <text
          x={cx} y={cy + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--gold)"
          fontSize="10"
          fontFamily="'Noto Serif SC', Georgia, serif"
          opacity="0.3"
          letterSpacing="2"
        >
          五行气运
        </text>

        {/* Element nodes */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const isActive = lit && i === todayIdx;
          const isDim = lit && i !== todayIdx;

          return (
            <g key={el.name}>
              {/* Breathing outer glow for active */}
              {isActive && (
                <>
                  <circle cx={p.x} cy={p.y} r={nodeR + 10} fill="none"
                    stroke={el.color} strokeWidth="1.5" opacity="0.3"
                    filter={`url(#wx-glow-${i})`}>
                    <animate attributeName="r" values={`${nodeR + 8};${nodeR + 14};${nodeR + 8}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.12;0.35" dur="3s" repeatCount="indefinite" />
                  </circle>
                  {/* Ring border */}
                  <circle cx={p.x} cy={p.y} r={nodeR + 3}
                    fill="none" stroke={el.color} strokeWidth="2" opacity="0.6" />
                </>
              )}

              {/* Main circle */}
              <circle
                cx={p.x} cy={p.y} r={nodeR}
                fill={el.color}
                opacity={isActive ? 0.75 : isDim ? 0.25 : 0.45}
                stroke="none"
                style={{ transition: 'opacity 0.5s ease' }}
              />

              {/* Text */}
              <text
                x={p.x} y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="18"
                fontFamily="'Noto Serif SC', Georgia, serif"
                fontWeight={isActive ? 600 : 400}
                opacity={isDim ? 0.4 : 1}
                style={{ transition: 'opacity 0.5s ease' }}
              >
                {el.name}
              </text>

              {/* "日主当令" label for active */}
              {isActive && (
                <text
                  x={p.x} y={p.y + nodeR + 16}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={el.color}
                  fontSize="10"
                  fontFamily="'Noto Serif SC', Georgia, serif"
                  opacity="0.7"
                >
                  日主当令
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WuxingPentagon;
