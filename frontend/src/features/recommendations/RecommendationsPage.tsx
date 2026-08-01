import React, { useState, useEffect } from 'react';
import { Search, Heart, Loader2, Compass, Bookmark, X, Check, RefreshCw, ExternalLink, Calendar, Clock, Trophy } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const RecommendationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userId = localStorage.getItem('daskalos_user_id') || '123e4567-e89b-12d3-a456-426614174000';

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/opportunities/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      const data = await response.json();
      setOpportunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/opportunities/${userId}/refresh`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFeedback = async (oppId: string, type: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/opportunities/${userId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: oppId, feedback: type })
      });
      if (type === 'ignored' || type === 'rejected') {
        setOpportunities(prev => prev.filter(o => o.id !== oppId));
      }
    } catch (e) {
      console.error("Failed to log feedback", e);
    }
  };

  const FILTER_TYPES = ['All', 'Internships', 'Hackathons', 'Workshops'];
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredData = opportunities.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Loosely match categories (e.g. "Hackathon" matches "Hackathons")
    const matchesFilter = activeFilter === 'All' || item.category.toLowerCase().includes(activeFilter.toLowerCase().replace(/s$/, ''));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Compass className="w-8 h-8 text-emerald-500" />
              <h1 className="text-[28px] font-bold text-white">Live Opportunity Scout</h1>
            </div>
            <p className="text-[15px] text-[#999999] max-w-2xl">
              Your autonomous AI agent continuously scours the internet to discover high-impact real-world opportunities tailored to your growth trajectory.
            </p>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-emerald-500/20 disabled:opacity-50"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isRefreshing ? 'Agent Scouting...' : 'Trigger Live Search'}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
            {FILTER_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${
                  activeFilter === type 
                    ? 'bg-emerald-500 text-black border border-emerald-500' 
                    : 'bg-transparent border border-[#333333] text-[#999999] hover:text-white hover:border-[#666666]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#666666]" />
            </div>
            <input 
              type="text" 
              placeholder="Search opportunities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-[#333333] text-white placeholder-[#666666] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <p className="text-[#999999] text-sm">Loading your opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#333333] rounded-2xl bg-[#0a0a0a]">
            <Compass className="w-12 h-12 text-[#666666] opacity-50 mb-4" />
            <h3 className="text-white font-bold mb-2">No Live Opportunities</h3>
            <p className="text-[#999999] text-sm mb-6 text-center max-w-md">Your agent hasn't found any active opportunities yet. Trigger a live search to scan the internet.</p>
            <button 
              onClick={handleRefresh}
              className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Start Scouting
            </button>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredData.map((item) => (
              <div 
                key={item.id}
                className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden hover:border-[#333333] transition-all flex flex-col group"
              >
                {/* Header Row */}
                <div className="p-5 pb-4 border-b border-[#222222] bg-[#161616]">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-[17px] font-bold text-white line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    <div className="flex flex-col items-end shrink-0 gap-1">
                       <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                         {Math.round(item.confidence_score * 100)}% Match
                       </span>
                       {item.priority_score > 0.8 && (
                         <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20">
                           High Priority
                         </span>
                       )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium">
                    <span className="text-white bg-[#333333] px-2 py-1 rounded">{item.category}</span>
                    <span className="flex items-center gap-1 text-[#999999]">
                      <Trophy className="w-3.5 h-3.5" />
                      {item.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[#999999]">
                      <Clock className="w-3.5 h-3.5" />
                      {item.estimated_time || 'Variable'}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
                      {item.provider_name.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Content Block */}
                <div className="p-5 flex-1 flex flex-col">
                  
                  <p className="text-[14px] text-[#AAAAAA] mb-5 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* AI Explanation Box */}
                  <div className="mt-auto mb-5 bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[11px] font-bold text-emerald-500 tracking-wider uppercase">AI Analysis</span>
                    </div>
                    <p className="text-[13px] text-white mb-2 leading-relaxed">
                      "{item.ai_explanation}"
                    </p>
                    <div className="flex items-start gap-2 text-[12px] text-[#999999] pt-2 border-t border-[#333333] mt-2">
                      <span className="font-bold text-[#CCCCCC]">Impact:</span>
                      {item.estimated_impact}
                    </div>
                  </div>
                  
                  {/* Action Row */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleFeedback(item.id, 'ignored')}
                        className="p-2.5 rounded-lg text-[#666666] hover:text-white hover:bg-[#222222] transition-colors group/btn relative"
                      >
                        <X className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap transition-opacity">Not interested</span>
                      </button>
                      <button 
                        onClick={() => handleFeedback(item.id, 'bookmarked')}
                        className="p-2.5 rounded-lg text-[#666666] hover:text-white hover:bg-[#222222] transition-colors group/btn relative"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap transition-opacity">Save for later</span>
                      </button>
                      <button 
                        onClick={() => handleFeedback(item.id, 'liked')}
                        className="p-2.5 rounded-lg text-[#666666] hover:text-rose-500 hover:bg-rose-500/10 transition-colors group/btn relative"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap transition-opacity">Like</span>
                      </button>
                    </div>
                    
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => handleFeedback(item.id, 'applied')}
                      className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-colors"
                    >
                      View Opportunity
                      <ExternalLink className="w-4 h-4" />
                    </a>
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
