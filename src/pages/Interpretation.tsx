import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, getFortune, type Fortune } from '@/lib/fortune';
import { getInterpretation, type Interpretation } from '@/lib/interpretation';
import { ArrowLeft } from 'lucide-react';

const InterpretationPage = () => {
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

  const sections = [
    {
      icon: '☰',
      title: '你的八字',
      content: interp.bazi,
      detail: `日主五行决定了你与天时的互动方式`,
    },
    {
      icon: '☯',
      title: '今日天时',
      content: interp.tianshi,
      detail: `当令五行影响今日整体气场走向`,
    },
    {
      icon: '⚡',
      title: '五行流转',
      content: interp.liuzhuan,
      detail: interp.jieshi,
    },
    {
      icon: '📜',
      title: '签文深意',
      content: `「${interp.qianwen}」`,
      detail: interp.poemMeaning,
    },
  ];

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
            返回运势
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <span className="font-serif text-2xl font-bold">{fortune.level}</span>
          </div>
          <h1 className="font-serif text-xl text-foreground tracking-wide">
            解签：为什么是「{fortune.level}」
          </h1>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={i} className="bg-card border border-border rounded shadow-subtle p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h2 className="font-serif text-base text-foreground font-bold">{section.title}</h2>
            </div>
            <p className="font-serif text-sm text-foreground leading-relaxed mb-2">
              {section.content}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {section.detail}
            </p>
          </div>
        ))}

        <p className="text-center text-xs text-muted-foreground mt-8 mb-4 opacity-40">
          爻光 · 赛博黄历
        </p>
      </div>
    </div>
  );
};

export default InterpretationPage;
