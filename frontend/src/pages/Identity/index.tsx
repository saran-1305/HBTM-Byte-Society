import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TIMEFRAME_LABEL } from '@/types/onboarding';
import {
  Target, Clock, BookOpen, AlertTriangle, Edit3, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  tags?: string[];
  placeholder?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, tags, placeholder }) => (
  <div className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
    <div className="p-2 bg-slate-50 rounded-lg self-start shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      {value && <p className="text-sm text-slate-900 leading-relaxed">{value}</p>}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
              {t}
            </span>
          ))}
        </div>
      )}
      {!value && (!tags || tags.length === 0) && (
        <p className="text-sm text-slate-400 italic">{placeholder || 'Not set'}</p>
      )}
    </div>
  </div>
);

export default function Identity() {
  const { profile } = useOnboarding();

  return (
    <DashboardLayout>
      <div className="max-w-2xl py-6 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-1">
              Your Identity Profile
            </h1>
            <p className="text-sm text-slate-500">
              This is what your AI agent knows about you.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Link>
        </div>

        {profile.profileSummary && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900 leading-relaxed italic">{profile.profileSummary}</p>
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <InfoRow
            icon={<Target className="w-4 h-4 text-indigo-500" />}
            label="Goal"
            value={profile.aspiration}
            placeholder="Complete the onboarding to set your goal"
          />
          <InfoRow
            icon={<Clock className="w-4 h-4 text-amber-500" />}
            label="Timeframe"
            value={profile.timeframe ? TIMEFRAME_LABEL[profile.timeframe] : undefined}
            placeholder="Not selected"
          />
          <InfoRow
            icon={<BookOpen className="w-4 h-4 text-emerald-500" />}
            label="Current habits"
            tags={profile.habits}
            placeholder="No habits added"
          />
          <InfoRow
            icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
            label="Where it gets hard"
            value={profile.stuckPoint}
            placeholder="Not set"
          />
        </div>

        {/* No data state */}
        {!profile.aspiration && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-700 mb-4">
              Your profile is empty. Complete the onboarding to personalize your dashboard.
            </p>
            <Link
              to="/onboarding"
              className="inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start onboarding
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
