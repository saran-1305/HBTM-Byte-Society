import React, { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FALLBACK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface ReflectionEntry {
  id: string;
  text: string;
  recommendation_id: string | null;
  created_at: string;
}

interface ReflectionGroup {
  month: string;
  entries: ReflectionEntry[];
}

const groupByMonth = (entries: ReflectionEntry[]): ReflectionGroup[] => {
  const groups: Record<string, ReflectionEntry[]> = {};
  for (const entry of entries) {
    const month = new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    groups[month] = groups[month] || [];
    groups[month].push(entry);
  }
  return Object.entries(groups).map(([month, entries]) => ({ month, entries }));
};

const ReflectionPage = () => {
  const userId = localStorage.getItem('daskalos_user_id') || FALLBACK_USER_ID;
  const [reflectionText, setReflectionText] = useState('');
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchReflections = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/activity/${userId}/reflections`);
      if (res.ok) setEntries(await res.json());
    } catch (err) {
      console.error("Failed to fetch reflections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, []);

  const handleSave = async () => {
    if (!reflectionText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/activity/${userId}/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biggest_insight: reflectionText.trim() }),
      });
      if (res.ok) {
        setReflectionText('');
        await fetchReflections();
      }
    } catch (err) {
      console.error("Failed to save reflection", err);
    } finally {
      setSaving(false);
    }
  };

  const data = groupByMonth(entries);

  return (
    <DashboardLayout>
      <div className="space-y-10">

        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-[#3A2E27] mb-2">Reflection</h1>
          <p className="text-[15px] text-[#5C5C52]">What you've noticed along the way, in your own words. Every reflection here becomes evidence ARC uses to understand your journey.</p>
        </div>

        {/* New Reflection Input */}
        <div className="bg-white border-[1.5px] border-[#3A2E27] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <label className="block text-[13px] font-bold text-[#5C5C52] mb-3">Today's reflection</label>
          <div className="relative">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What did today's curation bring up for you?"
              className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-[12px] p-4 text-[#3A2E27] placeholder-[#5C5C52] focus:outline-none focus:border-[#1D9E75] transition-colors min-h-[120px] resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={!reflectionText.trim() || saving}
                className="bg-[#1FA35A] text-white text-sm font-bold px-5 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#198549] transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Past Reflections List */}
        {loading ? (
          <p className="text-[#5C5C52] text-sm">Loading your reflections...</p>
        ) : data.length === 0 ? (
          <div className="bg-white border-[1.5px] border-[#3A2E27] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8 text-center">
            <p className="text-[#5C5C52] text-sm">No reflections yet — the one you write above will be your first.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {data.map((group) => (
              <section key={group.month}>
                <div className="mb-6">
                  <h2 className="text-[14px] font-bold text-[#5C5C52] mb-2">{group.month}</h2>
                  <div className="h-[1px] w-full bg-[#222222]"></div>
                </div>

                <div className="space-y-4">
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="bg-white border-[1.5px] border-[#3A2E27] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 relative group transition-colors">
                      <Quote className="w-5 h-5 text-[#5C5C52] opacity-30 absolute top-6 left-6" />

                      <div className="pl-10">
                        <p className="text-[15px] text-[#3A2E27] leading-[1.6] font-normal mb-6">
                          {entry.text}
                        </p>

                        <div className="flex justify-between items-center border-t border-[#222222] pt-3 mt-auto">
                          <span className="text-[13px] text-[#5C5C52]">
                            {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {entry.recommendation_id && (
                            <span className="bg-white/10 text-[#3A2E27] text-[11px] font-bold rounded-md px-2 py-0.5">
                              In response to a recommendation
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ReflectionPage;





