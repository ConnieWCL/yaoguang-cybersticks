import { useEffect, useRef, useState, useCallback } from 'react';
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

  // 只对"今日签"跑粒子动效，其他已集的不跑（解决卡顿问题）
  const todayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef      = useRef<number>(0);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // 今日签粒子动效 — 单独 canvas，不影响其他卡片
  useEffect(() => {
    cancelAnimationFrame(animIdRef.current);
    const canvas = todayCanvasRef.current;
    if (!canvas || !todayFortuneId) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width  = canvas.offsetWidth  || 80;
    const H = canvas.height = canvas.offsetHeight || 100;
    const pts = Array.from({ length: 20 }, () => ({
      x: Math.random()*W, y: H+4,
      vx: (Math.random()-0.5)*0.3,
      vy: -(Math.random()*0.55+0.18),
      r:  Math.random()*1.6+0.4,
      alpha: Math.random()*0.8+0.2,
      life: Math.random(), decay: Math.random()*0.005+0.002,
    }));

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x += p.vx + Math.sin(Date.now()*0.001+p.y)*0.1;
        p.y += p.vy; p.life -= p.decay;
        if (p.life<=0) { p.x=Math.random()*W; p.y=H+4; p.life=1; p.vy=-(Math.random()*0.55+0.18); }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(232,200,138,${p.alpha*p.life})`;
        ctx.fill();
      });
      animIdRef.current = requestAnimationFrame(draw);
    };
    animIdRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [todayFortuneId, archive]);

  const handleSelect = useCallback((entry: ArchiveEntry) => {
    setSelected(entry);
  }, []);

  const count        = Object.keys(archive).length;
  const circumference = 2*Math.PI*22;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:100,
      background:'rgba(6,5,15,0.97)',
      backdropFilter:'blur(20px)',
      display:'flex', flexDirection:'column',
      opacity: visible?1:0,
      transform: visible?'none':'translateY(16px)',
      transition:'opacity 0.35s ease, transform 0.35s ease',
    }}>
      <style>{`
        @keyframes archivePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes cardZoomIn {
          0%   { transform:scale(0.4) rotate(-6deg); opacity:0; filter:blur(8px); }
          60%  { transform:scale(1.08) rotate(2deg); opacity:1; filter:blur(0); }
          100% { transform:scale(1) rotate(0); opacity:1; }
        }
        @keyframes cardGlow {
          0%,100% { box-shadow: var(--glow-base); }
          50%     { box-shadow: var(--glow-pulse); }
        }
        @keyframes overlayFade { from{opacity:0} to{opacity:1} }

        .archive-grid {
          flex:1; overflow-y:auto;
          padding: 20px 16px 32px;
          display:grid;
          grid-template-columns: repeat(8, minmax(0,1fr));
          gap: 10px;
          align-content:start;
          max-width:1280px; width:100%; margin:0 auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .archive-grid::-webkit-scrollbar { display:none; width:0; height:0; }
        @media (max-width:1100px) { .archive-grid { grid-template-columns:repeat(6,minmax(0,1fr)); gap:10px; } }
        @media (max-width:768px)  { .archive-grid { grid-template-columns:repeat(5,minmax(0,1fr)); gap:9px; padding:16px 12px 28px; } }
        @media (max-width:540px)  { .archive-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; } }
        @media (max-width:380px)  { .archive-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; padding:14px 10px 24px; } }

        .archive-cell {
          position:relative;
          aspect-ratio:3/4;
          border-radius:8px;
          overflow:hidden;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:5px;
          transition:transform 0.22s ease, box-shadow 0.22s ease;
          -webkit-tap-highlight-color:transparent;
          user-select:none;
        }
        .archive-cell.has { cursor:pointer; }
        .archive-cell.has:hover { transform:translateY(-3px) scale(1.04); z-index:4; }
        .archive-cell.has:active { transform:scale(1.01); }
        .archive-cell.is-today { z-index:3; }

        .cell-hex {
          font-size: clamp(22px,4.5vw,32px);
          line-height:1; position:relative; z-index:1; pointer-events:none;
        }
        .cell-name {
          font-family:'Noto Serif SC',serif;
          font-size: clamp(11px,1.6vw,13px);
          letter-spacing:0.05em;
          position:relative; z-index:1; pointer-events:none;
          font-weight:500;
        }
        @media (max-width:540px) {
          .cell-hex  { font-size:28px; }
          .cell-name { font-size:12px; }
        }
        @media (max-width:380px) {
          .cell-hex  { font-size:24px; }
          .cell-name { font-size:11px; }
          .archive-cell { gap:4px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'22px 22px 14px',
        borderBottom:'1px solid rgba(200,169,110,0.1)',
        flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ position:'relative', width:52, height:52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(200,169,110,0.1)" strokeWidth="2.5"/>
              <circle cx="26" cy="26" r="22" fill="none" stroke="#C8A96E" strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${(count/64)*circumference} ${circumference}`}
                transform="rotate(-90 26 26)"
                style={{ transition:'stroke-dasharray 1s ease' }}
              />
            </svg>
            <span style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'Share Tech Mono,monospace', fontSize:'11px', color:'#C8A96E',
            }}>{count}</span>
          </div>
          <div>
            <div style={{
              fontFamily:"'ZCOOL XiaoWei','Noto Serif SC',serif",
              fontSize:'20px', letterSpacing:'0.14em',
              background:'linear-gradient(135deg,#E8C88A,#C8A96E)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>我的签</div>
            <div style={{
              fontFamily:'Share Tech Mono,monospace',
              fontSize:'10px', color:'#3A3458', letterSpacing:'0.12em', marginTop:'3px',
            }}>{count} / 64 已集齐</div>
          </div>
        </div>
        <button onClick={onClose} style={{
          width:34, height:34, borderRadius:'50%',
          background:'transparent', border:'1px solid rgba(200,169,110,0.25)',
          color:'#5C5480', fontSize:'13px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
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
              className={`archive-cell${has?' has':''}${isToday?' is-today':''}`}
              onClick={() => has && handleSelect(entry)}
              role={has?'button':undefined}
              tabIndex={has?0:-1}
              aria-label={has?`查看 ${f.hexagramName}卦`:undefined}
              onKeyDown={e => { if (has && (e.key==='Enter'||e.key===' ')) { e.preventDefault(); handleSelect(entry); } }}
              style={{
                border: isToday
                  ? `2px solid ${f.gradeColor}`
                  : has
                    ? '1px solid rgba(232,200,138,0.35)'
                    : '1px solid rgba(255,255,255,0.05)',
                background: isToday
                  ? `radial-gradient(circle at 50% 30%, ${f.gradeColor}35, #15102a 80%)`
                  : has
                    ? 'radial-gradient(circle at 50% 30%, rgba(232,200,138,0.12), #100c22 85%)'
                    : 'rgba(255,255,255,0.015)',
                boxShadow: isToday
                  ? `0 0 20px ${f.gradeColor}60, 0 0 40px ${f.gradeColor}30, 0 4px 16px rgba(0,0,0,0.6)`
                  : has
                    ? '0 2px 10px rgba(0,0,0,0.4)'
                    : 'none',
                transform: isToday ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* 粒子层 — 只今日签有 canvas，其他已集用 CSS glow */}
              {isToday && (
                <canvas
                  ref={el => { todayCanvasRef.current = el; }}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}
                />
              )}

              <span className="cell-hex" style={{
                opacity: isToday?1:has?0.92:0.15,
                color: isToday?f.gradeColor:has?'#F0D9A0':'#3A3458',
                filter: isToday
                  ? `drop-shadow(0 0 10px ${f.gradeColor})`
                  : has
                    ? 'drop-shadow(0 0 4px rgba(232,200,138,0.5))'
                    : 'none',
              }}>{f.hexagram}</span>

              <span className="cell-name" style={{
                color: isToday?f.gradeColor:has?'#C8A96E':'#2A2440',
                opacity: isToday?1:has?0.85:0.4,
              }}>{f.hexagramName}</span>

              {isToday && (
                <div style={{
                  position:'absolute', top:4, right:5,
                  width:5, height:5, borderRadius:'50%',
                  background:f.gradeColor,
                  boxShadow:`0 0 8px ${f.gradeColor}`,
                  animation:'archivePulse 2s ease-in-out infinite',
                  pointerEvents:'none',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── DETAIL 弹层 ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position:'fixed', inset:0, zIndex:110,
            background:'rgba(6,5,15,0.85)', backdropFilter:'blur(12px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'24px', animation:'overlayFade 0.25s ease', cursor:'pointer',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ['--glow-base' as string]: `0 0 60px ${selected.gradeColor}50, 0 0 120px ${selected.gradeColor}28, 0 20px 60px rgba(0,0,0,0.7)`,
              ['--glow-pulse' as string]: `0 0 90px ${selected.gradeColor}70, 0 0 180px ${selected.gradeColor}40, 0 20px 60px rgba(0,0,0,0.7)`,
              position:'relative',
              width:'min(340px,86vw)', aspectRatio:'3/4.2',
              borderRadius:'18px',
              border:`2px solid ${selected.gradeColor}`,
              background:`radial-gradient(circle at 50% 25%, ${selected.gradeColor}28 0%, #15102a 55%, #07060f 100%)`,
              padding:'36px 24px 28px',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'space-between',
              animation:'cardZoomIn 0.5s cubic-bezier(0.34,1.56,0.64,1), cardGlow 3s ease-in-out infinite 0.5s',
              cursor:'default',
            } as React.CSSProperties}
          >
            <button onClick={() => setSelected(null)} style={{
              position:'absolute', top:10, right:10,
              width:28, height:28, borderRadius:'50%',
              background:'rgba(0,0,0,0.4)', border:`1px solid ${selected.gradeColor}60`,
              color:selected.gradeColor, fontSize:'12px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>

            <div style={{
              padding:'4px 14px', borderRadius:'12px',
              border:`1px solid ${selected.gradeColor}`,
              background:`${selected.gradeColor}20`,
              color:selected.gradeColor,
              fontFamily:"'Noto Serif SC',serif",
              fontSize:'12px', letterSpacing:'0.16em', fontWeight:600,
              textShadow:`0 0 8px ${selected.gradeColor}80`,
            }}>{selected.gradeLabel}</div>

            <div style={{
              fontSize:'clamp(80px,22vw,120px)', lineHeight:1,
              color:selected.gradeColor,
              filter:`drop-shadow(0 0 28px ${selected.gradeColor}) drop-shadow(0 0 56px ${selected.gradeColor}80)`,
              fontFamily:"'ZCOOL XiaoWei',serif",
            }}>{selected.hexagram}</div>

            <div style={{
              fontFamily:"'ZCOOL XiaoWei',serif",
              fontSize:'26px', color:'#EDE8FF',
              letterSpacing:'0.18em',
              textShadow:`0 0 14px ${selected.gradeColor}80`,
            }}>{selected.hexagramName}卦</div>

            <p style={{
              fontFamily:"'Noto Serif SC',serif",
              fontSize:'13px', color:'#C8C0E8',
              lineHeight:1.7, letterSpacing:'0.06em',
              textAlign:'center', padding:'0 4px',
            }}>{selected.dailyTip}</p>

            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
              {selected.dates.slice(-3).reverse().map(d => (
                <span key={d} style={{
                  fontFamily:'Share Tech Mono,monospace',
                  fontSize:'10px', color:selected.gradeColor,
                  letterSpacing:'0.08em', padding:'3px 10px',
                  border:`1px solid ${selected.gradeColor}40`, borderRadius:'10px', opacity:0.85,
                }}>✦ {d}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
