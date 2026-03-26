import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: 接入Claude API真实生成
import { loadUser, getFortune, type Fortune } from '@/lib/fortune';
import { ArrowLeft, Share2 } from 'lucide-react';

const FortunePage = () => {
  const navigate = useNavigate();
  const [fortune, setFortune] = useState<Fortune | null>(null);

  useEffect(() => {
    const user = loadUser();
    if (!user) {
      navigate('/');
      return;
    }
    setFortune(getFortune(user));
  }, [navigate]);

  if (!fortune) return null;

  const today = new Date();
  // TODO: 转换为农历日期
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = `星期${weekdays[today.getDay()]}`;

  const handleShare = async () => {
    const text = `【爻光·${dateStr}】\n${fortune.level}\n「${fortune.poem}」\n宜：${fortune.yi.join('、')}\n忌：${fortune.ji.join('、')}\n幸运色：${fortune.color.name} | 幸运数字：${fortune.number} | 方位：${fortune.direction}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: '爻光·今日运势', text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板，可截图分享');
    }
  };

  return (
    <div className="min-h-screen bg-background paper-texture animate-page-enter">
      <div className="relative z-10 max-w-[480px] mx-auto px-6 sm:px-12 py-6 stagger-children">
        {/* Top bar — subtle, not competing */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <span className="text-sm text-muted-foreground">{dateStr} {weekday}</span>
        </div>

        {/* Level — MAX visual weight, clickable to interpretation */}
        <button
          onClick={() => navigate('/interpretation')}
          className="w-full text-center mb-4 group cursor-pointer"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground animate-stamp">
            <span className="font-serif text-4xl font-bold">{fortune.level}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
            点击查看解签 →
          </p>
        </button>

        {/* Poem — primary reading content, clickable */}
        <button
          onClick={() => navigate('/interpretation')}
          className="w-full text-center mb-10 cursor-pointer group"
        >
          <p className="font-serif text-2xl text-foreground leading-[1.8] px-4 group-hover:text-primary transition-colors" style={{ lineHeight: '1.8' }}>
            「{fortune.poem}」
          </p>
        </button>

        {/* Three aspects — symbol prefixed */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { title: '事业运', text: fortune.career, icon: '☯' },
            { title: '感情运', text: fortune.love, icon: '🌟' },
            { title: '健康运', text: fortune.health, icon: '💪' },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded shadow-subtle p-4 text-center">
              <span className="text-lg block mb-1">{item.icon}</span>
              <p className="font-serif text-sm font-bold text-foreground mb-2">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Yi & Ji — bold colored blocks */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-fortune-yi p-5">
            <p className="font-serif text-lg text-white text-center mb-3 font-bold">宜</p>
            <div className="space-y-2">
              {fortune.yi.map((item, i) => (
                <p key={i} className="text-base text-white text-center font-serif">{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-fortune-ji p-5">
            <p className="font-serif text-lg text-white text-center mb-3 font-bold">忌</p>
            <div className="space-y-2">
              {fortune.ji.map((item, i) => (
                <p key={i} className="text-base text-white text-center font-serif">{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Lucky elements — large, clear */}
        <div className="bg-card border border-border rounded shadow-subtle p-6 mb-8">
          <p className="font-serif text-sm text-center text-muted-foreground mb-4">幸运元素</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2 border border-border"
                style={{ backgroundColor: fortune.color.hex }}
              />
              <p className="text-xs text-muted-foreground">幸运色</p>
              <p className="text-sm font-serif text-foreground font-bold">{fortune.color.name}</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 bg-muted flex items-center justify-center">
                <span className="font-serif text-2xl text-foreground font-bold">{fortune.number}</span>
              </div>
              <p className="text-xs text-muted-foreground">幸运数字</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 bg-muted flex items-center justify-center">
                <span className="text-sm text-foreground">☰</span>
              </div>
              <p className="text-xs text-muted-foreground">幸运方位</p>
              <p className="text-sm font-serif text-foreground font-bold">{fortune.direction}</p>
            </div>
          </div>
        </div>

        {/* Share button */}
        {/* TODO: 添加分享海报功能（html2canvas+二维码） */}
        <button
          onClick={handleShare}
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-serif text-sm tracking-wider hover:bg-primary-hover transition-colors btn-press flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          分享爻光
        </button>

        <p className="text-center text-xs text-muted-foreground mt-8 opacity-40">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default FortunePage;
