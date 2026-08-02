import React from 'react';
import type { ReactNode } from 'react';
import { useState } from 'react';
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
    <div className="min-h-screen bg-black text-white">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userId={userId} 
      />
      <div className="pl-64">
        <Header />
        <main className="px-8 pb-12 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
