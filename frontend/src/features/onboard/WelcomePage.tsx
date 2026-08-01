import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('daskalos_user_name', name);
      const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@daskalos.ai`;
      const password = "default_password";
      
      try {
        // Try to register
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        // Login to get token
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          body: formData
        });
        const loginData = await loginRes.json();
        
        if (loginData.access_token) {
          localStorage.setItem('token', loginData.access_token);
          navigate('/onboard/questions');
        } else {
          console.error("Login failed:", loginData);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
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
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl w-full text-center space-y-8"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Welcome to DASKALOS
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium">
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
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg hover:shadow-xl w-64"
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
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg text-center"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/20"
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
