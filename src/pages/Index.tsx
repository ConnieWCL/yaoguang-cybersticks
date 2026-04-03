import { useState, useCallback, useRef } from 'react';
import { InkCanvas } from '@/components/InkCanvas';
import { LuckBar } from '@/components/LuckBar';
import { useSound } from '@/hooks/useSound';
import { getTodayFortune, getRandomFortune, type Fortune } from '@/lib/fortunes';

type Phase = 'idle' | 'shaking' | 'revealing' | 'done';

export default function Index() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [stickRaised, setStickRaised] = useState(false);
  const { playShake, playChime, playReveal } = useSound();
  const shakeCount = useRef(0);

  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 · 星期${weekdays[today.getDay()]}`;

  const handleShake = useCallback(() => {
    if (phase !== 'idle' && phase !== 'done') return;

    // Reset if redrawing
    setCardVisible(false);
    setStickRaised(false);
    setFortune(null);
    setPhase('shaking');
    shakeCount.current++;

    playShake();

    // After shake, raise stick
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
    const text = `【爻光 · 每日一签】\n${fortune.hexagramName}卦 · ${fortune.gradeLabel}\n\n「${fortune.poem[0]}」\n\n${fortune.interpretation}\n\n— 爻光赛博签`;
    if (navigator.share) {
      navigator.share({ title: '爻光 · 每日一签', text });
    } else {
      navigator.clipboard?.writeText(text);
      // toast handled by CSS
    }
  }, [fortune]);

  return (
    <div className="app-root">
      <InkCanvas />

      <div className="page-wrap">
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
            {/* Ripple rings */}
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />

            {/* Stick emerging */}
            {stickRaised && (
              <div className="stick-emerge">
                <div className="stick-body" />
                <div className="stick-tip" />
              </div>
            )}

            {/* Main cup */}
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
            {/* Grade banner */}
            <div className="card-banner" style={{ '--grade-color': fortune.gradeColor } as React.CSSProperties}>
              <div className="banner-left">
                <span className="banner-hexagram">{fortune.hexagram}</span>
                <span className="banner-name">{fortune.hexagramName}卦</span>
              </div>
              <div className="banner-grade">{fortune.gradeLabel}</div>
            </div>

            {/* Big number + name */}
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

            {/* Poem */}
            <div className="poem-block">
              {fortune.poem.map((line, i) => (
                <p
                  key={i}
                  className="poem-line"
                  style={{
                    animationDelay: `${i * 0.12 + 0.3}s`,
                    opacity: cardVisible ? undefined : 0,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Interpretation */}
            <p className="card-interpret">{fortune.interpretation}</p>

            <div className="card-divider" />

            {/* Luck bars */}
            <div className="luck-section">
              <p className="section-label">运势分项</p>
              <LuckBar label="事业" value={fortune.career}  color="#C8A96E" delay={100} />
              <LuckBar label="财运" value={fortune.wealth}  color="#E8A040" delay={200} />
              <LuckBar label="感情" value={fortune.love}    color="#D4849A" delay={300} />
              <LuckBar label="健康" value={fortune.health}  color="#7EB8A0" delay={400} />
            </div>

            <div className="card-divider" />

            {/* Do / Don't */}
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

            {/* Lucky info */}
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

            {/* Actions */}
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
          <p className="footer-text">爻光 · 中式轻玄学 · 每日一签</p>
          <p className="footer-sub">仅供娱乐，不影响真实命运</p>
        </footer>
      </div>
    </div>
  );
}
