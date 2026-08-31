import { BookOpen, HardDrive, LockKeyhole, Smartphone, Sparkles } from 'lucide-react';
import { InkCanvas } from '@/components/InkCanvas';
import { useAuth } from '@/contexts/AuthContext';

function AuthScreen() {
  const { enterGuest } = useAuth();

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
          <p className="auth-kicker">私人命册</p>
          <h1 id="auth-title" className="site-title auth-title">爻光</h1>
          <p className="site-subtitle auth-subtitle">一人一册，一签一存</p>
        </section>

        <section className="auth-card guest-only-card" aria-label="进入爻光">
          <div className="auth-seal" aria-hidden="true">命</div>
          <div className="guest-welcome">
            <span className="guest-welcome-icon"><Smartphone aria-hidden="true" /></span>
            <div>
              <strong>无需注册，直接起卦</strong>
              <p>签文与每日次数会留在当前设备，刷新页面也不会消失。</p>
            </div>
          </div>

          <div className="auth-benefits" aria-label="游客体验权益">
            <span><LockKeyhole aria-hidden="true" /> 本机保存</span>
            <span><Sparkles aria-hidden="true" /> 每日三签</span>
            <span><BookOpen aria-hidden="true" /> 64 卦收集</span>
          </div>

          <button type="button" className="auth-submit guest-primary" onClick={enterGuest}>
            开启本机命册
          </button>

          <div className="phone-coming-soon">
            <HardDrive aria-hidden="true" />
            <span><strong>手机号云端命册正在准备</strong><small>开放后可跨设备同步现有签文</small></span>
          </div>

          <p className="auth-note">游客数据不会上传；无痕模式、清理网站数据或更换浏览器后无法恢复。</p>
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
  const { user, isGuest, loading, configured } = useAuth();
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('design-preview') === 'user-space';

  if (loading) return <AuthLoading />;
  if (!configured) {
    return <div className="auth-config-error">云端命册尚未配置，请联系站点管理员。</div>;
  }
  if (!user && !isGuest && !isLocalPreview) return <AuthScreen />;
  return <>{children}</>;
}
