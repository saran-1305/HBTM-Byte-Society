import { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';

const Header = () => {
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const name = localStorage.getItem('daskalos_user_name');
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <header className="flex justify-between items-start mb-8 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          Good morning, {userName}! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-500">Your AI curator has prepared your personalized growth roadmap.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-12 py-2.5 border border-slate-200 rounded-full w-64 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors bg-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white border-2 border-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
