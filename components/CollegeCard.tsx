
import React, { useState } from 'react';
import { CollegeInfo, SchoolInfo } from '../types';

interface CollegeCardProps {
  college: CollegeInfo;
  onExport: () => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onExport }) => {
  const [showSchools, setShowSchools] = useState(true);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Top Header Section */}
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${college.isVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {college.isVerified ? 'Verified Institution' : 'Preliminary Data'}
                </span>
                <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Est. {college.establishedYear}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black">{college.name}</h2>
              <p className="text-slate-400 mt-3 text-lg font-medium">
                {college.address}, {college.district}, {college.state} - {college.pinCode}
              </p>
            </div>
            <button
              onClick={onExport}
              className="bg-white text-slate-900 hover:bg-slate-100 font-black py-4 px-8 rounded-2xl flex items-center gap-3 transition-all whitespace-nowrap shadow-xl hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Full Report
            </button>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Top Grid: Affiliation & Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Institutional Details
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <InfoItem label="University" value={college.universityAffiliation} />
                  <InfoItem label="Type" value={college.collegeType} />
                  <InfoItem label="AISHE" value={college.aisheCode} />
                  <InfoItem label="NAAC" value={college.accreditation} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Admin & Management
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Principal / Director</p>
                    <p className="font-bold text-slate-800">{college.principalName}</p>
                    <p className="text-xs text-indigo-600 font-medium">{college.principalEmail}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">TPO Head</p>
                    <p className="font-bold text-slate-800">{college.tpoName}</p>
                    <p className="text-xs text-indigo-600 font-medium">{college.tpoContact}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Schools and Departments Section */}
            {college.schools && college.schools.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    Internal Schools & Departments
                  </h3>
                  <button 
                    onClick={() => setShowSchools(!showSchools)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showSchools ? 'Hide Details' : 'Show All Schools'}
                  </button>
                </div>
                {showSchools && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    {college.schools.map((school, i) => (
                      <div key={i} className="bg-indigo-50/30 border border-indigo-100 p-5 rounded-2xl hover:bg-white hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-indigo-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                          </div>
                          <h4 className="font-black text-slate-800">{school.name}</h4>
                        </div>
                        <div className="space-y-2 text-sm mb-3">
                          <p className="text-slate-600"><span className="font-bold text-slate-400 uppercase text-[10px] mr-2">Head:</span> {school.headName}</p>
                          <p className="text-indigo-600 font-medium truncate">{school.headEmail}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {school.courses.map((course, ci) => (
                            <span key={ci} className="text-[10px] bg-white border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">{course}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white">
              <h3 className="font-black text-xs uppercase tracking-widest opacity-80 mb-6">Strength & Resources</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-4xl font-black">{college.totalStudentStrength}</p>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Students</p>
                </div>
                <div>
                  <p className="text-4xl font-black">{college.facultyStrength}</p>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Faculty</p>
                </div>
              </div>
              <a
                href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white text-indigo-600 text-center font-black py-4 px-6 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg text-sm"
              >
                Official Website
              </a>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-slate-800 font-black text-xs uppercase tracking-widest mb-4">Verification Quality</h3>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ${college.confidenceScore > 0.8 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${college.confidenceScore * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-right text-slate-400 font-black uppercase tracking-widest">
                Data Score: {(college.confidenceScore * 100).toFixed(0)}%
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Primary Sources</p>
                <div className="space-y-2">
                  {college.sources.slice(0, 3).map((s, i) => (
                    <a key={i} href={s} target="_blank" className="text-indigo-500 hover:text-indigo-700 font-bold text-xs flex items-center gap-2 truncate" rel="noreferrer">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      {new URL(s).hostname}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-slate-800 font-bold text-sm leading-tight">{value}</p>
  </div>
);

export default CollegeCard;
