import { useState, useCallback, useEffect, useRef } from 'react';
import { InkCanvas } from '@/components/InkCanvas';
import { LuckBar } from '@/components/LuckBar';
import { useSound } from '@/hooks/useSound';
import { FORTUNES, getTodayFortune, getRandomFortune, type Fortune } from '@/lib/fortunes';
import WuxingPentagon from '@/components/WuxingPentagon';
import type { Wuxing } from '@/lib/fortunes';
import { ShareCard } from '@/components/ShareCard';
import { FortuneArchive } from '@/components/FortuneArchive';
import { useFortuneStorage } from '@/hooks/useFortuneStorage';
import { ParticleButton } from '@/components/ParticleButton';
import { UserRound, Volume2, VolumeX } from 'lucide-react';
import { UserSpace } from '@/components/UserSpace';
import { useAuth } from '@/contexts/AuthContext';

type Phase = 'idle' | 'shaking' | 'revealing' | 'done';

const HEXAGRAM_WUXING: Record<string, Wuxing> = {
  '乾': '金', '兑': '金', '离': '火',
  '震': '木', '巽': '木', '坎': '水',
  '艮': '土', '坤': '土', '比': '水',
  '大有': '火', '咸': '金', '蹇': '水',
  '随': '木', '既济': '水', '泰': '土',
  '豫': '木', '萃': '土', '丰': '火',
  '观': '木', '明夷': '火', '大过': '金',
  '蒙': '水', '井': '水',
  '困': '水', '否': '金', '剥': '土',
};

function getTodayWuxing(): Wuxing {
  const WUXING_LIST: Wuxing[] = ['木', '火', '土', '金', '水'];
  const d = new Date();
  const seed = d.getFullYear() * 400 + (d.getMonth() + 1) * 31 + d.getDate();
  return WUXING_LIST[seed % 5];
}

