import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, FileText, BookOpen, Headphones, Sparkles } from 'lucide-react';

interface FeaturedCarouselItem {
  id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  video_id?: string;
  videoId?: string; // Support both for backward compatibility
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[];
  isLoading?: boolean;
}

const CENTER_W = 320;
const CENTER_H = 560;
const SIDE_SCALE = 0.8;
const FAR_SCALE = 0.6;
const STEP_SIDE = 260; // Visual pixel distance
const STEP_FAR = 440;
const SWIPE_THRESHOLD = 50;

const TYPE_STYLES: Record<string, { icon: typeof FileText; color: string }> = {
  article: { icon: FileText, color: '#1D9E75' },
  book: { icon: BookOpen, color: '#F97316' },
  podcast: { icon: Headphones, color: '#6366F1' },
};

const CardMedia = ({ item }: { item: FeaturedCarouselItem }) => {
  const vid = item.video_id || item.videoId;
  if (vid) {
    return (
      <img 
        src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} 
        alt={item.title}
        className="w-full h-full object-cover"
        draggable={false}
      />
    );
  }
  if (item.thumbnailUrl) {
    return (
      <img
        src={item.thumbnailUrl}
        alt={item.title}
        className="w-full h-full object-cover"
        draggable={false}
      />
    );
  }
  
  const TypeIcon = TYPE_STYLES[item.type?.toLowerCase()]?.icon || FileText;
  const iconColor = TYPE_STYLES[item.type?.toLowerCase()]?.color || '#3A2E27';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <TypeIcon size={48} color={iconColor} className="mb-4 opacity-80" />
      <h3 className="text-xl font-bold text-[#3A2E27] line-clamp-2">{item.title}</h3>
    </div>
  );
};

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Filter out items missing title or required media (thumbnail or video)
  const filteredItems = (items || []).filter(
    (item) => item.title && (item.thumbnailUrl || item.video_id || item.videoId)
  );

  useEffect(() => {
    // Autoplay the center video when active index changes
    setIsPlaying(true);
  }, [activeIndex]);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > SWIPE_THRESHOLD) goNext();
    else if (diff < -SWIPE_THRESHOLD) goPrev();
    touchStartX.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 20) goNext();
      else if (e.deltaX < -20) goPrev();
    }
  };

  const getCardTransform = (offset: number) => {
    let scale = 1;
    let translateX = 0;
    let opacity = 1;
    let zIndex = 10;
    let pointerEvents = 'auto' as any;

    if (offset === 0) {
      scale = 1;
      translateX = 0;
      opacity = 1;
      zIndex = 10;
    } else if (offset === 1) {
      scale = SIDE_SCALE;
      translateX = STEP_SIDE;
      opacity = 0.55;
      zIndex = 5;
    } else if (offset === -1) {
      scale = SIDE_SCALE;
      translateX = -STEP_SIDE;
      opacity = 0.55;
      zIndex = 5;
    } else if (offset === 2) {
      scale = FAR_SCALE;
      translateX = STEP_FAR;
      opacity = 0.1;
      zIndex = 1;
      pointerEvents = 'none';
    } else if (offset === -2) {
      scale = FAR_SCALE;
      translateX = -STEP_FAR;
      opacity = 0.1;
      zIndex = 1;
      pointerEvents = 'none';
    } else {
      scale = 0;
      translateX = offset > 0 ? STEP_FAR + 100 : -(STEP_FAR + 100);
      opacity = 0;
      zIndex = 0;
      pointerEvents = 'none';
    }

    return { scale, translateX, opacity, zIndex, pointerEvents };
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-[620px]">
        <div className="relative flex items-center justify-center w-full h-[560px]">
          {/* Left Skeleton */}
          <div 
            className="absolute bg-gray-200 animate-pulse rounded-[16px] border-[1.5px] border-[#3A2E27]/10"
            style={{ width: CENTER_W, height: CENTER_H, transform: `translateX(-${STEP_SIDE}px) scale(${SIDE_SCALE})` }}
          />
          {/* Center Skeleton */}
          <div 
            className="absolute bg-gray-200 animate-pulse rounded-[16px] border-[2px] border-[#3A2E27]/20 z-10"
            style={{ width: CENTER_W, height: CENTER_H }}
          />
          {/* Right Skeleton */}
          <div 
            className="absolute bg-gray-200 animate-pulse rounded-[16px] border-[1.5px] border-[#3A2E27]/10"
            style={{ width: CENTER_W, height: CENTER_H, transform: `translateX(${STEP_SIDE}px) scale(${SIDE_SCALE})` }}
          />
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center border border-dashed border-[#3A2E27]/20 rounded-[20px] bg-white">
        <Sparkles className="w-10 h-10 text-[#5C5C52] mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-[#3A2E27] mb-2">New picks coming soon</h3>
        <p className="text-[#5C5C52] text-sm text-center max-w-sm">We're curating the best content tailored to your growth plan. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        tabIndex={0}
        role="region"
        aria-label="Featured carousel"
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="relative flex flex-row items-center justify-center overflow-hidden h-[620px] w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/50"
      >
        {filteredItems.map((item, index) => {
          const len = filteredItems.length;
          let offset = (index - activeIndex) % len;
          
          if (offset < 0) offset += len;
          if (offset > Math.floor(len / 2)) offset -= len;

          if (Math.abs(offset) > 2) return null;

          const { scale, opacity, translateX, zIndex, pointerEvents } = getCardTransform(offset);
          const isCenter = offset === 0;
          const vid = item.video_id || item.videoId;
          const isPlayableVideo = isCenter && !!vid;

          return (
            <div
              key={item.id}
              onClick={() => { if (!isCenter) goTo(index); }}
              className={`group absolute top-1/2 left-1/2 overflow-hidden bg-white transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCenter
                  ? 'border-[2px] border-[#1D9E75] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-default'
                  : 'border-[1.5px] border-[#3A2E27] rounded-[16px] cursor-pointer hover:opacity-80 shadow-none'
              }`}
              style={{
                width: CENTER_W,
                height: CENTER_H,
                // Apply scale FIRST, then translate physically in the scaled space
                transform: `translate(-50%, -50%) scale(${scale}) translateX(${translateX / scale}px)`,
                opacity,
                zIndex,
                pointerEvents,
              }}
            >
              {isCenter ? (
                <div className="w-full h-full relative">
                  {isPlayableVideo && isPlaying ? (
                    <iframe
                      className="w-full h-full absolute inset-0 rounded-[14px]"
                      src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=0`}
                      title={item.title}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <CardMedia item={item} />
                      {/* Play button overlay */}
                      {isPlayableVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPlaying(true);
                            }}
                            className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors hover:scale-110 transform duration-200"
                            aria-label="Play video"
                          >
                            <Play fill="white" className="w-8 h-8 text-white ml-1" />
                          </button>
                        </div>
                      )}
                      
                      {/* Only show title overlay if not a playable video thumbnail to keep video thumbnails clean, or show it based on design. I will add a subtle gradient at bottom for non-video or video if needed. */}
                      {!isPlayableVideo && !item.thumbnailUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                            {/* Handled by CardMedia component */}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <CardMedia item={item} />
                  {/* For side cards, maybe a subtle overlay to make them look inactive */}
                  <div className="absolute inset-0 bg-white/20" />
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
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white border-[1.5px] border-[#3A2E27] text-[#3A2E27] hover:bg-black/5 transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          aria-label="Next"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white border-[1.5px] border-[#3A2E27] text-[#3A2E27] hover:bg-black/5 transition-colors duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedCarousel;


