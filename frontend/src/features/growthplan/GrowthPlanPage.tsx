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
      <div className="space-y-10">
        
        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Growth Plan</h1>
          <p className="text-[15px] text-[#9CA3AF]">Your path toward becoming a writer who publishes weekly.</p>
        </div>

        {/* Stage Progress Bar */}
        <div className="bg-[#131826] border border-[#1F2937] rounded-xl p-6">
          <div className="flex justify-between gap-2 mb-3">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < CURRENT_STAGE_INDEX;
              const isCurrent = idx === CURRENT_STAGE_INDEX;
              
              let barStyle = "bg-transparent border border-[#1F2937]"; // upcoming
              if (isCompleted) barStyle = "bg-[#34D399] border border-[#34D399]";
              if (isCurrent) barStyle = "bg-[#6366F1] border border-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.3)]";

              return (
                <div key={stage} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-2 rounded-full mb-2 ${barStyle}`}></div>
                  <span className={`text-[12px] font-medium ${isCompleted || isCurrent ? 'text-white' : 'text-[#9CA3AF]'}`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vertical Phase Timeline */}
        <div className="bg-[#131826] border border-[#1F2937] rounded-xl p-8 relative">
          
          <div className="relative pl-6 space-y-10 before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-[#1F2937] before:to-transparent">
            {MOCK_PHASES.map((phase, idx) => {
              const isCompleted = phase.status === 'completed';
              const isInProgress = phase.status === 'in_progress';
              const isUpcoming = phase.status === 'upcoming';

              return (
                <div key={idx} className="relative flex items-start gap-6">
                  {/* Timeline Marker */}
                  <div className="absolute -left-[30px] flex items-center justify-center w-7 h-7 rounded-full bg-[#131826] border-[3px] border-[#131826] shrink-0 z-10 mt-0.5">
                    {isCompleted && (
                      <div className="w-full h-full rounded-full bg-[#34D399] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-[#0B0F1A] stroke-[3]" />
                      </div>
                    )}
                    {isInProgress && (
                      <div className="w-full h-full rounded-full bg-[#6366F1] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                    {isUpcoming && (
                      <div className="w-full h-full rounded-full border-2 border-[#1F2937] bg-[#0B0F1A]"></div>
                    )}
                  </div>

                  {/* Phase Content */}
                  <div className="flex-1">
                    <h3 className={`text-[16px] font-medium mb-1 ${isUpcoming ? 'text-[#9CA3AF]' : 'text-white'}`}>
                      {phase.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {isCompleted && <span className="text-[13px] text-[#34D399] font-medium">Completed</span>}
                      {isInProgress && <span className="text-[13px] text-[#6366F1] font-medium">In progress · {phase.progress}%</span>}
                      {isUpcoming && <span className="text-[13px] text-[#9CA3AF] font-medium">Upcoming</span>}
                    </div>

                    {isInProgress && (
                      <div className="w-full h-1.5 bg-[#1F2937] rounded-full mb-4 max-w-sm">
                        <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${phase.progress}%` }}></div>
                      </div>
                    )}

                    <ul className="space-y-2 mt-2">
                      {phase.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isUpcoming ? 'bg-[#1F2937]' : 'bg-[#9CA3AF]'}`}></div>
                          <span className={`text-[13px] leading-relaxed ${isUpcoming ? 'text-[#9CA3AF]/60' : 'text-[#9CA3AF]'}`}>
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

        {/* Why this plan Card */}
        <div className="bg-[#131826] border border-[#1F2937] rounded-xl p-6 md:w-2/3">
          <h2 className="text-[14px] font-medium text-white mb-2">Why this order</h2>
          <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
            DASKALOS sequences phases based on where resistance typically shows up first — habit before craft, craft before exposure. Your plan adjusts if your actual pattern differs.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default GrowthPlanPage;
