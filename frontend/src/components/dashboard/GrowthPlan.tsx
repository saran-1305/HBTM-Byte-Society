import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const GrowthPlan = () => {
  const steps = [
    { title: 'Explore', status: 'completed' },
    { title: 'Commit', status: 'completed' },
    { title: 'Struggle', status: 'active', progress: 68 },
    { title: 'Breakthrough', status: 'upcoming' },
    { title: 'Integrate', status: 'upcoming' }
  ];

  return (
    <div className="bg-[#131826] p-6 rounded-2xl border border-[#1F2937] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-white">Your Growth Plan</h2>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Path to writing weekly</p>
        </div>
        <Link to="/growth-plan" className="text-[#6366F1] text-[13px] font-semibold hover:text-indigo-400 transition-colors bg-[#6366F1]/10 px-3 py-1.5 rounded-lg">
          View full
        </Link>
      </div>

      <div className="relative pl-5 mt-2 space-y-6 flex-1 before:absolute before:inset-0 before:ml-[0.95rem] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-[#1F2937] before:to-transparent">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isUpcoming = step.status === 'upcoming';

          return (
            <div key={index} className="relative flex items-center gap-4">
              <div className="absolute -left-[27px] flex items-center justify-center w-6 h-6 rounded-full bg-[#131826] border-[2px] border-[#131826] shrink-0 z-10 mt-0.5">
                {isCompleted && (
                  <div className="w-full h-full rounded-full bg-[#34D399] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#0B0F1A] stroke-[3]" />
                  </div>
                )}
                {isActive && (
                  <div className="w-full h-full rounded-full bg-[#6366F1] flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                )}
                {isUpcoming && (
                  <div className="w-full h-full rounded-full border-2 border-[#1F2937] bg-[#0B0F1A]"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium text-[14px] ${isUpcoming ? 'text-[#9CA3AF]' : 'text-white'}`}>
                    {step.title}
                  </h3>
                  {isActive && (
                    <span className="text-[11px] font-semibold text-[#6366F1]">{step.progress}%</span>
                  )}
                </div>
                {isActive && (
                   <div className="w-full h-1 bg-[#1F2937] rounded-full mt-2">
                     <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${step.progress}%` }}></div>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthPlan;
