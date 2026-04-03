import { useEffect, useState } from 'react';

type Wuxing = '木' | '火' | '土' | '金' | '水';

const ELEMENTS: { name: Wuxing; color: string }[] = [
  { name: '木', color: '#5B8C5A' },   // 竹青，沉稳
  { name: '火', color: '#C75050' },   // 朱砂赤
  { name: '土', color: '#A0784C' },   // 赭石，偏暖棕
  { name: '金', color: '#C0C0C0' },   // 银白，区别于土
  { name: '水', color: '#4A7FB5' },   // 靛蓝
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

// 相生顺序: 木→火→土→金→水→木 (already the array order)
// 相克顺序: 木→土, 土→水, 水→火, 火→金, 金→木
const KELINES: [number, number][] = [
  [0, 2], // 木克土
  [2, 4], // 土克水
  [4, 1], // 水克火
  [1, 3], // 火克金
  [3, 0], // 金克木
];

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
  const cy = size / 2 + 4;
  const R = 108;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 26;

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
        style={{ width: '250px', maxWidth: '68vw', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          {ELEMENTS.map((el, i) => (
            <filter key={`glow-${i}`} id={`wx-glow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feFlood floodColor={el.color} floodOpacity="0.45" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
              <feMerge>
                <feMergeNode in="colorBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* 相生箭头 — 淡金 */}
          <marker id="wx-sheng" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0.5 L4.5,2.5 L0,4.5" fill="none" stroke="var(--gold)" strokeWidth="0.8" opacity="0.3" />
          </marker>
          {/* 相克箭头 — 淡红 */}
          <marker id="wx-ke" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0.5 L4.5,2.5 L0,4.5" fill="none" stroke="#B85C4A" strokeWidth="0.8" opacity="0.25" />
          </marker>
        </defs>

        {/* 相生线 — 五边形边，实线淡金 */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = p.x + ux * (nodeR + 5);
          const y1 = p.y + uy * (nodeR + 5);
          const x2 = next.x - ux * (nodeR + 8);
          const y2 = next.y - uy * (nodeR + 8);
          return (
            <line
              key={`sheng-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--gold)"
              strokeWidth="0.8"
              opacity="0.15"
              markerEnd="url(#wx-sheng)"
            />
          );
        })}

        {/* 相克线 — 对角虚线，淡赭红 */}
        {KELINES.map(([from, to], i) => {
          const p = pts[from];
          const q = pts[to];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = p.x + ux * (nodeR + 5);
          const y1 = p.y + uy * (nodeR + 5);
          const x2 = q.x - ux * (nodeR + 8);
          const y2 = q.y - uy * (nodeR + 8);
          return (
            <line
              key={`ke-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#B85C4A"
              strokeWidth="0.6"
              opacity="0.1"
              strokeDasharray="3 4"
              markerEnd="url(#wx-ke)"
            />
          );
        })}

        {/* Center label */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--gold)"
          fontSize="12"
          fontFamily="'Noto Serif SC', Georgia, serif"
          opacity="0.4"
          letterSpacing="5"
        >
          天机盘
        </text>
        <text
          x={cx} y={cy + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--gold)"
          fontSize="9"
          fontFamily="'Noto Serif SC', Georgia, serif"
          opacity="0.25"
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
              {/* Breathing glow ring for active */}
              {isActive && (
                <circle cx={p.x} cy={p.y} r={nodeR + 10} fill="none"
                  stroke={el.color} strokeWidth="1.2" opacity="0.25"
                  filter={`url(#wx-glow-${i})`}>
                  <animate attributeName="r" values={`${nodeR + 8};${nodeR + 14};${nodeR + 8}`} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Subtle ring for active */}
              {isActive && (
                <circle cx={p.x} cy={p.y} r={nodeR + 2}
                  fill="none" stroke={el.color} strokeWidth="1.5" opacity="0.5" />
              )}

              {/* Main circle — ink wash fill */}
              <circle
                cx={p.x} cy={p.y} r={nodeR}
                fill={el.color}
                opacity={isActive ? 0.8 : isDim ? 0.22 : 0.4}
                stroke="none"
                style={{ transition: 'opacity 0.5s ease' }}
              />

              {/* Character */}
              <text
                x={p.x} y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="16"
                fontFamily="'Noto Serif SC', Georgia, serif"
                fontWeight={isActive ? 600 : 400}
                opacity={isDim ? 0.35 : 0.95}
                style={{ transition: 'opacity 0.5s ease' }}
              >
                {el.name}
              </text>

              {/* Label under active node */}
              {isActive && (
                <text
                  x={p.x} y={p.y + nodeR + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={el.color}
                  fontSize="9"
                  fontFamily="'Noto Serif SC', Georgia, serif"
                  opacity="0.6"
                  letterSpacing="1"
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
