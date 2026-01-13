
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import CollegeCard from './components/CollegeCard';
import VoiceAssistant from './components/VoiceAssistant';
import LoadingSkeleton from './components/LoadingSkeleton';
import BulkUpload from './components/BulkUpload';
import { searchCollegeInfo } from './services/geminiService';
import { CollegeInfo, SearchParams } from './types';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [college, setCollege] = useState<CollegeInfo | null>(null);
  const [bulkResults, setBulkResults] = useState<CollegeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const steps = [
    "Initiating deep search...",
    "Querying official Indian education portals...",
    "Verifying AISHE and NIRF databases...",
    "Contacting institution records...",
    "Structuring verified information...",
    "Finalizing report..."
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

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setCollege(null);
    setBulkResults([]);
    try {
      const result = await searchCollegeInfo(params);
      setCollege(result.college);
    } catch (err: any) {
      setError(err.message || "Request timed out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBulk = (data: CollegeInfo[]) => {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enriched Data");
    XLSX.writeFile(workbook, `College_Enrichment_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleExport = (data: CollegeInfo) => {
    downloadBulk([data]);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 md:py-12">
          
          <div className="flex justify-center mb-12">
            <div className="bg-slate-200 p-1 rounded-2xl flex">
              <button 
                onClick={() => setActiveTab('single')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'single' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Single Search
              </button>
              <button 
                onClick={() => setActiveTab('bulk')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'bulk' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bulk Excel Enrichment
              </button>
            </div>
          </div>

          {!college && !isLoading && !error && activeTab === 'single' && (
            <div className="text-center mb-8 px-4 animate-in fade-in duration-500">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Verified Data for <br />
                <span className="text-indigo-600">Indian Colleges</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
                Instant access to affiliation, faculty strength, and management contacts.
              </p>
            </div>
          )}

          {activeTab === 'single' ? (
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
            </>
          ) : (
            <div className="max-w-4xl mx-auto px-4">
              <BulkUpload onComplete={setBulkResults} />
              {bulkResults.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in scale-in duration-500">
                  <h3 className="text-emerald-800 font-black text-xl mb-2">Enrichment Complete!</h3>
                  <p className="text-emerald-600 text-sm mb-6">Successfully fetched details for {bulkResults.length} institutions.</p>
                  <button 
                    onClick={() => downloadBulk(bulkResults)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Enriched Excel
                  </button>
                </div>
              )}
            </div>
          )}

          {error && activeTab === 'single' && (
            <div className="max-w-4xl mx-auto px-4 py-6 animate-in slide-in-from-top-2">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-red-500 mt-1">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-bold text-red-800">Search Interrupted</h3>
                    <p className="text-sm text-red-700 mt-2 leading-relaxed">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {college && !isLoading && activeTab === 'single' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CollegeCard college={college} onExport={() => handleExport(college)} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-indigo-600 font-bold mb-4">Indian College Info Finder</h3>
            <p className="text-slate-500 max-w-sm mx-auto md:mx-0">
              Verified AI engine for higher education records. Instant data enrichment for professionals.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Tools</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => setActiveTab('single')} className="hover:text-indigo-600">Single Search</button></li>
              <li><button onClick={() => setActiveTab('bulk')} className="hover:text-indigo-600">Bulk Enrichment</button></li>
              <li><a href="https://aishe.gov.in/" className="hover:text-indigo-600 transition-colors">AISHE Portal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Performance</h4>
            <p className="text-xs text-slate-400">
              Bulk processing supports up to 50 colleges per batch. Uses <strong>Gemini 3 Flash</strong> for near-instant results.
            </p>
          </div>
        </div>
      </footer>

      <VoiceAssistant />
    </div>
  );
};

export default App;
