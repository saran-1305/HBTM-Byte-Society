import { useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Switch } from '@/components/Switch';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { Bell, Accessibility } from 'lucide-react';

function SettingsCard({ title, icon: Icon, children }: { title: string; icon: typeof Bell; children: React.ReactNode }) {
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
  const { notificationPrefs, updateNotificationPrefs, reduceMotionOverride, setReduceMotionOverride } = useOnboarding();
  const { registerSearch } = useCommandPalette();

  const settingsItems = useMemo(() => [
    { id: 'new-picks', label: 'New picks notifications', sublabel: 'Notifications', icon: Bell, onSelect: () => updateNotificationPrefs({ newPicks: !notificationPrefs.newPicks }) },
    { id: 'community-replies', label: 'Community replies notifications', sublabel: 'Notifications', icon: Bell, onSelect: () => updateNotificationPrefs({ communityReplies: !notificationPrefs.communityReplies }) },
    { id: 'stage-progress', label: 'Stage progress notifications', sublabel: 'Notifications', icon: Bell, onSelect: () => updateNotificationPrefs({ stageProgress: !notificationPrefs.stageProgress }) },
    { id: 'reduce-motion', label: 'Always reduce motion', sublabel: 'Accessibility', icon: Accessibility, onSelect: () => setReduceMotionOverride(!reduceMotionOverride) },
  ], [notificationPrefs, updateNotificationPrefs, reduceMotionOverride, setReduceMotionOverride]);

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
          <p className="text-sm text-muted">How the app behaves — for your profile and data, see Account.</p>
        </div>

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
      </div>
    </DashboardLayout>
  );
}
