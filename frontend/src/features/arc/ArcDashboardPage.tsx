import React, { useEffect, useState } from 'react';
import { IconCheck, IconBulb, IconClock, IconActivity } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReflectionModal from './ReflectionModal';

const FALLBACK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface SuggestedAction {
  action: string;
  why: string;
}

interface ArcEvaluation {
  id: string;
  stage: string;
  decision: string;
  ai_observation: string | null;
  reasoning: string | null;
  transition_explanation: string | null;
  suggested_actions: SuggestedAction[];
  evidence_used: string[];
  recent_changes: string | null;
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

interface TimelineItem {
  type: 'evaluation' | 'transition';
  timestamp: string;
  stage?: string;
  decision?: string;
  ai_observation?: string;
  reasoning?: string;
  previous_stage?: string;
  current_stage?: string;
  transition_reason?: string;
}

interface ObservationItem {
  id: string;
  observation_type: string;
  source_module: string;
  title: string;
  description: string | null;
  created_at: string;
}

const ArcDashboardPage = () => {
  const userId = localStorage.getItem('daskalos_user_id') || FALLBACK_USER_ID;
  const [arcEvaluation, setArcEvaluation] = useState<ArcEvaluation | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [observations, setObservations] = useState<ObservationItem[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [curator, setCurator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Phase 4 specific state
  const [interactionState, setInteractionState] = useState<'IDLE' | 'PLAYING' | 'STARTED' | 'REFLECTING' | 'ANALYZING' | 'DONE'>('IDLE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reflectionEvaluation, setReflectionEvaluation] = useState<{ decision: string; stage: string; ai_observation: string | null } | null>(null);

  const fetchDashboardData = async () => {
    try {
      // Fetch latest ARC evaluation (real stage, reasoning, and suggested actions — AI-generated, not a placeholder)
      const evalRes = await fetch(`http://127.0.0.1:8000/api/arc/evaluation/${userId}`);
      if (evalRes.ok) {
        const data = await evalRes.json();
        setArcEvaluation(data);
      }

      // Fetch recent AI decision timeline
      const timelineRes = await fetch(`http://127.0.0.1:8000/api/arc/timeline/${userId}`);
      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setTimeline(data);
      }

      // Fetch raw observation feed (every signal ARC has collected from other modules)
      const observationsRes = await fetch(`http://127.0.0.1:8000/api/arc/observations/${userId}`);
      if (observationsRes.ok) {
        const data = await observationsRes.json();
        setObservations(data);
      }

      // Fetch Curator (which includes Recommendation)
      const curatorRes = await fetch(`http://127.0.0.1:8000/api/curator/${userId}`);
      if (curatorRes.ok) {
        const curatorData = await curatorRes.json();
        setRecommendation(curatorData.recommendation);
        setCurator(curatorData.curator);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleStart = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/activity/${userId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendation.id })
      });
      setInteractionState('PLAYING');
    } catch (e) {
      console.error("Start failed", e);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/activity/${userId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendation.id })
      });
      setRecommendation(null);
      fetchDashboardData();
    } catch (e) {
      console.error("Dismiss failed", e);
    }
  };

  const handleCompleteClick = () => {
    // Open reflection modal immediately
    setIsModalOpen(true);
    setInteractionState('REFLECTING');
  };

  const handleReflectionSubmit = async (reflection: { biggest_insight: string; confusion: string; application: string }) => {
    setInteractionState('ANALYZING');
    try {
      // First, log complete
      await fetch(`http://127.0.0.1:8000/api/activity/${userId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendation.id })
      });

      // Then, submit reflection
      const res = await fetch(`http://127.0.0.1:8000/api/activity/${userId}/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation_id: recommendation.id,
          ...reflection
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReflectionEvaluation(data.evaluation || null);
        setInteractionState('DONE');
        setIsModalOpen(false);
        // Refresh dashboard to show the fresh ARC evaluation, suggestions, and timeline
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Reflection failed", e);
      setInteractionState('STARTED');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <p className="text-xl tracking-widest animate-pulse font-light text-white">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ReflectionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInteractionState('STARTED');
        }}
        onSubmit={handleReflectionSubmit}
        isSubmitting={interactionState === 'ANALYZING'}
      />

      <div className="max-w-7xl mx-auto py-4">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-white/60 text-lg">
            Let's continue building momentum today.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Recommendation Engine */}
          <div className="space-y-12 mb-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-wide text-white">AI Spotlight</h2>
              </div>
              
              {!recommendation ? (
                <div className="h-48 border border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                  <p className="text-white/40 tracking-wider">Generating best recommendation...</p>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative transition-transform duration-500">
                  {interactionState === 'PLAYING' ? (
                    <div className="w-full aspect-video relative bg-black">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={recommendation.url.includes('watch?v=') ? recommendation.url.replace('watch?v=', 'embed/').split('&')[0] : recommendation.url} 
                        title="Content Player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="h-64 relative overflow-hidden group cursor-pointer" onClick={handleStart}>
                      <img 
                        src={recommendation.thumbnail} 
                        alt={recommendation.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Try mqdefault, then fallback to a gradient placeholder
                          const videoId = recommendation.url.split('v=')[1]?.split('&')[0];
                          if (videoId && !target.src.includes('mqdefault')) {
                            target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                          } else {
                            target.style.display = 'none';
                          }
                        }}
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 shadow-2xl">
                          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-6 flex gap-2">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold capitalize text-white">
                          {recommendation.content_type}
                        </span>
                        <span className="bg-[#E50914]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold capitalize text-white shadow-lg">
                          {recommendation.stage}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-3xl font-bold mb-2 line-clamp-1">{recommendation.title}</h3>
                    <p className="text-white/50 text-sm mb-6">By {recommendation.author}</p>
                    
                    <div className="flex gap-6 mb-6 text-sm text-white/60 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-widest text-white/40 mb-1">Difficulty</span>
                        <span className="text-white font-medium capitalize">{recommendation.difficulty}</span>
                      </div>
                      <div className="w-[1px] bg-white/10"></div>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-widest text-white/40 mb-1">Time</span>
                        <span className="text-white font-medium">{recommendation.estimated_time}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-base mb-8 leading-relaxed">
                      {recommendation.description}
                    </p>
                    
                    {curator && (
                      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 rounded-xl mb-8 space-y-5 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                        
                        <div>
                          <p className="text-xs text-blue-400 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Mentor Insight
                          </p>
                          <h4 className="text-lg font-bold text-white mb-1">{curator.title}</h4>
                          <p className="text-sm text-white/80 leading-relaxed">{curator.summary}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-white/5">
                          <div>
                            <p className="text-xs text-[#E50914] uppercase tracking-widest mb-1.5 font-bold">Why Now?</p>
                            <p className="text-sm text-white/70 leading-relaxed">{curator.why_now}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#E50914] uppercase tracking-widest mb-1.5 font-bold">Learning Focus</p>
                            <p className="text-sm text-white/70 leading-relaxed">{curator.learning_focus}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5 mt-2">
                          <p className="text-xs text-green-500 uppercase tracking-widest mb-1.5 font-bold">Next Action</p>
                          <p className="text-sm text-white/90 font-medium">{curator.next_action}</p>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-purple-400 uppercase tracking-widest mb-1.5 font-bold">Reflection Question</p>
                          <p className="text-sm text-white/80 italic font-medium bg-white/5 p-3 rounded-lg border-l-2 border-purple-500">"{curator.reflection_question}"</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      {interactionState === 'IDLE' && (
                        <>
                          <button 
                            onClick={handleStart}
                            className="flex-1 bg-white text-black font-bold py-4 text-center rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
                          >
                            Start Learning Now
                          </button>
                          <button
                            onClick={handleDismiss}
                            className="px-6 border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}

                      {interactionState === 'PLAYING' && (
                        <div className="flex-1 flex gap-4 animate-fade-in">
                          <button 
                            onClick={handleCompleteClick}
                            className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-center rounded-xl transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          >
                            Finished Watching / Next Step
                          </button>
                          <button 
                            onClick={() => setInteractionState('IDLE')}
                            className="flex-1 border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            Stop
                          </button>
                        </div>
                      )}

                      {interactionState === 'STARTED' && (
                        <div className="flex-1 flex gap-4 animate-fade-in">
                          <div className="flex items-center justify-center px-4">
                            <span className="text-white/60 font-semibold tracking-wide">Did you complete this?</span>
                          </div>
                          <button 
                            onClick={handleCompleteClick}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-center rounded-xl transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          >
                            Yes, completed
                          </button>
                          <button 
                            onClick={() => setInteractionState('IDLE')}
                            className="px-6 border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            Not yet
                          </button>
                        </div>
                      )}

                      {interactionState === 'DONE' && (
                        <div className="flex-1 bg-green-500/20 border border-green-500/50 text-green-400 font-bold py-4 px-4 text-center rounded-xl flex flex-col items-center justify-center gap-1 select-none cursor-default">
                          <span className="flex items-center gap-2">
                            <IconCheck size={20} />
                            Reflection Submitted!
                          </span>
                          {reflectionEvaluation && (
                            <span className="text-xs font-normal text-green-300/80 normal-case">
                              {reflectionEvaluation.decision === 'CHANGE'
                                ? `ARC moved you to the ${reflectionEvaluation.stage} stage.`
                                : reflectionEvaluation.ai_observation || 'ARC has logged this evidence for your next evaluation.'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* ARC Growth Status */}
          {arcEvaluation && (
            <div className="mb-12 space-y-6">
              <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#E50914]/80 px-3 py-1 rounded-full text-xs font-bold capitalize text-white">
                      {arcEvaluation.stage}
                    </span>
                    <span className="text-white/40 text-xs uppercase tracking-widest">Current ARC Stage</span>
                  </div>
                </div>
                <p className="text-white/80 text-base leading-relaxed mb-2">{arcEvaluation.reasoning}</p>
                {arcEvaluation.ai_observation && (
                  <p className="text-white/50 text-sm leading-relaxed">{arcEvaluation.ai_observation}</p>
                )}
              </div>

              {(arcEvaluation.evidence_used?.length > 0 || arcEvaluation.strengths?.length > 0 || arcEvaluation.weaknesses?.length > 0) && (
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-6 space-y-5">
                  {arcEvaluation.evidence_used?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Evidence Used</h3>
                      <ul className="space-y-1.5">
                        {arcEvaluation.evidence_used.map((point, idx) => (
                          <li key={idx} className="text-sm text-white/70 flex gap-2">
                            <span className="text-white/30">•</span>{point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {arcEvaluation.recent_changes && (
                    <div className="pt-3 border-t border-white/5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1.5">Recent Changes</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{arcEvaluation.recent_changes}</p>
                    </div>
                  )}

                  {(arcEvaluation.strengths?.length > 0 || arcEvaluation.weaknesses?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-white/5">
                      {arcEvaluation.strengths?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-green-500/80 mb-1.5">Strengths</h3>
                          <ul className="space-y-1">
                            {arcEvaluation.strengths.map((s, idx) => (
                              <li key={idx} className="text-sm text-white/70">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {arcEvaluation.weaknesses?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400/80 mb-1.5">Weaknesses</h3>
                          <ul className="space-y-1">
                            {arcEvaluation.weaknesses.map((w, idx) => (
                              <li key={idx} className="text-sm text-white/70">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {arcEvaluation.suggested_actions?.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <IconBulb size={18} className="text-green-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Suggested Next Actions</h3>
                  </div>
                  <div className="space-y-3">
                    {arcEvaluation.suggested_actions.map((sa, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-white font-medium text-sm mb-1">{sa.action}</p>
                        {sa.why && <p className="text-white/50 text-xs leading-relaxed">{sa.why}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {timeline.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <IconClock size={18} className="text-purple-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Recent AI Decisions</h3>
                  </div>
                  <div className="space-y-3">
                    {timeline.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-sm border-l-2 border-white/10 pl-4">
                        <div className="flex-1">
                          {item.type === 'transition' ? (
                            <p className="text-white/80">
                              <span className="text-[#E50914] font-bold capitalize">Transitioned</span>{' '}
                              {item.previous_stage} → {item.current_stage}: {item.transition_reason}
                            </p>
                          ) : (
                            <p className="text-white/60">
                              <span className="capitalize font-medium text-white/80">{item.stage}</span>{' '}
                              ({item.decision === 'CHANGE' ? 'transitioned' : 'stayed'}) — {item.ai_observation}
                            </p>
                          )}
                          <p className="text-white/30 text-xs mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {observations.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <IconActivity size={18} className="text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Observation Feed</h3>
                  </div>
                  <div className="space-y-3">
                    {observations.slice(0, 8).map((obs) => (
                      <div key={obs.id} className="flex gap-3 text-sm border-l-2 border-white/10 pl-4">
                        <div className="flex-1">
                          <p className="text-white/70">
                            <span className="text-blue-400/80 font-medium">[{obs.source_module}]</span>{' '}
                            {obs.title}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">{new Date(obs.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArcDashboardPage;
