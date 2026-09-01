import { FormEvent, useState } from 'react';
import { BookOpen, HardDrive, Loader2, LockKeyhole, MailCheck, RotateCcw, Sparkles } from 'lucide-react';
import { InkCanvas } from '@/components/InkCanvas';
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

function AuthScreen() {
  const { enterGuest } = useAuth();
  const [authMethod, setAuthMethod] = useState<'username' | 'email'>('username');
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

  return (
    <div className="auth-gate">
      <InkCanvas />
      <main className="auth-shell">
        <section className="auth-brand" aria-labelledby="auth-title">
          <div className="header-ornament" aria-hidden="true">
            <div className="orn-line" /><div className="orn-diamond" /><div className="orn-line" />
          </div>
          <p className="auth-kicker">私人命册</p>
          <h1 id="auth-title" className="site-title auth-title">爻光</h1>
          <p className="site-subtitle auth-subtitle">一人一册，一签一存</p>
        </section>

        <section className="auth-card" aria-label="用户名登录或注册">
          <div className="auth-seal" aria-hidden="true">命</div>
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
        </section>
      </main>
    </div>
  );
}

function AuthLoading() {
  return <div className="auth-gate auth-loading"><InkCanvas /><div className="auth-loading-mark" aria-live="polite">
    <span>爻</span><p>正在读取命册…</p>
  </div></div>;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading, configured } = useAuth();
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && ['user-space', 'share-card'].includes(new URLSearchParams(window.location.search).get('design-preview') ?? '');
  if (loading) return <AuthLoading />;
  if (!configured) return <div className="auth-config-error">云端命册尚未配置，请联系站点管理员。</div>;
  if (!user && !isGuest && !isLocalPreview) return <AuthScreen />;
  return <>{children}</>;
}
