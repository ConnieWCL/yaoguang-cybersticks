// ═══════════════════════════════════════════
// 爻光 · 签册组件
// ═══════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { FORTUNES } from '@/lib/fortunes';
import type { ArchiveEntry } from '@/hooks/useFortuneStorage';

interface FortuneArchiveProps {
  archive: Record<number, ArchiveEntry>;
  todayFortuneId?: number;
  onClose: () => void;
}

export function FortuneArchive({ archive, todayFortuneId, onClose }: FortuneArchiveProps) {
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);
  const [visible, setVisible] = useState(false);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // 粒子动效 for 点亮的格子
  useEffect(() => {
    const animations: number[] = [];
    Object.values(archive).forEach((entry) => {
      const canvas = canvasRefs.current[entry.fortuneId];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      const isToday = entry.fortuneId === todayFortuneId;

      if (!isToday) return; // 只有今日签才有粒子

      const particles = Array.from({ length: 12 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.1),
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        life: Math.random(),
        decay: Math.random() * 0.006 + 0.002,
      }));

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.life -= p.decay;
          if (p.life <= 0) {
            p.x = Math.random() * W; p.y = H + 2;
            p.life = 1; p.vy = -(Math.random() * 0.4 + 0.1);
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,169,110,${p.alpha * p.life})`;
          ctx.fill();
        });
        animations.push(requestAnimationFrame(draw));
      };
      animations.push(requestAnimationFrame(draw));
    });
    return () => animations.forEach(cancelAnimationFrame);
  }, [archive, todayFortuneId]);

  const collectedCount = Object.keys(archive).length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(7,6,15,0.96)',
        backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px',
        borderBottom: '1px solid rgba(200,169,110,0.12)',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{
            fontFamily: "'ZCOOL XiaoWei', serif",
            fontSize: '22px',
            background: 'linear-gradient(135deg, #E8C88A, #C8A96E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.12em',
          }}>我的签</h2>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px', color: '#5C5480',
            letterSpacing: '0.1em', marginTop: '4px',
          }}>
            {collectedCount} / 64 卦已集齐
          </p>
        </div>

        {/* Progress arc */}
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none"
              stroke="rgba(200,169,110,0.12)" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none"
              stroke="#C8A96E" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(collectedCount / 64) * 125.6} 125.6`}
              transform="rotate(-90 24 24)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px', color: '#C8A96E',
          }}>
            {Math.round((collectedCount / 64) * 100)}%
          </span>
        </div>

        <button onClick={onClose} style={{
          background: 'transparent',
          border: '1px solid rgba(200,169,110,0.2)',
          borderRadius: '50%', width: '36px', height: '36px',
          color: '#5C5480', cursor: 'pointer',
          fontSize: '16px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '8px',
        alignContent: 'start',
      }}>
        {FORTUNES.map(fortune => {
          const entry = archive[fortune.id];
          const isCollected = !!entry;
          const isToday = fortune.id === todayFortuneId;

          return (
            <div
              key={fortune.id}
              onClick={() => isCollected && setSelected(entry)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '10px',
                border: isToday
                  ? `1.5px solid ${fortune.gradeColor}`
                  : isCollected
                    ? '1px solid rgba(200,169,110,0.3)'
                    : '1px solid rgba(255,255,255,0.06)',
                background: isToday
                  ? `${fortune.gradeColor}18`
                  : isCollected
                    ? 'rgba(200,169,110,0.06)'
                    : 'rgba(255,255,255,0.02)',
                cursor: isCollected ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '2px',
                boxShadow: isToday ? `0 0 12px ${fortune.gradeColor}30` : 'none',
                transform: isToday ? 'scale(1.05)' : 'scale(1)',
                overflow: 'hidden',
              }}
            >
              {/* 粒子 canvas — 今日签专属 */}
              {isToday && (
                <canvas
                  ref={el => { canvasRefs.current[fortune.id] = el; }}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    pointerEvents: 'none',
                  }}
                />
              )}

              <span style={{
                fontSize: '16px', lineHeight: 1,
                opacity: isToday ? 1 : isCollected ? 0.75 : 0.18,
                filter: isToday ? `drop-shadow(0 0 6px ${fortune.gradeColor})` : 'none',
                position: 'relative', zIndex: 1,
              }}>
                {fortune.hexagram}
              </span>
              <span style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '9px',
                color: isToday ? fortune.gradeColor : isCollected ? '#A89EC8' : '#3A3458',
                letterSpacing: '0.06em',
                position: 'relative', zIndex: 1,
              }}>
                {fortune.hexagramName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(7,6,15,0.7)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'linear-gradient(160deg, #1a1730, #0e0c1e)',
              border: '1px solid rgba(200,169,110,0.2)',
              borderRadius: '20px 20px 0 0',
              padding: '28px 24px 40px',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <span style={{
                fontSize: '40px', lineHeight: 1,
                filter: `drop-shadow(0 0 12px ${selected.gradeColor})`,
              }}>
                {selected.hexagram}
              </span>
              <div>
                <div style={{
                  fontFamily: "'ZCOOL XiaoWei', serif",
                  fontSize: '22px', color: '#EDE8FF',
                  letterSpacing: '0.1em',
                }}>
                  {selected.hexagramName}卦
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '3px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${selected.gradeColor}`,
                  color: selected.gradeColor,
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: '12px',
                }}>
                  {selected.gradeLabel}
                </div>
              </div>
            </div>

            <p style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '15px', color: '#EDE8FF',
              lineHeight: '1.8', letterSpacing: '0.06em',
              marginBottom: '16px',
              paddingLeft: '12px',
              borderLeft: `2px solid ${selected.gradeColor}50`,
            }}>
              {selected.dailyTip}
            </p>

            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '11px', color: '#3A3458',
              letterSpacing: '0.08em',
            }}>
              {selected.dates.slice(-3).reverse().map(d => (
                <span key={d} style={{ marginRight: '12px' }}>✦ {d}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
