import React from 'react';
import { Home, User, Target, BookOpen, ThumbsUp, Activity, BarChart2, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Identity', path: '/profile/setup' },
    { icon: Target, label: 'Growth Plan', path: '/growth-plan' },
    { icon: BookOpen, label: 'Knowledge', path: '/knowledge' },
    { icon: ThumbsUp, label: 'Recommendations', path: '/recommendations' },
    { icon: Activity, label: 'Reflection', path: '/reflection' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#141C34] h-screen fixed left-0 top-0 flex flex-col pt-6 pb-6 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="text-white font-bold text-2xl flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          DASKALOS
        </div>
      </div>
      <div className="px-6 mb-6">
         <p className="text-xs text-slate-400 font-medium">Become your future self</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/curate');
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Promo Box */}
      <div className="mx-4 mt-8 bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-2">
          <span className="text-lg">✨</span> AI Curator
        </div>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Your AI is continuously learning and curating what matters most for your growth.
        </p>
        <button className="text-indigo-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all hover:text-indigo-300">
          View activity <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* User Profile */}
      <div className="mx-4 mt-6">
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors border border-white/5 bg-slate-900/50 shadow-sm">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${localStorage.getItem('daskalos_user_name') || 'Guest'}`}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full bg-slate-800"
          />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm text-white line-clamp-1">{localStorage.getItem('daskalos_user_name') || 'Guest'}</div>
            <div className="text-xs text-slate-400">Learner</div>
          </div>
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
