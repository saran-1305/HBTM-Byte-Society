import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { TIMEFRAME_LABEL } from '@/types/onboarding';
import { User, Target, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IdentitySnapshot: React.FC = () => {
  const { profile } = useOnboarding();

  const hasData =
    profile.aspiration ||
    profile.stuckPoint ||
    (profile.habits && profile.habits.length > 0) ||
    profile.timeframe;

  if (!hasData) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-slate-900">Your Identity</h2>
        </div>
        <Link to="/identity" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
          Full profile
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {profile.aspiration && (
          <div className="flex gap-3">
            <div className="p-1.5 bg-indigo-50 rounded-lg shrink-0 self-start">
              <Target className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Goal</p>
              <p className="text-sm text-slate-900 leading-snug">{profile.aspiration}</p>
            </div>
          </div>
        )}

        {profile.stuckPoint && (
          <div className="flex gap-3">
            <div className="p-1.5 bg-rose-50 rounded-lg shrink-0 self-start">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Where it gets hard</p>
              <p className="text-sm text-slate-900 leading-snug">{profile.stuckPoint}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {profile.habits?.map((habit) => (
            <span
              key={habit}
              className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"
            >
              {habit}
            </span>
          ))}
          {profile.timeframe && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
              <Clock className="w-3 h-3" />
              {TIMEFRAME_LABEL[profile.timeframe]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
