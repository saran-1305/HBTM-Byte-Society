import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
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
