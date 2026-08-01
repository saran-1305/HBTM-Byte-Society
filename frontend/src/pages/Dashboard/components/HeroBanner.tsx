import { IconPlayerPlayFilled } from '@tabler/icons-react';

interface HeroBannerProps {
  meta: string;
  title: string;
  reason: string;
  imageSeed: string;
  imageUrl?: string; // real thumbnail from the recommendation engine, when available
  onStart: () => void;
  onDismiss: () => void;
}

// The spotlight curation pick: a massive, confident banner that pushes
// the single best piece of content for the user's current stage, styled
// like a premium media platform's featured takeover, not a "welcome back" card.
export function HeroBanner({ meta, title, reason, imageSeed, imageUrl, onStart, onDismiss }: HeroBannerProps) {
  return (
    <div className="relative h-[280px] sm:h-[340px] rounded-3xl overflow-hidden bg-spotlight">
      <img
        src={imageUrl || `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/1000/700`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-spotlight via-spotlight/90 sm:via-spotlight/85 to-spotlight/10" />

      <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 max-w-md">
        <div>
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">{meta}</p>
          <h2 className="text-2xl sm:text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-3">
            {title}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{reason}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
          >
            <IconPlayerPlayFilled className="w-4 h-4" />
            Start Now
          </button>
          <button
            onClick={onDismiss}
            className="text-sm font-semibold text-white/80 px-5 py-2.5 rounded-full border border-white/30 hover:border-white/60 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      <button
        onClick={onStart}
        aria-label="Play"
        className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 items-center justify-center hidden sm:flex hover:bg-black/55 transition-colors"
      >
        <IconPlayerPlayFilled className="w-6 h-6 text-white ml-0.5" />
      </button>
    </div>
  );
}
