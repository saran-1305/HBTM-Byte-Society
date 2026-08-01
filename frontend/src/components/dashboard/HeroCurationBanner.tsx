import React from 'react';
import { IconPlayerPlay } from '@tabler/icons-react';

const HeroCurationBanner = () => {
  const isVideo = true;
  const isWildcard = false;

  return (
    <div className="w-full h-[340px] rounded-[24px] overflow-hidden relative bg-[#E50914] flex flex-col md:flex-row">
      
      {/* Left Content Half */}
      <div className="flex-1 p-10 flex flex-col justify-center relative z-10">
        <span className="text-[14px] font-bold tracking-wide mb-4 text-white inline-flex items-center gap-1">
          Spotlight <span className="text-[12px] border border-white/40 rounded-full w-4 h-4 inline-flex items-center justify-center -translate-y-px">↑</span>
        </span>
        
        <p className="text-[15px] text-white/90 mb-8 max-w-sm leading-relaxed">
          You've been wrestling with theoretical system design concepts. This provides a fast, concrete walkthrough matched directly to where you are.
        </p>
        
        <div className="flex items-center gap-4 mt-auto">
          <button className="bg-white text-black text-[14px] font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
            Start Now
          </button>
          <button className="bg-transparent text-white text-[14px] font-bold px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
            Dismiss
          </button>
        </div>
      </div>

      {/* Right Media Half (if video) */}
      {isVideo && (
        <div className="flex-1 relative h-full group cursor-pointer">
          <img 
            src="https://picsum.photos/seed/curation_hero/800/600" 
            alt="Video thumbnail" 
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          />
          {/* Subtle gradient to blend into red */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#E50914] to-transparent"></div>
          
          {/* Bottom Title Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-6 left-8 right-8">
              <p className="text-[24px] font-bold text-white truncate">
                System Design Interview in 40 Minutes
              </p>
              <p className="text-[14px] font-medium text-white/80 mt-1">
                Alex Xu
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCurationBanner;
