import React, { useEffect, useState } from 'react';
import { IconShoppingCart, IconHeart, IconChevronDown, IconFilter, IconCheck, IconActivity } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useCart } from '../../context/CartContext';

const FALLBACK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface StoreProduct {
  title: string;
  description: string;
  price: string;
  image_url: string;
  store_link: string;
  brand: string | null;
  match_percentage: number;
}

const LifestylePage = () => {
  const userId = localStorage.getItem('daskalos_user_id') || FALLBACK_USER_ID;
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [stage, setStage] = useState('Explore');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/store/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          setStage(data.stage);
        }
      } catch (err) {
        console.error("Failed to fetch store data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [userId]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F9FAFB] text-[#111111] -m-8 p-8 font-sans">
        
        {/* Top Navbar / Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-100">
            <button className="px-6 py-2 text-sm font-medium rounded-full text-gray-500 hover:text-gray-900 transition-colors">All</button>
            <button className="px-6 py-2 text-sm font-medium rounded-full bg-white shadow-sm border border-gray-100 text-gray-900">Personalised</button>
            <button className="px-6 py-2 text-sm font-medium rounded-full text-gray-500 hover:text-gray-900 transition-colors">Order history</button>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
              Filters <IconFilter size={16} />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
              Featured <IconChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-500 text-sm">Showing 1-{products.length} of {products.length * 5} products for your <span className="font-bold capitalize text-gray-900">{stage}</span> stage</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-400 font-medium tracking-wide flex items-center gap-2">
              <IconActivity size={20} className="animate-pulse" />
              Curating your ARC store...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
            {products.map((p, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                
                {/* Product Image Box */}
                <div className="h-[220px] bg-gray-50 relative p-4 flex items-center justify-center">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-white/50 backdrop-blur-sm p-1.5 rounded-full z-10">
                    <IconHeart size={18} stroke={1.5} />
                  </button>
                  
                  {i === 0 && (
                    <div className="absolute top-4 left-4 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                      Best Match
                    </div>
                  )}
                  {i === 1 && (
                    <div className="absolute top-4 left-4 bg-blue-400 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                      For Focus
                    </div>
                  )}
                  {i === 2 && (
                    <div className="absolute top-4 left-4 bg-emerald-400 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                      Keep Learning
                    </div>
                  )}
                  
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                {/* Details */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2">{p.title}</h3>
                  </div>
                  
                  <p className="text-[12px] text-gray-500 line-clamp-3 mb-4 flex-1">
                    {p.brand && <span className="font-semibold mr-1">{p.brand}:</span>}
                    {p.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-black text-gray-900">{p.price}</span>
                    <a href={p.store_link} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                      Essentials Store
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4 text-[12px] font-medium text-emerald-600">
                    <IconCheck size={14} stroke={2} />
                    {p.match_percentage}% Match
                  </div>

                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        title: p.title,
                        price: p.price,
                        image_url: p.image_url,
                        store_link: p.store_link,
                        brand: p.brand || undefined
                      });
                    }}
                    className="w-full bg-[#1A1A1A] hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md mt-auto"
                  >
                    <IconShoppingCart size={16} stroke={1.5} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LifestylePage;
