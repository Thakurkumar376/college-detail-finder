import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { searchCollegeInfo } from '../services/geminiService';
import { CollegeInfo } from '../types';

interface BulkUploadProps {
  onComplete: (results: CollegeInfo[]) => void;
}

interface RowStatus {
  name: string;
  state: string;
  district: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<RowStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.length) {
          throw new Error("The Excel file is empty.");
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (json.length === 0) {
          throw new Error("No data found in the first sheet.");
        }

        const initialRows: RowStatus[] = json.map(item => {
          // Flexible column naming
          const name = String(item.CollegeName || item['College Name'] || item.name || item.College || '').trim();
          const state = String(item.State || item.state || item['College State'] || '').trim();
          const district = String(item.District || item.district || item['College District'] || '').trim();
          return {
            name,
            state,
            district,
            status: 'pending' as const
          };
        }).filter(r => r.name && r.state);

        if (initialRows.length === 0) {
          throw new Error("Could not find 'College Name' and 'State' columns. Please check your file headers.");
        }

        setRows(initialRows);
        setProgress(0);
      } catch (err: any) {
        console.error("Excel Parsing Error:", err);
        setError(err.message || "Failed to parse the file. Please ensure it's a valid Excel or CSV.");
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file from your device.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processBulk = async () => {
    if (rows.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const results: CollegeInfo[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.status === 'completed') {
        // Skip already completed if we re-run
        continue;
      }

      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r));

      try {
        const result = await searchCollegeInfo({ 
          collegeName: row.name, 
          state: row.state,
          district: row.district || undefined 
        });
        
        // Fix: result.colleges is an array, take the first match if available
        if (result.colleges && result.colleges.length > 0) {
          results.push(result.colleges[0]);
        }
        
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'completed' } : r));
      } catch (err) {
        console.error(`Failed to process ${row.name}:`, err);
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'failed', error: 'Search failed' } : r));
      }
      
      setProgress(Math.round(((i + 1) / rows.length) * 100));
      // Small delay for stability
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsProcessing(false);
    onComplete(results);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-slate-100">
      <div className="bg-indigo-600 p-6">
        <h2 className="text-xl font-semibold text-white">Bulk Data Enrichment</h2>
        <p className="text-indigo-100 text-sm mt-1">Upload Excel/CSV to fill missing college details automatically.</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {!rows.length ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50 scale-[0.99]' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
            />
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform duration-300 ${
              isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-100 text-indigo-600'
            }`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-slate-700 font-bold text-lg">
              {isDragging ? 'Drop to upload' : 'Click or drag Excel/CSV file here'}
            </p>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
              Your file must contain <strong>"College Name"</strong> and <strong>"State"</strong> columns.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Processing Queue</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {rows.filter(r => r.status === 'completed').length} of {rows.length} completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-indigo-600">{progress}%</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-indigo-600 h-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
              {rows.map((row, i) => (
                <div key={i} className={`p-4 flex items-center justify-between text-sm transition-colors ${
                  row.status === 'processing' ? 'bg-indigo-50/50' : ''
                }`}>
                  <div className="truncate pr-4 flex-grow">
                    <span className="font-bold text-slate-800">{row.name}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="text-slate-500">{row.state}</span>
                    {row.district && <span className="text-slate-400 mx-1">({row.district})</span>}
                    {row.error && <p className="text-red-500 text-xs mt-0.5">{row.error}</p>}
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {row.status === 'pending' && (
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                    )}
                    {row.status === 'processing' && (
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Searching
                      </span>
                    )}
                    {row.status === 'completed' && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        Enriched
                      </span>
                    )}
                    {row.status === 'failed' && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {!isProcessing && progress < 100 && (
                <button 
                  onClick={processBulk}
                  className="flex-1 bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Batch Processing
                </button>
              )}
              <button 
                onClick={() => { setRows([]); setProgress(0); setError(null); }}
                disabled={isProcessing}
                className="px-6 py-4 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Upload Different File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;