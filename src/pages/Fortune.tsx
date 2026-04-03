import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, type PageFortune } from '@/lib/fortunes';
import { ArrowLeft, Stamp } from 'lucide-react';
import WuxingPentagon from '@/components/WuxingPentagon';

const HISTORY_KEY = 'yaoguang_history';

function saveToHistory(fortune: PageFortune) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({
      date: new Date().toISOString().split('T')[0],
      level: fortune.level,
      poem: fortune.poem,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch { /* ignore */ }
}

const FortunePage = () => {
  const navigate = useNavigate();
  const [fortune, setFortune] = useState<PageFortune | null>(null);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const user = loadUser();
    if (!user) { navigate('/'); return; }
    setFortune(getFortune(user));
  }, [navigate]);

  if (!fortune) return null;

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = `星期${weekdays[today.getDay()]}`;

  const handleSeal = () => {
    saveToHistory(fortune);
    setSealed(true);
    setTimeout(() => setSealed(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background paper-texture animate-page-enter">
      <div className="relative z-10 w-full max-w-[480px] md:max-w-[800px] mx-auto px-4 md:px-12 py-6 stagger-children">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <span className="text-sm text-muted-foreground">{dateStr} {weekday}</span>
        </div>

        {/* Level — clickable seal */}
        <button onClick={() => navigate('/interpretation')}
          className="w-full text-center mb-4 group cursor-pointer">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-primary text-primary-foreground animate-stamp">
            <span className="font-serif text-3xl md:text-5xl font-bold">{fortune.level}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
            点击查看解签 →
          </p>
        </button>

        {/* 五行盘 — Wuxing Pentagon */}
        <WuxingPentagon
          todayWuxing={fortune.todayWuxing}
          userWuxing={fortune.userWuxing}
        />

        {/* Poem — clickable */}
        <button onClick={() => navigate('/interpretation')}
          className="w-full text-center mb-10 cursor-pointer group">
          <p className="font-serif text-[28px] md:text-[32px] text-foreground leading-[1.8] px-4 group-hover:text-primary transition-colors">
            「{fortune.poem}」
          </p>
        </button>

        {/* Three aspects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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

        {/* Yi & Ji */}
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

        {/* Lucky elements */}
        <div className="bg-card border border-border rounded shadow-subtle p-6 mb-8">
          <p className="font-serif text-sm text-center text-muted-foreground mb-4">幸运元素</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 border border-border"
                style={{ backgroundColor: fortune.color.hex }} />
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

        {/* Seal button */}
        <button onClick={handleSeal}
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-serif text-sm tracking-wider hover:bg-primary-hover transition-colors btn-press flex items-center justify-center gap-2">
          <Stamp className="w-4 h-4" />
          {sealed ? '已封存 ✓' : '封存此爻'}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-8 opacity-40">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default FortunePage;
