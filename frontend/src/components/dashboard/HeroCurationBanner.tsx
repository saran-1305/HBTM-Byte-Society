import React from 'react';
import { IconPlayerPlay } from '@tabler/icons-react';

interface HeroCurationBannerProps {
  rec?: any;
  loading?: boolean;
}

const HeroCurationBanner = ({ rec, loading }: HeroCurationBannerProps) => {
  const src = rec?.source || null;
  const isYouTube = src?.provider === 'youtube';
  const getYouTubeId = (url: string) => url?.split('v=')[1]?.split('&')[0] || '';
  const videoId = isYouTube ? getYouTubeId(src?.url || '') : '';
  const thumbnail = src?.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

  return (
    <div className="w-full h-[340px] rounded-[24px] overflow-hidden relative bg-[#E50914] flex flex-col md:flex-row">
      
      {/* Left Content Half */}
      <div className="flex-1 p-10 flex flex-col justify-center relative z-10">
        <span className="text-[14px] font-bold tracking-wide mb-4 text-white inline-flex items-center gap-1">
          {loading ? 'Loading...' : 'Spotlight ✦'}
        </span>
        
        <p className="text-[15px] text-white/90 mb-4 max-w-sm leading-relaxed">
          {loading
            ? 'AI Curator is finding your top pick...'
            : rec?.recommendation_reason || "Your AI curator has selected this specifically for your current stage of growth."}
        </p>

        {src && (
          <div className="mb-6">
            <h2 className="text-[22px] font-bold text-white line-clamp-2 mb-1">{src.title}</h2>
            <p className="text-white/70 text-[13px]">{src.author}</p>
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-auto">
          {src?.url && (
            <a 
              href={src.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black text-[14px] font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
            >
              {isYouTube ? '▶ Watch Now' : 'Open Resource'}
            </a>
          )}
          {!src && !loading && (
            <a 
              href="/recommendations" 
              className="bg-white text-black text-[14px] font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
            >
              View Recommendations
            </a>
          )}
          <span className="text-white/70 text-sm font-bold">
            {rec?.relevance_score ? `${rec.relevance_score}% match` : ''}
          </span>
        </div>
      </div>

      {/* Right Media Half */}
      {(thumbnail || !loading) && (
        <div className="flex-1 relative h-full group cursor-pointer">
          {thumbnail ? (
            <img 
              src={thumbnail}
              alt={src?.title || 'Recommendation'} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full bg-[#c00810] flex items-center justify-center">
              <div className="text-white/20 text-9xl font-black">D</div>
            </div>
          )}
          {/* Subtle gradient to blend into red */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#E50914] to-transparent"></div>
          
          {isYouTube && videoId && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <IconPlayerPlay className="w-7 h-7 text-white fill-white ml-1" stroke={1.5} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroCurationBanner;
