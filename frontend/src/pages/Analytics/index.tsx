import { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/Skeleton';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { STAGES, getStageIndex } from '@/lib/stage';
import { useBriefLoading } from '@/lib/useBriefLoading';
import { Compass, Sparkles, TrendingUp } from 'lucide-react';

const DEPTH_SCORE_TREND = [
  { day: 'Jul 19', score: 6.8 },
  { day: 'Jul 21', score: 7.1 },
  { day: 'Jul 23', score: 7.0 },
  { day: 'Jul 25', score: 7.6 },
  { day: 'Jul 27', score: 7.9 },
  { day: 'Jul 29', score: 8.2 },
  { day: 'Jul 31', score: 8.6 },
];

const REFLECTIONS_TREND = [
  { day: 'Mon', count: 1 },
  { day: 'Tue', count: 2 },
  { day: 'Wed', count: 0 },
  { day: 'Thu', count: 3 },
  { day: 'Fri', count: 1 },
  { day: 'Sat', count: 0 },
  { day: 'Sun', count: 2 },
];

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th'];
const AXIS_TICK = { fill: '#999999', fontSize: 12 };

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: any[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-muted mb-0.5">{label}</p>
      <p className="font-semibold text-white">{payload[0].value}{unit}</p>
    </div>
  );
}

export default function Analytics() {
  const { profile, reflectionCount } = useOnboarding();
  const { registerSearch } = useCommandPalette();
  const loading = useBriefLoading();
  const stageIndex = getStageIndex(profile, reflectionCount);
  const curationsThisMonth = 18 + reflectionCount * 2;

  // Thin page, but the metrics are real, tab-specific content rather than a
  // nav fallback: current stage, depth score, and curation count.
  const metrics = useMemo(() => [
    { id: 'stage', label: `Current stage: ${STAGES[stageIndex]}`, sublabel: `${ORDINAL[stageIndex]} of ${STAGES.length} stages`, icon: Compass },
    { id: 'depth', label: 'Depth score: 8.6/10', sublabel: 'Trend over the last two weeks', icon: TrendingUp },
    { id: 'curations', label: `Curations this month: ${curationsThisMonth}`, sublabel: 'Total picks surfaced', icon: Sparkles },
    ...STAGES.map((s, i) => ({
      id: `stage-${s}`,
      label: s,
      sublabel: i === stageIndex ? 'Current stage' : i < stageIndex ? 'Completed' : 'Upcoming',
      icon: Compass,
    })),
  ], [stageIndex, curationsThisMonth]);

  useEffect(() => {
    registerSearch({
      placeholder: 'Search your metrics...',
      getResults: (q) => {
        const search = q.toLowerCase();
        const matches = search ? metrics.filter((m) => m.label.toLowerCase().includes(search)) : metrics;
        return matches.map((m) => ({ ...m, onSelect: () => {} }));
      },
    });
    return () => registerSearch(null);
  }, [registerSearch, metrics]);

  return (
    <DashboardLayout>
      <div className="py-6 flex flex-col gap-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-[-0.02em] text-white mb-1">Analytics</h1>
          <p className="text-sm text-muted">Progress, not streaks: how your growth is trending over time.</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-6" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading your analytics...</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)}
            </div>
            <Skeleton className="h-[264px] rounded-2xl" />
            <Skeleton className="h-[264px] rounded-2xl" />
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-2xl p-5 flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg"><Compass className="w-5 h-5 text-spotlight" /></div>
            <div>
              <p className="text-2xl font-semibold text-white">{STAGES[stageIndex]}</p>
              <p className="text-xs text-muted">{ORDINAL[stageIndex]} of {STAGES.length} stages</p>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-5 flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg"><TrendingUp className="w-5 h-5 text-white/70" /></div>
            <div>
              <p className="text-2xl font-semibold text-white">8.6<span className="text-sm text-muted">/10</span></p>
              <p className="text-xs text-muted">depth score</p>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-5 flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg"><Sparkles className="w-5 h-5 text-white/70" /></div>
            <div>
              <p className="text-2xl font-semibold text-white">{curationsThisMonth}</p>
              <p className="text-xs text-muted">curations this month</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-4">Depth score, last two weeks</h2>
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEPTH_SCORE_TREND} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#242424" strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tick={AXIS_TICK} width={24} />
                <Tooltip content={<ChartTooltip unit="/10" />} cursor={{ stroke: '#242424' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#E50914"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#E50914', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-4">Reflections logged, this week</h2>
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REFLECTIONS_TREND} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#242424" strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS_TICK} width={24} />
                <Tooltip content={<ChartTooltip unit="" />} cursor={{ fill: '#1A1A1A' }} />
                <Bar dataKey="count" fill="#E50914" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}
