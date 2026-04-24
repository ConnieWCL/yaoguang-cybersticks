import { useEffect, useRef, useState } from 'react';
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

const SITE_URL      = 'yaoguang-cyberoracle.lovable.app';
const SITE_URL_FULL = 'https://yaoguang-cyberoracle.lovable.app';

export function ShareCard({ fortune, dateStr, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl,    setImageUrl]    = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [saveStatus,  setSaveStatus]  = useState<'idle'|'saving'|'saved'|'copied'>('idle');
  const restricted = isRestrictedBrowser();

  useEffect(() => { generateCard(); }, []);

  const generateCard = async () => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;

    // ── 竖版卡片尺寸，参考签文册卡片美学 ──
    const W = 750;
    const H = 1200;
    canvas.width  = W;
    canvas.height = H;

    // 背景
    ctx.fillStyle = '#07060f';
    ctx.fillRect(0, 0, W, H);

    // 径向渐变背景光晕（呼应签文册卡片的 radial-gradient）
    const bgGlow = ctx.createRadialGradient(W/2, H*0.35, 0, W/2, H*0.35, W*0.7);
    bgGlow.addColorStop(0, `${fortune.gradeColor}18`);
    bgGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, W, H);

    // 外发光边框（多层）
    [
      { spread:0,  blur:80, alpha:0.07 },
      { spread:6,  blur:48, alpha:0.14 },
      { spread:12, blur:24, alpha:0.22 },
      { spread:18, blur:8,  alpha:0.38 },
      { spread:21, blur:3,  alpha:0.55 },
    ].forEach(({ spread, blur, alpha }) => {
      ctx.save();
      ctx.shadowColor = `${fortune.gradeColor}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
      ctx.shadowBlur  = blur;
      ctx.strokeStyle = `rgba(200,169,110,${alpha * 0.7})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.roundRect(spread, spread, W-spread*2, H-spread*2, 20);
      ctx.stroke();
      ctx.restore();
    });
    // 清晰内框线
    ctx.save();
    ctx.strokeStyle = `${fortune.gradeColor}70`;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.roundRect(22, 22, W-44, H-44, 14); ctx.stroke();
    ctx.restore();

    // 星点
    ctx.save();
    for (let i = 0; i < 120; i++) {
      const x = 30 + Math.random()*(W-60);
      const y = 30 + Math.random()*(H-60);
      const r = Math.random()*1.3;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,180,120,${Math.random()*0.4+0.06})`;
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
    ctx.font='400 16px "Noto Serif SC",serif';
    ctx.fillStyle='rgba(200,169,110,0.45)';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.letterSpacing = '0.3em';
    ctx.fillText('运  势  分  项', W/2, Y); ctx.restore();
    Y += 32;

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

    divider(Y); Y += 24;

    // ── FOOTER: slogan 小字 ──
    ctx.save();
    ctx.font='300 16px "Noto Serif SC",serif';
    ctx.fillStyle='rgba(200,169,110,0.38)';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('一爻一光  日日新启', W/2, Y);
    ctx.restore();
    Y += 30;

    ornament(Y);

    setImageUrl(canvas.toDataURL('image/png'));
    setIsGenerating(false);
  };

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
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
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
          <div style={{
            width:'100%',
            borderRadius:'16px',
            overflow:'hidden',
            boxShadow:`0 0 60px ${fortune.gradeColor}30, 0 0 120px ${fortune.gradeColor}15, 0 8px 48px rgba(0,0,0,0.6)`,
            background:'#07060f',
          }}>
            <img src={imageUrl} alt="今日签卡片"
              style={{ width:'100%', height:'auto', display:'block' }} />
          </div>

          {/* 微信/QQ 提示 */}
          {restricted ? (
            <div style={{
              width:'100%',
              background:'rgba(200,169,110,0.08)', border:'1px solid rgba(200,169,110,0.3)',
              borderRadius:'12px', padding:'14px 16px', textAlign:'center',
            }}>
              <p style={{ color:'#C8A96E', fontFamily:'Noto Serif SC,serif', fontSize:'14px', lineHeight:'1.8', marginBottom:'8px' }}>
                长按上方图片保存到相册
              </p>
              <p style={{ color:'#5C5480', fontFamily:'Share Tech Mono,monospace', fontSize:'11px', letterSpacing:'0.06em' }}>
                微信/QQ浏览器限制 · 请在外部浏览器打开以使用完整功能
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%' }}>
              <ParticleButton variant="primary" onClick={handleSaveShare}>
                {saveStatus==='saving'?'生成中…':saveStatus==='saved'?'已保存 ✓':'保存 / 分享签文'}
              </ParticleButton>
              <ParticleButton variant="secondary" onClick={handleCopyUrl} icon="🔗" suffix={SITE_URL}>
                {saveStatus==='copied'?'已复制 ✓':'复制链接'}
              </ParticleButton>
            </div>
          )}

          <p style={{ marginTop:'4px', fontFamily:'Share Tech Mono,monospace', fontSize:'10px', color:'rgba(200,169,110,0.35)', letterSpacing:'0.12em', textAlign:'center' }}>
            点击空白处关闭
          </p>
        </div>
      )}
    </div>
  );
}
