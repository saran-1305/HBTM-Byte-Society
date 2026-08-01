import React from 'react';
import { cn } from '@/lib/cn';
import { 
  LayoutDashboard, 
  User, 
  Map, 
  BookOpen, 
  Sparkles, 
  History, 
  BarChart2,
  ArrowRight
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useIdentityProfile } from '@/hooks/useIdentityProfile';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Identity', icon: User, path: '#' },
  { label: 'Growth Plan', icon: Map, path: '#' },
  { label: 'Knowledge', icon: BookOpen, path: '#' },
  { label: 'Recommendations', icon: Sparkles, path: '#' },
  { label: 'Reflection', icon: History, path: '#' },
  { label: 'Analytics', icon: BarChart2, path: '#' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { data: profile } = useIdentityProfile();
  
  const fullName = profile?.full_name || 'User';
  const initial = fullName.charAt(0).toUpperCase();
  
  // Try to parse growth_focus_areas array safely, fallback to default if missing
  let currentFocus = 'Explorer';
  if (profile?.growth_focus_areas && profile.growth_focus_areas.length > 0) {
    currentFocus = profile.growth_focus_areas[0];
  }

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-screen flex flex-col p-4">
      {/* Logo Area */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-indigo-500 text-white flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-900 leading-tight">GrowthAI</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Become your future self</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* AI Curator Callout */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-indigo-700 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold text-sm">AI Curator</span>
        </div>
        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          Your AI is continuously learning and curating what matters most for your growth.
        </p>
        <button className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 transition-colors">
          View activity <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
          <p className="text-xs text-slate-500 truncate">{currentFocus}</p>
        </div>
      </div>
    </aside>
  );
};
