import React from 'react';
import { cn } from '@/lib/cn';
import {
  IconLayoutDashboard,
  IconRoute,
  IconBook,
  IconSparkles,
  IconHistory,
  IconChartBar,
  IconUsers,
  IconArrowRight,
  IconX,
  IconMenu2,
} from '@tabler/icons-react';
import { useLocation, Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { UserMenu } from '@/components/UserMenu';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard' },
  { label: 'Arc', icon: IconRoute, path: '/arc' },
  { label: 'Knowledge', icon: IconBook, path: '/knowledge' },
  { label: 'Recommendations', icon: IconSparkles, path: '/recommendations' },
  { label: 'Reflection', icon: IconHistory, path: '/reflection' },
  { label: 'Community', icon: IconUsers, path: '/community' },
  { label: 'Analytics', icon: IconChartBar, path: '/analytics' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { profile } = useOnboarding();

  const content = (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-spotlight text-white flex items-center justify-center shrink-0">
            <IconSparkles className="w-5 h-5" stroke={1.5} />
          </div>
          <h1 className="text-[18px] font-semibold text-white leading-none tracking-[-0.02em]">Daskalos</h1>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-muted hover:text-white"
          aria-label="Close menu"
        >
          <IconX className="w-5 h-5" stroke={1.5} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-navactive text-white'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="w-[18px] h-[18px]" stroke={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* AI Curator note */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-white mb-2">
          <IconSparkles className="w-4 h-4" stroke={1.5} />
          <span className="font-semibold text-sm">AI Curator</span>
        </div>
        <p className="text-[13px] text-muted mb-3 leading-relaxed">
          Your curator updates daily based on what you read, skip, and save.
        </p>
        <button className="text-[13px] font-semibold text-white flex items-center gap-1 hover:text-muted transition-colors">
          View activity <IconArrowRight className="w-3.5 h-3.5" stroke={1.5} />
        </button>
      </div>

      {/* User Profile */}
      <UserMenu profile={profile} onNavigate={onClose} />
    </div>
  );

  return (
    <>
      {/* Desktop sidebar: borderless, bleeds into the black canvas */}
      <aside className="hidden lg:flex w-[240px] bg-black h-screen flex-col shrink-0">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-72 max-w-[85vw] bg-black h-full shadow-xl flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

export const SidebarTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
    aria-label="Open menu"
  >
    <IconMenu2 className="w-5 h-5" stroke={1.5} />
  </button>
);

export default Sidebar;
