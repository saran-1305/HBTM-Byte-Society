import React from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subValue: React.ReactNode;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  footer,
  className
}) => {
  return (
    <div className={cn("bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full", className)}>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <div className="font-serif text-slate-900 leading-tight mb-1 truncate">
            {value}
          </div>
          <div className="text-xs text-slate-500">
            {subValue}
          </div>
        </div>
      </div>
      {footer && (
        <div className="mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};
