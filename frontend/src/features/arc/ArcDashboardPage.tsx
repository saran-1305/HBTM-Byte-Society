import React, { useEffect, useState } from 'react';
import { IconCheck, IconBulb, IconClock, IconActivity } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackgroundBlobs from '../../components/layout/BackgroundBlobs';
import ReflectionModal from './ReflectionModal';
import Header from '../../components/layout/Header';
import ArcCollectionSection from '../../components/dashboard/ArcCollectionSection';
import { useLocation } from 'react-router-dom';

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

  const userName = localStorage.getItem('daskalos_user_name') || 'Guest';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <p className="text-xl tracking-widest animate-pulse font-light text-[#3A2E27]">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BackgroundBlobs />
      <ReflectionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInteractionState('STARTED');
        }}
        onSubmit={handleReflectionSubmit}
        isSubmitting={interactionState === 'ANALYZING'}
      />

      <div className="max-w-[1400px] mx-auto py-8 px-6 relative z-10">
        
        {/* MOTIVATION ROW */}
        <header className="flex flex-col md:flex-row md:items-center justify-end mb-8 gap-4">
          <div className="text-right max-w-[320px] animate-fade-in-up">
            <p className="text-[#3A2E27] font-bold text-[15px] leading-snug italic">
              "The discipline of showing up daily is the foundation of every breakthrough."
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          
          {/* TOP ROW: AI SPOTLIGHT */}
          {recommendation && (
            <div className="w-full bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all duration-200 border border-[#3A2E27] overflow-hidden relative flex flex-col md:flex-row h-auto md:h-[340px] animate-fade-in-up delay-[100ms]">
              {/* Left Content */}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-purple-500">✨</span>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-purple-400">AI Spotlight</span>
                </div>
                
                <h2 className="text-3xl font-bold text-[#3A2E27] mb-3 leading-tight max-w-xl">
                  {recommendation.title}
                </h2>
                
                <p className="text-[#5C5C52] text-[15px] mb-6 max-w-lg leading-relaxed line-clamp-3">
                  {recommendation.description}
                </p>
                
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-white/5 border border-[#3A2E27] px-3 py-1.5 rounded-full text-xs font-semibold text-[#3A2E27] flex items-center gap-1.5">
                    <span className="text-[#5C5C52]">▶</span> {recommendation.content_type || 'Video'}
                  </span>
                  <span className="bg-[#E50914]/20 border border-[#E50914]/30 px-3 py-1.5 rounded-full text-xs font-semibold text-[#E50914]">
                    {recommendation.stage || 'Explore'}
                  </span>
                  <span className="bg-white/5 border border-[#3A2E27] px-3 py-1.5 rounded-full text-xs font-semibold text-[#3A2E27] flex items-center gap-1.5">
                    <span className="text-[#5C5C52]">⏱</span> {recommendation.difficulty || 'Beginner'}
                  </span>
                  <span className="bg-white/5 border border-[#3A2E27] px-3 py-1.5 rounded-full text-xs font-semibold text-[#3A2E27] flex items-center gap-1.5">
                    <span className="text-[#5C5C52]">🕒</span> {recommendation.estimated_time || '10-20 mins'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <button 
                    onClick={handleStart}
                    className="bg-[#FF5A36] hover:bg-[#FF5A36]/90 text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                  >
                    ▶ Start Learning
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="bg-transparent border-2 border-[#3A2E27] text-[#3A2E27] font-bold px-6 py-3 rounded-full hover:bg-black/5 transition-colors flex items-center gap-2"
                  >
                    <span className="text-[#5C5C52]">🔖</span> Save for Later
                  </button>
                </div>
              </div>

              {/* Right Image / Overlay */}
              <div className="flex-1 relative hidden md:block">
                {interactionState === 'PLAYING' && recommendation.url ? (
                  <iframe 
                    className="w-full h-full object-cover" 
                    src={`https://www.youtube.com/embed/${recommendation.url.split('v=')[1]?.split('&')[0]}?autoplay=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <img 
                      src={recommendation.thumbnail || "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?q=80&w=1000"} 
                      alt="Thumbnail"
                      className="w-full h-full object-cover opacity-60"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const videoId = recommendation.url?.split('v=')[1]?.split('&')[0];
                        if (videoId && !target.src.includes('mqdefault')) {
                          target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#1A1A1A] to-transparent pointer-events-none"></div>
                    
                    {/* Match Card Overlay */}
                    {curator && (
                      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md border border-[#3A2E27] rounded-xl p-4 w-72 flex items-center gap-4 pointer-events-none">
                        <div className="flex-1">
                          <h4 className="text-[#3A2E27] text-sm font-bold mb-1">Why this for you?</h4>
                          <p className="text-[#5C5C52] text-xs leading-relaxed line-clamp-2">
                            {curator.why_now || "Matches your Explore stage and current interests."}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0">
                          <span className="text-green-500 text-xs font-bold">92%<br/><span className="text-[8px] text-green-500/70 block -mt-1">Match</span></span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* MIDDLE ROW: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Current ARC Stage */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all duration-200 border border-[#3A2E27] p-6 flex flex-col animate-fade-in-up delay-[150ms]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#5C5C52] mb-6">Current ARC Stage</h3>
              
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#3A2E27] mb-2">{arcEvaluation?.stage || 'Explore'}</h2>
                  <p className="text-[#5C5C52] text-sm">Keep exploring. You're doing great!</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#1FA35A]/500/10 border border-[#1FA35A]/500/20 flex items-center justify-center">
                  <span className="text-[#1FA35A]/400 text-2xl">🚀</span>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div className="bg-[#E50914] h-1.5 rounded-full w-[65%]"></div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#5C5C52]">
                  <span>65% Progress</span>
                  <span>35% to Commit</span>
                </div>
              </div>
            </div>

            {/* Column 2: Suggested Next Actions */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all duration-200 border border-[#3A2E27] p-6 flex flex-col animate-fade-in-up delay-[200ms]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#5C5C52] mb-6">Suggested Next Actions</h3>
              
              <div className="flex-1 space-y-0 relative">
                {/* Connecting line */}
                <div className="absolute left-[11px] top-6 bottom-6 w-[2px] border-l-2 border-dashed border-[#3A2E27] z-0"></div>
                
                {arcEvaluation?.suggested_actions?.slice(0, 2).map((sa, idx) => (
                  <div key={idx} className="flex gap-4 relative z-10 pb-6 last:pb-0">
                    <div className="mt-1 w-6 h-6 rounded-full bg-white border-2 border-white/20 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#3A2E27] text-sm font-semibold mb-1">{sa.action}</p>
                      <p className="text-[#5C5C52] text-xs">{sa.why}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-[#5C5C52] text-xs">{idx === 0 ? '▶' : '✎'}</span>
                    </div>
                  </div>
                ))}
                
                {(!arcEvaluation?.suggested_actions || arcEvaluation.suggested_actions.length === 0) && (
                  <div className="flex gap-4 relative z-10">
                    <div className="mt-1 w-6 h-6 rounded-full bg-white border-2 border-white/20 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#3A2E27] text-sm font-semibold mb-1">Watch the 1st 15 mins</p>
                      <p className="text-[#5C5C52] text-xs">Focus on key points</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <span className="text-[#5C5C52] text-xs">▶</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Today's Plan */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] p-6 flex flex-col">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#5C5C52] mb-6">Today's Plan</h3>
              
              <div className="flex-1 space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-green-500/50 flex items-center justify-center bg-green-500/10">
                      <span className="text-green-500 text-[10px]">✓</span>
                    </div>
                    <span className="text-[#3A2E27] text-sm">Learn something new</span>
                  </div>
                  <span className="text-[#5C5C52] text-xs font-mono">1/1</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                    </div>
                    <span className="text-[#3A2E27] text-sm">Complete reflection</span>
                  </div>
                  <span className="text-[#5C5C52] text-xs font-mono">0/1</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                    </div>
                    <span className="text-[#3A2E27] text-sm">Track your progress</span>
                  </div>
                  <span className="text-[#5C5C52] text-xs font-mono">0/1</span>
                </div>
              </div>
              
              <button className="w-full bg-black/5 hover:bg-black/10 border-2 border-[#3A2E27] rounded-full py-3 text-[#3A2E27] text-sm font-bold transition-colors mt-auto">
                View Full Plan &gt;
              </button>
            </div>

          </div>

          {/* BOTTOM ROW: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recent AI Decisions */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#5C5C52]">Recent AI Decisions</h3>
                <span className="text-[#1D9E75] text-xs font-bold cursor-pointer hover:text-[#1D9E75]/80">View all</span>
              </div>
              
              <div className="bg-white/5 rounded-xl border border-[#3A2E27]/20 p-4 flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#1FA35A]/500/10 border border-[#1FA35A]/500/20 flex items-center justify-center shrink-0">
                  <span className="text-[#1FA35A]/400 text-sm">🕒</span>
                </div>
                <div>
                  <p className="text-[#3A2E27] text-sm font-semibold mb-1">
                    {timeline.length > 0 ? (
                       <><span className="capitalize">{timeline[0].stage}</span> <span className="text-[#5C5C52] font-normal">({timeline[0].decision === 'CHANGE' ? 'transitioned' : 'stayed'})</span></>
                    ) : (
                       <>Explore <span className="text-[#5C5C52] font-normal">(stayed)</span></>
                    )}
                  </p>
                  <p className="text-[#5C5C52] text-xs mb-3 leading-relaxed">
                    {timeline.length > 0 
                      ? (timeline[0].ai_observation.includes('System fallback') ? 'Still learning your patterns — check back after a few more curations.' : timeline[0].ai_observation) 
                      : "Still learning your patterns — check back after a few more curations."}
                  </p>
                  <p className="text-[#3A2E27]/30 text-[10px] uppercase font-bold tracking-wider">
                    {timeline.length > 0 ? new Date(timeline[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Today, 6:42 AM"}
                  </p>
                </div>
              </div>
            </div>

            {/* Observation Feed */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#5C5C52]">Observation Feed</h3>
                <span className="text-[#1D9E75] text-xs font-bold cursor-pointer hover:text-[#1D9E75]/80">View all</span>
              </div>
              
              <div className="space-y-4">
                {observations.slice(0, 2).map((obs, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                      <p className="text-[#3A2E27] text-sm leading-snug">
                        <span className="text-blue-400 font-medium">[{obs.source_module}]</span> {obs.title}
                      </p>
                      <p className="text-[#3A2E27]/30 text-[10px] uppercase font-bold tracking-wider mt-1">
                        {new Date(obs.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}

                {(!observations || observations.length === 0) && (
                  <>
                    <div className="flex gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                      <div>
                        <p className="text-[#3A2E27] text-sm leading-snug">
                          <span className="text-blue-400 font-medium">[Recommendation]</span> 3 Career Paths For Teachers In India: Find What Fits You!
                        </p>
                        <p className="text-[#3A2E27]/30 text-[10px] uppercase font-bold tracking-wider mt-1">Today, 7:02 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                      <div>
                        <p className="text-[#3A2E27] text-sm leading-snug">
                          <span className="text-green-500 font-medium">[Knowledge]</span> What Makes a Great Teacher in the 21st Century?
                        </p>
                        <p className="text-[#3A2E27]/30 text-[10px] uppercase font-bold tracking-wider mt-1">Today, 6:55 AM</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* New Merch Section */}
          <ArcCollectionSection />

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArcDashboardPage;





