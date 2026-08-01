import React from 'react';
import { IconCheck, IconTarget, IconBrain, IconSparkles } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const RightPanel = () => {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Mini Vertical Growth Plan */}
      <div className="bg-[#121212] rounded-[16px] p-6 hover:bg-[#1A1A1A] transition-all duration-150">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[14px] font-bold text-white flex items-center gap-2">
            <IconTarget className="w-4 h-4 text-white" stroke={2} />
            Your Plan
          </h2>
          <Link to="/growth-plan" className="text-[12px] font-medium text-[#999999] hover:text-white transition-colors">
            View full
          </Link>
        </div>

        <div className="relative pl-3 space-y-4 before:absolute before:inset-0 before:ml-[16px] before:h-full before:w-[1px] before:bg-[#333333]">
          {/* Item 1 */}
          <div className="relative flex items-center gap-3">
            <div className="absolute -left-[18px] w-[14px] h-[14px] rounded-full bg-white flex items-center justify-center z-10 border-2 border-[#121212]">
              <IconCheck className="w-2.5 h-2.5 text-black" stroke={3} />
            </div>
            <span className="text-[13px] font-medium text-[#999999]">Explore & Commit</span>
          </div>
          
          {/* Item 2 (Current) */}
          <div className="relative flex items-center gap-3">
            <div className="absolute -left-[18px] w-[14px] h-[14px] rounded-full bg-white flex items-center justify-center z-10 border-2 border-[#121212]">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            <span className="text-[13px] font-bold text-white">Struggle <span className="text-[#999999] ml-1 font-medium">68%</span></span>
          </div>

          {/* Item 3 */}
          <div className="relative flex items-center gap-3">
            <div className="absolute -left-[18px] w-[14px] h-[14px] rounded-full bg-[#121212] z-10 border-2 border-[#333333]"></div>
            <span className="text-[13px] font-medium text-[#666666]">Breakthrough</span>
          </div>
        </div>
      </div>

      {/* Knowledge Stat */}
      <div className="bg-[#121212] rounded-[16px] p-6 hover:bg-[#1A1A1A] hover:-translate-y-[2px] transition-all duration-150">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-[#999999] font-medium mb-1">Knowledge captured</p>
            <h3 className="text-[28px] font-bold text-white leading-none mb-1">18</h3>
            <p className="text-[12px] text-[#999999]">concepts surfaced</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center">
            <IconBrain className="w-4 h-4 text-white" stroke={1.5} />
          </div>
        </div>
      </div>

      {/* AI Curator Note */}
      <div className="bg-[#121212] rounded-[16px] p-6 relative overflow-hidden group hover:bg-[#1A1A1A] transition-colors">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <IconSparkles className="w-4 h-4 text-white" stroke={1.5} />
            <h4 className="text-[13px] font-bold text-white">AI Curator</h4>
          </div>
          <p className="text-[12px] text-[#999999] leading-relaxed mb-4">
            DASKALOS analyzes your reflections to push recommendations matching your exact cognitive gaps.
          </p>
          <Link to="/analytics" className="text-[12px] text-white font-bold hover:underline transition-all">
            View activity →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default RightPanel;
