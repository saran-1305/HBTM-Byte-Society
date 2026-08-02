import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FALLBACK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const STAGE_NAMES = ['explore', 'commit', 'struggle', 'breakthrough', 'integrate'];
const STAGE_LABELS: Record<string, string> = { explore: 'Explore', commit: 'Commit', struggle: 'Struggle', breakthrough: 'Breakthrough', integrate: 'Integrate' };

interface StageHistoryItem {
  id: string;
  previous_stage: string | null;
  current_stage: string;
  transition_reason: string;
  transitioned_at: string;
}

interface ObservationItem {
  source_module: string;
}

const CustomDot = (props: any) => {
  const { cx, cy } = props;
  return <circle cx={cx} cy={cy} r={5} fill="#FFFFFF" stroke="#121212" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#121212] border border-[#333333] p-3 rounded-lg shadow-xl">
        <p className="text-white font-bold mb-1">{label}</p>
        <p className="text-[#999999] text-sm">Stage: <span className="text-white capitalize">{STAGE_LABELS[data.stageName]}</span></p>
        <p className="text-white/60 text-xs mt-1 italic max-w-[220px]">"{data.reason}"</p>
      </div>
    );
  }
  return null;
};

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const AnalyticsPage = () => {
  const userId = localStorage.getItem('daskalos_user_id') || FALLBACK_USER_ID;

  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [history, setHistory] = useState<StageHistoryItem[]>([]);
  const [observations, setObservations] = useState<ObservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evalRes, historyRes, obsRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/arc/evaluation/${userId}`),
          fetch(`http://127.0.0.1:8000/api/arc/history/${userId}`),
          fetch(`http://127.0.0.1:8000/api/arc/observations/${userId}`),
        ]);
        if (evalRes.ok) {
          const data = await evalRes.json();
          setCurrentStage(data.stage);
          setConfidence(data.confidence);
        }
        if (historyRes.ok) setHistory(await historyRes.json());
        if (obsRes.ok) setObservations(await obsRes.json());
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <p className="text-xl tracking-widest animate-pulse font-light text-white">Loading Analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStageIndex = currentStage ? STAGE_NAMES.indexOf(currentStage) : 0;

  // Real chart data built from actual stage transitions, oldest first
  const journeyData = [...history]
    .sort((a, b) => new Date(a.transitioned_at).getTime() - new Date(b.transitioned_at).getTime())
    .map(h => ({
      date: new Date(h.transitioned_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      stage: STAGE_NAMES.indexOf(h.current_stage) + 1,
      stageName: h.current_stage,
      reason: h.transition_reason,
    }));

  const obsBySource: Record<string, number> = {};
  observations.forEach(o => {
    obsBySource[o.source_module] = (obsBySource[o.source_module] || 0) + 1;
  });
  const totalObs = observations.length;
  const sourceColors = ['bg-white', 'bg-[#999999]', 'bg-[#666666]', 'bg-[#333333]', 'bg-[#E50914]'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Analytics</h1>
          <p className="text-[15px] text-[#999999]">How your journey has actually moved, not how much time you've spent.</p>
        </div>

        {/* Top Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#121212] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-sm font-bold text-[#999999] mb-1">Current stage</p>
              <h2 className="text-[24px] font-bold text-white leading-tight capitalize">{currentStage || 'Unknown'}</h2>
              <p className="text-[12px] text-[#999999] mt-1">{ordinal(currentStageIndex + 1)} of {STAGE_NAMES.length} stages</p>
            </div>
            <div className="flex gap-1.5 mt-4">
              {STAGE_NAMES.map((s, idx) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${idx <= currentStageIndex ? 'bg-white' : 'bg-[#333333]'}`}></div>
              ))}
            </div>
          </div>

          <div className="bg-[#121212] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-sm font-bold text-[#999999] mb-1">Stage transitions</p>
              <h2 className="text-[24px] font-bold text-white leading-tight">{history.length}</h2>
            </div>
            <p className="text-[12px] text-[#999999] mt-4 leading-relaxed">
              Evidence-based transitions ARC has made for you — never a time-based level-up.
            </p>
          </div>

          <div className="bg-[#121212] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-sm font-bold text-[#999999] mb-1">Latest evaluation confidence</p>
              <h2 className="text-[24px] font-bold text-white leading-tight capitalize">{confidence || 'N/A'}</h2>
            </div>
            <p className="text-[12px] text-[#999999] mt-4">
              How much evidence ARC actually had behind its last read on you
            </p>
          </div>
        </div>

        {/* Journey Timeline Chart */}
        <div className="bg-[#121212] p-6 rounded-xl">
          <h2 className="text-[16px] font-bold text-white mb-6">Journey over time</h2>
          {journeyData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-white/40 text-sm">No stage transitions yet — this fills in as ARC moves you through your journey.</p>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={journeyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#999999"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(val) => STAGE_LABELS[STAGE_NAMES[val - 1]]}
                    stroke="#999999"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="stepAfter"
                    dataKey="stage"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    dot={<CustomDot />}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#333333]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              <span className="text-[12px] text-[#999999]">Stage transition (real, AI-evaluated)</span>
            </div>
          </div>
        </div>

        {/* Observation Breakdown */}
        <div className="bg-[#121212] p-6 rounded-xl">
          <h2 className="text-[15px] font-bold text-white mb-6">Evidence breakdown</h2>
          {totalObs === 0 ? (
            <p className="text-white/40 text-sm">No observations recorded yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="w-full flex h-3 rounded-full overflow-hidden mb-6">
                {Object.entries(obsBySource).map(([source, count], idx) => (
                  <div key={source} style={{ width: `${(count / totalObs) * 100}%` }} className={sourceColors[idx % sourceColors.length]}></div>
                ))}
              </div>
              <div className="space-y-3">
                {Object.entries(obsBySource).map(([source, count], idx) => (
                  <div key={source} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sourceColors[idx % sourceColors.length]}`}></div>
                      <span className="text-[#999999] capitalize">{source}</span>
                    </div>
                    <span className="text-white font-bold">{Math.round((count / totalObs) * 100)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/30 pt-2">Based on your {totalObs} most recent recorded observations.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
