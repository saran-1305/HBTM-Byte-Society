import React from 'react';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface MediaItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  isWildcard?: boolean;
  url?: string;
}

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  viewAllLink?: string;
}

const getYoutubeVideoId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const MediaGrid: React.FC<MediaGridProps> = ({ title, items, viewAllLink }) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[16px] font-medium text-white">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-[13px] font-medium text-[#999999] hover:text-white transition-colors">
            View all
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => {
          const videoId = getYoutubeVideoId(item.url);
          
          const content = (
            <>
            {/* Thumbnail Box */}
            <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-[#121212] mb-3 group-hover:-translate-y-[2px] transition-all duration-150 ease-out">
              {videoId ? (
                <img 
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                  onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={`https://picsum.photos/seed/${item.id}/400/400`} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Play Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <IconPlayerPlay className="w-5 h-5 text-white fill-white ml-0.5" stroke={1.5} />
                </div>
              </div>

              {/* Badges */}
              {item.badge && !item.isWildcard && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md">
                    {item.badge}
                  </span>
                </div>
              )}
              {item.isWildcard && (
                <div className="absolute top-2 right-2">
                  <span className="bg-[#F97316]/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                    Wildcard
                  </span>
                </div>
              )}
            </div>

            {/* Meta Text */}
            <h3 className="text-[14px] font-medium text-white truncate mb-0.5 group-hover:text-white transition-colors">
              {item.title}
            </h3>
            <p className="text-[12px] text-[#999999] truncate">
              {item.subtitle}
            </p>
            </>
          );

          return item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} className="group cursor-pointer flex flex-col block select-none">
              {content}
            </a>
          ) : (
            <div key={item.id} className="group cursor-pointer flex flex-col select-none">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MediaGrid;
