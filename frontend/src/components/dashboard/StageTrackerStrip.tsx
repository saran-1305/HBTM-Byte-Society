import React from 'react';
import { IconCheck } from '@tabler/icons-react';

const STAGES = ['Explore', 'Commit', 'Struggle', 'Breakthrough', 'Integrate'];
const CURRENT_INDEX = 2; // Struggle

const StageTrackerStrip = () => {
  return (
    <div className="w-full flex items-center gap-2 my-8">
      {STAGES.map((stage, idx) => {
        const isCompleted = idx < CURRENT_INDEX;
        const isCurrent = idx === CURRENT_INDEX;
        const isUpcoming = idx > CURRENT_INDEX;

        if (isCompleted) {
          return (
            <div key={stage} className="flex-1 bg-white rounded-xl py-2.5 px-4 flex items-center justify-between transition-all hover:-translate-y-[2px]">
              <span className="text-[13px] font-bold text-black">{stage}</span>
              <IconCheck className="w-4 h-4 text-black" stroke={3} />
            </div>
          );
        }

        if (isCurrent) {
          return (
            <div key={stage} className="flex-1 bg-[#222222] rounded-xl py-2.5 px-4 flex flex-col justify-center relative overflow-hidden transition-all hover:-translate-y-[2px]">
              <div className="flex justify-between items-center relative z-10 mb-1">
                <span className="text-[13px] font-bold text-white">{stage}</span>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              {/* Progress bar inside the active block */}
              <div className="w-full h-1 bg-black/40 rounded-full relative z-10">
                <div className="h-full w-[68%] bg-white rounded-full"></div>
              </div>
            </div>
          );
        }

        if (isUpcoming) {
          return (
            <div key={stage} className="flex-1 rounded-xl py-2.5 px-4 flex items-center justify-center bg-[#121212] transition-all hover:-translate-y-[2px] hover:bg-[#1A1A1A]">
              <span className="text-[13px] font-medium text-[#666666]">{stage}</span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default StageTrackerStrip;
