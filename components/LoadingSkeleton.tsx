
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 mb-12 animate-pulse">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-200 p-8 h-48"></div>
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-slate-100 rounded-2xl"></div>
            <div className="h-40 bg-slate-100 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-indigo-50 rounded-2xl"></div>
            <div className="h-16 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
