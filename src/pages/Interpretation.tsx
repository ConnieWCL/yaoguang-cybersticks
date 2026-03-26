import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, type Fortune } from '@/lib/fortune';
import { getInterpretation, WUXING_RING, type Interpretation } from '@/lib/interpretation';
import { ArrowLeft, Stamp } from 'lucide-react';

/* ── Wu Xing Ring SVG ── */
const WuxingRing = ({ userWX, todayWX }: { userWX: string; todayWX: string }) => {
  const cx = 150, cy = 150, r = 105;

  return (
    <div className="flex items-center justify-center my-8">
      <svg viewBox="0 0 300 300" className="w-64 h-64 sm:w-72 sm:h-72">
        {/* Outer glow for today's element */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines (sheng cycle arrows) */}
        {WUXING_RING.map((el, i) => {
          const next = WUXING_RING[(i + 1) % 5];
          const rad1 = (el.angle * Math.PI) / 180;
          const rad2 = (next.angle * Math.PI) / 180;
          const x1 = cx + r * Math.cos(rad1);
          const y1 = cy + r * Math.sin(rad1);
          const x2 = cx + r * Math.cos(rad2);
          const y2 = cy + r * Math.sin(rad2);
          const isActive = el.name === userWX || next.name === todayWX;
          return (
            <line
              key={`line-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isActive ? '#8B4A3A' : '#444'}
              strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? 0.8 : 0.3}
              strokeDasharray={isActive ? undefined : '4 4'}
            />
          );
        })}

        {/* Arrow markers on lines */}
        {WUXING_RING.map((el, i) => {
          const next = WUXING_RING[(i + 1) % 5];
          const rad1 = (el.angle * Math.PI) / 180;
          const rad2 = (next.angle * Math.PI) / 180;
          const x1 = cx + r * Math.cos(rad1);
          const y1 = cy + r * Math.sin(rad1);
          const x2 = cx + r * Math.cos(rad2);
          const y2 = cy + r * Math.sin(rad2);
          // midpoint
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
          const isActive = el.name === userWX || next.name === todayWX;
          return (
            <g key={`arrow-${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
              <polygon
                points="-4,-3 4,0 -4,3"
                fill={isActive ? '#8B4A3A' : '#555'}
                opacity={isActive ? 0.9 : 0.4}
                className={isActive ? 'animate-pulse' : ''}
              />
            </g>
          );
        })}

        {/* Element nodes */}
        {WUXING_RING.map((el) => {
          const rad = (el.angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const isUser = el.name === userWX;
          const isToday = el.name === todayWX;
          const nodeR = isUser ? 28 : isToday ? 26 : 22;

          return (
            <g key={el.name} filter={isToday ? 'url(#glow-strong)' : isUser ? 'url(#glow)' : undefined}>
              {/* Outer pulse ring for today */}
              {isToday && (
                <circle cx={x} cy={y} r={nodeR + 8} fill="none" stroke={el.color} strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" from={String(nodeR + 4)} to={String(nodeR + 14)} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x} cy={y} r={nodeR}
                fill={el.color}
                stroke={isUser ? '#F5F0E8' : 'none'}
                strokeWidth={isUser ? 3 : 0}
                opacity={isUser || isToday ? 1 : 0.5}
              />
              <text
                x={x} y={y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={el.name === '金' || el.name === '土' ? '#1A1A1A' : '#F5F0E8'}
                fontSize={isUser ? 16 : 14}
                fontWeight="bold"
                fontFamily="Georgia, 'Noto Serif SC', serif"
              >
                {el.name}
              </text>
              {/* Label */}
              {(isUser || isToday) && (
                <text
                  x={x} y={y + nodeR + 16}
                  textAnchor="middle"
                  fill="#999"
                  fontSize="10"
                  fontFamily="Georgia, 'Noto Serif SC', serif"
                >
                  {isUser && isToday ? '日主·当令' : isUser ? '你的日主' : '今日气场'}
                </text>
              )}
            </g>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#666" fontSize="11" fontFamily="Georgia, 'Noto Serif SC', serif">
          天机盘
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#555" fontSize="9" fontFamily="Georgia, 'Noto Serif SC', serif">
          五行流转
        </text>
      </svg>
    </div>
  );
};

/* ── Divider ── */
const ZhushaLine = () => (
  <div className="flex items-center justify-center my-8 gap-3">
    <div className="h-px flex-1 bg-primary/30" />
    <span className="text-primary text-lg opacity-60">☰</span>
    <div className="h-px flex-1 bg-primary/30" />
  </div>
);

/* ── Main Page ── */
const InterpretationPage = () => {
  const navigate = useNavigate();
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [interp, setInterp] = useState<Interpretation | null>(null);

  useEffect(() => {
    const user = loadUser();
    if (!user) { navigate('/'); return; }
    const f = getFortune(user);
    setFortune(f);
    setInterp(getInterpretation(user, f));
  }, [navigate]);

  if (!fortune || !interp) return null;

  const handleSeal = async () => {
    const text = `【爻光·解签】\n${fortune.level}\n「${fortune.poem}」\n${interp.poemKeyword}：${interp.poemGuide}`;
    if (navigator.share) {
      try { await navigator.share({ title: '爻光·解签', text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] animate-page-enter">
      <div className="max-w-[480px] mx-auto px-6 sm:px-12 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/fortune')}
            className="flex items-center gap-1 text-[#999] text-sm hover:text-[#ccc] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回运势
          </button>
        </div>

        {/* Fortune level — massive */}
        <div className="text-center mb-2 stagger-children">
          <h1
            className="font-serif text-[#F5F0E8] leading-none"
            style={{ fontSize: '72px' }}
          >
            {fortune.level}
          </h1>
        </div>

        {/* Bazi & Tianshi subtitle */}
        <div className="text-center mb-2 space-y-1">
          <p className="text-[#999] text-sm font-serif">{interp.bazi}</p>
          <p className="text-[#777] text-xs font-serif">{interp.tianshi}</p>
        </div>

        <ZhushaLine />

        {/* ── 天机盘 ── */}
        <div className="text-center">
          <p className="text-[#C9A86C] text-xs tracking-[0.3em] font-serif mb-1">天 机 盘</p>
        </div>
        <WuxingRing userWX={interp.userWuxing} todayWX={interp.todayWuxing} />

        <ZhushaLine />

        {/* ── 流转 ── */}
        <div className="mb-2">
          <p className="text-[#C9A86C] text-xs tracking-[0.3em] font-serif text-center mb-6">五 行 流 转</p>
          
          {/* Poetic flow */}
          <div className="text-center mb-6">
            {interp.poeticFlow.split('\n').map((line, i) => (
              <p key={i} className="font-serif text-[#F5F0E8] text-lg leading-[1.8]">
                {line}
              </p>
            ))}
          </div>

          {/* Explain */}
          <p className="text-[#999] text-sm leading-[1.8] text-center mb-6 px-4">
            {interp.flowExplain}
          </p>

          {/* Advice — highlighted */}
          <div className="bg-[#252525] rounded-lg p-6 mx-auto">
            {interp.flowAdvice.split('\n').map((line, i) => (
              <p key={i} className="font-serif text-[#C9A86C] text-base text-center leading-[1.8]">
                {line}
              </p>
            ))}
          </div>
        </div>

        <ZhushaLine />

        {/* ── 签解 ── */}
        <div className="mb-2">
          <p className="text-[#C9A86C] text-xs tracking-[0.3em] font-serif text-center mb-8">签 解</p>

          {/* Keyword */}
          <div className="text-center mb-6">
            <span className="inline-block bg-primary text-primary-foreground font-serif text-2xl px-6 py-3 rounded">
              {interp.poemKeyword}
            </span>
          </div>

          {/* Poem quote */}
          <p className="font-serif text-[#F5F0E8] text-xl text-center leading-[1.8] mb-6 px-2">
            「{interp.qianwen}」
          </p>

          {/* Imagery */}
          <p className="text-[#BBB] text-sm leading-[1.8] text-center mb-6 italic px-4">
            {interp.poemImagery}
          </p>

          {/* Guide */}
          <div className="bg-[#252525] rounded-lg p-6">
            <p className="text-[#DDD] text-sm leading-[1.8]">
              {interp.poemGuide}
            </p>
          </div>
        </div>

        <ZhushaLine />

        {/* ── 封存此爻 ── */}
        <button
          onClick={handleSeal}
          className="w-full h-14 rounded bg-primary text-primary-foreground font-serif text-base tracking-[0.2em] hover:bg-primary-hover transition-colors btn-press flex items-center justify-center gap-3 mb-6"
        >
          <Stamp className="w-5 h-5" />
          封存此爻
        </button>

        <p className="text-center text-xs text-[#555] mb-4">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default InterpretationPage;
