import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { 
  LayoutDashboard, 
  User, 
  Map, 
  BookOpen, 
  Sparkles, 
  History, 
  BarChart2,
  ArrowRight,
  X,
  Menu
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Identity', icon: User, path: '#' },
  { label: 'Growth Plan', icon: Map, path: '#' },
  { label: 'Knowledge', icon: BookOpen, path: '#' },
  { label: 'Recommendations', icon: Sparkles, path: '#' },
  { label: 'Reflection', icon: History, path: '#' },
  { label: 'Analytics', icon: BarChart2, path: '#' },
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
      <div className="mb-8 px-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-slate-900 leading-tight">GrowthAI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Know yourself. Grow from there.</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-600"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
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
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-4 h-4', isActive ? 'text-indigo-600' : 'text-slate-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* AI Curator note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-amber-700 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold text-sm">AI Curator</span>
        </div>
        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          Your curator updates daily based on what you read, skip, and save.
        </p>
        <button className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:text-amber-800 transition-colors">
          View activity <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium shrink-0">
          U
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">Karthik R.</p>
          <p className="text-xs text-slate-500 truncate">{profile.aspiration || 'Learner'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-50 border-r border-slate-200 h-screen flex-col shrink-0">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-72 max-w-[85vw] bg-slate-50 h-full shadow-xl flex flex-col">
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
    className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
    aria-label="Open menu"
  >
    <Menu className="w-5 h-5" />
  </button>
);
