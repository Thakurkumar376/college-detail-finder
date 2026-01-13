
import React from 'react';
import { CollegeInfo } from '../types';

interface CollegeCardProps {
  college: CollegeInfo;
  onExport: () => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onExport }) => {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 mb-12">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Top Header Section */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${college.isVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {college.isVerified ? 'Verified Data' : 'Unverified Data'}
                </span>
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Established {college.establishedYear}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold">{college.name}</h2>
              <p className="text-slate-400 mt-2 text-lg">{college.address}, {college.district}, {college.state} - {college.pinCode}</p>
            </div>
            <button
              onClick={onExport}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Affiliation & Academics */}
          <div className="space-y-6">
            <div>
              <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Affiliation & Type
              </h3>
              <div className="space-y-4">
                <InfoItem label="University" value={college.universityAffiliation} />
                <InfoItem label="College Type" value={college.collegeType} />
                <InfoItem label="AISHE Code" value={college.aisheCode} />
                <InfoItem label="Accreditation" value={college.accreditation} />
              </div>
            </div>

            <div>
              <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Courses
              </h3>
              <div className="flex flex-wrap gap-2">
                {college.coursesOffered.map((c, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm font-medium">{c}</span>
                ))}
                {college.coursesOffered.length === 0 && <span className="text-slate-400">Not Available</span>}
              </div>
            </div>
          </div>

          {/* Column 2: Management Contacts */}
          <div className="space-y-6">
            <ContactCard
              title="Principal Office"
              name={college.principalName}
              phone={college.principalContact}
              email={college.principalEmail}
              icon={<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
            />
            <ContactCard
              title="Training & Placement (TPO)"
              name={college.tpoName}
              phone={college.tpoContact}
              email={college.tpoEmail}
              icon={<path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
            />
          </div>

          {/* Column 3: Strength & Links */}
          <div className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-indigo-900 font-bold text-sm uppercase tracking-widest mb-4">Strength Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-600">{college.totalStudentStrength}</p>
                  <p className="text-xs text-indigo-400 font-bold uppercase">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-600">{college.facultyStrength}</p>
                  <p className="text-xs text-indigo-400 font-bold uppercase">Faculty</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-4">Official Presence</h3>
              <a
                href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-indigo-600 text-white text-center font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all shadow-md"
              >
                Visit College Website
              </a>
              <div className="mt-4">
                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase">Verified Sources:</p>
                <div className="space-y-1">
                  {college.sources.slice(0, 3).map((s, i) => (
                    <a key={i} href={s} target="_blank" className="text-indigo-500 hover:underline text-xs block truncate" rel="noreferrer">
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 border rounded-xl bg-slate-50">
               <h4 className="text-xs font-bold text-slate-500 mb-1">AI Data Confidence</h4>
               <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${college.confidenceScore * 100}%` }}></div>
               </div>
               <p className="text-[10px] text-right mt-1 text-slate-400">Score: {(college.confidenceScore * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className="text-slate-800 font-semibold leading-tight">{value}</p>
  </div>
);

const ContactCard: React.FC<{ title: string; name: string; phone: string; email: string; icon: React.ReactNode }> = ({ title, name, phone, email, icon }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-indigo-100 p-2 rounded-lg">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase">Contact Name</p>
        <p className="text-slate-700 font-bold">{name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase">Phone</p>
          <p className="text-slate-700 font-medium truncate">{phone}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
          <p className="text-indigo-600 font-medium truncate" title={email}>{email}</p>
        </div>
      </div>
    </div>
  </div>
);

export default CollegeCard;
