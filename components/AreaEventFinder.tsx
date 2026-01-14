
import React, { useState } from 'react';
import { INDIAN_STATES } from '../constants';
import { AreaSearchParams, CollegeEvent } from '../types';
import { searchAreaEvents } from '../services/geminiService';

const AreaEventFinder: React.FC = () => {
  const [params, setParams] = useState<AreaSearchParams>({ 
    state: '', 
    district: '', 
    year: new Date().getFullYear().toString() 
  });
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const YEARS = ['2022', '2023', '2024', '2025', '2026'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.state || !params.district || !params.year) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchAreaEvents(params);
      setEvents(results);
    } catch (err: any) {
      setError(err.message || "Failed to find events in this area.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden mb-12 animate-in fade-in slide-in-from-top-6 duration-500">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              Campus Events Explorer
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-black tracking-widest uppercase">{params.year}</span>
            </h2>
            <p className="text-emerald-50 opacity-90 font-medium">Historical and upcoming institutional events search engine.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Status Legend</p>
            <div className="flex gap-4 text-[10px] font-black uppercase">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Upcoming</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Ongoing</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Past</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
              <select
                value={params.state}
                onChange={(e) => setParams({ ...params, state: e.target.value })}
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 font-bold"
              >
                <option value="">Choose State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">District</label>
              <input
                type="text"
                placeholder="e.g. Pune, Bangalore"
                value={params.district}
                onChange={(e) => setParams({ ...params, district: e.target.value })}
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 font-bold placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Year</label>
              <select
                value={params.year}
                onChange={(e) => setParams({ ...params, year: e.target.value })}
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 font-bold"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Analyzing Campus Chronicles...
              </div>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Explore {params.year} Events
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-8 bg-red-50 text-red-700 rounded-[32px] border border-red-100 font-bold text-center mb-12 animate-bounce-slow flex flex-col items-center gap-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-xl">{error}</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {events.map((event, i) => (
            <div key={i} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden flex flex-col h-full">
              {/* Decorative Background Icon */}
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </div>

              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  event.status === 'Upcoming' ? 'bg-emerald-500 text-white' : 
                  event.status === 'Ongoing' ? 'bg-indigo-500 text-white' : 'bg-slate-400 text-white'
                }`}>
                  {event.status}
                </span>
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  {event.type}
                </span>
              </div>

              <div className="flex-grow">
                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{event.eventName}</h3>
                <p className="text-emerald-600 font-black text-xs mb-6 uppercase tracking-widest">{event.collegeName}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Timing</p>
                      <p className="font-bold">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Venue / Location</p>
                      <p className="font-bold">{event.venue}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                  <p className="text-slate-500 text-sm leading-relaxed font-medium italic">
                    "{event.description}"
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year {params.year}</p>
                <button className="text-emerald-600 font-black text-sm hover:underline flex items-center gap-1">
                  View Detailed Program
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaEventFinder;
