
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import CollegeCard from './components/CollegeCard';
import VoiceAssistant from './components/VoiceAssistant';
import LoadingSkeleton from './components/LoadingSkeleton';
import BulkUpload from './components/BulkUpload';
import DataDashboard from './components/DataDashboard';
import AreaEventFinder from './components/AreaEventFinder';
import CompanyFinder from './components/CompanyFinder';
import { searchCollegeInfo } from './services/geminiService';
import { CollegeInfo, SearchParams } from './types';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [colleges, setColleges] = useState<CollegeInfo[]>([]);
  const [bulkResults, setBulkResults] = useState<CollegeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'dashboard' | 'events' | 'companies'>('single');

  const steps = [
    "Initiating multi-vector search...",
    "Scanning state university databases...",
    "Checking AISHE registration records...",
    "Retrieving administrative profiles...",
    "Correlating academic stats...",
    "Finalizing results list..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer(t => t + 1);
        setLoadingStep(s => (s < steps.length - 1 ? s + 1 : s));
      }, 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSearch = async (queries: SearchParams[]) => {
    setIsLoading(true);
    setError(null);
    setColleges([]);
    setBulkResults([]);
    
    try {
      const allFoundColleges: CollegeInfo[] = [];
      const searchPromises = queries.map(query => searchCollegeInfo(query));
      const results = await Promise.all(searchPromises);
      
      results.forEach(res => {
        if (res.colleges && res.colleges.length > 0) {
          allFoundColleges.push(...res.colleges);
        }
      });

      if (allFoundColleges.length === 0) {
        setError("No institutions found matching your specific criteria. Please check the spelling or location.");
      } else {
        setColleges(allFoundColleges);
      }
    } catch (err: any) {
      setError(err.message || "Request timed out or encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBulk = (data: CollegeInfo[]) => {
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data.map(c => ({
      'College Name': c.name,
      'State': c.state,
      'District': c.district,
      'Affiliation': c.universityAffiliation,
      'Type': c.collegeType,
      'Courses': c.coursesOffered.join(', '),
      'Principal Name': c.principalName,
      'Principal Phone': c.principalContact,
      'Principal Email': c.principalEmail,
      'TPO Name': c.tpoName,
      'TPO Phone': c.tpoContact,
      'TPO Email': c.tpoEmail,
      'Website': c.website,
      'AISHE': c.aisheCode,
      'Established': c.establishedYear,
      'Accreditation': c.accreditation,
      'Student Strength': c.totalStudentStrength,
      'Faculty': c.facultyStrength,
      'Address': c.address,
      'Pin Code': c.pinCode,
      'Confidence Score': c.confidenceScore
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "College Data");
    XLSX.writeFile(workbook, `College_Search_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 md:py-12">
          
          <div className="flex justify-center mb-12">
            <div className="bg-slate-200 p-1.5 rounded-3xl flex flex-wrap justify-center shadow-inner gap-1">
              <button 
                onClick={() => setActiveTab('single')}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black text-xs md:text-sm transition-all ${activeTab === 'single' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Institutional Search
              </button>
              <button 
                onClick={() => setActiveTab('bulk')}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black text-xs md:text-sm transition-all ${activeTab === 'bulk' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Batch Enrichment
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black text-xs md:text-sm transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Data Analytics
              </button>
              <button 
                onClick={() => setActiveTab('events')}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black text-xs md:text-sm transition-all ${activeTab === 'events' ? 'bg-white shadow-lg text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Campus Events
              </button>
              <button 
                onClick={() => setActiveTab('companies')}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black text-xs md:text-sm transition-all ${activeTab === 'companies' ? 'bg-white shadow-lg text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Colle Bureau
              </button>
            </div>
          </div>

          {activeTab === 'companies' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="text-center mb-8 px-4">
                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Colle Intelligence Bureau</h1>
                  <p className="text-slate-500 max-w-xl mx-auto">High-precision verified HR leader nodes for institutional placements and corporate outreach.</p>
               </div>
               <CompanyFinder />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="text-center mb-8 px-4">
                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Hyper-Local Campus Events</h1>
                  <p className="text-slate-500 max-w-xl mx-auto">Discover symposiums, cultural fests, and academic workshops happening right now in your district.</p>
               </div>
               <AreaEventFinder />
            </div>
          )}

          {activeTab === 'single' && colleges.length === 0 && !isLoading && !error && (
            <div className="text-center mb-8 px-4 animate-in fade-in duration-500">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Verified Institutional <br />
                <span className="text-indigo-600">Intelligence</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
                Discover detailed college profiles with precise 2025 verification data.
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Intelligent Dashboard</h1>
                <p className="text-slate-500 max-w-xl mx-auto">Upload an Excel sheet of institutions to generate a comprehensive AI-powered visual analysis.</p>
              </div>
              <DataDashboard />
            </div>
          )}

          {activeTab === 'single' && (
            <>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              {isLoading && (
                <div className="max-w-4xl mx-auto px-4 py-8 text-center animate-pulse">
                  <div className="inline-flex items-center gap-3 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full font-bold text-sm mb-6 border border-indigo-100 shadow-sm">
                    <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {steps[loadingStep]} ({timer}s)
                  </div>
                  <LoadingSkeleton />
                </div>
              )}
              {colleges.length > 0 && !isLoading && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-6xl mx-auto px-4 flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Found {colleges.length} Matching Institutions</h2>
                    <button 
                      onClick={() => downloadBulk(colleges)}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export All Findings
                    </button>
                  </div>
                  {colleges.map((col) => (
                    <CollegeCard key={col.id} college={col} onExport={() => downloadBulk([col])} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'bulk' && (
            <div className="max-w-4xl mx-auto px-4">
              <BulkUpload onComplete={setBulkResults} />
              {bulkResults.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center animate-in scale-in duration-500">
                  <h3 className="text-emerald-800 font-black text-2xl mb-2">Enrichment Successful!</h3>
                  <p className="text-emerald-600 font-medium mb-6">Successfully fetched detailed profiles for {bulkResults.length} institutions.</p>
                  <button 
                    onClick={() => downloadBulk(bulkResults)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all flex items-center gap-2 mx-auto text-lg"
                  >
                    Download Enriched Data
                  </button>
                </div>
              )}
            </div>
          )}

          {error && activeTab === 'single' && (
            <div className="max-w-4xl mx-auto px-4 py-6 animate-in slide-in-from-top-2">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-3xl shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-red-500 mt-1">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-black text-red-800">Search Error</h3>
                    <p className="text-red-700 mt-2 font-medium leading-relaxed">{error}</p>
                    <button onClick={() => setError(null)} className="mt-4 bg-white text-red-800 font-black py-2 px-6 rounded-xl shadow-sm hover:bg-red-50 transition-colors">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-16 px-6 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-indigo-600 font-black mb-4 uppercase tracking-widest text-sm">Colle Intelligence Bureau</h3>
            <p className="text-slate-500 max-w-sm mx-auto md:mx-0 font-medium leading-relaxed">
              State-of-the-art AI verification for higher education and corporate recruitment. Turning institutional datasets into actionable intelligence.
            </p>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-4 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-bold">
              <li><button onClick={() => setActiveTab('single')} className="hover:text-indigo-600">Smart Search</button></li>
              <li><button onClick={() => setActiveTab('bulk')} className="hover:text-indigo-600">Batch Tools</button></li>
              <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-600">AI Analytics</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-emerald-600">Campus Events</button></li>
              <li><button onClick={() => setActiveTab('companies')} className="hover:text-slate-800">Colle Bureau</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-4 uppercase text-xs tracking-widest">Powered By</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-bold">
              Gemini 3 Pro<br />Google Search Grounding<br />Institutional Audit Engine v2025
            </p>
          </div>
        </div>
      </footer>

      <VoiceAssistant />
    </div>
  );
};

export default App;
