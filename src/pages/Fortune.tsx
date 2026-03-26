import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, saveFortune, type Fortune } from '@/lib/fortune';
import { ArrowLeft, Stamp } from 'lucide-react';

const FortunePage = () => {
  const navigate = useNavigate();
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [saved, setSaved] = useState(false);

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
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = `星期${weekdays[today.getDay()]}`;

  const handleSave = () => {
    saveFortune(fortune);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-background paper-texture animate-page-enter">
      <div className="relative z-10 max-w-[480px] mx-auto px-6 sm:px-12 py-6 stagger-children">
        {/* Top bar */}
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

        {/* Level */}
        <div className="w-full text-center mb-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground animate-stamp">
            <span className="font-serif text-5xl font-bold">{fortune.level}</span>
          </div>
        </div>

        {/* Poem */}
        <div className="w-full text-center mb-10">
          <p className="font-serif text-2xl text-foreground leading-[1.8] px-4">
            「{fortune.poem}」
          </p>
        </div>

        {/* Yi & Ji */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-fortune-yi p-5">
            <p className="font-serif text-lg text-primary-foreground text-center mb-3 font-bold">宜</p>
            <div className="space-y-2">
              {fortune.yi.map((item, i) => (
                <p key={i} className="text-base text-primary-foreground text-center font-serif">{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-fortune-ji p-5">
            <p className="font-serif text-lg text-primary-foreground text-center mb-3 font-bold">忌</p>
            <div className="space-y-2">
              {fortune.ji.map((item, i) => (
                <p key={i} className="text-base text-primary-foreground text-center font-serif">{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Lucky elements */}
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

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-serif text-sm tracking-wider hover:bg-primary-hover transition-colors btn-press flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Stamp className="w-4 h-4" />
          {saved ? '已封存' : '封存此爻'}
        </button>

        {saved && (
          <p className="text-center text-xs text-muted-foreground mt-3 animate-fade-up">
            已封存，可在历史记录查看
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8 opacity-40">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default FortunePage;
