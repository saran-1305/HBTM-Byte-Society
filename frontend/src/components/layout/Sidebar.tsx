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
  IconShare,
  IconUsers,
  IconStar,
  IconHanger
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
    { icon: IconStar, label: 'Featured', path: '/featured' },
    { icon: IconBook, label: 'Knowledge', path: '/knowledge' },
    { icon: IconTarget, label: 'Curator - ARC', path: '/growth-plan' },
    { icon: IconHanger, label: 'Lifestyle', path: '/lifestyle' },
    { icon: IconUsers, label: 'Community', path: '/community' },
    { icon: IconMessage2, label: 'Reflection', path: '/reflection' },
  ];

  return (
    <aside className="w-[240px] bg-background border-r-[1.5px] border-[#3A2E27] h-[calc(100vh-64px)] fixed left-0 top-[64px] flex flex-col overflow-y-auto z-50">
      
      {/* Main Navigation */}
      <nav className="px-4 space-y-1 mb-8 pt-8">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/curate');
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-bold transition-colors ${
                isActive 
                  ? 'bg-[#1D9E75]/10 text-[#1D9E75]' 
                  : 'text-[#5C5C52] hover:bg-black/5 hover:text-[#3A2E27]'
              }`}
            >
              <item.icon stroke={isActive ? 2 : 1.5} className="w-[20px] h-[20px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>


      <div className="p-4 mt-auto">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-white border border-[#3A2E27] flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${localStorage.getItem('daskalos_user_name') || 'Learner'}&backgroundColor=transparent`}
              alt="Avatar" 
              className="w-full h-full object-cover grayscale" 
            />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-[13px] font-bold text-[#3A2E27] transition-colors line-clamp-1">
              {localStorage.getItem('daskalos_user_name') || 'Guest'}
            </h4>
            <p className="text-[11px] font-semibold text-[#5C5C52]">Learner</p>
          </div>
          <IconChevronRight stroke={1.5} className="w-4 h-4 text-[#5C5C52]" />
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;




