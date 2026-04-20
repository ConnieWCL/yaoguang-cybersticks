import { useEffect, useState } from 'react';

type Wuxing = '木' | '火' | '土' | '金' | '水';

const ELEMENTS: { name: Wuxing; color: string; colorLight: string }[] = [
  { name: '木', color: '#5B8C5A', colorLight: '#A8E3A0' },
  { name: '火', color: '#C75050', colorLight: '#FF9A8B' },
  { name: '土', color: '#A0784C', colorLight: '#F0C58A' },
  { name: '金', color: '#B8B8B8', colorLight: '#F5F5F5' },
  { name: '水', color: '#4A7FB5', colorLight: '#8FCBF0' },
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

  const size = 340;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const R = 110;
  const pts = getPentagonPoints(cx, cy, R);
  const nodeR = 22;

  return (
    <div
      style={{
        margin: '24px auto 12px',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '290px', maxWidth: '78vw', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          {/* 柔和光球渐变 — 中心亮 → 外圈淡出，无反光 */}
          {ELEMENTS.map((el, i) => (
            <radialGradient key={`grad-${i}`} id={`wx-grad-${i}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={el.colorLight} stopOpacity="1" />
              <stop offset="40%"  stopColor={el.color}      stopOpacity="0.85" />
              <stop offset="75%"  stopColor={el.color}      stopOpacity="0.35" />
              <stop offset="100%" stopColor={el.color}      stopOpacity="0" />
            </radialGradient>
          ))}
          {/* 强光晕滤镜 — today 节点 */}
          {ELEMENTS.map((el, i) => (
            <filter key={`glow-${i}`} id={`wx-glow-${i}`} x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="8" result="b1" />
              <feFlood floodColor={el.colorLight} floodOpacity="0.85" result="c1" />
              <feComposite in="c1" in2="b1" operator="in" result="g1" />
              <feMerge>
                <feMergeNode in="g1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* 普通节点柔光 */}
          <filter id="wx-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          {/* 整盘背景光晕 */}
          <radialGradient id="wx-aura" cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stopColor="#C8A96E" stopOpacity="0.18" />
            <stop offset="50%"  stopColor="#C8A96E" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#C8A96E" stopOpacity="0" />
          </radialGradient>
          {/* today 节点的彩色 aura */}
          {todayIdx >= 0 && (
            <radialGradient id="wx-today-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={ELEMENTS[todayIdx].colorLight} stopOpacity="0.35" />
              <stop offset="60%"  stopColor={ELEMENTS[todayIdx].colorLight} stopOpacity="0.1" />
              <stop offset="100%" stopColor={ELEMENTS[todayIdx].colorLight} stopOpacity="0" />
            </radialGradient>
          )}
          {/* 标题渐变 */}
          <linearGradient id="wx-title" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#F5DEA8" />
            <stop offset="50%"  stopColor="#E8C88A" />
            <stop offset="100%" stopColor="#C8A96E" />
          </linearGradient>
        </defs>

        {/* 整盘金色光晕 */}
        <circle cx={cx} cy={cy} r={R + 40} fill="url(#wx-aura)" />
        {/* today 五行专属光晕 */}
        {todayIdx >= 0 && (
          <circle cx={cx} cy={cy} r={R + 30} fill="url(#wx-today-aura)" opacity="0.85">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
        )}

        {/* 相生关系 — 五边形外圈 (虚化光线) */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          const isActiveLine = lit && (i === todayIdx || (i + 1) % 5 === todayIdx);
          return (
            <g key={`line-${i}`} filter="url(#wx-soft-glow)">
              <line
                x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                stroke="var(--gold)"
                strokeWidth={isActiveLine ? 3.5 : 2.2}
                strokeLinecap="round"
                opacity={isActiveLine ? 0.55 : 0.28}
              />
            </g>
          );
        })}
        {/* 相生 — 清晰细线在光晕之上 */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          return (
            <line
              key={`line-top-${i}`}
              x1={p.x} y1={p.y} x2={next.x} y2={next.y}
              stroke="var(--gold-lt)"
              strokeWidth="0.6"
              strokeLinecap="round"
              opacity="0.35"
            />
          );
        })}

        {/* 中心标题 — 更大更亮 */}
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
          fill="url(#wx-title)" fontSize="22" fontWeight="700"
          fontFamily="'ZCOOL XiaoWei', 'Noto Serif SC', serif"
          letterSpacing="8"
          style={{ filter: 'drop-shadow(0 0 12px rgba(232,200,138,0.6))' }}>
          天机盘
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central"
          fill="var(--gold)" fontSize="9"
          fontFamily="'Share Tech Mono', monospace"
          opacity="0.55" letterSpacing="4">
          WU XING
        </text>

        {/* 节点 — 光晕光球 (无反光) */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const isActive = lit && i === todayIdx;
          const isDim = lit && i !== todayIdx;
          const auraR = isActive ? nodeR + 28 : nodeR + 14;

          return (
            <g key={el.name}>
              {/* 大范围柔光晕 */}
              <circle cx={p.x} cy={p.y} r={auraR}
                fill={`url(#wx-grad-${i})`}
                opacity={isActive ? 0.95 : isDim ? 0.32 : 0.55}
                style={{ transition: 'opacity 0.7s ease' }}
              />

              {/* today — 呼吸外环 */}
              {isActive && (
                <>
                  <circle cx={p.x} cy={p.y} r={nodeR + 18} fill="none"
                    stroke={el.colorLight} strokeWidth="0.6" opacity="0.5">
                    <animate attributeName="r" values={`${nodeR + 16};${nodeR + 26};${nodeR + 16}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={p.x} cy={p.y} r={nodeR + 32} fill="none"
                    stroke={el.colorLight} strokeWidth="0.4" opacity="0.3">
                    <animate attributeName="r" values={`${nodeR + 28};${nodeR + 42};${nodeR + 28}`} dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.05;0.35" dur="4s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* 文字 */}
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize={isActive ? 22 : 17}
                fontFamily="'ZCOOL XiaoWei', 'Noto Serif SC', serif"
                fontWeight={isActive ? 800 : 500}
                opacity={isDim ? 0.55 : 1}
                filter={isActive ? `url(#wx-glow-${i})` : undefined}
                style={{ transition: 'opacity 0.6s ease, font-size 0.6s ease', letterSpacing: '0.04em' }}>
                {el.name}
              </text>

              {/* 今日旺气 标签 */}
              {isActive && (
                <text x={p.x} y={p.y + nodeR + 18} textAnchor="middle" dominantBaseline="central"
                  fill={el.colorLight} fontSize="10" fontFamily="'Noto Serif SC', serif"
                  opacity="0.9" letterSpacing="3"
                  style={{ filter: `drop-shadow(0 0 6px ${el.colorLight})` }}>
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
