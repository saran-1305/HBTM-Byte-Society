import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FeaturedCarousel from '../../components/dashboard/FeaturedCarousel';

const MOCK_ITEMS = [
  { id: '1', title: 'The Discipline of Showing Up Daily', type: 'video', videoId: 'pW-SOdj4Kkk' },
  { id: '2', title: 'Steve Jobs on Connecting the Dots', type: 'video', videoId: 'vj-91dNMcc0' },
  { id: '3', title: 'David Goggins - Mastering Your Mind', type: 'video', videoId: 'TLKxdTmk-yg' },
  { id: '4', title: 'Kobe Bryant Mamba Mentality', type: 'video', videoId: 'qj8EELwWkE4' },
  { id: '5', title: 'Denzel Washington Fall Forward', type: 'video', videoId: 'tbnzAVRZ9Xc' },
];

const FeaturedPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-10 pt-8">
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Featured</h1>
          <p className="text-[15px] text-[#999999]">Hand-picked media matched to where you are right now.</p>
        </div>

        <FeaturedCarousel items={MOCK_ITEMS} />
      </div>
    </DashboardLayout>
  );
};

export default FeaturedPage;
