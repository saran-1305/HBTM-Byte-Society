import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, BookOpen, Headphones, PlayCircle, Sparkles } from 'lucide-react';

interface FeaturedCarouselItem {
  id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  videoId?: string;
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[];
}

const CENTER_W = 320;
const CENTER_H = 480;
const SIDE_SCALE = 0.8;
const FAR_SCALE = 0.6;
const STEP_SIDE = 280;
const STEP_FAR = 480;
const SWIPE_THRESHOLD = 50;

const TYPE_STYLES: Record<string, { icon: typeof PlayCircle; color: string }> = {
  video: { icon: PlayCircle, color: '#6366F1' },
  article: { icon: FileText, color: '#F97316' },
  book: { icon: BookOpen, color: '#10B981' },
  podcast: { icon: Headphones, color: '#EC4899' },
};

const getTypeStyle = (type: string) => TYPE_STYLES[type.toLowerCase()] || { icon: Sparkles, color: '#6366F1' };

const TypePlaceholder = ({ type, large }: { type: string; large?: boolean }) => {
  const { icon: Icon, color } = getTypeStyle(type);
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
      <Icon className={large ? 'w-16 h-16' : 'w-8 h-8'} style={{ color }} />
    </div>
  );
};

const CardMedia = ({ item, large }: { item: FeaturedCarouselItem; large?: boolean }) =>
  item.thumbnailUrl ? (
    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
  ) : (
    <TypePlaceholder type={item.type} large={large} />
  );

const getCardTransform = (offset: number) => {
  const abs = Math.abs(offset);
  if (abs === 0) return { scale: 1, opacity: 1, translateX: 0, zIndex: 30, pointerEvents: 'auto' as const };
  if (abs === 1) return { scale: SIDE_SCALE, opacity: 0.7, translateX: offset * STEP_SIDE, zIndex: 20, pointerEvents: 'auto' as const };
  if (abs === 2) return { scale: FAR_SCALE, opacity: 0.4, translateX: offset * STEP_FAR, zIndex: 10, pointerEvents: 'auto' as const };
  return { scale: 0.4, opacity: 0, translateX: offset * (STEP_FAR + 150), zIndex: 0, pointerEvents: 'none' as const };
};

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!items.length) return null;

  const goTo = (index: number) => setActiveIndex(index);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % items.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
  };

  return (
    <div className="w-full">
      <div
        tabIndex={0}
        role="region"
        aria-label="Featured carousel"
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex flex-row items-center justify-center overflow-hidden h-[560px] w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1FA35A]/50 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        {items.map((item, index) => {
          const len = items.length;
          let offset = (index - activeIndex) % len;
          
          // Fix negative modulo in JS
          if (offset < 0) offset += len;
          
          // Calculate shortest path for infinite carousel effect
          if (offset > Math.floor(len / 2)) offset -= len;

          if (Math.abs(offset) > 2) return null;

          const { scale, opacity, translateX, zIndex, pointerEvents } = getCardTransform(offset);
          const isCenter = offset === 0;
          const isPlayableVideo = isCenter && item.type.toLowerCase() === 'video' && item.videoId;

          return (
            <div
              key={item.id}
              onClick={() => { if (!isCenter) goTo(index); }}
              className={`group absolute top-1/2 left-1/2 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden bg-white transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCenter
                  ? 'border-[2px] border-[#1FA35A] shadow-[0_0_60px_rgba(29,158,117,0.3)]'
                  : 'border-[1.5px] border-[#3A2E27]/20 cursor-pointer hover:border-[#1FA35A]/50 hover:shadow-[0_0_30px_rgba(29,158,117,0.15)]'
              }`}
              style={{
                width: CENTER_W,
                height: CENTER_H,
                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex,
                pointerEvents,
              }}
            >
              {isCenter ? (
                <div className="w-full h-full flex flex-col">
                  <div className="relative flex-1 bg-black overflow-hidden">
                    {isPlayableVideo ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${item.videoId}?rel=0`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <CardMedia item={item} large />
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-[#3A2E27]/20 shrink-0">
                    <p className="text-[15px] font-semibold text-[#3A2E27] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#5C5C52] uppercase tracking-wide mt-0.5">{item.type}</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <CardMedia item={item} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-[12px] font-medium text-white truncate">{item.title}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white border-[1.5px] border-[#3A2E27] text-[#3A2E27] hover:bg-black/5 transition-colors duration-200 hover:border-[#1FA35A] hover:text-[#3A2E27]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          aria-label="Next"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white border-[1.5px] border-[#3A2E27] text-[#3A2E27] hover:bg-black/5 transition-colors duration-200 hover:border-[#1FA35A] hover:text-[#3A2E27]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedCarousel;






