import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from './components/StatCard';
import { Recommendations } from './components/Recommendations';
import { GrowthPlanTimeline } from './components/GrowthPlanTimeline';
import { HabitProgress } from './components/HabitProgress';
import { RecentReflection } from './components/RecentReflection';
import { AIInsights } from './components/AIInsights';
import { useIdentityProfile } from '@/hooks/useIdentityProfile';

import { Target, Flame, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: profile } = useIdentityProfile();
  
  // Try to parse growth_focus_areas safely, fallback to default if missing
  let currentFocus = 'Deep Work & System Design';
  if (profile?.growth_focus_areas && profile.growth_focus_areas.length > 0) {
    currentFocus = profile.growth_focus_areas[0];
  }

  // Convert 0-100 confidence score to a 0-10 format for the UI
  const growthScore = profile?.confidence_score ? (profile.confidence_score / 10).toFixed(1) : '8.6';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Current Focus"
            value={<div className="text-xl mt-1 line-clamp-2">{currentFocus}</div>}
            subValue=""
            icon={<div className="p-2 bg-indigo-50 rounded-lg"><Target className="w-5 h-5 text-indigo-500" /></div>}
            footer={
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[72%]"></div>
                </div>
                <span className="text-xs font-semibold text-slate-700">72%</span>
              </div>
            }
          />
          <StatCard
            title="Daily Streak"
            value={<div className="text-3xl mt-1">12</div>}
            subValue="days in a row"
            icon={<div className="p-2 bg-amber-50 rounded-lg"><Flame className="w-5 h-5 text-amber-500" /></div>}
            footer={
              <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <Flame className="w-3.5 h-3.5" />
                <span>Keep it going!</span>
              </div>
            }
          />
          <StatCard
            title="Learning Time Today"
            value={<div className="text-3xl mt-1">45m</div>}
            subValue="of 60m goal"
            icon={<div className="p-2 bg-emerald-50 rounded-lg"><Clock className="w-5 h-5 text-emerald-500" /></div>}
            footer={
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 w-[75%]"></div>
              </div>
            }
          />
          <StatCard
            title="Growth Score"
            value={<div className="text-3xl mt-1 flex items-baseline gap-1">{growthScore}<span className="text-sm text-slate-500 font-sans">/10</span></div>}
            subValue="Excellent progress"
            icon={<div className="p-2 bg-indigo-50 rounded-lg"><TrendingUp className="w-5 h-5 text-indigo-500" /></div>}
            footer={
              <div className="h-8 mt-1 relative w-full overflow-hidden">
                {/* SVG mock for chart */}
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-indigo-100 fill-current">
                   <path d="M0 30 L0 25 L10 22 L20 28 L30 18 L40 20 L50 12 L60 15 L70 5 L80 10 L90 2 L100 0 L100 30 Z"></path>
                </svg>
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full absolute inset-0 text-indigo-400 stroke-current fill-transparent" strokeWidth="1">
                   <path d="M0 25 L10 22 L20 28 L30 18 L40 20 L50 12 L60 15 L70 5 L80 10 L90 2 L100 0"></path>
                </svg>
              </div>
            }
          />
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Recommendations />
            <RecentReflection />
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GrowthPlanTimeline />
              <HabitProgress />
            </div>
            <AIInsights />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
