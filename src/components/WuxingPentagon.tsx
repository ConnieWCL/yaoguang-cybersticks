import { useEffect, useState } from 'react';

type Wuxing = '木' | '火' | '土' | '金' | '水';

const ELEMENTS: { name: Wuxing; color: string }[] = [
  { name: '木', color: '#4ADE80' },
  { name: '火', color: '#F87171' },
  { name: '土', color: '#F59E0B' },
  { name: '金', color: '#FCD34D' },
  { name: '水', color: '#1E3A5F' },
];

interface WuxingPentagonProps {
  todayWuxing: Wuxing;
  userWuxing?: Wuxing;
}

function getPentagonPoints(cx: number, cy: number, r: number) {
  return ELEMENTS.map((_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

const WuxingPentagon = ({ todayWuxing, userWuxing }: WuxingPentagonProps) => {
  const [visible, setVisible] = useState(false);
  const [litIndices, setLitIndices] = useState<number[]>([]);

  const todayIdx = ELEMENTS.findIndex(e => e.name === todayWuxing);
  const userIdx = userWuxing ? ELEMENTS.findIndex(e => e.name === userWuxing) : -1;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => {
      setLitIndices(prev => todayIdx >= 0 ? [...prev, todayIdx] : prev);
    }, 400);
    const t3 = setTimeout(() => {
      setLitIndices(prev => userIdx >= 0 ? [...prev, userIdx] : prev);
    }, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [todayIdx, userIdx]);

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const R = 55;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 15;

  const isUser = (i: number) => userIdx >= 0 && i === userIdx;
  const isToday = (i: number) => i === todayIdx;
  const isLit = (i: number) => litIndices.includes(i);

  return (
    <div
      style={{
        margin: '16px auto',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: '14px',
        color: 'var(--gold)',
        marginBottom: '8px',
        letterSpacing: '2px',
        opacity: 0.7,
      }}>
        五行气运
      </p>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '140px', maxWidth: '60vw', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          <filter id="wx-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="wx-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5" fill="none" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5" />
          </marker>
        </defs>

        {/* Pentagon outline */}
        <polygon
          points={pts.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Edges with arrows */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = p.x + ux * (nodeR + 3);
          const y1 = p.y + uy * (nodeR + 3);
          const x2 = next.x - ux * (nodeR + 6);
          const y2 = next.y - uy * (nodeR + 6);
          return (
            <line
              key={`edge-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--gold)"
              strokeWidth="1"
              opacity="0.3"
              markerEnd="url(#wx-arrow)"
            />
          );
        })}

        {/* Element nodes */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const lit = isLit(i);
          const user = isUser(i);
          const dim = !lit && litIndices.length > 0;
          const baseOpacity = dim ? 0.4 : 1;

          return (
            <g key={el.name} opacity={baseOpacity} style={{ transition: 'opacity 0.4s ease' }}>
              {/* User glow breathing ring */}
              {user && lit && (
                <circle cx={p.x} cy={p.y} r={nodeR + 4} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"
                  filter="url(#wx-glow)">
                  <animate attributeName="r" values={`${nodeR + 3};${nodeR + 7};${nodeR + 3}`} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Circle */}
              <circle
                cx={p.x} cy={p.y} r={nodeR}
                fill={el.color}
                opacity={lit ? 0.9 : 0.5}
                stroke={user && lit ? 'white' : 'var(--gold)'}
                strokeWidth={user && lit ? 2 : 0.5}
                filter={user && lit ? 'url(#wx-glow)' : undefined}
              />

              {/* Text */}
              <text
                x={p.x} y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="16"
                fontFamily="var(--serif)"
                fontWeight={lit ? 600 : 400}
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
