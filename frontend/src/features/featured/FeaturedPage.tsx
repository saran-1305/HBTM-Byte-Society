import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackgroundBlobs from '../../components/layout/BackgroundBlobs';
import FeaturedCarousel from '../../components/FeaturedCarousel';

const MOCK_ITEMS = [
  { id: '1', title: 'Start Taking Action', type: 'video', videoId: 'm7kRfGkGSOY' },
  { id: '2', title: 'Break Your Limits', type: 'video', videoId: 'nkSFReN7DAw' },
  { id: '3', title: 'Focus on Growth', type: 'video', videoId: 'ygMYFa1hISA' },
  { id: '4', title: 'Consistency is Key', type: 'video', videoId: 'wTF0lOOfQxg' },
  { id: '5', title: 'Embrace the Struggle', type: 'video', videoId: 'VO72be6GKfs' },
];

const FeaturedPage = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <BackgroundBlobs />
      <div className="space-y-10 pt-8 relative z-10">
        <div>
          <h1 className="text-[28px] font-bold text-[#3A2E27] mb-2">Featured</h1>
          <p className="text-[15px] text-[#5C5C52]">Hand-picked media matched to where you are right now.</p>
        </div>

        <FeaturedCarousel items={MOCK_ITEMS} isLoading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default FeaturedPage;





