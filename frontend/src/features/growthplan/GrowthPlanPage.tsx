import React, { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

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

const GrowthPlanPage = () => {
  const [arcStatus, setArcStatus] = useState<ArcStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArcStatus = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/arc/status/${TEST_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setArcStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch arc status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArcStatus();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <p className="text-xl tracking-widest animate-pulse font-light text-white">Loading Growth Plan...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStageIndex = arcStatus ? STAGES.indexOf(arcStatus.current_stage) : 0;
  const progressPercent = arcStatus ? arcStatus.progress : 0;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 max-w-3xl mx-auto pt-8">
        
        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Growth Plan</h1>
          <p className="text-[15px] text-[#999999]">Your dynamic ARC path toward mastery.</p>
        </div>

        {/* ARC Visualization from Dashboard */}
        <div className="space-y-8 bg-[#121212] p-8 rounded-2xl border border-[#333333] shadow-xl">
          <h2 className="text-2xl font-bold tracking-wide text-white mb-6">Current ARC</h2>
          
          <div className="space-y-8">
            {STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isLocked = index > currentStageIndex;
              const isFullyDone = isCurrent && progressPercent >= 100;
              
              return (
                <div key={stage} className={`flex flex-col ${isLocked ? 'opacity-30' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isCompleted || isFullyDone ? 'bg-green-500/20 border-green-500 text-green-500' : isCurrent ? 'bg-[#E50914]/20 border-[#E50914] text-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.5)]' : 'border-[#444444] text-transparent'}`}>
                        {isCompleted || isFullyDone ? <IconCheck size={20} /> : <span className="w-2.5 h-2.5 rounded-full bg-current"></span>}
                      </div>
                      <span className={`capitalize text-2xl font-medium tracking-wide ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                        {stage}
                      </span>
                    </div>
                    
                    {isCurrent && (
                      <span className={isFullyDone ? "text-green-500 font-bold text-lg" : "text-[#E50914] font-bold text-lg"}>
                        {Math.floor(progressPercent)}%
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar (Only show for current stage) */}
                  {isCurrent && (
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden ml-[3.5rem]" style={{ width: 'calc(100% - 3.5rem)' }}>
                      <div 
                        className={isFullyDone ? "h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "h-full bg-gradient-to-r from-[#E50914] to-red-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(229,9,20,0.8)]"}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {currentStageIndex === STAGES.length - 1 && progressPercent >= 100 && (
            <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center animate-fade-in shadow-[0_0_20px_rgba(34,197,94,0.15)]">
              <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 Yay! Today's work is completed!</h3>
              <p className="text-green-500/80 text-lg">
                Outstanding effort integrating your knowledge. Take a well-deserved break and let this momentum carry you forward.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default GrowthPlanPage;
