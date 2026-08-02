import React, { useState } from 'react';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reflection: { biggest_insight: string; confusion: string; application: string }) => void;
  isSubmitting: boolean;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [insight, setInsight] = useState('');
  const [confusion, setConfusion] = useState('');
  const [application, setApplication] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      biggest_insight: insight,
      confusion,
      application
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#3A2E27] rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] w-full max-w-2xl p-8  relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#3A2E27] text-white/20 rounded-full blur-[100px]"></div>

        <h2 className="text-3xl font-bold text-[#3A2E27] mb-2">Growth Reflection</h2>
        <p className="text-[#5C5C52] mb-8">Meaningful engagement accelerates your growth. Take a moment to reflect.</p>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-[#3A2E27] mb-2">What was your biggest insight?</label>
            <textarea 
              required
              value={insight}
              onChange={e => setInsight(e.target.value)}
              className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-[12px] p-4 text-[#3A2E27] placeholder-[#5C5C52] focus:border-[#1D9E75] focus:outline-none transition-colors min-h-[120px]"
              placeholder="I realized that..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3A2E27] mb-2">What confused you or remains unclear?</label>
            <textarea 
              required
              value={confusion}
              onChange={e => setConfusion(e.target.value)}
              className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-[12px] p-4 text-[#3A2E27] placeholder-[#5C5C52] focus:border-[#1D9E75] focus:outline-none transition-colors min-h-[120px]"
              placeholder="I'm still trying to understand..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3A2E27] mb-2">How will you apply this immediately?</label>
            <textarea 
              required
              value={application}
              onChange={e => setApplication(e.target.value)}
              className="w-full bg-white border-[1.5px] border-[#3A2E27] rounded-[12px] p-4 text-[#3A2E27] placeholder-[#5C5C52] focus:border-[#1D9E75] focus:outline-none transition-colors min-h-[120px]"
              placeholder="Tomorrow, I will..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-full text-[#3A2E27] font-bold border-2 border-[#3A2E27] hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full bg-[#3A2E27] text-white font-bold hover:bg-black/80 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                'Submit Reflection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReflectionModal;






