import { useState } from 'react';
import { Cloud, CloudOff, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/AuthDialog';
import { AccountDialog } from '@/components/AccountDialog';

export function UserStatus() {
  const { user, loading, configured } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => user ? setAccountOpen(true) : setAuthOpen(true)} disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(200,169,110,0.22)] bg-[rgba(21,18,40,0.72)] px-4 py-2 text-xs tracking-[0.08em] text-[#A89EC8] backdrop-blur transition hover:border-[rgba(200,169,110,0.45)] hover:text-[#E8C88A] disabled:opacity-60">
          {configured ? <Cloud className="h-4 w-4 text-[#7EB8A0]" /> : <CloudOff className="h-4 w-4 text-[#5C5480]" />}
          <UserRound className="h-4 w-4" />
          {loading ? '读取命册…' : user ? '我的命册' : configured ? '登录同步签文' : '本机签文册'}
        </button>
      </div>
      {configured && <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />}
      {user && <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />}
    </>
  );
}
