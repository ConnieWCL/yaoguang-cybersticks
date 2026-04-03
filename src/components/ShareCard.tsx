import { useEffect, useRef, useState } from 'react';
import type { Fortune } from '@/lib/fortunes';

interface ShareCardProps {
  fortune: Fortune;
  dateStr: string;
  onClose: () => void;
}

export function ShareCard({ fortune, dateStr, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    generateCard();
  }, []);

  const generateCard = async () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    // Card dimensions — 小红书standard
    const W = 750;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    // ── BACKGROUND ──
    ctx.fillStyle = '#07060f';
    ctx.fillRect(0, 0, W, H);

    // Star particles
    ctx.save();
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 1.5;
      const alpha = Math.random() * 0.5 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 180, 120, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();

    // Subtle grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(180,155,80,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // ── HEADER ORNAMENT ──
    const drawOrnamentLine = (y: number) => {
      const cx = W / 2;
      // Left line
      const lgLeft = ctx.createLinearGradient(cx - 160, y, cx - 20, y);
      lgLeft.addColorStop(0, 'rgba(200,169,110,0)');
      lgLeft.addColorStop(1, 'rgba(200,169,110,0.6)');
      ctx.strokeStyle = lgLeft;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 160, y); ctx.lineTo(cx - 20, y); ctx.stroke();
      // Diamond
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#C8A96E';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
      // Right line
      const lgRight = ctx.createLinearGradient(cx + 20, y, cx + 160, y);
      lgRight.addColorStop(0, 'rgba(200,169,110,0.6)');
      lgRight.addColorStop(1, 'rgba(200,169,110,0)');
      ctx.strokeStyle = lgRight;
      ctx.beginPath(); ctx.moveTo(cx + 20, y); ctx.lineTo(cx + 160, y); ctx.stroke();
    };
    drawOrnamentLine(72);

    // ── TITLE ──
    ctx.save();
    const titleGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
    titleGrad.addColorStop(0, '#E8C88A');
    titleGrad.addColorStop(0.5, '#C8A96E');
    titleGrad.addColorStop(1, '#8A6A30');
    ctx.fillStyle = titleGrad;
    ctx.font = 'bold 72px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(200,169,110,0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText('爻光', W / 2, 130);
    ctx.restore();

    // Subtitle
    ctx.save();
    ctx.fillStyle = 'rgba(126,184,160,0.8)';
    ctx.font = '24px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText('賽博問簽 · Cyber Oracle', W / 2, 175);
    ctx.restore();

    // Date pill
    ctx.save();
    const pillW = 280; const pillH = 36; const pillX = W / 2 - pillW / 2; const pillY = 200;
    ctx.strokeStyle = 'rgba(200,169,110,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 18);
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,169,110,0.05)';
    ctx.fill();
    ctx.fillStyle = '#5C5480';
    ctx.font = '20px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(dateStr, W / 2, pillY + 22);
    ctx.restore();

    // ── DIVIDER ──
    const drawDivider = (y: number) => {
      ctx.save();
      const lg = ctx.createLinearGradient(60, y, W - 60, y);
      lg.addColorStop(0, 'rgba(200,169,110,0)');
      lg.addColorStop(0.3, 'rgba(200,169,110,0.3)');
      lg.addColorStop(0.7, 'rgba(200,169,110,0.3)');
      lg.addColorStop(1, 'rgba(200,169,110,0)');
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke();
      ctx.restore();
    };
    drawDivider(258);

    // ── HEXAGRAM + GRADE ──
    // Big hexagram
    ctx.save();
    ctx.font = '96px serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(200,169,110,0.15)';
    ctx.fillText(fortune.hexagram, 60, 380);
    ctx.restore();

    // Stick number
    ctx.save();
    ctx.font = 'bold 120px "Share Tech Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = fortune.gradeColor;
    ctx.globalAlpha = 0.12;
    ctx.fillText(String(fortune.id).padStart(2, '0'), 55, 410);
    ctx.restore();

    // 卦名
    ctx.save();
    ctx.font = 'bold 52px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#EDE8FF';
    ctx.fillText(fortune.hexagramName, 200, 340);
    ctx.restore();

    // Grade badge
    ctx.save();
    const badgeW = 140; const badgeH = 44;
    const badgeX = 200; const badgeY = 356;
    ctx.strokeStyle = fortune.gradeColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22);
    ctx.stroke();
    ctx.fillStyle = fortune.gradeColor + '18';
    ctx.fill();
    ctx.fillStyle = fortune.gradeColor;
    ctx.globalAlpha = 1;
    ctx.font = 'bold 24px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(fortune.gradeLabel, badgeX + badgeW / 2, badgeY + 28);
    ctx.restore();

    // ── POEM ──
    // Left gold bar
    ctx.save();
    ctx.fillStyle = '#8A6A30';
    ctx.fillRect(60, 430, 3, fortune.poem.length * 52);
    ctx.restore();

    fortune.poem.forEach((line, i) => {
      ctx.save();
      ctx.font = '300 32px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#EDE8FF';
      ctx.letterSpacing = '4px';
      ctx.fillText(line, 78, 462 + i * 52);
      ctx.restore();
    });

    // ── INTERPRETATION ──
    const interpY = 430 + fortune.poem.length * 52 + 24;
    ctx.save();
    ctx.font = '26px "Noto Serif SC", serif';
    ctx.fillStyle = '#A89EC8';
    ctx.textAlign = 'left';
    // Word wrap
    const maxWidth = W - 120;
    const words = fortune.interpretation;
    let line = '';
    let lineY = interpY;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line, 60, lineY);
        line = words[i];
        lineY += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, lineY);
    ctx.restore();

    // ── DIVIDER ──
    const luckY = lineY + 48;
    drawDivider(luckY);

    // ── LUCK BARS ──
    const bars = [
      { label: '事业', value: fortune.career,  color: '#C8A96E' },
      { label: '财运', value: fortune.wealth,  color: '#E8A040' },
      { label: '感情', value: fortune.love,    color: '#D4849A' },
      { label: '健康', value: fortune.health,  color: '#7EB8A0' },
    ];

    // Section label
    ctx.save();
    ctx.font = '20px "Share Tech Mono", monospace';
    ctx.fillStyle = '#3A3458';
    ctx.textAlign = 'left';
    ctx.fillText('FORTUNE INDEX', 60, luckY + 32);
    ctx.restore();

    bars.forEach((bar, i) => {
      const by = luckY + 56 + i * 48;
      // Label
      ctx.save();
      ctx.font = '26px "Noto Serif SC", serif';
      ctx.fillStyle = '#5C5480';
      ctx.textAlign = 'left';
      ctx.fillText(bar.label, 60, by + 18);
      // Track
      const trackX = 120; const trackW = W - 240; const trackH = 6;
      ctx.fillStyle = '#211e38';
      ctx.beginPath();
      ctx.roundRect(trackX, by + 8, trackW, trackH, 3);
      ctx.fill();
      // Fill
      const fillW = (bar.value / 100) * trackW;
      ctx.fillStyle = bar.color;
      ctx.shadowColor = bar.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(trackX, by + 8, fillW, trackH, 3);
      ctx.fill();
      ctx.restore();
      // Grade text
      ctx.save();
      ctx.font = '22px "Share Tech Mono", monospace';
      ctx.fillStyle = bar.color;
      ctx.textAlign = 'right';
      const grade = bar.value >= 85 ? '极旺' : bar.value >= 70 ? '旺' : bar.value >= 55 ? '平' : '低';
      ctx.fillText(grade, W - 60, by + 18);
      ctx.restore();
    });

    // ── BOTTOM DIVIDER ──
    const bottomY = luckY + 56 + bars.length * 48 + 24;
    drawDivider(bottomY);

    // ── FOOTER ──
    // QR code placeholder (simple box)
    const qrX = 60; const qrY = bottomY + 20; const qrSize = 80;
    ctx.save();
    ctx.strokeStyle = 'rgba(200,169,110,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    // QR pattern hint
    ctx.fillStyle = 'rgba(200,169,110,0.15)';
    ctx.fillRect(qrX + 4, qrY + 4, 24, 24);
    ctx.fillRect(qrX + 52, qrY + 4, 24, 24);
    ctx.fillRect(qrX + 4, qrY + 52, 24, 24);
    ctx.fillRect(qrX + 28, qrY + 28, 24, 24);
    ctx.restore();

    // Brand name
    ctx.save();
    ctx.font = 'bold 36px "ZCOOL XiaoWei", "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    const brandGrad = ctx.createLinearGradient(160, 0, 400, 0);
    brandGrad.addColorStop(0, '#E8C88A');
    brandGrad.addColorStop(1, '#C8A96E');
    ctx.fillStyle = brandGrad;
    ctx.fillText('爻光 · 赛博签', 160, qrY + 36);
    ctx.restore();

    ctx.save();
    ctx.font = '20px "Share Tech Mono", monospace';
    ctx.fillStyle = '#3A3458';
    ctx.textAlign = 'left';
    ctx.fillText('yaoguang-cybersticks.lovable.app', 160, qrY + 62);
    ctx.restore();

    ctx.save();
    ctx.font = '20px "Noto Serif SC", serif';
    ctx.fillStyle = '#3A3458';
    ctx.textAlign = 'left';
    ctx.fillText('每日一签 · 仅供娱乐', 160, qrY + 86);
    ctx.restore();

    // Bottom ornament
    drawOrnamentLine(H - 40);

    setImageUrl(canvas.toDataURL('image/png'));
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Try Web Share API with file first
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], '爻光今日签.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '爻光 · 今日签' });
        setSaveStatus('saved');
      } else {
        // Fallback: download
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = '爻光今日签.png';
        a.click();
        setSaveStatus('saved');
      }
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
        await navigator.share({ files: [file], title: '爻光 · 今日签', text: `【爻光 · 每日一签】${fortune.hexagramName}卦 · ${fortune.gradeLabel}` });
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
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {isGenerating ? (
        <div style={{ color: '#C8A96E', fontFamily: 'Noto Serif SC, serif', fontSize: '18px', letterSpacing: '0.2em' }}>
          卦象生成中…
        </div>
      ) : (
        <>
          {/* Preview image */}
          <div style={{
            flex: 1, maxHeight: 'calc(100dvh - 160px)',
            overflow: 'hidden', borderRadius: '12px',
            border: '1px solid rgba(200,169,110,0.25)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
          }}>
            <img
              src={imageUrl}
              alt="今日签卡片"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex', gap: '12px', marginTop: '20px', width: '100%', maxWidth: '400px',
          }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1, padding: '14px',
                background: 'linear-gradient(135deg, #8A6A30, #C8A96E)',
                border: 'none', borderRadius: '8px',
                color: '#07060f', fontFamily: 'Noto Serif SC, serif',
                fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              {saveStatus === 'saving' ? '生成中…' : saveStatus === 'saved' ? '已保存 ✓' : '保存图片'}
            </button>
            <button
              onClick={handleShare}
              style={{
                flex: 1, padding: '14px',
                background: 'transparent',
                border: '1px solid rgba(200,169,110,0.35)',
                borderRadius: '8px',
                color: '#C8A96E', fontFamily: 'Noto Serif SC, serif',
                fontSize: '16px', letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              分享给朋友
            </button>
          </div>

          {/* Close hint */}
          <p style={{
            marginTop: '16px', fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px', color: '#3A3458', letterSpacing: '0.1em',
          }}>
            点击空白处关闭
          </p>
        </>
      )}
    </div>
  );
}
