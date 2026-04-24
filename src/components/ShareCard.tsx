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

  useEffect(() => { 
    // 确保字体加载后再生成，防止 Canvas 渲染默认字体
    document.fonts.ready.then(() => {
      generateCard();
    });
  }, []);

  const generateCard = async () => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;

    // 标准海报尺寸
    const W = 750;
    const H = 1334;
    canvas.width  = W;
    canvas.height = H;

    // 1. 深邃背景
    ctx.fillStyle = '#07060f';
    ctx.fillRect(0, 0, W, H);

    // 2. 巨大的背景卦象 (底纹感)
    ctx.save();
    ctx.font = '700 600px "ZCOOL XiaoWei", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fortune.gradeColor;
    ctx.globalAlpha = 0.04; // 极低透明度，若隐若现
    ctx.fillText(fortune.hexagram, W/2, H/2);
    ctx.restore();

    // 3. 装饰线条与边框
    const margin = 40;
    ctx.strokeStyle = `${fortune.gradeColor}40`;
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, W - margin*2, H - margin*2);

    // 4. 头部：Logo 与 日期
    ctx.fillStyle = '#C8A96E';
    ctx.font = '700 40px "ZCOOL XiaoWei", serif';
    ctx.textAlign = 'left';
    ctx.fillText('爻光 · 赛博抽签', margin + 30, margin + 70);
    
    ctx.textAlign = 'right';
    ctx.font = '400 20px "Share Tech Mono", monospace';
    ctx.fillText(dateStr, W - margin - 30, margin + 65);

    // 5. 核心区：竖排诗句 (营造古典氛围)
    const poemX = W - margin - 100;
    const poemY = margin + 180;
    ctx.save();
    ctx.font = '400 34px "Noto Serif SC", serif';
    ctx.fillStyle = '#EDE8FF';
    ctx.textAlign = 'center';
    // 简单的竖排实现
    const poemText = fortune.dailyTip || "天机流转，顺势而为";
    for (let i = 0; i < poemText.length; i++) {
        ctx.fillText(poemText[i], poemX, poemY + i * 50);
    }
    ctx.restore();

    // 6. 卦名大字
    ctx.save();
    ctx.font = '700 120px "ZCOOL XiaoWei", serif';
    ctx.fillStyle = fortune.gradeColor;
    ctx.shadowColor = fortune.gradeColor;
    ctx.shadowBlur = 30;
    ctx.fillText(fortune.hexagram, margin + 80, margin + 300);
    
    ctx.font = '400 40px "ZCOOL XiaoWei", serif';
    ctx.fillStyle = '#F2E9D2';
    ctx.fillText(`${fortune.hexagramName}卦`, margin + 80, margin + 400);
    ctx.restore();

    // 7. 运势详情区 (分项进度条)
    let infoY = margin + 550;
    const drawBar = (label: string, value: number, color: string) => {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '400 20px "Noto Serif SC", serif';
        ctx.fillText(label, margin + 80, infoY);
        
        const barW = 200;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(margin + 160, infoY - 15, barW, 6);
        
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(margin + 160, infoY - 15, (value / 100) * barW, 6);
        ctx.shadowBlur = 0;
        infoY += 50;
    };

    drawBar('事业', fortune.career, '#C8A96E');
    drawBar('财运', fortune.wealth, '#E8A040');
    drawBar('感情', fortune.love,   '#D4849A');
    drawBar('健康', fortune.health, '#7EB8A0');

    // 8. 幸运属性卡片
    infoY += 40;
    ctx.fillStyle = 'rgba(200,169,110,0.1)';
    ctx.roundRect(margin + 70, infoY, 400, 160, 12);
    ctx.fill();
    
    ctx.fillStyle = '#C8A96E';
    ctx.font = '400 18px "Noto Serif SC", serif';
    ctx.fillText(`幸运色：${fortune.luckyColor || '未定'}`, margin + 100, infoY + 50);
    ctx.fillText(`幸运数：${fortune.luckyNumber || '7'}`, margin + 100, infoY + 90);
    ctx.fillText(`贵人：${fortune.luckyPerson || '属龙、属蛇'}`, margin + 100, infoY + 130);

    // 9. 底部：二维码与版权 (建议你后期把这个 URL 换成真正的二维码图片)
    const footerY = H - margin - 100;
    ctx.strokeStyle = `${fortune.gradeColor}60`;
    ctx.beginPath();
    ctx.moveTo(margin + 30, footerY);
    ctx.lineTo(W - margin - 30, footerY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '400 16px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(SITE_URL_FULL, W/2, footerY + 50);
    ctx.fillText('一 爻 一 光 · 扫 码 续 缘', W/2, footerY + 80);

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
        background:'rgba(7,6,15,0.95)',
        backdropFilter:'blur(15px)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'20px',
        animation:'fadeIn 0.3s ease',
      }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <canvas ref={canvasRef} style={{ display:'none' }} />

      {isGenerating ? (
        <div style={{ color:'#C8A96E', fontFamily:'Noto Serif SC,serif', fontSize:'18px', letterSpacing:'0.2em' }}>
          正在推演天机…
        </div>
      ) : (
        <>
          <div style={{
            flex:1, maxHeight:'calc(100dvh - 220px)',
            overflow:'hidden', borderRadius:'12px',
            boxShadow:`0 0 50px rgba(0,0,0,0.8), 0 0 30px ${fortune.gradeColor}20`,
            border: `1px solid ${fortune.gradeColor}30`
          }}>
            <img src={imageUrl} alt="分享卡片"
              style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'20px', width:'100%', maxWidth:'360px' }}>
            <ParticleButton variant="primary" onClick={handleSaveShare}>
              {saveStatus==='saving'?'生成中…':saveStatus==='saved'?'已保存 ✓':'保存至相册 / 分享'}
            </ParticleButton>
            
            {restricted && (
               <p style={{ color:'#5C5480', fontSize:'11px', textAlign:'center', opacity:0.8 }}>
                 微信/QQ内请长按图片手动保存
               </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
