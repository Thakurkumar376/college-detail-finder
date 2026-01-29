
import React, { useState } from 'react';
import { INDIAN_STATES } from '../constants';
import { SearchParams, QueryRow } from '../types';

interface SearchFormProps {
  onSearch: (queries: SearchParams[]) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [rows, setRows] = useState<QueryRow[]>([
    { id: Math.random().toString(36).substr(2, 9), name: '', state: '', district: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { id: Math.random().toString(36).substr(2, 9), name: '', state: '', district: '' }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof QueryRow, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow search if (Name is present AND State is present) OR (District is present AND State is present)
    const validQueries = rows
      .filter(r => (r.name.trim() || r.district.trim()) && r.state)
      .map(r => ({
        collegeName: r.name.trim() || '',
        state: r.state,
        district: r.district.trim() || undefined
      }));

    if (validQueries.length > 0) {
      onSearch(validQueries);
    }
  };

  return (
    <section className="max-w-5xl mx-auto w-full px-4 py-8">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-8">
          <h2 className="text-2xl font-bold text-white">Institutional Discovery</h2>
          <p className="text-indigo-100 mt-2 opacity-90 font-medium">Search by name for exact matches, or provide a District to find all colleges in that area.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            {rows.map((row, index) => (
              <div 
                key={row.id} 
                className="group relative flex flex-col md:flex-row gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-lg animate-in fade-in slide-in-from-left-4 duration-300"
              >
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">College Name (Optional if District set)</label>
                    <input
                      type="text"
                      placeholder="Specific College Name"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State (Required)</label>
                    <select
                      value={row.state}
                      onChange={(e) => updateRow(row.id, 'state', e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white font-medium"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      value={row.district}
                      onChange={(e) => updateRow(row.id, 'district', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="md:self-end mb-1 p-3 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                    title="Remove Row"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <button
              type="button"
              onClick={addRow}
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-4 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              Add Multiple Search
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-4 px-8 rounded-2xl shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Node Search...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover Institutional Nodes
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
             <p className="text-xs text-slate-400 font-bold">Leaving College Name empty while providing a District will trigger a complete district-wide census.</p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SearchForm;
