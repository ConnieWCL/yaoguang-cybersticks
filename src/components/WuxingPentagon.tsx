import { useEffect, useState } from 'react';

/**
 * 五行正五边形 — Wuxing Pentagon
 * Displays the Five Elements in a regular pentagon with directional arrows.
 */

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

/** Get vertices of a regular pentagon, top-centered, clockwise */
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
    }, 700);
    const t3 = setTimeout(() => {
      setLitIndices(prev => userIdx >= 0 ? [...prev, userIdx] : prev);
    }, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [todayIdx, userIdx]);

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const R = 90;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 22;

  const isUser = (i: number) => userIdx >= 0 && i === userIdx;
  const isToday = (i: number) => i === todayIdx;
  const isLit = (i: number) => litIndices.includes(i);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        margin: '24px auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-[60vw] max-w-[260px] h-auto"
      >
        <defs>
          {/* Glow filter for user element */}
          <filter id="wx-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arrow marker */}
          <marker id="wx-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.35" />
          </marker>
        </defs>

        {/* Pentagon outline */}
        <polygon
          points={pts.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.5"
          opacity="0.15"
        />

        {/* Edges with arrows (相生: 木→火→土→金→水→木) */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          // Shorten line to not overlap circles
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = p.x + ux * (nodeR + 4);
          const y1 = p.y + uy * (nodeR + 4);
          const x2 = next.x - ux * (nodeR + 8);
          const y2 = next.y - uy * (nodeR + 8);
          return (
            <line
              key={`edge-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--gold)"
              strokeWidth="0.8"
              opacity="0.25"
              markerEnd="url(#wx-arrow)"
            />
          );
        })}

        {/* Element nodes */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const lit = isLit(i);
          const user = isUser(i);
          const today = isToday(i);
          const dim = !lit && litIndices.length > 0;
          const baseOpacity = dim ? 0.3 : 1;

          return (
            <g key={el.name} opacity={baseOpacity} style={{ transition: 'opacity 0.4s ease' }}>
              {/* User glow breathing ring */}
              {user && lit && (
                <circle cx={p.x} cy={p.y} r={nodeR + 6} fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"
                  filter="url(#wx-glow)">
                  <animate attributeName="r" values={`${nodeR + 4};${nodeR + 10};${nodeR + 4}`} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Circle background */}
              <circle
                cx={p.x} cy={p.y} r={nodeR}
                fill={el.color}
                opacity={lit ? 0.9 : 0.5}
                stroke={user && lit ? 'white' : 'var(--gold)'}
                strokeWidth={user && lit ? 2.5 : 0.5}
                filter={user && lit ? 'url(#wx-glow)' : undefined}
              />

              {/* Text label */}
              <text
                x={p.x} y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={el.name === '水' ? '#CBD5E1' : (lit ? '#1a1a1a' : '#888')}
                fontSize="14"
                fontFamily="var(--serif)"
                fontWeight={lit ? 600 : 400}
              >
                {el.name}
              </text>

              {/* Subtle label for today */}
              {today && lit && !user && (
                <text x={p.x} y={p.y + nodeR + 12} textAnchor="middle"
                  fill="var(--ink3)" fontSize="8" fontFamily="var(--mono)">
                  今日
                </text>
              )}
              {user && lit && (
                <text x={p.x} y={p.y + nodeR + 12} textAnchor="middle"
                  fill="var(--gold)" fontSize="8" fontFamily="var(--mono)">
                  命主
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
