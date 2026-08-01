import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeroCurationBanner from '../components/dashboard/HeroCurationBanner';
import StageTrackerStrip from '../components/dashboard/StageTrackerStrip';
import MediaGrid from '../components/dashboard/MediaGrid';
import RightPanel from '../components/dashboard/RightPanel';

const STRUGGLE_MATCHES = [
  { id: '101', title: 'Designing Data-Intensive Applications', subtitle: 'Martin Kleppmann', badge: 'Book' },
  { id: '102', title: 'System Design Interview', subtitle: 'Alex Xu', badge: 'Video' },
  { id: '103', title: 'Distributed Systems', subtitle: 'MIT 6.824', badge: 'Course' },
  { id: '104', title: 'Microservices Patterns', subtitle: 'Chris Richardson', badge: 'Book' },
  { id: '105', title: 'The Mental Models', subtitle: 'Farnam Street', badge: 'Article' },
];

const RECENT_RECOMMENDATIONS = [
  { id: '201', title: 'Deep Work', subtitle: 'Cal Newport', badge: 'Book' },
  { id: '202', title: 'Atomic Habits', subtitle: 'James Clear', badge: 'Book' },
  { id: '203', title: 'Navigating the Messy Middle', subtitle: 'Scott Belsky', badge: 'Article' },
  { id: '204', title: 'The Pragmatic Programmer', subtitle: 'David Thomas', badge: 'Book' },
  { id: '205', title: 'Refactoring UI', subtitle: 'Adam Wathan', badge: 'Book' },
];

const SUGGESTED_WILDCARDS = [
  { id: '301', title: 'What Marathon Training Teaches', subtitle: 'Runner\'s World', isWildcard: true },
  { id: '302', title: 'The Art of Learning', subtitle: 'Josh Waitzkin', isWildcard: true },
  { id: '303', title: 'Thinking, Fast and Slow', subtitle: 'Daniel Kahneman', isWildcard: true },
  { id: '304', title: 'Range', subtitle: 'David Epstein', isWildcard: true },
  { id: '305', title: 'Zen in the Art of Archery', subtitle: 'Eugen Herrigel', isWildcard: true },
];

function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        
        {/* Main Feed Column */}
        <div className="xl:col-span-8 flex flex-col">
          <HeroCurationBanner />
          <StageTrackerStrip />
          
          <div className="mt-2">
            <MediaGrid 
              title="Matched to your Struggle phase" 
              items={STRUGGLE_MATCHES} 
              viewAllLink="/recommendations"
            />
            <MediaGrid 
              title="Recent recommendations" 
              items={RECENT_RECOMMENDATIONS} 
              viewAllLink="/recommendations"
            />
            <MediaGrid 
              title="Suggested by DASKALOS" 
              items={SUGGESTED_WILDCARDS} 
            />
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
