import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUser, saveUser, SHICHEN } from '@/lib/fortune';

const Index = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [returning, setReturning] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [errors, setErrors] = useState<{ nickname?: boolean; birthDate?: boolean; birthTime?: boolean }>({});

  useEffect(() => {
    const user = loadUser();
    if (user) {
      setNickname(user.nickname);
      setBirthDate(user.birthDate);
      setBirthTime(user.birthTime);
      setReturning(true);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors = {
      nickname: !nickname.trim(),
      birthDate: !birthDate,
      birthTime: !birthTime,
    };
    setErrors(newErrors);
    if (newErrors.nickname || newErrors.birthDate || newErrors.birthTime) return;

    saveUser({ nickname: nickname.trim(), birthDate, birthTime });
    setExiting(true);
    setTimeout(() => { navigate('/fortune'); }, 300);
  }, [nickname, birthDate, birthTime, navigate]);

  return (
    <div className={`min-h-screen bg-background paper-texture flex items-center justify-center px-4 md:px-12 py-12 transition-all ${exiting ? 'animate-page-exit' : 'animate-page-enter'}`}>
      <div className="relative z-10 w-full max-w-[480px] md:max-w-[600px]">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="font-serif text-[56px] md:text-[72px] tracking-[0.3em] text-foreground">
            爻光
          </h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground tracking-widest text-center mb-10">
          赛博黄历 · 每日一爻
        </p>

        {/* Card */}
        <div className="bg-card rounded shadow-subtle border border-border p-6 md:p-8 space-y-6">
          {returning && (
            <p className="text-center text-sm text-muted-foreground font-serif">
              欢迎回来，{nickname}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground tracking-wider">阁下尊姓大名</label>
            <input type="text" value={nickname}
              onChange={(e) => { setNickname(e.target.value); setErrors(prev => ({ ...prev, nickname: false })); }}
              placeholder="请输入昵称"
              className={`w-full h-11 px-3 rounded-sm border bg-background text-foreground text-base outline-none transition-colors input-fortune ${errors.nickname ? 'input-error' : 'border-input'}`}
            />
            {errors.nickname && <p className="text-xs text-destructive">请输入昵称</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground tracking-wider">生辰（公历）</label>
            <input type="date" value={birthDate}
              onChange={(e) => { setBirthDate(e.target.value); setErrors(prev => ({ ...prev, birthDate: false })); }}
              className={`w-full h-11 px-3 rounded-sm border bg-background text-foreground text-base outline-none transition-colors input-fortune ${errors.birthDate ? 'input-error' : 'border-input'}`}
            />
            {errors.birthDate && <p className="text-xs text-destructive">请选择出生日期</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-muted-foreground tracking-wider">出生时辰</label>
            <select value={birthTime}
              onChange={(e) => { setBirthTime(e.target.value); setErrors(prev => ({ ...prev, birthTime: false })); }}
              className={`w-full h-11 px-3 rounded-sm border bg-background text-foreground text-base outline-none transition-colors input-fortune ${errors.birthTime ? 'input-error' : 'border-input'}`}
            >
              <option value="">请选择时辰</option>
              {SHICHEN.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.birthTime && <p className="text-xs text-destructive">请选择出生时辰</p>}
          </div>

          <div className="pt-2">
            <button onClick={handleSubmit}
              className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-serif text-base tracking-wider hover:bg-primary-hover transition-colors btn-press">
              查看今日运势
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 tracking-wider opacity-60">
          同一生辰 · 同一日期 · 同一爻光
        </p>
      </div>
    </div>
  );
};

export default Index;
