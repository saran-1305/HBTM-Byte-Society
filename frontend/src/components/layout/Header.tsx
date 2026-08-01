import React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';

export const Header: React.FC = () => {
  const { profile } = useOnboarding();
  const { openPalette, placeholder } = useCommandPalette();
  const firstName = profile.name || 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="px-4 sm:px-8 py-4 flex items-center justify-between bg-black gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-sans font-bold tracking-[-0.02em] text-white leading-tight truncate">
            {getGreeting()}, {firstName}!
          </h1>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mint-400 motion-safe:animate-ping opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-mint-400" />
            </span>
            <p className="text-xs sm:text-sm text-muted">Curator online, updates ready for you.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={openPalette}
          aria-label={`Open command palette. ${placeholder}`}
          className="flex items-center justify-center sm:justify-start w-10 sm:w-48 lg:w-64 h-10 sm:h-auto pl-0 sm:pl-10 pr-0 sm:pr-3 sm:py-2 rounded-full text-sm bg-surface text-muted hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-spotlight transition-all relative text-left shrink-0"
        >
          <IconSearch className="h-4 w-4 text-muted shrink-0 sm:absolute sm:left-3.5" stroke={1.5} />
          <span className="hidden sm:block flex-1 truncate">{placeholder}</span>
          <span className="text-xs text-muted font-medium hidden lg:inline">⌘K</span>
        </button>

        <NotificationsPanel />
      </div>
    </header>
  );
};

export default Header;
