import React, { useState, useEffect } from 'react';
import { IconX, IconUser, IconSettings, IconPalette, IconBell, IconChartBar } from '@tabler/icons-react';
import AnalyticsTab from '../../features/analytics/AnalyticsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'analytics'>('profile');

  // Profile State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('');
  const [aspiration, setAspiration] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [habitInput, setHabitInput] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchIdentity();
    }
  }, [isOpen]);

  const fetchIdentity = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/identity/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.full_name || '');
        setAge(data.age ? data.age.toString() : '');
        setRole(data.occupation || '');
        setAspiration(data.aspirations?.[0] || '');
        setHabits(data.habits || []);
      }
    } catch (err) {
      console.error('Failed to fetch identity profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = habitInput.trim();
      if (val && !habits.includes(val)) {
        setHabits([...habits, val]);
      }
      setHabitInput('');
    }
  };

  const removeHabit = (h: string) => {
    setHabits(habits.filter(habit => habit !== h));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        full_name: name,
        age: age ? parseInt(age) : null,
        occupation: role,
        long_term_goal: aspiration,
        aspirations: aspiration ? [aspiration] : [],
        habits: habits
      };

      const res = await fetch(`http://127.0.0.1:8000/api/identity/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        localStorage.setItem('daskalos_user_name', name);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-[#3A2E27]/20 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] w-full max-w-4xl h-[80vh] flex overflow-hidden  relative">

        {/* Left Sidebar Menu */}
        <div className="w-64 bg-[#0A0A0A] border-r border-[#3A2E27]/20 p-6 flex flex-col">
          <h2 className="text-xl font-bold text-[#3A2E27] mb-8">Settings</h2>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all font-medium text-sm ${activeTab === 'profile'
                  ? 'bg-white/10 text-[#3A2E27] shadow-inner'
                  : 'text-[#5C5C52] hover:bg-white/5 hover:text-[#3A2E27]'
                }`}
            >
              <IconUser size={18} />
              Identity Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all font-medium text-sm ${activeTab === 'preferences'
                  ? 'bg-white/10 text-[#3A2E27] shadow-inner'
                  : 'text-[#5C5C52] hover:bg-white/5 hover:text-[#3A2E27]'
                }`}
            >
              <IconSettings size={18} />
              App Preferences
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all font-medium text-sm ${activeTab === 'analytics'
                  ? 'bg-white/10 text-[#3A2E27] shadow-inner'
                  : 'text-[#5C5C52] hover:bg-white/5 hover:text-[#3A2E27]'
                }`}
            >
              <IconChartBar size={18} />
              Analytics
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#5C5C52] hover:text-[#3A2E27] transition-colors z-10"
          >
            <IconX size={24} />
          </button>

          <div className="flex-1 overflow-y-auto p-10">
            {activeTab === 'profile' && (
              <div className="max-w-2xl animate-fade-in">
                <h3 className="text-3xl font-bold text-[#3A2E27] mb-2">Identity Profile</h3>
                <p className="text-[#5C5C52] mb-10">Manage the core identity that DASKALOS uses to personalize your growth journey.</p>

                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <span className="w-8 h-8 border-2 border-[#3A2E27]/20 border-t-white rounded-full animate-spin"></span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#5C5C52]">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-full px-4 py-3 text-[#3A2E27] placeholder-[#5C5C52] focus:outline-none focus:border-[#1D9E75] transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#5C5C52]">Age (Optional)</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-full px-4 py-3 text-[#3A2E27] placeholder-[#5C5C52] focus:outline-none focus:border-[#1D9E75] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#5C5C52]">Current Occupation / Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-full px-4 py-3 text-[#3A2E27] placeholder-[#5C5C52] focus:outline-none focus:border-[#1D9E75] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#5C5C52]">Core Aspiration</label>
                      <textarea
                        value={aspiration}
                        onChange={(e) => setAspiration(e.target.value)}
                        className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-[12px] px-4 py-3 text-[#3A2E27] placeholder-[#5C5C52] focus:outline-none focus:border-[#1D9E75] transition-colors resize-none"
                        rows={3}
                        required
                        placeholder="Who are you trying to become?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#5C5C52]">Current Habits</label>
                      <div className="w-full bg-white border border-[#3A2E27]/20 rounded-full p-3 min-h-[60px] flex flex-wrap gap-2 items-center focus-within:border-[#E50914] transition-colors">
                        {habits.map((habit) => (
                          <div
                            key={habit}
                            className="bg-white border border-[#3A2E27]/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-[#3A2E27]"
                          >
                            {habit}
                            <button type="button" onClick={() => removeHabit(habit)} className="text-[#5C5C52] hover:text-[#E50914]">
                              <IconX size={14} />
                            </button>
                          </div>
                        ))}
                        <input
                          type="text"
                          value={habitInput}
                          onChange={e => setHabitInput(e.target.value)}
                          onKeyDown={handleAddHabit}
                          placeholder={habits.length === 0 ? "Type a habit and press enter..." : "Add another..."}
                          className="flex-1 bg-transparent border-none text-[#3A2E27] text-sm px-2 py-1 focus:outline-none min-w-[200px]"
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4 border-t border-[#3A2E27]/20">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-full font-bold text-[#5C5C52] hover:text-[#3A2E27] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-full transition-all shadow-lg flex items-center gap-2"
                      >
                        {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="max-w-2xl animate-fade-in">
                <h3 className="text-3xl font-bold text-[#3A2E27] mb-2">App Preferences</h3>
                <p className="text-[#5C5C52] mb-10">Customize your DASKALOS experience.</p>

                <div className="space-y-8">
                  {/* Theme Settings (Mock) */}
                  <div className="bg-white border border-[#3A2E27]/20 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white rounded-full text-[#3A2E27]">
                        <IconPalette size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#3A2E27]">Appearance</h4>
                        <p className="text-[#5C5C52] text-sm">Choose how DASKALOS looks.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="border-2 border-[#3A2E27] bg-black/5 rounded-[16px] p-4 flex flex-col items-center justify-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white border border-[#3A2E27]/20"></div>
                        <span className="font-bold text-[#3A2E27]">Light Mode</span>
                      </div>
                      <div className="border border-[#3A2E27]/20 bg-white rounded-[16px] p-4 flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 rounded-full bg-black border border-[#3A2E27]/20"></div>
                        <span className="font-bold text-[#5C5C52]">Dark Mode (Coming Soon)</span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications (Mock) */}
                  <div className="bg-white border border-[#3A2E27]/20 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-white rounded-full text-[#3A2E27]">
                        <IconBell size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#3A2E27]">Notifications</h4>
                        <p className="text-[#5C5C52] text-sm">Manage how we communicate with you.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-full border border-[#3A2E27]/20">
                        <div>
                          <p className="font-bold text-[#3A2E27]">Daily Growth Reminder</p>
                          <p className="text-sm text-[#5C5C52]">A nudge to complete your daily learning.</p>
                        </div>
                        <div className="w-12 h-6 bg-[#3A2E27] text-white rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-full border border-[#3A2E27]/20">
                        <div>
                          <p className="font-bold text-[#3A2E27]">Weekly Review</p>
                          <p className="text-sm text-[#5C5C52]">Summary of your progression and insights.</p>
                        </div>
                        <div className="w-12 h-6 bg-[#333333] rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-[#999999] rounded-full absolute left-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab userId={userId} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;







