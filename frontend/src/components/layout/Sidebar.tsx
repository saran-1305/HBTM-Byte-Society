import { Home, User, Target, BookOpen, ThumbsUp, Activity, BarChart2, ArrowRight } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: User, label: 'Identity', active: false },
    { icon: Target, label: 'Growth Plan', active: false },
    { icon: BookOpen, label: 'Knowledge', active: false },
    { icon: ThumbsUp, label: 'Recommendations', active: false },
    { icon: Activity, label: 'Reflection', active: false },
    { icon: BarChart2, label: 'Analytics', active: false },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white h-screen fixed left-0 top-0 flex flex-col pt-6 pb-6 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="text-primary font-bold text-2xl flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          GrowthAI
        </div>
      </div>
      <div className="px-6 mb-6">
         <p className="text-xs text-slate-500 font-medium">Become your future self</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              item.active 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Promo Box */}
      <div className="mx-4 mt-8 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-2">
          <span className="text-lg">✨</span> AI Curator
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Your AI is continuously learning and curating what matters most for your growth.
        </p>
        <button className="text-indigo-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View activity <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* User Profile */}
      <div className="mx-4 mt-6">
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 bg-white shadow-sm">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${localStorage.getItem('daskalos_user_name') || 'Guest'}`}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full bg-slate-100"
          />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm text-slate-900 line-clamp-1">{localStorage.getItem('daskalos_user_name') || 'Guest'}</div>
            <div className="text-xs text-slate-500">Learner</div>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
