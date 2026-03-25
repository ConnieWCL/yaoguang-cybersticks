import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, saveUser, SHICHEN } from '@/lib/fortune';

const Index = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const user = loadUser();
    if (user) {
      setNickname(user.nickname);
      setBirthDate(user.birthDate);
      setBirthTime(user.birthTime);
      setReturning(true);
    }
  }, []);

  const handleSubmit = () => {
    if (!nickname.trim() || !birthDate || !birthTime) return;
    saveUser({ nickname: nickname.trim(), birthDate, birthTime });
    navigate('/fortune');
  };

  return (
    <div className="min-h-screen bg-background paper-texture flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl tracking-[0.3em] text-foreground mb-3">
            爻光
          </h1>
          <p className="text-sm text-muted-foreground tracking-widest">
            赛博黄历 · 每日一爻
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded shadow-sm border border-border p-6 space-y-5">
          {returning && (
            <p className="text-center text-sm text-muted-foreground font-serif">
              欢迎回来，{nickname}
            </p>
          )}

          {/* Nickname */}
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground tracking-wider">
              阁下尊姓大名
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="w-full h-11 px-3 rounded-sm border border-input bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground tracking-wider">
              生辰（公历）
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full h-11 px-3 rounded-sm border border-input bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Birth Time (Shichen) */}
          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground tracking-wider">
              出生时辰
            </label>
            <select
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full h-11 px-3 rounded-sm border border-input bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-ring transition-colors"
            >
              <option value="">请选择时辰</option>
              {SHICHEN.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!nickname.trim() || !birthDate || !birthTime}
            className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-serif text-base tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            查看今日运势
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8 tracking-wider opacity-60">
          同一生辰 · 同一日期 · 同一爻光
        </p>
      </div>
    </div>
  );
};

export default Index;
