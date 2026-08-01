import { IconPlayerPlayFilled, IconBookmark, IconBookmarkFilled, IconThumbDown } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

export interface MediaItem {
  id: string;
  title: string;
  meta: string;
  imageSeed: string;
  duration?: string;
  wildcard?: boolean;
  fit?: number;
  reason?: string;
}

interface MediaGridProps {
  title?: string;
  items: MediaItem[];
  onSeeAll?: () => void;
  onItemClick?: (item: MediaItem) => void;
  emptyLabel?: string;
  savedIds?: string[];
  onToggleSave?: (item: MediaItem) => void;
  onDismiss?: (item: MediaItem) => void;
}

// TIDAL-style square media card: aspect-square thumbnail, no border, a
// black hover scrim that reveals a glassmorphic play button, two lines
// of text underneath. The whole card is one stretched button (so it stays
// a single accessible click target); save/dismiss are separate sibling
// buttons layered on top, not nested inside it.
export function MediaGrid({ title, items, onSeeAll, onItemClick, emptyLabel = 'Nothing here yet.', savedIds, onToggleSave, onDismiss }: MediaGridProps) {
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-white">{title}</h2>
          {onSeeAll && (
            <button onClick={onSeeAll} className="text-xs text-muted hover:text-white transition-colors">
              Show all
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted italic">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const saved = savedIds?.includes(item.id) ?? false;
            return (
              <div key={item.id} className="group relative rounded-xl transition-all duration-150 ease-out hover:-translate-y-[2px]">
                <button
                  type="button"
                  onClick={() => onItemClick?.(item)}
                  aria-label={`Open "${item.title}"`}
                  className={cn(
                    'absolute inset-0 rounded-xl z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotlight',
                    onItemClick && 'cursor-pointer'
                  )}
                />

                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-surface pointer-events-none">
                  <img
                    src={`https://picsum.photos/seed/${encodeURIComponent(item.imageSeed)}/400/400`}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {item.wildcard && (
                    <span className="absolute top-2 left-2 border border-spotlight text-spotlight bg-black/70 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded">
                      Wildcard
                    </span>
                  )}
                  {typeof item.fit === 'number' && (
                    <span className="absolute top-2 right-2 bg-black/70 text-mint-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {item.fit}% fit
                    </span>
                  )}
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      {item.duration}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <IconPlayerPlayFilled className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>

                  {(onToggleSave || onDismiss) && (
                    <div className="absolute bottom-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                      {onToggleSave && (
                        <button
                          type="button"
                          onClick={() => onToggleSave(item)}
                          aria-label={saved ? `Remove "${item.title}" from saved` : `Save "${item.title}" for later`}
                          aria-pressed={saved}
                          className={cn(
                            'pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotlight',
                            saved ? 'bg-spotlight text-white' : 'bg-black/60 text-white/80 hover:bg-black/80 hover:text-white'
                          )}
                        >
                          {saved ? <IconBookmarkFilled className="w-3.5 h-3.5" /> : <IconBookmark className="w-3.5 h-3.5" stroke={1.5} />}
                        </button>
                      )}
                      {onDismiss && (
                        <button
                          type="button"
                          onClick={() => onDismiss(item)}
                          aria-label={`Not interested in "${item.title}"`}
                          className="pointer-events-auto w-7 h-7 rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotlight"
                        >
                          <IconThumbDown className="w-3.5 h-3.5" stroke={1.5} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug pointer-events-none">{item.title}</h3>
                <p className="text-xs text-muted mt-1 line-clamp-1 pointer-events-none">{item.meta}</p>
                {item.reason && (
                  <p className="text-[11px] text-white/35 italic mt-1 line-clamp-2 pointer-events-none">{item.reason}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
