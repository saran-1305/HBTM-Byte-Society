import React from 'react';
import { IconPlayerPlay } from '@tabler/icons-react';

interface HeroCurationBannerProps {
  title: string;
  subtitle: string;
  reasoning: string;
  url?: string;
}

const getYoutubeVideoId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const HeroCurationBanner = ({ title, subtitle, reasoning, url }: HeroCurationBannerProps) => {
  const isVideo = subtitle?.toLowerCase().includes("video") || url?.includes("youtube") || url?.includes("youtu.be");
  const videoId = getYoutubeVideoId(url);

  return (
    <div className="w-full h-[340px] rounded-[24px] overflow-hidden relative bg-white border-[1.5px] border-[#3A2E27] flex flex-col md:flex-row select-none">
      
      {/* Left Content Half */}
      <div className="flex-1 p-10 flex flex-col justify-center relative z-10 bg-white">
        <span className="text-[14px] font-bold tracking-wide mb-4 text-[#3A2E27] inline-flex items-center gap-1">
          AI Spotlight <span className="text-[12px] border border-white/40 rounded-full w-4 h-4 inline-flex items-center justify-center -translate-y-px">↑</span>
        </span>
        
        <p className="text-[15px] text-[#3A2E27] mb-8 max-w-sm leading-relaxed line-clamp-4">
          {reasoning}
        </p>
        
        <div className="flex items-center gap-4 mt-auto">
          {url ? (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#3A2E27] text-white text-[14px] font-bold px-8 py-3 rounded-full hover:bg-black/80 transition-colors inline-block text-center"
            >
              Start Now
            </a>
          ) : (
            <button className="bg-[#3A2E27] text-white text-[14px] font-bold px-8 py-3 rounded-full hover:bg-black/80 transition-colors">
              Start Now
            </button>
          )}
          <button className="bg-transparent border-2 border-[#3A2E27] text-[#3A2E27] text-[14px] font-bold px-6 py-3 rounded-full hover:bg-black/5 transition-colors">
            Dismiss
          </button>
        </div>
      </div>

      {/* Right Media Half */}
      <a 
        href={url || "#"} 
        target={url ? "_blank" : "_self"} 
        rel="noopener noreferrer"
        className="flex-1 relative h-full group block overflow-hidden cursor-pointer"
      >
        {videoId ? (
          <img 
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
            onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
            alt="YouTube Thumbnail" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <img 
            src="https://picsum.photos/seed/curation_hero/800/600" 
            alt="Thumbnail" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        )}
        
        {/* Subtle gradient to blend into white */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-white to-transparent"></div>
        
        {/* Bottom Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-6 left-8 right-8">
            <p className="text-[24px] font-bold text-[#3A2E27] truncate">
              {title}
            </p>
            <p className="text-[14px] font-medium text-[#3A2E27] mt-1">
              {subtitle}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
};

export default HeroCurationBanner;




