import React from 'react';

const Recommendations = () => {
  const items = [
    {
      id: 1,
      title: 'Designing Data-Intensive Applications',
      author: 'Book • Martin Kleppmann',
      tag: 'Deep Work',
      match: '90%',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'System Design Interview in 40 Minutes',
      author: 'Video • Alex Xu',
      tag: 'System Design',
      match: '88%',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'The Mental Models Every Engineer Should Know',
      author: 'Article • Farnam Street',
      tag: 'Mental Models',
      match: '85%',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">Today's Top Recommendations</h2>
        <a href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">See all</a>
      </div>
      
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="flex gap-4 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-200">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{item.author}</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{item.tag}</span>
                <span className="text-xs font-semibold text-emerald-600">{item.match} match</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
