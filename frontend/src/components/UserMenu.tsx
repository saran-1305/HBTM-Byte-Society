import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, CircleUserRound, Settings } from 'lucide-react';
import type { OnboardingProfile } from '@/types/onboarding';

interface UserMenuProps {
  profile: Partial<OnboardingProfile>;
  onNavigate?: () => void;
}

export function UserMenu({ profile, onNavigate }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const go = (path: string) => {
    close();
    onNavigate?.();
    navigate(path);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
      >
        <img
          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name || 'Guest'}`}
          alt="Profile Avatar"
          className="w-9 h-9 rounded-full bg-surface shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{profile.name || 'Guest'}</p>
          <p className="text-[13px] text-muted truncate">{profile.aspiration || 'Learner'}</p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
          <div
            role="menu"
            aria-label="Account menu"
            className="absolute bottom-full left-0 mb-2 w-full min-w-[220px] bg-surface-hover rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in border border-white/10 p-1.5"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => go('/arc')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <Route className="w-4 h-4" /> View arc
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go('/account')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <CircleUserRound className="w-4 h-4" /> Account
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go('/settings')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}
