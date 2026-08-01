import React, { useState } from 'react';
import { Quote } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const INITIAL_MOCK_DATA = [
  {
    month: "May 2024",
    entries: [
      { id: 1, text: "Today I learned about database indexing and it really clicked! Building the project is challenging but exciting.", date: "May 20", linkedTo: "System design deep dive" },
      { id: 2, text: "Skipped the reading today. Not feeling it. Might need something different tomorrow.", date: "May 18", linkedTo: "Deep Work reading" },
      { id: 3, text: "The marathon training article actually stuck with me more than I expected — discipline really does look the same everywhere.", date: "May 12", linkedTo: "Marathon article" },
    ]
  },
  {
    month: "April 2024",
    entries: [
      { id: 4, text: "Struggling to keep up the momentum this week. Need to rethink my evening routine.", date: "April 28", linkedTo: null },
      { id: 5, text: "Felt very productive today. The Pomodoro technique is working wonders.", date: "April 15", linkedTo: "Pomodoro guide" }
    ]
  }
];

const ReflectionPage = () => {
  const [reflectionText, setReflectionText] = useState('');
  const [data, setData] = useState(INITIAL_MOCK_DATA);

  const handleSave = () => {
    if (!reflectionText.trim()) return;

    const newEntry = {
      id: Date.now(),
      text: reflectionText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      linkedTo: null
    };

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    setData(prevData => {
      const newData = [...prevData];
      const monthIndex = newData.findIndex(group => group.month === currentMonth);

      if (monthIndex >= 0) {
        newData[monthIndex] = {
          ...newData[monthIndex],
          entries: [newEntry, ...newData[monthIndex].entries]
        };
      } else {
        newData.unshift({
          month: currentMonth,
          entries: [newEntry]
        });
      }
      return newData;
    });

    setReflectionText('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Reflection</h1>
          <p className="text-[15px] text-[#9CA3AF]">What you've noticed along the way, in your own words.</p>
        </div>

        {/* New Reflection Input */}
        <div className="bg-[#131826] border border-[#1F2937] rounded-xl p-5">
          <label className="block text-[13px] font-medium text-[#9CA3AF] mb-3">Today's reflection</label>
          <div className="relative">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What did today's curation bring up for you?"
              className="w-full min-h-[100px] bg-transparent text-white placeholder-[#9CA3AF] border border-transparent rounded-lg p-3 resize-none focus:outline-none focus:border-[#6366F1] focus:bg-[#0B0F1A]/50 transition-colors"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                disabled={!reflectionText.trim()}
                className="bg-[#6366F1] text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Past Reflections List */}
        <div className="space-y-10">
          {data.map((group) => (
            <section key={group.month}>
              <div className="mb-6">
                <h2 className="text-[14px] font-medium text-[#9CA3AF] mb-2">{group.month}</h2>
                <div className="h-[1px] w-full bg-[#1F2937]"></div>
              </div>
              
              <div className="space-y-4">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="bg-[#131826] border border-[#1F2937] rounded-xl p-5 relative group hover:border-[#6366F1]/30 transition-colors">
                    <Quote className="w-5 h-5 text-[#9CA3AF] opacity-20 absolute top-5 left-5" />
                    
                    <div className="pl-8">
                      <p className="text-[15px] text-white leading-[1.6] font-normal mb-6">
                        {entry.text}
                      </p>
                      
                      <div className="flex justify-between items-center border-t border-[#1F2937]/50 pt-3 mt-auto">
                        <span className="text-[13px] text-[#9CA3AF]">{entry.date}</span>
                        {entry.linkedTo && (
                          <span className="bg-[#6366F1]/15 text-[#6366F1] text-[11px] font-medium rounded-md px-2 py-0.5">
                            In response to: {entry.linkedTo}
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

      </div>
    </DashboardLayout>
  );
};

export default ReflectionPage;
