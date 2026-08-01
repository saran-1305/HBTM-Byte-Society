import React, { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReflectionModal from './ReflectionModal';

const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

// Updated ARC status shape from Phase 4
interface ArcStatus {
  current_stage: string;
  progress: number;
  unlocked_stages: string[];
  next_stage: string | null;
  stage_history: any[];
}

const STAGES = [
  "explore",
  "commit",
  "struggle",
  "breakthrough",
  "integrate"
];

const ArcDashboardPage = () => {
  const [arcStatus, setArcStatus] = useState<ArcStatus | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [curator, setCurator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Phase 4 specific state
  const [interactionState, setInteractionState] = useState<'IDLE' | 'STARTED' | 'REFLECTING' | 'ANALYZING' | 'DONE'>('IDLE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressAdded, setProgressAdded] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      // Fetch dynamic ARC Status
      const arcRes = await fetch(`http://127.0.0.1:8000/api/arc/status/${TEST_USER_ID}`);
      if (arcRes.ok) {
        const data = await arcRes.json();
        setArcStatus(data);
      }

      // Fetch Curator (which includes Recommendation)
      const curatorRes = await fetch(`http://127.0.0.1:8000/api/curator/${TEST_USER_ID}`);
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
      await fetch(`http://127.0.0.1:8000/api/activity/${TEST_USER_ID}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendation.id })
      });
      setInteractionState('STARTED');
      // Open in new tab
      window.open(recommendation.url, '_blank');
    } catch (e) {
      console.error("Start failed", e);
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
      await fetch(`http://127.0.0.1:8000/api/activity/${TEST_USER_ID}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendation.id })
      });

      // Then, submit reflection
      const res = await fetch(`http://127.0.0.1:8000/api/activity/${TEST_USER_ID}/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation_id: recommendation.id,
          ...reflection
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProgressAdded(data.progress_added);
        setInteractionState('DONE');
        setIsModalOpen(false);
        // Refresh dashboard to show new progress/stage
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

  // Use dynamic status index
  const currentStageIndex = arcStatus ? STAGES.indexOf(arcStatus.current_stage) : 0;
  const progressPercent = arcStatus ? arcStatus.progress : 0;

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
          <div className="space-y-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-wide text-white">AI Spotlight</h2>
              </div>
              
              {!recommendation ? (
                <div className="h-48 border border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                  <p className="text-white/40 tracking-wider">Generating best recommendation...</p>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group transition-transform duration-500 hover:-translate-y-1">
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={recommendation.thumbnail} 
                      alt={recommendation.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 flex gap-2">
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold capitalize text-white">
                        {recommendation.content_type}
                      </span>
                      <span className="bg-[#E50914]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold capitalize text-white shadow-lg">
                        {recommendation.stage}
                      </span>
                    </div>
                  </div>
                  
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
                          <button className="px-6 border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors">
                            Dismiss
                          </button>
                        </>
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
                        <div className="flex-1 bg-green-500/20 border border-green-500/50 text-green-400 font-bold py-4 text-center rounded-xl flex items-center justify-center gap-2 select-none cursor-default">
                          <IconCheck size={20} />
                          Reflection Submitted! (+{progressAdded}% Progress)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArcDashboardPage;
