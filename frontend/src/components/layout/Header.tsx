import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useIdentityProfile } from '@/hooks/useIdentityProfile';

export const Header: React.FC = () => {
  const { data: profile } = useIdentityProfile();
  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-slate-50">
      <div>
        <h1 className="text-2xl font-serif text-slate-900 mb-1">Good morning, {firstName}! 👋</h1>
        <p className="text-sm text-slate-500">Your AI curator has prepared your personalized growth roadmap.</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="block w-64 pl-10 pr-10 py-2 border border-slate-200 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">⌘K</span>
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
