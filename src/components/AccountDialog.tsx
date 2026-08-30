import { ChangeEvent, useEffect, useState } from 'react';
import { Loader2, LogOut, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user || !supabase) return;
    void supabase.from('profiles').select('display_name, avatar_path').eq('id', user.id).maybeSingle()
      .then(async ({ data }) => {
        setDisplayName(data?.display_name ?? '');
        if (!data?.avatar_path) return setAvatarUrl(null);
        const { data: signed } = await supabase.storage.from('user-assets').createSignedUrl(data.avatar_path, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      });
  }, [open, user]);

  async function saveProfile() {
    if (!user || !supabase) return;
    setBusy(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayName.trim() || null });
    setBusy(false);
    setMessage(error ? error.message : '命册信息已保存。');
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user || !supabase) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setMessage('请选择不超过 2MB 的图片。');
      return;
    }
    setBusy(true);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from('user-assets').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setBusy(false);
      setMessage(uploadError.message);
      return;
    }
    await supabase.from('profiles').upsert({ id: user.id, avatar_path: path });
    const { data } = await supabase.storage.from('user-assets').createSignedUrl(path, 3600);
    setAvatarUrl(data?.signedUrl ?? null);
    setBusy(false);
    setMessage('头像已更新。');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[rgba(200,169,110,0.28)] bg-[#0e0c1e] text-[#EDE8FF] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.16em] text-[#E8C88A]">我的命册</DialogTitle>
          <DialogDescription className="text-[#A89EC8]">账号、签文和头像均为你的私有数据。</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[rgba(200,169,110,0.35)] bg-[#151228] text-xl text-[#C8A96E]">
              {avatarUrl ? <img src={avatarUrl} alt="用户头像" className="h-full w-full object-cover" /> : (displayName || user?.email || '爻').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <Label htmlFor="avatar-upload" className="inline-flex cursor-pointer items-center text-sm text-[#7EB8A0] hover:text-[#A8D4C0]">
                <Upload className="mr-2 h-4 w-4" />上传头像
              </Label>
              <Input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={uploadAvatar} disabled={busy} />
              <p className="mt-1 text-xs text-[#5C5480]">PNG/JPG/WebP，最大 2MB</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">显示名称</Label>
            <Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)}
              className="border-[rgba(200,169,110,0.2)] bg-[#151228]" />
          </div>
          <p className="text-xs text-[#5C5480]">{user?.email}</p>
          {message && <p role="status" className="text-sm text-[#D4849A]">{message}</p>}
          <Button onClick={saveProfile} disabled={busy} className="w-full bg-[#C8A96E] text-[#07060f] hover:bg-[#E8C88A]">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}保存命册
          </Button>
          <Button variant="outline" onClick={async () => { await signOut(); onOpenChange(false); }}
            className="w-full border-[rgba(200,169,110,0.25)] bg-transparent text-[#A89EC8] hover:bg-[#151228] hover:text-white">
            <LogOut className="mr-2 h-4 w-4" />退出登录
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
