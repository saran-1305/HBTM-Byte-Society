import React from 'react';
import { 
  IconHome, 
  IconCompass, 
  IconBook, 
  IconTarget, 
  IconMessage2, 
  IconChartBar, 
  IconUser, 
  IconSettings,
  IconChevronRight,
  IconShare
} from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onOpenSettings?: () => void;
}

const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: IconHome, label: 'Today', path: '/dashboard' },
    { icon: IconCompass, label: 'Recommendations', path: '/recommendations' },
    { icon: IconBook, label: 'Knowledge', path: '/knowledge' },
    { icon: IconTarget, label: 'Growth Plan', path: '/growth-plan' },
    { icon: IconMessage2, label: 'Reflection', path: '/reflection' },
    { icon: IconChartBar, label: 'Analytics', path: '/analytics' },
    { icon: IconShare, label: 'Publishing', path: '/publishing' },
  ];

  return (
    <aside className="w-[240px] bg-black h-screen fixed left-0 top-0 flex flex-col overflow-y-auto z-50">
      
      {/* Logo Block */}
      <div className="pt-8 px-6 mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-white font-black text-3xl tracking-tighter">
            DASKALOS
          </span>
        </div>
        <p className="text-[12px] text-[#9CA3AF] leading-tight">Become who you're building toward.</p>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 space-y-1 mb-8">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/curate');
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                isActive 
                  ? 'bg-[#2A2A2A] text-white' 
                  : 'text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <item.icon stroke={isActive ? 2 : 1.5} className="w-[20px] h-[20px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-[1px] w-[calc(100%-2rem)] mx-auto bg-[#1A1A1A] mb-6"></div>

      {/* Account Section */}
      <nav className="px-4 space-y-1 flex-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
        >
          <IconUser stroke={1.5} className="w-[20px] h-[20px]" />
          Identity
        </button>
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
        >
          <IconSettings stroke={1.5} className="w-[20px] h-[20px]" />
          Settings
        </button>
      </nav>

      {/* Bottom Pinned User Card */}
      <div className="p-4 mt-auto">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${localStorage.getItem('daskalos_user_name') || 'Learner'}&backgroundColor=transparent`}
              alt="Avatar" 
              className="w-full h-full object-cover grayscale" 
            />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-[13px] font-medium text-white group-hover:text-white transition-colors line-clamp-1">
              {localStorage.getItem('daskalos_user_name') || 'Guest'}
            </h4>
            <p className="text-[11px] text-[#9CA3AF]">Learner</p>
          </div>
          <IconChevronRight stroke={1.5} className="w-4 h-4 text-[#9CA3AF]" />
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
