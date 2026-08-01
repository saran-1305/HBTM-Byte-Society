import React from 'react';
import { Search, Bell } from 'lucide-react';
import { SidebarTrigger } from './Sidebar';

interface HeaderProps {
  onMenuOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuOpen }) => {
  return (
    <header className="px-4 sm:px-8 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-100 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger onClick={onMenuOpen} />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-serif text-slate-900 leading-tight truncate">
            Good morning, Karthik!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
            Your curator has updates ready for you.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Search: hidden on very small screens, visible from sm up */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-48 lg:w-64 pl-10 pr-10 py-2 border border-slate-200 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium hidden lg:inline">⌘K</span>
          </div>
        </div>

        <button className="relative p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
