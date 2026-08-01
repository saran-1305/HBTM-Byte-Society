import React, { useEffect, useState } from 'react';
import { IconCheck, IconBrain, IconArrowRight, IconClock, IconActivity } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface ArcProfile {
  current_stage: string;
  stage_started_at: string;
  current_reasoning: string | null;
  ai_observation: string | null;
  suggested_next_action: string | null;
  last_evaluation_at: string | null;
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
  const [profile, setProfile] = useState<ArcProfile | null>(null);
  const [history, setHistory] = useState<ArcHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchArcData = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/arc/profile/${TEST_USER_ID}`),
        fetch(`http://127.0.0.1:8000/api/arc/history/${TEST_USER_ID}`)
      ]);
      
      if (profileRes.ok) setProfile(await profileRes.json());
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

  const handleForceEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/arc/evaluate/${TEST_USER_ID}`, {
        method: 'POST'
      });
      if (res.ok) {
        setProfile(await res.json());
        // Refetch history in case of transition
        const historyRes = await fetch(`http://127.0.0.1:8000/api/arc/history/${TEST_USER_ID}`);
        if (historyRes.ok) setHistory(await historyRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
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

  const currentStageIndex = profile ? STAGES.indexOf(profile.current_stage) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 max-w-5xl mx-auto pt-8">
        
        {/* Header Block */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[28px] font-bold text-white mb-2 flex items-center gap-3">
              ARC Intelligence Engine
              <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-emerald-500/30">Active</span>
            </h1>
            <p className="text-[15px] text-[#999999]">Adaptive Reflection Cycle: Your AI-driven state engine.</p>
          </div>
          <button 
            onClick={handleForceEvaluation}
            disabled={evaluating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              evaluating 
                ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            <IconBrain size={18} className={evaluating ? "animate-pulse" : ""} />
            {evaluating ? 'Analyzing...' : 'Force AI Evaluation'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main AI Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Observation */}
            <div className="bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <h2 className="text-xs text-blue-400 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                <IconActivity size={16} />
                Latest AI Observation
              </h2>
              <p className="text-lg text-white/90 leading-relaxed font-medium">
                {profile?.ai_observation || "Waiting for meaningful activity to observe..."}
              </p>
              {profile?.last_evaluation_at && (
                <p className="text-xs text-[#666666] mt-4 flex items-center gap-1">
                  <IconClock size={12} /> Evaluated {new Date(profile.last_evaluation_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Current Reasoning */}
            <div className="bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              <h2 className="text-xs text-purple-400 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                <IconBrain size={16} />
                Current Stage Reasoning
              </h2>
              <p className="text-base text-white/80 leading-relaxed">
                {profile?.current_reasoning || "Accumulating behavioral data to form a conclusion."}
              </p>
            </div>

            {/* Suggested Next Action */}
            <div className="bg-[#121212] p-8 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <h2 className="text-xs text-emerald-500 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                <IconArrowRight size={16} />
                Suggested Next Action
              </h2>
              <p className="text-lg text-emerald-400/90 leading-relaxed font-medium">
                {profile?.suggested_next_action || "Complete a recommendation or reflection to get started."}
              </p>
            </div>

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
                        {isCurrent && profile?.stage_started_at && (
                          <span className="text-xs text-[#666666]">
                            Since {new Date(profile.stage_started_at).toLocaleDateString()}
                          </span>
                        )}
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
