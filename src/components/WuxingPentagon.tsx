import { useEffect, useState } from 'react';

type Wuxing = '木' | '火' | '土' | '金' | '水';

const ELEMENTS: { name: Wuxing; color: string; colorLight: string }[] = [
  { name: '木', color: '#5B8C5A', colorLight: '#9DD49B' },
  { name: '火', color: '#C75050', colorLight: '#FF8B7B' },
  { name: '土', color: '#A0784C', colorLight: '#E8B27A' },
  { name: '金', color: '#C0C0C0', colorLight: '#F0F0F0' },
  { name: '水', color: '#4A7FB5', colorLight: '#7EB8E8' },
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
  const cy = size / 2 + 4;
  const R = 105;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 28;

  // 相生路径（圆滑曲线 — 五边形外圈）
  const shengPath = pts
    .map((p, i) => {
      const next = pts[(i + 1) % 5];
      const mx = (p.x + next.x) / 2;
      const my = (p.y + next.y) / 2;
      // 略微外凸
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const nx = -dy * 0.08;
      const ny = dx * 0.08;
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} Q ${mx + nx} ${my + ny}, ${next.x} ${next.y}`;
    })
    .join(' ') + ' Z';

  return (
    <div
      style={{
        margin: '24px auto',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '270px', maxWidth: '74vw', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          {ELEMENTS.map((el, i) => (
            <radialGradient key={`grad-${i}`} id={`wx-grad-${i}`} cx="35%" cy="30%" r="75%">
              <stop offset="0%"   stopColor={el.colorLight} stopOpacity="1" />
              <stop offset="55%"  stopColor={el.color}      stopOpacity="0.95" />
              <stop offset="100%" stopColor={el.color}      stopOpacity="0.55" />
            </radialGradient>
          ))}
          {ELEMENTS.map((el, i) => (
            <filter key={`glow-${i}`} id={`wx-glow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor={el.colorLight} floodOpacity="0.7" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
              <feMerge>
                <feMergeNode in="colorBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <radialGradient id="wx-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8A96E" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#C8A96E" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#C8A96E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 中心柔光 */}
        <circle cx={cx} cy={cy} r={R + 8} fill="url(#wx-center-glow)" />

        {/* 相生 — 圆滑曲线五边形 */}
        <path
          d={shengPath}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.22"
        />

        {/* 中心标题 */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fill="var(--gold)" fontSize="13" fontFamily="'ZCOOL XiaoWei', 'Noto Serif SC', serif"
          opacity="0.5" letterSpacing="6">天机盘</text>

        {/* 节点 */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const isActive = lit && i === todayIdx;
          const isDim = lit && i !== todayIdx;

          return (
            <g key={el.name}>
              {/* 外层呼吸光环 — 仅 today */}
              {isActive && (
                <>
                  <circle cx={p.x} cy={p.y} r={nodeR + 16} fill="none"
                    stroke={el.colorLight} strokeWidth="0.8" opacity="0.35">
                    <animate attributeName="r" values={`${nodeR + 14};${nodeR + 22};${nodeR + 14}`} dur="3.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={p.x} cy={p.y} r={nodeR + 8} fill="none"
                    stroke={el.colorLight} strokeWidth="1.2" opacity="0.5">
                    <animate attributeName="r" values={`${nodeR + 6};${nodeR + 12};${nodeR + 6}`} dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* 主节点 — 渐变球 */}
              <circle cx={p.x} cy={p.y} r={nodeR}
                fill={`url(#wx-grad-${i})`}
                opacity={isActive ? 1 : isDim ? 0.32 : 0.55}
                filter={isActive ? `url(#wx-glow-${i})` : undefined}
                style={{ transition: 'opacity 0.6s ease' }}
              />

              {/* 高光 — 顶部小光斑 */}
              <ellipse cx={p.x - 6} cy={p.y - 9} rx="9" ry="5"
                fill="white"
                opacity={isActive ? 0.4 : isDim ? 0.08 : 0.18}
                style={{ transition: 'opacity 0.6s ease' }}
              />

              {/* 文字 */}
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize="17" fontFamily="'ZCOOL XiaoWei', 'Noto Serif SC', serif"
                fontWeight={isActive ? 700 : 500}
                opacity={isDim ? 0.45 : 1}
                style={{ transition: 'opacity 0.6s ease', letterSpacing: '0.04em' }}>
                {el.name}
              </text>

              {/* 今日旺气 标签 */}
              {isActive && (
                <text x={p.x} y={p.y + nodeR + 16} textAnchor="middle" dominantBaseline="central"
                  fill={el.colorLight} fontSize="10" fontFamily="'Noto Serif SC', serif"
                  opacity="0.85" letterSpacing="2"
                  style={{ filter: `drop-shadow(0 0 4px ${el.colorLight})` }}>
                  今日旺气
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
