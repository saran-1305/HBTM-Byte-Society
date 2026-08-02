import React, { useRef, useState } from 'react';
import { IconCompass, IconCheck, IconActivity, IconSun, IconNetwork } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const STAGES = [
  {
    name: 'Explore',
    tagline: 'Start wide. Wear the beginning.',
    color: '#1D9E75',
    icon: IconCompass,
    products: [
      { title: "Explore Tee", desc: "Boxy fit, compass graphic" },
      { title: "Explore Cap", desc: "Embroidered stage mark" },
      { title: "Explore Tote", desc: "Canvas, minimal print" },
      { title: "Explore Sticker Pack", desc: "5 stage icons" },
    ]
  },
  {
    name: 'Commit',
    tagline: 'Small reps, worn daily.',
    color: '#111111',
    icon: IconCheck,
    products: [
      { title: "Commit Hoodie", desc: "Heavyweight, checkmark graphic" },
      { title: "Commit Journal", desc: "Daily rep tracker, physical" },
      { title: "Commit Tee", desc: "Everyday wear, subtle mark" },
      { title: "Commit Wristband", desc: "Silicone, stage color" },
    ]
  },
  {
    name: 'Struggle',
    tagline: 'For the messy middle.',
    color: '#D85A30',
    icon: IconActivity,
    products: [
      { title: "Struggle Tee", desc: "Jagged path graphic" },
      { title: "Struggle Hoodie", desc: "Oversized, comfort fit" },
      { title: "Struggle Patch", desc: "Iron-on, earned not given" },
      { title: "Struggle Water Bottle", desc: "For the long stretch" },
    ]
  },
  {
    name: 'Breakthrough',
    tagline: 'You made it through.',
    color: '#BA7517',
    icon: IconSun,
    products: [
      { title: "Breakthrough Tee", desc: "Sunburst graphic" },
      { title: "Breakthrough Jacket", desc: "Lightweight, bold mark" },
      { title: "Breakthrough Pin Set", desc: "3 milestone pins" },
      { title: "Breakthrough Cap", desc: "Structured, embroidered" },
    ]
  },
  {
    name: 'Integrate',
    tagline: 'Certified. Now you guide others.',
    color: '#534AB7',
    icon: IconNetwork,
    products: [
      { title: "Integrate Tee", desc: "Network graphic, certified mark" },
      { title: "Mentor Hoodie", desc: "For certified members only" },
      { title: "Integrate Tote", desc: "Community edition" },
      { title: "Certified Pin", desc: "Earned at Integrate stage" },
    ]
  }
];

const DraggableCarousel = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={startDragging}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onMouseMove={onDrag}
      onTouchStart={startDragging}
      onTouchEnd={stopDragging}
      onTouchMove={onDrag}
      className={`flex overflow-x-auto gap-6 pb-6 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ scrollBehavior: isDragging ? 'auto' : 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
    >
      {children}
    </div>
  );
};

const LifestylePage = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F7F5EF] text-[#111111] -m-8 p-8 sm:p-12 font-sans">
        
        {/* Header */}
        <header className="max-w-6xl mx-auto mb-16 pt-8">
          <h1 className="text-[28px] font-bold tracking-tight mb-2">The Arc Collection</h1>
          <p className="text-[15px] text-[#5C5C52]">Wear the stage you're in.</p>
          <div className="mt-4 inline-block bg-black/5 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-black/10">
            Coming Soon
          </div>
        </header>

        {/* Stages */}
        <div className="max-w-6xl mx-auto space-y-24 pb-20">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <section key={stage.name}>
                <div className="mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: stage.color }}>
                    {stage.name}
                  </h2>
                  <p className="text-[14px] text-[#5C5C52] mt-1">{stage.tagline}</p>
                </div>
                
                <DraggableCarousel>
                  {stage.products.map((product, idx) => (
                    <div 
                      key={idx} 
                      className="shrink-0 w-[220px] bg-white border-[1.5px] border-[#111111] rounded-[16px] overflow-hidden flex flex-col group"
                      style={{ borderTopColor: stage.color, borderTopWidth: '3px' }}
                    >
                      {/* Image Area placeholder */}
                      <div className="h-[240px] bg-[#F7F5EF] border-b-[1.5px] border-[#111111] flex items-center justify-center relative overflow-hidden">
                        <Icon size={64} style={{ color: stage.color }} stroke={1.5} className="opacity-80 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                      </div>
                      
                      {/* Content Area */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-[14px] font-bold mb-1 line-clamp-1">{product.title}</h3>
                        <p className="text-[12px] text-[#5C5C52] line-clamp-1 mb-4">{product.desc}</p>
                        
                        <div className="mt-auto flex justify-center">
                          <span 
                            className="bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                          >
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </DraggableCarousel>
              </section>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LifestylePage;
