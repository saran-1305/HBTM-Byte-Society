import React from 'react';

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#1D9E75] opacity-[0.05] blur-[100px] animate-blob-drift"
        style={{ animationDelay: '0s', animationDuration: '28s' }}
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#D1C8B4] opacity-[0.06] blur-[120px] animate-blob-drift"
        style={{ animationDelay: '-5s', animationDuration: '35s' }}
      />
      <div 
        className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[#1D9E75] opacity-[0.04] blur-[100px] animate-blob-drift"
        style={{ animationDelay: '-10s', animationDuration: '22s' }}
      />
    </div>
  );
};

export default BackgroundBlobs;
