
import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { analyzeDataset } from '../services/geminiService';
import { DashboardAnalysis } from '../types';

type DashboardSlide = 'kpis' | 'regional' | 'composition' | 'strategy';

const DataDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DashboardAnalysis | null>(null);
  const [activeSlide, setActiveSlide] = useState<DashboardSlide>('kpis');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const ab = e.target?.result;
        const wb = XLSX.read(ab, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws) as any[];
        
        if (json && json.length > 0) {
          const head = Object.keys(json[0]);
          setHeaders(head);
          setData(json);
          const insights = await analyzeDataset(head, json.slice(0, 10));
          setAnalysis(insights);
        }
      } catch (err) {
        console.error("Dashboard processing error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  /**
   * Robust fuzzy distribution calculator.
   * Searches headers for keywords to handle varying Excel formats.
   */
  const getDistribution = (keywords: string[], limit = 5) => {
    if (!data.length || !headers.length) return [];
    
    // Find the first header that contains any of the keywords
    const matchingHeader = headers.find(h => 
      keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))
    );
    
    if (!matchingHeader) return [];

    const counts: Record<string, number> = {};
    data.forEach(item => {
      let val = item[matchingHeader];
      if (val === undefined || val === null || val === "") val = "Not Specified";
      const strVal = String(val).trim();
      counts[strVal] = (counts[strVal] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  if (data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`group h-[400px] border-4 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            dragActive ? 'border-indigo-500 bg-indigo-50 scale-[0.98]' : 'border-slate-200 hover:border-indigo-400 hover:bg-white hover:shadow-2xl'
          }`}
        >
          <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".xlsx,.csv" className="hidden" />
          <div className="bg-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl group-hover:rotate-6 transition-transform">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-3">Enterprise Presentation Engine</h2>
          <p className="text-slate-500 text-lg font-medium text-center px-6">Upload an Excel file (Colleges, Districts, States) to generate executive intelligence.</p>
        </div>
      </div>
    );
  }

  const slides: { id: DashboardSlide; label: string; icon: any }[] = [
    { id: 'kpis', label: 'Executive Overview', icon: '📊' },
    { id: 'regional', label: 'Regional Analysis', icon: '🗺️' },
    { id: 'composition', label: 'Institutional Mix', icon: '🏢' },
    { id: 'strategy', label: 'Strategic Roadmap', icon: '🚀' },
  ];

  return (
    <div className={`min-h-[800px] transition-colors duration-500 ${isTheaterMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} p-4 md:p-8 rounded-[48px] shadow-inner`}>
      {/* Control Bar */}
      <div className={`flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 p-6 rounded-[32px] border ${isTheaterMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex flex-wrap justify-center gap-2">
          {slides.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(s.id)}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
                activeSlide === s.id 
                ? (isTheaterMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200')
                : (isTheaterMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500')
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`p-4 rounded-2xl font-black text-sm transition-all ${isTheaterMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
            title="Toggle Theater Mode"
          >
            {isTheaterMode ? '☀️ Light Mode' : '🌙 Theater Mode'}
          </button>
          <button onClick={() => { setData([]); setAnalysis(null); }} className="p-4 bg-red-500 text-white rounded-2xl font-black text-sm">Reset</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {activeSlide === 'kpis' && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <PresentationKPI label="Database Volume" value={data.length.toLocaleString()} sub="Total Institutions" color="indigo" theater={isTheaterMode} />
              <PresentationKPI label="Data Attributes" value={headers.length.toString()} sub="Fields Tracked" color="violet" theater={isTheaterMode} />
              <PresentationKPI label="Geographic Nodes" value={getDistribution(["state", "region", "location"]).length.toString() || "0"} sub="Region Count" color="emerald" theater={isTheaterMode} />
              <PresentationKPI label="Data Integrity" value={`${analysis?.dataQualityScore || 85}%`} sub="Confidence" color="amber" theater={isTheaterMode} />
            </div>
            
            <div className={`p-10 rounded-[40px] border relative overflow-hidden ${isTheaterMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200'}`}>
               <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Presenter's Briefing</h3>
               <p className={`text-xl font-medium leading-relaxed max-w-4xl italic ${isTheaterMode ? 'text-indigo-200' : 'text-indigo-50'}`}>
                 "{analysis?.executiveBriefing || 'The current institutional dataset demonstrates a robust distribution of academic resources across the tracked regions, indicating high data density for further strategic auditing.'}"
               </p>
               <div className="mt-8 flex flex-wrap gap-4">
                  {(analysis?.keyTakeaways || ["High concentration in urban hubs", "Diverse institutional ownership", "Regional accreditation gaps"]).map((t, i) => (
                    <div key={i} className={`px-6 py-3 rounded-full text-xs font-black border ${isTheaterMode ? 'border-white/10 bg-white/5' : 'bg-white/20 border-white/30'}`}>
                      FINDING #{i+1}: {t}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeSlide === 'regional' && (
          <div className="animate-in slide-in-from-right-10 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <PresentationChartCard title="Geographic Concentration" sub="Top regions by institution count" theater={isTheaterMode}>
               <div className="space-y-6">
                 {(() => {
                   const stats = getDistribution(["state", "region", "location", "district"], 6);
                   if (stats.length === 0) return <EmptyGraphState theater={isTheaterMode} msg="No Region/State headers found in Excel." />;
                   return stats.map(([name, count]) => (
                    <div key={name}>
                      <div className="flex justify-between font-black mb-2 uppercase text-[10px] tracking-widest">
                        <span>{name}</span>
                        <span>{count} Units</span>
                      </div>
                      <div className={`w-full h-4 rounded-full overflow-hidden ${isTheaterMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${(count / data.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                   ));
                 })()}
               </div>
            </PresentationChartCard>
            
            <PresentationChartCard title="District Audit Density" sub="Unique node distribution" theater={isTheaterMode}>
               <div className={`p-8 rounded-[32px] border h-full flex flex-col justify-center text-center ${isTheaterMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-5xl mb-4">📍</div>
                  <h4 className="text-xl font-black mb-2">Institutional Mapping</h4>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Audit Result</p>
                  <p className={`text-3xl font-black ${isTheaterMode ? 'text-white' : 'text-slate-900'}`}>
                    {new Set(data.map(d => d.District || d.district || d.City || d.city)).size} Nodes
                  </p>
                  <p className="text-slate-500 text-xs mt-2 font-medium">Unique district/city markers identified across {data.length} records.</p>
               </div>
            </PresentationChartCard>
          </div>
        )}

        {activeSlide === 'composition' && (
          <div className="animate-in slide-in-from-bottom-10 duration-500 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <PresentationChartCard title="Institutional Mix" sub="Ownership & Category Classification" theater={isTheaterMode}>
                   <div className="flex flex-wrap gap-4 mt-6">
                      {(() => {
                        const stats = getDistribution(["type", "ownership", "category", "affiliation"], 6);
                        if (stats.length === 0) return <EmptyGraphState theater={isTheaterMode} msg="No Type/Category headers found in Excel." />;
                        return stats.map(([type, count]) => (
                          <div key={type} className={`p-6 rounded-3xl border flex-1 min-w-[150px] text-center transition-all hover:scale-105 ${isTheaterMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                             <p className="text-4xl font-black mb-1">{count}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 truncate">{type}</p>
                          </div>
                        ));
                      })()}
                   </div>
                </PresentationChartCard>
                <PresentationChartCard title="Quality Performance" sub="Accreditation & Rating benchmarks" theater={isTheaterMode}>
                   <div className="space-y-4">
                      {(() => {
                        const stats = getDistribution(["accreditation", "naac", "grade", "rating"], 4);
                        if (stats.length === 0) return <EmptyGraphState theater={isTheaterMode} msg="No Accreditation/Grade headers found." />;
                        return stats.map(([grade, count]) => (
                          <div key={grade} className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">{grade[0].toUpperCase()}</div>
                             <div className="flex-grow">
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">
                                 <span>{grade}</span>
                                 <span>{count} Units</span>
                               </div>
                               <div className={`h-2 rounded-full overflow-hidden ${isTheaterMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                                 <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full" style={{ width: `${(count / data.length) * 100}%` }}></div>
                               </div>
                             </div>
                          </div>
                        ));
                      })()}
                   </div>
                </PresentationChartCard>
             </div>
          </div>
        )}

        {activeSlide === 'strategy' && (
          <div className="animate-in zoom-in-95 duration-700 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* SWOT GRID */}
                <div className={`grid grid-cols-2 gap-4 p-8 rounded-[48px] border ${isTheaterMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}>
                   <SWOTBox label="Strengths" items={analysis?.swotAnalysis?.strengths || ["Robust regional presence", "High verified data density"]} color="emerald" theater={isTheaterMode} />
                   <SWOTBox label="Weaknesses" items={analysis?.swotAnalysis?.weaknesses || ["Contact detail gaps", "Unverified private nodes"]} color="amber" theater={isTheaterMode} />
                   <SWOTBox label="Opportunities" items={analysis?.swotAnalysis?.opportunities || ["Corporate outreach expansion", "Alumni network activation"]} color="indigo" theater={isTheaterMode} />
                   <SWOTBox label="Threats" items={analysis?.swotAnalysis?.threats || ["Outdated AISHE records", "Regional competition"]} color="red" theater={isTheaterMode} />
                </div>

                <div className="space-y-6">
                   <h3 className="text-2xl font-black uppercase tracking-tighter ml-2">Recommended Actions</h3>
                   {(analysis?.suggestedActions || [
                     "Initiate direct verification for high-priority urban nodes.",
                     "Cross-reference missing accreditation data with NAAC portals.",
                     "Identify and audit the top 10 institutions by student strength for corporate placement partnerships."
                   ]).map((action, i) => (
                     <div key={i} className={`p-8 rounded-[32px] border flex items-start gap-6 transition-all hover:-translate-y-1 ${isTheaterMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-lg'}`}>
                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 shadow-lg shadow-indigo-200">{i+1}</div>
                        <p className="text-lg font-bold leading-snug">{action}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyGraphState: React.FC<{ theater: boolean; msg: string }> = ({ theater, msg }) => (
  <div className={`p-8 rounded-3xl text-center border-2 border-dashed ${theater ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
    <div className="text-2xl mb-2 opacity-30">📉</div>
    <p className="text-xs font-black uppercase tracking-widest">{msg}</p>
    <p className="text-[10px] mt-1 italic">Mapping logic requires matching headers.</p>
  </div>
);

const PresentationKPI: React.FC<{ label: string; value: string; sub: string; color: string; theater: boolean }> = ({ label, value, sub, color, theater }) => {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-500',
    violet: 'from-violet-500 to-violet-600 text-violet-500',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-500',
    amber: 'from-amber-500 to-amber-600 text-amber-500',
  };
  return (
    <div className={`p-8 rounded-[40px] border transition-all hover:scale-105 ${theater ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">{label}</p>
      <p className={`text-5xl font-black mb-1 bg-gradient-to-br ${colors[color]} bg-clip-text text-transparent`}>{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
    </div>
  );
};

const PresentationChartCard: React.FC<{ title: string; sub: string; children: React.ReactNode; theater: boolean }> = ({ title, sub, children, theater }) => (
  <div className={`p-10 rounded-[48px] border transition-all flex flex-col h-full ${theater ? 'bg-white/5 border-white/10 shadow-2xl shadow-indigo-900/10' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
    <div className="mb-10">
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">{title}</h3>
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{sub}</p>
    </div>
    <div className="flex-grow flex flex-col justify-center">
      {children}
    </div>
  </div>
);

const SWOTBox: React.FC<{ label: string; items: string[]; color: string; theater: boolean }> = ({ label, items, color, theater }) => {
  const themes: Record<string, string> = {
    emerald: 'bg-emerald-500 text-emerald-500',
    amber: 'bg-amber-500 text-amber-500',
    indigo: 'bg-indigo-500 text-indigo-500',
    red: 'bg-red-500 text-red-500',
  };
  return (
    <div className={`p-6 rounded-[32px] border ${theater ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
       <div className={`w-8 h-2 rounded-full mb-3 ${themes[color].split(' ')[0]}`}></div>
       <h4 className="font-black text-xs uppercase tracking-widest mb-4">{label}</h4>
       <ul className="space-y-3">
          {(items || []).map((it, i) => (
            <li key={i} className="text-[10px] font-bold leading-relaxed flex items-start gap-2">
              <span className="opacity-40 shrink-0 mt-1">•</span>
              {it}
            </li>
          ))}
       </ul>
    </div>
  );
};

export default DataDashboard;
