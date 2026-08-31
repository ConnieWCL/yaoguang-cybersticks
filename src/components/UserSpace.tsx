import { ChangeEvent, useEffect, useState } from 'react';
import { BookOpen, HardDrive, Loader2, LogIn, LogOut, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserSpaceProps {
  open: boolean;
  archiveCount: number;
  totalDraws: number;
  attemptsLeft: number;
  onClose: () => void;
  onOpenArchive: () => void;
  previewUser?: { id: string; email: string; user_metadata: { display_name: string } };
}

export function UserSpace({ open, archiveCount, totalDraws, attemptsLeft, onClose, onOpenArchive, previewUser }: UserSpaceProps) {
  const { user, isGuest, exitGuest, signOut } = useAuth();
  const currentUser = user ?? previewUser;
  const [displayName, setDisplayName] = useState(previewUser?.user_metadata.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !currentUser || !supabase || previewUser) return;
    setMessage(null);
    void supabase.from('profiles').select('display_name, avatar_path').eq('id', currentUser.id).maybeSingle()
      .then(async ({ data }) => {
        setDisplayName(data?.display_name ?? currentUser.user_metadata?.display_name ?? '');
        if (!data?.avatar_path) return setAvatarUrl(null);
        const { data: signed } = await supabase.storage.from('user-assets').createSignedUrl(data.avatar_path, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      });
  }, [currentUser, open, previewUser]);

  if (!open || (!currentUser && !isGuest)) return null;

  async function saveProfile() {
    if (!supabase || !currentUser || isGuest) return;
    setBusy(true);
    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      display_name: displayName.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    setMessage(error ? error.message : '命册称呼已保存。');
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !supabase || !currentUser || isGuest) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setMessage('请选择不超过 2MB 的 PNG、JPG 或 WebP 图片。');
      return;
    }
    setBusy(true);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${currentUser.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from('user-assets').upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setBusy(false);
      setMessage(uploadError.message);
      return;
    }
    await supabase.from('profiles').upsert({ id: currentUser.id, avatar_path: path, updated_at: new Date().toISOString() });
    const { data } = await supabase.storage.from('user-assets').createSignedUrl(path, 3600);
    setAvatarUrl(data?.signedUrl ?? null);
    setBusy(false);
    setMessage('头像已收入命册。');
  }

  const initials = isGuest ? '游' : (displayName || currentUser?.email || '爻').slice(0, 1).toUpperCase();

  return (
    <div className="user-space" role="dialog" aria-modal="true" aria-labelledby="user-space-title">
      <div className="user-space-shell">
        <header className="user-space-header">
          <div>
            <p>{isGuest ? 'LOCAL FORTUNE ARCHIVE' : '云端私人空间'}</p>
            <h2 id="user-space-title">{isGuest ? '本机命册' : '我的命册'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭我的命册"><X aria-hidden="true" /></button>
        </header>

        <section className="user-profile-card">
          <div className="user-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="用户头像" /> : initials}
          </div>
          <div className="user-profile-copy">
            <strong>{isGuest ? '游客命册' : displayName || '未题名命册'}</strong>
            <span>{isGuest ? '仅保存在当前设备与浏览器' : currentUser?.email}</span>
            {!isGuest && <><label htmlFor="user-space-avatar"><Upload aria-hidden="true" /> 更换头像</label>
            <input id="user-space-avatar" className="sr-only" style={{ display: 'none' }} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={uploadAvatar} disabled={busy} /></>}
          </div>
        </section>

        {isGuest && <section className="guest-storage-note">
          <HardDrive aria-hidden="true" />
          <div><strong>本机记忆已开启</strong><p>不换设备和浏览器时会一直保留；无痕模式、清理网站数据或卸载浏览器会使记录丢失。</p></div>
        </section>}

        <section className="user-stats" aria-label="命册统计">
          <div><strong>{archiveCount}</strong><span>已集卦象</span></div>
          <div><strong>{totalDraws}</strong><span>累计抽签</span></div>
          <div><strong>{attemptsLeft}</strong><span>今日余签</span></div>
        </section>

        <button type="button" className="archive-entry" onClick={onOpenArchive}>
          <span className="archive-entry-icon"><BookOpen aria-hidden="true" /></span>
          <span><strong>查看我的签文册</strong><small>浏览已收集的卦象与抽签日期</small></span>
          <em>{archiveCount} / 64</em>
        </button>

        {!isGuest && <section className="profile-form" aria-label="命册资料">
          <label htmlFor="user-display-name">命册称呼</label>
          <div>
            <input id="user-display-name" value={displayName} maxLength={60}
              onChange={(event) => setDisplayName(event.target.value)} placeholder="为你的命册题名" />
            <button type="button" onClick={saveProfile} disabled={busy}>
              {busy && <Loader2 className="auth-spinner" aria-hidden="true" />}保存
            </button>
          </div>
          {message && <p role="status">{message}</p>}
        </section>}

        {isGuest ? <button type="button" className="signout-button guest-login-button" onClick={() => { exitGuest(); onClose(); }}>
          <LogIn aria-hidden="true" />返回账号登录
        </button> : !previewUser && <button type="button" className="signout-button" onClick={async () => { await signOut(); onClose(); }}>
          <LogOut aria-hidden="true" />退出当前命册
        </button>}
      </div>
    </div>
  );
}
