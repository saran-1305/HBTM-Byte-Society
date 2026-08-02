import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_DATA = [
  { 
    id: 1,
    title: "Designing Data-Intensive Applications", 
    type: "Book", 
    source: "Martin Kleppmann", 
    reasoning: "You're deep in system design right now — this is the foundational text everyone in that stage eventually needs.", 
    wildcard: false 
  },
  { 
    id: 2,
    title: "What Marathon Training Teaches About Discipline", 
    type: "Article", 
    source: "Runner's World", 
    reasoning: "This isn't in your usual lane, but the discipline mechanics are identical to what you're building in Deep Work.", 
    wildcard: true 
  }
];

const Recommendations = () => {
  return (
    <div className="bg-[#131826] p-6 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#1F2937] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-[#3A2E27]">Curated for you today</h2>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Matched to your current 'Struggle' phase</p>
        </div>
        <Link to="/recommendations" className="text-[#6366F1] text-[13px] font-semibold hover:text-[#1FA35A]/400 transition-colors bg-[#6366F1]/10 px-3 py-1.5 rounded-full">
          View all
        </Link>
      </div>
      
      <div className="space-y-4 flex-1">
        {MOCK_DATA.map((item) => (
          <div 
            key={item.id}
            className="bg-[#0B0F1A] border border-[#1F2937] rounded-full p-4 hover:border-[#6366F1]/50 transition-all duration-150 group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="bg-[#6366F1]/15 text-[#6366F1] uppercase text-[10px] font-bold rounded-md px-2 py-0.5 tracking-wide">
                {item.type}
              </span>
              
              {item.wildcard && (
                <span className="bg-[#F97316]/15 text-[#F97316] uppercase text-[9px] font-bold rounded-md px-2 py-0.5 tracking-wide">
                   OFF YOUR USUAL PATH
                </span>
              )}
            </div>

            <h3 className="text-[15px] font-medium text-[#3A2E27] mb-1 leading-snug">{item.title}</h3>
            <p className="text-[12px] text-[#9CA3AF] mb-3">{item.source}</p>
            
            <div className="border-l-2 border-[#1F2937] pl-3 py-0.5 mb-2">
              <p className="text-[12px] text-[#9CA3AF] italic leading-relaxed">
                "{item.reasoning}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;




