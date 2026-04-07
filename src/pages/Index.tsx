import { useState, useCallback, useRef } from 'react';
import { InkCanvas } from '@/components/InkCanvas';
import { LuckBar } from '@/components/LuckBar';
import { useSound } from '@/hooks/useSound';
import { getTodayFortune, getRandomFortune, getTodayTheme, type Fortune } from '@/lib/fortunes';
import WuxingPentagon from '@/components/WuxingPentagon';
import type { Wuxing } from '@/lib/fortunes';
import { ShareCard } from '@/components/ShareCard';

type Phase = 'idle' | 'shaking' | 'revealing' | 'done';

const HEXAGRAM_WUXING: Record<string, Wuxing> = {
  '乾': '金', '兑': '金', '离': '火',
  '震': '木', '巽': '木', '坎': '水',
  '艮': '土', '坤': '土', '比': '水',
  '大有': '火', '咸': '金', '蹇': '水',
  '随': '木', '既济': '水', '泰': '土',
  '豫': '木', '萃': '土', '丰': '火',
  '观': '木', '明夷': '火', '大过': '金',
  '震': '木', '蒙': '水', '井': '水',
  '困': '水', '否': '金', '剥': '土',
};

function getTodayWuxing(): Wuxing {
  const WUXING_LIST: Wuxing[] = ['木', '火', '土', '金', '水'];
  const d = new Date();
  const seed = d.getFullYear() * 400 + (d.getMonth() + 1) * 31 + d.getDate();
  return WUXING_LIST[seed % 5];
}

