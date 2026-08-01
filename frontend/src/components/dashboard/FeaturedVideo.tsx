import React from 'react';
import { PlayCircle, Info } from 'lucide-react';

const FeaturedVideo = () => {
  return (
    <div className="bg-[#131826] p-6 rounded-2xl border border-[#1F2937] w-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#F97316]/15 text-[#F97316] uppercase text-[10px] font-bold rounded-md px-2 py-0.5 tracking-wide">
              Featured Video
            </span>
            <span className="bg-[#6366F1]/15 text-[#6366F1] uppercase text-[10px] font-bold rounded-md px-2 py-0.5 tracking-wide flex items-center gap-1">
              Matched to: Struggle Phase
            </span>
          </div>
          <h2 className="text-[20px] font-bold text-white mt-2">System Design Interview in 40 Minutes</h2>
          <p className="text-[13px] text-[#9CA3AF]">Alex Xu • 40 mins</p>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative w-full aspect-video bg-[#0B0F1A] rounded-xl overflow-hidden border border-[#1F2937] mb-4 shadow-lg group">
        <iframe 
          className="w-full h-full"
          src="https://www.youtube.com/embed/pW-SOdj4Kkk?rel=0" 
          title="System Design Interview" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>

      {/* Context/Reasoning */}
      <div className="bg-[#0B0F1A] border border-[#1F2937] rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-[#6366F1] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[13px] font-semibold text-white mb-1">Why this, why now?</h4>
          <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
            You've been wrestling with theoretical system design concepts. This provides a fast, concrete walkthrough matched directly to where you are — less theory, more pattern recognition to help you push through to a breakthrough.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedVideo;
