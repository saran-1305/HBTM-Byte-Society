import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle: ReactNode;
  icon: ReactNode;
  progress?: {
    value: number;
    colorClass: string;
  };
  trend?: ReactNode;
}

const StatCard = ({ title, value, subtitle, icon, progress, trend }: StatCardProps) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#3A2E27] flex flex-col justify-between hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-3 mb-4 text-sm font-medium text-slate-400">
        <div className="p-2 rounded-full bg-slate-800/50">
          {icon}
        </div>
        {title}
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold text-[#3A2E27] mb-1">{value}</div>
        <div className="text-sm text-slate-400">{subtitle}</div>
      </div>

      {progress && (
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-auto">
          <div 
            className={`h-1.5 rounded-full ${progress.colorClass}`} 
            style={{ width: `${progress.value}%` }}
          ></div>
          <div className="text-right text-xs font-semibold text-slate-300 mt-2">{progress.value}%</div>
        </div>
      )}

      {trend && (
        <div className="mt-auto">
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatCard;





