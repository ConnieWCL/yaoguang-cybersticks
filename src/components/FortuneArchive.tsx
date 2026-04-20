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
      const W = canvas.width  = canvas.offsetWidth  || 60;
      const H = canvas.height = canvas.offsetHeight || 80;
      const count = isToday ? 16 : 7;

      const pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: H + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.5 + 0.15),
        r:  Math.random() * (isToday ? 1.4 : 0.9) + 0.3,
        alpha: Math.random() * (isToday ? 0.7 : 0.35) + 0.1,
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
          ctx.fillStyle = `rgba(200,169,110,${p.alpha * p.life})`;
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(6,5,15,0.97)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(16px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>

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
            }}>我的签</div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '10px', color: '#3A3458',
              letterSpacing: '0.12em', marginTop: '3px',
            }}>{count} / 64 已集齐</div>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'transparent',
          border: '1px solid rgba(200,169,110,0.18)',
          color: '#5C5480', fontSize: '14px',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* ── GRID ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 14px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '7px',
        alignContent: 'start',
      }}>
        {FORTUNES.map(f => {
          const entry   = archive[f.id];
          const has     = !!entry;
          const isToday = f.id === todayFortuneId;

          return (
            <div
              key={f.id}
              onClick={() => has && setSelected(entry)}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                borderRadius: '8px',
                cursor: has ? 'pointer' : 'default',
                overflow: 'hidden',
                border: isToday
                  ? `1.5px solid ${f.gradeColor}`
                  : has
                    ? '1px solid rgba(200,169,110,0.22)'
                    : '1px solid rgba(255,255,255,0.05)',
                background: isToday
                  ? `radial-gradient(circle at 50% 30%, ${f.gradeColor}22, #0e0c1e)`
                  : has
                    ? 'radial-gradient(circle at 50% 30%, rgba(200,169,110,0.08), #0a0918)'
                    : 'rgba(255,255,255,0.015)',
                boxShadow: isToday
                  ? `0 0 18px ${f.gradeColor}40, 0 4px 24px rgba(0,0,0,0.5)`
                  : has
                    ? '0 2px 12px rgba(0,0,0,0.4)'
                    : 'none',
                transform: isToday ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px',
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
              <span style={{
                fontSize: '18px', lineHeight: 1,
                position: 'relative', zIndex: 1,
                opacity: isToday ? 1 : has ? 0.7 : 0.12,
                filter: isToday
                  ? `drop-shadow(0 0 8px ${f.gradeColor})`
                  : has
                    ? 'drop-shadow(0 0 3px rgba(200,169,110,0.4))'
                    : 'none',
              }}>{f.hexagram}</span>

              {/* 卦名 */}
              <span style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '8px', letterSpacing: '0.05em',
                position: 'relative', zIndex: 1,
                color: isToday ? f.gradeColor : has ? '#7A7090' : '#2A2440',
              }}>{f.hexagramName}</span>

              {/* 今日标记 */}
              {isToday && (
                <div style={{
                  position: 'absolute', top: 4, right: 5,
                  width: 4, height: 4, borderRadius: '50%',
                  background: f.gradeColor,
                  boxShadow: `0 0 6px ${f.gradeColor}`,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── DETAIL DRAWER ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(6,5,15,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'linear-gradient(170deg, #1e1a38 0%, #0e0c1e 100%)',
              borderTop: `1px solid ${selected.gradeColor}40`,
              borderRadius: '20px 20px 0 0',
              padding: '32px 28px 48px',
              animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <style>{`
              @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
              @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>

            {/* 卦象大字 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <span style={{
                fontSize: '56px', lineHeight: 1,
                filter: `drop-shadow(0 0 20px ${selected.gradeColor}80)`,
              }}>{selected.hexagram}</span>
              <div>
                <div style={{
                  fontFamily: "'ZCOOL XiaoWei', serif",
                  fontSize: '26px', color: '#EDE8FF',
                  letterSpacing: '0.12em', lineHeight: 1,
                }}>{selected.hexagramName}卦</div>
                <div style={{
                  display: 'inline-block', marginTop: '8px',
                  padding: '4px 14px', borderRadius: '14px',
                  border: `1px solid ${selected.gradeColor}60`,
                  background: `${selected.gradeColor}12`,
                  color: selected.gradeColor,
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: '12px', letterSpacing: '0.08em',
                }}>{selected.gradeLabel}</div>
              </div>
            </div>

            {/* 白话指引 */}
            <p style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '16px', color: '#C8C0E8',
              lineHeight: 1.8, letterSpacing: '0.05em',
              paddingLeft: '14px',
              borderLeft: `2px solid ${selected.gradeColor}50`,
              marginBottom: '20px',
            }}>{selected.dailyTip}</p>

            {/* 抽到日期 */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {selected.dates.slice(-5).reverse().map(d => (
                <span key={d} style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '10px', color: '#3A3458',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  border: '1px solid rgba(200,169,110,0.12)',
                  borderRadius: '10px',
                }}>✦ {d}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
