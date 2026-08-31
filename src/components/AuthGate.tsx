import { FormEvent, useState } from 'react';
import { BookOpen, Loader2, LockKeyhole, MailCheck, RotateCcw, Sparkles } from 'lucide-react';
import { InkCanvas } from '@/components/InkCanvas';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

function authMessage(message: string) {
  if (message.includes('Invalid login credentials')) return '邮箱或密码不正确，请重新确认。';
  if (message.includes('Email not confirmed')) return '请先打开验证邮件完成确认。';
  if (message.includes('User already registered')) return '这个邮箱已经注册，可以直接登录。';
  if (message.includes('Password should be')) return '密码至少需要 8 位。';
  return message;
}

function AuthScreen() {
  const isOtpPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('design-preview') === 'otp';
  const emailOtpEnabled = import.meta.env.VITE_SUPABASE_EMAIL_OTP === 'true';
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(isOtpPreview ? 'connie@example.com' : null);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('error');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);

    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() || null },
            emailRedirectTo: window.location.origin,
          },
        });

    setBusy(false);
    if (result.error) {
      setMessageTone('error');
      setMessage(authMessage(result.error.message));
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessageTone('success');
      if (emailOtpEnabled) {
        setPendingEmail(email.trim());
        setMessage('六位验证码已经寄出，请在下方完成入册。');
      } else {
        setMessage('验证信已经寄出。完成邮箱验证后，回到这里登录即可开启命册。');
      }
    }
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !pendingEmail || otp.length !== 6) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: otp, type: 'signup' });
    setBusy(false);
    if (error) {
      setMessageTone('error');
      setMessage('验证码无效或已经过期，请重新获取。');
    }
  }

  async function resendCode() {
    if (!supabase || !pendingEmail) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail,
      options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    setMessageTone(error ? 'error' : 'success');
    setMessage(error ? authMessage(error.message) : '新的验证码已经寄出。');
  }

  return (
    <div className="auth-gate">
      <InkCanvas />
      <main className="auth-shell">
        <section className="auth-brand" aria-labelledby="auth-title">
          <div className="header-ornament" aria-hidden="true">
            <div className="orn-line" />
            <div className="orn-diamond" />
            <div className="orn-line" />
          </div>
          <p className="auth-kicker">私人云端命册</p>
          <h1 id="auth-title" className="site-title auth-title">爻光</h1>
          <p className="site-subtitle auth-subtitle">一人一册，一签一存</p>
        </section>

        <section className="auth-card" aria-label="登录或注册">
          <div className="auth-seal" aria-hidden="true">命</div>
          <div className="auth-tabs" role="tablist" aria-label="账号方式" hidden={Boolean(pendingEmail)}>
            <button type="button" role="tab" aria-selected={mode === 'signin'}
              className={mode === 'signin' ? 'is-active' : ''}
              onClick={() => { setMode('signin'); setMessage(null); }}>
              登录命册
            </button>
            <button type="button" role="tab" aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => { setMode('signup'); setMessage(null); }}>
              新建命册
            </button>
          </div>

          <div className="auth-benefits" aria-label="登录权益" hidden={Boolean(pendingEmail)}>
            <span><LockKeyhole aria-hidden="true" /> 私人保存</span>
            <span><Sparkles aria-hidden="true" /> 跨端同步</span>
            <span><BookOpen aria-hidden="true" /> 64 卦收集</span>
          </div>

          {pendingEmail ? (
            <form onSubmit={handleVerify} className="auth-form otp-form">
              <div className="otp-heading">
                <span><MailCheck aria-hidden="true" /></span>
                <div><strong>验明命册</strong><small>验证码已发送至 {pendingEmail}</small></div>
              </div>
              <label>
                <span>六位验证码</span>
                <input className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={6} placeholder="000000" autoFocus />
              </label>
              {message && <p className={`auth-message ${messageTone}`} role="status">{message}</p>}
              <button type="submit" className="auth-submit" disabled={busy || otp.length !== 6}>
                {busy && <Loader2 className="auth-spinner" aria-hidden="true" />}{busy ? '正在验明…' : '确认入册'}
              </button>
              <div className="otp-actions">
                <button type="button" onClick={resendCode} disabled={busy}><RotateCcw aria-hidden="true" />重新发送</button>
                <button type="button" onClick={() => { setPendingEmail(null); setOtp(''); setMessage(null); }}>返回注册</button>
              </div>
            </form>
          ) : <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <label>
                <span>命册称呼</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={60} autoComplete="nickname" placeholder="你的昵称（选填）" />
              </label>
            )}
            <label>
              <span>邮箱</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                autoComplete="email" required placeholder="name@example.com" />
            </label>
            <label>
              <span>密码</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={8} required placeholder="至少 8 位" />
            </label>

            {message && (
              <p className={`auth-message ${messageTone}`} role="status">{message}</p>
            )}

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy && <Loader2 className="auth-spinner" aria-hidden="true" />}
              {busy ? '正在开启…' : mode === 'signin' ? '开启我的命册' : '建立云端命册'}
            </button>
          </form>}

          <p className="auth-note">登录后才可抽签；签文、次数与收集进度都会跟随账号。</p>
        </section>
      </main>
    </div>
  );
}

function AuthLoading() {
  return (
    <div className="auth-gate auth-loading">
      <InkCanvas />
      <div className="auth-loading-mark" aria-live="polite">
        <span>爻</span>
        <p>正在读取命册…</p>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('design-preview') === 'user-space';

  if (loading) return <AuthLoading />;
  if (!configured) {
    return <div className="auth-config-error">云端命册尚未配置，请联系站点管理员。</div>;
  }
  if (!user && !isLocalPreview) return <AuthScreen />;
  return <>{children}</>;
}
