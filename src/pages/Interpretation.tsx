import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, type Fortune } from '@/lib/fortune';
import { getInterpretation, type Interpretation } from '@/lib/interpretation';
import { ArrowLeft } from 'lucide-react';

const Interpretation = () => {
  const navigate = useNavigate();
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [interp, setInterp] = useState<Interpretation | null>(null);

  useEffect(() => {
    const user = loadUser();
    if (!user) { navigate('/'); return; }
    const f = getFortune(user);
    setFortune(f);
    setInterp(getInterpretation(user, f));
  }, [navigate]);

  if (!fortune || !interp) return null;

  return (
    <div className="min-h-screen bg-background paper-texture animate-page-enter">
      <div className="relative z-10 max-w-[480px] mx-auto px-6 sm:px-12 py-6 stagger-children">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/fortune')}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <span className="text-xs text-muted-foreground font-serif">解签</span>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl text-foreground tracking-wide">
            解签：为什么是「{fortune.level}」
          </h1>
          <p className="font-serif text-base text-muted-foreground mt-4 leading-relaxed px-4">
            「{fortune.poem}」
          </p>
        </div>

        {/* Bazi Section */}
        <div className="bg-card border border-border rounded shadow-subtle p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">☰</span>
            <h2 className="font-serif text-base text-foreground font-bold">你的八字</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interp.baziSummary}
          </p>
        </div>

        {/* Tianshi Section */}
        <div className="bg-card border border-border rounded shadow-subtle p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">☯</span>
            <h2 className="font-serif text-base text-foreground font-bold">今日天时</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interp.tianshiSummary}
          </p>
        </div>

        {/* Wuxing Flow */}
        <div className="bg-card border border-border rounded shadow-subtle p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔄</span>
            <h2 className="font-serif text-base text-foreground font-bold">五行流转</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interp.wuxingFlow}
          </p>
        </div>

        {/* Poem Meaning */}
        <div className="bg-card border border-border rounded shadow-subtle p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📜</span>
            <h2 className="font-serif text-base text-foreground font-bold">签文深意</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interp.poemMeaning}
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground opacity-40">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default Interpretation;
