import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { exportUserData } from '@/lib/exportData';
import { getStageIndex, STAGES } from '@/lib/stage';
import { cn } from '@/lib/cn';
import { Download, Trash2, User, CalendarDays, Target, Fingerprint } from 'lucide-react';

function AccountCard({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Icon className="w-4 h-4 text-spotlight" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        <p className="text-xs text-muted mt-0.5 break-words">{description}</p>
      </div>
      {children}
    </div>
  );
}

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export default function Account() {
  const { profile, updateProfile, reflectionCount, startedAt, resetAll } = useOnboarding();
  const { showToast } = useToast();
  const { registerSearch } = useCommandPalette();
  const navigate = useNavigate();
  const [name, setName] = useState(profile.name || '');
  const [confirmingReset, setConfirmingReset] = useState(false);

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== profile.name) {
      updateProfile({ name: trimmed });
      showToast('Name updated.', { variant: 'success' });
    }
  };

  const handleExport = useCallback(() => {
    exportUserData();
    showToast('Downloading your data...');
  }, [showToast]);

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetAll();
    navigate('/');
  };

  const stageIndex = getStageIndex(profile, reflectionCount);
  const memberSince = startedAt
    ? new Date(startedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not started yet';
  const daysIn = daysSince(startedAt);

  const accountItems = useMemo(() => [
    { id: 'name', label: 'Display name', sublabel: 'Profile', icon: User, onSelect: () => document.getElementById('account-name')?.focus() },
    { id: 'goal', label: 'Goal & obstacle', sublabel: 'Profile', icon: Target, onSelect: () => navigate('/onboarding') },
    { id: 'export', label: 'Export your data', sublabel: 'Your data', icon: Download, onSelect: handleExport },
  ], [navigate, handleExport]);

  useEffect(() => {
    registerSearch({
      placeholder: 'Search your account...',
      getResults: (q) => {
        const search = q.toLowerCase();
        return search ? accountItems.filter((s) => s.label.toLowerCase().includes(search)) : accountItems;
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, accountItems]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Account</h1>
          <p className="text-sm text-muted">Who you are, on the arc, and everything stored about you — separate from app-wide settings.</p>
        </div>

        <div className="bg-surface rounded-2xl p-6 flex items-center gap-4">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name || 'Guest'}`}
            alt="Profile avatar"
            className="w-16 h-16 rounded-full bg-black/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-white truncate">{profile.name || 'Guest'}</p>
            <p className="text-sm text-muted truncate">{STAGES[stageIndex]} stage · {memberSince === 'Not started yet' ? memberSince : `on the arc for ${daysIn} day${daysIn === 1 ? '' : 's'}`}</p>
          </div>
        </div>

        <AccountCard title="Profile" icon={User}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="account-name" className="block text-xs font-medium text-muted mb-1.5">Display name</label>
              <input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-spotlight"
              />
            </div>
            <Row label="Goal & obstacle" description={profile.aspiration || 'Not set yet'}>
              <Link to="/onboarding" className="text-xs font-medium text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                Edit
              </Link>
            </Row>
          </div>
        </AccountCard>

        <AccountCard title="Details" icon={Fingerprint}>
          <Row label="Member since" description={memberSince}>
            <CalendarDays className="w-4 h-4 text-muted shrink-0" />
          </Row>
          <Row label="Local user ID" description={profile.userId || '—'}>
            <span className="text-[10px] font-mono text-muted bg-black/40 px-2 py-1 rounded shrink-0">local only</span>
          </Row>
        </AccountCard>

        <AccountCard title="Your data" icon={Download}>
          <div className="flex flex-col gap-3">
            <Row label="Export your data" description="Download everything stored about you as a JSON file.">
              <button
                type="button"
                onClick={handleExport}
                className="text-xs font-medium text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                Export
              </button>
            </Row>
            <Row
              label="Reset profile"
              description={confirmingReset ? 'Click again to permanently erase your profile, reflections, saves, and preferences.' : 'Erases your profile, reflections, saves, and preferences from this browser and starts over.'}
            >
              <button
                type="button"
                onClick={handleReset}
                onBlur={() => setConfirmingReset(false)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 inline-flex items-center gap-1.5',
                  confirmingReset ? 'bg-spotlight text-white hover:bg-spotlight-dark' : 'bg-white/10 text-white hover:bg-white/15'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmingReset ? 'Confirm reset' : 'Reset'}
              </button>
            </Row>
          </div>
        </AccountCard>
      </div>
    </DashboardLayout>
  );
}