export default function Index() {
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const previewParams = isLocalPreview ? new URLSearchParams(window.location.search) : null;
  const designPreview = previewParams?.get('design-preview') ?? null;
  const isUserSpacePreview = designPreview === 'user-space';
  const isSharePreview = designPreview === 'share-card';
  const previewFortuneIndex = Math.min(63, Math.max(0, Number(previewParams?.get('fortune') ?? 0)));
  const [phase, setPhase] = useState<Phase>(isSharePreview ? 'done' : 'idle');
  const [fortune, setFortune] = useState<Fortune | null>(isSharePreview ? FORTUNES[previewFortuneIndex] : null);
  const [cardVisible, setCardVisible] = useState(false);
  const [stickRaised, setStickRaised] = useState(false);
  const [showShare, setShowShare] = useState(isSharePreview);
  const { enabled: soundEnabled, toggleSound, playShake, playChime, playReveal } = useSound();
  const { user, isGuest, authPromptOpen, requestAuth } = useAuth();
  const { archive, attemptsLeft, todayLocked, recordFortune, totalDraws, error: storageError } = useFortuneStorage();
  const [showArchive, setShowArchive] = useState(false);
  const [showUserSpace, setShowUserSpace] = useState(isUserSpacePreview);
  const [resumeDrawAfterAuth, setResumeDrawAfterAuth] = useState(false);
  const shakeCount = useRef(0);

  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 · 星期${weekdays[today.getDay()]}`;



  const performShake = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'done') return;
    // 用完次数后：只回到当前已显示的最新签，不再重新抽，不重置次数
    if (todayLocked) {
      if (fortune) {
        setCardVisible(true);
        setPhase('done');
      }
      return;
    }

    setCardVisible(false);
    setStickRaised(false);
    setFortune(null);
    setPhase('shaking');
    shakeCount.current++;

    playShake();

    await new Promise(resolve => window.setTimeout(resolve, 700));
    setStickRaised(true);
    playChime();

    await new Promise(resolve => window.setTimeout(resolve, 600));
    const drawn = shakeCount.current === 1 ? getTodayFortune() : getRandomFortune(fortune?.id);
    setFortune(drawn);
    setPhase('revealing');
    playReveal();

    const saved = await recordFortune(drawn);
    if (!saved) {
      setFortune(null);
      setStickRaised(false);
      setPhase('idle');
      return;
    }
    await new Promise(resolve => window.setTimeout(resolve, 400));
    setCardVisible(true);
    setPhase('done');
  }, [phase, fortune, playShake, playChime, playReveal, recordFortune, todayLocked]);

  const handleShake = useCallback(() => {
    if (!user && !isGuest) {
      setResumeDrawAfterAuth(true);
      requestAuth();
      return;
    }
    void performShake();
  }, [isGuest, performShake, requestAuth, user]);

  useEffect(() => {
    if (!resumeDrawAfterAuth || (!user && !isGuest)) return;
    setResumeDrawAfterAuth(false);
    void performShake();
  }, [isGuest, performShake, resumeDrawAfterAuth, user]);

  useEffect(() => {
    if (!authPromptOpen && !user && !isGuest) setResumeDrawAfterAuth(false);
  }, [authPromptOpen, isGuest, user]);

  const handleAccountOpen = useCallback(() => {
    if (!user && !isGuest) {
      requestAuth();
      return;
    }
    setShowUserSpace(true);
  }, [isGuest, requestAuth, user]);

  const handleShare = useCallback(() => {
    if (!fortune) return;
    setShowShare(true);
  }, [fortune]);

  return (
    <>
      <InkCanvas />

      <div className="home-page">
        <div className="home-column">

          <div className="home-utilities">
            <button type="button" className="sound-toggle" onClick={toggleSound}
              aria-label={soundEnabled ? '关闭抽签音效' : '开启抽签音效'} aria-pressed={soundEnabled}>
              {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
              <span>{soundEnabled ? '有声' : '静音'}</span>
            </button>
            <div className="account-ribbon">
              <button type="button" onClick={handleAccountOpen} aria-label={user || isGuest ? '打开我的命册' : '登录或开始游客体验'}>
                <span><UserRound aria-hidden="true" /></span>
                <span><small>{isGuest ? '本机命册' : user ? '云端命册' : '保存今日签文'}</small><strong>{isGuest ? '游客体验' : user?.user_metadata?.display_name || user?.email?.split('@')[0] || '登录 / 游客体验'}</strong></span>
                <em>{Object.keys(archive).length}/64</em>
              </button>
            </div>
          </div>

          {/* ── HEADER ── */}
          <header className="site-header">
            <div className="header-ornament">
              <div className="orn-line" />
              <div className="orn-diamond" />
              <div className="orn-line" />
            </div>
            <h1 className="site-title">爻光</h1>
            <p className="site-subtitle">每天一根签，看看今天运势怎么说</p>
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
            {storageError && <p className="storage-error" role="status">{storageError}</p>}
            {/* 今日剩余次数 */}
            <div className="attempt-status">
              {[0,1,2].map(i => (
                <span key={i} className={i < attemptsLeft ? 'attempt-dot is-active' : 'attempt-dot'} />
              ))}
              <span className="attempt-copy">
                {todayLocked ? '今日已定签' : `今日剩余 ${attemptsLeft} 次`}
              </span>
            </div>
            {todayLocked && (
              <button type="button" className="locked-archive-link" onClick={() => setShowArchive(true)}>
                今日三签已定 · 查看我的签文册
              </button>
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

              {/* 白话指引 — 第一眼看到的那句话 */}
              <div className="daily-tip">
                {fortune.dailyTip}
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
                <LuckBar label="事业" value={fortune.career} color="#C8A96E" icon="✦" delay={100} />
                <LuckBar label="财运" value={fortune.wealth} color="#E8A040" icon="❖" delay={200} />
                <LuckBar label="感情" value={fortune.love}   color="#D4849A" icon="❀" delay={300} />
                <LuckBar label="健康" value={fortune.health} color="#7EB8A0" icon="❉" delay={400} />
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
                <ParticleButton
                  variant="secondary"
                  onClick={handleShare}
                >
                  分享签文
                </ParticleButton>
                <ParticleButton
                  variant="secondary"
                  onClick={handleShake}
                  disabled={todayLocked}
                  suffix={todayLocked ? '今日已用完' : `还剩 ${attemptsLeft} 次`}
                >
                  再抽一签
                </ParticleButton>
              </div>

              {/* 我的签文册 — 固化入口 */}
              <div className="btn-archive-wrap">
                <ParticleButton
                  variant="secondary"
                  onClick={() => setShowArchive(true)}
                  icon="✦"
                  suffix={`${Object.keys(archive).length} / 64`}
                >
                  我的签文册
                </ParticleButton>
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

      {/* ── ARCHIVE ── */}
      {showArchive && (
        <FortuneArchive
          archive={archive}
          todayFortuneId={fortune?.id}
          onClose={() => setShowArchive(false)}
        />
      )}

      <UserSpace
        open={showUserSpace}
        archiveCount={Object.keys(archive).length}
        totalDraws={totalDraws}
        attemptsLeft={attemptsLeft}
        onClose={() => setShowUserSpace(false)}
        onOpenArchive={() => { setShowUserSpace(false); setShowArchive(true); }}
        previewUser={isUserSpacePreview ? { id: 'design-preview', email: 'connie@example.com', user_metadata: { display_name: 'Connie' } } : undefined}
      />

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
