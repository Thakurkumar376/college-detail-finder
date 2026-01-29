
import React, { useState, useEffect } from 'react';
import { INDIAN_STATES } from '../constants';
import { CompanySearchParams, CompanyInfo } from '../types';
import { searchCompanyInfo } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface BatchRow {
  id: string;
  companyName: string;
  city: string;
  state: string;
  status: 'pending' | 'auditing' | 'completed' | 'failed';
  result?: CompanyInfo;
  error?: string;
}

const CompanyFinder: React.FC = () => {
  const [params, setParams] = useState<CompanySearchParams>({ companyName: '', city: '', state: '', leadName: '', leadRole: '' });
  const [batchEntries, setBatchEntries] = useState<BatchRow[]>([]);
  const [results, setResults] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'single' | 'batch' | 'verify'>('single');
  const [progress, setProgress] = useState(0);

  const [batchInput, setBatchInput] = useState('');

  const handleSingleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.companyName || !params.state) return;
    
    setResults([]);
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchCompanyInfo(params);
      setResults(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareBatch = () => {
    const lines = batchInput.split('\n').filter(l => l.trim().length > 0);
    const newBatch: BatchRow[] = lines.map(line => {
      const parts = line.split(',').map(s => s.trim());
      const name = parts[0] || '';
      const city = parts[1] || params.city || '';
      const state = parts[2] || params.state || '';
      return {
        id: Math.random().toString(36).substr(2, 9),
        companyName: name,
        city: city,
        state: state,
        status: 'pending'
      };
    });
    setBatchEntries(newBatch);
    setResults([]);
    setError(null);
  };

  const runBatchAudit = async () => {
    if (batchEntries.length === 0 || isLoading) return;
    setIsLoading(true);
    setProgress(0);
    const finalResults: CompanyInfo[] = [];

    for (let i = 0; i < batchEntries.length; i++) {
      const entry = batchEntries[i];
      if (!entry.companyName || !entry.state) {
        setBatchEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'failed', error: 'Missing Data' } : e));
        continue;
      }

      setBatchEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'auditing' } : e));

      try {
        const auditResult = await searchCompanyInfo({
          companyName: entry.companyName,
          city: entry.city,
          state: entry.state
        });

        if (auditResult && auditResult.length > 0) {
          finalResults.push(...auditResult);
          setBatchEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'completed', result: auditResult[0] } : e));
        } else {
          setBatchEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'failed', error: 'No Leadership Found' } : e));
        }
      } catch (err) {
        setBatchEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'failed', error: 'Node Error' } : e));
      }
      
      setProgress(Math.round(((i + 1) / batchEntries.length) * 100));
      await new Promise(r => setTimeout(r, 800));
    }

    setResults(finalResults);
    setIsLoading(false);
  };

  const exportBatchData = () => {
    if (results.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(results.map(r => ({
      'Company': r.name,
      'HR Name': r.hrName,
      'Exact Role': r.role,
      'Email': r.hrEmail,
      'Phone/Mobile': r.hrContact,
      'LinkedIn': r.hrLinkedIn,
      'Exact Branch': r.location,
      'City': r.city,
      'Confidence': `${(r.confidenceScore * 100).toFixed(0)}%`,
      'Audit Trail': r.auditTrail
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HR_Executive_Audit");
    XLSX.writeFile(workbook, `Bureau_HR_Audit_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10 px-4">
        <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10 shadow-xl">
           <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
           Executive HR Precision Node Active
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-slate-900/5 p-1.5 rounded-[24px] flex border border-slate-200">
           {['single', 'batch'].map((mode) => (
             <button 
               key={mode}
               onClick={() => { setSearchMode(mode as any); setResults([]); setBatchEntries([]); setError(null); }}
               className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                 searchMode === mode ? 'bg-white shadow-lg text-emerald-600' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
                {mode === 'single' ? 'HR Leadership Audit' : 'Batch Mobile Audit'}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-slate-950 rounded-[48px] shadow-3xl border border-white/10 overflow-hidden mb-16 transition-all duration-700">
        <div className="p-12 border-b border-white/5 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-emerald-500 w-20 h-20 rounded-[32px] shadow-2xl flex items-center justify-center rotate-3 border-4 border-white/10">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white italic">
                  Colle Bureau <span className="text-emerald-500 not-italic">Mobile Audit</span>
                </h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-1 italic">Zero-Hallucination HR Leadership Discovery v2025.7</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               {isLoading && (
                 <div className="flex items-center gap-3 bg-white/5 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-3xl animate-in zoom-in duration-300">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Scan: {progress}%</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="p-12 bg-white/5">
          {searchMode === 'batch' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Batch HR Entry (Format: "Company, City, State")</label>
                  <textarea
                    placeholder="e.g. Google, Hyderabad, Telangana&#10;Amazon, Pune, Maharashtra"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    className="w-full h-48 px-8 py-6 rounded-[32px] border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold placeholder:text-slate-700 leading-relaxed font-mono text-sm"
                  />
               </div>
               <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={prepareBatch}
                    disabled={isLoading || !batchInput.trim()}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-3xl transition-all border border-white/5 uppercase tracking-widest text-sm"
                  >
                    Queue Audit
                  </button>
                  {batchEntries.length > 0 && (
                    <button 
                      onClick={runBatchAudit}
                      disabled={isLoading}
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-3xl shadow-3xl transition-all flex items-center justify-center gap-4 text-xl"
                    >
                      {isLoading ? 'Processing Regional Nodes...' : `Audit ${batchEntries.length} High-Precision Nodes`}
                    </button>
                  )}
               </div>
            </div>
          ) : (
            <form onSubmit={handleSingleSearch} className="animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Target Corporation</label>
                   <input
                     type="text"
                     placeholder="e.g. Nihilent Technologies"
                     value={params.companyName}
                     onChange={(e) => setParams({ ...params, companyName: e.target.value })}
                     required
                     className="w-full px-8 py-5 rounded-3xl border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold placeholder:text-slate-700"
                   />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Branch Office City</label>
                   <input
                     type="text"
                     placeholder="Specific Branch Location"
                     value={params.city}
                     onChange={(e) => setParams({ ...params, city: e.target.value })}
                     required
                     className="w-full px-8 py-5 rounded-3xl border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold placeholder:text-slate-700"
                   />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Regional State</label>
                   <select
                     value={params.state}
                     onChange={(e) => setParams({ ...params, state: e.target.value })}
                     required
                     className="w-full px-8 py-5 rounded-3xl border border-white/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white/5 text-white font-bold cursor-pointer"
                   >
                     <option value="" className="bg-slate-900 text-slate-500">Select Region</option>
                     {INDIAN_STATES.map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                   </select>
                 </div>
               </div>
               <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full mt-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black py-6 rounded-3xl shadow-3xl transition-all flex items-center justify-center gap-4 text-xl"
               >
                 {isLoading ? 'Locating HR Branch Node...' : `Search HR Leadership Node`}
               </button>
            </form>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-12 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-red-500/10 border border-red-500/30 rounded-[32px] p-8 text-center backdrop-blur-3xl">
              <div className="bg-red-500 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-red-500/20">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h4 className="text-xl font-black text-red-500 mb-2">Audit Unsuccessful</h4>
              <p className="text-red-400 font-bold text-sm leading-relaxed max-w-md mx-auto">{error}</p>
              <button onClick={() => setError(null)} className="mt-6 text-red-500 uppercase font-black text-[10px] tracking-widest hover:underline">Clear Alert</button>
           </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-6 gap-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">High-Precision HR Leadership Nodes ({results.length})</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Strictly verified Senior HR titles with branch-specific grounding.</p>
              </div>
              <button 
                onClick={exportBatchData}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Verified Database
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
             {results.map((company) => (
               <div key={company.id} className="group bg-white p-12 rounded-[72px] border border-slate-100 shadow-3xl transition-all flex flex-col h-full hover:border-emerald-300 relative overflow-hidden">
                 
                 <div className="absolute top-8 right-8 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${company.confidenceScore > 0.8 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Audit Integrity: {(company.confidenceScore * 100).toFixed(0)}%</span>
                 </div>

                 <div className="flex items-center gap-8 mb-12 pb-10 border-b border-slate-100">
                    <div className="w-24 h-24 rounded-[36px] bg-slate-950 flex items-center justify-center text-white font-black text-4xl shadow-2xl relative border-4 border-slate-900">
                       {company.hrName.charAt(0)}
                       <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                       </div>
                    </div>
                    <div>
                       <h4 className="text-4xl font-black text-slate-900 leading-tight mb-1">{company.hrName}</h4>
                       <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] italic">{company.role}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{company.city}, {company.state} Region</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6 flex-grow">
                    <AuditItem 
                       icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                       label="Mobile / Phone Contact" 
                       value={company.hrContact} 
                       isVerified={company.hrContact !== "N/A" && company.hrContact !== "UNLISTED"}
                       onCopy={() => company.hrContact !== "N/A" && company.hrContact !== "UNLISTED" && navigator.clipboard.writeText(company.hrContact)}
                       isPhone={company.hrContact !== "N/A" && company.hrContact !== "UNLISTED"}
                    />

                    <AuditItem 
                       icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                       label="Verified Corporate Email" 
                       value={company.hrEmail} 
                       isVerified={company.hrEmail !== "N/A" && company.hrEmail !== "UNLISTED"}
                       onCopy={() => company.hrEmail !== "N/A" && company.hrEmail !== "UNLISTED" && navigator.clipboard.writeText(company.hrEmail)}
                    />

                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-white transition-all shadow-sm">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Verified Branch Address</p>
                       <p className="text-lg font-black text-slate-800 leading-tight italic">
                          {company.location && company.location !== "N/A" && company.location !== "UNLISTED" ? company.location : 'Branch location verified via corporate directory.'}
                       </p>
                    </div>

                    <a 
                       href={company.hrLinkedIn && company.hrLinkedIn.startsWith('http') ? company.hrLinkedIn : `https://www.google.com/search?q=${encodeURIComponent(company.hrName + " " + company.name + " " + company.city + " LinkedIn HR")}`}
                       target="_blank" 
                       rel="noopener noreferrer"
                       className={`w-full py-6 rounded-[32px] flex items-center justify-center gap-4 transition-all font-black text-sm uppercase tracking-widest border-2 ${
                         company.hrLinkedIn && company.hrLinkedIn.startsWith('http') 
                         ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700' 
                         : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                       }`}
                    >
                       <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                       View Verified Profile
                    </a>
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-100 bg-slate-50/50 -mx-12 -mb-12 p-12">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Verification Audit Trail</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                       <p className="text-xs font-bold italic text-slate-500 leading-relaxed">"{company.auditTrail}"</p>
                    </div>
                    <div className="mt-6 text-center">
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Security Node: v2025.7.ALPHA</span>
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

const AuditItem: React.FC<{ icon: any; label: string; value: string; isVerified: boolean; onCopy: () => void; isPhone?: boolean }> = ({ icon, label, value, isVerified, onCopy, isPhone }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (value === "N/A" || value === "UNLISTED") return;
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`p-8 rounded-[40px] border-2 transition-all ${isVerified ? 'bg-white border-slate-100 shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                {icon}
             </div>
             <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                  {isPhone && value !== "N/A" && value !== "UNLISTED" ? (
                    <a href={`tel:${value.replace(/\s+/g, '')}`} className="text-xl font-black text-emerald-600 hover:underline break-all">
                       {value}
                    </a>
                  ) : (
                    <p className={`text-xl font-black break-all ${(value === "N/A" || value === "UNLISTED") ? 'text-slate-300 italic text-sm' : 'text-slate-900'}`}>
                       {(value === "N/A" || value === "UNLISTED") ? 'No public record found' : value}
                    </p>
                  )}
                  {isVerified && value !== "N/A" && value !== "UNLISTED" && <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg shrink-0">Verified</span>}
                </div>
             </div>
          </div>
          {value !== "N/A" && value !== "UNLISTED" && (
            <button 
               onClick={handleCopy}
               className={`p-4 rounded-2xl transition-all shrink-0 ${copied ? 'bg-emerald-600 text-white shadow-xl' : 'hover:bg-slate-100 text-slate-400'}`}
               title="Copy to Clipboard"
            >
               {copied ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>}
            </button>
          )}
       </div>
    </div>
  );
};

export default CompanyFinder;
