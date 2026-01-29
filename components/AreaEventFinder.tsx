
import React, { useState } from 'react';
import { INDIAN_STATES } from '../constants';
import { AreaSearchParams, CollegeEvent } from '../types';
import { searchAreaEvents } from '../services/geminiService';
import * as XLSX from 'xlsx';

const AreaEventFinder: React.FC = () => {
  const [params, setParams] = useState<AreaSearchParams>({ 
    state: '', 
    district: '', 
    year: '2025'
  });
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const YEARS = ['2024', '2025', '2026'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.state || !params.district || !params.year) return;
    
    setIsLoading(true);
    setError(null);
    setEvents([]);
    try {
      const results = await searchAreaEvents(params);
      setEvents(results);
    } catch (err: any) {
      setError(err.message || "District Census failed. No verified hackathon nodes found in this region.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      if (!events || events.length === 0) return;
      
      const exportData = events.map(e => ({
        'Community College Name': e.collegeName || 'N/A',
        'District': e.district || 'N/A',
        'State': e.state || 'N/A',
        'Technical Community': e.communityName || 'N/A',
        'Leader Name': e.leaderName || 'N/A',
        'Leader Number': e.leaderContact || 'N/A',
        'Leader Email': e.leaderEmail || 'N/A',
        'Secondary Member': e.memberName || 'N/A',
        'Member Number': e.memberContact || 'N/A',
        'Member Email': e.memberEmail || 'N/A',
        'Hackathon/Event Name': e.hackathonName || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "District Hackathon Census");
      
      const safeDistrict = (params.district || 'District').trim().replace(/[^a-z0-9]/gi, '_');
      const fileName = `Exhaustive_Hackathon_Census_${safeDistrict}_${params.year}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export failure:", err);
      alert("Failed to generate Excel report. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Module */}
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden mb-12 animate-in fade-in slide-in-from-top-6 duration-500">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-xl group hover:scale-110 transition-transform cursor-default">
               <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
                Exhaustive Identity Census
              </h2>
              <p className="text-blue-100 opacity-80 font-bold uppercase text-[10px] tracking-[0.4em] italic">Scanning for Verified Human Lead Nodes v2025.Deep</p>
            </div>
          </div>
          {events.length > 0 && (
            <button 
              onClick={exportToExcel}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all flex items-center gap-3 group hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Identity Database
            </button>
          )}
        </div>

        <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Discovery:</span>
           <div className="flex flex-wrap gap-2">
              {['Human-First Audit', 'Social Profile Mining', 'Technical Node Mapping', 'Coordinator Identification'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-wider">{tag}</span>
              ))}
           </div>
        </div>

        <form onSubmit={handleSearch} className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Regional State</label>
              <select
                value={params.state}
                onChange={(e) => setParams({ ...params, state: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-slate-50 font-black text-slate-800"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Target District Audit</label>
              <input
                type="text"
                placeholder="e.g. Pune, Bangalore Urban, Chennai"
                value={params.district}
                onChange={(e) => setParams({ ...params, district: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-slate-50 font-black text-slate-800 placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Audit Window</label>
              <select
                value={params.year}
                onChange={(e) => setParams({ ...params, year: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-slate-50 font-black text-slate-800"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y} Cycle</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-6 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 text-xl group"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mining Institutional Identities...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Run Deep Identity Search
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-12 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-red-500/10 border border-red-500/30 rounded-[32px] p-8 text-center backdrop-blur-3xl">
              <div className="bg-red-500 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-red-500/20">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h4 className="text-xl font-black text-red-500 mb-2">Audit Interrupted</h4>
              <p className="text-red-400 font-bold text-sm leading-relaxed max-w-md mx-auto">{error}</p>
           </div>
        </div>
      )}

      {/* Results View */}
      {events.length > 0 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-center px-6">
             <div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Identity Audit: {events.length} Lead Nodes Found</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Prioritizing verified human identities over generic roles.</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {events.map((event) => (
              <div key={event.id} className="group bg-white rounded-[56px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col h-full border-t-[12px] border-t-indigo-600">
                
                <div className="p-10 bg-slate-50 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                       Verified Node
                    </span>
                    <span className="text-[10px] font-black text-slate-300 italic uppercase tracking-widest">ID: {event.id.toUpperCase()}</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{event.collegeName}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{event.district}, {event.state}</p>
                  </div>
                </div>

                <div className="p-10 space-y-10 flex-grow">
                  {/* Flagship Event Info */}
                  <div className="bg-indigo-50/70 p-8 rounded-[40px] border border-indigo-100 relative group/card hover:bg-white transition-all">
                     <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.05a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 16v-1a1 1 0 112 0v1a1 1 0 11-2 0z" /></svg>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Flagship Tech Instance</p>
                     </div>
                     <p className="text-2xl font-black text-indigo-950 leading-tight italic">"{event.hackathonName}"</p>
                  </div>

                  {/* Organizing Body */}
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[24px] bg-slate-950 text-white flex items-center justify-center text-2xl font-black shadow-2xl relative group-hover:rotate-12 transition-transform">
                        {event.communityName.charAt(0)}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Local Organizing Node</p>
                        <p className="font-black text-xl text-slate-800 leading-none">{event.communityName}</p>
                     </div>
                  </div>

                  {/* Node Leadership - High Visibility on Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b-2 border-indigo-100 pb-2 w-fit">Chapter Lead Node</p>
                      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <p className={`font-black text-lg leading-tight ${event.leaderName.includes('Pending') ? 'text-slate-300 italic' : 'text-slate-900'}`}>
                              {event.leaderName}
                           </p>
                           {!event.leaderName.includes('Pending') && (
                              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                           )}
                        </div>
                        {event.leaderContact !== "N/A" ? (
                          <a href={`tel:${event.leaderContact}`} className="text-sm font-black text-indigo-600 flex items-center gap-2 hover:underline mb-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {event.leaderContact}
                          </a>
                        ) : (
                          <p className="text-sm font-bold text-slate-300 mb-2 italic">No public contact</p>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 italic truncate uppercase tracking-widest">{event.leaderEmail}</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-100 pb-2 w-fit">Secondary Identity</p>
                      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <p className={`font-black text-lg leading-tight ${event.memberName.includes('Pending') ? 'text-slate-300 italic' : 'text-slate-900'}`}>
                              {event.memberName}
                           </p>
                           {!event.memberName.includes('Pending') && (
                              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                           )}
                        </div>
                        {event.memberContact !== "N/A" ? (
                          <a href={`tel:${event.memberContact}`} className="text-sm font-black text-blue-600 flex items-center gap-2 hover:underline mb-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {event.memberContact}
                          </a>
                        ) : (
                          <p className="text-sm font-bold text-slate-300 mb-2 italic">No public contact</p>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 italic truncate uppercase tracking-widest">{event.memberEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="opacity-40">SESSION: {params.year}</span>
                    <span className="opacity-40">NODES: {params.district.toUpperCase()}</span>
                  </div>
                  <span className="flex items-center gap-2 text-indigo-600 font-black">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Identity Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && !isLoading && !error && (
        <div className="py-32 text-center animate-in fade-in duration-1000">
           <div className="w-28 h-28 bg-slate-100 rounded-[40px] mx-auto flex items-center justify-center text-slate-300 mb-8 border border-slate-200 group hover:rotate-6 transition-transform">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
           </div>
           <h3 className="text-3xl font-black text-slate-800 mb-3">Auditor Node Ready</h3>
           <p className="text-slate-400 font-bold max-w-md mx-auto uppercase text-[10px] tracking-[0.3em] leading-relaxed">Enter district details to trigger an exhaustive institutional identity census.</p>
        </div>
      )}
    </div>
  );
};

export default AreaEventFinder;
