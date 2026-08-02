import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const items = [
  { id: 1, stage: "explore", title: "Explore Tee", desc: "Boxy fit, compass graphic", price: "₹2,999", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" },
  { id: 2, stage: "commit", title: "Commit Hoodie", desc: "Heavyweight, checkmark graphic", price: "₹5,499", imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80" },
  { id: 3, stage: "struggle", title: "Struggle Tee", desc: "Jagged path graphic", price: "₹3,499", imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80" },
  { id: 4, stage: "breakthrough", title: "Breakthrough Cap", desc: "Structured, embroidered", price: "₹2,499", imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80" },
  { id: 5, stage: "interact", title: "Interact Tee", desc: "Network graphic, certified mark", price: "₹2,999", imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80" },
  { id: 6, stage: "explore", title: "Explore Tote", desc: "Heavy canvas, everyday carry", price: "₹1,499", imageUrl: "https://images.unsplash.com/photo-1597404294360-feeeda04612e?w=500&q=80" },
  { id: 7, stage: "commit", title: "Commit Beanie", desc: "Ribbed knit, folded cuff", price: "₹1,999", imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80" },
  { id: 8, stage: "struggle", title: "Struggle Journal", desc: "Dot grid, lay-flat binding", price: "₹1,299", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80" },
  { id: 9, stage: "breakthrough", title: "Breakthrough Crew", desc: "French terry, relaxed fit", price: "₹4,499", imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80" },
  { id: 10, stage: "interact", title: "Interact Mug", desc: "Matte ceramic, 12oz", price: "₹999", imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80" },
];

function ExploreSVG() {
  return (
    <div className="w-full h-full bg-[#E1F5EE]/30 flex items-center justify-center relative">
       <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3A2E27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a8.59 8.59 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill="#1D9E75" fillOpacity="0.1" />
       </svg>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute">
         <circle cx="12" cy="12" r="10" />
         <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
       </svg>
    </div>
  );
}

function CommitSVG() {
  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center relative">
       <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3A2E27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a8.59 8.59 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill="#3A2E27" fillOpacity="0.05" />
       </svg>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A2E27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute">
         <polyline points="20 6 9 17 4 12" />
       </svg>
    </div>
  );
}

function StruggleSVG() {
  return (
    <div className="w-full h-full bg-orange-50 flex items-center justify-center relative">
       <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3A2E27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a8.59 8.59 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill="#FF5A36" fillOpacity="0.1" />
       </svg>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5A36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute">
         <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
       </svg>
    </div>
  );
}

function BreakthroughSVG() {
  return (
    <div className="w-full h-full bg-amber-50 flex items-center justify-center relative">
       <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3A2E27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a8.59 8.59 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill="#F59E0B" fillOpacity="0.1" />
       </svg>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute">
         <circle cx="12" cy="12" r="4" />
         <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
       </svg>
    </div>
  );
}

function InteractSVG() {
  return (
    <div className="w-full h-full bg-purple-50 flex items-center justify-center relative">
       <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3A2E27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a8.59 8.59 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill="#8B5CF6" fillOpacity="0.1" />
       </svg>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute">
         <circle cx="18" cy="5" r="3" />
         <circle cx="6" cy="12" r="3" />
         <circle cx="18" cy="19" r="3" />
         <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
         <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
       </svg>
    </div>
  );
}

function StageGraphic({ stage }: { stage: string }) {
  const graphics: Record<string, React.FC> = { 
    explore: ExploreSVG, 
    commit: CommitSVG, 
    struggle: StruggleSVG,
    breakthrough: BreakthroughSVG,
    interact: InteractSVG
  };
  const Graphic = graphics[stage];
  if (!Graphic) return <div style={{background: '#F1EFE8', height: 140}} className="w-full" />;
  return <Graphic />;
}

const ArcCollectionSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  if (!items || items.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-[#3A2E27]">The Arc Collection</h2>
          <p className="text-[14px] text-[#5C5C52] mt-1">Wear the stage you're in. Available now.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button onClick={scrollLeft} className="w-8 h-8 rounded-full bg-white border-[1.5px] border-[#3A2E27] flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} strokeWidth={2.5} className="text-[#3A2E27]" />
            </button>
            <button onClick={scrollRight} className="w-8 h-8 rounded-full bg-white border-[1.5px] border-[#3A2E27] flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} strokeWidth={2.5} className="text-[#3A2E27]" />
            </button>
          </div>
          <button onClick={() => navigate('/lifestyle')} className="bg-[#3A2E27] text-white px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider hover:bg-black transition-colors">
            View All
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-5 pb-6 pt-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="snap-start shrink-0 w-[240px] bg-white border-[1.5px] border-[#3A2E27] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden"
          >
            <div className="h-[140px] w-full border-b-[1.5px] border-[#3A2E27] bg-gray-50 relative overflow-hidden">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-[15px] font-bold text-[#3A2E27] mb-1">{item.title}</h3>
              <p className="text-[13px] text-[#5C5C52] mb-5 flex-1">{item.desc}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-[16px] font-black text-[#3A2E27]">{item.price}</span>
                <button 
                  onClick={() => {
                    addToCart({
                      title: item.title,
                      price: item.price,
                      image_url: item.imageUrl,
                      store_link: "#",
                      brand: "The Arc Collection"
                    });
                    navigate('/cart');
                  }}
                  className="bg-[#3A2E27] hover:bg-black text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors shadow-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArcCollectionSection;
