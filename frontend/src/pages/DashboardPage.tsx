import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeroCurationBanner from '../components/dashboard/HeroCurationBanner';
import StageTrackerStrip from '../components/dashboard/StageTrackerStrip';
import MediaGrid from '../components/dashboard/MediaGrid';
import RightPanel from '../components/dashboard/RightPanel';
import { Loader2 } from 'lucide-react';

function DashboardPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const userId = localStorage.getItem('daskalos_user_id') || '123e4567-e89b-12d3-a456-426614174000';
        const response = await fetch(`http://127.0.0.1:8000/api/recommendations/${userId}`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          setRecommendations(data.items);
        }
      } catch (err) {
        console.error("Failed to load recommendation", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendation();
  }, []);

  const spotlight = recommendations.length > 0 ? recommendations[0] : null;
  const restOfFeed = recommendations.length > 1 ? recommendations.slice(1).map((item: any) => ({
    id: item.recommendation.id,
    title: item.recommendation.title,
    subtitle: item.recommendation.type,
    badge: item.recommendation.type.split(' ')[0], // Best effort badge
    url: item.recommendation.url
  })) : [];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        
        {/* Main Feed Column */}
        <div className="xl:col-span-8 flex flex-col">
          {isLoading ? (
            <div className="w-full h-[340px] rounded-[24px] bg-white flex flex-col items-center justify-center border border-[#333333]">
              <Loader2 className="w-8 h-8 text-[#E50914] animate-spin mb-4" />
              <p className="text-[#5C5C52] font-medium animate-pulse">DASKALOS is synthesizing your personalized feed (this takes ~15 seconds)...</p>
            </div>
          ) : spotlight ? (
            <HeroCurationBanner 
              title={spotlight.recommendation.title}
              subtitle={spotlight.recommendation.type}
              reasoning={spotlight.reasoning ? spotlight.reasoning[0] : spotlight.recommendation.description}
              url={spotlight.recommendation.url}
            />
          ) : (
             <div className="w-full h-[340px] rounded-[24px] bg-white flex flex-col items-center justify-center border border-[#333333]">
              <p className="text-[#5C5C52] font-medium">No recommendation available.</p>
            </div>
          )}
          
          <div className="mt-8">
            <StageTrackerStrip />
          </div>
          
          {restOfFeed.length > 0 && (
            <div className="mt-8">
              <MediaGrid 
                title="Matched to your Struggle phase" 
                items={restOfFeed} 
              />
            </div>
          )}
          
          <div className="mt-12 text-center text-[#666666] text-sm">
            Complete activities to populate your feed with more recommendations.
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



