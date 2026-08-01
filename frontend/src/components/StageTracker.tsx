import { IconCircleCheck } from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { STAGES } from '@/lib/stage';

interface StageTrackerProps {
  currentIndex: number;
  progress?: number; // 0-100, fill of the current stage's inset bar
}

export function StageTracker({ currentIndex, progress = 45 }: StageTrackerProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div
            key={stage}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 transition-colors',
              isCompleted && 'bg-white text-black',
              isCurrent && 'bg-[#222222] text-white',
              !isCompleted && !isCurrent && 'bg-surface text-[#666666]'
            )}
          >
            {isCompleted && <IconCircleCheck className="w-4 h-4" stroke={2.5} />}
            {isCurrent && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
            <span className={cn('text-sm whitespace-nowrap', (isCompleted || isCurrent) ? 'font-bold' : 'font-medium')}>
              {stage}
            </span>
            {isCurrent && (
              <div className="w-14 h-1 rounded-full bg-black/40 overflow-hidden ml-1 shrink-0">
                <div className="h-full bg-white" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
