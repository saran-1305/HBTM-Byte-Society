import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  IconCircleCheck, IconCircle, IconCircleDashed, IconSparkles,
  IconPlayerPlay, IconHeadphones, IconFileText, IconFlame,
} from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { ALL_RECOMMENDATIONS } from '@/lib/recommendations';
import type { OnboardingProfile } from '@/types/onboarding';

interface RightPanelProps {
  profile: Partial<OnboardingProfile>;
  reasoning: string;
  streak: number;
}

function PanelCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function RightPanel({ profile, reasoning, streak }: RightPanelProps) {
  const aspiration = profile.aspiration;
  const stuckPoint = profile.stuckPoint;

  const steps: { label: string; status: 'completed' | 'current' | 'upcoming' }[] = [
    { label: aspiration ? `Goal: ${aspiration}` : 'Define your main goal', status: aspiration ? 'completed' : 'upcoming' },
    { label: stuckPoint ? `Work past: ${stuckPoint}` : 'Identify where you get stuck', status: stuckPoint ? 'current' : 'upcoming' },
    { label: 'Build daily consistency', status: 'upcoming' },
    { label: 'Reflect and adjust', status: 'upcoming' },
  ];

  const counts = {
    video: ALL_RECOMMENDATIONS.filter((r) => r.type === 'video').length,
    audio: ALL_RECOMMENDATIONS.filter((r) => r.type === 'audio').length,
    reading: ALL_RECOMMENDATIONS.filter((r) => r.type === 'book' || r.type === 'article').length,
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelCard title="Reflection streak">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-lg shrink-0', streak > 0 ? 'bg-spotlight/15' : 'bg-white/5')}>
            <IconFlame className={cn('w-5 h-5', streak > 0 ? 'text-spotlight' : 'text-white/40')} stroke={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white leading-none">
              {streak > 0 ? `${streak} day${streak === 1 ? '' : 's'}` : 'No streak yet'}
            </p>
            <p className="text-xs text-muted mt-1">
              {streak > 0 ? 'Reflect today to keep it going.' : 'Log a reflection to start one.'}
            </p>
          </div>
        </div>
      </PanelCard>

      <PanelCard
        title="Growth Plan"
        action={<Link to="/identity" className="text-xs text-muted hover:text-white transition-colors">Full plan</Link>}
      >
        <div className="relative pl-2.5 space-y-4">
          <div className="absolute left-[0.85rem] top-1.5 bottom-1.5 w-px bg-white/10" />
          {steps.map((step, i) => {
            const Icon = step.status === 'completed' ? IconCircleCheck : step.status === 'current' ? IconCircle : IconCircleDashed;
            const iconColor = step.status === 'completed' ? 'text-white' : step.status === 'current' ? 'text-spotlight' : 'text-white/25';
            return (
              <div key={i} className="relative z-10 flex gap-3">
                <Icon className={cn('w-4 h-4 shrink-0 mt-0.5 bg-surface rounded-full', iconColor)} stroke={2} />
                <p className={cn('text-sm leading-snug', step.status === 'upcoming' ? 'text-white/35' : 'text-white')}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </PanelCard>

      <PanelCard
        title="Knowledge Stats"
        action={<Link to="/knowledge" className="text-xs text-muted hover:text-white transition-colors">Browse</Link>}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <IconPlayerPlay className="w-4 h-4 text-white/70" stroke={1.5} />
            </div>
            <p className="text-sm text-white/80 flex-1">Videos</p>
            <p className="text-sm font-semibold text-white">{counts.video}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <IconHeadphones className="w-4 h-4 text-white/70" stroke={1.5} />
            </div>
            <p className="text-sm text-white/80 flex-1">Audio</p>
            <p className="text-sm font-semibold text-white">{counts.audio}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <IconFileText className="w-4 h-4 text-white/70" stroke={1.5} />
            </div>
            <p className="text-sm text-white/80 flex-1">Reading</p>
            <p className="text-sm font-semibold text-white">{counts.reading}</p>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Why this, why now">
        <div className="flex gap-3">
          <IconSparkles className="w-4 h-4 text-spotlight shrink-0 mt-0.5" stroke={1.5} />
          <p className="text-[13px] text-white/70 leading-relaxed italic">{reasoning}</p>
        </div>
      </PanelCard>
    </div>
  );
}
