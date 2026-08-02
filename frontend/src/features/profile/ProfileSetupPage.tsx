import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSetupPage = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('');
  const [aspiration, setAspiration] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [habitInput, setHabitInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from previous flows
  useEffect(() => {
    const savedName = localStorage.getItem('daskalos_user_name');
    if (savedName) setName(savedName);
    
    // In a real app we might fetch aspiration/habits from an earlier state or context
    // For this prototype, we'll assume it might have been saved in localStorage if we implemented it that way
  }, []);

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

  const isValid = name.trim() !== '' && aspiration.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      const userId = localStorage.getItem('daskalos_user_id') || '123e4567-e89b-12d3-a456-426614174000';
      localStorage.setItem('daskalos_user_name', name);
      
      const payload = {
        full_name: name,
        age: age ? parseInt(age) : null,
        occupation: role,
        long_term_goal: aspiration,
        aspirations: [aspiration],
        habits: habits
      };

      const response = await fetch(`http://127.0.0.1:8000/api/identity/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error("Failed to save profile", await response.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[480px] bg-[#121212] rounded-2xl p-8 md:p-10 shadow-2xl">
        
        <div className="mb-8">
          <h1 className="text-[22px] text-white font-bold mb-1">Complete your profile</h1>
          <p className="text-[14px] text-[#999999]">This helps DASKALOS understand who you're building toward.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name & Age Row */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="block text-[13px] font-bold text-[#999999]">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#000000] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Your name"
                required
              />
            </div>
            <div className="w-24 space-y-2">
              <label className="block text-[13px] font-bold text-[#999999]">Age <span className="opacity-50">(opt)</span></label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full bg-[#000000] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="25"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-[#999999]">Current role or occupation</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-[#000000] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              placeholder="What do you do day to day?"
            />
          </div>

          {/* Aspiration */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-[#999999]">Who are you trying to become?</label>
            <textarea
              value={aspiration}
              onChange={e => setAspiration(e.target.value)}
              className="w-full bg-[#000000] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all resize-none"
              placeholder="A writer who publishes every week"
              rows={3}
              required
            />
          </div>

          {/* Habits */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-[#999999]">Current habits</label>
            <div className="w-full bg-[#000000] border border-[#333333] rounded-lg p-2 min-h-[52px] flex flex-wrap gap-2 items-center focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-all">
              {habits.map((habit) => (
                <div
                  key={habit}
                  className="bg-[#121212] border border-[#333333] px-3 py-1 rounded-md flex items-center gap-1.5 text-sm text-white"
                >
                  {habit}
                  <button type="button" onClick={() => removeHabit(habit)} className="text-[#999999] hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={habitInput}
                onChange={e => setHabitInput(e.target.value)}
                onKeyDown={handleAddHabit}
                placeholder={habits.length === 0 ? "Type and press enter..." : "Add another..."}
                className="flex-1 bg-transparent border-none text-white text-sm px-2 py-1 focus:outline-none min-w-[150px]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-white text-black rounded-lg py-3.5 font-bold transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? 'Saving...' : 'Continue to dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
