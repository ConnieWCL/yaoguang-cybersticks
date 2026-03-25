import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, type Fortune } from '@/lib/fortune';
import { ArrowLeft } from 'lucide-react';

const levelColors: Record<string, string> = {
  '大吉': 'bg-fortune-red',
  '吉': 'bg-fortune-green',
  '中吉': 'bg-fortune-gold',
  '平': 'bg-muted-foreground',
  '需注意': 'bg-foreground',
};

const FortunePage = () => {
  const navigate = useNavigate();
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const user = loadUser();
    if (!user) {
      navigate('/');
      return;
    }
    setNickname(user.nickname);
    setFortune(getFortune(user));
  }, [navigate]);

  if (!fortune) return null;

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = `星期${weekdays[today.getDay()]}`;

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="relative z-10 max-w-sm mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-serif">
            今日爻光
          </span>
        </div>

        {/* Date */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">{dateStr} {weekday}</p>
          <p className="text-xs text-muted-foreground mt-1 opacity-60">{nickname}，此为你的今日一爻</p>
        </div>

        {/* Seal + Poem */}
        <div className="text-center mb-8 animate-fade-up">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${levelColors[fortune.level] || 'bg-primary'} text-primary-foreground animate-stamp`}
          >
            <span className="font-serif text-2xl font-bold">{fortune.level}</span>
          </div>
          <p className="font-serif text-lg text-foreground mt-5 leading-relaxed px-2">
            「{fortune.poem}」
          </p>
        </div>

        {/* Three aspects */}
        <div className="grid grid-cols-3 gap-3 mb-6" style={{ animationDelay: '0.1s' }}>
          {[
            { title: '事业运', text: fortune.career },
            { title: '感情运', text: fortune.love },
            { title: '健康运', text: fortune.health },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded p-3 text-center">
              <p className="font-serif text-xs text-primary mb-1.5">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Yi & Ji */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded p-4">
            <p className="font-serif text-sm text-fortune-green mb-2 text-center">宜</p>
            <div className="space-y-1.5">
              {fortune.yi.map((item, i) => (
                <p key={i} className="text-xs text-center text-foreground">{item}</p>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded p-4">
            <p className="font-serif text-sm text-fortune-red mb-2 text-center">忌</p>
            <div className="space-y-1.5">
              {fortune.ji.map((item, i) => (
                <p key={i} className="text-xs text-center text-foreground">{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Lucky elements */}
        <div className="bg-card border border-border rounded p-4 mb-8">
          <p className="font-serif text-sm text-center text-foreground mb-3">幸运元素</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-1.5 border border-border"
                style={{ backgroundColor: fortune.color.hex }}
              />
              <p className="text-xs text-muted-foreground">幸运色</p>
              <p className="text-xs font-serif text-foreground">{fortune.color.name}</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full mx-auto mb-1.5 bg-muted flex items-center justify-center">
                <span className="font-serif text-sm text-foreground">{fortune.number}</span>
              </div>
              <p className="text-xs text-muted-foreground">幸运数字</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full mx-auto mb-1.5 bg-muted flex items-center justify-center">
                <span className="text-xs text-foreground">☰</span>
              </div>
              <p className="text-xs text-muted-foreground">幸运方位</p>
              <p className="text-xs font-serif text-foreground">{fortune.direction}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-serif text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            再算一次
          </button>
          <button
            onClick={() => {
              const text = `【爻光·${dateStr}】\n${fortune.level}\n「${fortune.poem}」\n宜：${fortune.yi.join('、')}\n忌：${fortune.ji.join('、')}\n幸运色：${fortune.color.name} | 幸运数字：${fortune.number} | 方位：${fortune.direction}`;
              navigator.clipboard.writeText(text);
              alert('已复制到剪贴板');
            }}
            className="w-full h-12 rounded-sm border border-border bg-card text-foreground font-serif text-sm tracking-wider hover:bg-muted transition-colors"
          >
            保存今日爻光
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 opacity-40">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default FortunePage;
