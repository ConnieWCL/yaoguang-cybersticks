import { FormEvent, useState } from 'react';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);

    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('验证邮件已发送，请完成邮箱验证后登录。');
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[rgba(200,169,110,0.28)] bg-[#0e0c1e] text-[#EDE8FF] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.16em] text-[#E8C88A]">
            {mode === 'signin' ? '归档天机' : '建立命册'}
          </DialogTitle>
          <DialogDescription className="text-[#A89EC8]">
            登录后，签文册会在你的所有设备间同步。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">邮箱</Label>
            <Input id="auth-email" type="email" autoComplete="email" value={email}
              onChange={(event) => setEmail(event.target.value)} required
              className="border-[rgba(200,169,110,0.2)] bg-[#151228]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">密码</Label>
            <Input id="auth-password" type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required
              className="border-[rgba(200,169,110,0.2)] bg-[#151228]" />
          </div>
          {message && <p role="status" className="text-sm leading-relaxed text-[#D4849A]">{message}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-[#C8A96E] text-[#07060f] hover:bg-[#E8C88A]">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mode === 'signin' ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {mode === 'signin' ? '登录并同步' : '注册账号'}
          </Button>
          <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(null); }}
            className="w-full text-center text-sm text-[#7EB8A0] hover:text-[#A8D4C0]">
            {mode === 'signin' ? '还没有账号？立即注册' : '已有账号？返回登录'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
