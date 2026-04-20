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
          {/* 节点光球 — 中心微亮 → 外缘融入背景，低饱和、低不透明 */}
          {ELEMENTS.map((el, i) => (
            <radialGradient key={`grad-${i}`} id={`wx-grad-${i}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={el.colorLight} stopOpacity="1" />
              <stop offset="35%"  stopColor={el.color}      stopOpacity="0.9" />
              <stop offset="70%"  stopColor={el.color}      stopOpacity="0.35" />
              <stop offset="100%" stopColor={el.color}      stopOpacity="0" />
            </radialGradient>
          ))}
          {/* today 节点 — 同色系更亮一档,无白光 */}
          {todayIdx >= 0 && (
            <radialGradient id="wx-grad-today" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={ELEMENTS[todayIdx].colorLight} stopOpacity="1" />
              <stop offset="45%"  stopColor={ELEMENTS[todayIdx].color}      stopOpacity="0.95" />
              <stop offset="78%"  stopColor={ELEMENTS[todayIdx].color}      stopOpacity="0.45" />
              <stop offset="100%" stopColor={ELEMENTS[todayIdx].color}      stopOpacity="0" />
            </radialGradient>
          )}
          {/* 标题渐变 */}
          <linearGradient id="wx-title" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#F5DEA8" />
            <stop offset="50%"  stopColor="#E8C88A" />
            <stop offset="100%" stopColor="#C8A96E" />
          </linearGradient>
        </defs>

        {/* 相生关系 — 弧形丝带 + 粒子链，柔和有呼吸感 */}
        {pts.map((p, i) => {
          const next = pts[(i + 1) % 5];
          const isActiveLine = lit && (i === todayIdx || (i + 1) % 5 === todayIdx);
          // 控制点：取两点中点向中心方向偏移一点，做出向内微弧
          const mx = (p.x + next.x) / 2;
          const my = (p.y + next.y) / 2;
          const towardCx = cx - mx;
          const towardCy = cy - my;
          const len = Math.hypot(towardCx, towardCy) || 1;
          const bow = 18; // 弧度幅度
          const ctrlX = mx + (towardCx / len) * bow;
          const ctrlY = my + (towardCy / len) * bow;
          const d = `M ${p.x} ${p.y} Q ${ctrlX} ${ctrlY} ${next.x} ${next.y}`;
          return (
            <g key={`line-${i}`} style={{ transition: 'opacity 0.6s ease' }}>
              {/* 底层柔光弧 */}
              <path
                d={d}
                fill="none"
                stroke="var(--gold)"
                strokeWidth={isActiveLine ? 6 : 4.5}
                strokeLinecap="round"
                opacity={isActiveLine ? 0.28 : 0.14}
                style={{ filter: 'blur(3px)' }}
              />
              {/* 中层细弧 */}
              <path
                d={d}
                fill="none"
                stroke={isActiveLine ? 'var(--gold-lt)' : 'var(--gold)'}
                strokeWidth={isActiveLine ? 1.4 : 1}
                strokeLinecap="round"
                opacity={isActiveLine ? 0.55 : 0.3}
              />
              {/* 粒子流光弧 */}
              <path
                d={d}
                fill="none"
                stroke={isActiveLine ? 'var(--gold-lt)' : 'var(--gold)'}
                strokeWidth={isActiveLine ? 2.4 : 1.8}
                strokeLinecap="round"
                strokeDasharray="0.5 4"
                opacity={isActiveLine ? 0.95 : 0.65}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0" to="-45"
                  dur={isActiveLine ? '5s' : '8s'}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          );
        })}

        {/* 中心标题 — 更大更亮 */}
        <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central"
          fill="url(#wx-title)" fontSize="26" fontWeight="700"
          fontFamily="'ZCOOL XiaoWei', 'Noto Serif SC', serif"
          letterSpacing="10"
          style={{ filter: 'drop-shadow(0 0 4px rgba(232,200,138,0.35))' }}>
          天机盘
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="central"
          fill="var(--gold)" fontSize="8"
          fontFamily="'Share Tech Mono', monospace"
          opacity="0.4" letterSpacing="4">
          WU XING
        </text>

        {/* 节点 — 纯光晕光球，无反光、无硬边 */}
        {ELEMENTS.map((el, i) => {
          const p = pts[i];
          const isActive = lit && i === todayIdx;
          const isDim = lit && i !== todayIdx;
          const auraR = isActive ? nodeR + 18 : nodeR + 10;

          return (
            <g key={el.name}>
              {/* 柔光晕 */}
              <circle cx={p.x} cy={p.y} r={auraR}
                fill={isActive ? 'url(#wx-grad-today)' : `url(#wx-grad-${i})`}
                opacity={isActive ? 1 : isDim ? 0.45 : 0.7}
                style={{ transition: 'opacity 0.7s ease' }}
              />

              {/* today — 一道极细的呼吸光环，融入背景 */}
              {isActive && (
                <circle cx={p.x} cy={p.y} r={nodeR + 14} fill="none"
                  stroke={el.colorLight} strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="r" values={`${nodeR + 12};${nodeR + 20};${nodeR + 12}`} dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.05;0.4" dur="3.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 文字 — 沉稳金色,today 同色系略亮,不刺眼 */}
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central"
                fill={isActive ? '#FFF4D6' : 'rgba(245,239,224,0.92)'}
                fontSize={isActive ? 22 : 18}
                fontFamily="'ZCOOL XiaoWei', 'Noto Serif SC', serif"
                fontWeight={isActive ? 700 : 600}
                opacity={isDim ? 0.85 : 1}
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="0.5"
                paintOrder="stroke"
                style={{
                  transition: 'opacity 0.6s ease, font-size 0.6s ease',
                  letterSpacing: '0.04em',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                }}>
                {el.name}
              </text>

              {/* 今日旺气 标签 */}
              {isActive && (
                <text x={p.x} y={p.y + nodeR + 14} textAnchor="middle" dominantBaseline="central"
                  fill={el.colorLight} fontSize="9" fontFamily="'Noto Serif SC', serif"
                  opacity="0.7" letterSpacing="3">
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
