import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconCheck, IconBrain, IconArrowRight, IconClock, IconActivity, IconTarget, IconTrendingUp, IconBulb, IconSparkles, IconLifebuoy, IconUsers } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FALLBACK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface SuggestedAction {
  action: string;
  why: string;
}

interface ArcEvaluation {
  stage: string;
  decision: string;
  ai_observation: string | null;
  reasoning: string | null;
  evidence_used: string[];
  recent_changes: string | null;
  strengths: string[];
  weaknesses: string[];
  current_focus: string | null;
  behaviour_trend: string | null;
  hidden_opportunity: string | null;
  future_prediction: string | null;
  confidence: string | null;
  suggested_actions: SuggestedAction[];
  created_at: string;
}

interface ArcHistory {
  id: string;
  previous_stage: string | null;
  current_stage: string;
  transition_reason: string;
  ai_summary: string | null;
  transitioned_at: string;
}

const STAGES = [
  "explore",
  "commit",
  "struggle",
  "breakthrough",
  "integrate"
];

const GrowthPlanPage = () => {
  const userId = localStorage.getItem('daskalos_user_id') || FALLBACK_USER_ID;
  const [evaluation, setEvaluation] = useState<ArcEvaluation | null>(null);
  const [history, setHistory] = useState<ArcHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [requestingSupport, setRequestingSupport] = useState(false);
  const [requestedSupport, setRequestedSupport] = useState(false);

  const fetchArcData = async () => {
    try {
      const [evalRes, historyRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/arc/evaluation/${userId}`),
        fetch(`http://127.0.0.1:8000/api/arc/history/${userId}`)
      ]);

      if (evalRes.ok) setEvaluation(await evalRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());

    } catch (err) {
      console.error("Failed to fetch arc data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArcData();
  }, []);

  const handleRefreshAnalysis = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/arc/re-evaluate/${userId}`, {
        method: 'POST'
      });
      if (res.ok) {
        setEvaluation(await res.json());
        // Refetch history in case of transition
        const historyRes = await fetch(`http://127.0.0.1:8000/api/arc/history/${userId}`);
        if (historyRes.ok) setHistory(await historyRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleRequestStruggleSupport = async () => {
    setRequestingSupport(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/arc/observe/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observation_type: 'Struggle Support Requested',
          source_module: 'user',
          title: 'User asked to enter Struggle support mode',
          description: 'User explicitly requested help/mentorship because they are hitting a real setback.',
          trigger_evaluation: true,
        })
      });
      if (res.ok) {
        await fetchArcData();
        setRequestedSupport(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestingSupport(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <p className="text-xl tracking-widest animate-pulse font-light text-white">Loading ARC Intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStageIndex = evaluation ? STAGES.indexOf(evaluation.stage) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 max-w-5xl mx-auto pt-8">

        {/* Header Block */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[28px] font-bold text-white mb-2 flex items-center gap-3">
              ARC Intelligence Engine
              <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-emerald-500/30">Active</span>
              {evaluation?.confidence && (
                <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-white/10">
                  {evaluation.confidence} confidence
                </span>
              )}
            </h1>
            <p className="text-[15px] text-[#999999]">Continuously observing your journey and adapting as you grow.</p>
          </div>
          <div className="flex items-center gap-3">
            {evaluation && (currentStageIndex === 0 || currentStageIndex === 1) && (
              <button
                onClick={handleRequestStruggleSupport}
                disabled={requestingSupport}
                title="Struggle is the one stage you choose to enter yourself — use this when you're hitting a real setback and want support."
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all border ${
                  requestingSupport
                    ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                    : 'bg-transparent text-orange-400 border-orange-400/40 hover:bg-orange-400/10'
                }`}
              >
                <IconLifebuoy size={18} className={requestingSupport ? "animate-pulse" : ""} />
                {requestingSupport ? 'Requesting...' : "I'm Struggling — Get Support"}
              </button>
            )}
            <button
              onClick={handleRefreshAnalysis}
              disabled={evaluating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                evaluating
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <IconBrain size={18} className={evaluating ? "animate-pulse" : ""} />
              {evaluating ? 'Analyzing...' : 'Refresh AI Analysis'}
            </button>
          </div>
        </div>

        {requestedSupport && (
          <Link
            to="/community"
            className="flex items-center justify-between gap-3 bg-orange-500/10 border border-orange-400/30 text-orange-300 px-5 py-3 rounded-xl text-sm hover:bg-orange-500/20 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <IconUsers size={16} />
              Head to Community to post what you're working through — someone who's been there can help.
            </span>
            <IconArrowRight size={16} />
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main AI Feed */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Understanding */}
            <div className="bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <h2 className="text-xs text-blue-400 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                <IconActivity size={16} />
                AI Understanding
              </h2>
              <p className="text-lg text-white/90 leading-relaxed font-medium mb-3">
                {evaluation?.ai_observation || "Waiting for meaningful activity to observe..."}
              </p>
              <p className="text-base text-white/70 leading-relaxed">
                {evaluation?.reasoning || "Accumulating behavioral data to form a conclusion."}
              </p>
              {evaluation?.created_at && (
                <p className="text-xs text-[#666666] mt-4 flex items-center gap-1">
                  <IconClock size={12} /> Evaluated {new Date(evaluation.created_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Current Focus & Momentum */}
            {(evaluation?.current_focus || evaluation?.behaviour_trend) && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                {evaluation?.current_focus && (
                  <div>
                    <h2 className="text-xs text-purple-400 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                      <IconTarget size={16} />
                      Current Focus
                    </h2>
                    <p className="text-base text-white/80 leading-relaxed">{evaluation.current_focus}</p>
                  </div>
                )}
                {evaluation?.behaviour_trend && (
                  <div>
                    <h2 className="text-xs text-orange-400 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                      <IconTrendingUp size={16} />
                      Behaviour Trend
                    </h2>
                    <p className="text-base text-white/80 leading-relaxed">{evaluation.behaviour_trend}</p>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Used */}
            {evaluation?.evidence_used && evaluation.evidence_used.length > 0 && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl relative overflow-hidden">
                <h2 className="text-xs text-[#999999] uppercase tracking-widest mb-4 font-bold">Evidence Used</h2>
                <ul className="space-y-2">
                  {evaluation.evidence_used.map((point, idx) => (
                    <li key={idx} className="text-sm text-white/70 flex gap-2">
                      <span className="text-white/30">•</span>{point}
                    </li>
                  ))}
                </ul>
                {evaluation.recent_changes && (
                  <p className="text-xs text-white/40 mt-4 pt-4 border-t border-white/5 italic">{evaluation.recent_changes}</p>
                )}
              </div>
            )}

            {/* Strengths & Bottleneck */}
            {(evaluation?.strengths?.length || evaluation?.weaknesses?.length) ? (
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {evaluation?.strengths && evaluation.strengths.length > 0 && (
                  <div>
                    <h2 className="text-xs text-green-500 uppercase tracking-widest mb-3 font-bold">Biggest Strength</h2>
                    <ul className="space-y-1.5">
                      {evaluation.strengths.map((s, idx) => (
                        <li key={idx} className="text-sm text-white/70">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation?.weaknesses && evaluation.weaknesses.length > 0 && (
                  <div>
                    <h2 className="text-xs text-red-400 uppercase tracking-widest mb-3 font-bold">Current Bottleneck</h2>
                    <ul className="space-y-1.5">
                      {evaluation.weaknesses.map((w, idx) => (
                        <li key={idx} className="text-sm text-white/70">• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Hidden Opportunity */}
            {evaluation?.hidden_opportunity && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-yellow-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                <h2 className="text-xs text-yellow-400 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                  <IconBulb size={16} />
                  Hidden Opportunity
                </h2>
                <p className="text-base text-white/80 leading-relaxed">{evaluation.hidden_opportunity}</p>
              </div>
            )}

            {/* Future Prediction */}
            {evaluation?.future_prediction && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-blue-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                <h2 className="text-xs text-blue-300 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                  <IconSparkles size={16} />
                  Upcoming Growth Prediction
                </h2>
                <p className="text-base text-white/80 leading-relaxed">{evaluation.future_prediction}</p>
              </div>
            )}

            {/* Suggested Next Actions */}
            {evaluation?.suggested_actions && evaluation.suggested_actions.length > 0 && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <h2 className="text-xs text-emerald-500 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                  <IconArrowRight size={16} />
                  Recommended Next Actions
                </h2>
                <div className="space-y-4">
                  {evaluation.suggested_actions.map((sa, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-4 border-t border-white/5" : ""}>
                      <p className="text-lg text-emerald-400/90 leading-relaxed font-medium">{sa.action}</p>
                      {sa.why && <p className="text-sm text-white/50 mt-1">{sa.why}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar / Stage Timeline */}
          <div className="space-y-6">

            {/* Stage Path */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#333333] shadow-xl">
              <h2 className="text-sm text-[#999999] uppercase tracking-widest mb-6 font-bold">Current Stage</h2>

              <div className="space-y-6">
                {STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isLocked = index > currentStageIndex;

                  return (
                    <div key={stage} className={`flex items-center gap-4 ${isLocked ? 'opacity-30' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : isCurrent ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-[#444444] text-transparent'}`}>
                        {isCompleted ? <IconCheck size={20} /> : <span className="w-2.5 h-2.5 rounded-full bg-current"></span>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`capitalize text-lg font-bold tracking-wide ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                          {stage}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transition History */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#333333] shadow-xl">
              <h2 className="text-sm text-[#999999] uppercase tracking-widest mb-6 font-bold">Stage Timeline</h2>
              <div className="space-y-6">
                {history.length === 0 ? (
                  <p className="text-white/40 text-sm">No stage transitions yet.</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="relative pl-6 border-l border-[#333333]">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#666666]"></div>
                      <p className="text-xs text-[#999999] mb-1">{new Date(h.transitioned_at).toLocaleDateString()}</p>
                      <p className="text-sm font-bold text-white capitalize mb-1">
                        {h.previous_stage ? `${h.previous_stage} → ${h.current_stage}` : `Entered ${h.current_stage}`}
                      </p>
                      <p className="text-sm text-white/60 leading-relaxed italic border-l-2 border-[#444444] pl-3 py-1">
                        "{h.transition_reason}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default GrowthPlanPage;
