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
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4 text-sm font-medium text-slate-600">
        <div className="p-2 rounded-lg bg-slate-50">
          {icon}
        </div>
        {title}
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>

      {progress && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-auto">
          <div 
            className={`h-1.5 rounded-full ${progress.colorClass}`} 
            style={{ width: `${progress.value}%` }}
          ></div>
          <div className="text-right text-xs font-semibold text-slate-700 mt-2">{progress.value}%</div>
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
