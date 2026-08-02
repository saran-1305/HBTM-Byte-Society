import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const userId = crypto.randomUUID ? crypto.randomUUID() : '123e4567-e89b-12d3-a456-426614174000';
      localStorage.setItem('daskalos_user_id', userId);
      localStorage.setItem('daskalos_user_name', name);
      navigate('/onboard/questions');
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans overflow-x-hidden">
      
      {/* Green Ticker Bar */}
      <div className="w-full h-[64px] bg-brandgreen flex items-center z-50 fixed top-0 left-0">
        <div className="px-6 shrink-0 flex items-center z-10 bg-brandgreen shadow-[10px_0_20px_rgba(29,158,117,1)] relative">
          <span className="text-[#E1F5EE] font-display font-bold text-[28px] tracking-wide">
            DASKALOS
          </span>
        </div>
        <div className="flex-1 overflow-hidden flex items-center relative">
          <div className="flex whitespace-nowrap animate-ticker text-white font-display font-semibold text-[12px] uppercase tracking-widest opacity-90">
            <span className="px-2">BECOME WHO YOU'RE BUILDING TOWARD • EXPLORE • COMMIT • STRUGGLE • BREAKTHROUGH • INTERACT • BECOME WHO YOU'RE BUILDING TOWARD •</span>
            <span className="px-2">BECOME WHO YOU'RE BUILDING TOWARD • EXPLORE • COMMIT • STRUGGLE • BREAKTHROUGH • INTERACT • BECOME WHO YOU'RE BUILDING TOWARD •</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12 lg:py-24 mt-[64px] flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
        
        {/* LEFT COLUMN: Typography & CTA */}
        <div className="flex-1 w-full flex flex-col items-start z-10">
          <h1 className="text-[54px] lg:text-[76px] font-display font-black text-textprimary leading-[0.9] tracking-[-0.03em] uppercase mb-8">
            Become Who<br/>You're Building<br/>Toward
          </h1>
          <p className="text-xl lg:text-2xl text-[#5C5C52] font-medium mb-12 max-w-lg leading-relaxed">
            Daskalos is your AI curator. We cut through the noise so you can focus on building momentum.
          </p>
          
          <div className="w-full max-w-md">
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="bg-[#3A2E27] text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-black/80 transition-colors w-full sm:w-auto"
              >
                Start Here
              </button>
            ) : (
              <form
                onSubmit={handleContinue}
                className="flex flex-col gap-4 w-full animate-fade-in"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full bg-white border-[2px] border-[#3A2E27] text-[#3A2E27] placeholder:text-[#5C5C52] px-6 py-5 rounded-full focus:outline-none focus:ring-4 focus:ring-[#1FA35A]/30 text-lg font-medium"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-[#3A2E27] text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full"
                >
                  Continue
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Staggered Collage */}
        <div className="flex-1 w-full relative h-[600px] hidden md:block">
          {/* Card 1 - Video Recommendation */}
          <div className="absolute top-[10%] left-[0%] w-64 bg-white border-[2px] border-[#3A2E27] rounded-[20px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transform rotate-[-2deg] z-20">
            <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80" alt="Students" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 mb-2">
              <span className="bg-[#1FA35A] text-[#3A2E27] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Explore</span>
              <span className="bg-black/5 text-[#3A2E27] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Video</span>
            </div>
            <h4 className="font-bold text-[#3A2E27] text-sm leading-snug">The Psychology of Learning Faster</h4>
          </div>

          {/* Card 2 - ARC Stage Badge */}
          <div className="absolute top-[45%] left-[20%] w-48 bg-white border-[2px] border-[#3A2E27] rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transform rotate-[3deg] z-30">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔥</span>
            </div>
            <h4 className="font-bold text-[#3A2E27] text-xl mb-1">Commit Stage</h4>
            <p className="text-xs text-[#5C5C52] font-medium">Unlocked</p>
          </div>

          {/* Card 3 - Mentor Insight */}
          <div className="absolute top-[5%] right-[5%] w-56 bg-white border-[2px] border-[#3A2E27] rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transform rotate-[4deg] z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">AI</span>
              </div>
              <span className="text-xs font-bold text-[#5C5C52] uppercase tracking-widest">Mentor Insight</span>
            </div>
            <p className="text-[#3A2E27] text-sm font-medium leading-relaxed italic">
              "You've been hovering on this topic. It's time to build something tangible."
            </p>
          </div>

          {/* Card 4 - Community Avatar */}
          <div className="absolute bottom-[20%] right-[10%] w-64 bg-white border-[2px] border-[#3A2E27] rounded-[20px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transform rotate-[-4deg] z-20 flex items-center gap-4">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f0f0f0" alt="Avatar" className="w-12 h-12 rounded-full border border-black/10" />
            <div>
              <p className="text-[10px] font-bold text-[#1FA35A] uppercase tracking-widest mb-0.5">Community</p>
              <p className="text-sm font-bold text-[#3A2E27]">Alex published a Reflection</p>
            </div>
          </div>

          {/* Card 5 - Lifestyle/Merch 1 (Arc Collection) */}
          <div className="absolute bottom-[5%] left-[0%] w-48 bg-white border-[2px] border-[#3A2E27] rounded-[20px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transform rotate-[5deg] z-10">
            <div className="w-full h-32 bg-[#E1F5EE]/30 rounded-xl mb-3 flex flex-col items-center justify-center relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" alt="Explore Tee" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 mb-2 items-center">
              <span className="bg-[#FF5A36] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Soon</span>
            </div>
            <h4 className="font-bold text-[#3A2E27] text-sm leading-snug">The Arc Collection</h4>
          </div>

          {/* Card 6 - Lifestyle/Merch 2 (Struggle Tee) */}
          <div className="absolute top-[30%] left-[45%] w-44 bg-white border-[2px] border-[#3A2E27] rounded-[20px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transform rotate-[-3deg] z-0">
            <div className="w-full h-24 bg-orange-50 rounded-xl mb-3 flex flex-col items-center justify-center relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80" alt="Struggle Tee" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 mb-2 items-center">
              <span className="bg-[#FF5A36] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Soon</span>
            </div>
            <h4 className="font-bold text-[#3A2E27] text-sm leading-snug">Struggle Tee</h4>
          </div>
          
          {/* Connecting dashed lines just for visual flair */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ filter: 'opacity(0.1)' }}>
            <path d="M100,200 C250,150 200,400 400,350" fill="none" stroke="#3A2E27" strokeWidth="2" strokeDasharray="6,6" />
            <path d="M300,100 C450,150 400,250 500,200" fill="none" stroke="#3A2E27" strokeWidth="2" strokeDasharray="6,6" />
            <path d="M100,500 C150,450 150,350 150,320" fill="none" stroke="#3A2E27" strokeWidth="2" strokeDasharray="6,6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;




