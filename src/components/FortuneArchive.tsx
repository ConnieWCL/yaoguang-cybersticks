import { useEffect, useRef, useState } from 'react';
import { FORTUNES } from '@/lib/fortunes';
import type { ArchiveEntry } from '@/hooks/useFortuneStorage';

interface Props {
  archive: Record<number, ArchiveEntry>;
  todayFortuneId?: number;
  onClose: () => void;
}

export function FortuneArchive({ archive, todayFortuneId, onClose }: Props) {
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);
  const [visible,  setVisible]  = useState(false);
  const particleRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const animIds      = useRef<number[]>([]);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // 粒子动效 — 每张已集卡都有，今日签更亮
  useEffect(() => {
    animIds.current.forEach(cancelAnimationFrame);
    animIds.current = [];

    Object.values(archive).forEach(entry => {
      const canvas = particleRefs.current[entry.fortuneId];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const isToday = entry.fortuneId === todayFortuneId;
      const W = canvas.width  = canvas.offsetWidth  || 80;
      const H = canvas.height = canvas.offsetHeight || 100;
      const count = isToday ? 22 : 12;

      const pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: H + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.5 + 0.15),
        r:  Math.random() * (isToday ? 1.6 : 1.1) + 0.4,
        alpha: Math.random() * (isToday ? 0.85 : 0.55) + 0.15,
        life: Math.random(), decay: Math.random() * 0.005 + 0.002,
      }));

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
          p.x += p.vx + Math.sin(Date.now() * 0.001 + p.y) * 0.08;
          p.y += p.vy; p.life -= p.decay;
          if (p.life <= 0) {
            p.x = Math.random() * W; p.y = H + 4;
            p.life = 1; p.vy = -(Math.random() * 0.5 + 0.15);
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,200,138,${p.alpha * p.life})`;
          ctx.fill();
        });
        animIds.current.push(requestAnimationFrame(draw));
      };
      animIds.current.push(requestAnimationFrame(draw));
    });
    return () => animIds.current.forEach(cancelAnimationFrame);
  }, [archive, todayFortuneId]);

  const count = Object.keys(archive).length;
  const circumference = 2 * Math.PI * 22;

  return (
    <div className="archive-root" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(6,5,15,0.97)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(16px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>
      <style>{`
        @keyframes archivePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes cardZoomIn {
          0%   { transform: scale(0.4) rotate(-6deg); opacity: 0; filter: blur(8px); }
          60%  { transform: scale(1.08) rotate(2deg); opacity: 1; filter: blur(0); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes cardGlow {
          0%,100% { box-shadow: 0 0 60px var(--g-color), 0 0 120px var(--g-color), 0 20px 60px rgba(0,0,0,0.7); }
          50%     { box-shadow: 0 0 90px var(--g-color), 0 0 180px var(--g-color), 0 20px 60px rgba(0,0,0,0.7); }
        }
        @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cellHintGlow {
          0%,100% { box-shadow: 0 0 12px rgba(232,200,138,0.18), 0 4px 14px rgba(0,0,0,0.5); }
          50%     { box-shadow: 0 0 22px rgba(232,200,138,0.35), 0 4px 14px rgba(0,0,0,0.5); }
        }
        @keyframes hintArrow {
          0%,100% { transform: translateX(0); opacity: 0.55; }
          50%     { transform: translateX(2px); opacity: 1; }
        }

        .archive-grid {
          flex: 1;
          overflow-y: auto;
          padding: 20px 18px 32px;
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 18px;
          align-content: start;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
        }
        @media (max-width: 1100px) { .archive-grid { grid-template-columns: repeat(6, minmax(0,1fr)); gap: 16px; } }
        @media (max-width: 768px)  { .archive-grid { grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; padding: 18px 14px 28px; } }
        @media (max-width: 540px)  { .archive-grid { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; } }
        @media (max-width: 380px)  { .archive-grid { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; } }

        .archive-cell {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .archive-cell.has {
          animation: cellHintGlow 2.6s ease-in-out infinite;
          z-index: 2;
        }
        .archive-cell.is-today { z-index: 3; }
        .archive-cell.has:hover {
          transform: translateY(-4px) scale(1.05);
          z-index: 5;
        }
        .archive-cell.has:active {
          transform: translateY(-2px) scale(1.02);
        }
        .archive-cell.has::after {
          content: '点击展开';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(232,200,138,0.7);
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .archive-cell.has:hover::after { opacity: 1; }

        .cell-hex {
          font-size: clamp(28px, 5vw, 38px);
          line-height: 1;
          position: relative; z-index: 1;
          pointer-events: none;
        }
        .cell-name {
          font-family: 'Noto Serif SC', serif;
          font-size: clamp(13px, 1.8vw, 14px);
          letter-spacing: 0.06em;
          position: relative; z-index: 1;
          font-weight: 600;
          pointer-events: none;
        }
        @media (max-width: 540px) {
          .cell-hex  { font-size: 36px; }
          .cell-name { font-size: 14px; }
          .archive-cell { gap: 8px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 24px 16px',
        borderBottom: '1px solid rgba(200,169,110,0.1)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 环形进度 */}
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none"
                stroke="rgba(200,169,110,0.1)" strokeWidth="2.5"/>
              <circle cx="26" cy="26" r="22" fill="none"
                stroke="#C8A96E" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${(count/64)*circumference} ${circumference}`}
                transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '11px', color: '#C8A96E',
            }}>{count}</span>
          </div>
          <div>
            <div style={{
              fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
              fontSize: '20px', letterSpacing: '0.14em',
              background: 'linear-gradient(135deg,#E8C88A,#C8A96E)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>我的签文册</div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '10px', color: '#7A7090',
              letterSpacing: '0.12em', marginTop: '3px',
            }}>{count} / 64 已集齐</div>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'transparent',
          border: '1px solid rgba(200,169,110,0.3)',
          color: '#C8A96E', fontSize: '14px',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* ── GRID ── */}
      <div className="archive-grid">
        {FORTUNES.map(f => {
          const entry   = archive[f.id];
          const has     = !!entry;
          const isToday = f.id === todayFortuneId;

          return (
            <div
              key={f.id}
              className={`archive-cell ${has ? 'has' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => has && setSelected(entry)}
              onKeyDown={e => {
                if (has && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setSelected(entry);
                }
              }}
              role={has ? 'button' : undefined}
              tabIndex={has ? 0 : -1}
              aria-label={has ? `查看 ${f.hexagramName}卦` : undefined}
              style={{
                cursor: has ? 'pointer' : 'default',
                border: isToday
                  ? `2px solid ${f.gradeColor}`
                  : has
                    ? '1.5px solid rgba(232,200,138,0.55)'
                    : '1px solid rgba(255,255,255,0.06)',
                background: isToday
                  ? `radial-gradient(circle at 50% 30%, ${f.gradeColor}40, #15102a 80%)`
                  : has
                    ? 'radial-gradient(circle at 50% 30%, rgba(232,200,138,0.18), #100c22 85%)'
                    : 'rgba(255,255,255,0.02)',
                boxShadow: isToday
                  ? `0 0 28px ${f.gradeColor}80, 0 0 50px ${f.gradeColor}40, 0 6px 24px rgba(0,0,0,0.6)`
                  : undefined,
                transform: isToday ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              {/* 粒子层 */}
              {has && (
                <canvas
                  ref={el => { particleRefs.current[f.id] = el; }}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* 卦象符号 */}
              <span className="cell-hex" style={{
                opacity: isToday ? 1 : has ? 0.95 : 0.18,
                color: isToday ? f.gradeColor : has ? '#F0D9A0' : '#3A3458',
                filter: isToday
                  ? `drop-shadow(0 0 12px ${f.gradeColor})`
                  : has
                    ? 'drop-shadow(0 0 6px rgba(232,200,138,0.6))'
                    : 'none',
              }}>{f.hexagram}</span>

              {/* 卦名 */}
              <span className="cell-name" style={{
                color: isToday ? f.gradeColor : has ? '#E8C88A' : '#2A2440',
                opacity: isToday ? 1 : has ? 0.95 : 0.5,
                textShadow: isToday
                  ? `0 0 8px ${f.gradeColor}80`
                  : has
                    ? '0 0 6px rgba(232,200,138,0.4)'
                    : 'none',
              }}>{f.hexagramName}</span>

              {/* 今日标记 */}
              {isToday && (
                <div style={{
                  position: 'absolute', top: 5, right: 6,
                  width: 5, height: 5, borderRadius: '50%',
                  background: f.gradeColor,
                  boxShadow: `0 0 8px ${f.gradeColor}`,
                  animation: 'archivePulse 2s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── DETAIL: 放大发光的签卡 ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(6,5,15,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'overlayFade 0.25s ease',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ['--g-color' as string]: `${selected.gradeColor}66`,
              position: 'relative',
              width: 'min(360px, 88vw)',
              aspectRatio: '3/4.2',
              borderRadius: '20px',
              border: `2px solid ${selected.gradeColor}`,
              background: `radial-gradient(circle at 50% 25%, ${selected.gradeColor}30 0%, #15102a 55%, #07060f 100%)`,
              padding: '40px 28px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'cardZoomIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), cardGlow 3s ease-in-out infinite 0.55s',
              cursor: 'default',
            } as React.CSSProperties}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${selected.gradeColor}60`,
                color: selected.gradeColor,
                fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {/* 等级徽章 */}
            <div style={{
              padding: '4px 16px', borderRadius: '14px',
              border: `1px solid ${selected.gradeColor}`,
              background: `${selected.gradeColor}22`,
              color: selected.gradeColor,
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '13px', letterSpacing: '0.16em',
              fontWeight: 600,
              textShadow: `0 0 8px ${selected.gradeColor}80`,
            }}>{selected.gradeLabel}</div>

            {/* 卦象超大字 */}
            <div style={{
              fontSize: 'clamp(96px, 24vw, 140px)',
              lineHeight: 1,
              color: selected.gradeColor,
              filter: `drop-shadow(0 0 30px ${selected.gradeColor}) drop-shadow(0 0 60px ${selected.gradeColor}80)`,
              fontFamily: "'ZCOOL XiaoWei', serif",
            }}>{selected.hexagram}</div>

            {/* 卦名 */}
            <div style={{
              fontFamily: "'ZCOOL XiaoWei', serif",
              fontSize: '28px',
              color: '#EDE8FF',
              letterSpacing: '0.18em',
              textShadow: `0 0 16px ${selected.gradeColor}80`,
            }}>{selected.hexagramName}卦</div>

            {/* 白话指引 */}
            <p style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '14px', color: '#C8C0E8',
              lineHeight: 1.7, letterSpacing: '0.06em',
              textAlign: 'center',
              padding: '0 8px',
            }}>{selected.dailyTip}</p>

            {/* 抽到日期 */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {selected.dates.slice(-3).reverse().map(d => (
                <span key={d} style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '10px', color: selected.gradeColor,
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  border: `1px solid ${selected.gradeColor}40`,
                  borderRadius: '10px',
                  opacity: 0.85,
                }}>✦ {d}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
