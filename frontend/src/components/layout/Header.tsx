import React, { useEffect, useState } from 'react';
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
        <h1 className="text-3xl font-bold text-[#3A2E27] flex items-center gap-2 mb-2">
          Good morning, {userName}! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-[#5C5C52] font-medium">Your AI curator has prepared your personalized growth roadmap.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-12 py-2.5 border-[1.5px] border-[#3A2E27] rounded-full w-64 bg-white text-[#3A2E27] placeholder:text-[#5C5C52] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1FA35A]/30 focus:border-[#1FA35A] transition-all text-sm font-medium"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-bold text-[#5C5C52] bg-black/5 border border-[#3A2E27]/20 rounded px-1.5 py-0.5">⌘K</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-full border-[1.5px] border-[#3A2E27] text-[#3A2E27] hover:bg-black/5 transition-colors bg-white shadow-[2px_2px_0px_#3A2E27]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1FA35A] text-[10px] font-bold text-white border-2 border-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;




