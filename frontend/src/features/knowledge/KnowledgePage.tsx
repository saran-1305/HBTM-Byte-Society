import React, { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { searchKnowledge, refreshKnowledge } from '../../api/knowledgeApi';

const KnowledgePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKnowledge = async (query = '') => {
    setLoading(true);
    try {
      const results = await searchKnowledge(query);
      
      // Group by domain
      const grouped: { [key: string]: any[] } = {};
      results.forEach((item: any) => {
        const domain = item.domain || 'General';
        if (!grouped[domain]) grouped[domain] = [];
        grouped[domain].push(item);
      });
      
      const formatted = Object.keys(grouped).map(domain => ({
        domain,
        items: grouped[domain]
      }));
      
      setData(formatted);
    } catch (err) {
      console.error('Failed to fetch knowledge', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchKnowledge();
  }, []);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchKnowledge(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshKnowledge("latest insights");
      await fetchKnowledge(searchQuery);
    } catch (err) {
      console.error('Failed to refresh knowledge', err);
    } finally {
      setRefreshing(false);
    }
  };

  const isEmpty = data.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* Header Block */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[28px] font-bold text-white mb-2">Knowledge Engine</h1>
            <p className="text-[15px] text-[#999999]">Intelligence layer curated by AI, organized by your growth domains.</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#222222] hover:bg-[#333333] text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Discover More
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#666666]" />
          </div>
          <input 
            type="text" 
            placeholder="Search your knowledge base..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-[#333333] text-white placeholder-[#666666] rounded-lg pl-10 pr-12 py-[10px] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
          />
        </div>

        {/* Content State */}
        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#666666] animate-spin mb-4" />
            <p className="text-[#999999] text-sm">Synthesizing knowledge...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#333] rounded-2xl">
            <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-[#666666] opacity-50" />
            </div>
            <p className="text-[#999999] text-sm mb-4">Your knowledge base is empty.</p>
            <button onClick={handleRefresh} className="text-sm font-bold text-white bg-[#333333] px-4 py-2 rounded-lg">
              Populate Knowledge Base
            </button>
          </div>
        ) : (
          /* Domain Groups */
          <div className="space-y-12">
            {data.map(group => (
              <section key={group.domain}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-[18px] font-bold text-white">{group.domain}</h2>
                  <span className="text-xs font-bold bg-[#222222] text-[#999999] px-2 py-0.5 rounded-full">
                    {group.items.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item, idx) => (
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={item.id || idx}
                      className="bg-[#121212] rounded-xl p-5 hover:-translate-y-[2px] hover:bg-[#1A1A1A] transition-all duration-150 ease-out group flex flex-col justify-between min-h-[140px] cursor-pointer"
                    >
                      <div className="mb-4">
                        <h3 className="text-[16px] font-bold text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[14px] text-[#999999] leading-relaxed line-clamp-2">{item.description}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className="bg-white/10 text-white uppercase text-[11px] font-bold rounded-md px-2 py-0.5 tracking-wide">
                          {item.stage || 'Explore'}
                        </span>
                        <span className="text-[12px] text-[#999999] font-bold uppercase tracking-wider">{item.difficulty || 'Intermediate'}</span>
                      </div>
                    </a>
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
