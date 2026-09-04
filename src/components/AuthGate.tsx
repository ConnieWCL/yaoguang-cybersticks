import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, HardDrive, Loader2, LockKeyhole, MailCheck, RotateCcw, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { setRememberSession, supabase } from '@/lib/supabase';

function normalizeUsername(value: string) {
  return value.normalize('NFKC').trim().toLowerCase();
}

function usernameEmail(value: string) {
  const bytes = new TextEncoder().encode(normalizeUsername(value));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `u_${encoded}@users.cyberfortune.invalid`;
}

function authMessage(message: string) {
  if (message.includes('Invalid login credentials')) return '用户名或密码不正确。';
  if (message.includes('User already registered')) return '这个用户名已经被使用，请换一个。';
  if (message.includes('Password should be')) return '密码至少需要 8 位。';
  return '暂时无法开启命册，请稍后重试。';
}

function AuthScreen({ onClose }: { onClose: () => void }) {
  const { enterGuest } = useAuth();
  const [authMethod, setAuthMethod] = useState<'chooser' | 'username' | 'email'>('chooser');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const normalized = normalizeUsername(username);
    if (!/^[\p{L}\p{N}_-]{3,20}$/u.test(normalized)) {
      setMessage('用户名需为 3–20 个汉字、字母、数字、下划线或短横线。');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setMessage('两次输入的密码不一致。');
      return;
    }

    setBusy(true);
    setMessage(null);
    setRememberSession(remember);
    const email = usernameEmail(normalized);
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: username.trim(), auth_mode: 'username' } },
        });
    setBusy(false);

    if (result.error) {
      setMessage(authMessage(result.error.message));
      return;
    }
    if (!result.data.session) {
      setMessage('用户名账户尚未启用，请稍后再试。');
    }
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    setRememberSession(remember);
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setMessage('验证码发送失败，请稍后重试。');
      return;
    }
    setPendingEmail(normalizedEmail);
  }

  async function handleVerifyEmail(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !pendingEmail || otp.length !== 6) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: otp,
      type: 'email',
    });
    setBusy(false);
    if (error) setMessage('验证码无效或已经过期，请重新获取。');
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="auth-modal" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <main className="auth-modal-shell" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
        <section className="auth-card" aria-label="选择签文保存方式">
          <div className="auth-seal" aria-hidden="true">命</div>
          <button type="button" className="auth-close" onClick={onClose} aria-label="关闭"><X aria-hidden="true" /></button>

          {authMethod === 'chooser' ? <div className="auth-chooser">
            <p className="auth-kicker">开启今日一签</p>
            <h2 id="auth-dialog-title">选择如何保存签文</h2>
            <p className="auth-chooser-lead">登录后可跨设备同步；游客体验只保存在当前浏览器。</p>
            <div className="auth-method-list">
              <button type="button" className="auth-method-card is-primary" onClick={() => setAuthMethod('username')}>
                <span className="auth-method-icon"><UserRound aria-hidden="true" /></span>
                <span><strong>账号登录 / 注册</strong><small>用户名与密码 · 永久保存并跨设备同步</small></span>
                <em>推荐</em>
              </button>
              <button type="button" className="auth-method-card" onClick={() => setAuthMethod('email')}>
                <span className="auth-method-icon"><MailCheck aria-hidden="true" /></span>
                <span><strong>邮箱验证码</strong><small>免记密码 · 验证后跨设备查看命册</small></span>
              </button>
              <button type="button" className="auth-method-card is-guest" onClick={enterGuest}>
                <span className="auth-method-icon"><HardDrive aria-hidden="true" /></span>
                <span><strong>先以游客体验</strong><small>无需注册 · 数据仅保存在当前浏览器</small></span>
              </button>
            </div>
            <p className="auth-chooser-note">完成选择后，将自动继续刚才的抽签。</p>
          </div> : <>
          <div className="auth-detail-heading">
            <button type="button" onClick={() => { setAuthMethod('chooser'); setPendingEmail(null); setMessage(null); }} aria-label="返回进入方式"><ArrowLeft aria-hidden="true" /></button>
            <div><small>私人命册</small><h2 id="auth-dialog-title">{authMethod === 'username' ? '账号登录 / 注册' : '邮箱验证码'}</h2></div>
          </div>
          <div className="auth-tabs" role="tablist" aria-label="登录方式" hidden={Boolean(pendingEmail)}>
            <button type="button" role="tab" aria-selected={authMethod === 'username'} className={authMethod === 'username' ? 'is-active' : ''}
              onClick={() => { setAuthMethod('username'); setMessage(null); }}>用户名密码</button>
            <button type="button" role="tab" aria-selected={authMethod === 'email'} className={authMethod === 'email' ? 'is-active' : ''}
              onClick={() => { setAuthMethod('email'); setMessage(null); }}>邮箱验证码</button>
          </div>

          <div className="auth-benefits" aria-label="账号权益">
            <span><LockKeyhole aria-hidden="true" /> 安全存储</span>
            <span><Sparkles aria-hidden="true" /> 跨端同步</span>
            <span><BookOpen aria-hidden="true" /> 64 卦收集</span>
          </div>

          {authMethod === 'username' && !pendingEmail && <div className="account-mode-switch">
            <button type="button" className={mode === 'signin' ? 'is-active' : ''} onClick={() => { setMode('signin'); setMessage(null); }}>登录</button>
            <span aria-hidden="true">·</span>
            <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => { setMode('signup'); setMessage(null); }}>注册</button>
          </div>}

          {authMethod === 'username' && !pendingEmail ? <form className="auth-form" onSubmit={handleSubmit}>
            <label><span>用户名</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username"
                minLength={3} maxLength={20} required placeholder="3–20 个字符" />
            </label>
            <label><span>密码</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required placeholder="至少 8 位" />
            </label>
            {mode === 'signup' && <label><span>再次输入密码</span>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password" minLength={8} required placeholder="再次确认密码" />
            </label>}
            <label className="remember-row">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>保持登录状态 <small>不保存密码原文</small></span>
            </label>
            {message && <p className="auth-message error" role="status">{message}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy && <Loader2 className="auth-spinner" aria-hidden="true" />}
              {busy ? '正在开启…' : mode === 'signin' ? '开启我的命册' : '建立云端命册'}
            </button>
          </form> : pendingEmail ? <form className="auth-form otp-form" onSubmit={handleVerifyEmail}>
            <div className="otp-heading">
              <span><MailCheck aria-hidden="true" /></span>
              <div><strong>验明命册</strong><small>六位验证码已发送至 {pendingEmail}</small></div>
            </div>
            <label><span>六位验证码</span>
              <input className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={6} placeholder="000000" autoFocus />
            </label>
            {message && <p className="auth-message error" role="status">{message}</p>}
            <button type="submit" className="auth-submit" disabled={busy || otp.length !== 6}>
              {busy && <Loader2 className="auth-spinner" aria-hidden="true" />}{busy ? '正在验明…' : '确认并开启命册'}
            </button>
            <div className="otp-actions">
              <button type="button" onClick={() => { setPendingEmail(null); setOtp(''); setMessage(null); }}><RotateCcw aria-hidden="true" />重新输入邮箱</button>
            </div>
          </form> : <form className="auth-form" onSubmit={handleEmailSubmit}>
            <label><span>邮箱</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                autoComplete="email" required placeholder="name@example.com" />
            </label>
            <label className="remember-row">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>保持登录状态 <small>不保存邮箱验证码</small></span>
            </label>
            {message && <p className="auth-message error" role="status">{message}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy && <Loader2 className="auth-spinner" aria-hidden="true" />}{busy ? '正在发送…' : '发送六位验证码'}
            </button>
          </form>}

          <div className="guest-entry">
            <div className="guest-divider"><span>或</span></div>
            <button type="button" className="guest-button" onClick={enterGuest}>
              <HardDrive aria-hidden="true" />
              <span><strong>以游客身份体验</strong><small>免注册 · 仅保存在当前浏览器</small></span>
            </button>
          </div>
          <p className="auth-note">{authMethod === 'username' ? '用户名账户无法通过邮箱或手机号找回；请妥善保管密码。' : '验证码邮件不会包含任何登录链接，也不会要求你回复。'}</p>
          </>}
        </section>
      </main>
    </div>
  );
}

function AuthLoading() {
  return <div className="auth-gate auth-loading"><div className="auth-loading-mark" aria-live="polite">
    <span>爻</span><p>正在读取命册…</p>
  </div></div>;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading, configured, authPromptOpen, closeAuthPrompt } = useAuth();
  if (loading) return <AuthLoading />;
  if (!configured) return <div className="auth-config-error">云端命册尚未配置，请联系站点管理员。</div>;
  return <>
    {children}
    {authPromptOpen && !user && !isGuest && <AuthScreen onClose={closeAuthPrompt} />}
  </>;
}
