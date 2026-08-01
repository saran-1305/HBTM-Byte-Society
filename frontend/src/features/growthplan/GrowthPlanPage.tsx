import React from 'react';
import { Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const STAGES = ['Explore', 'Commit', 'Struggle', 'Breakthrough', 'Integrate'];
const CURRENT_STAGE_INDEX = 2; // "Struggle" (0-indexed)

const MOCK_PHASES = [
  { 
    title: "Explore: Discover what kind of writer you are", 
    status: "completed", 
    topics: ["Read widely across styles", "Identify what draws you in", "First journal entries"] 
  },
  { 
    title: "Commit: Build a consistent writing habit", 
    status: "completed", 
    topics: ["Daily 15-minute sessions", "Track a writing streak", "Share with one trusted reader"] 
  },
  { 
    title: "Struggle: Push through the messy middle", 
    status: "in_progress", 
    progress: 68, 
    topics: ["Finish a full first draft", "Handle first real feedback", "Keep going without external validation"] 
  },
  { 
    title: "Breakthrough: Publish and find your audience", 
    status: "upcoming", 
    topics: ["Publish your first piece publicly", "Build a simple posting rhythm", "Notice what resonates with readers"] 
  },
  { 
    title: "Integrate: Writing becomes who you are", 
    status: "upcoming", 
    topics: ["Mentor someone earlier in the journey", "Writing feels like identity, not task"] 
  }
];

const GrowthPlanPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        
        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Growth Plan</h1>
          <p className="text-[15px] text-[#999999]">Your path toward becoming a writer who publishes weekly.</p>
        </div>

        {/* Stage Progress Bar (Borderless) */}
        <div className="w-full">
          <div className="flex justify-between gap-3 mb-3">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < CURRENT_STAGE_INDEX;
              const isCurrent = idx === CURRENT_STAGE_INDEX;
              
              let barStyle = "bg-[#222222]"; // upcoming
              if (isCompleted) barStyle = "bg-white";
              if (isCurrent) barStyle = "bg-[#666666]";

              return (
                <div key={stage} className="flex-1 flex flex-col items-center group cursor-default">
                  <div className={`w-full h-[6px] rounded-full mb-3 ${barStyle} transition-colors group-hover:brightness-110`}></div>
                  <span className={`text-[12px] font-bold tracking-wide ${isCompleted || isCurrent ? 'text-white' : 'text-[#666666]'}`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vertical Phase Timeline (Borderless) */}
        <div className="relative pt-4">
          <div className="relative pl-[1.15rem] space-y-12 before:absolute before:inset-0 before:left-6 before:h-full before:w-[2px] before:bg-[#222222]">
            {MOCK_PHASES.map((phase, idx) => {
              const isCompleted = phase.status === 'completed';
              const isInProgress = phase.status === 'in_progress';
              const isUpcoming = phase.status === 'upcoming';

              return (
                <div key={idx} className="relative flex items-start gap-8">
                  {/* Timeline Marker */}
                  <div className="absolute -left-[18px] flex items-center justify-center w-8 h-8 rounded-full bg-black border-[4px] border-black shrink-0 z-10 top-0">
                    {isCompleted && (
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <Check className="w-3.5 h-3.5 text-black stroke-[4]" />
                      </div>
                    )}
                    {isInProgress && (
                      <div className="w-full h-full rounded-full bg-[#333333] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                      </div>
                    )}
                    {isUpcoming && (
                      <div className="w-full h-full rounded-full border-2 border-[#333333] bg-black"></div>
                    )}
                  </div>

                  {/* Phase Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={`text-[18px] font-bold mb-1 tracking-tight ${isUpcoming ? 'text-[#666666]' : 'text-white'}`}>
                      {phase.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-5">
                      {isCompleted && <span className="text-[13px] text-white/50 font-bold tracking-wide uppercase">Completed</span>}
                      {isInProgress && <span className="text-[13px] text-white font-bold tracking-wide uppercase">In progress · {phase.progress}%</span>}
                      {isUpcoming && <span className="text-[13px] text-[#444444] font-bold tracking-wide uppercase">Upcoming</span>}
                    </div>

                    {isInProgress && (
                      <div className="w-full h-1 bg-[#222222] rounded-full mb-6 max-w-md overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${phase.progress}%` }}></div>
                      </div>
                    )}

                    <ul className="space-y-3 mt-2 max-w-2xl">
                      {phase.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isUpcoming ? 'bg-[#222222]' : isCompleted ? 'bg-white/20' : 'bg-white/70'}`}></div>
                          <span className={`text-[14px] leading-relaxed ${isUpcoming ? 'text-[#666666]' : isCompleted ? 'text-[#999999]' : 'text-white'}`}>
                            {topic}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why this plan Card (Borderless) */}
        <div className="md:w-2/3 border-t border-[#222222] pt-8 mt-4">
          <h2 className="text-[13px] uppercase font-bold tracking-widest text-[#666666] mb-3">Why this order</h2>
          <p className="text-[14px] text-[#999999] leading-relaxed">
            DASKALOS sequences phases based on where resistance typically shows up first — habit before craft, craft before exposure. Your plan adjusts organically if your actual behavioral pattern differs.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default GrowthPlanPage;
