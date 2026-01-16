
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
  const [copyState, setCopyState] = useState<{ id: string; field: string } | null>(null);

  const steps = [
    "Locating institutional career domains...",
    "Querying public directory nodes...",
    "Validating organizational hierarchy (2025)...",
    "Cross-referencing LinkedIn profile status...",
    "Calculating integrity confidence score..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(s => (s < steps.length - 1 ? s + 1 : s));
      }, 1500);
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
        setError("Audit Result: No verified 2025 records were found for this query. The data may be restricted to internal corporate networks.");
      } else {
        setCompanies(results);
      }
    } catch (err: any) {
      setError(err.message || "Bureau Error: High-precision verification nodes are unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLinkedInUrl = (company: CompanyInfo) => {
    // Return direct link only if verified
    if (company.isLinkedInVerified && company.hrLinkedIn && company.hrLinkedIn !== 'Data Not Available') {
      return company.hrLinkedIn.startsWith('http') ? company.hrLinkedIn : `https://${company.hrLinkedIn}`;
    }
    
    // PRECISION BOOLEAN SEARCH AS REQUESTED:
    // "<Full Name>" "<Company Name>" "<Role/Department>" site:linkedin.com
    const precisionQuery = `"${company.hrName}" "${company.name}" "${company.role || 'HR'}" site:linkedin.com`;
    return `https://www.google.com/search?q=${encodeURIComponent(precisionQuery)}`;
  };

  const copyToClipboard = (text: string, id: string, field: string) => {
    if (!text || text === 'Data Not Available') return;
    navigator.clipboard.writeText(text);
    setCopyState({ id, field });
    setTimeout(() => setCopyState(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Terminal */}
      <div className="bg-slate-950 rounded-[48px] shadow-3xl border border-white/10 overflow-hidden mb-16 animate-in fade-in slide-in-from-top-6 duration-700">
        <div className="p-12 border-b border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-emerald-500 w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white italic">HR Integrity <span className="text-emerald-500 not-italic">Audit</span></h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-1 italic">Real-Time Institutional Intelligence Bureau</p>
              </div>
            </div>
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Audit Mode: Active</span>
               </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-12 bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Target Corporate Entity</label>
              <input
                type="text"
                placeholder="e.g. Amazon, Google, HDFC"
                value={params.companyName}
                onChange={(e) => setParams({ ...params, companyName: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Branch Node (City)</label>
              <input
                type="text"
                placeholder="Target City"
                value={params.city}
                onChange={(e) => setParams({ ...params, city: e.target.value })}
                className="w-full px-8 py-5 rounded-3xl border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Regional Boundary</label>
              <select
                value={params.state}
                onChange={(e) => setParams({ ...params, state: e.target.value })}
                required
                className="w-full px-8 py-5 rounded-3xl border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold cursor-pointer"
              >
                <option value="" className="bg-slate-900">Select Region</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black py-6 rounded-3xl shadow-3xl transition-all flex items-center justify-center gap-4 text-xl group"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                {steps[loadingStep]}
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Commence Deep Domain Audit
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto p-12 bg-white rounded-[56px] border border-red-100 text-center shadow-3xl animate-in slide-in-from-top-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3 text-center italic">Audit Exception</h3>
          <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">{error}</p>
        </div>
      )}

      {companies.length > 0 && (
        <div className="space-y-16 animate-in fade-in duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {companies.map((company) => (
              <div key={company.id} className="group bg-white p-12 rounded-[72px] border border-slate-100 shadow-3xl transition-all flex flex-col h-full hover:border-emerald-300 relative">
                
                {/* Confidence Badge */}
                <div className="absolute top-8 right-8 flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${company.confidenceScore > 0.8 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score: {(company.confidenceScore * 100).toFixed(0)}%</span>
                </div>

                {/* Header: Identity */}
                <div className="flex items-center gap-8 mb-12 pb-10 border-b border-slate-100">
                   <div className="w-24 h-24 rounded-[36px] bg-slate-950 flex items-center justify-center text-white font-black text-4xl shadow-2xl relative">
                      {company.hrName.charAt(0)}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-white">
                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                   </div>
                   <div>
                      <h4 className="text-4xl font-black text-slate-900 leading-tight mb-1">{company.hrName}</h4>
                      <p className="text-sm font-black text-emerald-600 uppercase tracking-widest italic">{company.role}</p>
                   </div>
                </div>

                {/* Info Nodes */}
                <div className="grid grid-cols-1 gap-6 flex-grow">
                   <AuditItem 
                      icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                      label="Institutional Email" 
                      value={company.hrEmail} 
                      isVerified={company.isEmailVerified}
                      onCopy={() => copyToClipboard(company.hrEmail, company.id, 'email')}
                      isCopied={copyState?.id === company.id && copyState?.field === 'email'}
                   />
                   
                   <AuditItem 
                      icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                      label="Direct Extension" 
                      value={company.hrContact} 
                      isVerified={company.isPhoneVerified}
                      onCopy={() => copyToClipboard(company.hrContact, company.id, 'phone')}
                      isCopied={copyState?.id === company.id && copyState?.field === 'phone'}
                   />

                   <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Branch Office Location</p>
                           <p className="text-lg font-black text-slate-800 leading-tight">{company.location || 'Data Not Available'}</p>
                        </div>
                      </div>
                   </div>

                   <a 
                      href={getLinkedInUrl(company)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full py-6 rounded-[32px] flex items-center justify-center gap-4 transition-all font-black text-sm uppercase tracking-widest border-2 ${
                        company.isLinkedInVerified 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700' 
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                   >
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      {company.isLinkedInVerified ? 'Open Verified Profile' : 'Search Precise LinkedIn Node'}
                   </a>
                </div>

                {/* Audit Trail */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Audit Source Evidence</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                      <p className="text-xs font-bold italic text-slate-500 leading-relaxed mb-4">"{company.auditTrail}"</p>
                      {company.website && (
                        <div className="flex items-center gap-2">
                           <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                           <p className="text-[10px] font-black text-emerald-600 truncate">{company.website}</p>
                        </div>
                      )}
                   </div>
                   <p className="text-[10px] text-center text-slate-300 font-bold mt-6 uppercase tracking-widest">© 2025 Verification Bureau</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-w-xl mx-auto text-center p-8 bg-slate-50 rounded-[40px] border border-slate-100 italic text-slate-400 text-xs leading-relaxed">
             Disclaimer: Data nodes are derived from public 2025 intelligence audits. Professional verification via the LinkedIn search fallback is recommended for critical institutional outreach.
          </div>
        </div>
      )}
    </div>
  );
};

const AuditItem: React.FC<{ icon: any; label: string; value: string; isVerified: boolean | undefined; onCopy: () => void; isCopied: boolean }> = ({ icon, label, value, isVerified, onCopy, isCopied }) => (
  <div className={`p-8 rounded-[40px] border-2 transition-all ${isVerified ? 'bg-white border-slate-100 shadow-xl shadow-slate-200/40' : 'bg-amber-50/30 border-amber-100/20'}`}>
     <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {icon}
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-slate-900 break-all">{value || 'Data Not Available'}</p>
                {isVerified && <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Verified Node</span>}
              </div>
           </div>
        </div>
        <button 
           onClick={onCopy}
           className={`p-4 rounded-2xl transition-all ${isCopied ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-400'}`}
        >
           {isCopied ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
           ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
           )}
        </button>
     </div>
  </div>
);

export default CompanyFinder;
