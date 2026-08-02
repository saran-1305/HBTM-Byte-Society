import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import SettingsModal from './SettingsModal';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const userId = localStorage.getItem('daskalos_user_id') || '123e4567-e89b-12d3-a456-426614174000';

  return (
    <div className="min-h-screen bg-background text-[#3A2E27]">
      {/* Green Ticker Bar */}
      <div className="w-full h-[64px] bg-brandgreen flex items-center z-50 fixed top-0 left-0">
        <div className="px-6 shrink-0 flex items-center z-10 bg-brandgreen shadow-[10px_0_20px_rgba(29,158,117,1)] relative">
          <span className="text-[#E1F5EE] font-display font-bold text-[28px] tracking-wide">
            DASKALOS
          </span>
        </div>
        <div className="flex-1 overflow-hidden flex items-center relative">
          <div className="flex whitespace-nowrap animate-ticker text-white font-display font-semibold text-[12px] uppercase tracking-widest opacity-90">
            <span className="px-2">BECOME WHO YOU'RE BUILDING TOWARD • EXPLORE • COMMIT • STRUGGLE • BREAKTHROUGH • INTERACT • BECOME WHO YOU'RE BUILDING TOWARD •</span>
            <span className="px-2">BECOME WHO YOU'RE BUILDING TOWARD • EXPLORE • COMMIT • STRUGGLE • BREAKTHROUGH • INTERACT • BECOME WHO YOU'RE BUILDING TOWARD •</span>
          </div>
        </div>
      </div>

      <div className="pt-[64px]">
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          userId={userId} 
        />
        <div className="pl-[240px]">
          <Header />
          <main className="px-8 pb-12 max-w-[1400px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;



