import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import Recommendations from '../components/dashboard/Recommendations';
import GrowthPlan from '../components/dashboard/GrowthPlan';
import HabitProgress from '../components/dashboard/HabitProgress';
import RecentReflection from '../components/dashboard/RecentReflection';
import AIInsights from '../components/dashboard/AIInsights';
import { Target, Flame, Clock, TrendingUp } from 'lucide-react';
import { useIdentityProfile } from '../hooks/useIdentityProfile';

function DashboardPage() {
  const { data: identity } = useIdentityProfile();

  const currentFocus = identity?.growth_focus_areas?.[0] || 'Loading...';
  const score = identity?.confidence_score || '8.6';

  return (
    <DashboardLayout>
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Current Focus"
          icon={<Target className="w-5 h-5 text-indigo-600" />}
          value={currentFocus}
          subtitle={null}
          progress={{ value: 72, colorClass: 'bg-indigo-500' }}
        />
        <StatCard 
          title="Daily Streak"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          value="1"
          subtitle="day in a row"
          trend={<span className="text-orange-500 text-xs font-bold flex items-center gap-1">🔥 Just started!</span>}
        />
        <StatCard 
          title="Learning Time Today"
          icon={<Clock className="w-5 h-5 text-emerald-500" />}
          value="0m"
          subtitle="of your daily goal"
          progress={{ value: 5, colorClass: 'bg-emerald-500' }}
        />
        <StatCard 
          title="AI Growth Score"
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          value={<span>{score}<span className="text-lg text-slate-400">/100</span></span>}
          subtitle="Based on onboarding"
          trend={
            <div className="h-8 mt-2 opacity-50 relative overflow-hidden">
               <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                 <path d="M0 30 Q 10 20 20 25 T 40 20 T 60 25 T 80 15 T 100 5 L 100 30 Z" fill="currentColor" opacity="0.2"/>
                 <path d="M0 30 Q 10 20 20 25 T 40 20 T 60 25 T 80 15 T 100 5" fill="none" stroke="currentColor" strokeWidth="2"/>
               </svg>
            </div>
          }
        />
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-5">
          <Recommendations />
        </div>
        <div className="lg:col-span-4">
          <GrowthPlan />
        </div>
        <div className="lg:col-span-3">
          <HabitProgress />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RecentReflection identitySummary={identity?.identity_summary} />
        </div>
        <div className="lg:col-span-7">
          <AIInsights learningApproach={identity?.recommended_learning_approach} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
