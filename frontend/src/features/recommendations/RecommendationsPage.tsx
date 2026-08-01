import React, { useState, useEffect } from 'react';
import { Search, Heart, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';





const FILTER_TYPES = ['All', 'Intern opportunities', 'Hackathon\'s', 'Workshops'];

const RecommendationsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendation = async () => {
      // Fallback to a hardcoded test UUID if the user hasn't logged in yet
      const userId = localStorage.getItem('daskalos_user_id') || '123e4567-e89b-12d3-a456-426614174000';

      setIsLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/recommendations/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendation');
        }
        const data = await response.json();
        
        // Format backend response to match our frontend UI structure
        const formattedRec = {
          id: data.recommendation.id,
          title: data.recommendation.title,
          type: data.recommendation.type,
          source: "DASKALOS AI",
          reasoning: data.reasoning.join(" "),
          date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          wildcard: false,
          resonated: false
        };

        // Put the real recommendation in the state
        setRecommendations([formattedRec]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  // Filter logic
  const filteredData = recommendations.filter(item => {
    const matchesFilter = activeFilter === 'All' || item.type.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isEmpty = showEmptyState || filteredData.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* Header Block */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Recommendations</h1>
          <p className="text-[15px] text-[#999999]">Everything DASKALOS has curated for you, media matched to where you are right now.</p>
        </div>

        {/* Filter and Search Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
            {FILTER_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${
                  activeFilter === type 
                    ? 'bg-white text-black border border-white' 
                    : 'bg-transparent border border-[#333333] text-[#999999] hover:text-white hover:border-[#666666]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#666666]" />
            </div>
            <input 
              type="text" 
              placeholder="Search recommendations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-[#333333] text-white placeholder-[#666666] rounded-lg pl-10 pr-12 py-[8px] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#999999] bg-[#121212] border border-[#333333] rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-[#666666] opacity-50" />
            </div>
            <p className="text-[#999999] text-sm">Your recommendations will appear here as DASKALOS gets to know you.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#666666] animate-spin mb-4" />
            <p className="text-[#999999] text-sm">Curating your recommendations...</p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#121212] rounded-xl overflow-hidden hover:-translate-y-[2px] hover:bg-[#1A1A1A] transition-all duration-150 ease-out group flex flex-col"
              >
                {/* Thumbnail Block */}
                <div className="h-[140px] w-full bg-[#222222] flex items-center justify-center group-hover:bg-[#333333] transition-colors">
                  <span className="opacity-20">
                     {/* Abstract icon based on type could go here */}
                  </span>
                </div>
                
                {/* Content Block */}
                <div className="p-4 flex-1 flex flex-col">
                  
                  {/* Badges */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-white/10 text-white uppercase text-[11px] font-bold rounded-md px-2 py-0.5 tracking-wide">
                      {item.type}
                    </span>
                    
                    {item.wildcard && (
                      <span className="bg-[#F97316]/15 text-[#F97316] uppercase text-[10px] font-bold rounded-md px-2 py-0.5 tracking-wide flex items-center gap-1">
                         OFF YOUR USUAL PATH
                      </span>
                    )}
                  </div>

                  <h3 className="text-[16px] font-bold text-white mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-[13px] text-[#999999] mb-4">{item.source}</p>
                  
                  {/* Reasoning */}
                  <div className="mt-auto mb-4 border-l-2 border-[#333333] pl-3 py-0.5">
                    <p className="text-[13px] text-[#999999] italic line-clamp-2 leading-relaxed">
                      "{item.reasoning}"
                    </p>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
                    <span className="text-[12px] text-[#999999]">{item.date}</span>
                    <div className="text-[#999999]">
                      {item.resonated ? (
                        <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                      ) : (
                        <Heart className="w-4 h-4 opacity-30" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecommendationsPage;