export default function Index() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [stickRaised, setStickRaised] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { playShake, playChime, playReveal } = useSound();
  const shakeCount = useRef(0);

  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 · 星期${weekdays[today.getDay()]}`;

  // 今日主题
  const dailyTheme = getTodayTheme();

  const handleShake = useCallback(() => {
    if (phase !== 'idle' && phase !== 'done') return;

    setCardVisible(false);
    setStickRaised(false);
    setFortune(null);
    setPhase('shaking');
    shakeCount.current++;

    playShake();

    setTimeout(() => {
      setStickRaised(true);
      playChime();

      setTimeout(() => {
        const drawn = shakeCount.current === 1 ? getTodayFortune() : getRandomFortune(fortune?.id);
        setFortune(drawn);
        setPhase('revealing');
        playReveal();

        setTimeout(() => {
          setCardVisible(true);
          setPhase('done');
        }, 400);
      }, 600);
    }, 700);
  }, [phase, fortune, playShake, playChime, playReveal]);

  const handleShare = useCallback(() => {
    if (!fortune) return;
    setShowShare(true);
  }, [fortune]);

  return (
    <>
      <InkCanvas />

      <div style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px 80px',
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>

          {/* ── 今日主题 banner ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: dailyTheme.bgTint,
            border: `1px solid ${dailyTheme.primaryColor}30`,
            width: 'fit-content',
            margin: '0 auto 16px',
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: dailyTheme.primaryColor,
              boxShadow: `0 0 6px ${dailyTheme.primaryColor}`,
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.16em',
              color: dailyTheme.primaryColor,
            }}>
              {dailyTheme.label} · {dailyTheme.desc}
            </span>
          </div>

          {/* ── HEADER ── */}
          <header className="site-header">
            <div className="header-ornament">
              <div className="orn-line" />
              <div className="orn-diamond" />
              <div className="orn-line" />
            </div>
            <h1 className="site-title">爻光</h1>
            <p className="site-subtitle">賽博問簽 · Cyber Oracle</p>
            <div className="date-pill">{dateStr}</div>
          </header>

          {/* ── VESSEL ── */}
          <section className="vessel-section">
            <div
              className={`vessel-wrap ${phase === 'shaking' ? 'is-shaking' : ''}`}
              onClick={handleShake}
              role="button"
              aria-label="摇签"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleShake()}
            >
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />

              {stickRaised && (
                <div className="stick-emerge">
                  <div className="stick-body" />
                  <div className="stick-tip" />
                </div>
              )}

              <div className="vessel-cup">
                <div className="vessel-glyph">
                  {phase === 'done' && fortune ? fortune.hexagram : '籤'}
                </div>
                <div className="vessel-hint">
                  {phase === 'idle' && '叩问天机'}
                  {phase === 'shaking' && '摇卦中…'}
                  {phase === 'revealing' && '卦象显现'}
                  {phase === 'done' && '重新起卦'}
                </div>
              </div>
            </div>

            {phase === 'idle' && (
              <p className="idle-prompt">静心三息，轻触签筒</p>
            )}
          </section>

          {/* ── FORTUNE CARD ── */}
          {fortune && (
            <div
              className={`fortune-card ${cardVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: '0ms' }}
            >
              <div className="card-banner" style={{ '--grade-color': fortune.gradeColor } as React.CSSProperties}>
                <div className="banner-left">
                  <span className="banner-hexagram">{fortune.hexagram}</span>
                  <span className="banner-name">{fortune.hexagramName}卦</span>
                </div>
                <div className="banner-grade">{fortune.gradeLabel}</div>
              </div>

              <div className="card-hero">
                <div className="hero-num" style={{ color: fortune.gradeColor }}>
                  {String(fortune.id).padStart(2, '0')}
                </div>
                <div className="hero-meta">
                  <div className="hero-title">{fortune.hexagramName}</div>
                  <div className="hero-sub" style={{ color: fortune.gradeColor }}>
                    {fortune.gradeLabel}
                  </div>
                </div>
              </div>

              <div className="poem-block">
                {fortune.poem.map((line, i) => (
                  <p key={i} className="poem-line"
                    style={{
                      animationDelay: `${i * 0.12 + 0.3}s`,
                      opacity: cardVisible ? undefined : 0,
                    }}>
                    {line}
                  </p>
                ))}
              </div>

              <p className="card-interpret">{fortune.interpretation}</p>

              {cardVisible && (
                <WuxingPentagon todayWuxing={getTodayWuxing()} />
              )}

              <div className="card-divider" />

              <div className="luck-section">
                <p className="section-label">运势分项</p>
                <LuckBar label="事业" value={fortune.career} color="#C8A96E" delay={100} />
                <LuckBar label="财运" value={fortune.wealth} color="#E8A040" delay={200} />
                <LuckBar label="感情" value={fortune.love}   color="#D4849A" delay={300} />
                <LuckBar label="健康" value={fortune.health} color="#7EB8A0" delay={400} />
              </div>

              <div className="card-divider" />

              <div className="advice-grid">
                <div className="advice-do">
                  <p className="advice-label do-label">宜</p>
                  {fortune.doList.map(d => (
                    <p key={d} className="advice-item">{d}</p>
                  ))}
                </div>
                <div className="advice-dont">
                  <p className="advice-label dont-label">忌</p>
                  {fortune.dontList.map(d => (
                    <p key={d} className="advice-item">{d}</p>
                  ))}
                </div>
              </div>

              <div className="lucky-row">
                <div className="lucky-chip">
                  <span className="lucky-key">幸运色</span>
                  <span className="lucky-val">{fortune.luckyColor}</span>
                </div>
                <div className="lucky-chip">
                  <span className="lucky-key">幸运数</span>
                  <span className="lucky-val">{fortune.luckyNumber}</span>
                </div>
                <div className="lucky-chip">
                  <span className="lucky-key">贵人</span>
                  <span className="lucky-val">{fortune.nobleSign}</span>
                </div>
              </div>

              <div className="action-row">
                <button className="btn-share" onClick={handleShare}>
                  分享今日签
                </button>
                <button className="btn-redraw" onClick={handleShake}>
                  重新起卦
                </button>
              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          <footer className="site-footer">
            <div className="footer-line" />
            <p className="footer-text">爻光 · 一爻一光，日日新启</p>
            <p className="footer-sub">仅供娱乐，不影响真实命运</p>
          </footer>

        </div>
      </div>

      {/* ── SHARE CARD ── */}
      {showShare && fortune && (
        <ShareCard
          fortune={fortune}
          dateStr={dateStr}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
