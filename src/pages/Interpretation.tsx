import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, type Fortune } from '@/lib/fortune';
import { getInterpretation, WUXING_RING, type Interpretation } from '@/lib/interpretation';
import { ArrowLeft, Stamp } from 'lucide-react';

/* ── Wu Xing Ring SVG ── */
const WuxingRing = ({ userWX, todayWX }: { userWX: string; todayWX: string }) => {
  const cx = 150, cy = 150, r = 105;

  return (
    <div className="flex items-center justify-center my-6 md:my-8">
      <svg viewBox="0 0 300 300" className="w-56 h-56 md:w-72 md:h-72">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {WUXING_RING.map((el, i) => {
          const next = WUXING_RING[(i + 1) % 5];
          const rad1 = (el.angle * Math.PI) / 180;
          const rad2 = (next.angle * Math.PI) / 180;
          const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
          const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
          const isActive = el.name === userWX || next.name === todayWX;
          return (
            <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isActive ? '#8B4A3A' : '#444'} strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? 0.8 : 0.3} strokeDasharray={isActive ? undefined : '4 4'} />
          );
        })}

        {WUXING_RING.map((el, i) => {
          const next = WUXING_RING[(i + 1) % 5];
          const rad1 = (el.angle * Math.PI) / 180;
          const rad2 = (next.angle * Math.PI) / 180;
          const mx = (cx + r * Math.cos(rad1) + cx + r * Math.cos(rad2)) / 2;
          const my = (cy + r * Math.sin(rad1) + cy + r * Math.sin(rad2)) / 2;
          const angle = Math.atan2(
            cy + r * Math.sin(rad2) - (cy + r * Math.sin(rad1)),
            cx + r * Math.cos(rad2) - (cx + r * Math.cos(rad1))
          ) * 180 / Math.PI;
          const isActive = el.name === userWX || next.name === todayWX;
          return (
            <g key={`arrow-${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
              <polygon points="-4,-3 4,0 -4,3" fill={isActive ? '#8B4A3A' : '#555'}
                opacity={isActive ? 0.9 : 0.4} className={isActive ? 'animate-pulse' : ''} />
            </g>
          );
        })}

        {WUXING_RING.map((el) => {
          const rad = (el.angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
          const isUser = el.name === userWX, isToday = el.name === todayWX;
          const nodeR = isUser ? 28 : isToday ? 26 : 22;
          return (
            <g key={el.name} filter={isToday ? 'url(#glow-strong)' : isUser ? 'url(#glow)' : undefined}>
              {isToday && (
                <circle cx={x} cy={y} r={nodeR + 8} fill="none" stroke={el.color} strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" from={String(nodeR + 4)} to={String(nodeR + 14)} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={nodeR} fill={el.color}
                stroke={isUser ? '#F5F0E8' : 'none'} strokeWidth={isUser ? 3 : 0}
                opacity={isUser || isToday ? 1 : 0.5} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
                fill={el.name === '金' || el.name === '土' ? '#1A1A1A' : '#F5F0E8'}
                fontSize={isUser ? 16 : 14} fontWeight="bold" fontFamily="Georgia, 'Noto Serif SC', serif">
                {el.name}
              </text>
              {(isUser || isToday) && (
                <text x={x} y={y + nodeR + 16} textAnchor="middle" fill="#999" fontSize="10"
                  fontFamily="Georgia, 'Noto Serif SC', serif">
                  {isUser && isToday ? '日主·当令' : isUser ? '你的日主' : '今日气场'}
                </text>
              )}
            </g>
          );
        })}

        <text x={cx} y={cy - 8} textAnchor="middle" fill="#666" fontSize="11" fontFamily="Georgia, 'Noto Serif SC', serif">天机盘</text>
        <text x={cx} y={cx + 10} textAnchor="middle" fill="#555" fontSize="9" fontFamily="Georgia, 'Noto Serif SC', serif">五行流转</text>
      </svg>
    </div>
  );
};

/* ── Divider ── */
const ZhushaLine = () => (
  <div className="flex items-center justify-center my-6 md:my-8 gap-3">
    <div className="h-px flex-1 bg-primary/30" />
    <span className="text-primary text-lg opacity-60">☰</span>
    <div className="h-px flex-1 bg-primary/30" />
  </div>
);

/* ── Section Title ── */
const SectionTitle = ({ children }: { children: string }) => (
  <p className="text-[#C9A86C] text-xs tracking-[0.3em] font-serif text-center mb-4 md:mb-6">{children}</p>
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
      <div className="w-full max-w-[480px] md:max-w-[800px] mx-auto px-4 md:px-12 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/fortune')}
            className="flex items-center gap-1 text-[#999] text-sm hover:text-[#ccc] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回运势
          </button>
        </div>

        {/* ── 天机盘 ── */}
        <SectionTitle>天 机 盘</SectionTitle>
        <WuxingRing userWX={interp.userWuxing} todayWX={interp.todayWuxing} />

        <ZhushaLine />

        {/* ── 运势等级 + 签文 ── */}
        <div className="text-center mb-2">
          <h1 className="font-serif text-[#F5F0E8] leading-none text-[56px] md:text-[72px]">
            {fortune.level}
          </h1>
        </div>
        <p className="font-serif text-[#F5F0E8] text-xl md:text-2xl text-center leading-[1.8] mb-2 px-2">
          「{fortune.poem}」
        </p>

        <ZhushaLine />

        {/* ── 你的命（简化：日主+时辰，隐藏四柱） ── */}
        <SectionTitle>你 的 命</SectionTitle>
        <div className="bg-[#252525] rounded-lg p-4 md:p-6 mb-4 space-y-4">
          {/* TODO: 隐藏八字四柱，Cursor修复后显示 */}

          {/* 日主 */}
          <div className="text-center">
            <p className="text-[#777] text-xs tracking-wider mb-2">日主</p>
            <p className="text-[#F5F0E8] text-lg md:text-xl font-serif">{interp.riZhuDesc}</p>
          </div>

          {/* 时辰影响 */}
          <div className="text-center pt-3 border-t border-[#333]">
            <p className="text-[#777] text-xs tracking-wider mb-2">时辰</p>
            <p className="text-[#C9A86C] text-base md:text-lg font-serif mb-1">{interp.shiZhuDesc}</p>
            <p className="text-[#BBB] text-sm md:text-base leading-[1.8]">{interp.shiChenAdvice}</p>
          </div>
        </div>

        <ZhushaLine />

        {/* ── 今日运 ── */}
        <SectionTitle>今 日 运</SectionTitle>
        <div className="text-center mb-2">
          <p className="text-[#999] text-sm md:text-base font-serif">{interp.tianshi}</p>
        </div>

        <ZhushaLine />

        {/* ── 流转 ── */}
        <SectionTitle>五 行 流 转</SectionTitle>
        <div className="mb-2">
          <div className="text-center mb-6">
            {interp.poeticFlow.split('\n').map((line, i) => (
              <p key={i} className="font-serif text-[#F5F0E8] text-base md:text-lg leading-[1.8]">{line}</p>
            ))}
          </div>
          <p className="text-[#999] text-sm leading-[1.8] text-center mb-6 px-2 md:px-4">
            {interp.flowExplain}
          </p>
          <div className="bg-[#252525] rounded-lg p-4 md:p-6 mx-auto">
            {interp.flowAdvice.split('\n').map((line, i) => (
              <p key={i} className="font-serif text-[#C9A86C] text-sm md:text-base text-center leading-[1.8]">{line}</p>
            ))}
          </div>
        </div>

        <ZhushaLine />

        {/* ── 行动 ── */}
        <SectionTitle>行 动 指 引</SectionTitle>
        <div className="bg-[#252525] rounded-lg p-4 md:p-6 mb-2">
          <p className="font-serif text-[#F5F0E8] text-sm md:text-base text-center leading-[1.8]">
            {interp.xingdong}
          </p>
        </div>

        <ZhushaLine />

        {/* ── 签解 ── */}
        <SectionTitle>签 解</SectionTitle>
        <div className="mb-2">
          <div className="text-center mb-6">
            <span className="inline-block bg-primary text-primary-foreground font-serif text-xl md:text-2xl px-5 md:px-6 py-2.5 md:py-3 rounded">
              {interp.poemKeyword}
            </span>
          </div>
          <p className="text-[#BBB] text-sm leading-[1.8] text-center mb-6 italic px-2 md:px-4">
            {interp.poemImagery}
          </p>
          <div className="bg-[#252525] rounded-lg p-4 md:p-6">
            <p className="text-[#DDD] text-sm leading-[1.8]">{interp.poemGuide}</p>
          </div>
        </div>

        <ZhushaLine />

        {/* ── 封存此爻 ── */}
        <button onClick={handleSeal}
          className="w-full h-12 md:h-14 rounded bg-primary text-primary-foreground font-serif text-sm md:text-base tracking-[0.2em] hover:bg-primary-hover transition-colors btn-press flex items-center justify-center gap-3 mb-6">
          <Stamp className="w-5 h-5" />
          封存此爻
        </button>

        <p className="text-center text-xs text-[#555] mb-4">爻光 · 赛博黄历</p>
      </div>
    </div>
  );
};

export default InterpretationPage;
