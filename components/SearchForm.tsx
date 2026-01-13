
import React, { useState } from 'react';
import { INDIAN_STATES, COLLEGE_TYPES } from '../constants';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [collegeName, setCollegeName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Filters
  const [collegeType, setCollegeType] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [courses, setCourses] = useState<string[]>([]);

  const toggleCourse = (course: string) => {
    setCourses(prev => 
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collegeName && state) {
      onSearch({ 
        collegeName, 
        state,
        district: district || undefined,
        collegeType: collegeType || undefined,
        accreditation: accreditation || undefined,
        courses: courses.length > 0 ? courses : undefined
      });
    }
  };

  return (
    <section className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Find Your Ideal College</h2>
            <p className="text-indigo-100 text-sm mt-1">Get comprehensive details from official & verified sources.</p>
          </div>
          <button 
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors border border-indigo-400"
          >
            {showAdvanced ? 'Simple Search' : 'Advanced Filters'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">College Name</label>
              <input
                type="text"
                placeholder="e.g. IIT Madras"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white text-slate-900"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">District (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Chennai"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900"
              />
            </div>
          </div>

          {showAdvanced && (
            <div className="pt-6 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">College Type</label>
                  <select
                    value={collegeType}
                    onChange={(e) => setCollegeType(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white text-slate-900"
                  >
                    <option value="">Any Type</option>
                    {COLLEGE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Accreditation (NAAC/NIRF)</label>
                  <input
                    type="text"
                    placeholder="e.g. A++, Top 10"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Courses Offered</label>
                <div className="flex flex-wrap gap-3">
                  {['UG', 'PG', 'Diploma', 'PhD'].map(course => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => toggleCourse(course)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        courses.includes(course) 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !collegeName || !state}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching Data...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {showAdvanced ? 'Search with Filters' : 'Search College'}
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchForm;
