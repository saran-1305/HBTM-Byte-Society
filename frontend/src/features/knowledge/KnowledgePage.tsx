import React, { useState } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const MOCK_DATA = [
  {
    domain: 'Writing',
    items: [
      { title: "The discipline of showing up daily", excerpt: "Consistency compounds faster than talent in the early stages of any craft — small daily reps beat sporadic bursts of intensity.", stage: "commit", date: "May 20" },
      { title: "Why first drafts are supposed to be bad", excerpt: "Separating the writing brain from the editing brain is the single biggest unlock for people who stall before finishing anything.", stage: "explore", date: "May 18" },
      { title: "Finding your natural writing voice", excerpt: "Voice emerges from removing what doesn't sound like you, not from adding stylistic flourishes on top.", stage: "explore", date: "May 15" },
      { title: "Handling criticism without losing momentum", excerpt: "The goal isn't to feel nothing when critiqued — it's to keep working the next day regardless of how it felt.", stage: "struggle", date: "May 12" }
    ]
  },
  {
    domain: 'Discipline',
    items: [
      { title: "Why willpower is the wrong lens", excerpt: "Systems and environment design consistently outperform relying on motivation, especially on hard days.", stage: "commit", date: "May 22" },
      { title: "The 2-minute rule for starting", excerpt: "Most resistance lives in the transition into a task, not the task itself — shrink the entry point.", stage: "commit", date: "May 10" }
    ]
  }
];

const KnowledgePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Filter logic
  const filteredData = MOCK_DATA.map(group => ({
    domain: group.domain,
    items: group.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const isEmpty = showEmptyState || filteredData.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Knowledge</h1>
          <p className="text-[15px] text-[#9CA3AF]">Concepts DASKALOS has surfaced for you, organized by what you're building toward.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
          </div>
          <input 
            type="text" 
            placeholder="Search your knowledge..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F1A] border border-[#1F2937] text-white placeholder-[#9CA3AF] rounded-lg pl-10 pr-12 py-[10px] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-semibold text-[#9CA3AF] bg-[#131826] border border-[#1F2937] rounded px-1.5 py-0.5">⌘K</span>
          </div>
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-[#131826] border border-[#1F2937] rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-[#9CA3AF] opacity-50" />
            </div>
            <p className="text-[#9CA3AF] text-sm">Your knowledge base will grow as DASKALOS curates for you.</p>
          </div>
        ) : (
          /* Domain Groups */
          <div className="space-y-12">
            {filteredData.map(group => (
              <section key={group.domain}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-[18px] font-medium text-white">{group.domain}</h2>
                  <span className="text-xs font-medium bg-[#131826] border border-[#1F2937] text-[#9CA3AF] px-2 py-0.5 rounded-full">
                    {group.items.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#131826] border border-[#1F2937] rounded-xl p-5 hover:-translate-y-[2px] hover:border-[#6366F1]/50 transition-all duration-150 ease-out group flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="mb-4">
                        <h3 className="text-[16px] font-medium text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[14px] text-[#9CA3AF] leading-relaxed line-clamp-2">{item.excerpt}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className="bg-[#6366F1]/15 text-[#6366F1] uppercase text-[11px] font-bold rounded-md px-2 py-0.5 tracking-wide">
                          {item.stage}
                        </span>
                        <span className="text-[12px] text-[#9CA3AF]">{item.date}</span>
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

export default KnowledgePage;
