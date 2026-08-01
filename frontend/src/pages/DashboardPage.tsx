import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeroCurationBanner from '../components/dashboard/HeroCurationBanner';
import StageTrackerStrip from '../components/dashboard/StageTrackerStrip';
import MediaGrid from '../components/dashboard/MediaGrid';
import RightPanel from '../components/dashboard/RightPanel';
import { useRecommendations } from '../hooks/useRecommendations';

function DashboardPage() {
  const { data: recs, loading } = useRecommendations();

  // Map API recs to the MediaItem shape expected by MediaGrid
  const toMediaItems = (items: any[]) =>
    items.map((r: any) => ({
      id: r.id,
      title: r.source?.title || 'Untitled',
      subtitle: r.source?.author || '',
      badge: r.source?.source_type || 'resource',
      url: r.source?.url || '',
      thumbnail: r.source?.thumbnail || '',
      provider: r.source?.provider || '',
      relevance_score: r.relevance_score,
    }));

  // Split by priority: 1=top, 2=recent, rest=wildcard
  const topItems = recs?.filter((r: any) => r.priority === 1) || [];
  const recentItems = recs?.filter((r: any) => r.priority === 2) || [];
  const wildcardItems = recs?.filter((r: any) => r.priority === 3) || [];

  // Fallback to full list split evenly if priorities aren't available
  const allItems = recs || [];
  const chunkSize = Math.ceil(allItems.length / 3);
  const primaryItems = topItems.length ? toMediaItems(topItems) : toMediaItems(allItems.slice(0, chunkSize));
  const secondaryItems = recentItems.length ? toMediaItems(recentItems) : toMediaItems(allItems.slice(chunkSize, chunkSize * 2));
  const tertiaryItems = wildcardItems.length ? toMediaItems(wildcardItems) : toMediaItems(allItems.slice(chunkSize * 2));

  // Top rec for hero banner
  const heroRec = recs?.[0];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        
        {/* Main Feed Column */}
        <div className="xl:col-span-8 flex flex-col">
          <HeroCurationBanner rec={heroRec} loading={loading} />
          <StageTrackerStrip />
          
          <div className="mt-2">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[#999999] text-sm animate-pulse">
                AI Curator is assembling your recommendations...
              </div>
            ) : (
              <>
                {primaryItems.length > 0 && (
                  <MediaGrid 
                    title="Curated for your current focus" 
                    items={primaryItems} 
                    viewAllLink="/recommendations"
                  />
                )}
                {secondaryItems.length > 0 && (
                  <MediaGrid 
                    title="Recent recommendations" 
                    items={secondaryItems} 
                    viewAllLink="/recommendations"
                  />
                )}
                {tertiaryItems.length > 0 && (
                  <MediaGrid 
                    title="Suggested by DASKALOS" 
                    items={tertiaryItems}
                  />
                )}
                {allItems.length === 0 && (
                  <div className="text-center py-12 text-[#666666]">
                    <p>No recommendations yet.</p>
                    <p className="text-sm mt-1">Complete onboarding to get personalized curation.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <div className="xl:col-span-4">
          <RightPanel />
        </div>

      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
