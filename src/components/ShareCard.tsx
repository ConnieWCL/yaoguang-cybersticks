import { useEffect, useRef, useState } from 'react';
import type { Fortune } from '@/lib/fortunes';

interface ShareCardProps {
  fortune: Fortune;
  dateStr: string;
  onClose: () => void;
}

function isWechat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}
function isQQBrowser(): boolean {
  return /QQBrowser/i.test(navigator.userAgent) || /MQQBrowser/i.test(navigator.userAgent);
}
function isRestrictedBrowser(): boolean {
  return isWechat() || isQQBrowser();
}

const SITE_URL = 'yaoguang-cyberoracle.lovable.app';
const SITE_URL_FULL = 'https://yaoguang-cyberoracle.lovable.app';

export function ShareCard({ fortune, dateStr, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'copied'>('idle');
  const restricted = isRestrictedBrowser();

  useEffect(() => {
    generateCard();
  }, []);

  const generateCard = async () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const W = 750;
    const H = 1600;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = '#07060f';
    ctx.fillRect(0, 0, W, H);

    // Outer glow border
    const glowSteps = [
      { spread: 0,  blur: 80, alpha: 0.06 },
      { spread: 6,  blur: 48, alpha: 0.12 },
      { spread: 12, blur: 28, alpha: 0.20 },
      { spread: 17, blur: 12, alpha: 0.32 },
      { spread: 20, blur: 4,  alpha: 0.50 },
    ];
    glowSteps.forEach(({ spread, blur, alpha }) => {
      ctx.save();
      ctx.shadowColor = `rgba(200,169,110,${alpha})`;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = `rgba(200,169,110,${alpha * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(spread, spread, W - spread * 2, H - spread * 2, 20 - spread * 0.5);
      ctx.stroke();
      ctx.restore();
    });
    ctx.save();
    ctx.strokeStyle = 'rgba(200,169,110,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(22, 22, W - 44, H - 44, 12);
    ctx.stroke();
    ctx.restore();

    // Stars
    ctx.save();
    for (let i = 0; i < 140; i++) {
      const x = 28 + Math.random() * (W - 56);
      const y = 28 + Math.random() * (H - 56);
      const r = Math.random() * 1.4;
      const alpha = Math.random() * 0.4 + 0.08;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,180,120,${alpha})`;
      ctx.fill();
    }
    ctx.restore();

    // Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(180,155,80,0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 28); ctx.lineTo(x, H - 28); ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(28, y); ctx.lineTo(W - 28, y); ctx.stroke();
    }
    ctx.restore();

    // ── HELPERS ──
    const drawOrnamentLine = (y: number) => {
      const cx = W / 2;
      const lgL = ctx.createLinearGradient(cx - 180, y, cx - 24, y);
      lgL.addColorStop(0, 'rgba(200,169,110,0)');
      lgL.addColorStop(1, 'rgba(200,169,110,0.55)');
      ctx.save();
      ctx.strokeStyle = lgL; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 180, y); ctx.lineTo(cx - 24, y); ctx.stroke();
      ctx.translate(cx, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#C8A96E';
      ctx.shadowColor = 'rgba(200,169,110,0.6)'; ctx.shadowBlur = 8;
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
      const lgR = ctx.createLinearGradient(cx + 24, y, cx + 180, y);
      lgR.addColorStop(0, 'rgba(200,169,110,0.55)');
      lgR.addColorStop(1, 'rgba(200,169,110,0)');
      ctx.save();
      ctx.strokeStyle = lgR; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + 24, y); ctx.lineTo(cx + 180, y); ctx.stroke();
      ctx.restore();
    };

    const drawDivider = (y: number) => {
      const lg = ctx.createLinearGradient(60, y, W - 60, y);
      lg.addColorStop(0, 'rgba(200,169,110,0)');
      lg.addColorStop(0.3, 'rgba(200,169,110,0.25)');
      lg.addColorStop(0.7, 'rgba(200,169,110,0.25)');
      lg.addColorStop(1, 'rgba(200,169,110,0)');
      ctx.save();
      ctx.strokeStyle = lg; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke();
      ctx.restore();
    };

    // ── LAYOUT ──
    let curY = 60;
    drawOrnamentLine(curY + 8);
    curY += 52;

    // Title
    ctx.save();
    const titleGrad = ctx.createLinearGradient(W / 2 - 100, 0, W / 2 + 100, 0);
    titleGrad.addColorStop(0, '#E8C88A');
    titleGrad.addColorStop(0.5, '#C8A96E');
    titleGrad.addColorStop(1, '#8A6A30');
    ctx.fillStyle = titleGrad;
    ctx.font = '700 72px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(200,169,110,0.45)'; ctx.shadowBlur = 24;
    ctx.fillText('爻 光', W / 2, curY);
    ctx.restore();
    curY += 96;

    // 副标题 — 与站点 subtitle 同款：衬线 + 暖白
    ctx.save();
    ctx.fillStyle = 'rgba(232,224,200,0.78)';
    ctx.font = '300 24px "Noto Serif SC", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('每天一根签，看看今天运势怎么说', W / 2, curY);
    ctx.restore();
    curY += 50;

    // Date pill — 与站点 date-pill 同款
    const pillW = 320; const pillH = 44; const pillX = W / 2 - pillW / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(200,169,110,0.35)'; ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(200,169,110,0.06)';
    ctx.beginPath(); ctx.roundRect(pillX, curY, pillW, pillH, 22);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#C8A96E';
    ctx.font = '400 22px "Noto Serif SC", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(dateStr, W / 2, curY + pillH / 2);
    ctx.restore();
    curY += pillH + 36;

    drawDivider(curY);
    curY += 36;

    // Ghost number — 编号水印
    ctx.save();
    ctx.font = '700 148px "Share Tech Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = fortune.gradeColor; ctx.globalAlpha = 0.08;
    ctx.fillText(String(fortune.id).padStart(2, '0'), 44, curY - 20);
    ctx.restore();

    // 卦象大字
    ctx.save();
    ctx.font = '92px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = `${fortune.gradeColor}30`;
    ctx.fillText(fortune.hexagram, 52, curY);
    ctx.restore();

    // 卦名 — 与站点 hero-title 同色（暖白衬线）
    ctx.save();
    ctx.font = '700 56px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#F2E9D2';
    ctx.shadowColor = 'rgba(200,169,110,0.25)'; ctx.shadowBlur = 10;
    ctx.fillText(fortune.hexagramName, 210, curY + 4);
    ctx.restore();

    // 等级 badge
    const badgeW = 152; const badgeH = 48;
    const badgeX = 210; const badgeY = curY + 72;
    ctx.save();
    ctx.strokeStyle = fortune.gradeColor; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9;
    ctx.fillStyle = fortune.gradeColor + '20';
    ctx.beginPath(); ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 24);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = fortune.gradeColor; ctx.globalAlpha = 1;
    ctx.font = '700 24px "Noto Serif SC", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fortune.gradeLabel, badgeX + badgeW / 2, badgeY + badgeH / 2);
    ctx.restore();
    curY += 148;

    drawDivider(curY);
    curY += 40;

    // 签诗 — 暖白衬线
    ctx.save();
    ctx.fillStyle = '#C8A96E'; ctx.shadowColor = 'rgba(200,169,110,0.4)'; ctx.shadowBlur = 6;
    ctx.fillRect(58, curY, 3, fortune.poem.length * 66);
    ctx.restore();
    fortune.poem.forEach((line, i) => {
      ctx.save();
      ctx.font = '400 32px "ZCOOL XiaoWei", "Noto Serif SC", serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#F2E9D2';
      ctx.fillText(line, 76, curY + 33 + i * 66);
      ctx.restore();
    });
    curY += fortune.poem.length * 66 + 52;

    // 解读 — 与站点 interpret 同款
    ctx.save();
    ctx.font = '300 26px "Noto Serif SC", serif';
    ctx.fillStyle = 'rgba(232,224,200,0.78)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const maxW = W - 116;
    let word = '';
    let lineY = curY;
    const LINE_H = 46;
    for (let i = 0; i < fortune.interpretation.length; i++) {
      const test = word + fortune.interpretation[i];
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(word, 58, lineY);
        word = fortune.interpretation[i];
        lineY += LINE_H;
      } else {
        word = test;
      }
    }
    ctx.fillText(word, 58, lineY);
    ctx.restore();
    curY = lineY + LINE_H + 44;

    drawDivider(curY);
    curY += 32;

    // Luck bars
    ctx.save();
    ctx.font = '700 28px "Noto Serif SC", "ZCOOL XiaoWei", serif';
    ctx.fillStyle = '#E8C88A';
    ctx.shadowColor = 'rgba(200,169,110,0.4)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('运势分项', 58, curY);
    ctx.restore();
    curY += 50;

    const bars = [
      { label: '事业', value: fortune.career,  color: '#C8A96E' },
      { label: '财运', value: fortune.wealth,  color: '#E8A040' },
      { label: '感情', value: fortune.love,    color: '#D4849A' },
      { label: '健康', value: fortune.health,  color: '#7EB8A0' },
    ];
    bars.forEach((bar) => {
      ctx.save();
      ctx.font = '600 26px "ZCOOL XiaoWei", "Noto Serif SC", serif';
      ctx.fillStyle = '#F2E9D2';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(bar.label, 58, curY + 14);
      const trackX = 130; const trackW = W - 246; const trackH = 8;
      ctx.fillStyle = 'rgba(200,169,110,0.12)';
      ctx.beginPath(); ctx.roundRect(trackX, curY + 10, trackW, trackH, 4); ctx.fill();
      const fillW = (bar.value / 100) * trackW;
      const barGrad = ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
      barGrad.addColorStop(0, bar.color + 'AA');
      barGrad.addColorStop(1, bar.color);
      ctx.fillStyle = barGrad; ctx.shadowColor = bar.color; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.roundRect(trackX, curY + 10, fillW, trackH, 4); ctx.fill();
      ctx.restore();
      ctx.save();
      const grade = bar.value >= 85 ? '极旺' : bar.value >= 70 ? '旺' : bar.value >= 55 ? '平' : '低';
      ctx.font = '600 22px "Noto Serif SC", serif';
      ctx.fillStyle = bar.color;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(grade, W - 58, curY + 14);
      ctx.restore();
      curY += 52;
    });
    curY += 32;

    drawDivider(curY);
    curY += 40;

    // ── FOOTER: 左列品牌 + 右列网址 ──

    // 左列：爻光
    ctx.save();
    const brandGrad = ctx.createLinearGradient(58, 0, 300, 0);
    brandGrad.addColorStop(0, '#E8C88A');
    brandGrad.addColorStop(1, '#C8A96E');
    ctx.fillStyle = brandGrad;
    ctx.font = '700 48px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(200,169,110,0.4)'; ctx.shadowBlur = 16;
    ctx.fillText('爻光', 58, curY);
    ctx.restore();

    // 副标语
    ctx.save();
    ctx.font = '300 20px "Noto Serif SC", serif';
    ctx.fillStyle = 'rgba(232,224,200,0.7)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('一爻一光，日日新启', 58, curY + 62);
    ctx.restore();

    // 免责
    ctx.save();
    ctx.font = '300 16px "Noto Serif SC", serif';
    ctx.fillStyle = 'rgba(200,169,110,0.5)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('仅供娱乐，不影响真实命运', 58, curY + 92);
    ctx.restore();

    // 右列：网址 pill
    ctx.save();
    ctx.font = '600 20px "Share Tech Mono", monospace';
    const urlW = ctx.measureText(SITE_URL).width + 36;
    const urlH = 44;
    const urlX = W - 58 - urlW;
    const urlY = curY + 24;
    ctx.fillStyle = 'rgba(200,169,110,0.1)';
    ctx.strokeStyle = 'rgba(200,169,110,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(urlX, urlY, urlW, urlH, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#E8C88A';
    ctx.shadowColor = 'rgba(200,169,110,0.4)'; ctx.shadowBlur = 8;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(SITE_URL, urlX + 18, urlY + urlH / 2);
    ctx.restore();

    curY += 128;
    drawOrnamentLine(curY + 8);

    setImageUrl(canvas.toDataURL('image/png'));
    setIsGenerating(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL_FULL);
      setSaveStatus('copied');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], '爻光今日签.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '爻光 · 今日签' });
      } else {
        const a = document.createElement('a');
        a.href = imageUrl; a.download = '爻光今日签.png'; a.click();
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('idle');
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleShare = async () => {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], '爻光今日签.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '爻光 · 今日签',
          text: `【爻光 · 每日一签】${fortune.hexagramName}卦 · ${fortune.gradeLabel}`,
        });
      } else {
        handleSave();
      }
    } catch {}
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(7,6,15,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96) }
          to   { opacity: 1; transform: scale(1) }
        }
      `}</style>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {isGenerating ? (
        <div style={{
          color: '#C8A96E', fontFamily: 'Noto Serif SC, serif',
          fontSize: '18px', letterSpacing: '0.2em',
        }}>
          卦象生成中…
        </div>
      ) : (
        <>
          {/* 图片预览 */}
          <div style={{
            flex: 1,
            maxHeight: 'calc(100dvh - 200px)',
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: `
              0 0 80px rgba(200,169,110,0.18),
              0 0 40px rgba(200,169,110,0.12),
              0 8px 48px rgba(0,0,0,0.6)
            `,
          }}>
            <img
              src={imageUrl}
              alt="今日签卡片"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain', display: 'block',
                borderRadius: '16px',
              }}
            />
          </div>

          {/* 微信/QQ浏览器：专属提示 */}
          {restricted ? (
            <div style={{
              marginTop: '16px',
              width: '100%', maxWidth: '400px',
              background: 'rgba(200,169,110,0.08)',
              border: '1px solid rgba(200,169,110,0.3)',
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <p style={{
                color: '#C8A96E',
                fontFamily: 'Noto Serif SC, serif',
                fontSize: '14px',
                lineHeight: '1.8',
                marginBottom: '8px',
              }}>
                长按上方图片保存到相册
              </p>
              <p style={{
                color: '#5C5480',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.06em',
              }}>
                微信/QQ浏览器限制 · 请在外部浏览器打开以使用完整功能
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', gap: '10px',
              marginTop: '16px',
              width: '100%', maxWidth: '400px',
            }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: '13px 8px',
                background: 'linear-gradient(135deg, #8A6A30, #C8A96E)',
                border: 'none', borderRadius: '8px',
                color: '#07060f', fontFamily: 'Noto Serif SC, serif',
                fontSize: '15px', fontWeight: 700,
                letterSpacing: '0.1em', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(200,169,110,0.25)',
              }}>
                {saveStatus === 'saving' ? '生成中…' : saveStatus === 'saved' ? '已保存 ✓' : '保存图片'}
              </button>
              <button onClick={handleShare} style={{
                flex: 1, padding: '13px 8px',
                background: 'transparent',
                border: '1px solid rgba(200,169,110,0.35)',
                borderRadius: '8px',
                color: '#C8A96E', fontFamily: 'Noto Serif SC, serif',
                fontSize: '15px', letterSpacing: '0.1em', cursor: 'pointer',
              }}>
                分享给朋友
              </button>
            </div>
          )}

          {/* 可复制网址行 — 所有环境显示 */}
          <div style={{
            marginTop: '10px',
            width: '100%', maxWidth: '400px',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(200,169,110,0.06)',
            border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
          }}>
            <span style={{
              flex: 1,
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '12px',
              color: '#A89EC8',
              letterSpacing: '0.04em',
              userSelect: 'all',
            }}>
              {SITE_URL}
            </span>
            <button
              onClick={handleCopyUrl}
              style={{
                padding: '4px 12px',
                background: 'transparent',
                border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: '6px',
                color: '#C8A96E',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '11px',
                cursor: 'pointer', flexShrink: 0,
                letterSpacing: '0.06em',
              }}
            >
              {saveStatus === 'copied' ? '已复制 ✓' : '复制链接'}
            </button>
          </div>

          <p style={{
            marginTop: '10px',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px', color: '#3A3458', letterSpacing: '0.1em',
          }}>
            点击空白处关闭
          </p>
        </>
      )}
    </div>
  );
}
