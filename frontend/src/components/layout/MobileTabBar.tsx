import { NavLink } from 'react-router-dom';
import { IconLayoutDashboard, IconBook, IconUsers, IconHistory, IconMenu2 } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

const TABS = [
  { label: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard' },
  { label: 'Knowledge', icon: IconBook, path: '/knowledge' },
  { label: 'Community', icon: IconUsers, path: '/community' },
  { label: 'Reflection', icon: IconHistory, path: '/reflection' },
];

interface MobileTabBarProps {
  onMore: () => void;
}

// Replaces the hamburger+drawer as the primary mobile nav: thumb-reach
// bottom bar for the tabs used most, "More" opens the existing drawer for
// everything else (Identity, Recommendations, Analytics, Settings, profile).
export function MobileTabBar({ onMore }: MobileTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-black border-t border-white/10 flex items-stretch pb-[env(safe-area-inset-bottom)]"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => cn(
            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotlight',
            isActive ? 'text-white' : 'text-muted'
          )}
        >
          {({ isActive }) => (
            <>
              <tab.icon className="w-5 h-5" stroke={isActive ? 2 : 1.5} />
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMore}
        aria-label="More navigation options"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotlight"
      >
        <IconMenu2 className="w-5 h-5" stroke={1.5} />
        More
      </button>
    </nav>
  );
}
