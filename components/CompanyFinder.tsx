
import React, { useState, useEffect } from 'react';
import { INDIAN_STATES } from '../constants';
import { CompanySearchParams, CompanyInfo } from '../types';
import { searchCompanyInfo } from '../services/geminiService';

const CompanyFinder: React.FC = () => {
  const [params, setParams] = useState<CompanySearchParams>({ companyName: '', city: '', state: '' });
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copyState, setCopyState] = useState<{ id: string; field: 'email' | 'phone' } | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState(true);

  const steps = [
    "Auditing 2025 corporate directories...",
    "Validating active HR leadership nodes...",
    "Locating regional branch clusters...",
    "Extracting verifiable proof documents...",
    "Synthesizing direct contact leads..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(s => (s < steps.length - 1 ? s + 1 : s));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.companyName || !params.state) return;
    
    setCompanies([]);
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchCompanyInfo(params);
      if (!results || results.length === 0) {
        setError("No highly-verified 2025 HR leads found for this specific query. Please check your spelling or search a broader area.");
      } else {
        setCompanies(results);
      }
    } catch (err: any) {
      setError(err.message || "The verification audit encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLinkedInUrl = (company: CompanyInfo) => {
    const isVerified = company.hrLinkedIn && company.hrLinkedIn.toLowerCase().includes('linkedin.com/in/');
    if (isVerified) return company.hrLinkedIn;
    
    const query = encodeURIComponent(`${company.hrName} HR ${company.name} ${company.city}`);
    return `https://www.linkedin.com/search/results/all/?keywords=${query}`;
  };

  const copyToClipboard = (text: string, id: string, field: 'email' | 'phone') => {
    if (!text || text === 'Not Available') return;
    navigator.clipboard.writeText(text);
    setCopyState({ id, field });
    setTimeout(() => setCopyState(null), 2000);
  };

  const filteredLeads = verifiedFilter 
    ? companies.filter(c => c.confidenceScore >= 0.75)
    : companies;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Console */}
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden mb-16 animate-in fade-in slide-in-from-top-6 duration-500">
        <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-500 p-4 rounded-[28px] shadow-2xl shadow-emerald-500/20 rotate-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">Verified Leads Bureau</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Direct HR Verification 2025</p>
            </div>
          </div>
          <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
             <button 
                onClick={() => setVerifiedFilter(!verifiedFilter)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${verifiedFilter ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
             >
                High-Confidence Only
             </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Amazon, TCS, Google"
                value={params.companyName}
                onChange={(e) => setParams({ ...params, companyName: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-slate-50 font-bold placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Major City</label>
              <input
                type="text"
                placeholder="Search branches in..."
                value={params.city}
                onChange={(e) => setParams({ ...params, city: e.target.value })}
                className="w-full px-8 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-slate-50 font-bold placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Target State</label>
              <select
                value={params.state}
                onChange={(e) => setParams({ ...params, state: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-slate-50 font-bold"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black py-6 rounded-3xl shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-4 text-xl group"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                {steps[loadingStep]}
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Audit 2025 HR Leads
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto p-12 bg-white rounded-[56px] border-2 border-red-50 text-center shadow-3xl animate-in slide-in-from-top-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3">Audit Alert</h3>
          <p className="text-slate-500 font-bold max-w-sm mx-auto">{error}</p>
          <button onClick={() => setError(null)} className="mt-8 text-sm font-black text-red-600 uppercase tracking-widest hover:underline">Dismiss and Try Again</button>
        </div>
      )}

      {companies.length > 0 && (
        <div className="space-y-16 animate-in fade-in duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-center px-10 gap-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
              Verified Branch Intel
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{filteredLeads.length} Profiles Validated</span>
            </h3>
            <div className="flex items-center gap-3 bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Data Feed: 2024-2025 Audit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {filteredLeads.map((company) => (
              <div key={company.id} className="group bg-white p-12 rounded-[72px] border border-slate-100 shadow-3xl hover:shadow-emerald-200/40 transition-all hover:-translate-y-3 relative overflow-hidden flex flex-col h-full">
                
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] pointer-events-none group-hover:scale-125 transition-transform">
                   <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-8 mb-12">
                   <div className="relative group-hover:scale-110 transition-transform">
                      <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-slate-900/20">
                         {company.hrName.charAt(0)}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full border-[6px] border-white shadow-xl flex items-center justify-center">
                         <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-inner"></div>
                      </div>
                   </div>
                   <div>
                      <h4 className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">{company.hrName}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">Verified Lead</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Active</span>
                      </div>
                   </div>
                </div>

                {/* Organization Details */}
                <div className="flex-grow space-y-8">
                   <div className="p-8 bg-slate-50 rounded-[48px] border border-slate-100 group-hover:bg-white transition-colors group-hover:shadow-inner relative">
                      <div className="flex justify-between items-start mb-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Corporate Node</p>
                         <p className="text-[9px] font-black text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-50">{company.industry}</p>
                      </div>
                      <h5 className="text-2xl font-black text-slate-800 mb-3">{company.name}</h5>
                      <div className="flex items-start gap-3">
                         <svg className="w-4 h-4 text-slate-300 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         <p className="text-sm font-bold text-slate-500 leading-relaxed">{company.location}, {company.city}</p>
                      </div>
                   </div>

                   {/* Verification Proof Section */}
                   <div className="p-8 bg-emerald-50/50 rounded-[40px] border border-emerald-100 relative group-hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                         <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Audit Verification Proof</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">
                        {company.verificationProof}
                      </p>
                   </div>

                   {/* Actions Panel - Both Email and Phone Number */}
                   <div className="grid grid-cols-1 gap-4">
                      {/* Email Button */}
                      <button 
                         onClick={() => copyToClipboard(company.hrEmail, company.id, 'email')}
                         className={`w-full p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group/btn ${copyState?.id === company.id && copyState?.field === 'email' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white border-slate-50 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100'}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${copyState?.id === company.id && copyState?.field === 'email' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="text-left">
                               <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${copyState?.id === company.id && copyState?.field === 'email' ? 'text-white/70' : 'text-slate-400'}`}>Official Email</p>
                               <p className="text-base font-black tracking-tight truncate max-w-[200px]">{company.hrEmail}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${copyState?.id === company.id && copyState?.field === 'email' ? 'bg-white text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover/btn:bg-emerald-500 group-hover/btn:text-white'}`}>
                            {copyState?.id === company.id && copyState?.field === 'email' ? 'Copied' : 'Copy'}
                         </div>
                      </button>

                      {/* Phone Button */}
                      <button 
                         onClick={() => copyToClipboard(company.hrContact, company.id, 'phone')}
                         className={`w-full p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group/btn ${copyState?.id === company.id && copyState?.field === 'phone' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white border-slate-50 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100'}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${copyState?.id === company.id && copyState?.field === 'phone' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div className="text-left">
                               <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${copyState?.id === company.id && copyState?.field === 'phone' ? 'text-white/70' : 'text-slate-400'}`}>Verified Contact</p>
                               <p className="text-base font-black tracking-tight truncate max-w-[200px]">{company.hrContact}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${copyState?.id === company.id && copyState?.field === 'phone' ? 'bg-white text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover/btn:bg-emerald-500 group-hover/btn:text-white'}`}>
                            {copyState?.id === company.id && copyState?.field === 'phone' ? 'Copied' : 'Copy'}
                         </div>
                      </button>

                      <a 
                         href={getLinkedInUrl(company)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full p-6 rounded-[32px] border-2 border-slate-50 bg-white hover:border-[#0077b5] transition-all flex items-center justify-between group/li hover:shadow-2xl hover:shadow-blue-100"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center">
                               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </div>
                            <div className="text-left">
                               <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Professional Source</p>
                               <p className="text-base font-black text-[#0077b5] tracking-tight">
                                  Profile Verified
                               </p>
                            </div>
                         </div>
                         <svg className="w-6 h-6 text-slate-200 group-hover/li:text-[#0077b5] group-hover/li:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </a>
                   </div>
                </div>

                {/* Proof of Integrity Footer */}
                <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center">
                   <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Confidence</p>
                      <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map(dot => (
                           <div key={dot} className={`w-4 h-1.5 rounded-full transition-all duration-700 ${company.confidenceScore >= (dot/5) ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                         ))}
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Score</p>
                      <div className="text-xl font-black text-slate-900 leading-none">{(company.confidenceScore * 100).toFixed(0)}%</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyFinder;
