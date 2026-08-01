import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ColorBends from '../../components/ui/ColorBends';

const WelcomePage = () => {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('daskalos_user_id', userId);
      localStorage.setItem('daskalos_user_name', name);
      // Navigate to the questions flow (placeholder route for now)
      navigate('/onboard/questions');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ColorBends
          rotation={90}
          speed={0.2}
          colors={["#ff2727","#ff9f9f","#ff6767"]}
          transparent
          autoRotate={0}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.15}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          className="w-full h-full object-cover"
        />
        {/* Scrim Overlay */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.55) 100%)' }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl w-full text-center space-y-8 relative z-20"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}
          >
            Welcome to DASKALOS
          </h1>
          <p className="text-xl md:text-2xl text-[#999999] font-medium">
            Your AI curator for becoming who you're trying to be
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-8 h-32 flex justify-center items-start">
          <AnimatePresence mode="wait">
            {!showInput ? (
              <motion.button
                key="start-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowInput(true)}
                className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl w-64"
              >
                Get started
              </motion.button>
            ) : (
              <motion.form
                key="name-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleContinue}
                className="flex flex-col gap-4 w-full max-w-sm"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                    className="w-full bg-[#121212] border border-[#333333] text-white placeholder-[#666666] px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-lg text-center"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
