import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Switch } from '@/components/Switch';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { exportUserData } from '@/lib/exportData';
import { cn } from '@/lib/cn';
import { Download, Trash2, User, Bell, Accessibility } from 'lucide-react';

function SettingsCard({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
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
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { profile, updateProfile, notificationPrefs, updateNotificationPrefs, reduceMotionOverride, setReduceMotionOverride, resetAll } = useOnboarding();
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

  const settingsItems = useMemo(() => [
    { id: 'name', label: 'Display name', sublabel: 'Account', icon: User, onSelect: () => document.getElementById('settings-name')?.focus() },
    { id: 'goal', label: 'Goal & obstacle', sublabel: 'Account', icon: User, onSelect: () => navigate('/onboarding') },
    { id: 'new-picks', label: 'New picks notifications', sublabel: 'Notifications', icon: Bell, onSelect: () => updateNotificationPrefs({ newPicks: !notificationPrefs.newPicks }) },
    { id: 'community-replies', label: 'Community replies notifications', sublabel: 'Notifications', icon: Bell, onSelect: () => updateNotificationPrefs({ communityReplies: !notificationPrefs.communityReplies }) },
    { id: 'stage-progress', label: 'Stage progress notifications', sublabel: 'Notifications', icon: Bell, onSelect: () => updateNotificationPrefs({ stageProgress: !notificationPrefs.stageProgress }) },
    { id: 'reduce-motion', label: 'Always reduce motion', sublabel: 'Accessibility', icon: Accessibility, onSelect: () => setReduceMotionOverride(!reduceMotionOverride) },
    { id: 'export', label: 'Export your data', sublabel: 'Your data', icon: Download, onSelect: handleExport },
  ], [navigate, notificationPrefs, updateNotificationPrefs, reduceMotionOverride, setReduceMotionOverride, handleExport]);

  useEffect(() => {
    registerSearch({
      placeholder: 'Search settings...',
      getResults: (q) => {
        const search = q.toLowerCase();
        return search ? settingsItems.filter((s) => s.label.toLowerCase().includes(search)) : settingsItems;
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, settingsItems]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Settings</h1>
          <p className="text-sm text-muted">Your account, notifications, and data — all local to this browser.</p>
        </div>

        <SettingsCard title="Account" icon={User}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-medium text-muted mb-1.5">Display name</label>
              <input
                id="settings-name"
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
        </SettingsCard>

        <SettingsCard title="Notifications" icon={Bell}>
          <Row label="New picks" description="When your curator finds something worth surfacing.">
            <Switch
              checked={notificationPrefs.newPicks}
              onChange={(v) => updateNotificationPrefs({ newPicks: v })}
              label="Toggle new pick notifications"
            />
          </Row>
          <Row label="Community replies" description="Replies on threads you've posted or upvoted.">
            <Switch
              checked={notificationPrefs.communityReplies}
              onChange={(v) => updateNotificationPrefs({ communityReplies: v })}
              label="Toggle community reply notifications"
            />
          </Row>
          <Row label="Stage progress" description="When you're close to moving to the next stage.">
            <Switch
              checked={notificationPrefs.stageProgress}
              onChange={(v) => updateNotificationPrefs({ stageProgress: v })}
              label="Toggle stage progress notifications"
            />
          </Row>
        </SettingsCard>

        <SettingsCard title="Accessibility" icon={Accessibility}>
          <Row label="Always reduce motion" description="Overrides your system setting and disables animation everywhere in the app.">
            <Switch
              checked={reduceMotionOverride}
              onChange={setReduceMotionOverride}
              label="Toggle reduced motion"
            />
          </Row>
        </SettingsCard>

        <SettingsCard title="Your data" icon={Download}>
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
              label="Clear all data"
              description={confirmingReset ? 'Click again to permanently erase everything and start over.' : 'Erases your profile, reflections, saves, and preferences from this browser.'}
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
                {confirmingReset ? 'Confirm reset' : 'Clear data'}
              </button>
            </Row>
          </div>
        </SettingsCard>
      </div>
    </DashboardLayout>
  );
}
