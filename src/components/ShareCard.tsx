import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Fortune } from '@/lib/fortunes';
import { ParticleButton } from '@/components/ParticleButton';

interface ShareCardProps {
  fortune: Fortune;
  dateStr: string;
  onClose: () => void;
}

function isWechat(): boolean { return /MicroMessenger/i.test(navigator.userAgent); }
function isQQBrowser(): boolean { return /QQBrowser/i.test(navigator.userAgent) || /MQQBrowser/i.test(navigator.userAgent); }
function isRestrictedBrowser(): boolean { return isWechat() || isQQBrowser(); }

const SITE_URL = 'cyberfortune.hiconnie.com';
const SITE_URL_FULL = 'https://cyberfortune.hiconnie.com/';

export function ShareCard({ fortune, dateStr, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl,    setImageUrl]    = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [saveStatus,  setSaveStatus]  = useState<'idle'|'saving'|'saved'|'copied'>('idle');
  const restricted = isRestrictedBrowser();

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;

    // ── 竖版卡片尺寸，参考签文册卡片美学 ──
    const W = 750;
    const H = 1200;
    canvas.width  = W;
    canvas.height = H;

    // 背景
    ctx.fillStyle = '#090716';
    ctx.fillRect(0, 0, W, H);

    // 分层径向光场：和签文册详情卡一致，不再是纯黑底。
    const bgGlow = ctx.createRadialGradient(W/2, H*0.42, 0, W/2, H*0.42, W*0.78);
    bgGlow.addColorStop(0, `${fortune.gradeColor}32`);
    bgGlow.addColorStop(0.45, `${fortune.gradeColor}13`);
    bgGlow.addColorStop(1, 'rgba(9,7,22,0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, W, H);

    const footerGlow = ctx.createRadialGradient(W*0.78, H, 0, W*0.78, H, W*0.56);
    footerGlow.addColorStop(0, `${fortune.gradeColor}24`);
    footerGlow.addColorStop(1, 'rgba(9,7,22,0)');
    ctx.fillStyle = footerGlow;
    ctx.fillRect(0, H*0.72, W, H*0.28);

    // 单层内框：删除会形成纵向射线的多层外发光边框。
    ctx.save();
    ctx.strokeStyle = `${fortune.gradeColor}48`;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.roundRect(26, 26, W-52, H-52, 14); ctx.stroke();
    ctx.restore();

    // 与主页一致的柔和粒子背景：只保留漂浮光点，不绘制任何纵向网格或光束。
    ctx.save();
    for (let i = 0; i < 145; i++) {
      const x = 30 + Math.random()*(W-60);
      const y = 30 + Math.random()*(H-60);
      const r = Math.random()*1.8 + 0.35;
      const alpha = Math.random()*0.22 + 0.04;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180,160,100,${alpha})`;
      ctx.shadowColor = fortune.gradeColor;
      ctx.shadowBlur = r > 1.35 ? 7 : 0;
      ctx.fill();
    }
    ctx.restore();

    // ── HELPERS ──
    const ornament = (y: number) => {
      const cx = W/2;
      ['left','right'].forEach(side => {
        const x1 = side==='left' ? cx-180 : cx+24;
        const x2 = side==='left' ? cx-24  : cx+180;
        const lg = ctx.createLinearGradient(x1, y, x2, y);
        lg.addColorStop(side==='left'?0:1, 'rgba(200,169,110,0)');
        lg.addColorStop(side==='left'?1:0, 'rgba(200,169,110,0.55)');
        ctx.save(); ctx.strokeStyle=lg; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke(); ctx.restore();
      });
      ctx.save(); ctx.translate(cx,y); ctx.rotate(Math.PI/4);
      ctx.fillStyle='#C8A96E'; ctx.shadowColor='rgba(200,169,110,0.6)'; ctx.shadowBlur=8;
      ctx.fillRect(-5,-5,10,10); ctx.restore();
    };

    const divider = (y: number) => {
      const lg = ctx.createLinearGradient(60,y,W-60,y);
      lg.addColorStop(0,'rgba(200,169,110,0)');
      lg.addColorStop(0.3,`${fortune.gradeColor}50`);
      lg.addColorStop(0.7,`${fortune.gradeColor}50`);
      lg.addColorStop(1,'rgba(200,169,110,0)');
      ctx.save(); ctx.strokeStyle=lg; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(60,y); ctx.lineTo(W-60,y); ctx.stroke(); ctx.restore();
    };

    let Y = 60;

    // ── HEADER: 爻光 + 副标 + 日期 ──
    ornament(Y+8); Y += 52;

    ctx.save();
    const tGrad = ctx.createLinearGradient(W/2-100,0,W/2+100,0);
    tGrad.addColorStop(0,'#E8C88A'); tGrad.addColorStop(0.5,'#C8A96E'); tGrad.addColorStop(1,'#8A6A30');
    ctx.fillStyle=tGrad; ctx.font='700 68px "ZCOOL XiaoWei","Noto Serif SC",serif';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.shadowColor='rgba(200,169,110,0.45)'; ctx.shadowBlur=24;
    ctx.fillText('爻 光', W/2, Y); ctx.restore();
    Y += 84;

    // 副标题
    ctx.save();
    ctx.fillStyle='rgba(232,224,200,0.65)'; ctx.font='300 20px "Noto Serif SC",serif';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('每天一根签，看看今天运势', W/2, Y); ctx.restore();
    Y += 36;

    // 网址标签 — 紧跟副标题，视觉醒目
    ctx.save();
    ctx.font='500 18px "Share Tech Mono",monospace';
    const _urlW = ctx.measureText(SITE_URL).width + 32;
    const _urlH = 34, _urlX = W/2 - _urlW/2;
    ctx.fillStyle='rgba(200,169,110,0.1)';
    ctx.strokeStyle=`${fortune.gradeColor}80`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(_urlX, Y, _urlW, _urlH, 17); ctx.fill(); ctx.stroke();
    ctx.fillStyle=fortune.gradeColor;
    ctx.shadowColor=`${fortune.gradeColor}60`; ctx.shadowBlur=6;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(SITE_URL, W/2, Y+_urlH/2);
    ctx.restore();
    Y += _urlH + 20;

    // 日期 pill
    const pW=300, pH=40, pX=W/2-pW/2;
    ctx.save();
    ctx.strokeStyle='rgba(200,169,110,0.35)'; ctx.lineWidth=1;
    ctx.fillStyle='rgba(200,169,110,0.06)';
    ctx.beginPath(); ctx.roundRect(pX,Y,pW,pH,20); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#C8A96E'; ctx.font='400 20px "Noto Serif SC",serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(dateStr, W/2, Y+pH/2); ctx.restore();
    Y += pH+32;

    divider(Y); Y += 32;

    // ── HEXAGRAM HERO (签文册大卡风格) ──
    // 大卦象居中，配合径向背景
    ctx.save();
    ctx.font=`clamp(180px,38vw,220px) "ZCOOL XiaoWei","Noto Serif SC",serif`;
    ctx.font='220px "ZCOOL XiaoWei","Noto Serif SC",serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle=fortune.gradeColor;
    ctx.shadowColor=fortune.gradeColor; ctx.shadowBlur=60;
    ctx.globalAlpha=0.9;
    ctx.fillText(fortune.hexagram, W/2, Y+120); ctx.restore();
    Y += 255;

    // 卦名 + 等级
    ctx.save();
    ctx.font='700 52px "ZCOOL XiaoWei","Noto Serif SC",serif';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle='#F2E9D2';
    ctx.shadowColor=`${fortune.gradeColor}60`; ctx.shadowBlur=12;
    ctx.fillText(fortune.hexagramName+'卦', W/2, Y); ctx.restore();
    Y += 72;

    // 等级 badge 居中
    const bW=160, bH=48, bX=W/2-bW/2;
    ctx.save();
    ctx.strokeStyle=fortune.gradeColor; ctx.lineWidth=1.5; ctx.globalAlpha=0.9;
    ctx.fillStyle=fortune.gradeColor+'22';
    ctx.beginPath(); ctx.roundRect(bX,Y,bW,bH,24); ctx.fill(); ctx.stroke();
    ctx.fillStyle=fortune.gradeColor; ctx.globalAlpha=1;
    ctx.font='700 24px "Noto Serif SC",serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(fortune.gradeLabel, W/2, Y+bH/2); ctx.restore();
    Y += bH+36;

    divider(Y); Y += 32;

    // ── 白话指引（大字，核心内容）──
    ctx.save();
    ctx.font='400 32px "Noto Serif SC",serif';
    ctx.fillStyle='#EDE8FF';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.shadowColor='rgba(200,169,110,0.2)'; ctx.shadowBlur=8;
    // 自动换行
    const tipWords = fortune.dailyTip;
    const tipMaxW  = W - 120;
    let tipLine='', tipY=Y;
    for (let i=0; i<tipWords.length; i++) {
      const test = tipLine + tipWords[i];
      if (ctx.measureText(test).width > tipMaxW && i>0) {
        ctx.fillText(tipLine, W/2, tipY);
        tipLine=tipWords[i]; tipY+=48;
      } else { tipLine=test; }
    }
    ctx.fillText(tipLine, W/2, tipY);
    ctx.restore();
    Y = tipY + 56;

    divider(Y); Y += 28;

    // ── 运势分项 — 2x2 紧凑网格设计 ──
    ctx.save();
    ctx.font='600 26px "Noto Serif SC",serif';
    ctx.fillStyle='#E8D9B0';
    ctx.shadowColor='rgba(200,169,110,0.5)'; ctx.shadowBlur=12;
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('运  ·  势  ·  分  ·  项', W/2, Y); ctx.restore();
    Y += 44;

    const bars = [
      { label:'事业', value:fortune.career, color:'#C8A96E', icon:'✦' },
      { label:'财运', value:fortune.wealth, color:'#E8A040', icon:'❖' },
      { label:'感情', value:fortune.love,   color:'#D4849A', icon:'❀' },
      { label:'健康', value:fortune.health, color:'#7EB8A0', icon:'❉' },
    ];
    // 2 列 × 2 行
    const gridPadX = 70;
    const cellGap  = 24;
    const cellW    = (W - gridPadX*2 - cellGap) / 2;
    const cellH    = 64;
    bars.forEach((bar, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = gridPadX + col * (cellW + cellGap);
      const cy = Y + row * (cellH + 14);
      // 图标 + 标签 + 等级
      const grade = bar.value>=88?'极旺':bar.value>=72?'旺':bar.value>=55?'平':bar.value>=38?'低':'弱';
      ctx.save();
      ctx.font='400 16px "Noto Serif SC",serif';
      ctx.fillStyle=bar.color; ctx.globalAlpha=0.95;
      ctx.shadowColor=bar.color+'80'; ctx.shadowBlur=8;
      ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(bar.icon+' '+bar.label, cx, cy+10);
      ctx.font='600 14px "Share Tech Mono",monospace';
      ctx.textAlign='right'; ctx.shadowBlur=6;
      ctx.fillText(grade, cx+cellW, cy+10);
      ctx.restore();
      // 进度条
      const barY = cy+28, barH = 5;
      ctx.save();
      ctx.fillStyle='rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.roundRect(cx, barY, cellW, barH, 3); ctx.fill();
      const fW = (bar.value/100) * cellW;
      const bGrad=ctx.createLinearGradient(cx, 0, cx+fW, 0);
      bGrad.addColorStop(0, bar.color+'66'); bGrad.addColorStop(1, bar.color);
      ctx.fillStyle=bGrad; ctx.shadowColor=bar.color; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.roundRect(cx, barY, fW, barH, 3); ctx.fill();
      ctx.restore();
    });
    Y += 2 * (cellH + 14) - 14 + 12;

    // ── 底部邀请签名：二维码融入原生暗金设计 ──
    const footerY = 1088;
    divider(footerY);
    ctx.save();
    ctx.fillStyle = `${fortune.gradeColor}18`;
    ctx.fillRect(30, footerY + 1, W - 60, H - footerY - 30);
    ctx.restore();

    const qrCanvas = document.getElementById('qr-code-source')?.querySelector('canvas');
    if (qrCanvas) {
      const qrSize = 62;
      const qrX = W - qrSize - 76;
      const qrY = footerY + 14;

      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.save();
      ctx.fillStyle = fortune.gradeColor;
      ctx.font = '500 16px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('扫码抽取你的今日签', 70, footerY + 28);
      ctx.fillStyle = 'rgba(232,224,200,0.58)';
      ctx.font = '500 15px "Share Tech Mono", monospace';
      ctx.fillText(SITE_URL, 70, footerY + 58);
      ctx.restore();
    }

    setImageUrl(canvas.toDataURL('image/png'));
    setIsGenerating(false);
  }, [dateStr, fortune]);

  useEffect(() => { void generateCard(); }, [generateCard]);

  useEffect(() => {
    if (isGenerating) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    type PreviewParticle = {
      x: number; y: number; vx: number; vy: number;
      radius: number; alpha: number; decay: number; life: number; phase: number;
    };
    const particles: PreviewParticle[] = [];
    const spawnParticle = (fromBottom = true) => {
      particles.push({
        x: Math.random(),
        y: fromBottom ? 1.02 : Math.random(),
        vx: (Math.random() - 0.5) * 0.00018,
        vy: -(Math.random() * 0.00025 + 0.0001),
        radius: Math.random() * 1.35 + 0.35,
        alpha: Math.random() * 0.34 + 0.08,
        decay: Math.random() * 0.00022 + 0.0001,
        life: fromBottom ? 1 : Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    };
    for (let i = 0; i < 26; i++) spawnParticle(false);
    let lastTime = 0;
    let spawnAccumulator = 0;

    const draw = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const delta = Math.min(32, lastTime ? time - lastTime : 16);
      lastTime = time;
      ctx.clearRect(0, 0, width, height);
      spawnAccumulator += delta;
      if (spawnAccumulator >= 120 && particles.length < 42) {
        spawnParticle(true);
        spawnAccumulator = 0;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += (particle.vx + Math.sin(time * 0.001 + particle.y * 10 + particle.phase) * 0.00008) * delta;
        particle.y += particle.vy * delta;
        particle.life -= particle.decay * delta;
        if (particle.life <= 0 || particle.y < -0.04) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,160,100,${particle.alpha * particle.life})`;
        ctx.fill();
      }
      animationFrame = requestAnimationFrame(draw);
    };
    animationFrame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [fortune.gradeColor, isGenerating]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL_FULL);
      setSaveStatus('copied');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch { setSaveStatus('idle'); }
  };

  // 合并保存+分享：优先系统分享（含图片），不支持则下载
  const handleSaveShare = async () => {
    setSaveStatus('saving');
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], '爻光今日签.png', { type:'image/png' });
      if (navigator.canShare && navigator.canShare({ files:[file] })) {
        await navigator.share({
          files:[file], title:'爻光 · 今日签',
          text:`【爻光 · 每日一签】${fortune.hexagramName}卦 · ${fortune.gradeLabel}`,
        });
      } else {
        const a = document.createElement('a');
        a.href=imageUrl; a.download='爻光今日签.png'; a.click();
      }
      setSaveStatus('saved');
    } catch { setSaveStatus('idle'); }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div
      style={{
        position:'fixed', inset:0, zIndex:100,
        background:'rgba(7,6,15,0.93)',
        backdropFilter:'blur(12px)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'flex-start',
        padding:'24px 16px',
        overflowY:'auto',
        animation:'fadeIn 0.3s ease',
      }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shareCardPop{
          0%{opacity:0;transform:scale(.72) rotate(-2deg);filter:blur(10px)}
          62%{opacity:1;transform:scale(1.035) rotate(.45deg);filter:blur(0)}
          100%{opacity:1;transform:scale(1) rotate(0);filter:blur(0)}
        }
        .share-card-frame{position:relative;animation:shareCardPop .72s cubic-bezier(.2,.82,.25,1) both}
        .share-card-particles{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.8}
        @media(prefers-reduced-motion:reduce){.share-card-frame{animation:none}.share-card-particles{display:none}}
      `}</style>
      <canvas ref={canvasRef} style={{ display:'none' }} />

      {isGenerating ? (
        <div style={{ color:'#C8A96E', fontFamily:'Noto Serif SC,serif', fontSize:'18px', letterSpacing:'0.2em', marginTop:'40vh' }}>
          卦象生成中…
        </div>
      ) : (
        <div style={{
          width:'100%',
          maxWidth:'420px',
          display:'flex',
          flexDirection:'column',
          alignItems:'stretch',
          gap:'14px',
        }}>
          {/* 预览图 — 与下方按钮等宽 */}
          <div className="share-card-frame" style={{
            width:'100%',
            borderRadius:'16px',
            overflow:'hidden',
            boxShadow:'0 10px 48px rgba(0,0,0,0.68)',
            background:'#07060f',
          }}>
            <img src={imageUrl} alt="今日签卡片"
              style={{ width:'100%', height:'auto', display:'block' }} />
            <canvas ref={particleCanvasRef} className="share-card-particles" aria-hidden="true" />
          </div>

          {/* 统一的按钮区域 */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', width:'100%', flexShrink:0 }}>
            <ParticleButton variant="primary" onClick={handleSaveShare}>
              {saveStatus==='saving'?'生成中…':saveStatus==='saved'?'已保存 ✓':'保存 / 分享签文'}
            </ParticleButton>
            <ParticleButton variant="secondary" onClick={handleCopyUrl} icon="🔗" suffix={SITE_URL}>
              {saveStatus==='copied'?'已复制 ✓':'复制链接'}
            </ParticleButton>
          </div>

          {/* 只有在微信/QQ内显示柔和的引导提示 */}
          {restricted && (
            <p style={{
              margin:'8px 0 0',
              fontFamily:'Noto Serif SC,serif',
              fontSize:'12px',
              color:'rgba(200,169,110,0.5)',
              textAlign:'center'
            }}>
              温馨提示：微信内请长按图片手动保存或转发
            </p>
          )}

          <p style={{ margin:0, fontFamily:'Share Tech Mono,monospace', fontSize:'10px', color:'rgba(200,169,110,0.35)', letterSpacing:'0.12em', textAlign:'center', flexShrink:0 }}>
            点击空白处关闭
          </p>
        </div>
      )}
      {/* 隐藏的二维码，仅供 Canvas 抓取 */}
      <div id="qr-code-source" style={{ display: 'none' }}>
        <QRCodeCanvas
          value={SITE_URL_FULL}
          size={200}
          fgColor={fortune.gradeColor}
          bgColor="#0B0818"
          level="H"
          marginSize={3}
        />
      </div>
    </div>
  );
}
